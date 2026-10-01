"""需求雷达：把 MediaCrawler 各平台抓到的帖子和评论合并成一张表，并挑出"需求信号"。

用法：python merge.py <一次运行的输出目录>
输入：<目录>/<平台>/jsonl/*_contents_*.jsonl 与 *_comments_*.jsonl（MediaCrawler 的 jsonl 输出）
输出（写在同一目录下）：
  需求信号.csv   命中需求信号的帖子和评论，按得分排序
  按帖子汇总.csv 每个帖子的评论区命中了多少需求、有多少人求安卓或鸿蒙版
  全部数据.csv   所有帖子和评论拍平成一张表
  需求信号.xlsx  上面前两张表各占一页（装了 openpyxl 时才生成）
  summary.md     各平台、各搜索词的命中情况，得分最高的 50 条，值得深挖的帖子，全部命中的原文
只用 Python 标准库；openpyxl 可选。
"""
import csv
import glob
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

PLATFORM_NAMES = {
    "xhs": "小红书", "douyin": "抖音", "dy": "抖音", "bili": "B站", "bilibili": "B站",
    "weibo": "微博", "wb": "微博", "tieba": "贴吧", "zhihu": "知乎", "kuaishou": "快手", "ks": "快手",
}
# radar.sh -p 用的平台简称（MediaCrawler 的输出目录名 → 命令行参数）
PLATFORM_ARGS = {"xhs": "xhs", "douyin": "dy", "dy": "dy", "bili": "bili", "bilibili": "bili", "weibo": "wb",
                 "wb": "wb", "tieba": "tieba", "zhihu": "zhihu", "kuaishou": "ks", "ks": "ks"}

PRODUCT = r"(app|软件|工具|小程序|网站|插件|平台|应用|神器|系统|功能|产品)"
OTHER_OS = r"(安卓|android|鸿蒙|华为|荣耀|小米|vivo|oppo|三星|windows|win版|电脑版|电脑端|pc版|mac|ipad|平板|网页版|watch|手表|ios|苹果|iphone|全平台)"

