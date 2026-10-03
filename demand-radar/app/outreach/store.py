"""线索存储：<home>/outreach/leads.json 一个文件。

{"version": 1, "leads": {id: 线索}, "blocked": [[平台, 作者小写], ...], "blocked_ids": [[平台, 作者 ID], ...], "x_since_id": ""}

- 同一个平台上的同一个人只留一条线索（作者名不分大小写，或者作者 ID 相同），这样每个人最多被联系一次；
  同一个人改了昵称、或者帖子和评论里显示的名字不一样（YouTube 频道名 / @handle），靠作者 ID 认出来；
- blocked / blocked_ids 是「不再联系」名单：说了别再发、不感兴趣的人，以后导入时直接跳过；
- 写文件先写临时文件、落盘（fsync）再替换，软件中途被关掉或断电也不会写坏；文件只让自己能读；
- 文件读不了（坏了）时不当成空的接着用：那样会忘了联系过谁、谁说过别再联系。文件原样留着，存储停用，error 里写明原因。
对外只给副本，改线索一律走 update()。
"""
import copy
import json
import os
import threading
import time

STATUSES = ("new", "unfit", "draft", "approved", "sending", "sent", "failed", "replied", "skipped", "error")
RESERVED = ("version", "leads", "blocked", "blocked_ids")


def now_str(ts=None):
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() if ts is None else ts))


