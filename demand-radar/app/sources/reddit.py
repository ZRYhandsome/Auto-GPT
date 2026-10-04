"""Reddit：按版块和关键词搜帖子，再抓评论。不用登录。

Reddit 自己的 .json 接口从 2026 年 5 月底起对不登录的请求一律返回 403，
所以主要走 Arctic Shift（一个公开的 Reddit 存档，数据会晚一点）：
- 搜帖子：https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=SaaS&query=alternative&limit=100
- 评论树：https://arctic-shift.photon-reddit.com/api/comments/tree?link_id=t3_<帖子ID>&limit=...
Arctic Shift 只能在某个版块（或某个作者）里搜关键词。关键词写法：
- "r/SaaS alternative to"：只在 r/SaaS 里搜 alternative to；
- 不写版块：在设置里的"Reddit 默认版块"里逐个搜（默认是几个专门许愿、讨论产品的版块）。
Arctic Shift 连不上时再试 Reddit 自己的接口。国内要开代理。
"""
import os
import re
import time

from .common import FetchError, attempt, get_json, log, pause, since_date, since_epoch

PLATFORM_DIR = "reddit"
ARCTIC = "https://arctic-shift.photon-reddit.com/api"
REDDIT = "https://www.reddit.com"
HEADERS = {"User-Agent": "macos:demand-radar:0.3 (personal research tool)"}
DEFAULT_SUBS = "SomebodyMakeThis,AppIdeas,SaaS,Entrepreneur,startups,productivity"


def subreddits():
    raw = os.environ.get("RADAR_REDDIT_SUBS", "").strip() or DEFAULT_SUBS
    return [s.strip().removeprefix("r/") for s in re.split(r"[,\s，]+", raw) if s.strip()]


def split_query(kw):
    """'r/SaaS alternative to' → (['SaaS'], 'alternative to')；没写版块就用默认版块。"""
    m = re.match(r"\s*r/([A-Za-z0-9_]+)\s+(.*)", kw)
    if m:
        return [m.group(1)], m.group(2).strip()
    return subreddits(), kw.strip()


def post_id_of(target):
    m = re.search(r"/comments/([a-z0-9]+)", target) or re.fullmatch(r"(?:t3_)?([a-z0-9]{5,10})", target.strip())
    return m.group(1) if m else None


def _unwrap(x):
    """Arctic Shift 有时给 {kind, data}，有时直接给内容。"""
    return x.get("data", x) if isinstance(x, dict) and "kind" in x else x


def reddit_window():
    """Reddit 自己的搜索只认 day/week/month/year/all。"""
    if not since_epoch():
        return "all"
    days = (time.time() - since_epoch()) / 86400
    return next((w for w, d in (("day", 1), ("week", 7), ("month", 31), ("year", 366)) if days <= d), "all")


def search(sub, q, limit):
    params = {"subreddit": sub, "query": q, "limit": min(max(limit, 1), 100), "sort": "desc"}
    if since_date():
        params["after"] = since_date()  # 只要这天以后发的帖子
    try:
        data = get_json(f"{ARCTIC}/posts/search", params)
        return [_unwrap(x) for x in (data or {}).get("data") or []]
    except FetchError as e:
        log(f"  Arctic Shift 没取到（{e}），改试 Reddit 自己的接口")
        data = get_json(f"{REDDIT}/r/{sub}/search.json", {"q": q, "restrict_sr": 1, "sort": "relevance", "t": reddit_window(), "limit": min(max(limit, 1), 100), "raw_json": 1}, HEADERS)
        return [c["data"] for c in ((data or {}).get("data") or {}).get("children", []) if c.get("kind") == "t3"]


def author_of(d):
    """(用户名, 账号 ID "t2_…")。账号删了的显示 [deleted]，记成空。"""
    name = d.get("author") or ""
    if name in ("[deleted]", "[removed]"):
        return "", ""
    return name, d.get("author_fullname") or ""


def write_post(w, d, keyword):
    pid = str(d.get("id", "")).removeprefix("t3_")
    nickname, user_id = author_of(d)
    w.post(
        note_id=pid, title=d.get("title", ""), desc=(d.get("selftext") or "")[:4000],
        liked_count=d.get("score", 0), comment_count=d.get("num_comments", 0),
        note_url=REDDIT + (d.get("permalink") or f"/comments/{pid}"), source_keyword=keyword,
        time=d.get("created_utc", ""), subreddit=d.get("subreddit", ""), nickname=nickname, user_id=user_id,
    )
    return pid


