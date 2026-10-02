"""merge.py 的离线测试：用仿照 MediaCrawler 各平台 jsonl 字段的模拟数据。运行：python -m unittest discover tests"""
import csv
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import merge  # noqa: E402

FIXTURES = {
    "xhs": {
        "contents": [{"note_id": "n1", "title": "有没有app可以帮我记住衣柜里的衣服", "desc": "试了好几个都要会员", "liked_count": "1.2万",
                      "comment_count": "356", "note_url": "https://www.xiaohongshu.com/explore/n1", "source_keyword": "有没有app可以", "time": 1758000000000},
                     # 开发者推广帖：点赞再高，帖子本身也不该排到真实需求前面
                     {"note_id": "n2", "title": "我做了一个记账App，终于上线啦", "desc": "市面上没有好用的记账软件，所以自己做了一个", "liked_count": "10万+",
                      "comment_count": "3000", "note_url": "https://www.xiaohongshu.com/explore/n2", "source_keyword": "有没有app可以", "time": 1758000000000},
                     # 和需求无关的爆款：标题里有"没人做"也不算
                     {"note_id": "n3", "title": "对的但是没人做！", "desc": "#搞笑", "liked_count": "10万+", "comment_count": "7062",
                      "note_url": "https://www.xiaohongshu.com/explore/n3", "source_keyword": "为什么没有人做", "time": 1758000000000}],
        "comments": [
            {"comment_id": "c1", "note_id": "n1", "content": "同求！！", "like_count": "88", "sub_comment_count": "2", "create_time": 1758000100000, "parent_comment_id": 0},
            {"comment_id": "c2", "note_id": "n1", "content": "谁做出来我第一个买，现在的都太难用了", "like_count": "240", "sub_comment_count": "5", "create_time": 1758000200000, "parent_comment_id": 0},
            {"comment_id": "c3", "note_id": "n1", "content": "好看", "like_count": "3", "sub_comment_count": "0", "create_time": 1758000300000, "parent_comment_id": 0},
            {"comment_id": "c4", "note_id": "n1", "content": "蹲安卓", "like_count": "5", "sub_comment_count": "0", "create_time": 1758000400000, "parent_comment_id": 0},
            # 推广帖下的评论：同样的"蹲安卓"要单独计数；引流广告不算需求
            {"comment_id": "p1", "note_id": "n2", "content": "蹲安卓", "like_count": "300", "sub_comment_count": "40", "create_time": 1758000500000, "parent_comment_id": 0},
            {"comment_id": "p2", "note_id": "n2", "content": "安卓什么时候出", "like_count": "20", "sub_comment_count": "1", "create_time": 1758000600000, "parent_comment_id": 0},
            {"comment_id": "p3", "note_id": "n2", "content": "有没有想做小程序的老板，欢迎咨询", "like_count": "0", "sub_comment_count": "0", "create_time": 1758000700000, "parent_comment_id": 0},
        ],
    },
    "douyin": {
        "contents": [{"aweme_id": "a1", "title": "", "desc": "为什么没有人做一个老人专用的防诈骗app", "liked_count": "5000", "comment_count": "800",
                      "aweme_url": "https://www.douyin.com/video/a1", "source_keyword": "为什么没有人做", "create_time": 1758000000}],
        "comments": [{"comment_id": "d1", "aweme_id": "a1", "content": "要是有这种软件就好了，我妈天天接诈骗电话", "like_count": 1200,
                      "sub_comment_count": 30, "create_time": 1758000500, "parent_comment_id": "0"}],
    },
    "bili": {
        "contents": [{"video_id": "123", "title": "我受不了了自己写了个工具", "desc": "", "liked_count": "300", "video_comment": "45",
                      "video_url": "https://www.bilibili.com/video/av123", "source_keyword": "一直没找到好用的", "create_time": 1758000000}],
        "comments": [{"comment_id": "b1", "video_id": "123", "content": "求开源！愿意付费", "like_count": "60", "sub_comment_count": "1", "create_time": 1758000600, "parent_comment_id": "0"}],
    },
    "weibo": {
        "contents": [{"note_id": "w1", "content": "开屏广告太多了，有没有什么软件能一键跳过", "liked_count": "999", "comments_count": "120",
                      "note_url": "https://m.weibo.cn/detail/w1", "source_keyword": "有没有软件可以", "create_date_time": "2026-09-20 10:00:00"}],
        "comments": [{"comment_id": "wc1", "note_id": "w1", "content": "+1", "comment_like_count": "15", "sub_comment_count": "0", "create_date_time": "2026-09-20 11:00:00"}],
    },
    "tieba": {
        "contents": [{"note_id": "t1", "title": "求推荐一个软件 能批量改文件名", "desc": "", "note_url": "https://tieba.baidu.com/p/t1", "total_replay_num": 12,
                      "publish_time": "2026-09-01 08:00", "source_keyword": "求推荐一个软件"}],
        "comments": [{"comment_id": "tc1", "note_id": "t1", "note_url": "https://tieba.baidu.com/p/t1", "content": "找了很久都没有合适的", "sub_comment_count": 0, "publish_time": "2026-09-01 09:00"}],
    },
    "zhihu": {
        "contents": [{"content_id": "z1", "content_type": "answer", "title": "独立开发者如何找需求", "content_text": "市面上没有好用的需求挖掘工具",
                      "content_url": "https://www.zhihu.com/answer/z1", "voteup_count": 2300, "comment_count": 150, "created_time": 1758000000, "source_keyword": "为什么没有人做"}],
        "comments": [{"comment_id": "zc1", "content_id": "z1", "content": "希望能有一个自动找痛点的工具", "like_count": 45, "sub_comment_count": 3, "publish_time": 1758001000, "parent_comment_id": ""}],
    },
    "kuaishou": {
        "contents": [{"video_id": "k1", "title": "测评", "desc": "普通视频", "liked_count": "10", "video_url": "https://www.kuaishou.com/short-video/k1", "create_time": 1758000000}],
        "comments": [{"comment_id": "kc1", "video_id": "k1", "content": "不错", "sub_comment_count": "0", "create_time": 1758000000}],
    },
}


