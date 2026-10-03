"""需求雷达软件：一个只在本机运行的小服务，加一个网页界面。

  python server.py            打开窗口（装了 pywebview 用独立窗口，没装就用浏览器）
  python server.py --no-open  只启动服务，不开窗口（自动化测试用）

只监听 127.0.0.1，别的电脑访问不到。只用 Python 标准库。
"""
import argparse
import json
import mimetypes
import os
import re
import shutil
import socket
import subprocess
import sys
import threading
import urllib.parse
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, APP_DIR)

import catalog  # noqa: E402
from jobs import JobManager  # noqa: E402

VERSION = "0.3.1"
HOME = os.environ.get("RADAR_HOME") or os.path.dirname(APP_DIR)
WEB_DIR = os.path.join(APP_DIR, "web")
IS_MAC = sys.platform == "darwin"

DEFAULT_SETTINGS = {
    "sleep_sec": 2,            # 每次请求之间至少等几秒
    "xhs_sort": "general",     # 小红书搜索排序：general 综合 / popularity_descending 最热 / time_descending 最新
    "browser_path": "",        # 用 Edge 或装在别处的 Chrome 时填可执行文件路径
    "connect_existing": False, # 用日常 Chrome 的登录状态（要先开远程调试）
    "proxy": "",               # 国外网站用的代理，比如 http://127.0.0.1:7890；空着就用系统代理
    "github_token": "",
    "youtube_api_key": "",     # YouTube Data API v3 的 key（Google Cloud 控制台免费申请）
    "x_bearer_token": "",      # X API v2 的 Bearer Token（X 按用量收费）
    "appstore_country": "cn",
    "reddit_subs": "SomebodyMakeThis,AppIdeas,SaaS,Entrepreneur,startups,productivity",
    "default_notes": 20,
    "default_comments": 20,
    "keyword_sets": [],
}
SECRET_KEYS = {"github_token", "youtube_api_key", "x_bearer_token"}  # 界面上只显示"已填写"


# ---------- 设置 ----------
class Settings:
    def __init__(self, home):
        self.path = os.path.join(home, "app_settings.json")
        self.home = home
        self.lock = threading.Lock()
        self.data = dict(DEFAULT_SETTINGS)
        try:
            with open(self.path, encoding="utf-8") as f:
                self.data.update(json.load(f))
        except (OSError, json.JSONDecodeError):
            pass
        if not self.data["keyword_sets"]:
            self.data["keyword_sets"] = self._seed_sets()

    def _seed_sets(self):
        sets = []
        kw = os.path.join(self.home, "keywords.txt")
        if os.path.exists(kw):
            with open(kw, encoding="utf-8") as f:
                words = [x.strip() for x in f if x.strip() and not x.strip().startswith("#")]
            if words:
                sets.append({"name": "找需求（默认）", "keywords": words})
        sets.append({"name": "英文：求工具", "keywords": ["is there an app", "I wish there was", "someone should build", "would pay for"]})
        sets.append({"name": "差评和抱怨", "keywords": ["太难用了", "广告太多", "为什么不能", "希望能加"]})
        return sets

    def get(self):
        with self.lock:
            return json.loads(json.dumps(self.data))

    def public(self):
        d = self.get()
        for k in SECRET_KEYS:
            d[k] = "已填写" if d.get(k) else ""
        return d

    def update(self, patch):
        with self.lock:
            for k, v in patch.items():
                if k not in DEFAULT_SETTINGS:
                    continue
                if k in SECRET_KEYS and v == "已填写":
                    continue
                if k == "keyword_sets":
                    v = [{"name": str(s.get("name", ""))[:40] or "未命名", "keywords": [str(x).strip() for x in s.get("keywords", []) if str(x).strip()][:200]}
                         for s in v if isinstance(s, dict)][:50]
                elif isinstance(DEFAULT_SETTINGS[k], bool):
                    v = bool(v)
                elif isinstance(DEFAULT_SETTINGS[k], int):
                    try:
                        v = max(0, min(int(v), 5000))
                    except (TypeError, ValueError):
                        continue
                else:
                    v = str(v).strip()
                self.data[k] = v
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=1)
            os.replace(tmp, self.path)
            try:
                os.chmod(self.path, 0o600)  # 里面有各家网站的 Key，只让自己能读
            except OSError:
                pass

    def env(self):
        """传给抓取进程的环境变量（run_mc.py 和 run_source.py 都认）。"""
        d = self.get()
        env = {
            "RADAR_SLEEP_SEC": str(d["sleep_sec"]),
            "RADAR_XHS_SORT": d["xhs_sort"] or "general",
            "RADAR_CONNECT_EXISTING": "1" if d["connect_existing"] else "0",
            "RADAR_APPSTORE_COUNTRY": d["appstore_country"] or "cn",
            "RADAR_REDDIT_SUBS": d["reddit_subs"],
        }
        if d["browser_path"]:
            env["RADAR_BROWSER_PATH"] = d["browser_path"]
        if d["proxy"]:
            env["RADAR_PROXY"] = d["proxy"]
        if d["github_token"]:
            env["RADAR_GITHUB_TOKEN"] = d["github_token"]
        if d["youtube_api_key"]:
            env["RADAR_YOUTUBE_KEY"] = d["youtube_api_key"]
        if d["x_bearer_token"]:
            env["RADAR_X_BEARER"] = d["x_bearer_token"]
        return env