class LeadStore:
    def __init__(self, path):
        self.path = path
        self.lock = threading.RLock()
        self.data = {"version": 1, "leads": {}, "blocked": [], "blocked_ids": [], "x_since_id": ""}
        self.blocked = set()
        self.blocked_ids = set()
        self.error = ""  # 文件读不了时的说明；不为空就不让写
        self._load()

    # ---------- 读写 ----------
    def _load(self):
        try:
            with open(self.path, encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            return
        except (OSError, json.JSONDecodeError, UnicodeDecodeError) as e:
            self._broken(f"{type(e).__name__}: {e}")
            return
        if not isinstance(data, dict) or not isinstance(data.get("leads", {}), dict):
            self._broken("内容格式不对")
            return
        self.data.update(data)
        self.blocked = {(str(p), str(a).lower()) for p, a in (self.data.get("blocked") or []) if a}
        self.blocked_ids = {(str(p), str(i)) for p, i in (self.data.get("blocked_ids") or []) if i}

    def _broken(self, why):
        # 不能当成空的接着用：会把联系过的人、不再联系名单都忘掉，同一个人可能再被联系一次
        self.error = (f"线索文件读不了：{self.path}（{why}）。为了不重复联系以前联系过的人，线索功能先停用："
                      "把这个文件修好，或者确定不要了就把它删掉，再重启软件")

    def _writable(self):
        if self.error:
            raise ValueError(self.error)

    def save(self):
        with self.lock:
            self._writable()
            self.data["blocked"] = sorted([p, a] for p, a in self.blocked)
            self.data["blocked_ids"] = sorted([p, i] for p, i in self.blocked_ids)
            folder = os.path.dirname(self.path) or "."
            os.makedirs(folder, exist_ok=True)
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=1)
                f.flush()
                os.fsync(f.fileno())  # 先落盘再替换：断电后不会剩一个空文件
            os.replace(tmp, self.path)
            try:
                os.chmod(self.path, 0o600)  # 里面有别人的发言和你写的回复，只让自己能读
            except OSError:
                pass
            if hasattr(os, "O_DIRECTORY"):  # 换文件名这一步也落盘
                try:
                    fd = os.open(folder, os.O_RDONLY | os.O_DIRECTORY)
                    try:
                        os.fsync(fd)
                    finally:
                        os.close(fd)
                except OSError:
                    pass

    # ---------- 线索 ----------
    def _author_taken(self, platform, author, author_id=""):
        a, i = author.lower(), str(author_id or "").strip()
        return any(l.get("platform") == platform and ((a and str(l.get("author", "")).strip().lower() == a)
                                                      or (i and str(l.get("author_id") or "").strip() == i))
                   for l in self.data["leads"].values())

    def add(self, lead, save=True):
        """返回 added / dup（同一条，或同一平台同一个人已经有线索）/ blocked（在不再联系名单里）。"""
        with self.lock:
            self._writable()
            platform, author = lead.get("platform", ""), str(lead.get("author", "")).strip()
            author_id = str(lead.get("author_id") or "").strip()
            if lead["id"] in self.data["leads"]:
                return "dup"
            if self.is_blocked(platform, author, author_id):
                return "blocked"
            if (author or author_id) and self._author_taken(platform, author, author_id):
                return "dup"
            self.data["leads"][lead["id"]] = copy.deepcopy(lead)
            if save:
                self.save()
            return "added"

    def get(self, lid):
        with self.lock:
            lead = self.data["leads"].get(lid)
            return copy.deepcopy(lead) if lead else None

    def all(self):
        with self.lock:
            return [copy.deepcopy(l) for l in self.data["leads"].values()]

    def update(self, lid, **fields):
        """改几个字段并保存，返回改好的副本；没有这条线索返回 None。"""
        with self.lock:
            self._writable()
            lead = self.data["leads"].get(lid)
            if lead is None:
                return None
            lead.update(copy.deepcopy(fields))
            self.save()
            return copy.deepcopy(lead)

    def delete(self, lid):
        with self.lock:
            self._writable()
            if self.data["leads"].pop(lid, None) is None:
                return False
            self.save()
            return True

    # ---------- 不再联系 ----------
    def block(self, platform, author, author_id=""):
        """按名字拉黑；有作者 ID 的也按 ID 拉黑（对方改了昵称也认得出来）。"""
        author, author_id = str(author or "").strip(), str(author_id or "").strip()
        if not (author or author_id):
            return
        with self.lock:
            self._writable()
            if author:
                self.blocked.add((platform, author.lower()))
            if author_id:
                self.blocked_ids.add((platform, author_id))
            self.save()

    def is_blocked(self, platform, author, author_id=""):
        author, author_id = str(author or "").strip(), str(author_id or "").strip()
        with self.lock:
            return bool((author and (platform, author.lower()) in self.blocked)
                        or (author_id and (platform, author_id) in self.blocked_ids))

    # ---------- 统计 ----------
    def sent_on(self, platform, day=None):
        """某平台某天（YYYY-mm-dd，默认今天）发出了几条。"""
        day = day or time.strftime("%Y-%m-%d")
        with self.lock:
            return sum(1 for l in self.data["leads"].values()
                       if l.get("platform") == platform and str(l.get("sent_at") or "").startswith(day))

    def used_on(self, platform, day):
        """算每天上限用的数：那天发出的，加上正在发的、那天试着发了但不确定发出去没有的（都可能已经发出去了）。"""
        with self.lock:
            return sum(1 for l in self.data["leads"].values() if l.get("platform") == platform and (
                str(l.get("sent_at") or "").startswith(day) or l.get("status") == "sending"
                or (l.get("unsure") and str(l.get("tried_at") or "").startswith(day))))

    def counts(self):
        with self.lock:
            out = {}
            for l in self.data["leads"].values():
                out[l.get("status", "new")] = out.get(l.get("status", "new"), 0) + 1
            out["hot"] = sum(1 for l in self.data["leads"].values() if l.get("hot"))
            return out

    # ---------- 其他小数据（X 查回复的起点等） ----------
    def get_meta(self, key, default=""):
        with self.lock:
            return copy.deepcopy(self.data.get(key, default)) if key not in RESERVED else default

    def set_meta(self, key, value):
        if key in RESERVED:
            raise ValueError(f"{key} 不能当小数据用")
        with self.lock:
            self._writable()
            self.data[key] = value
            self.save()
