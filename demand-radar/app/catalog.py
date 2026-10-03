"""需求雷达能抓的平台。

两类：
- browser：用 MediaCrawler 打开真实 Chrome、用你自己的账号登录后抓，第一次要扫码。
- api：走网站公开接口，不用登录。国外的网站在国内要开代理（软件会用系统代理）。
  写了 needs 的平台要先在设置里填对应的 Key（YouTube API key、X 的 Bearer Token）。

每个平台写明支持哪些抓法：
- search：按关键词搜帖子，再抓每条帖子的评论；
- detail：给帖子链接，把评论抓全（深挖）；
- creator：给作者主页链接，抓这个人发的帖子（只有 MediaCrawler 的平台支持）。
"""

PLATFORMS = [
    # id, 名称, 类型, 支持的抓法, 说明
    {"id": "xhs", "name": "小红书", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "笔记和评论，点赞、收藏都有"},
    {"id": "dy", "name": "抖音", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "视频和评论"},
    {"id": "bili", "name": "B站", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "视频和评论，评论区常有长文"},
    {"id": "zhihu", "name": "知乎", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "问答和评论"},
    {"id": "wb", "name": "微博", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "微博和评论"},
    {"id": "tieba", "name": "贴吧", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "帖子和楼层"},
    {"id": "ks", "name": "快手", "kind": "browser", "modes": ["search", "detail", "creator"], "region": "cn",
     "hint": "视频和评论"},
    {"id": "appstore", "name": "App Store 评论", "kind": "api", "modes": ["search", "detail"], "region": "cn",
     "hint": "按关键词找 App，抓用户评分和评论；差评就是现成的需求。国内直连"},
    {"id": "reddit", "name": "Reddit", "kind": "api", "modes": ["search", "detail"], "region": "global",
     "hint": "英文论坛。关键词前加 r/版块名 只搜那个版块，不加就搜设置里的默认版块。需要代理"},
    {"id": "hn", "name": "Hacker News", "kind": "api", "modes": ["search", "detail"], "region": "global",
     "hint": "程序员和创业者社区，Ask HN 里常有人求工具。需要代理"},
    {"id": "github", "name": "GitHub Issues", "kind": "api", "modes": ["search", "detail"], "region": "global",
     "hint": "开源软件的功能请求和 bug，按 👍 数排。国内多数能直连"},
    {"id": "youtube", "name": "YouTube", "kind": "api", "modes": ["search", "detail"], "region": "global", "needs": "youtube_api_key",
     "hint": "视频和评论。要在设置里填 YouTube API key（免费，每天大约能搜 100 次）。需要代理"},
    {"id": "x", "name": "X（推特）", "kind": "api", "modes": ["search", "detail"], "region": "global", "needs": "x_bearer_token",
     "hint": "最近 7 天的推文和回复。要在设置里填 X API 的 Bearer Token（X API 按用量收费）。需要代理"},
    {"id": "web", "name": "任意网页", "kind": "api", "modes": ["detail"], "region": "any",
     "hint": "贴链接抓正文：文章、论坛帖、博客。要登录的页面抓不到"},
]

BY_ID = {p["id"]: p for p in PLATFORMS}

# 各平台的输出目录名（jsonl 写在 <运行目录>/<目录名>/jsonl/ 下）
MC_DIRS = {"xhs": "xhs", "dy": "douyin", "ks": "kuaishou", "bili": "bili", "wb": "weibo", "tieba": "tieba", "zhihu": "zhihu",
           "appstore": "appstore", "reddit": "reddit", "hn": "hn", "github": "github", "web": "web",
           "youtube": "youtube", "x": "x"}

MODES = {
    "search": "按关键词搜索",
    "detail": "贴链接：深挖帖子评论 / 抓网页",
    "creator": "抓指定作者的帖子",
}


def is_browser(pid):
    return BY_ID.get(pid, {}).get("kind") == "browser"


def name_of(pid):
    return BY_ID.get(pid, {}).get("name", pid)
