"""需求雷达：把 MediaCrawler 各平台抓到的帖子和评论合并成一张表，并挑出"需求信号"。

用法：python merge.py <一次运行的输出目录>
输入：<目录>/<平台>/jsonl/*_contents_*.jsonl 与 *_comments_*.jsonl（MediaCrawler 的 jsonl 输出）
输出（写在同一目录下）：
  需求信号.csv   命中"求助/缺失/抱怨/付费意愿/附和"等信号的帖子和评论，按得分排序
  全部数据.csv   所有帖子和评论拍平成一张表
  需求信号.xlsx  同"需求信号.csv"（装了 openpyxl 时才生成）
  summary.md     各平台数量、信号分布和得分最高的 50 条
只用 Python 标准库；openpyxl 可选。
"""
import csv
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

PLATFORM_NAMES = {
    "xhs": "小红书", "douyin": "抖音", "dy": "抖音", "bili": "B站", "bilibili": "B站",
    "weibo": "微博", "wb": "微博", "tieba": "贴吧", "zhihu": "知乎", "kuaishou": "快手", "ks": "快手",
}

# 需求信号：(名称, 权重, 正则)。一条文本可以命中多个信号。
SIGNALS = [
    ("求工具", 3, re.compile(r"有没有(什么|哪个|一款|一个|啥|好用的|靠谱的)?.{0,10}(app|APP|App|软件|工具|小程序|网站|插件|平台|应用|神器)|求(推荐|一个|个|款).{0,8}(app|APP|软件|工具|小程序|网站|插件|神器)|什么(app|APP|软件|工具)(可以|能)")),
    ("缺失", 3, re.compile(r"为什么(没有|没人|不能|不支持)|怎么(没有|没人)|竟然没有|居然没有|没(有)?人做|找不到|一直没找到|找了(好久|很久|半天)|市面上没有|到现在都没有|至今没有")),
    ("抱怨现有", 2, re.compile(r"(太|超|巨|真)?(难用|不好用|垃圾|反人类)|广告(太多|好多|满天飞)|开屏广告|强制(更新|登录)|要(开)?会员|收费了|割韭菜|停更|下架了|卸载了|越来越(难用|臃肿)")),
    ("付费意愿", 4, re.compile(r"愿意(付费|花钱|掏钱|买)|付费(也行|也可以|都行)|花钱(也行|都行|也愿意)|多少钱都|谁做.{0,6}(我)?(买|用|付)|第一个(买|用|付费)|求(大佬|大神)?(开发|做一个|做个)|能做出来.{0,6}(买|付)")),
    ("附和", 1, re.compile(r"^\s*(\+1|＋1|同求|同问|蹲|蹲蹲|我也(想要|需要|是|在找)|求求了|一样|me too)", re.I)),
    ("想要", 2, re.compile(r"(要是|如果)有.{0,12}(就好了|多好|该多好)|希望(能)?有(个|一个|一款)|好想要(一个|个)?|谁能(做|开发|搞)(一个|个)?")),
]


def to_int(v):
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return int(v)
    s = str(v).strip().replace(",", "")
    m = re.match(r"^([\d.]+)\s*(万|w|W|千|k|K)?", s)
    if not m:
        return 0
    n = float(m.group(1))
    unit = m.group(2)
    if unit in ("万", "w", "W"):
        n *= 10000
    elif unit in ("千", "k", "K"):
        n *= 1000
    return int(n)


def to_time(v):
    """时间戳（秒或毫秒）或字符串 → 'YYYY-MM-DD HH:MM'。"""
    if v in (None, "", 0, "0"):
        return ""
    try:
        n = float(v)
        if n > 1e12:
            n /= 1000
        return datetime.fromtimestamp(n).strftime("%Y-%m-%d %H:%M")
    except (TypeError, ValueError):
        return str(v)[:16]


def first(d, *keys):
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return ""


def post_id(d):
    return str(first(d, "note_id", "aweme_id", "video_id", "content_id"))


def post_url(platform, d):
    url = first(d, "note_url", "aweme_url", "video_url", "content_url")
    if url:
        return url
    pid = post_id(d)
    if not pid:
        return ""
    return {
        "douyin": f"https://www.douyin.com/video/{pid}",
        "bili": f"https://www.bilibili.com/video/av{pid}",
        "weibo": f"https://m.weibo.cn/detail/{pid}",
        "kuaishou": f"https://www.kuaishou.com/short-video/{pid}",
    }.get(platform, "")