def _children(node):
    replies = node.get("replies")
    if isinstance(replies, dict):
        return (replies.get("data") or {}).get("children") or []
    if isinstance(replies, list):
        return replies
    return node.get("children") or []


def flatten(children, post_id, limit, with_replies, out, depth=0):
    """评论树拍平。只有一级评论时 parent_comment_id 为 0。"""
    for raw in children or []:
        if len(out) >= limit:
            return
        if isinstance(raw, dict) and raw.get("kind") not in (None, "t1"):
            continue
        d = _unwrap(raw)
        body = d.get("body") or ""
        if not body or body in ("[deleted]", "[removed]"):
            continue
        kids = _children(d)
        nickname, user_id = author_of(d)
        out.append({
            "comment_id": str(d.get("id", "")), "note_id": post_id, "content": body, "like_count": d.get("score", 0),
            "sub_comment_count": len(kids),
            "parent_comment_id": 0 if depth == 0 else str(d.get("parent_id", "")).replace("t1_", ""),
            "create_time": d.get("created_utc", ""), "nickname": nickname, "user_id": user_id,
        })
        if with_replies and kids:
            flatten(kids, post_id, limit, with_replies, out, depth + 1)


def fetch_comments(post_id, limit, with_replies):
    """返回 (帖子或 None, 评论列表)。"""
    try:
        data = get_json(f"{ARCTIC}/comments/tree", {"link_id": f"t3_{post_id}", "limit": min(max(limit, 1), 25000)})
        out = []
        flatten((data or {}).get("data") or [], post_id, limit, with_replies, out)
        return None, out
    except FetchError as e:
        log(f"  Arctic Shift 评论没取到（{e}），改试 Reddit 自己的接口")
    data = get_json(f"{REDDIT}/comments/{post_id}.json", {"sort": "top", "limit": min(max(limit, 1), 500), "raw_json": 1}, HEADERS)
    if not isinstance(data, list) or len(data) < 2:
        return None, []
    post = (data[0]["data"]["children"] or [{}])[0].get("data")
    out = []
    flatten(data[1]["data"]["children"], post_id, limit, with_replies, out)
    return post, out


def fetch_post(post_id):
    data = get_json(f"{ARCTIC}/posts/ids", {"ids": post_id})
    items = [_unwrap(x) for x in (data or {}).get("data") or []]
    return items[0] if items else None


def run(opts, w):
    sleep = max(opts.get("sleep", 1.0), 2.0)
    want_comments = opts.get("comments", True)
    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            subs, q = split_query(kw)
            per_sub = max(1, opts["max_notes"] // len(subs)) if len(subs) > 1 else opts["max_notes"]
            for sub in subs:
                log(f"搜索 r/{sub}：{q}")
                try:
                    posts = search(sub, q, per_sub)
                except FetchError as e:
                    log(f"  没搜到：{e}")
                    continue
                log(f"  找到 {len(posts)} 个帖子")
                for d in posts[:per_sub]:
                    pid = write_post(w, d, kw)
                    if want_comments and d.get("num_comments"):
                        pause(sleep)
                        _, comments = attempt(f"帖子 {pid} 的评论", fetch_comments, pid, opts["max_comments"], opts.get("sub", False)) or (None, [])
                        for c in comments:
                            w.comment(**c)
                        log(f"  {d.get('title', '')[:40]}：{len(comments)} 条评论")
                pause(sleep)
    else:
        for target in opts["targets"]:
            pid = post_id_of(target)
            if not pid:
                log(f"认不出帖子 ID，跳过：{target}")
                continue
            post, comments = attempt(f"帖子 {pid}", fetch_comments, pid, opts["max_comments"], opts.get("sub", False)) or (None, [])
            if not post:
                try:
                    post = fetch_post(pid)
                except FetchError:
                    post = None
            write_post(w, post or {"id": pid, "title": target}, "")
            for c in comments:
                w.comment(**c)
            log(f"{((post or {}).get('title') or pid)[:40]}：{len(comments)} 条评论")
            pause(sleep)


def probe():
    posts = search("SomebodyMakeThis", "app", 1)
    return f"能连上，搜到：{posts[0].get('title', '')[:40]}" if posts else "能连上，但没搜到结果"
