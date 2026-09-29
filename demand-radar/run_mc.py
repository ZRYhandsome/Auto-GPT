"""需求雷达对 MediaCrawler 的启动包装。

放在 MediaCrawler 目录里运行，参数与 main.py 完全相同。
只改两处默认行为，不修改 MediaCrawler 自身文件，方便它 git pull 升级：

1. 默认自己启动一个独立的 Chrome 窗口（每个平台一个独立资料目录，登录状态会保存），
   而不是去连接你已经打开的 Chrome。这样不需要在日常用的 Chrome 里开远程调试。
   如果想用日常 Chrome 的登录状态，先按 MediaCrawler 文档开启远程调试，
   再设置环境变量 RADAR_CONNECT_EXISTING=1。
2. 爬完自动关闭这个独立窗口。
"""
import os
import runpy
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

import config  # noqa: E402  MediaCrawler 的配置模块

config.CDP_CONNECT_EXISTING = os.environ.get("RADAR_CONNECT_EXISTING", "0") == "1"
config.AUTO_CLOSE_BROWSER = True
config.SAVE_LOGIN_STATE = True

if os.environ.get("RADAR_BROWSER_PATH"):
    # 用 Edge 或装在别处的 Chrome 时，指定浏览器可执行文件路径
    config.CUSTOM_BROWSER_PATH = os.environ["RADAR_BROWSER_PATH"]

if os.environ.get("RADAR_SLEEP_SEC"):
    config.CRAWLER_MAX_SLEEP_SEC = float(os.environ["RADAR_SLEEP_SEC"])

if os.environ.get("RADAR_DRY_RUN") == "1":
    # 自检用：只打印生效的配置，不启动浏览器
    print("CDP_CONNECT_EXISTING =", config.CDP_CONNECT_EXISTING)
    print("SAVE_LOGIN_STATE =", config.SAVE_LOGIN_STATE)
    print("CRAWLER_MAX_SLEEP_SEC =", config.CRAWLER_MAX_SLEEP_SEC)
    sys.exit(0)

sys.argv[0] = os.path.join(HERE, "main.py")
runpy.run_path(os.path.join(HERE, "main.py"), run_name="__main__")