# 需求信号：(名称, 权重, 只看评论, 正则)。一条文本可以命中多个信号。
SIGNALS = [
    ("求工具", 3, False, re.compile(
        r"有没有(?!人会|会|人教|人能教)(那种|什么|哪个|一款|一个|啥|好用的|靠谱的|免费的)?.{0,20}" + PRODUCT
        + r"|求(推荐|一个|个|款).{0,8}" + PRODUCT + r"|什么(app|软件|工具)(可以|能)|哪个(app|软件|ai).{0,6}(适合|可以|能|好用)", re.I)),
    ("缺失", 3, False, re.compile(
        r"为什么(就是|都|还|一直)?(没有|没人|不能|不支持)|怎么(就是|都|还|一直)?没(有)?人(做|开发)|竟然没有|居然没有|一直没找到|找了(好久|很久|半天|一圈)"
        r"|市面上(都|也)?没有|到现在(都|也)?没有|至今没有|找不到(好用|合适|满意|一个|一款|这样|类似)"
        r"|没(有)?人(做|开发)(过)?[^，。,.！!？?\s]{0,6}" + PRODUCT, re.I)),
    ("抱怨现有", 2, False, re.compile(
        r"难用|(?<!好用)不好用|垃圾|反人类|广告(太多|好多|满天飞|多到)|开屏广告|广告.{0,12}(忍无可忍|受不了|烦死)|强制(更新|登录|升级)"
        r"|(还|都)?要(开)?会员|要收费|收费了|不免费了|割韭菜|停更|下架了|倒闭了|(停止|暂停)运营|越来越(难用|臃肿|贵)"
        r"|bug(一堆|较多|太多|很多)", re.I)),
    ("痛点", 1, False, re.compile(
        r"(每次|总是|老是|经常)(都)?(会)?(忘|记不住|记不得|不记得|找不到)|记不住|记不得|太麻烦|好麻烦|很麻烦|麻烦死|费劲|浪费(好多)?时间"
        r"|(只能|现在都|一直)(自己)?(拿|用)(备忘录|excel|表格|笔记|截图)|手动(记|整理|统计|复制)", re.I)),
    ("付费意愿", 4, False, re.compile(
        r"愿意(付费|花钱|掏钱|买|出钱)|付费(也行|也可以|都行|支持)|已付费|可付费|花钱(也行|都行|也愿意)|多少钱都"
        r"|谁做.{0,6}(我)?(买|用|付)|第一个(买|用|付费)|能做出来.{0,6}(买|付)|早鸟", re.I)),
    ("想要", 2, False, re.compile(
        r"(要是|如果).{0,25}(就好了|多好|该多好|就更好|就更完美|就完美)|希望(能|可以)?有(个|一个|一款)|好想要|想要(一?个|一款)"
        r"|(太|超级?|非常|真的?|很|好)需要(这个|这种|这样)?|我也需要|应该(出|有|做)(一个|个|一款)|能不能有(一个|个)"
        r"|谁能(做|开发|搞)(一个|个)?|求(大佬|大神)?(开发|做)(一个|个)", re.I)),
    ("改进建议", 1, True, re.compile(
        r"能不能|能否|可不可以|可以(加|出|增加|支持|添加|设计)|有没有可能(加|出|做)|(以后|后续|之后)(会|能)(提供|出|加|支持|有)"
        r"|希望.{0,12}(可以|能|加|增加|添加|支持|出)|建议(加|增加|出|做)|会考虑(增加|加|出)|能(把|加|出).{0,20}(吗|么|嘛)", re.I)),
    ("求其他平台", 2, True, re.compile(
        r"(蹲|求|等|待|期待|坐等|想要|什么时候|啥时候|何时|会(做|出|有)|出个|做个|搞个|有没有|在哪|快(上|出)|支持|没有|没找到|搜不到"
        r"|下载不了|能(用|装|下))[^，。,.]{0,6}" + OTHER_OS
        + r"|" + OTHER_OS + r"[^，。,.]{0,8}(在哪|呢|吗|嘛|么|快|什么时候|啥时候|版本|蹲|求|等|没有|没找到|搜不到|下载不了|能用|可以|会做|出(吗|嘛|么|没)|上线|[!！?？])"
        r"|(降低|放宽|降到).{0,8}(版本|系统|ios)|(出|开发|做|有)(个)?(英文|中文|繁体)版", re.I)),
    ("附和", 1, True, re.compile(r"^\s*(\+1|＋1|同求|同问|蹲|我也(想要|需要|是|在找|想)|求求了|一样|me too|太需要了)", re.I)),
    ("找人开发", 2, False, re.compile(
        r"(找人|找个人|求人|求大佬|求大神|谁会|有没有会|有没有人会|需要找).{0,6}(开发|做|写|设计)|(想|需要|急需|要)(开发|做)(一个|个).{0,10}(小程序|app|软件|网站|系统)"
        r"|(开发|做)(一个|个)?.{0,8}(多少钱|怎么收费|大概要)|求.{0,4}(小程序|app|软件|系统)开发|有没有接的|礼貌问价|招.{0,6}(开发|程序员|技术)"
        r"|能做.{0,12}(小程序|app|软件|系统)吗", re.I)),
]
# 评论区回答"你想要什么 app"时，往往只写一个点子，没有求助的字眼。这类评论单独记一个信号。
ANSWER = ("回应征集", 2)

# 帖子类型：先认"征集需求"，再认"求助"，再认"推广"；都不是就算"其他"。
POST_SOLICIT = re.compile(r"(为什么|怎么)(就是|都|还|一直)?(没有|没)(人)?(做|开发)|没(有)?人做|需求(很大|没人)|有需求的|什么需求|个需求|想要什么|希望有|你希望|最想要|想要的(app|软件)|缺(一个|什么)"
                          r"|许愿|理想(的|中的)?(app|软件)|等了(很多|好多|好几|多少)?年|要是有(这个|这样的|这种|个|一个)?.{0,8}就好了|(大家|你)(都)?(很|最|非常)?(想要|需要)"
                          r"|(很|非常|超级?|真的)需要.{0,16}(没有|没人)|还没(有)?被(发明|做)出来|现实(中|里)?没有|说说你", re.I)
