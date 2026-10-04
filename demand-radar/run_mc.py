"""需求雷达对 MediaCrawler 的启动包装。

放在 MediaCrawler 目录里运行，参数与 main.py 完全相同。
只改几处默认行为，不修改 MediaCrawler 自身文件，方便它 git pull 升级：

1. 默认自己启动一个独立的 Chrome 窗口（每个平台一个独立资料目录，登录状态会保存），
   而不是去连接你已经打开的 Chrome。这样不需要在日常用的 Chrome 里开远程调试。
   如果想用日常 Chrome 的登录状态，先按 MediaCrawler 文档开启远程调试，
   再设置环境变量 RADAR_CONNECT_EXISTING=1。
2. 爬完自动关闭这个独立窗口。
3. 小红书搜索改用综合排序。MediaCrawler 默认按最热排序，搜出来多是高赞的推广帖和段子。
   想换回去就设置 RADAR_XHS_SORT=popularity_descending，按最新排序用 time_descending。
4. 每条日志截到 300 字。MediaCrawler 会把整页搜索结果写进日志，一行几十 KB，
   日志没法看，还会刷出"--- Logging error ---"。数据照常完整写进 jsonl。
   想看完整日志就设置 RADAR_LOG_FULL=1。
5. 打开网页时多等一会儿。MediaCrawler 打开平台首页要等页面完全加载，最多 30 秒。
   小红书首页偶尔有资源一直加载不完，页面其实已经能用，却直接超时退出。
   这里放宽到 90 秒；仍超时、但页面已经解析出来时，记一条警告后继续。
6. 一条请求失败，不再让整次采集退出。MediaCrawler 只在少数地方接住错误：比如小红书某条笔记的评论
   翻到一半，平台返回了验证页（MediaCrawler 读不到它要的字段，抛出 KeyError，重试 3 次后变成
   tenacity.RetryError），这个错误会一路冒到最外层，后面的关键词全都不抓了。这里改成：
   - 某条帖子取详情或评论失败：跳过这条，接着抓；
   - 看起来是被平台拦住了（验证码、限流、IP 或账号被限制）：不再发新请求，正常收尾，
     已经抓到的照常保存；退出码 3，最后一行写明原因和还没抓完的关键词，软件据此显示"没抓完"。
7. 只要多久以内的（RADAR_SINCE=2025-10-01）：抖音搜索按发布时间筛（一天、一周、半年内）。
"""
import asyncio
import json
import logging
import os
import re
import runpy
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

import config  # noqa: E402  MediaCrawler 的配置模块

LOG_LIMIT = 300
NAV_TIMEOUT_MS = 90_000
BLOCKED_EXIT = 3
NAMES = {"xhs": "小红书", "dy": "抖音", "ks": "快手", "bili": "B站", "wb": "微博", "tieba": "贴吧", "zhihu": "知乎"}
# 每个平台：(模块, 爬虫类, 抓一条帖子评论的方法)
COMMENT_TASKS = {
    "xhs": ("media_platform.xhs.core", "XiaoHongShuCrawler", "get_comments"),
    "dy": ("media_platform.douyin.core", "DouYinCrawler", "get_comments"),
    "ks": ("media_platform.kuaishou.core", "KuaishouCrawler", "get_comments"),
    "bili": ("media_platform.bilibili.core", "BilibiliCrawler", "get_comments"),
    "zhihu": ("media_platform.zhihu.core", "ZhihuCrawler", "get_comments"),
    "tieba": ("media_platform.tieba.core", "TieBaCrawler", "get_comments_async_task"),
}
# 这些字样说明是被平台拦住了，再请求只会更糟
BLOCK_WORDS = re.compile(r"captcha|verif|滑块|验证|\b461\b|\b471\b|\b429\b|\b403\b|300011|300012|300013|频繁|频次|限流|"
                         r"security restriction|IPBlockError|PlatformAccessError|blocked", re.I)


