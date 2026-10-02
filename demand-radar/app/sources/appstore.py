"""App Store：按关键词找 App，再抓用户评论（评分、标题、正文、"有用"票数）。

用苹果公开的接口，不用登录，国内直连：
- 搜 App：https://itunes.apple.com/search?term=关键词&country=cn&entity=software
- 评论先试老的 RSS 接口（带"有用"票数）：
  https://itunes.apple.com/cn/rss/customerreviews/page=1/id=<App ID>/sortby=mostrecent/json
  每页 50 条，最多 10 页。有报告说它从 2026 年 8 月下旬起返回空列表，这时改用
  App Store 网页版自己用的接口（没有"有用"票数）：
  https://apps.apple.com/api/apps/v1/catalog/cn/apps/<App ID>/reviews?platform=web&limit=20&offset=0
  再不行就从 App 网页里取出临时令牌，调 amp-api.apps.apple.com。三个都没数据时会在日志里写清楚。

一个 App 记成一条"帖子"（点赞数 = 评分人数），它的评论记成"评论"（点赞数 = 觉得有用的票数）。
评论开头加上【几星】，差评一眼能看出来。
"""
import os
import re

from .common import FetchError, attempt, get_json, log, pause

PLATFORM_DIR = "appstore"
COUNTRY = os.environ.get("RADAR_APPSTORE_COUNTRY", "cn")


def app_id_of(target):
    """'https://apps.apple.com/cn/app/xx/id1050106939' / 'id1050106939' / '1050106939' → ('1050106939', 'cn')"""
    m = re.search(r"apps\.apple\.com/([a-z]{2})/", target)
    country = m.group(1) if m else COUNTRY
    m = re.search(r"id(\d{6,})", target) or re.fullmatch(r"(\d{6,})", target.strip())
    return (m.group(1), country) if m else (None, country)


def search_apps(term, limit, country=COUNTRY):
    data = get_json("https://itunes.apple.com/search", {"term": term, "country": country, "entity": "software", "limit": min(max(limit, 1), 50)})
    return (data or {}).get("results", [])


def lookup(app_id, country=COUNTRY):
    data = get_json("https://itunes.apple.com/lookup", {"id": app_id, "country": country})
    results = (data or {}).get("results", [])
    return results[0] if results else None


def _label(entry, key):
    v = entry.get(key)
    if isinstance(v, dict):
        if "label" in v:
            return v["label"]
        if "name" in v and isinstance(v["name"], dict):
            return v["name"].get("label", "")
    return v if isinstance(v, str) else ""


def parse_reviews(feed_json):
    """把评论 RSS 的 JSON 转成 [{id, rating, title, content, votes, vote_count, version, updated, author}]。"""
    entries = ((feed_json or {}).get("feed") or {}).get("entry") or []
    if isinstance(entries, dict):  # 只有一条时不是列表
        entries = [entries]
    out = []
    for e in entries:
        rating = _label(e, "im:rating")
        if not rating:  # 老格式第一条是 App 本身的信息
            continue
        out.append({
            "id": _label(e, "id"),
            "rating": int(rating or 0),
            "title": _label(e, "title"),
            "content": _label(e, "content"),
            "votes": int(_label(e, "im:voteSum") or 0),
            "vote_count": int(_label(e, "im:voteCount") or 0),
            "version": _label(e, "im:version"),
            "updated": _label(e, "updated"),
            "author": _label(e, "author"),
        })
    return out


def parse_catalog_reviews(data):
    """网页版接口的格式：{"data": [{"id", "attributes": {"rating", "title", "review", "userName", "date"}}], "next": ...}"""
    out = []
    for d in (data or {}).get("data") or []:
        a = d.get("attributes") or {}
        if "rating" not in a:
            continue
        out.append({"id": str(d.get("id", "")), "rating": int(a.get("rating") or 0), "title": a.get("title", ""),
                    "content": a.get("review", ""), "votes": 0, "vote_count": 0, "version": "",
                    "updated": a.get("date", ""), "author": a.get("userName", "")})
    return out


WEB_HEADERS = {"Origin": "https://apps.apple.com", "Referer": "https://apps.apple.com/",
               "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15"}


def _rss_reviews(app_id, limit, country, sleep):
    got = []
    for sort in ("mosthelpful", "mostrecent"):
        for page in range(1, 11):
            if len(got) >= limit:
                return got
            url = f"https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby={sort}/json"
            try:
                batch = parse_reviews(get_json(url))
            except FetchError as e:
                log(f"  评论第 {page} 页没取到：{e}")
                break
            known = {r["id"] for r in got}
            batch = [r for r in batch if r["id"] not in known]
            if not batch:
                break
            got.extend(batch)
            pause(sleep)
        if got:  # "最有用"排序取到了就不再按时间补
            break
    return got


