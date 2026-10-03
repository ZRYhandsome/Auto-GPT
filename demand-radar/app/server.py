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
from outreach import Outreach  # noqa: E402

VERSION = "0.4.0"
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
    # 线索与回复：AI 判断和写回复
    "anthropic_api_key": "",
    "ai_model": "claude-opus-5-5",
    "product_name": "",
    "product_pitch": "",       # 一句话说明：做什么、解决什么问题、给谁用
    "product_link": "",
    "sender_identity": "",     # 你的身份，会写进每条回复（不冒充路人）
    "reply_style": "",         # 对回复的额外要求
    # 每天最多发多少条，用户自己定；0 = 不往这个平台发。没有"每天至少发多少"
    "cap_reddit": 20,
    "cap_x": 20,
    "cap_youtube": 20,
    "cap_other": 30,
    "send_gap_sec": 90,        # 批量发送时每条之间等几秒
    "reply_check_min": 30,     # 每隔几分钟自动查一次回复，0 = 不自动查
    "send_mode_reddit": "api", # 用户自己选：api = 批准后用官方接口发；manual = 复制后自己去发
    "send_mode_x": "api",
    # 发送账号：每个平台一个，就是你自己的
    "reddit_client_id": "",
    "reddit_client_secret": "",
    "reddit_username": "",
    "reddit_password": "",
    "x_api_key": "",
    "x_api_secret": "",
    "x_access_token": "",
    "x_access_secret": "",
}
SECRET_KEYS = {"github_token", "youtube_api_key", "x_bearer_token", "anthropic_api_key", "reddit_client_secret",
               "reddit_password", "x_api_key", "x_api_secret", "x_access_token", "x_access_secret"}  # 界面上只显示"已填写"
TEXT_LIMITS = {"product_pitch": 1000, "reply_style": 1000, "reddit_subs": 2000, "browser_path": 1000}  # 其余文字最多 300 字
INT_RANGES = {"cap_reddit": (0, 1000), "cap_x": (0, 1000), "cap_youtube": (0, 1000), "cap_other": (0, 1000),
              "send_gap_sec": (0, 3600), "reply_check_min": (0, 1440)}  # 其余数字 0–5000