def shorten_logs(limit=LOG_LIMIT):
    from tools import utils  # noqa: F401  先让 MediaCrawler 建好日志

    class Shorten(logging.Filter):
        def filter(self, record):
            msg = record.getMessage()
            if len(msg) > limit:
                record.msg = f"{msg[:limit]} …（共 {len(msg)} 字，已截断）"
                record.args = None
            try:
                # Playwright 的 Node 子进程和我们共用 stderr，可能把它改成非阻塞；
                # 这时 tee 来不及读，写日志就会失败。每次写之前改回阻塞。
                os.set_blocking(sys.stderr.fileno(), True)
            except (OSError, ValueError, AttributeError):
                pass
            return True

    for handler in logging.getLogger().handlers:
        handler.addFilter(Shorten())


async def _page_usable(page):
    """导航超时后，页面是否已经打开并解析出来（只是还有资源没加载完）。"""
    try:
        return page.url.startswith("http") and await page.evaluate("document.readyState") != "loading"
    except Exception:
        return False


def tolerate_slow_pages(timeout_ms=NAV_TIMEOUT_MS):
    from playwright.async_api import Page
    from playwright.async_api import TimeoutError as PlaywrightTimeout
    from tools import utils

    original_goto = Page.goto

    async def goto(self, url, **kwargs):
        kwargs.setdefault("timeout", timeout_ms)
        try:
            return await original_goto(self, url, **kwargs)
        except PlaywrightTimeout as err:
            if kwargs.get("wait_until", "load") not in ("load", "networkidle") or not await _page_usable(self):
                raise err
            utils.logger.warning(f"[需求雷达] {url} 等了 {kwargs['timeout'] // 1000} 秒还有资源没加载完，页面已经打开，继续运行")
            return None

    Page.goto = goto


class Guard:
    """记下这次采集跳过了几条、是不是被平台拦住了、哪些关键词没抓完。"""

    def __init__(self, platform):
        self.platform = platform
        self.name = NAMES.get(platform, platform)
        self.blocked = ""
        self.skipped = 0
        self.keyword = ""  # 正在抓的关键词
        self.cut_keywords = []

    def block(self, why):
        if not self.blocked:
            self.blocked = why
            self.cut(self.keyword)  # 正在抓的这个关键词也没抓完
            print(f"[需求雷达] {self.name}拦住了请求（{why}）。不再发新请求，已经抓到的都会保存。", flush=True)

    def cut(self, keyword):
        if keyword and keyword not in self.cut_keywords:
            self.cut_keywords.append(keyword)

    def failed(self, what, exc):
        blocked, why = describe(exc, self.platform)
        if blocked:
            self.block(why)
        else:
            self.skipped += 1
            print(f"[需求雷达] {what}没抓到，跳过，接着抓：{why}", flush=True)

    def report(self):
        """最后一行给软件看（jobs.py 认这个前缀）。"""
        if self.blocked or self.skipped:
            info = {"blocked": self.blocked, "cut_keywords": self.cut_keywords, "skipped": self.skipped}
            print("[需求雷达·结果] " + json.dumps(info, ensure_ascii=False), flush=True)


def describe(exc, platform=""):
    """(像不像被平台拦住, 一句原因)。tenacity 的 RetryError 拆开看最后一次的真实错误。"""
    inner = exc
    last = getattr(exc, "last_attempt", None)
    if last is not None:
        try:
            inner = last.exception() or exc
        except Exception:
            pass
    why = f"{type(inner).__name__}: {inner}"[:200]
    # 小红书的请求函数读不到 success、Verifytype 这些字段时抛 KeyError：拿到的是验证页或限流页，不是正常数据
    blocked = bool(BLOCK_WORDS.search(why)) or (platform == "xhs" and isinstance(inner, KeyError))
    return blocked, why


def _first(args, kwargs, key, index=0):
    return kwargs.get(key) if key in kwargs else (args[index] if len(args) > index else "")


def guard_comments(guard, platform):
    """抓一条帖子的评论失败时跳过这条；被拦住以后不再抓评论。"""
    import importlib
    spec = COMMENT_TASKS.get(platform)
    if not spec:
        return False
    try:
        cls = getattr(importlib.import_module(spec[0]), spec[1])
        original = getattr(cls, spec[2])
    except Exception:
        return False  # MediaCrawler 改了结构：不打补丁，照原样跑

    async def wrapped(self, *args, **kwargs):
        if guard.blocked:
            return None
        try:
            return await original(self, *args, **kwargs)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            guard.failed(f"帖子 {_first(args, kwargs, 'note_id')} 的评论", e)
            return None

    setattr(cls, spec[2], wrapped)
    return True


