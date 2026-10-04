"""X（推特）：用官方 X API v2 搜最近 7 天的推文，再抓每条推文下的回复。只读，要一个 Bearer Token。

- 搜推文：https://api.x.com/2/tweets/search/recent?query=关键词 -is:retweet
  只能搜最近 7 天；关键词可以直接写 X 的搜索语法，比如 "is there an app" lang:en；
- 回复：同一个接口搜 conversation_id:<推文ID>。
X API 按用量收费（每读一条推文都算钱），所以默认只在推文有回复时才去取回复。
Bearer Token 在 developer.x.com 的开发者后台创建应用后拿到，填在软件的 设置 → 抓取用的 Key 里。国内要开代理。
"""
import os
import re
import time

from .common import FetchError, attempt, get_json, iso_to_ts, log, pause, since_date, since_epoch

PLATFORM_DIR = "x"
API = "https://api.x.com/2"
FIELDS = {
    "tweet.fields": "created_at,public_metrics,conversation_id,author_id,lang,referenced_tweets",
    "expansions": "author_id",
    "user.fields": "username,name",
}


def headers():
    token = os.environ.get("RADAR_X_BEARER", "").strip()
    if not token:
        raise FetchError("还没填 X 的 Bearer Token：在 设置 → 抓取用的 Key 里填。X API 要付费（按用量）")
    return {"Authorization": f"Bearer {token}"}


def tweet_id_of(target):
    m = re.search(r"/status(?:es)?/(\d+)", target) or re.fullmatch(r"(\d{5,25})", target.strip())
    return m.group(1) if m else None


def _users(data):
    return {u.get("id"): u.get("username", "") for u in (data.get("includes") or {}).get("users", [])}


def search(q, limit):
    """返回 (推文列表, 作者ID→用户名)。"""
    if "is:retweet" not in q:
        q = f"{q} -is:retweet"
    params = {"query": q, "max_results": min(max(limit, 10), 100), **FIELDS}
    # 最近搜索本来只有 7 天；选的时间更短时再让 X 只给这天以后的
    if since_epoch() and since_epoch() > time.time() - 7 * 86400 + 60:
        params["start_time"] = f"{since_date()}T00:00:00Z"
    data = get_json(f"{API}/tweets/search/recent", params, headers()) or {}
    return data.get("data") or [], _users(data)


def lookup(tid):
    data = get_json(f"{API}/tweets/{tid}", FIELDS, headers()) or {}
    return data.get("data"), _users(data)


def replied_to(t):
    for r in t.get("referenced_tweets") or []:
        if r.get("type") == "replied_to":
            return r.get("id")
    return None


def write_tweet(w, t, users, keyword):
    m = t.get("public_metrics") or {}
    name = users.get(t.get("author_id"), "")
    text = t.get("text", "")
    w.post(
        note_id=t["id"], title=text.replace("\n", " ")[:80], desc=text, liked_count=m.get("like_count", 0),
        comment_count=m.get("reply_count", 0), note_url=f"https://x.com/{name or 'i'}/status/{t['id']}",
        source_keyword=keyword, time=iso_to_ts(t.get("created_at")), nickname=name, user_id=t.get("author_id", ""),
        conversation_id=t.get("conversation_id", ""),
    )
    return m.get("reply_count", 0)


def fetch_replies(root, limit):
    conv = root.get("conversation_id") or root["id"]
    tweets, users = search(f"conversation_id:{conv}", limit)
    out = []
    for t in tweets:
        if t["id"] == root["id"]:
            continue
        parent = replied_to(t)
        m = t.get("public_metrics") or {}
        out.append({
            "comment_id": t["id"], "note_id": root["id"], "content": t.get("text", ""), "like_count": m.get("like_count", 0),
            "sub_comment_count": m.get("reply_count", 0), "parent_comment_id": 0 if parent in (None, root["id"]) else parent,
            "create_time": iso_to_ts(t.get("created_at")), "nickname": users.get(t.get("author_id"), ""),
            "user_id": t.get("author_id", ""),
        })
    return out[:limit]


def run(opts, w):
    headers()  # 没填就直接报错，别每个关键词都失败一遍
    sleep = opts.get("sleep", 1.0)
    want_comments = opts.get("comments", True)

    def with_replies(t, users, keyword):
        n = write_tweet(w, t, users, keyword)
        got = []
        if want_comments and n:
            pause(sleep)
            got = attempt(f"推文 {t['id']} 的回复", fetch_replies, t, opts["max_comments"]) or []
            for c in got:
                w.comment(**c)
        log(f"  {t.get('text', '').replace(chr(10), ' ')[:40]}：{len(got)} 条回复")

    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            log(f"搜索：{kw}")
            found = attempt(f"搜索「{kw}」", search, kw, opts["max_notes"])
            if found is None:
                continue
            tweets, users = found
            log(f"  找到 {len(tweets)} 条推文")
            for t in tweets[: opts["max_notes"]]:
                with_replies(t, users, kw)
            pause(sleep)
    else:
        for target in opts["targets"]:
            tid = tweet_id_of(target)
            if not tid:
                log(f"认不出推文 ID，跳过：{target}")
                continue
            found = attempt(f"推文 {tid}", lookup, tid)
            if found is None:
                continue
            t, users = found
            if t:
                with_replies(t, users, "")
            pause(sleep)


def probe():
    tweets, _ = search("is there an app", 10)
    return f"能连上，搜到：{tweets[0].get('text', '').replace(chr(10), ' ')[:40]}" if tweets else "能连上，但没搜到结果"
