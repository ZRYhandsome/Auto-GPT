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
                      "comment_count": "356", "note_url": "https://www.xiaohongshu.com/explore/n1", "source_keyword": "有没有app可以", "time": 1758000000000}],
        "comments": [
            {"comment_id": "c1", "note_id": "n1", "content": "同求！！", "like_count": "88", "sub_comment_count": "2", "create_time": 1758000100000, "parent_comment_id": 0},
            {"comment_id": "c2", "note_id": "n1", "content": "谁做出来我第一个买，现在的都太难用了", "like_count": "240", "sub_comment_count": "5", "create_time": 1758000200000, "parent_comment_id": 0},
            {"comment_id": "c3", "note_id": "n1", "content": "好看", "like_count": "3", "sub_comment_count": "0", "create_time": 1758000300000, "parent_comment_id": 0},
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

    def tearDown(self):
        self.tmp.cleanup()

    def test_outputs_exist(self):
        for name in ["需求信号.csv", "全部数据.csv", "summary.md"]:
            self.assertTrue(os.path.exists(os.path.join(self.tmp.name, name)), name)

    def test_all_platforms_loaded_and_deduped(self):
        platforms = {r["平台"] for r in self.all}
        self.assertEqual(platforms, {"小红书", "抖音", "B站", "微博", "贴吧", "知乎", "快手"})
        xhs_posts = [r for r in self.all if r["平台"] == "小红书" and r["类型"] == "帖子"]
        self.assertEqual(len(xhs_posts), 1)

    def test_signals_detected(self):
        by_text = {r["内容"]: r for r in self.signals}
        self.assertIn("付费意愿", by_text["谁做出来我第一个买，现在的都太难用了"]["需求信号"])
        self.assertIn("抱怨现有", by_text["谁做出来我第一个买，现在的都太难用了"]["需求信号"])
        self.assertIn("附和", by_text["同求！！"]["需求信号"])
        self.assertIn("附和", by_text["+1"]["需求信号"])
        self.assertIn("想要", by_text["要是有这种软件就好了，我妈天天接诈骗电话"]["需求信号"])
        self.assertIn("缺失", by_text["找了很久都没有合适的"]["需求信号"])
        self.assertIn("想要", by_text["希望能有一个自动找痛点的工具"]["需求信号"])
        self.assertNotIn("好看", by_text)
        self.assertNotIn("不错", by_text)

    def test_likes_parsed_and_links_joined(self):
        post = next(r for r in self.all if r["平台"] == "小红书" and r["类型"] == "帖子")
        self.assertEqual(post["点赞"], "12000")
        c = next(r for r in self.signals if r["内容"] == "同求！！")
        self.assertEqual(c["链接"], "https://www.xiaohongshu.com/explore/n1")
        self.assertTrue(c["所属帖子"].startswith("有没有app可以"))
        w = next(r for r in self.signals if r["内容"] == "+1")
        self.assertEqual(w["点赞"], "15")

    def test_ranking_prefers_strong_and_popular_signals(self):
        scores = [float(r["得分"]) for r in self.signals]
        self.assertEqual(scores, sorted(scores, reverse=True))
        # 1.2 万赞的求工具帖子应排第一；同样是评论时，付费意愿 + 抱怨应排在单纯附和前面
        self.assertTrue(self.signals[0]["内容"].startswith("有没有app可以帮我记住衣柜里的衣服"))
        rank = {r["内容"]: i for i, r in enumerate(self.signals)}
        self.assertLess(rank["谁做出来我第一个买，现在的都太难用了"], rank["同求！！"])

    def test_empty_dir_reports_error(self):
        with tempfile.TemporaryDirectory() as empty:
            self.assertEqual(merge.main(empty), 1)


class HelperTest(unittest.TestCase):
    def test_to_int(self):
        self.assertEqual(merge.to_int("1.2万"), 12000)
        self.assertEqual(merge.to_int("3k"), 3000)
        self.assertEqual(merge.to_int("1,234"), 1234)
        self.assertEqual(merge.to_int(""), 0)
        self.assertEqual(merge.to_int(None), 0)

    def test_to_time(self):
        self.assertEqual(merge.to_time("2026-09-20 10:00:00"), "2026-09-20 10:00")
        self.assertTrue(merge.to_time(1758000000000).startswith("2025-09-"))
        self.assertEqual(merge.to_time(0), "")


if __name__ == "__main__":
    unittest.main()