# ---------- 登录状态（MediaCrawler 的浏览器资料目录） ----------
def login_dirs(mc_dir, pid):
    base = os.path.join(mc_dir, "browser_data")
    return [os.path.join(base, f"cdp_{pid}_user_data_dir"), os.path.join(base, f"{pid}_user_data_dir")]


def login_state(mc_dir, pid):
    for d in login_dirs(mc_dir, pid):
        if os.path.isdir(d) and os.listdir(d):
            return "saved"
    return "none"


class App:
    def __init__(self, home=HOME, mc_dir=None, mc_python=None):
        self.home = home
        self.settings = Settings(home)
        self.jobs = JobManager(home, mc_dir=mc_dir, mc_python=mc_python, env_fn=self.settings.env)
        self.mc_dir = self.jobs.mc_dir

    def state(self):
        last_ok = {}
        for j in self.jobs.list():
            for s in j.get("steps", []):
                if s.get("state") == "done" and (s.get("posts") or s.get("comments") or j.get("legacy")):
                    last_ok.setdefault(s["platform"], j.get("created", ""))
        platforms = []
        settings = self.settings.get()
        for p in catalog.PLATFORMS:
            item = dict(p)
            if p.get("needs"):
                item["configured"] = bool(settings.get(p["needs"]))
            if p["kind"] == "browser":
                item["login"] = login_state(self.mc_dir, p["id"])
            item["last_ok"] = last_ok.get(p["id"], "")
            platforms.append(item)
        return {
            "version": VERSION, "home": self.home, "mac": IS_MAC, "mc_ready": self.jobs.mc_ready(),
            "platforms": platforms, "modes": catalog.MODES, "settings": self.settings.public(),
            "chrome": self._chrome(),
        }

    def _chrome(self):
        if self.settings.get().get("browser_path"):
            return os.path.exists(self.settings.get()["browser_path"])
        if IS_MAC:
            return os.path.exists("/Applications/Google Chrome.app")
        return bool(shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chrome"))

    def clear_login(self, pid):
        if not catalog.is_browser(pid):
            return False
        for d in login_dirs(self.mc_dir, pid):
            if os.path.isdir(d):
                shutil.rmtree(d, ignore_errors=True)
        return True

    def probe(self, pid):
        if pid not in catalog.BY_ID or catalog.is_browser(pid):
            return {"ok": False, "message": "这个平台要登录，第一次采集时会弹出 Chrome 窗口让你扫码"}
        try:
            r = subprocess.run([sys.executable, os.path.join(APP_DIR, "run_source.py"), "--platform", pid, "--probe"],
                               capture_output=True, text=True, timeout=60, env={**os.environ, **self.settings.env()})
        except subprocess.TimeoutExpired:
            return {"ok": False, "message": "等了 60 秒还没连上，国外网站请检查代理"}
        msg = (r.stdout or r.stderr or "").strip().splitlines()
        return {"ok": r.returncode == 0, "message": msg[-1] if msg else ("能连上" if r.returncode == 0 else "连不上")}

    def open_folder(self, jid):
        path = os.path.join(self.jobs.runs, jid)
        if not os.path.isdir(path):
            return False
        opener = "open" if IS_MAC else ("explorer" if os.name == "nt" else "xdg-open")
        try:
            subprocess.Popen([opener, path])
            return True
        except OSError:
            return False

    def open_file(self, jid, name):
        """用系统默认程序打开结果文件（Excel、Numbers、WPS……）。没有 xlsx 时退回 csv。"""
        run = os.path.join(self.jobs.runs, jid)
        for n in (os.path.basename(name), "需求信号.csv"):
            path = os.path.join(run, n)
            if n and os.path.isfile(path):
                if not IS_MAC:
                    return {"ok": False, "fallback": n}
                try:
                    subprocess.Popen(["open", path])
                    return {"ok": True}
                except OSError:
                    return {"ok": False, "fallback": n}
        return {"ok": False, "fallback": "需求信号.csv"}

    def copy_summary(self, jid):
        path = os.path.join(self.jobs.runs, jid, "summary.md")
        if not os.path.exists(path):
            return {"ok": False, "message": "这个任务还没有 summary.md"}
        with open(path, encoding="utf-8") as f:
            text = f.read()
        if IS_MAC and shutil.which("pbcopy"):
            subprocess.run(["pbcopy"], input=text.encode("utf-8"))
            return {"ok": True, "copied": True, "chars": len(text)}
        return {"ok": True, "copied": False, "text": text}


# ---------- HTTP ----------
def make_handler(app, port_ref):
    class Handler(BaseHTTPRequestHandler):
        server_version = "DemandRadar/" + VERSION

        def log_message(self, fmt, *args):  # 不往终端刷访问日志
            pass

        # 只接受本机地址访问，挡住 DNS 重绑定；写操作要带自定义请求头，挡住别的网站偷偷提交
        def _host_ok(self):
            host = (self.headers.get("Host") or "").split(":")[0]
            return host in ("127.0.0.1", "localhost")

        def _send(self, code, body=b"", ctype="application/json; charset=utf-8", extra=None):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _json(self, obj, code=200):
            self._send(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"))

        def _error(self, msg, code=400):
            self._json({"error": msg}, code)

        def _body(self):
            n = int(self.headers.get("Content-Length") or 0)
            if n > 5_000_000:
                raise ValueError("请求太大")
            raw = self.rfile.read(n) if n else b"{}"
            return json.loads(raw.decode("utf-8") or "{}")

        def do_GET(self):
            if not self._host_ok():
                return self._error("forbidden", 403)
            url = urllib.parse.urlparse(self.path)
            q = urllib.parse.parse_qs(url.query)
            path = url.path
            try:
                if path == "/api/ping":
                    return self._json({"ok": True, "app": "demand-radar", "version": VERSION})
                if path == "/api/state":
                    return self._json(app.state())
                if path == "/api/jobs":
                    return self._json({"jobs": app.jobs.list()})
                if path == "/api/search":
                    return self._json(app.jobs.search(q.get("q", [""])[0]))
                m = re.fullmatch(r"/api/jobs/([\w-]+)(/log|/results|/file)?", path)
                if m:
                    jid, sub = m.group(1), m.group(2)
                    job = app.jobs.get(jid)
                    if not job:
                        return self._error("找不到这个任务", 404)
                    if not sub:
                        return self._json(job)
                    if sub == "/log":
                        return self._json(app.jobs.log_tail(jid, int(q.get("offset", ["0"])[0] or 0)))
                    if sub == "/results":
                        return self._json(app.jobs.results(jid, q.get("view", ["signals"])[0]))
                    name = os.path.basename(q.get("name", [""])[0])
                    fpath = os.path.join(app.jobs.runs, jid, name)
                    if not name or not os.path.isfile(fpath):
                        return self._error("没有这个文件", 404)
                    with open(fpath, "rb") as f:
                        data = f.read()
                    ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
                    if name.endswith((".md", ".csv", ".log", ".txt")):
                        ctype += "; charset=utf-8"
                    disp = "attachment; filename*=UTF-8''" + urllib.parse.quote(f"{jid}-{name}")
                    return self._send(200, data, ctype, {"Content-Disposition": disp})
                return self._static(path)
            except Exception as e:  # 界面上要看到具体错误，而不是连接断开
                return self._error(f"{type(e).__name__}: {e}", 500)

        def do_POST(self):
            if not self._host_ok() or self.headers.get("X-Radar") != "1":
                return self._error("forbidden", 403)
            path = urllib.parse.urlparse(self.path).path
            try:
                body = self._body()
                if path == "/api/jobs":
                    return self._json(app.jobs.create(body))
                if path == "/api/settings":
                    app.settings.update(body)
                    return self._json(app.state())
                if path == "/api/quit":
                    self._json({"ok": True})

                    def quit_all():
                        app.jobs.stop_all()
                        self.server.shutdown()
                    threading.Thread(target=quit_all, daemon=True).start()
                    return None
                m = re.fullmatch(r"/api/(login|probe)/(\w+)(/clear)?", path)
                if m:
                    if m.group(1) == "probe":
                        return self._json(app.probe(m.group(2)))
                    return self._json({"ok": app.clear_login(m.group(2))})
                m = re.fullmatch(r"/api/jobs/([\w-]+)/(stop|rerun|rescore|delete|open|open-file|copy-summary)", path)
                if m:
                    jid, act = m.groups()
                    job = app.jobs.get(jid)
                    if not job:
                        return self._error("找不到这个任务", 404)
                    if act == "stop":
                        return self._json({"ok": app.jobs.stop(jid)})
                    if act == "rerun":
                        return self._json(app.jobs.create(job["spec"]))
                    if act == "rescore":
                        r = app.jobs.rescore(jid)
                        return self._json(r) if r else self._error("任务还在运行")
                    if act == "delete":
                        return self._json({"ok": app.jobs.delete(jid)})
                    if act == "open":
                        return self._json({"ok": app.open_folder(jid)})
                    if act == "open-file":
                        return self._json(app.open_file(jid, str(body.get("name", ""))))
                    return self._json(app.copy_summary(jid))
                return self._error("没有这个接口", 404)
            except ValueError as e:
                return self._error(str(e))
            except Exception as e:
                return self._error(f"{type(e).__name__}: {e}", 500)

        def _static(self, path):
            if path in ("", "/"):
                path = "/index.html"
            full = os.path.normpath(os.path.join(WEB_DIR, path.lstrip("/")))
            if not full.startswith(WEB_DIR) or not os.path.isfile(full):
                return self._error("not found", 404)
            with open(full, "rb") as f:
                data = f.read()
            ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype in ("application/javascript", "image/svg+xml"):
                ctype += "; charset=utf-8"
            return self._send(200, data, ctype)

    return Handler


def free_port(preferred=8732):
    for port in (preferred, 0):
        s = socket.socket()
        try:
            s.bind(("127.0.0.1", port))
            return s.getsockname()[1]
        except OSError:
            continue
        finally:
            s.close()
    raise RuntimeError("找不到可用端口")


def running_instance(home):
    """已经开着一个需求雷达时，返回它的地址。"""
    try:
        with open(os.path.join(home, ".app_port"), encoding="utf-8") as f:
            port = int(f.read().strip())
        import urllib.request
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/ping", timeout=1.5) as r:
            if json.loads(r.read()).get("app") == "demand-radar":
                return f"http://127.0.0.1:{port}/"
    except Exception:
        pass
    return None


def serve(app, port):
    httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(app, [port]))
    httpd.daemon_threads = True
    return httpd


def open_window(url, app=None):
    """有 pywebview 就开独立窗口，关掉窗口即退出；否则用默认浏览器打开。"""
    try:
        import webview  # pywebview
    except ImportError:
        webbrowser.open(url)
        print(f"需求雷达已在浏览器中打开：{url}\n关掉这个终端窗口或按 Ctrl+C 退出。", flush=True)
        return False
    if IS_MAC:
        # 窗口进程其实是 Python：把程序坞和菜单栏上的名字、图标换成需求雷达的
        try:
            from AppKit import NSApplication, NSImage
            from Foundation import NSBundle
            info = NSBundle.mainBundle().infoDictionary()
            info["CFBundleName"] = "需求雷达"
            image = NSImage.alloc().initWithContentsOfFile_(os.path.join(APP_DIR, "icon.png"))
            if image:
                NSApplication.sharedApplication().setApplicationIconImage_(image)
        except Exception:
            pass
    win = webview.create_window("需求雷达", url, width=1360, height=880, min_size=(1000, 640), text_select=True)

    def closing():
        # 正在采集时关窗口先问一句：关了任务就停了
        if app and app.jobs.busy():
            try:
                return bool(win.create_confirmation_dialog("还有任务在采集", "关掉需求雷达，正在采集的任务会停止（已抓到的数据会保留）。确定关掉吗？"))
            except Exception:
                return True
        return True
    try:
        win.events.closing += closing
    except Exception:
        pass
    webview.start()
    return True


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=0)
    ap.add_argument("--no-open", action="store_true")
    a = ap.parse_args(argv)
    existing = None if a.no_open else running_instance(HOME)
    if existing:
        open_window(existing)
        return 0
    app = App()
    port = a.port or free_port()
    httpd = serve(app, port)
    url = f"http://127.0.0.1:{port}/"
    with open(os.path.join(HOME, ".app_port"), "w", encoding="utf-8") as f:
        f.write(str(port))
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    print(f"需求雷达：{url}", flush=True)
    try:
        if a.no_open:
            t.join()
        elif open_window(url, app):
            app.jobs.stop_all()
        else:
            t.join()
    except KeyboardInterrupt:
        app.jobs.stop_all()
    httpd.shutdown()
    httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