def build_run_dir(root):
    for platform, data in FIXTURES.items():
        d = os.path.join(root, platform, "jsonl")
        os.makedirs(d)
        for kind, rows in data.items():
            with open(os.path.join(d, f"search_{kind}_2026-09-29.jsonl"), "w", encoding="utf-8") as f:
                for r in rows:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")
                    if platform == "xhs" and kind == "contents":
                        # 同一帖子被两个关键词搜到，应去重
                        f.write(json.dumps(r, ensure_ascii=False) + "\n")


def read_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


class MergeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        build_run_dir(self.tmp.name)
        self.assertEqual(merge.main(self.tmp.name), 0)
        self.signals = read_csv(os.path.join(self.tmp.name, "需求信号.csv"))
        self.all = read_csv(os.path.join(self.tmp.name, "全部数据.csv"))
        self.posts = read_csv(os.path.join(self.tmp.name, "按帖子汇总.csv"))
        with open(os.path.join(self.tmp.name, "summary.md"), encoding="utf-8") as f:
            self.summary = f.read()

    def tearDown(self):
        self.tmp.cleanup()

    def test_outputs_exist(self):
        for name in ["需求信号.csv", "按帖子汇总.csv", "全部数据.csv", "summary.md"]:
            self.assertTrue(os.path.exists(os.path.join(self.tmp.name, name)), name)

    def test_all_platforms_loaded_and_deduped(self):
        platforms = {r["平台"] for r in self.all}
        self.assertEqual(platforms, {"小红书", "抖音", "B站", "微博", "贴吧", "知乎", "快手"})
        xhs_posts = [r for r in self.all if r["平台"] == "小红书" and r["类型"] == "帖子"]
        self.assertEqual(len(xhs_posts), 3)
        # 不同帖子下的同一句"蹲安卓"按评论 ID 去重，两条都要保留
        self.assertEqual(len([r for r in self.all if r["内容"] == "蹲安卓"]), 2)

    def test_signals_detected(self):
        by_text = {r["内容"]: r for r in self.signals}
        self.assertIn("付费意愿", by_text["谁做出来我第一个买，现在的都太难用了"]["需求信号"])
        self.assertIn("抱怨现有", by_text["谁做出来我第一个买，现在的都太难用了"]["需求信号"])
        self.assertIn("附和", by_text["同求！！"]["需求信号"])
        self.assertIn("附和", by_text["+1"]["需求信号"])
        self.assertIn("想要", by_text["要是有这种软件就好了，我妈天天接诈骗电话"]["需求信号"])
        self.assertIn("缺失", by_text["找了很久都没有合适的"]["需求信号"])
        self.assertIn("想要", by_text["希望能有一个自动找痛点的工具"]["需求信号"])
        self.assertIn("求其他平台", by_text["安卓什么时候出"]["需求信号"])
        self.assertNotIn("好看", by_text)
        self.assertNotIn("不错", by_text)
        # 引流广告、和需求无关的爆款不进需求表
        self.assertNotIn("有没有想做小程序的老板，欢迎咨询", by_text)
        self.assertFalse(any(t.startswith("对的但是没人做") for t in by_text))

    def test_post_types_and_solicited_answers(self):
        types = {r["内容"].split("\n")[0]: r["帖子类型"] for r in self.all if r["类型"] == "帖子"}
        self.assertEqual(types["有没有app可以帮我记住衣柜里的衣服"], "求助")
        self.assertEqual(types["我做了一个记账App，终于上线啦"], "推广")
        self.assertEqual(types["为什么没有人做一个老人专用的防诈骗app"], "征集需求")
        self.assertEqual(types["对的但是没人做！"], "其他")
        # 征集帖下的评论就算没有求助字眼，也记一个"回应征集"
        d1 = next(r for r in self.signals if r["内容"].startswith("要是有这种软件"))
        self.assertIn("回应征集", d1["需求信号"])
        self.assertEqual(d1["帖子类型"], "征集需求")

    def test_likes_parsed_and_links_joined(self):
        post = next(r for r in self.all if r["平台"] == "小红书" and r["类型"] == "帖子" and r["内容"].startswith("有没有app"))
        self.assertEqual(post["点赞"], "12000")
        c = next(r for r in self.signals if r["内容"] == "同求！！")
        self.assertEqual(c["链接"], "https://www.xiaohongshu.com/explore/n1")
        self.assertTrue(c["所属帖子"].startswith("有没有app可以"))
        self.assertEqual(c["搜索词"], "有没有app可以")
        w = next(r for r in self.signals if r["内容"] == "+1")
        self.assertEqual(w["点赞"], "15")

    def test_ranking_prefers_real_demand_over_popularity(self):
        scores = [float(r["得分"]) for r in self.signals]
        self.assertEqual(scores, sorted(scores, reverse=True))
        rank = {r["内容"]: i for i, r in enumerate(self.signals)}
        # 征集帖下千赞的点子排第一；10 万赞的推广帖排在真实需求后面
        self.assertTrue(self.signals[0]["内容"].startswith("要是有这种软件就好了"))
        promo = next(i for t, i in rank.items() if t.startswith("我做了一个记账App"))
        self.assertGreater(promo, rank["谁做出来我第一个买，现在的都太难用了"])
        self.assertGreater(promo, rank["找了很久都没有合适的"])
        # 同样是评论时，付费意愿 + 抱怨应排在单纯附和前面
        self.assertLess(rank["谁做出来我第一个买，现在的都太难用了"], rank["同求！！"])

    def test_post_summary_and_deep_dive(self):
        by_title = {r["帖子"]: r for r in self.posts}
        promo = by_title["我做了一个记账App，终于上线啦"]
        self.assertEqual(promo["求其他平台"], "2")
        self.assertEqual(promo["求其他平台点赞"], "320")
        ask = by_title["有没有app可以帮我记住衣柜里的衣服"]
        self.assertEqual(ask["已抓评论"], "4")
        self.assertEqual(ask["平台评论数"], "356")
        # 命中多、但评论只抓了一小部分的帖子，给出深挖命令
        self.assertIn("值得深挖的帖子", self.summary)
        self.assertIn('-p xhs -d "https://www.xiaohongshu.com/explore/n1', self.summary)
        self.assertIn("| 有没有app可以 |", self.summary)

    def test_summary_lists_every_hit(self):
        # summary.md 附上全部命中的原文，发给别人分析时只发这一个文件
        self.assertIn("## 全部命中（按帖子分组）", self.summary)
        for r in self.signals:
            self.assertIn(r["内容"].replace("\n", " ")[:50], self.summary)

    def test_empty_dir_reports_error(self):
        with tempfile.TemporaryDirectory() as empty:
            self.assertEqual(merge.main(empty), 1)


