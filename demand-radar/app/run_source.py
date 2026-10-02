"""运行一个免登录数据源。参数和 MediaCrawler 的 main.py 一样，任务管理器可以一视同仁地调用。

  python run_source.py --platform appstore --type search --keywords "记账,待办" \
      --crawler_max_notes_count 10 --max_comments_count_singlenotes 50 --save_data_path 输出目录
  python run_source.py --platform appstore --probe        # 只检查能不能连上
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from sources import SOURCES  # noqa: E402
from sources.common import ERRORS, FetchError, Writer, log, split_targets  # noqa: E402


def yes(v):
    return str(v).lower() in ("yes", "true", "t", "y", "1")


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--platform", required=True, choices=sorted(SOURCES))
    ap.add_argument("--type", default="search", choices=["search", "detail"])
    ap.add_argument("--keywords", default="")
    ap.add_argument("--specified_id", default="")
    ap.add_argument("--crawler_max_notes_count", type=int, default=20)
    ap.add_argument("--max_comments_count_singlenotes", type=int, default=50)
    ap.add_argument("--get_comment", default="yes")
    ap.add_argument("--get_sub_comment", default="no")
    ap.add_argument("--save_data_path", default="")
    ap.add_argument("--probe", action="store_true")
    a = ap.parse_args(argv)
    mod = SOURCES[a.platform]

    if a.probe:
        try:
            log(mod.probe())
            return 0
        except FetchError as e:
            log(f"连不上：{e}")
            return 1

    if not a.save_data_path:
        ap.error("需要 --save_data_path")
    opts = {
        "mode": a.type,
        "keywords": [k.strip() for k in a.keywords.split(",") if k.strip()],
        "targets": split_targets([a.specified_id]),
        "max_notes": max(1, a.crawler_max_notes_count),
        "max_comments": max(0, a.max_comments_count_singlenotes),
        "comments": yes(a.get_comment) and a.max_comments_count_singlenotes > 0,
        "sub": yes(a.get_sub_comment),
        "sleep": float(os.environ.get("RADAR_SLEEP_SEC") or 1.5),
    }
    if opts["mode"] == "search" and not opts["keywords"]:
        ap.error("搜索模式需要 --keywords")
    if opts["mode"] == "detail" and not opts["targets"]:
        ap.error("深挖模式需要 --specified_id")
    w = Writer(a.save_data_path, mod.PLATFORM_DIR, a.type)
    try:
        mod.run(opts, w)
    except FetchError as e:
        log(f"错误：{e}")
        log(f"已保存 {w.counts['contents']} 条帖子、{w.counts['comments']} 条评论")
        return 1
    except KeyboardInterrupt:
        log("已停止")
        return 130
    got = w.counts["contents"] + w.counts["comments"]
    if ERRORS and not got:
        log(f"错误：{len(ERRORS)} 个请求都失败了，什么也没抓到。最后一个：{ERRORS[-1]}")
        return 1
    if ERRORS:
        log(f"有 {len(ERRORS)} 个请求失败，已跳过")
    log(f"完成：{w.counts['contents']} 条帖子、{w.counts['comments']} 条评论")
    return 0


if __name__ == "__main__":
    sys.exit(main())
