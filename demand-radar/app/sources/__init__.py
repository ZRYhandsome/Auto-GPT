"""免登录数据源。每个模块提供 PLATFORM_DIR、run(opts, writer) 和 probe()。"""
from . import appstore, github, hn, reddit, web, x, youtube

SOURCES = {"appstore": appstore, "reddit": reddit, "hn": hn, "github": github, "web": web, "youtube": youtube, "x": x}
