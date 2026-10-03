"""线索存储：<home>/outreach/leads.json 一个文件。

{"version": 1, "leads": {id: 线索}, "blocked": [[平台, 作者小写], ...], "x_since_id": ""}

- 同一个平台上的同一个人只留一条线索（作者名不分大小写），这样每个人最多被联系一次；
- blocked 是「不再联系」名单：说了别再发、不感兴趣的人，以后导入时直接跳过；
- 写文件先写临时文件再替换，软件中途被关掉也不会写坏；文件只让自己能读。
对外只给副本，改线索一律走 update()。
"""
import copy
import json
import os
import threading
import time

STATUSES = ("new", "unfit", "draft", "approved", "sending", "sent", "failed", "replied", "skipped", "error")
RESERVED = ("version", "leads", "blocked")


def now_str(ts=None):
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() if ts is None else ts))


class LeadStore:
    def __init__(self, path):
        self.path = path
        self.lock = threading.RLock()
        self.data = {"version": 1, "leads": {}, "blocked": [], "x_since_id": ""}
        self.blocked = set()
        self._load()

    # ---------- 读写 ----------
    def _load(self):
        try:
            with open(self.path, encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            return
        except (OSError, json.JSONDecodeError, UnicodeDecodeError):
            # 读不了就留个备份再从头开始，免得把旧数据直接盖掉
            try:
                os.replace(self.path, self.path + ".bad")
            except OSError:
                pass
            return
        if not isinstance(data, dict):
            return
        self.data.update(data)
        if not isinstance(self.data.get("leads"), dict):
            self.data["leads"] = {}
        self.blocked = {(str(p), str(a).lower()) for p, a in (self.data.get("blocked") or []) if a}

    def save(self):
        with self.lock:
            self.data["blocked"] = sorted([p, a] for p, a in self.blocked)
            os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=1)
            os.replace(tmp, self.path)
            try:
                os.chmod(self.path, 0o600)  # 里面有别人的发言和你写的回复，只让自己能读
            except OSError:
                pass

    # ---------- 线索 ----------
    def _author_taken(self, platform, author):
        a = author.lower()
        return any(l.get("platform") == platform and str(l.get("author", "")).lower() == a for l in self.data["leads"].values())

    def add(self, lead, save=True):
        """返回 added / dup（同一条，或同一平台同一个人已经有线索）/ blocked（在不再联系名单里）。"""
        with self.lock:
            platform, author = lead.get("platform", ""), str(lead.get("author", "")).strip()
            if lead["id"] in self.data["leads"]:
                return "dup"
            if author and (platform, author.lower()) in self.blocked:
                return "blocked"
            if author and self._author_taken(platform, author):
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
            lead = self.data["leads"].get(lid)
            if lead is None:
                return None
            lead.update(copy.deepcopy(fields))
            self.save()
            return copy.deepcopy(lead)

    def delete(self, lid):
        with self.lock:
            if self.data["leads"].pop(lid, None) is None:
                return False
            self.save()
            return True

    # ---------- 不再联系 ----------
    def block(self, platform, author):
        author = str(author or "").strip()
        if not author:
            return
        with self.lock:
            self.blocked.add((platform, author.lower()))
            self.save()

    def is_blocked(self, platform, author):
        author = str(author or "").strip()
        with self.lock:
            return bool(author) and (platform, author.lower()) in self.blocked

    # ---------- 统计 ----------
    def sent_on(self, platform, day=None):
        """某平台某天（YYYY-mm-dd，默认今天）发出了几条。"""
        day = day or time.strftime("%Y-%m-%d")
        with self.lock:
            return sum(1 for l in self.data["leads"].values()
                       if l.get("platform") == platform and str(l.get("sent_at") or "").startswith(day))

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
            self.data[key] = value
            self.save()