class DeepRunTest(unittest.TestCase):
    """深挖模式的输出：楼中楼回复、已经深挖过的帖子。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = os.path.join(self.tmp.name, "xhs", "jsonl")
        os.makedirs(d)
        url = "https://www.xiaohongshu.com/explore/s1?xsec_token=abc&xsec_source=pc_search"
        post = {"note_id": "s1", "title": "明明很需要的APP功能，为什么就是没有人做？", "desc": "", "liked_count": "2689",
                "comment_count": "2034", "note_url": url}
        comments = [
            {"comment_id": "c1", "note_id": "s1", "content": "应该出一个法律app，输入情况自动搜索相关法律条文", "like_count": "3829",
             "sub_comment_count": "120", "parent_comment_id": ""},
            {"comment_id": "c2", "note_id": "s1", "content": "滴滴拉屎，在非常急的时候能够租用居民家的厕所", "like_count": "208",
             "sub_comment_count": "30", "parent_comment_id": ""},
            {"comment_id": "c3", "note_id": "s1", "content": "记录梦境！", "like_count": "42", "sub_comment_count": "28", "parent_comment_id": ""},
            # 话说得长、命中的信号多，但只有 2 赞
            {"comment_id": "c4", "note_id": "s1", "content": "有没有一种APP，可以检测自己的脾气或者失去理智程度的？", "like_count": "2",
             "sub_comment_count": "3", "parent_comment_id": ""},
            # 楼中楼：是在评论别人的点子，不是新点子
            {"comment_id": "r1", "note_id": "s1", "content": "没盈利没人搞的", "like_count": "1794", "sub_comment_count": "0", "parent_comment_id": "c2"},
            {"comment_id": "r2", "note_id": "s1", "content": "有安全隐患，来个入室抢劫平台就完蛋了", "like_count": "700", "sub_comment_count": "0",
             "parent_comment_id": "c2"},
        ]
        with open(os.path.join(d, "detail_contents_2026-10-01.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps(post, ensure_ascii=False) + "\n")
        with open(os.path.join(d, "detail_comments_2026-10-01.jsonl"), "w", encoding="utf-8") as f:
            for c in comments:
                f.write(json.dumps(c, ensure_ascii=False) + "\n")
        with open(os.path.join(self.tmp.name, "posts_used.txt"), "w", encoding="utf-8") as f:
            f.write(url + "\n")
        self.assertEqual(merge.main(self.tmp.name), 0)
        self.signals = read_csv(os.path.join(self.tmp.name, "需求信号.csv"))
        with open(os.path.join(self.tmp.name, "summary.md"), encoding="utf-8") as f:
            self.summary = f.read()

    def tearDown(self):
        self.tmp.cleanup()

    def test_replies_are_not_ideas(self):
        texts = [r["内容"] for r in self.signals]
        self.assertNotIn("没盈利没人搞的", texts)
        self.assertNotIn("有安全隐患，来个入室抢劫平台就完蛋了", texts)
        self.assertTrue(texts[0].startswith("应该出一个法律app"))

    def test_likes_outweigh_wording(self):
        # 征集帖下每条一级评论都是点子，谁排前面主要看点赞和回复，不看措辞
        wordy = texts_index(self.signals, "有没有一种APP，可以检测自己的脾气或者失去理智程度的？")
        self.assertLess(texts_index(self.signals, "滴滴拉屎，在非常急的时候能够租用居民家的厕所"), wordy)
        self.assertLess(texts_index(self.signals, "记录梦境！"), wordy)

    def test_generic_solicit_post_ranks_below_its_ideas(self):
        # 泛泛的征集帖本身只是来源，排在评论区的点子后面
        kinds = [r["类型"] for r in self.signals]
        self.assertGreater(kinds.index("帖子"), texts_index(self.signals, "滴滴拉屎，在非常急的时候能够租用居民家的厕所"))

    def test_deep_crawled_post_not_suggested_again(self):
        self.assertNotIn("值得深挖的帖子", self.summary)

    def test_single_post_summary_skips_repeated_post_lines(self):
        top = self.summary.split("## 得分最高的 50 条")[1].split("##")[0]
        self.assertNotIn("所属帖子", top)


def texts_index(rows, text):
    return [r["内容"] for r in rows].index(text)


class TopicRunTest(unittest.TestCase):
    """用具体话题验证需求（比如搜"桌签"）：看教程帖的热度、求模板和按口令领文件的评论。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = os.path.join(self.tmp.name, "xhs", "jsonl")
        os.makedirs(d)
        posts = [{"note_id": "t1", "title": "高手10秒制作会议席位牌", "desc": "", "liked_count": "3000", "collected_count": "5200",
                  "comment_count": "800", "note_url": "https://www.xiaohongshu.com/explore/t1"},
                 {"note_id": "t2", "title": "一张图看懂饭局座次", "desc": "", "liked_count": "50", "collected_count": "20",
                  "comment_count": "3", "note_url": "https://www.xiaohongshu.com/explore/t2"}]
        texts = ["求模板", "怎么批量啊", "会议席位牌", "会议席位牌", "会议 席位牌", "会议席位牌[派对R]", "学到了",
                 "可编辑名字牌模板，笔记同款可直接拍自动发"]
        comments = [{"comment_id": f"c{i}", "note_id": "t1", "content": t, "like_count": "1", "sub_comment_count": "0",
                     "parent_comment_id": ""} for i, t in enumerate(texts)]
        comments.append({"comment_id": "x1", "note_id": "t2", "content": "主客都是双数怎么排？", "like_count": "3",
                         "sub_comment_count": "0", "parent_comment_id": ""})
        with open(os.path.join(d, "search_contents_2026-10-01.jsonl"), "w", encoding="utf-8") as f:
            for p in posts:
                f.write(json.dumps(p, ensure_ascii=False) + "\n")
        with open(os.path.join(d, "search_comments_2026-10-01.jsonl"), "w", encoding="utf-8") as f:
            for c in comments:
                f.write(json.dumps(c, ensure_ascii=False) + "\n")
        self.assertEqual(merge.main(self.tmp.name), 0)
        self.posts = {r["帖子"]: r for r in read_csv(os.path.join(self.tmp.name, "按帖子汇总.csv"))}
        with open(os.path.join(self.tmp.name, "summary.md"), encoding="utf-8") as f:
            self.summary = f.read()

    def tearDown(self):
        self.tmp.cleanup()

    def test_template_and_keyword_asks_counted(self):
        p = self.posts["高手10秒制作会议席位牌"]
        self.assertEqual(p["求模板"], "2")  # 求模板、怎么批量；卖模板的评论不算
        self.assertEqual(p["口令评论"], "4")  # 四条"会议席位牌"，空格和表情不影响
        self.assertEqual(p["帖子收藏"], "5200")

    def test_hot_posts_listed_even_without_hits(self):
        self.assertIn("## 热度最高的帖子", self.summary)
        hot = self.summary.split("## 热度最高的帖子")[1].split("\n## ")[0]
        self.assertIn("| 3000 | 5200 | 800 | 2 / 4 / 8 |", hot)
        self.assertIn("一张图看懂饭局座次", hot)


