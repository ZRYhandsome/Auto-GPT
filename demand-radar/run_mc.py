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
"""
import logging
import os
import runpy
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

import config  # noqa: E402  MediaCrawler 的配置模块

LOG_LIMIT = 300
NAV_TIMEOUT_MS = 90_000


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

    sys.argv[0] = os.path.join(HERE, "main.py")
    runpy.run_path(os.path.join(HERE, "main.py"), run_name="__main__")


if __name__ == "__main__":
    main()