def _web_token(app_id, country):
    """App 网页里带着网页版接口用的临时令牌（URL 编码的 JSON 里的 token 字段）。"""
    import urllib.parse
    import urllib.request
    from .common import _opener
    req = urllib.request.Request(f"https://apps.apple.com/{country}/app/id{app_id}", headers={"User-Agent": WEB_HEADERS["User-Agent"]})
    with _opener().open(req, timeout=25) as resp:
        page = resp.read().decode("utf-8", errors="replace")
    m = re.search(r'name="web-experience-app/config/environment" content="([^"]+)"', page)
    text = urllib.parse.unquote(m.group(1)) if m else page
    m = re.search(r'"token"\s*:\s*"(eyJ[^"]+)"', text)
    return m.group(1) if m else None


def _web_reviews(app_id, limit, country, sleep):
    got = []
    endpoints = [(f"https://apps.apple.com/api/apps/v1/catalog/{country}/apps/{app_id}/reviews", WEB_HEADERS)]
    try:
        token = _web_token(app_id, country)
    except Exception:  # 取令牌失败就只用第一个接口
        token = None
    if token:
        endpoints.append((f"https://amp-api.apps.apple.com/v1/catalog/{country}/apps/{app_id}/reviews",
                          {**WEB_HEADERS, "Authorization": f"Bearer {token}"}))
    for url, headers in endpoints:
        offset = 0
        while len(got) < limit:
            try:
                batch = parse_catalog_reviews(get_json(url, {"platform": "web", "limit": 20, "offset": offset}, headers, retries=2))
            except FetchError as e:
                log(f"  网页版评论接口没取到：{e}")
                break
            known = {r["id"] for r in got}
            fresh = [r for r in batch if r["id"] not in known]
            if not fresh:  # 没有新评论了（或者接口不认翻页参数）
                break
            got.extend(fresh)
            offset += len(batch)
            pause(sleep)
        if got:
            break
    return got


def fetch_reviews(app_id, limit, country=COUNTRY, sleep=1.0):
    got = _rss_reviews(app_id, limit, country, sleep)
    if not got and limit > 0:
        log("  老评论接口没有数据，改用网页版接口")
        got = _web_reviews(app_id, limit, country, sleep)
        if not got:
            log("  两个评论接口都没取到评论（可能苹果又改了接口）。App 本身的信息已保存。")
    return got[:limit]


def write_app(w, app, keyword, country):
    app_id = str(app.get("trackId"))
    w.post(
        note_id=app_id,
        title=app.get("trackName", ""),
        desc=f"{app.get('sellerName', '')} · {app.get('primaryGenreName', '')} · 评分 {app.get('averageUserRating', 0):.1f}（{app.get('userRatingCount', 0)} 人） · {app.get('formattedPrice', '')}\n"
             + (app.get("description") or "")[:600],
        liked_count=app.get("userRatingCount", 0),
        comment_count=app.get("userRatingCount", 0),
        note_url=app.get("trackViewUrl") or f"https://apps.apple.com/{country}/app/id{app_id}",
        source_keyword=keyword,
        time=app.get("currentVersionReleaseDate", ""),
        rating=app.get("averageUserRating", 0),
    )
    return app_id


def write_reviews(w, app_id, reviews):
    for r in reviews:
        text = f"【{r['rating']}星】{r['title']}\n{r['content']}".strip()
        w.comment(
            comment_id=r["id"], note_id=app_id, content=text, like_count=r["votes"], sub_comment_count=0,
            parent_comment_id=0, create_time=r["updated"][:16].replace("T", " "), rating=r["rating"], version=r["version"],
        )


def run(opts, w):
    sleep = opts.get("sleep", 1.0)
    want_comments = opts.get("comments", True)
    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            log(f"搜索 App：{kw}")
            apps = attempt(f"搜索「{kw}」", search_apps, kw, opts["max_notes"]) or []
            log(f"  找到 {len(apps)} 个 App")
            for app in apps[: opts["max_notes"]]:
                app_id = write_app(w, app, kw, COUNTRY)
                if want_comments:
                    reviews = fetch_reviews(app_id, opts["max_comments"], COUNTRY, sleep)
                    write_reviews(w, app_id, reviews)
                    log(f"  {app.get('trackName')}：{len(reviews)} 条评论")
                pause(sleep)
    else:
        for target in opts["targets"]:
            app_id, country = app_id_of(target)
            if not app_id:
                log(f"认不出 App ID，跳过：{target}")
                continue
            app = attempt(f"查找 {target}", lookup, app_id, country)
            if not app:
                log(f"这个区的 App Store 里找不到：{target}")
                continue
            write_app(w, app, "", country)
            reviews = fetch_reviews(app_id, opts["max_comments"], country, sleep)
            write_reviews(w, app_id, reviews)
            log(f"{app.get('trackName')}：{len(reviews)} 条评论")
            pause(sleep)


def probe():
    apps = search_apps("记账", 1)
    return f"能连上，搜到 {apps[0].get('trackName')}" if apps else "能连上，但没搜到结果"