class DetectTest(unittest.TestCase):
    """真实跑出来的误报和漏报，防止改正则时退回去。"""

    def hits(self, text, kind="评论", parent=None):
        return merge.detect(text, kind, parent)[0]

    def test_false_positives(self):
        self.assertEqual(self.hits("对的但是没人做！ #搞笑", "帖子"), [])
        self.assertNotIn("抱怨现有", self.hits("我也买了 但是是送我姐的 还没问她好用不好用"))
        self.assertNotIn("求其他平台", self.hits("苹果系统新出了个自带app：手帐，我觉得比备忘录好用"))
        self.assertNotIn("缺失", self.hits("北京怎么都没有185+啊"))
        self.assertNotIn("求其他平台", self.hits("ui为什么比安卓的好看"))
        self.assertNotIn("付费意愿", self.hits("蹲蹲，留下一个终身pro"))
        self.assertNotIn("缺失", self.hits("这个视频有一句说得对，就是不赚钱所以没人做，做产品更难得的是商业变现"))
        self.assertNotIn("求工具", self.hits("有没有人教我，如何用ai编小程序，我说了半天"))
        self.assertNotIn("付费意愿", self.hits("一般人说的需求都是伪需求，就是没人愿意付费的需求，都想白嫖"))
        self.assertNotIn("求模板", self.hits("找个ai帮你建一个需求文档，你把你所有的需求跟他说清楚"))
        self.assertNotIn("求模板", self.hits("就说原型设计出来的坑位使用状态，怎么获取，对接什么厂商"))

    def test_real_demands(self):
        self.assertIn("求工具", self.hits("有没有那种记录&提醒周期性事件的APP，比如我今天换了牙刷"))
        self.assertIn("想要", self.hits("要是衣服也能根据上传自拍照试穿就好了"))
        self.assertIn("想要", self.hits("物品收纳记录这个还真的超级需要"))
        self.assertIn("改进建议", self.hits("能不能出个匿名对骂功能"))
        self.assertIn("改进建议", self.hits("以后会提供别人上传的模板吗？"))
        self.assertIn("痛点", self.hits("时间久了哪家难吃根本记不得又会重复踩雷 现在都自己拿备忘录记"))
        for t in ["蹲蹲安卓", "安卓在哪里", "没有荣耀的吗", "会做电脑版嘛", "第二眼：没有安卓？遗憾滑走", "鸿蒙出吗？", "华为搜不到"]:
            self.assertIn("求其他平台", self.hits(t), t)
        self.assertEqual(self.hits("蹲蹲安卓"), ["求其他平台"])  # 附和不重复计分

    def test_solicited_answer_needs_context(self):
        solicit = {"type": "征集需求", "title": "明明很需要的APP功能，为什么就是没有人做？"}
        self.assertIn("回应征集", self.hits("滴滴拉屎，在非常急的时候能够租用居民家的厕所", parent=solicit))
        self.assertIn("回应征集", self.hits("记录梦境！", parent=solicit))
        self.assertNotIn("回应征集", self.hits("怎么下载", parent=solicit))
        # 楼中楼、叫好、开发者推广自己的产品、推荐现成产品，都不算新点子
        self.assertNotIn("回应征集", self.hits("没盈利没人搞的", "回复", parent=solicit))
        for t in ["发现宝藏啦！", "这个图怎么做的", "做了个拼豆小工具，一键生成带色号图纸+材料表 有兴趣的可以体验下", "借口生成器我有做",
                  "我做了一个宠物交友小程序，目前用户1人", "大家好！想请教各位：我公司在制作一个app", "推荐小雀幸app，聊天堪比真人",
                  "信息差，你真的了解吗？ http://xhslink.com/o/9tAFv5QM6SY"]:
            self.assertNotIn("回应征集", self.hits(t, parent=solicit), t)
        # 评论这个帖子、这些点子本身的话，不是点子
        for t in ["说实话，评论区大部分的朋友的想法都没有很大的开发价值", "AI 时代所有的软件都值得重做一遍", "没意思 不赚钱",
                  "看了所有评论，没有一个值得我王多鱼投资的产品", "做不到的基本就是盈利和违法两方面问题"]:
            self.assertNotIn("回应征集", self.hits(t, parent=solicit), t)
        self.assertNotIn("回应征集", self.hits("记录梦境！", parent={"type": "推广", "title": "我做了一个App"}))
        # 标题没提到产品的征集帖，评论自己要提到产品才算
        loose = {"type": "征集需求", "title": "对的但是没人做"}
        self.assertNotIn("回应征集", self.hits("我现在进餐厅发现太贵了可以坦然离开了", parent=loose))

    def test_post_type(self):
        self.assertEqual(merge.post_type("明明很需要的APP功能，为什么就是没有人做？", ""), "征集需求")
        self.assertEqual(merge.post_type("有什么产品是需求很大，却没有人做的？", ""), "征集需求")
        for t in ["有没有一个App，你等了很多年？", "求助全网！！来许愿你的理想APP✨", "谁来，我要是有这个App就好了",
                  "有没有什么东西，你觉得自己非常需要，可是市场上就是没有或者没有很合适的", "有没有大家需要，还没被发明出来的东西？",
                  "说说你很想要但现实没有的app"]:
            self.assertEqual(merge.post_type(t, ""), "征集需求", t)
        self.assertEqual(merge.post_type("求ios细糠推荐！！", ""), "求助")
        self.assertEqual(merge.post_type("急需要开发一个小程序", ""), "求助")
        self.assertEqual(merge.post_type("帮你夺回注意力的武器上线App Store啦", ""), "其他")
        self.assertEqual(merge.post_type("Vibe coding了一个《爽骂》情绪树洞", ""), "推广")
        self.assertEqual(merge.post_type("终于找到符合需求的笔记软件", "意外发现一款开发时间不长的软件"), "推广")