def guard_xhs_search(guard):
    """小红书：取笔记详情失败只跳过这条；搜索被拦住后，后面的关键词不再请求，记成没抓完。"""
    try:
        from media_platform.xhs.client import XiaoHongShuClient
        from media_platform.xhs.core import XiaoHongShuCrawler
        from media_platform.xhs.exception import DataFetchError
    except Exception:
        return False
    original_detail = XiaoHongShuCrawler.get_note_detail_async_task
    original_search = XiaoHongShuClient.get_note_by_keyword

    async def get_note_detail_async_task(self, *args, **kwargs):
        if guard.blocked:
            return None
        try:
            return await original_detail(self, *args, **kwargs)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            guard.failed(f"笔记 {_first(args, kwargs, 'note_id')} 的详情", e)
            return None

    async def get_note_by_keyword(self, *args, **kwargs):
        keyword = _first(args, kwargs, "keyword")
        if guard.blocked:
            guard.cut(keyword)
            return {}  # MediaCrawler 当成"没有更多了"，换下一个关键词
        guard.keyword = keyword
        try:
            return await original_search(self, *args, **kwargs)
        except (asyncio.CancelledError, DataFetchError):
            raise
        except Exception as e:
            blocked, why = describe(e, "xhs")
            if blocked:
                guard.block(why)
                guard.cut(keyword)
                return {}
            raise DataFetchError(why) from e  # MediaCrawler 接住这个，跳到下一个关键词

    XiaoHongShuCrawler.get_note_detail_async_task = get_note_detail_async_task
    XiaoHongShuClient.get_note_by_keyword = get_note_by_keyword
    return True


def since_days(since):
    """'2025-10-01' 距今几天；不限或格式不对返回 None。"""
    from datetime import datetime
    try:
        return max(0, (datetime.now() - datetime.strptime(since.strip()[:10], "%Y-%m-%d")).days)
    except ValueError:
        return None


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv[:-1] else ""


def main():
    config.CDP_CONNECT_EXISTING = os.environ.get("RADAR_CONNECT_EXISTING", "0") == "1"
    config.AUTO_CLOSE_BROWSER = True
    config.SAVE_LOGIN_STATE = True
    config.SORT_TYPE = os.environ.get("RADAR_XHS_SORT", "general")

    if os.environ.get("RADAR_BROWSER_PATH"):
        # 用 Edge 或装在别处的 Chrome 时，指定浏览器可执行文件路径
        config.CUSTOM_BROWSER_PATH = os.environ["RADAR_BROWSER_PATH"]

    if os.environ.get("RADAR_SLEEP_SEC"):
        config.CRAWLER_MAX_SLEEP_SEC = float(os.environ["RADAR_SLEEP_SEC"])

    # 只要多久以内的：抖音搜索自己能按发布时间筛（一天、一周、半年）；更长的时间段由 merge.py 事后筛
    days = since_days(os.environ.get("RADAR_SINCE", ""))
    if days is not None:
        config.PUBLISH_TIME_TYPE = next((t for t in (1, 7, 180) if days <= t), 0)

    tolerate_slow_pages()

    if os.environ.get("RADAR_DRY_RUN") == "1":
        # 自检用：只打印生效的配置，不启动浏览器
        print("CDP_CONNECT_EXISTING =", config.CDP_CONNECT_EXISTING)
        print("SAVE_LOGIN_STATE =", config.SAVE_LOGIN_STATE)
        print("CRAWLER_MAX_SLEEP_SEC =", config.CRAWLER_MAX_SLEEP_SEC)
        print("SORT_TYPE =", config.SORT_TYPE)
        return

    if os.environ.get("RADAR_LOG_FULL") != "1":
        shorten_logs()

    platform = arg("--platform")
    guard = Guard(platform)
    guard_comments(guard, platform)
    if platform == "xhs":
        guard_xhs_search(guard)

    sys.argv[0] = os.path.join(HERE, "main.py")
    try:
        runpy.run_path(os.path.join(HERE, "main.py"), run_name="__main__")
    finally:
        guard.report()
    if guard.blocked:
        sys.exit(BLOCKED_EXIT)


if __name__ == "__main__":
    main()
