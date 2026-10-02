"""任意网页：贴链接，把正文抓下来（文章、论坛帖、博客都行）。

装了 trafilatura 就用它提取正文（准确很多），没装就粗略去掉 HTML 标签。
只抓公开能看的页面；要登录或者全靠 JavaScript 渲染的页面抓不到正文，这类请用对应平台的抓法。
"""
import hashlib
import re
import urllib.request

from .common import FetchError, USER_AGENT, _opener, log, pause, strip_html

PLATFORM_DIR = "web"


def fetch_html(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT.replace(" demand-radar/0.3 (personal research)", ""),
                                               "Accept": "text/html,application/xhtml+xml"})
    try:
        with _opener().open(req, timeout=30) as resp:
            raw = resp.read()
            charset = resp.headers.get_content_charset() or ""
    except Exception as e:
        raise FetchError(f"打不开：{url}（{e}）") from e
    if not charset:
        m = re.search(rb'charset=["\']?([\w-]+)', raw[:4000])
        charset = m.group(1).decode() if m else "utf-8"
    return raw.decode(charset, errors="replace")


def extract(html_text, url=""):
    """返回 (标题, 正文)。"""
    title = ""
    m = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.S | re.I)
    if m:
        title = strip_html(m.group(1)).strip()
    try:
        import trafilatura
        text = trafilatura.extract(html_text, url=url, include_comments=True, favor_recall=True) or ""
        if text:
            return title, text
    except ImportError:
        pass
    body = re.sub(r"<(script|style|noscript|nav|footer|header)\b.*?</\1>", "", html_text, flags=re.S | re.I)
    return title, strip_html(body)


def run(opts, w):
    for url in opts["targets"]:
        if not re.match(r"https?://", url):
            log(f"不是网址，跳过：{url}")
            continue
        try:
            title, text = extract(fetch_html(url), url)
        except FetchError as e:
            log(str(e))
            continue
        w.post(note_id=hashlib.md5(url.encode()).hexdigest()[:16], title=title or url, desc=text[:20000],
               liked_count=0, comment_count=0, note_url=url, source_keyword="")
        log(f"{title[:40] or url}：{len(text)} 字")
        pause(opts.get("sleep", 1.0))


def probe():
    try:
        import trafilatura  # noqa: F401
        return "可用（已装 trafilatura，正文提取更准）"
    except ImportError:
        return "可用（没装 trafilatura，只能粗略提取正文）"
