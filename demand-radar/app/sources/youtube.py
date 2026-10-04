"""YouTube：用官方 YouTube Data API v3 按关键词搜视频，再抓评论。只读，要一个 API key。

- 搜视频：https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=关键词&key=KEY
  每次搜索花 100 点配额，免费配额每天 10000 点，也就是每天大约能搜 100 次；
- 视频点赞、评论数：/videos?part=snippet,statistics&id=ID1,ID2（1 点）；
- 评论：/commentThreads?part=snippet,replies&videoId=ID（1 点，一次最多 100 条）。
API key 在 Google Cloud 控制台免费申请（启用 YouTube Data API v3 → 凭据 → 创建 API 密钥），
填在软件的 设置 → 抓取用的 Key 里。国内要开代理。
"""
import os
import re

from .common import FetchError, attempt, get_json, iso_to_ts, log, pause, since_date

PLATFORM_DIR = "youtube"
API = "https://www.googleapis.com/youtube/v3"


def key():
    k = os.environ.get("RADAR_YOUTUBE_KEY", "").strip()
    if not k:
        raise FetchError("还没填 YouTube API key：在 设置 → 抓取用的 Key 里填（Google Cloud 控制台免费申请）")
    return k


def video_id_of(target):
    t = target.strip()
    m = (re.search(r"[?&]v=([\w-]{11})", t) or re.search(r"youtu\.be/([\w-]{11})", t)
         or re.search(r"/(?:shorts|embed|live)/([\w-]{11})", t) or re.fullmatch(r"([\w-]{11})", t))
    return m.group(1) if m else None


def call(path, params):
    return get_json(f"{API}/{path}", {**params, "key": key()}) or {}


def search(q, limit):
    params = {"part": "snippet", "type": "video", "q": q, "maxResults": min(max(limit, 1), 50), "order": "relevance"}
    if since_date():
        params["publishedAfter"] = f"{since_date()}T00:00:00Z"  # 只要这天以后发的视频
    data = call("search", params)
    return [x["id"]["videoId"] for x in data.get("items", []) if (x.get("id") or {}).get("videoId")]


def videos(ids):
    if not ids:
        return []
    return call("videos", {"part": "snippet,statistics", "id": ",".join(ids)}).get("items", [])


def write_video(w, v, keyword):
    sn, st = v.get("snippet") or {}, v.get("statistics") or {}
    w.post(
        note_id=v["id"], title=sn.get("title", ""), desc=(sn.get("description") or "")[:4000],
        liked_count=int(st.get("likeCount") or 0), comment_count=int(st.get("commentCount") or 0),
        note_url=f"https://www.youtube.com/watch?v={v['id']}", source_keyword=keyword,
        time=iso_to_ts(sn.get("publishedAt")), nickname=sn.get("channelTitle", ""), user_id=sn.get("channelId", ""),
    )
    return int(st.get("commentCount") or 0)


def _comment(c, vid, parent):
    sn = c.get("snippet") or {}
    return {
        "comment_id": c.get("id", ""), "note_id": vid, "content": sn.get("textOriginal") or sn.get("textDisplay") or "",
        "like_count": int(sn.get("likeCount") or 0), "parent_comment_id": parent, "create_time": iso_to_ts(sn.get("publishedAt")),
        "nickname": sn.get("authorDisplayName", ""), "user_id": (sn.get("authorChannelId") or {}).get("value", ""),
    }


def fetch_comments(vid, limit, with_replies, sleep=0):
    """按相关度取一级评论（每页最多 100 条），with_replies 时把接口顺带给的几条回复也记下。"""
    out, token = [], None
    while len(out) < limit:
        params = {"part": "snippet,replies", "videoId": vid, "maxResults": min(100, limit - len(out)),
                  "order": "relevance", "textFormat": "plainText"}
        if token:
            params["pageToken"] = token
        data = call("commentThreads", params)
        for t in data.get("items", []):
            top = (t.get("snippet") or {}).get("topLevelComment") or {}
            row = _comment(top, vid, 0)
            row["sub_comment_count"] = int((t.get("snippet") or {}).get("totalReplyCount") or 0)
            out.append(row)
            if with_replies:
                for r in (t.get("replies") or {}).get("comments", []):
                    out.append({**_comment(r, vid, top.get("id", "")), "sub_comment_count": 0})
        token = data.get("nextPageToken")
        if not token or not data.get("items"):
            break
        pause(sleep)
    return out


def run(opts, w):
    key()  # 没填就直接报错，别每个关键词都失败一遍
    sleep = opts.get("sleep", 1.0)
    want_comments = opts.get("comments", True)

    def with_comments(v, keyword):
        n = write_video(w, v, keyword)
        got = []
        if want_comments and n:
            pause(sleep)
            got = attempt(f"视频 {v['id']} 的评论", fetch_comments, v["id"], opts["max_comments"], opts.get("sub", False), sleep) or []
            for c in got:
                w.comment(**c)
        log(f"  {((v.get('snippet') or {}).get('title') or v['id'])[:40]}：{len(got)} 条评论")

    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            log(f"搜索：{kw}")
            ids = attempt(f"搜索「{kw}」", search, kw, opts["max_notes"])
            if ids is None:
                continue
            log(f"  找到 {len(ids)} 个视频")
            for v in attempt("视频信息", videos, ids) or []:
                with_comments(v, kw)
            pause(sleep)
    else:
        ids = []
        for target in opts["targets"]:
            vid = video_id_of(target)
            if vid:
                ids.append(vid)
            else:
                log(f"认不出视频 ID，跳过：{target}")
        for i in range(0, len(ids), 50):
            for v in attempt("视频信息", videos, ids[i:i + 50]) or []:
                with_comments(v, "")
            pause(sleep)


def probe():
    ids = search("is there an app", 1)
    if not ids:
        return "能连上，但没搜到结果"
    v = videos(ids[:1])
    return f"能连上，搜到：{((v[0].get('snippet') or {}).get('title') or ids[0])[:40]}" if v else "能连上"
