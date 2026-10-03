"""线索与回复：从采集结果里挑出可能需要你产品的人 → AI 判断并写回复 → 你审核批准 → 发出 → 查谁回了。

规矩（写死在代码里，不靠自觉）：
- 每个平台只用你自己的一个账号；同一个人在同一个平台最多联系一次；说了别再联系、不感兴趣的人自动拉黑；
- 没有你批准，什么都不会发出去；
- 每天最多发多少（上限）、每个平台怎么发（官方接口自动发 / 复制后自己去发），都由你在设置里定。
  没有「每天至少发多少」这种东西。
后台任务（判断、发送、查回复）同一时间只跑一个，随时能停；出什么错都只记下来，不让软件崩掉。
"""
import copy
import hashlib
import json
import math
import os
import random
import re
import threading
import time
from datetime import datetime

from . import agent, senders
from .store import LeadStore

try:
    import catalog  # app/ 目录在 sys.path 里（server.py 和测试都会加）
except ImportError:  # pragma: no cover
    catalog = None

KIND_NAMES = {"judge": "让 AI 判断", "send": "发送", "check": "查回复"}
PROFILE_KEYS = ("product_name", "product_pitch", "product_link", "sender_identity", "reply_style")
CAP_KEYS = {"reddit": "cap_reddit", "x": "cap_x", "youtube": "cap_youtube"}
DEFAULT_CAPS = {"cap_reddit": 20, "cap_x": 20, "cap_youtube": 20, "cap_other": 30}
CRED_KEYS = {"reddit": ("reddit_client_id", "reddit_client_secret", "reddit_username", "reddit_password", "proxy"),
             "x": ("x_api_key", "x_api_secret", "x_access_token", "x_access_secret", "proxy")}
REJUDGE = ("new", "error", "unfit", "draft", "skipped")  # 指定了哪几条时，这些状态可以重新判断
LOCKED = ("sending", "sent", "replied")                    # 已经发出（或正在发）的不能再改
APPROVABLE = ("new", "draft", "unfit", "failed", "skipped", "error", "approved")
JOB_ID = re.compile(r"[\w-]+")
AUTO_TICK = 60  # 自动查回复：每分钟看一眼到没到时间
MAX_ERRORS = 50


def platform_name(p):
    return catalog.name_of(p) if catalog else p


