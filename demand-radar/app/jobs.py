"""采集任务：排队、一个一个平台地跑、记日志和进度、可以停止，跑完自动合并打分。

每个任务对应 runs/ 下的一个目录（和 radar.sh 的输出完全一样），任务信息存在目录里的 job.json。
radar.sh 以前跑出来的目录也会出现在任务列表里。
"""
import csv
import glob
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime

import catalog

APP_DIR = os.path.dirname(os.path.abspath(__file__))

HINTS = [
    (re.compile(r"qrcode|qr code|二维码|扫码|scan", re.I), "等你扫码登录：在弹出的 Chrome 窗口里用手机 App 扫码"),
    (re.compile(r"captcha|滑块|验证码|slider|verify", re.I), "遇到验证：在 Chrome 窗口里手动拖一下滑块或完成验证"),
]
ERROR = re.compile(r"(Error|Exception|Traceback|错误|失败|连不上)", re.I)
RESULT_FILES = {"signals": "需求信号.csv", "posts": "按帖子汇总.csv", "all": "全部数据.csv"}


def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def count_lines(paths):
    n = 0
    for p in paths:
        try:
            with open(p, "rb") as f:
                n += sum(1 for line in f if line.strip())
        except OSError:
            pass
    return n


def data_counts(out):
    return (count_lines(glob.glob(os.path.join(out, "*", "jsonl", "*_contents_*.jsonl"))),
            count_lines(glob.glob(os.path.join(out, "*", "jsonl", "*_comments_*.jsonl"))))