class HelperTest(unittest.TestCase):
    def test_to_int(self):
        self.assertEqual(merge.to_int("1.2万"), 12000)
        self.assertEqual(merge.to_int("10万+"), 100000)
        self.assertEqual(merge.to_int("3k"), 3000)
        self.assertEqual(merge.to_int("1,234"), 1234)
        self.assertEqual(merge.to_int(""), 0)
        self.assertEqual(merge.to_int(None), 0)

    def test_to_time(self):
        self.assertEqual(merge.to_time("2026-09-20 10:00:00"), "2026-09-20 10:00")
        self.assertTrue(merge.to_time(1758000000000).startswith("2025-09-"))
        self.assertEqual(merge.to_time(0), "")



class EnglishSignalTest(unittest.TestCase):
    """Reddit、Hacker News、GitHub 和英文 App Store 评论里的需求说法。"""

    def test_english_phrases(self):
        cases = {
            "Is there an app that reminds me to water plants?": "求工具",
            "Why isn't there a simple way to split rent": "缺失",
            "I'd happily pay for this": "付费意愿",
            "I wish there was a tool for invoices": "想要",
            "This app has too many ads now": "抱怨现有",
        }
        for text, signal in cases.items():
            hits, _ = merge.detect(text, "评论", {"type": "其他", "title": ""})
            self.assertIn(signal, hits, text)
        self.assertIn("改进建议", merge.detect("Please add dark mode", "评论")[0])
        self.assertEqual(merge.detect("Great article, thanks for sharing", "评论")[0], [])

    def test_english_post_types(self):
        self.assertEqual(merge.post_type("Show HN: I built a habit tracker", ""), "推广")
        self.assertEqual(merge.post_type("What app do you wish existed?", ""), "征集需求")
        self.assertEqual(merge.post_type("Is there an app for tracking chores", ""), "求助")
        self.assertTrue(merge.AD.search("Shameless plug: check out my app"))


if __name__ == "__main__":
    unittest.main()