def read_jsonl(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def detect(text):
    hits = []
    score = 0
    for name, weight, rx in SIGNALS:
        if rx.search(text or ""):
            hits.append(name)
            score += weight
    return hits, score


def load(run_dir):
    posts = {}
    items = []
    files = sorted(glob.glob(os.path.join(run_dir, "*", "jsonl", "*.jsonl")))
    # 先读帖子，建立 帖子ID → 标题/链接 的索引
    for path in files:
        platform = os.path.basename(os.path.dirname(os.path.dirname(path)))
        name = os.path.basename(path)
        if "_contents_" not in name:
            continue
        for d in read_jsonl(path):
            pid = post_id(d)
            title = str(first(d, "title", "desc", "content", "content_text"))[:120]
            text = "\n".join(x for x in [str(first(d, "title")), str(first(d, "desc", "content", "content_text"))] if x).strip()
            url = post_url(platform, d)
            posts[(platform, pid)] = {"title": title, "url": url}
            items.append({
                "platform": platform, "kind": "帖子", "text": text, "likes": to_int(first(d, "liked_count", "voteup_count")),
                "replies": to_int(first(d, "comment_count", "comments_count", "video_comment", "total_replay_num")),
                "post_title": title, "url": url, "keyword": first(d, "source_keyword"),
                "time": to_time(first(d, "time", "create_time", "created_time", "publish_time", "create_date_time")),
                "id": pid,
            })
    for path in files:
        platform = os.path.basename(os.path.dirname(os.path.dirname(path)))
        name = os.path.basename(path)
        if "_comments_" not in name:
            continue
        for d in read_jsonl(path):
            pid = post_id(d)
            post = posts.get((platform, pid), {})
            items.append({
                "platform": platform, "kind": "回复" if first(d, "parent_comment_id") not in ("", "0", 0) else "评论",
                "text": str(first(d, "content")).strip(), "likes": to_int(first(d, "like_count", "comment_like_count")),
                "replies": to_int(first(d, "sub_comment_count")), "post_title": post.get("title", ""),
                "url": post.get("url", "") or first(d, "note_url") or post_url(platform, d), "keyword": "",
                "time": to_time(first(d, "create_time", "publish_time", "create_date_time")), "id": str(first(d, "comment_id")),
            })
    return items


def score_items(items):
    for it in items:
        hits, s = detect(it["text"])
        it["signals"] = "、".join(hits)
        # 信号分为主，点赞和回复作为"多少人跟着说"的放大系数
        crowd = min(it["likes"], 5000) ** 0.5 + min(it["replies"], 500) ** 0.5
        it["score"] = round(s * (1 + crowd / 10), 1) if hits else 0
    return items


FIELDS = [("platform_name", "平台"), ("kind", "类型"), ("signals", "需求信号"), ("score", "得分"), ("text", "内容"),
          ("likes", "点赞"), ("replies", "回复数"), ("post_title", "所属帖子"), ("url", "链接"), ("keyword", "搜索词"),
          ("time", "时间")]


def write_csv(path, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow([label for _, label in FIELDS])
        for r in rows:
            w.writerow([r.get(k, "") for k, _ in FIELDS])


def write_xlsx(path, rows):
    try:
        from openpyxl import Workbook
    except ImportError:
        return False
    wb = Workbook()
    ws = wb.active
    ws.title = "需求信号"
    ws.append([label for _, label in FIELDS])
    for r in rows:
        ws.append([r.get(k, "") for k, _ in FIELDS])
    widths = {"A": 8, "B": 6, "C": 18, "D": 8, "E": 80, "F": 8, "G": 8, "H": 40, "I": 40, "J": 16, "K": 17}
    for col, w in widths.items():
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "A2"
    wb.save(path)
    return True


def write_summary(path, run_dir, items, signal_rows):
    by_platform = Counter(r["platform_name"] for r in items)
    sig_platform = Counter(r["platform_name"] for r in signal_rows)
    sig_type = Counter(s for r in signal_rows for s in r["signals"].split("、") if s)
    lines = [f"# 需求雷达结果：{os.path.basename(os.path.abspath(run_dir))}", ""]
    lines.append("| 平台 | 抓到的帖子和评论 | 命中需求信号 |")
    lines.append("|---|---|---|")
    for p, n in by_platform.most_common():
        lines.append(f"| {p} | {n} | {sig_platform.get(p, 0)} |")
    lines.append("")
    lines.append("| 信号 | 条数 |")
    lines.append("|---|---|")
    for s, n in sig_type.most_common():
        lines.append(f"| {s} | {n} |")
    lines.append("")
    lines.append("## 得分最高的 50 条")
    lines.append("")
    for r in signal_rows[:50]:
        text = r["text"].replace("\n", " ")[:140]
        lines.append(f"- **{r['score']}** · {r['platform_name']} · {r['signals']} · 赞 {r['likes']}：{text}")
        if r["post_title"] and r["kind"] != "帖子":
            lines.append(f"  - 所属帖子：{r['post_title'][:60]} {r['url']}")
        elif r["url"]:
            lines.append(f"  - {r['url']}")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main(run_dir):
    if not os.path.isdir(run_dir):
        print(f"找不到目录：{run_dir}")
        return 1
    items = load(run_dir)
    if not items:
        print(f"{run_dir} 里没有找到 MediaCrawler 的 jsonl 数据。确认爬虫是否成功运行、是否用了 --save_data_option jsonl。")
        return 1
    for it in items:
        it["platform_name"] = PLATFORM_NAMES.get(it["platform"], it["platform"])
    score_items(items)
    # 同一平台同一段文字只保留一条（多个关键词可能搜到同一帖子）
    seen = set()
    uniq = []
    for it in items:
        key = (it["platform"], it["kind"], it["text"][:200])
        if key in seen or not it["text"]:
            continue
        seen.add(key)
        uniq.append(it)
    signal_rows = sorted([r for r in uniq if r["score"] > 0], key=lambda r: (-r["score"], -r["likes"]))
    all_rows = sorted(uniq, key=lambda r: (r["platform_name"], r["kind"], -r["likes"]))
    write_csv(os.path.join(run_dir, "需求信号.csv"), signal_rows)
    write_csv(os.path.join(run_dir, "全部数据.csv"), all_rows)
    has_xlsx = write_xlsx(os.path.join(run_dir, "需求信号.xlsx"), signal_rows)
    write_summary(os.path.join(run_dir, "summary.md"), run_dir, uniq, signal_rows)
    print(f"共 {len(uniq)} 条帖子和评论，其中 {len(signal_rows)} 条命中需求信号。")
    print("输出：需求信号.csv、全部数据.csv、summary.md" + ("、需求信号.xlsx" if has_xlsx else ""))
    for r in signal_rows[:10]:
        print(f"  [{r['score']}] {r['platform_name']} {r['signals']} 赞{r['likes']}：{r['text'].replace(chr(10), ' ')[:60]}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