# 征集帖标题里自带具体点子（"为什么没人做一个老人专用的防诈骗 app"）；没有的就是泛泛地问"大家想要什么"，本身不是需求
SPECIFIC_IDEA = re.compile(r"(一个|一款|个|款)[^，。,.？?！!]{2,}" + PRODUCT, re.I)
POST_ASK = re.compile(r"^求|(?<!需)求(推荐|一个|个|款|助)|有没有|有什么(好用|推荐|软件|app)|哪个(app|软件|好用)|推荐一下|跪求|急需|(?<!需)求.{0,6}(开发|app|软件|小程序)"
                      r"|谁能(做|开发|推荐)|招.{0,6}(开发|程序员|技术)", re.I)
POST_PROMO = re.compile(r"我(们)?(自己)?(独立)?(做|开发|写|搞|设计)(了|出)(一个|个|一款|款)?|上线(啦|了)|上架|开源了|内测|vibe ?coding|宝藏(app|软件|应用)"
                        r"|(app|软件)(分享|推荐)|安利|种草|神器|邀请码|会员码|月入|接单|只做定制|外包|永久会员|天才(app|软件)|发现(一个|一款)|眼前一亮|必备(app|软件)", re.I)
# 帖子本身的权重：推广帖不是需求，只看它的评论区
TYPE_WEIGHT = {"征集需求": 1.0, "求助": 1.0, "其他": 0.5, "推广": 0.2}
GENERIC_WEIGHT = 0.3  # 泛泛的征集帖本身
# 评论按所属帖子加权：征集帖下的评论就是点子；推广帖下多是对某个现成产品的反馈
COMMENT_WEIGHT = {"征集需求": 1.2, "求助": 1.0, "其他": 1.0, "推广": 0.7}

# 评论里的引流、接单、发邀请码，不算需求
AD = re.compile(r"欢迎咨询|长期合作|可以合作|私聊|私信|随时滴滴|滴滴(我|看|私)|接单|全栈|外包|专业对接|价格(都)?好说|感兴趣(的)?(可|欢迎)|有需要(的)?(可以)?(找|联系|滴|私)"
                r"|我们这边可以|我给你做|我可以(帮你)?做|邀请码|会员码|好友码|进群|加群|群聊|看主页|主页看|vx|wx|微信搜|xhslink|https?://"
                # 开发者在征集帖下推广自己的产品
                r"|体验(下|一下)|欢迎(各位|大家)?(试用|体验|使用|下载)|(要不|可以)?来试试|试试我(们)?的|我(们)?(已经|自己)?(做|写|开发)(了|好了|过)(一?个|一款|款)"
                r"|我(们)?已经做好了|我有做|我(们)?做的|看我(自己)?做的|康康我的|我(们)?(公司)?(在|正在)(做|制作|开发)|我们的能|app ?store ?搜", re.I)
# 回应征集帖时，这些是在问博主问题，不是在提需求
ASK_AUTHOR = re.compile(r"怎么下载|叫什么|在哪|哪里下|链接|多少钱|收费|免费|要钱|会员|求带|求图|求资料|求文档|@|博主|作者|怎么(做|弄|画|生成)的|怎么生成|学习一下", re.I)
# 只是叫好、附和的短评，不是点子
REACTION = re.compile(r"^(发现宝藏|宝藏|太强了|好强|好棒|厉害|牛|学到了|收藏|码住|mark|好可爱|期待|哈哈|笑死|确实|同意|支持|赞|有道理|说得对|真的|绝了|蹲|看起来|不错)", re.I)
# 征集帖下推荐现成产品的评论：说明已经有人做了，不算新点子
RECOMMEND = re.compile(r"(?<![求请])(推荐|安利)|搜.{1,15}(试试|即可|就行|就有)", re.I)
EMOJI = re.compile(r"\[[^\[\]]{1,8}\]")
JOKE = re.compile(r"\[doge\]")  # 小红书里带狗头的多半是玩笑


def to_int(v):
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return int(v)
    s = str(v).strip().replace(",", "")
    m = re.match(r"^([\d.]+)\s*(万|w|W|千|k|K)?", s)
    if not m:
        return 0
    try:
        n = float(m.group(1))
    except ValueError:
        return 0
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