class JobManager:
    def __init__(self, home, runs_dir=None, mc_dir=None, mc_python=None, env_fn=None):
        self.home = home
        self.runs = runs_dir or os.path.join(home, "runs")
        self.mc_dir = mc_dir or os.path.join(home, "MediaCrawler")
        self.mc_python = mc_python or os.path.join(self.mc_dir, ".venv", "bin", "python")
        self.env_fn = env_fn or (lambda: {})
        self.lock = threading.RLock()
        self.jobs = {}
        self.queue = []
        self.proc = None
        self.wake = threading.Event()
        os.makedirs(self.runs, exist_ok=True)
        self._load()
        threading.Thread(target=self._worker, daemon=True).start()

    # ---------- 读写 ----------
    def _path(self, jid):
        return os.path.join(self.runs, jid, "job.json")

    def _save(self, job):
        with self.lock:
            tmp = self._path(job["id"]) + ".tmp"
            try:
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(job, f, ensure_ascii=False, indent=1)
                os.replace(tmp, self._path(job["id"]))
            except FileNotFoundError:  # 任务目录刚被删掉
                pass

    def _load(self):
        for d in sorted(glob.glob(os.path.join(self.runs, "*"))):
            if not os.path.isdir(d):
                continue
            jid = os.path.basename(d)
            try:
                with open(self._path(jid), encoding="utf-8") as f:
                    job = json.load(f)
                if job.get("status") in ("queued", "running"):
                    job["status"] = "interrupted"
                    for s in job.get("steps", []):
                        if s["state"] in ("waiting", "running"):
                            s["state"] = "interrupted"
                    self.jobs[jid] = job
                    self._save(job)
                else:
                    self.jobs[jid] = job
            except (OSError, json.JSONDecodeError):
                job = self._legacy(d)
                if job:
                    self.jobs[jid] = job

    def _legacy(self, d):
        """radar.sh 跑出来的目录：从文件里拼出任务信息。"""
        jid = os.path.basename(d)
        platforms = sorted({os.path.basename(os.path.dirname(os.path.dirname(p))) for p in glob.glob(os.path.join(d, "*", "jsonl", "*.jsonl"))})
        if not platforms and not os.path.exists(os.path.join(d, "summary.md")):
            return None
        rev = {v: k for k, v in catalog.MC_DIRS.items()}
        def read(name):
            path = os.path.join(d, name)
            if not os.path.exists(path):
                return []
            with open(path, encoding="utf-8") as f:
                return [x.strip() for x in f if x.strip()]
        mode = "detail" if jid.endswith("-deep") else "search"
        posts, comments = data_counts(d)
        m = re.match(r"(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})", jid)
        created = f"{m[1]}-{m[2]}-{m[3]} {m[4]}:{m[5]}:{m[6]}" if m else ""
        return {
            "id": jid, "created": created, "status": "done", "legacy": True,
            "spec": {"platforms": [rev.get(p, p) for p in platforms], "mode": mode, "keywords": read("keywords_used.txt"),
                     "targets": read("posts_used.txt"), "notes": 0, "comments": 0, "sub": False},
            "steps": [{"platform": rev.get(p, p), "state": "done", "posts": 0, "comments": 0} for p in platforms],
            "totals": {"posts": posts, "comments": comments, **self._merge_totals(d)},
        }

    def _merge_totals(self, d):
        out = {}
        p = os.path.join(d, "需求信号.csv")
        if os.path.exists(p):
            with open(p, encoding="utf-8-sig") as f:
                out["signals"] = max(0, sum(1 for _ in f) - 1)
        return out

    # ---------- 对外 ----------
    def list(self):
        with self.lock:
            jobs = sorted(self.jobs.values(), key=lambda j: j.get("created", ""), reverse=True)
            return [self._public(j) for j in jobs]

    def get(self, jid):
        with self.lock:
            j = self.jobs.get(jid)
            return self._public(j) if j else None

    def _public(self, j):
        out = json.loads(json.dumps(j))
        if j["id"] in self.queue:
            out["queue_pos"] = self.queue.index(j["id"]) + 1
        return out

    def validate(self, spec):
        platforms = [p for p in spec.get("platforms", []) if p in catalog.BY_ID]
        mode = spec.get("mode", "search")
        if mode not in catalog.MODES:
            raise ValueError("不认识的抓法")
        if not platforms:
            raise ValueError("至少选一个平台")
        bad = [catalog.name_of(p) for p in platforms if mode not in catalog.BY_ID[p]["modes"]]
        if bad:
            raise ValueError(f"{'、'.join(bad)}不支持「{catalog.MODES[mode]}」")
        keywords = [k.strip() for k in spec.get("keywords", []) if k and k.strip()]
        targets = [t.strip() for t in spec.get("targets", []) if t and t.strip()]
        if mode == "search" and not keywords:
            raise ValueError("填至少一个关键词")
        if mode != "search" and not targets:
            raise ValueError("填至少一个链接")
        if mode != "search" and len(platforms) > 1:
            raise ValueError("深挖和抓作者一次只能选一个平台（链接是哪个平台的就选哪个）")
        clamp = lambda v, lo, hi, d: max(lo, min(hi, int(v))) if str(v).strip().lstrip("-").isdigit() else d
        return {
            "platforms": platforms, "mode": mode, "keywords": [k.replace(",", " ") for k in keywords], "targets": targets,
            "notes": clamp(spec.get("notes", 20), 1, 500, 20),
            "comments": clamp(spec.get("comments", 20 if mode == "search" else 300), 0, 5000, 20),
            "sub": bool(spec.get("sub", False)),
            "label": str(spec.get("label", ""))[:60],
        }

    def create(self, spec):
        spec = self.validate(spec)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        suffix = {"detail": "-deep", "creator": "-creator"}.get(spec["mode"], "")
        jid = stamp + suffix
        n = 2
        while os.path.exists(os.path.join(self.runs, jid)):
            jid = f"{stamp}-{n}{suffix}"
            n += 1
        out = os.path.join(self.runs, jid)
        os.makedirs(out)
        # 和 radar.sh 一样留下关键词和帖子清单：merge.py 靠 posts_used.txt 认出已经深挖过的帖子
        if spec["mode"] == "search":
            with open(os.path.join(out, "keywords_used.txt"), "w", encoding="utf-8") as f:
                f.write("\n".join(spec["keywords"]) + "\n")
        else:
            with open(os.path.join(out, "posts_used.txt" if spec["mode"] == "detail" else "creators_used.txt"), "w", encoding="utf-8") as f:
                f.write("\n".join(spec["targets"]) + "\n")
        job = {
            "id": jid, "created": now(), "status": "queued", "spec": spec,
            "steps": [{"platform": p, "state": "waiting", "posts": 0, "comments": 0} for p in spec["platforms"]],
            "totals": {},
        }
        with self.lock:
            self.jobs[jid] = job
            self.queue.append(jid)
            self._save(job)
        self.wake.set()
        return self._public(job)

    def stop(self, jid):
        with self.lock:
            job = self.jobs.get(jid)
            if not job:
                return False
            if jid in self.queue:
                self.queue.remove(jid)
                job["status"] = "stopped"
                for s in job["steps"]:
                    s["state"] = "skipped"
                self._save(job)
                return True
            if job["status"] == "running":
                job["stop"] = True
                self._kill()
                return True
        return False

    def busy(self):
        with self.lock:
            return bool(self.queue) or any(j["status"] == "running" for j in self.jobs.values())

    def stop_all(self):
        """退出软件时：排队的取消，正在跑的停掉（已经抓到的数据照样保存）。"""
        with self.lock:
            for jid in list(self.queue):
                self.stop(jid)
            for j in self.jobs.values():
                if j["status"] == "running":
                    j["stop"] = True
            self._kill()
        p = self.proc
        if p:
            try:
                p.wait(timeout=8)
            except Exception:
                pass

    def delete(self, jid):
        with self.lock:
            job = self.jobs.get(jid)
            if not job or job["status"] in ("running", "queued"):
                return False
            trash = os.path.join(self.home, ".trash")
            os.makedirs(trash, exist_ok=True)
            shutil.move(os.path.join(self.runs, jid), os.path.join(trash, f"{jid}-{int(time.time())}"))
            del self.jobs[jid]
            return True

    def rescore(self, jid):
        with self.lock:
            job = self.jobs.get(jid)
            if not job or job["status"] in ("running", "queued"):
                return None
        self._merge(job)
        return self.get(jid)

    def log_tail(self, jid, offset=0, limit=200_000):
        path = os.path.join(self.runs, jid, "crawl.log")
        if not os.path.exists(path):
            return {"text": "", "offset": 0}
        size = os.path.getsize(path)
        if offset > size:
            offset = 0
        if size - offset > limit:  # 第一次打开很长的日志时只给最后一段
            offset = size - limit
        with open(path, "rb") as f:
            f.seek(offset)
            data = f.read()
        return {"text": data.decode("utf-8", errors="replace"), "offset": offset + len(data)}

    def results(self, jid, view):
        name = RESULT_FILES.get(view)
        path = os.path.join(self.runs, jid, name or "")
        if not name or not os.path.exists(path):
            return {"columns": [], "rows": []}
        with open(path, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
        return {"columns": rows[0] if rows else [], "rows": rows[1:]}

    def search(self, q, limit=300):
        """在所有采集过的数据里找一句话。"""
        q = q.strip().lower()
        if not q:
            return {"columns": [], "rows": []}
        hits = []
        columns = []
        for jid in sorted(self.jobs, reverse=True):
            path = os.path.join(self.runs, jid, RESULT_FILES["all"])
            if not os.path.exists(path):
                continue
            with open(path, encoding="utf-8-sig", newline="") as f:
                reader = csv.reader(f)
                head = next(reader, [])
                if not columns:
                    columns = head + ["任务"]
                idx = [i for i, c in enumerate(head) if c in ("内容", "所属帖子")]
                for row in reader:
                    if any(q in (row[i] if i < len(row) else "").lower() for i in idx):
                        hits.append(row + [jid])
                        if len(hits) >= limit:
                            return {"columns": columns, "rows": hits, "truncated": True}
        return {"columns": columns, "rows": hits}

    # ---------- 执行 ----------
    def _kill(self):
        p = self.proc
        if not p or p.poll() is not None:
            return
        try:
            os.killpg(p.pid, signal.SIGTERM)
        except (ProcessLookupError, PermissionError, AttributeError):
            p.terminate()

        def hard():
            time.sleep(6)
            if p.poll() is None:
                try:
                    os.killpg(p.pid, signal.SIGKILL)
                except (ProcessLookupError, PermissionError, AttributeError):
                    p.kill()
        threading.Thread(target=hard, daemon=True).start()

    def command(self, spec, platform, out):
        mode = spec["mode"]
        if catalog.is_browser(platform):
            args = [self.mc_python, "run_mc.py", "--platform", platform, "--lt", "qrcode", "--type", mode]
            if mode == "search":
                args += ["--keywords", ",".join(spec["keywords"])]
            elif mode == "detail":
                args += ["--specified_id", ",".join(spec["targets"])]
            else:
                args += ["--creator_id", ",".join(spec["targets"])]
            args += ["--get_comment", "yes" if spec["comments"] else "no", "--get_sub_comment", "yes" if spec["sub"] else "no",
                     "--crawler_max_notes_count", str(spec["notes"]), "--max_comments_count_singlenotes", str(spec["comments"]),
                     "--save_data_option", "jsonl", "--save_data_path", out, "--headless", "no"]
            return args, self.mc_dir
        args = [sys.executable, os.path.join(APP_DIR, "run_source.py"), "--platform", platform, "--type", mode]
        args += ["--keywords", ",".join(spec["keywords"])] if mode == "search" else ["--specified_id", ",".join(spec["targets"])]
        args += ["--get_comment", "yes" if spec["comments"] else "no", "--get_sub_comment", "yes" if spec["sub"] else "no",
                 "--crawler_max_notes_count", str(spec["notes"]), "--max_comments_count_singlenotes", str(spec["comments"]),
                 "--save_data_path", out]
        return args, APP_DIR

    def mc_ready(self):
        return os.path.exists(self.mc_python) and os.path.exists(os.path.join(self.mc_dir, "run_mc.py"))

    def _worker(self):
        while True:
            self.wake.wait(1.0)
            self.wake.clear()
            with self.lock:
                jid = self.queue.pop(0) if self.queue else None
            if jid:
                try:
                    self._run(self.jobs[jid])
                except Exception as e:  # 任务管理器本身不能因为一个任务出错就停掉
                    job = self.jobs.get(jid)
                    if job:
                        job["status"] = "failed"
                        job["error"] = f"{type(e).__name__}: {e}"
                        self._save(job)

    def _append_log(self, out, text):
        with open(os.path.join(out, "crawl.log"), "a", encoding="utf-8") as f:
            f.write(text)

    def _run(self, job):
        out = os.path.join(self.runs, job["id"])
        job["status"] = "running"
        job["started"] = now()
        self._save(job)
        spec = job["spec"]
        for step in job["steps"]:
            if job.get("stop"):
                step["state"] = "skipped"
                continue
            self._run_step(job, step, out)
        self._append_log(out, "\n================ 合并与打分 ================\n")
        self._merge(job)
        states = [s["state"] for s in job["steps"]]
        job["status"] = "stopped" if job.get("stop") else ("failed" if states and all(s == "failed" for s in states) else "done")
        job["ended"] = now()
        job.pop("stop", None)
        self._save(job)

    def _run_step(self, job, step, out):
        p = step["platform"]
        name = catalog.name_of(p)
        step.update(state="running", started=now(), hint="", error="")
        self._save(job)
        self._append_log(out, f"\n================ 开始：{name} ================\n")
        if catalog.is_browser(p) and not self.mc_ready():
            step.update(state="failed", error="没装好 MediaCrawler：先在终端运行 setup_mac.sh", ended=now())
            self._append_log(out, step["error"] + "\n")
            self._save(job)
            return
        args, cwd = self.command(job["spec"], p, out)
        env = {**os.environ, "PYTHONUNBUFFERED": "1", "PYTHONIOENCODING": "utf-8", **self.env_fn()}
        base_posts, base_comments = data_counts(out)
        try:
            self.proc = subprocess.Popen(args, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                         stdin=subprocess.DEVNULL, start_new_session=True)
        except OSError as e:
            step.update(state="failed", error=f"启动失败：{e}", ended=now())
            self._save(job)
            return
        last_error = ""

        def reader():
            nonlocal last_error
            with open(os.path.join(out, "crawl.log"), "ab") as log:
                for raw in iter(self.proc.stdout.readline, b""):
                    log.write(raw)
                    log.flush()
                    line = raw.decode("utf-8", errors="replace").strip()
                    for rx, hint in HINTS:
                        if rx.search(line):
                            step["hint"] = hint
                    if ERROR.search(line):
                        last_error = line[-300:]
        t = threading.Thread(target=reader, daemon=True)
        t.start()
        tick = 0
        while self.proc.poll() is None:
            time.sleep(0.5)
            tick += 1
            if tick % 2 == 0:
                posts, comments = data_counts(out)
                step["posts"], step["comments"] = posts - base_posts, comments - base_comments
                if step["posts"] or step["comments"]:
                    step["hint"] = "" if step.get("hint", "").startswith("等你扫码") else step.get("hint", "")
                self._save(job)
        t.join(timeout=5)
        code = self.proc.returncode
        try:
            self.proc.stdout.close()
        except OSError:
            pass
        self.proc = None
        posts, comments = data_counts(out)
        step["posts"], step["comments"] = posts - base_posts, comments - base_comments
        step["ended"] = now()
        step["exit_code"] = code
        if job.get("stop"):
            step["state"] = "stopped"
        elif code == 0:
            step["state"] = "done"
            step["hint"] = ""
        else:
            step["state"] = "failed"
            step["error"] = last_error or f"退出码 {code}"
        if step["state"] != "done" and (step["posts"] or step["comments"]):
            step["partial"] = True  # 中途失败，但已经抓到的数据照样合并
        self._save(job)

    def _merge(self, job):
        out = os.path.join(self.runs, job["id"])
        posts, comments = data_counts(out)
        job["totals"] = {"posts": posts, "comments": comments}
        if not posts and not comments:
            self._append_log(out, "没有抓到数据，跳过打分。\n")
            self._save(job)
            return
        merge_py = os.path.join(self.home, "merge.py")
        if not os.path.exists(merge_py):
            merge_py = os.path.join(os.path.dirname(APP_DIR), "merge.py")
        r = subprocess.run([sys.executable, merge_py, out], capture_output=True, text=True, encoding="utf-8", errors="replace")
        self._append_log(out, (r.stdout or "") + (r.stderr or ""))
        m = re.search(r"共 (\d+) 条帖子和评论，其中 (\d+) 条命中需求信号", r.stdout or "")
        if m:
            job["totals"].update(items=int(m[1]), signals=int(m[2]))
        job["merged"] = r.returncode == 0
        self._save(job)
