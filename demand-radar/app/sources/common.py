"""免登录数据源共用的工具：联网取 JSON、写成和 MediaCrawler 一样的 jsonl、礼貌地等一等。

写出来的字段名和 MediaCrawler 一致（note_id、title、desc、liked_count、comment_count、note_url、
comment_id、content、like_count、sub_comment_count、parent_comment_id、create_time），
merge.py 不用改就能把这些数据和小红书、抖音的一起合并、打分。
"""
import gzip
import html
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) demand-radar/0.3 (personal research)"


def log(msg):
    print(msg, flush=True)


class FetchError(Exception):
    pass


def _opener():
    # 默认会用系统代理（macOS 的"网络"设置或 HTTPS_PROXY 环境变量）。设置里填了代理就用填的。
    proxy = os.environ.get("RADAR_PROXY", "").strip()
    if proxy:
        return urllib.request.build_opener(urllib.request.ProxyHandler({"http": proxy, "https": proxy}))
    return urllib.request.build_opener()


def _fake(url):
    """测试用：RADAR_FAKE_HTTP 指向一个 JSON 文件 {网址片段: 返回内容}，命中就直接返回，不联网。"""
    path = os.environ.get("RADAR_FAKE_HTTP")
    if not path:
        return None, False
    with open(path, encoding="utf-8") as f:
        table = json.load(f)
    for frag, resp in table.items():
        if frag in url:
            if isinstance(resp, dict) and resp.get("__status__"):
                raise FetchError(f"HTTP {resp['__status__']}：{short(url)}")
            return resp, True
    raise FetchError(f"（测试）没有准备这个网址的数据：{short(url)}")


def get_json(url, params=None, headers=None, timeout=25, retries=3, opener=None):
    """GET 一个 JSON。遇到 429/5xx 和网络错误会退避重试。"""
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    faked, hit = _fake(url)
    if hit:
        return faked
    req_headers = {"User-Agent": USER_AGENT, "Accept": "application/json", "Accept-Encoding": "gzip"}
    req_headers.update(headers or {})
    opener = opener or _opener()
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=req_headers)
            with opener.open(req, timeout=timeout) as resp:
                body = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    body = gzip.decompress(body)
                text = body.decode("utf-8", errors="replace")
                return json.loads(text) if text.strip() else None
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                wait = int(e.headers.get("Retry-After") or 0) or (5 * (attempt + 1))
                log(f"  {e.code}，{wait} 秒后重试：{short(url)}")
                time.sleep(min(wait, 60))
                continue
            if e.code == 403:
                raise FetchError(f"被拒绝访问（403）：{short(url)}。可能是请求太频繁，或这个网站需要代理") from e
            if e.code == 404:
                raise FetchError(f"找不到（404）：{short(url)}") from e
            raise FetchError(f"HTTP {e.code}：{short(url)}") from e
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
            last = e
            if attempt < retries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            reason = getattr(e, "reason", e)
            raise FetchError(f"连不上：{short(url)}（{reason}）。国外网站请先开代理") from e
        except json.JSONDecodeError as e:
            raise FetchError(f"返回的不是 JSON：{short(url)}") from e
    raise FetchError(str(last))


def since_date():
    """新建采集时选的"只要多久以内的"：'YYYY-MM-DD'，不限时为空。搜索时尽量让网站只返回这天以后的。"""
    s = os.environ.get("RADAR_SINCE", "").strip()[:10]
    return s if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s) else ""


def since_epoch():
    s = since_date()
    return int(datetime.strptime(s, "%Y-%m-%d").timestamp()) if s else 0


def short(url, n=90):
    return url if len(url) <= n else url[: n - 1] + "…"


def pause(base):
    """每次请求之间停一停，别给人家网站添麻烦，也免得被封。"""
    if base > 0:
        time.sleep(base * random.uniform(0.7, 1.3))


def strip_html(s):
    if not s:
        return ""
    s = re.sub(r"<(br|p|/p|li)\b[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\n{3,}", "\n\n", html.unescape(s)).strip()


def iso_to_ts(s):
    """'2026-09-30T12:34:56Z' / '2026-09-30T12:34:56-07:00' → 秒级时间戳；不认识就原样返回。"""
    if not s:
        return ""
    try:
        return int(datetime.fromisoformat(str(s).replace("Z", "+00:00")).timestamp())
    except ValueError:
        return s


class Writer:
    """按 MediaCrawler 的目录和文件名写 jsonl：<输出目录>/<平台>/jsonl/<抓法>_contents_<日期>.jsonl。"""

    def __init__(self, out_dir, platform, crawler_type):
        self.dir = os.path.join(out_dir, platform, "jsonl")
        os.makedirs(self.dir, exist_ok=True)
        day = datetime.now().strftime("%Y-%m-%d")
        self.paths = {k: os.path.join(self.dir, f"{crawler_type}_{k}_{day}.jsonl") for k in ("contents", "comments")}
        self.counts = {"contents": 0, "comments": 0}
        self.seen = {"contents": set(), "comments": set()}

    def _write(self, kind, item, key):
        if key in self.seen[kind]:
            return False
        self.seen[kind].add(key)
        with open(self.paths[kind], "a", encoding="utf-8") as f:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
        self.counts[kind] += 1
        return True

    def post(self, **item):
        return self._write("contents", item, str(item.get("note_id")))

    def comment(self, **item):
        return self._write("comments", item, (str(item.get("note_id")), str(item.get("comment_id"))))


ERRORS = []


def attempt(what, fn, *args, **kwargs):
    """一个请求失败就记下来、跳过，接着抓后面的；全部失败时 run_source.py 才算这个平台失败。"""
    try:
        return fn(*args, **kwargs)
    except FetchError as e:
        ERRORS.append(f"{what}：{e}")
        log(f"  {what}没抓到，跳过：{e}")
        return None


def split_targets(values):
    out = []
    for v in values:
        for part in re.split(r"[,\s，]+", v or ""):
            if part.strip():
                out.append(part.strip())
    return out


def fail(msg):
    print(f"错误：{msg}", file=sys.stderr, flush=True)
    sys.exit(1)