def post_type(title, desc):
    # "对的但是没人做！"这种段子也会命中"没人做"，所以还要求标题在说产品、需求或生意
    if POST_SOLICIT.search(title) and re.search(PRODUCT + "|需求|点子|赛道|生意|项目|东西|发明", title, re.I):
        return "征集需求"
    if POST_ASK.search(title):
        return "求助"
    if POST_PROMO.search(title + "\n" + desc[:300]):
        return "推广"
    return "其他"


def detect(text, kind, parent=None):
    """返回 (命中的信号名列表, 信号分)。parent 是评论所属帖子的 {"type", "title"}。"""
    text = text or ""
    is_comment = kind != "帖子"
    hits = []
    score = 0
    for name, weight, comment_only, rx in SIGNALS:
        if comment_only and not is_comment:
            continue
        if rx.search(text):
            hits.append(name)
            score += weight
    # 只有一级评论算回应征集：楼中楼多是在评论别人的点子（"没盈利没人搞的""有安全隐患"）
    if (kind == "评论" and parent and parent.get("type") == "征集需求"
            and not AD.search(text) and not ASK_AUTHOR.search(text) and not RECOMMEND.search(text)):
        plain = EMOJI.sub("", text).strip()
        if len(plain) < 10 and REACTION.search(plain):
            plain = ""
        # 帖子标题里有"app/软件/产品"时，评论区几乎都在报点子；否则要求评论自己提到产品
        if len(plain) >= 4 and (re.search(PRODUCT, parent.get("title", ""), re.I) or re.search(PRODUCT, plain, re.I)):
            hits.append(ANSWER[0])
            score += ANSWER[1]
    if "附和" in hits and len(hits) > 1:
        # "蹲安卓"这类已经算进别的信号，附和不再重复加分
        hits.remove("附和")
        score -= 1
    return hits, min(score, 8)


def load(run_dir):
    posts = {}
    items = []
    files = sorted(glob.glob(os.path.join(run_dir, "*", "jsonl", "*.jsonl")))
    # 先读帖子，建立 帖子ID → 标题/链接/类型 的索引
    for path in files:
        platform = os.path.basename(os.path.dirname(os.path.dirname(path)))
        name = os.path.basename(path)
        if "_contents_" not in name:
            continue
        for d in read_jsonl(path):
            pid = post_id(d)
            title = str(first(d, "title", "desc", "content", "content_text"))[:120]
            desc = str(first(d, "desc", "content", "content_text"))
            text = "\n".join(x for x in [str(first(d, "title")), desc] if x).strip()
            url = post_url(platform, d)
            keyword = str(first(d, "source_keyword"))
            key = (platform, pid)
            if key in posts:
                # 同一帖子被多个关键词搜到：只记关键词，不重复加
                if keyword:
                    posts[key]["keywords"].add(keyword)
                continue
            ptype = post_type(title, desc)
            posts[key] = {"title": title, "url": url, "type": ptype, "keywords": {keyword} if keyword else set()}
            items.append({
                "platform": platform, "kind": "帖子", "text": text, "likes": to_int(first(d, "liked_count", "voteup_count")),
                "replies": to_int(first(d, "comment_count", "comments_count", "video_comment", "total_replay_num")),
                "post_title": title, "post_type": ptype, "url": url, "keyword": keyword,
                "time": to_time(first(d, "time", "create_time", "created_time", "publish_time", "create_date_time")),
                "id": pid, "post_id": pid,
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
                "post_type": post.get("type", ""),
                "url": post.get("url", "") or first(d, "note_url") or post_url(platform, d),
                "keyword": "、".join(sorted(post.get("keywords", ()))),
                "time": to_time(first(d, "create_time", "publish_time", "create_date_time")), "id": str(first(d, "comment_id")),
                "post_id": pid,
            })
    for it in items:
        if it["kind"] == "帖子":
            it["keyword"] = "、".join(sorted(posts[(it["platform"], it["post_id"])]["keywords"]))
    return items, posts