def _num(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return 0.0
    return f if math.isfinite(f) else 0.0


def _sha(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()


def lead_id(platform, kind, item_id):
    return f"{platform}-{_sha(f'{platform}:{kind}:{item_id}')[:10]}"


def make_lead(row, job, found_at):
    """signals.jsonl 的一行 → 一条线索。"""
    platform = str(row.get("platform") or "")
    kind = "post" if row.get("kind") == "帖子" else "comment"
    item_id = str(row.get("id") or "").strip() or _sha(str(row.get("text", "")))[:12]
    score = _num(row.get("score"))
    return {
        "id": lead_id(platform, kind, item_id), "platform": platform, "kind": kind, "item_id": item_id,
        "post_id": str(row.get("post_id") or ""), "author": str(row.get("author") or "").strip(),
        "author_id": str(row.get("author_id") or ""), "text": str(row.get("text") or "")[:4000],
        "post_title": str(row.get("post_title") or "")[:300], "url": str(row.get("url") or ""),
        "signals": str(row.get("signals") or ""), "score": int(score) if score == int(score) else round(score, 2),
        "likes": int(_num(row.get("likes"))), "time": str(row.get("time") or ""), "job": job, "found_at": found_at,
        "status": "new", "fit_score": None, "need": "", "reason": "", "lang": "", "draft": "", "edited": False,
        "error": "", "sent_at": "", "sent_via": "", "sent_ref": "", "replies": [], "hot": False,
    }


def reply_url(lead):
    """「复制并打开」打开的网址：评论尽量直接定位到那条评论，帖子就是帖子本身。"""
    url, item, p = lead.get("url") or "", str(lead.get("item_id") or ""), lead.get("platform")
    if p == "x" and item.isdigit():
        return f"https://x.com/i/status/{item}"
    if p == "hn" and item.isdigit():
        return f"https://news.ycombinator.com/item?id={item}"
    if lead.get("kind") != "comment" or not url or not item:
        return url
    if p == "reddit" and "/comments/" in url:
        return url.split("?")[0].rstrip("/") + f"/{item.removeprefix('t1_')}/"
    if p == "youtube" and "watch?v=" in url:
        return f"{url}&lc={item}"
    if p == "github" and item.isdigit():
        return f"{url.split('#')[0]}#issuecomment-{item}"
    return url


def _ts(at):
    """回复时间（秒级时间戳或 ISO 字符串）→ 时间戳；认不出返回 None。"""
    if isinstance(at, (int, float)):
        return float(at)
    try:
        return datetime.fromisoformat(str(at).replace("Z", "+00:00")).timestamp()
    except ValueError:
        return None


class Outreach:
    judge_workers = 3  # AI 判断同时跑几条（测试里改成 1）

    def __init__(self, home, settings_fn, runs_dir, client_factory=None, http=None, clock=time.time, sleep=time.sleep,
                 auto_check=True):
        self.home = home
        self.settings_fn = settings_fn
        self.runs = runs_dir
        self.store = LeadStore(os.path.join(home, "outreach", "leads.json"))
        self.client_factory = client_factory or agent.make_client
        self.http = http or senders.http_request
        self.clock = clock
        self.sleep = sleep
        self.uniform = random.uniform
        self.lock = threading.RLock()
        self.task = self._idle()
        self._stop = threading.Event()
        self._closed = threading.Event()
        self._worker = None
        self._senders = {}
        self.last_check = _num(self.store.get_meta("last_check", 0))
        self._recover()
        self._auto = None
        if auto_check:
            self._auto = threading.Thread(target=self._auto_loop, daemon=True)
            self._auto.start()

    # ---------- 小工具 ----------
    @staticmethod
    def _idle():
        return {"kind": None, "done": 0, "total": 0, "message": "", "errors": [], "finished": "", "last": ""}

    def now(self):
        return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.clock()))

    def today(self):
        return time.strftime("%Y-%m-%d", time.localtime(self.clock()))

    def settings(self):
        return self.settings_fn() or {}

    def model(self):
        return str(self.settings().get("ai_model") or "").strip() or agent.DEFAULT_MODEL

    def _recover(self):
        # 上次软件在发送途中被关掉：不知道发出去没有，标成失败让你自己去看，绝不自动重发
        for l in self.store.all():
            if l.get("status") == "sending":
                self.store.update(l["id"], status="failed", error="发送时软件被关掉了，不确定发出去没有：先去平台上看一眼，没发出再点重试")

    def profile(self):
        s = self.settings()
        return {k: str(s.get(k) or "").strip() for k in PROFILE_KEYS}

    def ready(self):
        s, p = self.settings(), self.profile()
        return {"ai": bool(str(s.get("anthropic_api_key") or "").strip()),
                "profile": bool(p["product_name"] and p["product_pitch"] and p["sender_identity"]),
                "reddit": senders.Reddit(s).ready(), "x": senders.X(s).ready()}

    def _client(self):
        s = self.settings()
        return self.client_factory(str(s.get("anthropic_api_key") or "").strip(), str(s.get("proxy") or "").strip())

    def _sender(self, platform):
        """同一套账号复用同一个发送器（Reddit 登录令牌能缓存一小时）。"""
        s = self.settings()
        key = tuple(str(s.get(k) or "") for k in CRED_KEYS[platform])
        with self.lock:
            cached = self._senders.get(platform)
            if not cached or cached[0] != key:
                cached = (key, senders.SENDERS[platform](s, http=self.http))
                self._senders[platform] = cached
            return cached[1]

    # ---------- 上限 ----------
    def cap_for(self, platform):
        key = CAP_KEYS.get(platform, "cap_other")
        try:
            return max(0, int(self.settings().get(key, DEFAULT_CAPS[key])))
        except (TypeError, ValueError):
            return 0

    def today_sent(self, platform):
        return self.store.sent_on(platform, self.today())

    def cap_message(self, platform):
        name = platform_name(platform)
        if self.cap_for(platform) <= 0:
            return f"{name} 的每天上限设成了 0（不往这个平台发），要发先去 设置 → 线索与回复 里改"
        return f"今天 {name} 已发 {self.today_sent(platform)} 条，到上限了（设置里能改）"

    def _capped(self, platform):
        return self.today_sent(platform) >= self.cap_for(platform)

    # ---------- 后台任务 ----------
    def _check_idle(self):
        with self.lock:
            if self.task["kind"]:
                raise ValueError(f"正在{KIND_NAMES.get(self.task['kind'], self.task['kind'])}，等它做完或先停止")

    def _begin(self, kind, total, target, *args):
        with self.lock:
            self._check_idle()
            self._stop.clear()
            self.task = {**self._idle(), "kind": kind, "total": total, "last": self.task.get("last", "")}
            t = threading.Thread(target=self._run, args=(kind, target, args), daemon=True)
            self._worker = t
            try:
                t.start()
            except RuntimeError as e:  # 起不了线程：别让任务一直显示在跑
                self.task.update(kind=None, finished=self.now(), message=f"没能开始：{e}")
                raise ValueError(f"没能开始：{e}") from e

    def _run(self, kind, target, args):
        msg = ""
        try:
            msg = target(*args) or ""
        except Exception as e:  # 后台出什么错都只记下来
            msg = f"出错了：{type(e).__name__}: {e}"
            self._err(msg)
        finally:
            with self.lock:
                self.task["kind"] = None
                self.task["finished"] = self.now()
                self.task["last"] = kind
                self.task["message"] = msg or self.task["message"] or "做完了"

    def _err(self, text):
        with self.lock:
            self.task["errors"] = (self.task["errors"] + [text])[-MAX_ERRORS:]

    def _progress(self, n=1):
        with self.lock:
            self.task["done"] += n

    def _pause(self, sec):
        """发送间隔。用 Event 等，点「停止」马上醒；测试里换成注入的 sleep。返回 True 表示被停止了。"""
        if self.sleep is time.sleep:
            return self._stop.wait(sec)
        self.sleep(sec)
        return self._stop.is_set()

    def stop(self):
        self._stop.set()
        with self.lock:
            running = bool(self.task["kind"])
            if running:
                self.task["message"] = "正在停止…"
            return running

    def wait(self, timeout=None):
        """等当前后台任务做完（测试和退出时用）。"""
        t = self._worker
        if t:
            t.join(timeout)
        return not (t and t.is_alive())

    def close(self):
        self._closed.set()
        self._stop.set()

    # ---------- 导入 ----------
    def import_job(self, job_id, limit=30, min_score=0):
        job_id = str(job_id or "").strip()
        if not JOB_ID.fullmatch(job_id):
            raise ValueError("任务 ID 不对")
        path = os.path.join(self.runs, job_id, "signals.jsonl")
        if not os.path.isfile(path):
            raise ValueError("这个任务没有可用的结果，先等它采集完并打分；旧任务可以点「重新打分」")
        try:
            limit = max(1, min(int(limit), 1000))
        except (TypeError, ValueError):
            limit = 30
        min_score = _num(min_score)
        rows = []
        with open(path, encoding="utf-8") as f:
            for line in f:
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if isinstance(r, dict):
                    rows.append(r)
        rows.sort(key=lambda r: -_num(r.get("score")))
        out = {"added": 0, "dup": 0, "blocked": 0, "no_contact": 0, "no_author": 0}
        found = self.now()
        for r in rows:
            if out["added"] >= limit or _num(r.get("score")) < min_score:
                break
            if str(r.get("platform") or "") in senders.NO_CONTACT:
                out["no_contact"] += 1
                continue
            if not str(r.get("author") or "").strip():
                out["no_author"] += 1
                continue
            out[self.store.add(make_lead(r, job_id, found), save=False)] += 1
        self.store.save()
        return out

    # ---------- AI 判断 ----------
    def judge(self, ids=None):
        self._check_idle()
        r = self.ready()
        if not r["ai"]:
            raise ValueError("先在 设置 → 线索与回复 里填 Anthropic API key")
        if not r["profile"]:
            raise ValueError("先在 设置 → 线索与回复 里填好产品名称、一句话说明和你的身份（会写进每条回复）")
        if ids is None:
            leads = sorted(self.store.all(), key=lambda l: -_num(l.get("score")))
            targets = [l["id"] for l in leads if l.get("status") in ("new", "error")]
        else:
            targets = [str(i) for i in ids if (self.store.get(str(i)) or {}).get("status") in REJUDGE]
        if not targets:
            raise ValueError("没有要判断的线索")
        try:
            client = self._client()
        except agent.AgentError as e:
            raise ValueError(str(e)) from e
        except Exception as e:
            raise ValueError(f"AI 客户端建不起来：{e}") from e
        self._begin("judge", len(targets), self._judge_run, targets, client, self.profile(), self.model())
        return {"started": True, "total": len(targets)}

    def _judge_run(self, targets, client, profile, model):
        queue, stats, fatal = list(targets), {"fit": 0, "unfit": 0, "error": 0}, []

        def worker():
            while not self._stop.is_set() and not fatal:
                with self.lock:
                    if not queue:
                        return
                    lid = queue.pop(0)
                self._judge_one(lid, client, profile, model, stats, fatal)

        n = max(1, min(self.judge_workers, len(targets)))
        if n == 1:
            worker()
        else:
            threads = [threading.Thread(target=worker, daemon=True) for _ in range(n)]
            for t in threads:
                t.start()
            for t in threads:
                t.join()
        if fatal:
            return fatal[0]
        msg = f"判断了 {stats['fit'] + stats['unfit'] + stats['error']} 条：{stats['fit']} 条合适（回复写好了，等你审核），{stats['unfit']} 条不合适"
        if stats["error"]:
            msg += f"，{stats['error']} 条出错"
        return ("已停止。" + msg) if self._stop.is_set() else msg

    def _judge_one(self, lid, client, profile, model, stats, fatal):
        lead = self.store.get(lid)
        try:
            if not lead or lead.get("status") not in REJUDGE:
                return
            try:
                res = agent.judge(client, lead, profile, model)
            except Exception as e:
                err = e if isinstance(e, agent.AgentError) else agent.AgentError(f"{type(e).__name__}: {e}")
                with self.lock:
                    if (self.store.get(lid) or {}).get("status") in REJUDGE:
                        self.store.update(lid, status="error", error=str(err))
                    stats["error"] += 1
                self._err(f"{lead.get('author')}：{err}")
                if err.fatal:
                    fatal.append(str(err))
                return
            with self.lock:
                if (self.store.get(lid) or {}).get("status") not in REJUDGE:  # 判断期间你已经处理了这条
                    return
                common = {"fit_score": res["fit_score"], "need": res["need"], "reason": res["reason"], "lang": res["lang"],
                          "edited": False, "error": ""}
                if res["fit"]:
                    self.store.update(lid, status="draft", draft=res["draft"], **common)
                    stats["fit"] += 1
                else:
                    self.store.update(lid, status="unfit", draft="", **common)
                    stats["unfit"] += 1
        finally:
            self._progress()

    # ---------- 审核 ----------
    def update(self, lid, draft=None, action=None):
        with self.lock:
            lead = self.store.get(lid)
            if not lead:
                raise ValueError("找不到这条线索")
            st, fields = lead["status"], {}
            if draft is not None:
                if st in LOCKED:
                    raise ValueError("已经发出去的回复不能再改")
                fields.update(draft=str(draft).strip()[:4000], edited=True)
            text = fields.get("draft", lead.get("draft") or "")
            if action in (None, ""):
                pass
            elif action == "approve":
                if st in LOCKED:
                    raise ValueError("这条已经发出去了")
                if not text.strip():
                    raise ValueError("回复是空的，先写好再批准")
                if self.store.is_blocked(lead["platform"], lead["author"]):
                    raise ValueError("这个人在不再联系名单里")
                fields.update(status="approved", error="")
            elif action == "skip":
                if st in LOCKED:
                    raise ValueError("这条已经发出去了，不用跳过")
                fields["status"] = "skipped"
            elif action == "restore":
                if st not in ("skipped", "unfit", "error", "failed"):
                    raise ValueError("只有跳过、不合适、出错的线索能恢复")
                fields["status"] = "draft" if text.strip() else "new"
            elif action == "block":
                self.store.block(lead["platform"], lead["author"])
                if st not in LOCKED:
                    fields["status"] = "skipped"
            elif action == "delete":
                if st in LOCKED:
                    raise ValueError("已经联系过的人不能删（删了以后可能被再次联系）；不想看到可以点「不再联系此人」")
                self.store.delete(lid)
                return {"id": lid, "deleted": True}
            else:
                raise ValueError(f"不认识的操作：{action}")
            return self.store.update(lid, **fields) if fields else lead

    # ---------- 发送 ----------
    def mode(self, platform):
        return senders.mode_for(platform, self.settings())

    def send(self, ids):
        """批准并发送：草稿先批准；官方接口能发的排队在后台慢慢发，要手动发的把 ID 还给界面。"""
        ids = [str(i) for i in (ids or [])]
        if not ids:
            raise ValueError("先选要发的线索")
        with self.lock:
            self._check_idle()
            s = self.settings()
            queued, manual = [], []
            for lid in ids:
                lead = self.store.get(lid)
                if not lead or self.store.is_blocked(lead["platform"], lead["author"]):
                    continue
                if lead["status"] in ("draft", "failed") and (lead.get("draft") or "").strip():
                    lead = self.store.update(lid, status="approved", error="")
                if lead["status"] != "approved":
                    continue
                (queued if senders.mode_for(lead["platform"], s) == "api" else manual).append(lid)
            if queued:
                self._begin("send", len(queued), self._send_run, queued)
        return {"queued": len(queued), "manual": manual}

    def _send_run(self, ids):
        try:
            gap = max(0.0, float(self.settings().get("send_gap_sec", 90) or 0))
        except (TypeError, ValueError):
            gap = 90.0
        sent = failed = 0
        tried, capped, halt = False, [], ""
        for lid in ids:
            if self._stop.is_set():
                halt = "已停止"
                break
            lead = self.store.get(lid)
            if not lead or lead["status"] != "approved" or self.mode(lead["platform"]) != "api":
                self._progress()
                continue
            p = lead["platform"]
            if self.store.is_blocked(p, lead["author"]):
                self.store.update(lid, status="skipped", error="对方在不再联系名单里，没发")
                self._progress()
                continue
            if self._capped(p):  # 到了你设的上限：这个平台剩下的留在待发送，明天再发
                if p not in capped:
                    capped.append(p)
                self._progress()
                continue
            if tried and gap > 0 and self._pause(gap * self.uniform(1.0, 1.5)):
                halt = "已停止"
                break
            with self.lock:  # 等的这段时间里你可能改了、跳过、拉黑了这条
                lead = self.store.get(lid)
                if (not lead or lead["status"] != "approved" or self._capped(p)
                        or self.store.is_blocked(p, lead["author"])):
                    self._progress()
                    continue
                self.store.update(lid, status="sending")
            tried = True
            try:
                ref = self._sender(p).reply(lead, lead["draft"])
            except senders.SendError as e:
                if e.fatal:  # 账号不对或被限流：这条不算失败，留在待发送，整批停下
                    self.store.update(lid, status="approved", error=str(e))
                    self._err(f"{platform_name(p)}：{e}")
                    halt = str(e)
                    break
                self.store.update(lid, status="failed", error=str(e))
                self._err(f"{lead['author']}：{e}")
                failed += 1
            except Exception as e:
                self.store.update(lid, status="failed", error=f"{type(e).__name__}: {e}")
                self._err(f"{lead['author']}：{type(e).__name__}: {e}")
                failed += 1
            else:
                self.store.update(lid, status="sent", sent_at=self.now(), sent_via="api", sent_ref=str(ref or ""), error="")
                sent += 1
            self._progress()
        left = sum(1 for lid in ids if (self.store.get(lid) or {}).get("status") == "approved")
        msg = f"发出 {sent} 条"
        if failed:
            msg += f"，{failed} 条没发出去（看每条的错误）"
        if left:
            msg += f"，还有 {left} 条留在待发送"
        parts = [halt] if halt else []
        parts += [self.cap_message(p) for p in capped]
        return "；".join(parts + [msg])

    def mark_sent(self, lid):
        """手动发的平台：你在网页上发完点「我已发出」。也算进当天的上限。"""
        with self.lock:
            lead = self.store.get(lid)
            if not lead:
                raise ValueError("找不到这条线索")
            st = lead["status"]
            if st in ("sent", "replied"):
                return lead
            if st == "sending":
                raise ValueError("这条正在用官方接口发，等一下")
            if st not in ("approved", "draft", "failed"):
                raise ValueError("先批准这条再标记发出")
            if not (lead.get("draft") or "").strip():
                raise ValueError("回复是空的，先写好再发")
            if self.store.is_blocked(lead["platform"], lead["author"]):
                raise ValueError("这个人在不再联系名单里")
            if self._capped(lead["platform"]):
                raise ValueError(self.cap_message(lead["platform"]))
            return self.store.update(lid, status="sent", sent_at=self.now(), sent_via="manual", sent_ref="", error="")

    def open_info(self, lid):
        """「复制并打开」：给出要打开的网址和回复内容；草稿顺手批准（马上就要手动发了）。"""
        with self.lock:
            lead = self.store.get(lid)
            if not lead:
                raise ValueError("找不到这条线索")
            if (lead["status"] in ("draft", "failed") and (lead.get("draft") or "").strip()
                    and not self.store.is_blocked(lead["platform"], lead["author"])):
                lead = self.store.update(lid, status="approved", error="")
            return {"url": reply_url(lead), "draft": lead.get("draft") or ""}

    # ---------- 回复 ----------
    def _classify(self, lead, text, client):
        if client is None:
            return {"intent": "other", "hot": False, "summary": "", "suggested_reply": ""}
        try:
            return agent.classify_reply(client, lead, text, self.profile(), self.model())
        except Exception as e:
            return {"intent": "other", "hot": False, "summary": f"（AI 没读成：{e}）", "suggested_reply": ""}

    def _reply_client(self):
        r = self.ready()
        if not (r["ai"] and r["profile"]):
            return None
        try:
            return self._client()
        except Exception as e:
            self._err(f"AI 用不了：{e}")
            return None

    def _apply_replies(self, lid, replies):
        """记下新回复：状态改成已回复；想试用、问价格的标成热线索；说别再联系、不感兴趣的拉黑。"""
        with self.lock:
            lead = self.store.get(lid)
            if not lead:
                return None
            have = {r.get("id") for r in lead.get("replies") or []}
            new = [r for r in replies if r.get("id") not in have]
            if not new:
                return lead
            hot, block = bool(lead.get("hot")), False
            for r in new:
                if r.get("intent") == "stop":
                    hot, block = False, True
                elif r.get("intent") == "negative":
                    block = True
                else:
                    hot = hot or bool(r.get("hot"))
            lead = self.store.update(lid, replies=(lead.get("replies") or []) + new, status="replied", hot=hot)
            if block:
                self.store.block(lead["platform"], lead["author"])
            return lead

    def add_reply(self, lid, text):
        """手动发的平台：把对方的回复贴进来，AI 读一下是什么意思。"""
        text = str(text or "").strip()[:4000]
        if not text:
            raise ValueError("先把对方的回复贴进来")
        lead = self.store.get(lid)
        if not lead:
            raise ValueError("找不到这条线索")
        if lead["status"] not in ("sent", "replied"):
            raise ValueError("这条还没发出去，先点「我已发出」再记录回复")
        res = self._classify(lead, text, self._reply_client())
        reply = {"id": f"manual-{len(lead.get('replies') or []) + 1}", "author": lead["author"], "text": text,
                 "at": self.now(), **res}
        return self._apply_replies(lid, [reply])

    def _checkable(self):
        """能自动查回复的平台：账号填好了，并且有发出去的线索。"""
        s = self.settings()
        sent = {l["platform"] for l in self.store.all() if l.get("status") in ("sent", "replied")}
        return [p for p in senders.API_PLATFORMS if p in sent and senders.SENDERS[p](s).ready()]

    def check_replies(self):
        self._check_idle()
        platforms = self._checkable()
        if not platforms:
            raise ValueError("没有能自动查的：Reddit / X 的发送账号填好、并且有发出去的线索才能查；其他平台请把对方的回复贴到线索里")
        self._begin("check", 0, self._check_run, platforms)
        return {"started": True, "platforms": platforms}

    @staticmethod
    def _same(a, b):
        return bool(a) and str(a).lower() == str(b or "").lower()

    @staticmethod
    def _after_sent(lead, at):
        """只认发出之后的回复（留 10 分钟余量）。"""
        t = _ts(at)
        try:
            sent = time.mktime(time.strptime(lead.get("sent_at") or "", "%Y-%m-%d %H:%M:%S"))
        except ValueError:
            return True
        return t is None or t >= sent - 600

    def _match_reddit(self, lead, it):
        if not self._after_sent(lead, it["at"]):
            return False
        if it["kind"] == "t1":
            if lead.get("sent_ref"):
                return it["parent_id"] == lead["sent_ref"]
            return self._same(it["author"], lead.get("author"))  # 手动发的没有评论 ID，只能按人对
        return it["kind"] == "t4" and self._same(it["author"], lead.get("author"))

    def _match_x(self, lead, it):
        if not self._after_sent(lead, it["at"]):
            return False
        if lead.get("sent_ref") and it["replied_to"] == lead["sent_ref"]:
            return True
        return bool(it["conversation_id"]) and it["conversation_id"] == lead.get("post_id") and self._same(it["author"], lead.get("author"))

    def _check_run(self, platforms):
        try:
            leads = [l for l in self.store.all() if l.get("status") in ("sent", "replied")]
            found = []  # (线索 ID, 回复)
            for p in platforms:
                mine = [l for l in leads if l["platform"] == p]
                since = str(self.store.get_meta("x_since_id", "") or "")
                try:
                    if p == "reddit":
                        items, newest = self._sender(p).inbox(), ""
                    else:
                        items, newest = self._sender(p).mentions(since)
                except senders.SendError as e:
                    self._err(f"{platform_name(p)}：{e}")
                    continue
                match = self._match_reddit if p == "reddit" else self._match_x
                for it in items:
                    for l in mine:
                        if match(l, it):
                            if it["id"] not in {r.get("id") for r in l.get("replies") or []}:
                                found.append((l["id"], {"id": it["id"], "author": it["author"], "text": it["text"], "at": it["at"]}))
                            break
                if p == "x" and newest and newest != since:
                    self.store.set_meta("x_since_id", newest)
            with self.lock:
                self.task["total"] = len(found)
            client = self._reply_client() if found else None
            hot = 0
            for lid, raw in found:
                lead = self.store.get(lid)
                if not lead:
                    continue
                # 停止后剩下的也记下来（不让 AI 读），免得漏掉回复
                res = self._classify(lead, raw["text"], None if self._stop.is_set() else client)
                after = self._apply_replies(lid, [{**raw, **res}])
                if after and after.get("hot") and not lead.get("hot"):
                    hot += 1
                self._progress()
            return f"查到 {len(found)} 条新回复（{hot} 个热线索）"
        finally:
            self.last_check = self.clock()
            self.store.set_meta("last_check", self.last_check)

    # ---------- 自动查回复 ----------
    def _auto_loop(self):
        while not self._closed.wait(AUTO_TICK):
            self._auto_tick()

    def _auto_tick(self):
        """到了设置里的间隔、没在跑别的任务、有能查的平台，就查一次。返回这次查了没有。"""
        try:
            minutes = _num(self.settings().get("reply_check_min", 30))
            if minutes <= 0 or self.clock() - self.last_check < minutes * 60:
                return False
            with self.lock:
                if self.task["kind"]:
                    return False
            if not self._checkable():
                return False
            self.check_replies()
            return True
        except ValueError:
            return False
        except Exception as e:  # 自动查回复出错不能让软件崩
            self._err(f"自动查回复出错：{type(e).__name__}: {e}")
            return False

    # ---------- 测试连接 ----------
    def test_ai(self):
        if not str(self.settings().get("anthropic_api_key") or "").strip():
            return {"ok": False, "message": "先填 Anthropic API key"}
        try:
            text = agent.ping(self._client(), self.model())
        except agent.AgentError as e:
            return {"ok": False, "message": str(e)}
        except Exception as e:
            return {"ok": False, "message": f"{type(e).__name__}: {e}"}
        return {"ok": True, "message": f"能用（{self.model()}）：{text[:100]}"}

    def test_sender(self, platform):
        if platform not in senders.SENDERS:
            raise ValueError("只能测试 Reddit 和 X 的发送账号")
        sender = senders.SENDERS[platform](self.settings(), http=self.http)
        if not sender.ready():
            return {"ok": False, "message": f"{platform_name(platform)} 的发送账号还没填全"}
        try:
            if platform == "reddit":
                return {"ok": True, "message": f"能连上，账号 u/{sender.whoami()}"}
            return {"ok": True, "message": f"能连上，账号 @{sender.whoami()[1]}"}
        except senders.SendError as e:
            return {"ok": False, "message": str(e)}

    # ---------- 给界面 ----------
    def last_check_str(self):
        return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.last_check)) if self.last_check > 0 else ""

    def state(self):
        s = self.settings()
        leads = sorted(self.store.all(), key=lambda l: (l.get("found_at", ""), _num(l.get("score"))), reverse=True)
        platforms = ["reddit", "x"] + sorted({l["platform"] for l in leads} - {"reddit", "x"})
        with self.lock:
            task = copy.deepcopy(self.task)
        return {
            "leads": leads, "counts": self.store.counts(),
            "today": {p: {"name": platform_name(p), "sent": self.today_sent(p), "cap": self.cap_for(p)} for p in platforms},
            "task": task, "ready": self.ready(), "modes": {p: senders.mode_for(p, s) for p in platforms},
            "last_check": self.last_check_str(),
        }
