"""GitHub Issues：开源软件里用户提的功能请求和抱怨，按 👍 数排。

- 搜索：https://api.github.com/search/issues?q=关键词+is:issue&sort=reactions-+1&order=desc
  关键词可以用 GitHub 的搜索语法，比如 "dark mode label:enhancement" 或 "repo:owner/name"。
- 评论：issue 的 comments_url

不登录每小时只能请求 60 次（搜索每分钟 10 次）。在设置里填一个 GitHub Token 可以提到每小时 5000 次。
"""
import os
import re

from .common import attempt, get_json, log, pause, since_date

PLATFORM_DIR = "github"
API = "https://api.github.com"


def headers():
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("RADAR_GITHUB_TOKEN", "").strip()
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def issue_of(target):
    """'https://github.com/owner/repo/issues/12' → ('owner', 'repo', '12')"""
    m = re.search(r"github\.com/([^/\s]+)/([^/\s]+)/(?:issues|pull)/(\d+)", target)
    return m.groups() if m else None


def thumbs(d):
    r = d.get("reactions") or {}
    return r.get("+1", 0) or 0


def search(q, limit):
    query = q if re.search(r"\bis:(issue|pr)\b", q) else f"{q} is:issue"
    if since_date() and "created:" not in query:
        query += f" created:>={since_date()}"  # 只要这天以后开的 issue
    data = get_json(f"{API}/search/issues", {"q": query, "sort": "reactions-+1", "order": "desc", "per_page": min(max(limit, 1), 100)}, headers())
    return (data or {}).get("items", [])


def user_of(d):
    """(登录名, 数字 ID)。注销的账号 GitHub 显示成 ghost，记成空。"""
    u = d.get("user") or {}
    if not u.get("login") or u["login"] == "ghost":
        return "", ""
    return u["login"], str(u.get("id") or "")


def repo_name(d):
    url = d.get("repository_url") or ""
    return "/".join(url.rstrip("/").split("/")[-2:])


def write_issue(w, d, keyword):
    login, uid = user_of(d)
    w.post(
        note_id=str(d["id"]), title=f"[{repo_name(d)}] {d.get('title', '')}", desc=(d.get("body") or "")[:4000],
        liked_count=thumbs(d), comment_count=d.get("comments", 0), note_url=d.get("html_url", ""),
        source_keyword=keyword, time=d.get("created_at", "")[:16].replace("T", " "), state=d.get("state", ""),
        nickname=login, user_id=uid,
    )


def fetch_comments(d, limit):
    if not d.get("comments"):
        return []
    rows = get_json(d["comments_url"], {"per_page": min(max(limit, 1), 100)}, headers()) or []
    out = []
    for c in rows[:limit]:
        login, uid = user_of(c)
        out.append({
            "comment_id": str(c["id"]), "note_id": str(d["id"]), "content": c.get("body") or "", "like_count": thumbs(c),
            "sub_comment_count": 0, "parent_comment_id": 0, "create_time": (c.get("created_at") or "")[:16].replace("T", " "),
            "nickname": login, "user_id": uid,
        })
    return out


def run(opts, w):
    sleep = max(opts.get("sleep", 1.0), 1.0)
    want_comments = opts.get("comments", True)
    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            log(f"搜索：{kw}")
            items = attempt(f"搜索「{kw}」", search, kw, opts["max_notes"]) or []
            log(f"  找到 {len(items)} 个 issue")
            for d in items[: opts["max_notes"]]:
                write_issue(w, d, kw)
                if want_comments:
                    for c in attempt(f"#{d.get('number')} 的评论", fetch_comments, d, opts["max_comments"]) or []:
                        w.comment(**c)
                    pause(sleep)
            pause(max(sleep, 6.0))  # 搜索接口每分钟 10 次
    else:
        for target in opts["targets"]:
            parts = issue_of(target)
            if not parts:
                log(f"认不出 issue 链接，跳过：{target}")
                continue
            owner, repo, num = parts
            d = attempt(f"{owner}/{repo}#{num}", get_json, f"{API}/repos/{owner}/{repo}/issues/{num}", headers=headers())
            if not d:
                continue
            write_issue(w, d, "")
            comments = attempt(f"{owner}/{repo}#{num} 的评论", fetch_comments, d, opts["max_comments"]) or []
            for c in comments:
                w.comment(**c)
            log(f"{owner}/{repo}#{num}：{len(comments)} 条评论")
            pause(sleep)


def probe():
    data = get_json(f"{API}/rate_limit", headers=headers())
    core = ((data or {}).get("resources") or {}).get("core") or {}
    return f"能连上，本小时还能请求 {core.get('remaining', '?')} 次"