def crowd(likes, replies):
    """点赞和回复代表"多少人跟着说"。取对数：1 万赞不该比 10 赞重要一千倍。"""
    return math.log2(1 + likes) + 0.5 * math.log2(1 + replies)


def score_items(items, posts):
    for it in items:
        parent = posts.get((it["platform"], it["post_id"]))
        hits, s = detect(it["text"], it["kind"], parent)
        it["signals"] = "、".join(hits)
        if not hits or (it["kind"] != "帖子" and AD.search(it["text"])):
            it["score"] = 0
            continue
        if it["kind"] == "帖子":
            # 帖子：评论多说明话题有共鸣；推广帖本身不是需求，大幅降权
            score = s * TYPE_WEIGHT.get(it["post_type"], 0.5) * (1 + (math.log2(1 + it["replies"]) + 0.5 * math.log2(1 + it["likes"])) / 6)
            if it["post_type"] == "征集需求" and not SPECIFIC_IDEA.search(it["post_title"]):
                score *= GENERIC_WEIGHT
        else:
            score = s * COMMENT_WEIGHT.get(it["post_type"], 1.0) * (1 + crowd(it["likes"], it["replies"]) / 4)
        if JOKE.search(it["text"]):
            score *= 0.6
        it["score"] = round(score, 1)
    return items


def summarize_posts(items, posts):
    """按帖子汇总评论区的需求信号，找出值得深挖的帖子。"""
    by_post = defaultdict(list)
    post_rows = {}
    for it in items:
        key = (it["platform"], it["post_id"])
        if it["kind"] == "帖子":
            post_rows[key] = it
        else:
            by_post[key].append(it)
    rows = []
    for key, post in post_rows.items():
        comments = by_post.get(key, [])
        hits = [c for c in comments if c["score"] > 0]
        other_os = [c for c in hits if "求其他平台" in c["signals"]]
        top = sorted(hits, key=lambda c: -c["score"])[:3]
        total = round(sum(c["score"] for c in hits) + post["score"], 1)
        rows.append({
            "platform_name": post["platform_name"], "platform": post["platform"], "post_title": post["post_title"],
            "post_type": post["post_type"], "likes": post["likes"], "replies": post["replies"], "crawled": len(comments),
            "hit_comments": len(hits), "other_os": len(other_os), "other_os_likes": sum(c["likes"] for c in other_os),
            "total": total, "top": " | ".join(EMOJI.sub("", c["text"]).replace("\n", " ")[:60] for c in top),
            "url": post["url"], "keyword": "、".join(sorted(posts.get(key, {}).get("keywords", ()))),
            "post_id": post["post_id"], "hits": sorted(([post] if post["score"] > 0 else []) + hits, key=lambda c: -c["score"]),
        })
    rows.sort(key=lambda r: (-r["total"], -r["replies"]))
    return rows


def deep_crawled(run_dir):
    """深挖模式抓过的帖子链接（radar.sh -d 写在 posts_used.txt 里）。"""
    path = os.path.join(run_dir, "posts_used.txt")
    if not os.path.exists(path):
        return ""
    with open(path, encoding="utf-8") as f:
        return f.read()


def deep_dive_candidates(post_rows, limit=5, done=""):
    """评论区命中多、但平台上的评论数远多于已抓数量的帖子：值得用深挖模式把评论抓全。done 里出现过的帖子已经深挖过，不再推荐。"""
    rows = [r for r in post_rows if r["url"] and r["replies"] >= 3 * max(r["crawled"], 1) and not (r["post_id"] and r["post_id"] in done)]
    picks = [r for r in rows if r["hit_comments"] >= 2 and r["post_type"] != "推广"]
    picks += [r for r in rows if r["hit_comments"] >= 3 and r["post_type"] == "推广"]
    return picks[:limit]


FIELDS = [("platform_name", "平台"), ("kind", "类型"), ("signals", "需求信号"), ("score", "得分"), ("text", "内容"),
          ("likes", "点赞"), ("replies", "回复数"), ("post_title", "所属帖子"), ("post_type", "帖子类型"), ("url", "链接"),
          ("keyword", "搜索词"), ("time", "时间")]