CHOICES = {"send_mode_reddit": ("api", "manual"), "send_mode_x": ("api", "manual")}


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
                    lo, hi = INT_RANGES.get(k, (0, 5000))
                    try:
                        v = max(lo, min(int(v), hi))
                    except (TypeError, ValueError):
                        continue
                elif k in CHOICES:
                    if v not in CHOICES[k]:
                        continue
                else:
                    v = str(v) if k == "reddit_password" else str(v).strip()  # 密码前后的空格也算密码
                    v = v[:TEXT_LIMITS.get(k, 300)]
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
    def __init__(self, home=HOME, mc_dir=None, mc_python=None, **outreach_kwargs):
        """outreach_kwargs 原样交给 Outreach（测试里换成假的 AI 客户端、假 http，关掉自动查回复）。"""
        self.home = home
        self.settings = Settings(home)
        self.jobs = JobManager(home, mc_dir=mc_dir, mc_python=mc_python, env_fn=self.settings.env)
        self.mc_dir = self.jobs.mc_dir
        self.outreach = Outreach(home, self.settings.get, self.jobs.runs, **outreach_kwargs)

    def job_list(self):
        """任务列表；signals_file 表示这次采集能不能拿去找线索（旧任务要先重新打分）。"""
        jobs = self.jobs.list()
        for j in jobs:
            j["signals_file"] = os.path.isfile(os.path.join(self.jobs.runs, j["id"], "signals.jsonl"))
        return jobs

    def close(self):
        self.jobs.stop_all()
        self.outreach.close()

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
        if self.copy_text(text):
            return {"ok": True, "copied": True, "chars": len(text)}
        return {"ok": True, "copied": False, "text": text}

    # ---------- 线索与回复 ----------
    def copy_text(self, text):
        """Mac 上用 pbcopy 放进剪贴板；别的系统返回 False，让页面自己复制。"""
        if not (IS_MAC and text and shutil.which("pbcopy")):
            return False
        try:
            subprocess.run(["pbcopy"], input=text.encode("utf-8"), timeout=5, check=True)
            return True
        except (OSError, subprocess.SubprocessError):
            return False

    def open_url(self, url):
        """用系统浏览器打开网址。只开 http(s)：网址来自别人的帖子，不能让它打开本机的文件或程序。"""
        if not re.fullmatch(r"https?://\S+", url or "", re.I):
            return False
        try:
            if IS_MAC:
                subprocess.Popen(["open", url])
                return True
            return bool(webbrowser.open(url))
        except Exception:
            return False

    def open_lead(self, lid):
        """「复制并打开」：回复放进剪贴板，原帖在浏览器里打开。"""
        info = self.outreach.open_info(lid)
        return {**info, "opened": self.open_url(info["url"]), "copied": self.copy_text(info["draft"])}

    def import_leads(self, body):
        o = self.outreach
        res = {"import": o.import_job(body.get("job"), body.get("limit", 30), body.get("min_score", 0)), "judging": False}
        if body.get("judge"):
            ready = o.ready()
            if not (ready["ai"] and ready["profile"]):
                res["judge_error"] = "填好 Anthropic API key 和产品资料（设置 → 线索与回复）以后，AI 才能判断"
            else:
                try:
                    o.judge()
                    res["judging"] = True
                except ValueError as e:
                    res["judge_error"] = str(e)
        return res

    def outreach_post(self, path, body):
        """/api/outreach/... 的写操作。出错抛 ValueError，界面上显示原话。"""
        o = self.outreach
        act = path[len("/api/outreach/"):]
        if not isinstance(body, dict):
            raise ValueError("请求内容不对")
        if act == "import":
            return self.import_leads(body)
        if act == "judge":
            ids = body.get("ids")
            if ids is not None and not isinstance(ids, list):
                raise ValueError("ids 要是列表")
            return o.judge(ids)
        if act == "send":
            ids = body.get("ids")
            if not isinstance(ids, list):
                raise ValueError("先选要发的线索")
            return o.send(ids)
        if act == "check":
            return o.check_replies()
        if act == "stop":
            return {"ok": o.stop()}
        if act == "test-ai":
            return o.test_ai()
        m = re.fullmatch(r"test/(reddit|x)", act)
        if m:
            return o.test_sender(m.group(1))
        m = re.fullmatch(r"leads/([\w-]+)(/sent|/reply|/open)?", act)
        if m:
            lid, sub = m.groups()
            if not sub:
                draft = body.get("draft")
                return o.update(lid, draft=None if draft is None else str(draft), action=body.get("action"))
            if sub == "/sent":
                return o.mark_sent(lid)
            if sub == "/reply":
                return o.add_reply(lid, body.get("text"))
            return self.open_lead(lid)
        return None


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
                    # hot：侧栏「线索与回复」上的热线索数字，跟着任务列表一起刷新
                    return self._json({"jobs": app.job_list(), "hot": app.outreach.store.counts().get("hot", 0)})
                if path == "/api/outreach":
                    return self._json(app.outreach.state())
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
                        app.close()
                        self.server.shutdown()
                    threading.Thread(target=quit_all, daemon=True).start()
                    return None
                if path.startswith("/api/outreach/"):
                    res = app.outreach_post(path, body)
                    return self._error("没有这个接口", 404) if res is None else self._json(res)
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
        # 正在采集或正在发回复时关窗口先问一句：关了就停了
        if app and (app.jobs.busy() or app.outreach.task.get("kind")):
            try:
                return bool(win.create_confirmation_dialog(
                    "还有任务在跑", "关掉需求雷达，正在采集的任务、正在发的回复都会停下（已抓到的数据、已经发出的回复都会保留）。确定关掉吗？"))
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
            app.close()
        else:
            t.join()
    except KeyboardInterrupt:
        app.close()
    httpd.shutdown()
    httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