POST_FIELDS = [("platform_name", "平台"), ("post_title", "帖子"), ("post_type", "帖子类型"), ("total", "信号总分"),
               ("hit_comments", "命中评论"), ("crawled", "已抓评论"), ("replies", "平台评论数"), ("other_os", "求其他平台"),
               ("other_os_likes", "求其他平台点赞"), ("likes", "帖子点赞"), ("top", "代表评论"), ("url", "链接"),
               ("keyword", "搜索词")]


def write_csv(path, rows, fields=FIELDS):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow([label for _, label in fields])
        for r in rows:
            w.writerow([r.get(k, "") for k, _ in fields])


def write_xlsx(path, signal_rows, post_rows):
    try:
        from openpyxl import Workbook
    except ImportError:
        return False
    wb = Workbook()
    sheets = [
        ("需求信号", FIELDS, signal_rows, [8, 6, 18, 8, 80, 8, 8, 40, 9, 40, 16, 17]),
        ("按帖子汇总", POST_FIELDS, post_rows, [8, 40, 9, 9, 9, 9, 10, 10, 13, 9, 80, 40, 16]),
    ]
    for i, (title, fields, rows, widths) in enumerate(sheets):
        ws = wb.active if i == 0 else wb.create_sheet()
        ws.title = title
        ws.append([label for _, label in fields])
        for r in rows:
            ws.append([r.get(k, "") for k, _ in fields])
        for col, w in enumerate(widths):
            ws.column_dimensions[chr(ord("A") + col)].width = w
        ws.freeze_panes = "A2"
    wb.save(path)
    return True


def write_summary(path, run_dir, items, signal_rows, post_rows, deep):
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

    kw_stats = defaultdict(lambda: [0, 0, 0, 0.0])  # 帖子、评论、命中、得分
    for r in items:
        for kw in (r["keyword"] or "").split("、"):
            if not kw:
                continue
            st = kw_stats[kw]
            st[0 if r["kind"] == "帖子" else 1] += 1
            if r["score"] > 0:
                st[2] += 1
                st[3] += r["score"]
    if kw_stats:
        lines.append("## 各搜索词的效果")
        lines.append("")
        lines.append("命中少、得分低的搜索词，下次可以换掉。")
        lines.append("")
        lines.append("| 搜索词 | 帖子 | 评论 | 命中 | 得分合计 |")
        lines.append("|---|---|---|---|---|")
        for kw, (np_, nc, nh, sc) in sorted(kw_stats.items(), key=lambda x: -x[1][3]):
            lines.append(f"| {kw} | {np_} | {nc} | {nh} | {sc:.0f} |")
        lines.append("")

    lines.append("## 得分最高的 50 条")
    lines.append("")
    for r in signal_rows[:50]:
        text = r["text"].replace("\n", " ")[:140]
        lines.append(f"- **{r['score']}** · {r['platform_name']}{r['kind']} · {r['signals']} · 赞 {r['likes']}：{text}")
        if r["post_title"] and r["kind"] != "帖子":
            lines.append(f"  - 所属帖子（{r['post_type']}）：{r['post_title'][:60]} {r['url']}")
        elif r["url"]:
            lines.append(f"  - {r['post_type']}帖 {r['url']}")
    lines.append("")

    lines.append("## 评论区需求最多的帖子")
    lines.append("")
    lines.append("| 帖子 | 类型 | 命中评论 / 已抓 / 平台评论数 | 求其他平台 | 代表评论 |")
    lines.append("|---|---|---|---|---|")
    for r in [p for p in post_rows if p["hit_comments"] > 0][:20]:
        title = r["post_title"].replace("\n", " ").replace("|", "/")[:30]
        top = r["top"].replace("|", "/")[:90]
        os_ = f"{r['other_os']} 条 / {r['other_os_likes']} 赞" if r["other_os"] else ""
        lines.append(f"| [{title}]({r['url']}) | {r['post_type']} | {r['hit_comments']} / {r['crawled']} / {r['replies']} | {os_} | {top} |")
    lines.append("")

    if deep:
        here = os.path.dirname(os.path.abspath(__file__))
        lines.append("## 值得深挖的帖子")
        lines.append("")
        lines.append("这些帖子评论区命中多，但平台上的评论远多于这次抓到的。用深挖模式把评论和楼中楼抓全：")
        lines.append("")
        by_platform_deep = defaultdict(list)
        for r in deep:
            by_platform_deep[PLATFORM_ARGS.get(r["platform"], r["platform"])].append(r)
            lines.append(f"- {r['post_title'][:40]}（{r['hit_comments']} 条命中，平台共 {r['replies']} 条评论）")
        lines.append("")
        lines.append("```bash")
        for p, rows in by_platform_deep.items():
            lines.append(f'"{here}/radar.sh" -p {p} -d "{",".join(r["url"] for r in rows)}"')
        lines.append("```")
        lines.append("")

    # 附上全部命中的原文：把这个文件发给别人（或 Claude）分析时，不用再附表格
    lines.append("## 全部命中（按帖子分组）")
    lines.append("")
    for r in [p for p in post_rows if p["hits"]]:
        title = r["post_title"].replace("\n", " ")[:60]
        lines.append(f"### {r['platform_name']}·{r['post_type']}：{title}")
        lines.append(f"帖子赞 {r['likes']}，平台评论 {r['replies']}，已抓 {r['crawled']}，命中 {r['hit_comments']}。{r['url']}")
        lines.append("")
        for c in r["hits"]:
            text = c["text"].replace("\n", " ")[:300]
            lines.append(f"- [{c['score']}] {c['kind']} · {c['signals']} · 赞 {c['likes']} · 回复 {c['replies']}：{text}")
        lines.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main(run_dir):
    if not os.path.isdir(run_dir):
        print(f"找不到目录：{run_dir}")
        return 1
    items, posts = load(run_dir)
    if not items:
        print(f"{run_dir} 里没有找到 MediaCrawler 的 jsonl 数据。确认爬虫是否成功运行、是否用了 --save_data_option jsonl。")
        return 1
    for it in items:
        it["platform_name"] = PLATFORM_NAMES.get(it["platform"], it["platform"])
    # 去重：有 ID 按 ID（不同帖子下的同一句"蹲安卓"要分别计数），没有 ID 按文字
    seen = set()
    uniq = []
    for it in items:
        key = (it["platform"], it["kind"], it["id"] or it["text"][:200])
        if key in seen or not it["text"]:
            continue
        seen.add(key)
        uniq.append(it)
    score_items(uniq, posts)
    signal_rows = sorted([r for r in uniq if r["score"] > 0], key=lambda r: (-r["score"], -r["likes"]))
    all_rows = sorted(uniq, key=lambda r: (r["platform_name"], r["post_id"], r["kind"] != "帖子", -r["likes"]))
    post_rows = summarize_posts(uniq, posts)
    deep = deep_dive_candidates(post_rows, done=deep_crawled(run_dir))
    write_csv(os.path.join(run_dir, "需求信号.csv"), signal_rows)
    write_csv(os.path.join(run_dir, "按帖子汇总.csv"), post_rows, POST_FIELDS)
    write_csv(os.path.join(run_dir, "全部数据.csv"), all_rows)
    has_xlsx = write_xlsx(os.path.join(run_dir, "需求信号.xlsx"), signal_rows, post_rows)
    write_summary(os.path.join(run_dir, "summary.md"), run_dir, uniq, signal_rows, post_rows, deep)
    print(f"共 {len(uniq)} 条帖子和评论，其中 {len(signal_rows)} 条命中需求信号。")
    print("输出：需求信号.csv、按帖子汇总.csv、全部数据.csv、summary.md" + ("、需求信号.xlsx" if has_xlsx else ""))
    for r in signal_rows[:10]:
        print(f"  [{r['score']}] {r['platform_name']}{r['kind']} {r['signals']} 赞{r['likes']}：{r['text'].replace(chr(10), ' ')[:60]}")
    if deep:
        print(f"有 {len(deep)} 个帖子值得深挖（评论区命中多，但只抓了一小部分评论），命令见 summary.md。")
    print(f"想让 Claude 帮你分析，把这个文件发给它就行（含全部命中的原文和点赞数）：{os.path.abspath(os.path.join(run_dir, 'summary.md'))}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
