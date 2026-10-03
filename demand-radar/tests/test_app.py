"""需求雷达软件的测试：数据源解析、任务执行（用假的 MediaCrawler 和录好的接口数据）、本机服务接口。

运行：python -m unittest discover tests
不联网：数据源的网络请求都换成了 RADAR_FAKE_HTTP 指定的样例数据；「线索与回复」用假的 Claude 和假的 Reddit。
"""
import glob
import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
import threading
import time
import unittest
import urllib.error
import urllib.request
from types import SimpleNamespace

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "app"))

import merge  # noqa: E402
from sources import appstore, github, hn, reddit, web  # noqa: E402
from sources.common import Writer, strip_html  # noqa: E402

# ---------- 样例数据（按各网站文档里的格式） ----------
APPSTORE_SEARCH = {"resultCount": 1, "results": [{
    "trackId": 1050106939, "trackName": "随手记账", "sellerName": "某某科技", "primaryGenreName": "财务",
    "averageUserRating": 3.2, "userRatingCount": 12000, "formattedPrice": "免费", "description": "记账软件",
    "trackViewUrl": "https://apps.apple.com/cn/app/id1050106939", "currentVersionReleaseDate": "2026-09-01T00:00:00Z"}]}
APPSTORE_RSS = {"feed": {"entry": [
    {"author": {"name": {"label": "小王"}}, "im:version": {"label": "5.1"}, "im:rating": {"label": "1"}, "id": {"label": "r1"},
     "title": {"label": "广告太多了"}, "content": {"label": "开屏广告忍无可忍，希望能加一个关闭广告的会员"},
     "im:voteSum": {"label": "37"}, "im:voteCount": {"label": "40"}, "updated": {"label": "2026-09-20T08:00:00-07:00"}},
    {"author": {"name": {"label": "小李"}}, "im:version": {"label": "5.1"}, "im:rating": {"label": "5"}, "id": {"label": "r2"},
     "title": {"label": "好用"}, "content": {"label": "一直在用"}, "im:voteSum": {"label": "2"}, "im:voteCount": {"label": "2"},
     "updated": {"label": "2026-09-21T08:00:00-07:00"}},
]}}
CATALOG_REVIEWS = {"data": [{"id": "w1", "type": "user-reviews", "attributes": {
    "rating": 2, "title": "同步老是失败", "review": "每次都要手动导出，太麻烦了", "userName": "u", "date": "2026-09-22T00:00:00Z"}}]}
REDDIT_POSTS = {"data": [{"id": "abc123", "title": "Is there an app that reminds me to water plants?", "selftext": "I keep forgetting",
                          "score": 420, "num_comments": 3, "created_utc": 1758000000, "permalink": "/r/SomebodyMakeThis/comments/abc123/x/",
                          "subreddit": "SomebodyMakeThis"}]}
REDDIT_TREE = {"data": [
    {"kind": "t1", "data": {"id": "c1", "body": "I'd happily pay for this", "score": 88, "created_utc": 1758000100,
                            "parent_id": "t3_abc123", "replies": {"data": {"children": [
                                {"kind": "t1", "data": {"id": "c2", "body": "same", "score": 5, "parent_id": "t1_c1", "created_utc": 1758000200, "replies": ""}}]}}}},
    {"kind": "t1", "data": {"id": "c3", "body": "[deleted]", "score": 1, "parent_id": "t3_abc123", "replies": ""}},
]}
HN_SEARCH_STORY = {"hits": [{"objectID": "111", "title": "Ask HN: Is there a tool for tracking freelance invoices?", "points": 150, "num_comments": 2}]}
HN_SEARCH_COMMENT = {"hits": [{"objectID": "222", "story_id": 333, "story_title": "What do you wish existed?", "parent_id": 333,
                               "comment_text": "<p>I wish there was an app for splitting rent</p>", "created_at_i": 1758000000}]}
HN_ITEM = {"id": 111, "type": "story", "title": "Ask HN: Is there a tool for tracking freelance invoices?", "text": "", "points": 150,
           "created_at_i": 1758000000, "children": [
               {"id": 112, "type": "comment", "text": "Would pay for this&#x27;s simplicity", "created_at_i": 1758000100, "parent_id": 111,
                "children": [{"id": 113, "type": "comment", "text": "me too", "created_at_i": 1758000200, "parent_id": 112, "children": []}]}]}
GITHUB_SEARCH = {"items": [{"id": 9, "number": 5, "title": "Feature request: dark mode", "body": "please add dark mode",
                            "html_url": "https://github.com/o/r/issues/5", "comments": 1, "comments_url": "https://api.github.com/repos/o/r/issues/5/comments",
                            "reactions": {"+1": 321}, "created_at": "2026-01-01T00:00:00Z", "repository_url": "https://api.github.com/repos/o/r", "state": "open"}]}
GITHUB_COMMENTS = [{"id": 77, "body": "+1, would pay for this", "created_at": "2026-01-02T00:00:00Z", "reactions": {"+1": 12}}]


def opts(**kw):
    o = {"mode": "search", "keywords": ["记账"], "targets": [], "max_notes": 5, "max_comments": 10, "comments": True, "sub": False, "sleep": 0}
    o.update(kw)
    return o


def read(path_glob):
    rows = []
    for p in glob.glob(path_glob):
        with open(p, encoding="utf-8") as f:
            rows += [json.loads(x) for x in f if x.strip()]
    return rows


class FakeHttp:
    """把 sources 里的 get_json 换成查表。"""

    def __init__(self, table):
        self.table = table
        self.urls = []

    def __call__(self, url, params=None, headers=None, **kw):
        import urllib.parse
        full = url + ("?" + urllib.parse.urlencode(params) if params else "")
        self.urls.append(full)
        for frag, resp in self.table.items():
            if frag in full:
                if isinstance(resp, Exception):
                    raise resp
                return resp
        raise AssertionError(f"没有准备这个网址：{full}")


class SourcesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.saved = {}

    def tearDown(self):
        for mod, fn in self.saved.items():
            mod.get_json = fn
        shutil.rmtree(self.tmp, ignore_errors=True)

    def fake(self, mod, table):
        self.saved.setdefault(mod, mod.get_json)
        f = FakeHttp(table)
        mod.get_json = f
        return f

    def test_appstore_search_and_reviews_feed_merge(self):
        self.fake(appstore, {"itunes.apple.com/search": APPSTORE_SEARCH, "sortby=mosthelpful": APPSTORE_RSS, "sortby=mostrecent": {"feed": {}}})
        w = Writer(self.tmp, "appstore", "search")
        appstore.run(opts(), w)
        posts = read(os.path.join(self.tmp, "appstore/jsonl/*contents*"))
        comments = read(os.path.join(self.tmp, "appstore/jsonl/*comments*"))
        self.assertEqual(posts[0]["title"], "随手记账")
        self.assertEqual(posts[0]["liked_count"], 12000)
        self.assertEqual([c["like_count"] for c in comments], [37, 2])
        self.assertTrue(comments[0]["content"].startswith("【1星】广告太多了"))
        # merge.py 不用改就能读、能打分
        items, _ = merge.load(self.tmp)
        merge.score_items(items, {("appstore", "1050106939"): {"type": "其他", "title": "随手记账"}})
        bad = next(i for i in items if i["id"] == "r1")
        self.assertIn("抱怨现有", bad["signals"])
        self.assertGreater(bad["score"], 0)

    def test_appstore_falls_back_to_web_reviews(self):
        self.fake(appstore, {"lookup": APPSTORE_SEARCH, "customerreviews": {"feed": {"entry": []}},
                             "apps.apple.com/api/apps/v1/catalog/cn/apps/1050106939/reviews": CATALOG_REVIEWS})
        appstore._web_token = lambda app_id, country: None
        w = Writer(self.tmp, "appstore", "detail")
        appstore.run(opts(mode="detail", targets=["https://apps.apple.com/cn/app/xx/id1050106939"]), w)
        comments = read(os.path.join(self.tmp, "appstore/jsonl/*comments*"))
        self.assertEqual(len(comments), 1)
        self.assertIn("太麻烦了", comments[0]["content"])

    def test_appstore_ids(self):
        self.assertEqual(appstore.app_id_of("https://apps.apple.com/us/app/foo/id123456789"), ("123456789", "us"))
        self.assertEqual(appstore.app_id_of("id1050106939")[0], "1050106939")
        self.assertIsNone(appstore.app_id_of("随手记")[0])

    def test_reddit_arctic_shift_tree(self):
        f = self.fake(reddit, {"posts/search": REDDIT_POSTS, "comments/tree": REDDIT_TREE})
        os.environ["RADAR_REDDIT_SUBS"] = "SomebodyMakeThis"
        try:
            w = Writer(self.tmp, "reddit", "search")
            reddit.run(opts(keywords=["plants"], sub=True, sleep=0), w)
        finally:
            del os.environ["RADAR_REDDIT_SUBS"]
        self.assertIn("subreddit=SomebodyMakeThis", f.urls[0])
        comments = read(os.path.join(self.tmp, "reddit/jsonl/*comments*"))
        self.assertEqual([(c["comment_id"], c["parent_comment_id"]) for c in comments], [("c1", 0), ("c2", "c1")])
        self.assertEqual(comments[0]["sub_comment_count"], 1)
        self.assertEqual(reddit.split_query("r/SaaS alternative to notion"), (["SaaS"], "alternative to notion"))
        self.assertEqual(reddit.post_id_of("https://www.reddit.com/r/x/comments/abc123/title/"), "abc123")

    def test_reddit_falls_back_to_reddit_json(self):
        from sources.common import FetchError
        listing = {"data": {"children": [{"kind": "t3", "data": REDDIT_POSTS["data"][0]}]}}
        self.fake(reddit, {"arctic-shift": FetchError("502"), "/r/SaaS/search.json": listing})
        self.assertEqual(reddit.search("SaaS", "x", 5)[0]["id"], "abc123")

    def test_hacker_news_stories_and_comment_hits(self):
        self.fake(hn, {"tags=story": HN_SEARCH_STORY, "tags=comment": HN_SEARCH_COMMENT, "/items/111": HN_ITEM})
        w = Writer(self.tmp, "hn", "search")
        hn.run(opts(keywords=["invoice"], sub=True), w)
        posts = {p["note_id"]: p for p in read(os.path.join(self.tmp, "hn/jsonl/*contents*"))}
        comments = read(os.path.join(self.tmp, "hn/jsonl/*comments*"))
        self.assertEqual(set(posts), {"111", "333"}, "命中的评论挂到它所属的帖子下")
        self.assertEqual(posts["111"]["comment_count"], 2)
        self.assertEqual({c["comment_id"] for c in comments}, {"112", "113", "222"})
        self.assertEqual(next(c for c in comments if c["comment_id"] == "222")["content"], "I wish there was an app for splitting rent")
        self.assertEqual(hn.item_id_of("https://news.ycombinator.com/item?id=4242"), "4242")

    def test_github_issues_with_thumbs(self):
        self.fake(github, {"search/issues": GITHUB_SEARCH, "issues/5/comments": GITHUB_COMMENTS})
        w = Writer(self.tmp, "github", "search")
        github.run(opts(keywords=["dark mode"], sleep=0), w)
        posts = read(os.path.join(self.tmp, "github/jsonl/*contents*"))
        comments = read(os.path.join(self.tmp, "github/jsonl/*comments*"))
        self.assertEqual(posts[0]["liked_count"], 321)
        self.assertTrue(posts[0]["title"].startswith("[o/r] "))
        self.assertEqual(comments[0]["like_count"], 12)
        self.assertEqual(github.issue_of("https://github.com/a/b/issues/12"), ("a", "b", "12"))

    def test_web_extract_without_trafilatura(self):
        html = "<html><head><title>论坛帖</title><script>x()</script></head><body><p>为什么没有人做一个</p><p>好用的工具</p></body></html>"
        title, text = web.extract(html)
        self.assertEqual(title, "论坛帖")
        self.assertIn("为什么没有人做一个", text)
        self.assertNotIn("x()", text)
        self.assertEqual(strip_html("a<br>b &amp; c"), "a\nb & c")

    def test_writer_dedupes(self):
        w = Writer(self.tmp, "hn", "search")
        self.assertTrue(w.post(note_id="1", title="a"))
        self.assertFalse(w.post(note_id="1", title="a again"))
        self.assertTrue(w.comment(note_id="1", comment_id="x", content="c"))
        self.assertFalse(w.comment(note_id="1", comment_id="x", content="c"))
        self.assertEqual(w.counts, {"contents": 1, "comments": 1})


FAKE_MC = textwrap.dedent('''
    """假的 MediaCrawler：按参数写几条小红书数据。抖音故意失败；FAKE_MC_SLEEP 控制跑多久。"""
    import json, os, sys, time
    args = sys.argv[1:]
    get = lambda k: args[args.index(k) + 1] if k in args else ""
    platform, out = get("--platform"), get("--save_data_path")
    print("[XiaoHongShuLogin] waiting for scan qrcode login", flush=True)
    if platform == "dy":
        print("Error: 登录失败，滑块验证没通过", flush=True)
        sys.exit(1)
    d = os.path.join(out, "xhs", "jsonl")
    if os.environ.get("FAKE_MC_BLOCK"):
        # 像真的小红书那样：第一个关键词抓了一半被拦住，run_mc.py 停手并报告没抓完的关键词
        kws = get("--keywords").split(",")
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "search_contents_2026-10-03.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps({"note_id": "b1", "title": "有没有app可以记录体检报告", "liked_count": "300",
                                "source_keyword": kws[0]}, ensure_ascii=False) + "\\n")
        with open(os.path.join(d, "search_comments_2026-10-03.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps({"comment_id": "bc1", "note_id": "b1", "content": "求一个这种app", "parent_comment_id": 0}, ensure_ascii=False) + "\\n")
        print("tenacity.RetryError: RetryError[<Future at 0x11e97e890 state=finished raised KeyError>]", flush=True)
        print("[需求雷达·结果] " + json.dumps({"blocked": "KeyError: 'Verifytype'", "cut_keywords": kws[1:], "skipped": 1}, ensure_ascii=False), flush=True)
        sys.exit(3)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "search_contents_2026-10-02.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps({"note_id": "n1", "title": "有没有app可以帮我记住衣柜里的衣服", "desc": "", "liked_count": "1200",
                            "comment_count": "50", "note_url": "https://www.xiaohongshu.com/explore/n1", "source_keyword": get("--keywords")}, ensure_ascii=False) + "\\n")
    time.sleep(float(os.environ.get("FAKE_MC_SLEEP", "0")))
    with open(os.path.join(d, "search_comments_2026-10-02.jsonl"), "a", encoding="utf-8") as f:
        for i, t in enumerate(["谁做出来我第一个买", "同求", "好看"]):
            f.write(json.dumps({"comment_id": f"c{i}", "note_id": "n1", "content": t, "like_count": 10 - i, "parent_comment_id": 0}, ensure_ascii=False) + "\\n")
    print("crawl finished", flush=True)
''')


def make_home():
    home = tempfile.mkdtemp()
    mc = os.path.join(home, "MediaCrawler")
    os.makedirs(os.path.join(mc, "browser_data", "cdp_xhs_user_data_dir"))
    open(os.path.join(mc, "browser_data", "cdp_xhs_user_data_dir", "Cookies"), "w").close()
    with open(os.path.join(mc, "run_mc.py"), "w", encoding="utf-8") as f:
        f.write(FAKE_MC)
    fake_http = os.path.join(home, "fake_http.json")
    with open(fake_http, "w", encoding="utf-8") as f:
        json.dump({"itunes.apple.com/search": APPSTORE_SEARCH, "sortby=mosthelpful": APPSTORE_RSS, "sortby=mostrecent": {"feed": {}}}, f, ensure_ascii=False)
    return home, mc, fake_http


def wait_for(fn, timeout=30):
    end = time.time() + timeout
    while time.time() < end:
        v = fn()
        if v:
            return v
        time.sleep(0.2)
    raise AssertionError("等超时了")


class JobsTest(unittest.TestCase):
    def setUp(self):
        from jobs import JobManager
        self.home, self.mc, fake_http = make_home()
        os.environ["RADAR_FAKE_HTTP"] = fake_http
        self.jm = JobManager(self.home, mc_dir=self.mc, mc_python=sys.executable)

    def tearDown(self):
        os.environ.pop("RADAR_FAKE_HTTP", None)
        os.environ.pop("FAKE_MC_SLEEP", None)
        self.jm.stop_all()
        shutil.rmtree(self.home, ignore_errors=True)

    def test_multi_platform_job_runs_merges_and_reports(self):
        job = self.jm.create({"platforms": ["xhs", "dy", "appstore"], "mode": "search", "keywords": ["记账"], "notes": 5, "comments": 10})
        done = wait_for(lambda: (j := self.jm.get(job["id"])) and j["status"] not in ("queued", "running") and j)
        steps = {s["platform"]: s for s in done["steps"]}
        self.assertEqual(done["status"], "partial", "抖音没登录上：这次算没抓完，抓到的照样打分")
        self.assertEqual((steps["xhs"]["state"], steps["xhs"]["posts"], steps["xhs"]["comments"]), ("done", 1, 3))
        self.assertEqual(steps["dy"]["state"], "failed")
        self.assertIn("登录失败", steps["dy"]["error"])
        self.assertIn("扫码", steps["dy"]["error"], "报错翻成了能照着做的话")
        self.assertEqual(done["remaining"], {"dy": ["记账"]}, "抖音一条都没抓到，关键词算没抓完")
        self.assertEqual((steps["appstore"]["state"], steps["appstore"]["posts"], steps["appstore"]["comments"]), ("done", 1, 2))
        run = os.path.join(self.home, "runs", job["id"])
        for name in ("summary.md", "需求信号.csv", "全部数据.csv", "keywords_used.txt", "crawl.log"):
            self.assertTrue(os.path.exists(os.path.join(run, name)), name)
        self.assertGreater(done["totals"]["signals"], 0)
        res = self.jm.results(job["id"], "signals")
        self.assertIn("内容", res["columns"])
        texts = [r[res["columns"].index("内容")] for r in res["rows"]]
        self.assertIn("谁做出来我第一个买", texts)
        self.assertTrue(any("广告太多" in t for t in texts), "App Store 差评也进了打分")
        self.assertIn("开始：小红书", self.jm.log_tail(job["id"])["text"])
        found = self.jm.search("衣柜")
        self.assertEqual(found["rows"][0][-1], job["id"])

    def test_blocked_midway_is_partial_and_can_resume(self):
        os.environ["FAKE_MC_BLOCK"] = "1"
        try:
            job = self.jm.create({"platforms": ["xhs"], "mode": "search", "keywords": ["体检", "记账", "养花"], "notes": 20, "comments": 300})
            done = wait_for(lambda: (j := self.jm.get(job["id"])) and j["status"] not in ("queued", "running") and j)
        finally:
            os.environ.pop("FAKE_MC_BLOCK", None)
        st = done["steps"][0]
        self.assertEqual((done["status"], st["state"]), ("partial", "partial"), "抓到了数据就不算失败")
        self.assertEqual((st["posts"], st["comments"]), (1, 1))
        self.assertIn("小红书暂时拦住了请求", st["error"])
        self.assertIn("接着抓剩下的", st["error"])
        self.assertIn("KeyError", st["detail"])
        self.assertEqual((st["cut_keywords"], st["skipped"]), (["记账", "养花"], 1))
        self.assertEqual(done["remaining"], {"xhs": ["记账", "养花"]})
        self.assertGreater(done["totals"]["signals"], 0, "抓到的照样合并打分")
        self.assertNotIn("remaining", self.jm.list()[0], "任务列表不读数据文件")
        again = self.jm.resume(job["id"])
        self.assertEqual((again["spec"]["platforms"], again["spec"]["keywords"]), (["xhs"], ["记账", "养花"]))
        self.assertTrue(again["spec"]["label"].startswith("接着抓"))
        self.assertEqual((again["spec"]["notes"], again["spec"]["comments"]), (20, 300))
        wait_for(lambda: self.jm.get(again["id"])["status"] not in ("queued", "running"))
        self.assertEqual(self.jm.get(again["id"])["status"], "done")
        with self.assertRaises(ValueError):
            self.jm.resume(again["id"])  # 这次抓完了，没有剩下的

    def test_old_failed_job_with_data_shows_as_unfinished(self):
        # 0.4.0 记下的任务：小红书抓了 40 帖后 RetryError，整个任务记成"失败"
        from jobs import JobManager
        jid = "20261003-151103"
        run = os.path.join(self.home, "runs", jid)
        os.makedirs(os.path.join(run, "xhs", "jsonl"))
        with open(os.path.join(run, "xhs", "jsonl", "search_contents_2026-10-03.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps({"note_id": "n1", "title": "x", "source_keyword": "大家有什么想要的app吗"}, ensure_ascii=False) + "\n")
        raw = "tenacity.RetryError: RetryError[<Future at 0x11e97e890 state=finished raised KeyError>]"
        with open(os.path.join(run, "job.json"), "w", encoding="utf-8") as f:
            json.dump({"id": jid, "created": "2026-10-03 15:11:03", "status": "failed",
                       "spec": {"platforms": ["xhs"], "mode": "search", "keywords": ["大家有什么想要的app吗", "你希望有什么软件"],
                                "targets": [], "notes": 20, "comments": 300, "sub": False, "label": ""},
                       "steps": [{"platform": "xhs", "state": "failed", "posts": 40, "comments": 4279, "error": raw, "partial": True}],
                       "totals": {"posts": 40, "comments": 4279, "items": 3810, "signals": 430}}, f, ensure_ascii=False)
        self.jm.stop_all()
        jm = JobManager(self.home, mc_dir=self.mc, mc_python=sys.executable)
        try:
            job = jm.get(jid)
            st = job["steps"][0]
            self.assertEqual((job["status"], st["state"]), ("partial", "partial"))
            self.assertIn("小红书暂时拦住了请求", st["error"])
            self.assertEqual(st["detail"], raw)
            self.assertEqual(job["remaining"], {"xhs": ["你希望有什么软件"]})
            with open(os.path.join(run, "job.json"), encoding="utf-8") as f:
                self.assertEqual(json.load(f)["status"], "failed", "只改显示，不改记录")
        finally:
            jm.stop_all()

    def test_explain(self):
        from jobs import explain
        self.assertIn("暂时拦住了请求", explain("小红书", "tenacity.RetryError: RetryError[<Future at 0x1 state=finished raised KeyError>]"))
        self.assertIn("账号被限制", explain("小红书", "XHS account security restriction, code: 300011"))
        self.assertIn("网络", explain("小红书", "IPBlockError: 300012"))
        self.assertIn("登录失败", explain("抖音", "Error: 登录失败，滑块验证没通过"))
        self.assertEqual(explain("小红书", "ModuleNotFoundError: No module named 'x'"), "")

    def test_stop_keeps_partial_data_and_skips_rest(self):
        os.environ["FAKE_MC_SLEEP"] = "20"
        job = self.jm.create({"platforms": ["xhs", "appstore"], "mode": "search", "keywords": ["记账"]})
        wait_for(lambda: self.jm.get(job["id"])["steps"][0]["posts"] == 1)
        self.assertEqual(self.jm.get(job["id"])["steps"][0]["hint"], "")
        self.assertTrue(self.jm.stop(job["id"]))
        done = wait_for(lambda: (j := self.jm.get(job["id"])) and j["status"] == "stopped" and j)
        self.assertEqual([s["state"] for s in done["steps"]], ["stopped", "skipped"])
        self.assertTrue(done["steps"][0].get("partial"))
        self.assertTrue(os.path.exists(os.path.join(self.home, "runs", job["id"], "全部数据.csv")), "停下来也把已抓到的合并打分")

    def test_validation_and_queue(self):
        with self.assertRaises(ValueError):
            self.jm.create({"platforms": [], "mode": "search", "keywords": ["x"]})
        with self.assertRaises(ValueError):
            self.jm.create({"platforms": ["hn"], "mode": "creator", "targets": ["x"]})
        with self.assertRaises(ValueError):
            self.jm.create({"platforms": ["xhs", "dy"], "mode": "detail", "targets": ["x"]})
        with self.assertRaises(ValueError):
            self.jm.create({"platforms": ["xhs"], "mode": "search", "keywords": [" "]})
        os.environ["FAKE_MC_SLEEP"] = "5"
        a = self.jm.create({"platforms": ["xhs"], "mode": "search", "keywords": ["a"]})
        b = self.jm.create({"platforms": ["xhs"], "mode": "search", "keywords": ["b"]})
        self.assertEqual(self.jm.get(b["id"]).get("queue_pos"), 1 if self.jm.get(a["id"])["status"] == "running" else 2)
        self.assertTrue(self.jm.stop(b["id"]))
        self.assertEqual(self.jm.get(b["id"])["status"], "stopped")

    def test_legacy_radar_sh_runs_are_listed(self):
        from jobs import JobManager
        legacy = os.path.join(self.home, "runs", "20261001-160637", "xhs", "jsonl")
        os.makedirs(legacy)
        with open(os.path.join(legacy, "search_contents_2026-10-01.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps({"note_id": "x", "title": "t"}) + "\n")
        with open(os.path.join(self.home, "runs", "20261001-160637", "keywords_used.txt"), "w", encoding="utf-8") as f:
            f.write("有没有app可以\n")
        jm = JobManager(self.home, mc_dir=self.mc, mc_python=sys.executable)
        j = jm.get("20261001-160637")
        self.assertTrue(j["legacy"])
        self.assertEqual(j["spec"]["platforms"], ["xhs"])
        self.assertEqual(j["spec"]["keywords"], ["有没有app可以"])
        self.assertEqual(j["created"], "2026-10-01 16:06:37")


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import server
        cls.home, cls.mc, fake_http = make_home()
        os.environ["RADAR_FAKE_HTTP"] = fake_http
        cls.app = server.App(home=cls.home, mc_dir=cls.mc, mc_python=sys.executable, auto_check=False)
        cls.port = server.free_port(0)
        cls.httpd = server.serve(cls.app, cls.port)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.app.close()
        os.environ.pop("RADAR_FAKE_HTTP", None)
        shutil.rmtree(cls.home, ignore_errors=True)

    def call(self, path, body=None, headers=None, host=None):
        url = f"http://127.0.0.1:{self.port}{path}"
        h = {"Content-Type": "application/json"}
        if body is not None:
            h["X-Radar"] = "1"
        h.update(headers or {})
        if host:
            h["Host"] = host
        req = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(), headers=h, method="POST" if body is not None else "GET")
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:
            with opener.open(req, timeout=10) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"{}")

    def test_state_and_login(self):
        code, st = self.call("/api/state")
        self.assertEqual(code, 200)
        plats = {p["id"]: p for p in st["platforms"]}
        self.assertEqual(plats["xhs"]["login"], "saved")
        self.assertEqual(plats["dy"]["login"], "none")
        self.assertTrue(st["mc_ready"])
        self.assertTrue(any(s["name"].startswith("英文") for s in st["settings"]["keyword_sets"]))
        code, r = self.call("/api/login/xhs/clear", {})
        self.assertTrue(r["ok"])
        self.assertEqual({p["id"]: p for p in self.call("/api/state")[1]["platforms"]}["xhs"]["login"], "none")

    def test_writes_need_header_and_local_host(self):
        code, _ = self.call("/api/jobs", {"platforms": ["appstore"], "mode": "search", "keywords": ["x"]}, headers={"X-Radar": "0"})
        self.assertEqual(code, 403, "没有自定义请求头的提交（别的网站偷偷提交）要拒绝")
        code, _ = self.call("/api/state", host="evil.example.com")
        self.assertEqual(code, 403, "DNS 重绑定：Host 不是本机就拒绝")
        code, err = self.call("/api/jobs", {"platforms": [], "mode": "search", "keywords": ["x"]})
        self.assertEqual(code, 400)
        self.assertIn("平台", err["error"])

    def test_job_through_http_results_files_and_settings(self):
        code, job = self.call("/api/jobs", {"platforms": ["appstore"], "mode": "search", "keywords": ["记账"], "notes": 3, "comments": 5})
        self.assertEqual(code, 200)
        jid = job["id"]
        done = wait_for(lambda: (j := self.call(f"/api/jobs/{jid}")[1]) and j["status"] == "done" and j)
        self.assertEqual(done["totals"]["comments"], 2)
        code, res = self.call(f"/api/jobs/{jid}/results?view=all")
        self.assertEqual(len(res["rows"]), 3)
        code, log = self.call(f"/api/jobs/{jid}/log?offset=0")
        self.assertIn("App Store", log["text"])
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/jobs/{jid}/file?name=summary.md")
        with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req) as r:
            self.assertIn("attachment", r.headers["Content-Disposition"])
            self.assertIn("#", r.read().decode())
        code, st = self.call("/api/settings", {"sleep_sec": 5, "github_token": "ghp_secret", "bogus": 1})
        self.assertEqual(st["settings"]["sleep_sec"], 5)
        self.assertEqual(st["settings"]["github_token"], "已填写", "令牌不回传给页面")
        self.assertEqual(self.app.settings.env()["RADAR_GITHUB_TOKEN"], "ghp_secret")
        code, again = self.call(f"/api/jobs/{jid}/rerun", {})
        self.assertNotEqual(again["id"], jid)
        wait_for(lambda: self.call(f"/api/jobs/{again['id']}")[1]["status"] == "done")
        code, r = self.call(f"/api/jobs/{again['id']}/delete", {})
        self.assertTrue(r["ok"])
        self.assertEqual(self.call(f"/api/jobs/{again['id']}")[0], 404)

    def test_youtube_and_x_keys(self):
        plats = {p["id"]: p for p in self.call("/api/state")[1]["platforms"]}
        self.assertIs(plats["youtube"]["configured"], False)
        self.assertIs(plats["x"]["configured"], False)
        self.assertNotIn("configured", plats["reddit"], "不需要 Key 的平台不带这个标记")
        code, st = self.call("/api/settings", {"youtube_api_key": "yt-secret", "x_bearer_token": "x-secret"})
        self.assertEqual((st["settings"]["youtube_api_key"], st["settings"]["x_bearer_token"]), ("已填写", "已填写"))
        plats = {p["id"]: p for p in st["platforms"]}
        self.assertTrue(plats["youtube"]["configured"] and plats["x"]["configured"])
        # 页面把"已填写"原样存回来时不能覆盖真正的 Key
        self.call("/api/settings", {"youtube_api_key": "已填写", "x_bearer_token": "已填写"})
        env = self.app.settings.env()
        self.assertEqual((env["RADAR_YOUTUBE_KEY"], env["RADAR_X_BEARER"]), ("yt-secret", "x-secret"))
        if os.name == "posix":
            self.assertEqual(os.stat(self.app.settings.path).st_mode & 0o777, 0o600, "设置文件里有 Key，只给自己读")
        self.call("/api/settings", {"youtube_api_key": "", "x_bearer_token": ""})
        self.assertNotIn("RADAR_YOUTUBE_KEY", self.app.settings.env())

    def test_static_page_and_traversal(self):
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/")
        with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req) as r:
            self.assertIn("需求雷达", r.read().decode())
        self.assertEqual(self.call("/../server.py")[0], 404)

    def test_probe_api_source(self):
        code, r = self.call("/api/probe/appstore", {})
        self.assertTrue(r["ok"], r)
        self.assertIn("随手记账", r["message"])
        code, r = self.call("/api/probe/xhs", {})
        self.assertFalse(r["ok"])


# ---------- 线索与回复 ----------
SECRETS = {"github_token": "ghp_1", "youtube_api_key": "yt_1", "x_bearer_token": "xb_1", "anthropic_api_key": "sk-ant-1",
           "reddit_client_secret": "rs_1", "reddit_password": " pw with spaces ", "x_api_key": "xk_1", "x_api_secret": "xs_1",
           "x_access_token": "xt_1", "x_access_secret": "xts_1"}
PROFILE = {"product_name": "PlantPal", "product_pitch": "A phone app that reminds you when each plant needs water",
           "product_link": "https://plantpal.app", "sender_identity": "I'm Li, the developer of PlantPal"}
LEAD_ROWS = [  # merge.py 写的 signals.jsonl 的格式
    {"platform": "reddit", "platform_name": "Reddit", "kind": "帖子", "id": "p1", "post_id": "p1", "author": "Alice",
     "text": "Is there an app that reminds me to water my plants?", "post_title": "Plant reminder app?",
     "url": "https://www.reddit.com/r/plants/comments/p1/t/", "signals": "求工具", "score": 9},
    {"platform": "reddit", "platform_name": "Reddit", "kind": "评论", "id": "c1", "post_id": "p1", "author": "bob",
     "text": "lol same", "url": "https://www.reddit.com/r/plants/comments/p1/t/", "signals": "想要", "score": 8},
    {"platform": "xhs", "platform_name": "小红书", "kind": "评论", "id": "x1", "post_id": "n1", "author": "小李",
     "text": "有没有提醒浇水的app", "url": "https://www.xiaohongshu.com/explore/n1", "signals": "求工具", "score": 7},
    {"platform": "appstore", "platform_name": "App Store", "kind": "评论", "id": "a1", "author": "小王", "text": "广告太多", "score": 6},
    {"platform": "hn", "platform_name": "Hacker News", "kind": "评论", "id": "h1", "author": "", "text": "I wish there was a water reminder", "score": 5},
]


class FakeClaude:
    """和 anthropic.Anthropic 一样有 .beta.messages.parse：提到浇水的判合适并写回复；对方回复里有 try 的算想试用。"""

    def __init__(self):
        self.calls = []
        self.beta = SimpleNamespace(messages=SimpleNamespace(parse=self.parse))

    def parse(self, **kw):
        self.calls.append(kw)
        text = kw["messages"][0]["content"]
        if "<reply>" in text:
            hot = "try" in text.split("<reply>")[1]
            out = SimpleNamespace(intent="trial" if hot else "stop", hot=hot, summary="想试用" if hot else "让我们别再联系",
                                  suggested_reply="Here is the link: https://plantpal.app" if hot else "")
        else:
            post = text.split("<post>")[1]
            fit = "water" in post or "浇水" in post
            out = SimpleNamespace(fit=fit, fit_score=90 if fit else 10, need="想要浇水提醒" if fit else "闲聊",
                                  reason="正是产品解决的问题" if fit else "没有需求", reply_language="en",
                                  draft="Checking the soil beats a fixed schedule. I'm the developer of PlantPal, it reminds you per plant." if fit else "")
        return SimpleNamespace(stop_reason="end_turn", parsed_output=out)


class FakeReddit:
    """查表回 (状态码, 内容)，记下每个请求。"""

    def __init__(self):
        self.calls = []
        self.inbox = []

    def __call__(self, method, url, headers=None, form=None, json_body=None, timeout=30, proxy=""):
        self.calls.append((method, url, form))
        if "access_token" in url:
            return 200, {"access_token": "tok", "expires_in": 3600}
        if url.endswith("/api/comment"):
            return 200, {"json": {"errors": [], "data": {"things": [{"kind": "t1", "data": {"name": "t1_mine", "id": "mine"}}]}}}
        if "/api/v1/me" in url:
            return 200, {"name": "maker"}
        if "/message/inbox" in url:
            return 200, {"data": {"children": self.inbox}}
        return 404, {"error": "no route"}


class OutreachServerTest(unittest.TestCase):
    """「线索与回复」走真的本机服务：导入 → AI 判断 → 批准 → 用（假的）Reddit 发出 → 手动发 → 记回复 → 查回复。"""

    @classmethod
    def setUpClass(cls):
        import server
        cls.home, cls.mc, _ = make_home()
        cls.claude, cls.reddit = FakeClaude(), FakeReddit()
        cls.app = server.App(home=cls.home, mc_dir=cls.mc, mc_python=sys.executable, auto_check=False,
                             client_factory=lambda key, proxy: cls.claude, http=cls.reddit, sleep=lambda s: None)
        cls.opened = []
        cls.app.open_url = lambda url: cls.opened.append(url) or True  # 测试里不真开浏览器
        cls.port = server.free_port(0)
        cls.httpd = server.serve(cls.app, cls.port)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()
        run = os.path.join(cls.home, "runs", "job-a")
        os.makedirs(run)
        with open(os.path.join(run, "signals.jsonl"), "w", encoding="utf-8") as f:
            for r in LEAD_ROWS:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.app.close()
        shutil.rmtree(cls.home, ignore_errors=True)

    call = ServerTest.call

    def wait_idle(self):
        return wait_for(lambda: (st := self.call("/api/outreach")[1]) and st["task"]["kind"] is None and st["task"]["finished"] and st, timeout=10)

    def lead(self, author, st=None):
        st = st or self.call("/api/outreach")[1]
        return next(l for l in st["leads"] if l["author"] == author)

    def test_settings_mask_every_secret_and_clamp(self):
        import server
        self.assertTrue(set(SECRETS) <= server.SECRET_KEYS)
        code, st = self.call("/api/settings", {**SECRETS, "cap_reddit": 5000, "cap_x": -3, "cap_other": "abc", "send_gap_sec": 7,
                                               "send_mode_reddit": "manual", "send_mode_x": "bogus", "product_pitch": "长" * 1500,
                                               "product_name": "名" * 400})
        self.assertEqual(code, 200)
        pub = st["settings"]
        self.assertEqual({k: pub[k] for k in SECRETS}, {k: "已填写" for k in SECRETS}, "页面上看不到任何 Key 和密码")
        self.assertEqual((pub["cap_reddit"], pub["cap_x"], pub["cap_other"], pub["send_gap_sec"]), (1000, 0, 30, 7))
        self.assertEqual((pub["send_mode_reddit"], pub["send_mode_x"]), ("manual", "api"), "发送方式只认 api / manual")
        self.assertEqual((len(pub["product_pitch"]), len(pub["product_name"])), (1000, 300))
        # 页面把"已填写"原样存回来，不能把真的值盖掉
        self.call("/api/settings", {k: "已填写" for k in SECRETS})
        real = self.app.settings.get()
        self.assertEqual({k: real[k] for k in SECRETS}, SECRETS, "密码前后的空格也保留")
        if os.name == "posix":
            self.assertEqual(os.stat(self.app.settings.path).st_mode & 0o777, 0o600)
        self.call("/api/settings", {**{k: "" for k in SECRETS}, "cap_reddit": 20, "cap_x": 20, "send_mode_reddit": "api",
                                    "product_pitch": "", "product_name": ""})
        self.assertFalse(any(self.app.settings.get()[k] for k in SECRETS))

    def test_import_judge_approve_send_reply_check(self):
        # AI 和产品资料没填：只导入，不判断
        self.call("/api/settings", {**{k: "" for k in SECRETS}, "reddit_client_id": "", "reddit_username": "", "product_name": ""})
        code, r = self.call("/api/outreach/import", {"job": "job-a", "judge": True})
        self.assertEqual(code, 200, r)
        self.assertEqual(r["import"], {"added": 3, "dup": 0, "blocked": 0, "no_contact": 1, "no_author": 1})
        self.assertFalse(r["judging"])
        self.assertIn("Anthropic API key", r["judge_error"])
        st = self.call("/api/outreach")[1]
        self.assertEqual(st["ready"], {"ai": False, "profile": False, "reddit": False, "x": False})
        self.assertEqual(st["modes"]["reddit"], "manual", "Reddit 账号没填就只能手动发")

        self.call("/api/settings", {"anthropic_api_key": "sk-test", **PROFILE, "reddit_client_id": "cid", "reddit_client_secret": "cs",
                                    "reddit_username": "maker", "reddit_password": "pw", "send_gap_sec": 0})
        code, r = self.call("/api/outreach/import", {"job": "job-a", "judge": True})
        self.assertEqual(r["import"]["dup"], 3, "同一条、同一个人不重复导入")
        self.assertTrue(r["judging"], r)
        st = self.wait_idle()
        self.assertEqual({l["author"]: l["status"] for l in st["leads"]}, {"Alice": "draft", "bob": "unfit", "小李": "draft"})
        self.assertEqual((st["modes"]["reddit"], st["modes"]["xhs"]), ("api", "manual"))
        self.assertIn("I'm Li, the developer of PlantPal", self.claude.calls[0]["system"][0]["text"])
        alice, xhs = self.lead("Alice", st), self.lead("小李", st)

        code, err = self.call(f"/api/outreach/leads/{alice['id']}", {"action": "bogus"})
        self.assertEqual(code, 400)
        self.assertIn("bogus", err["error"])
        self.assertEqual(self.call("/api/outreach/leads/no-such-lead", {"action": "approve"})[0], 400)
        code, _ = self.call("/api/outreach/send", {"ids": [alice["id"]]}, headers={"X-Radar": "0"})
        self.assertEqual(code, 403, "没有自定义请求头的提交不能发")

        mine = "Soil check beats a schedule. I'm the developer of PlantPal, it pings you per plant."
        code, lead = self.call(f"/api/outreach/leads/{alice['id']}", {"draft": mine, "action": "approve"})
        self.assertEqual((lead["status"], lead["edited"]), ("approved", True))
        code, r = self.call("/api/outreach/send", {"ids": [alice["id"]]})
        self.assertEqual(r, {"queued": 1, "manual": []})
        st = self.wait_idle()
        alice = self.lead("Alice", st)
        self.assertEqual((alice["status"], alice["sent_via"], alice["sent_ref"]), ("sent", "api", "t1_mine"))
        self.assertEqual(st["today"]["reddit"]["sent"], 1)
        posted = [form for m, url, form in self.reddit.calls if url.endswith("/api/comment")]
        self.assertEqual(posted, [{"api_type": "json", "thing_id": "t3_p1", "text": mine}], "发出去的是你改过的那版")

        # 手动发的平台：复制并打开 → 我已发出 → 把对方回复贴进来
        code, info = self.call(f"/api/outreach/leads/{xhs['id']}/open", {})
        self.assertEqual((info["url"], info["opened"]), ("https://www.xiaohongshu.com/explore/n1", True))
        self.assertIn("PlantPal", info["draft"])
        self.assertEqual(self.opened[-1], info["url"])
        self.assertEqual(self.lead("小李")["status"], "approved")
        code, lead = self.call(f"/api/outreach/leads/{xhs['id']}/sent", {})
        self.assertEqual((lead["status"], lead["sent_via"]), ("sent", "manual"))
        self.assertEqual(self.call(f"/api/outreach/leads/{xhs['id']}/reply", {"text": " "})[0], 400)
        code, lead = self.call(f"/api/outreach/leads/{xhs['id']}/reply", {"text": "can I try it?"})
        self.assertEqual((lead["status"], lead["hot"], lead["replies"][0]["intent"]), ("replied", True, "trial"))
        self.assertEqual(self.call("/api/jobs")[1]["hot"], 1, "侧栏热线索数字")

        # 查回复：Reddit 收件箱里回的是我们那条评论 → 记到 Alice 名下；说别再联系 → 拉黑
        self.reddit.inbox = [{"kind": "t1", "data": {"name": "t1_r9", "parent_id": "t1_mine", "author": "Alice",
                                                     "body": "please stop messaging me", "created_utc": time.time()}}]
        code, r = self.call("/api/outreach/check", {})
        self.assertEqual(r["platforms"], ["reddit"])
        st = self.wait_idle()
        alice = self.lead("Alice", st)
        self.assertEqual((alice["status"], alice["hot"], alice["replies"][0]["intent"]), ("replied", False, "stop"))
        self.assertIn("1 条新回复", st["task"]["message"])
        self.assertTrue(self.app.outreach.store.is_blocked("reddit", "alice"))

        # 不合适的可以恢复；已经发出去的不能删
        bob = self.lead("bob", st)
        self.assertEqual(self.call(f"/api/outreach/leads/{bob['id']}", {"action": "restore"})[1]["status"], "new")
        self.assertEqual(self.call(f"/api/outreach/leads/{alice['id']}", {"action": "delete"})[0], 400)
        self.assertEqual(self.call("/api/outreach/stop", {})[1], {"ok": False})
        self.assertEqual(self.call("/api/outreach/nope", {})[0], 404)

    def test_open_url_only_http(self):
        import server
        app = server.App.__new__(server.App)
        for bad in ("javascript:alert(1)", "file:///etc/passwd", "/Applications/Calculator.app", "", "https://x.com/a b", "https://x.com/a\n"):
            self.assertFalse(app.open_url(bad), bad)

    def test_job_list_marks_signals_file(self):
        os.makedirs(os.path.join(self.home, "runs", "job-b"), exist_ok=True)
        with open(os.path.join(self.home, "runs", "job-b", "job.json"), "w", encoding="utf-8") as f:
            json.dump({"id": "job-b", "created": "2026-10-03 10:00:00", "status": "done", "spec": {"platforms": ["hn"]}, "steps": []}, f)
        self.app.jobs._load()
        jobs = {j["id"]: j for j in self.app.job_list()}
        self.assertIs(jobs["job-b"]["signals_file"], False, "没有 signals.jsonl 的任务界面上提示先重新打分")



# ---------- 真浏览器里点「线索与回复」 ----------
UI_SCRIPT = r"""
import { createRequire } from 'module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('playwright');
const out = { errors: [] };
let browser;
try { browser = await chromium.launch(); } catch (e) { console.log(JSON.stringify({ nobrowser: String(e) })); process.exit(0); }
const page = await browser.newPage();
page.on('pageerror', (e) => out.errors.push(e.message));
await page.goto(`http://127.0.0.1:${process.argv[3]}/#/leads`);
await page.waitForSelector('#ltabs button[data-lt="all"]');
await page.click('#ltabs button[data-lt="all"]');
await page.waitForSelector('article[data-id="xhs-b"] textarea[data-draft]');
out.acts = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('article.lead')].map((a) => [a.dataset.id, [...a.querySelectorAll('[data-act]')].map((b) => b.dataset.act)])));
// A 记录对方回复（AI 要读 2 秒）；这期间在 B 的草稿框里改字
await page.fill('article[data-id="xhs-a"] textarea[data-reply]', '谢谢');
await page.click('article[data-id="xhs-a"] button[data-act="reply"]');
const b = 'article[data-id="xhs-b"] textarea[data-draft]';
await page.click(b);
await page.keyboard.press('Control+A');
await page.keyboard.type('EDITED BY ME 我是 PlantPal 的开发者');
await page.waitForTimeout(3500);
out.after = await page.evaluate((sel) => ({ value: document.querySelector(sel)?.value, focused: document.activeElement === document.querySelector(sel) }), b);
await page.click('article[data-id="xhs-b"] button[data-act="open"]');
await page.waitForTimeout(1000);
// 待发送：「发送全部待发送」不算不确定的那条
await page.click('#ltabs button[data-lt="queue"]');
await page.waitForTimeout(300);
out.queue = await page.evaluate(() => document.querySelector('[data-b="queue"]')?.textContent || '');
// 不确定的那条：点「没发出去」要先确认
await page.click('article[data-id="rd-u"] button[data-act="unsent"]');
await page.click('dialog.modal button[value="yes"]');
await page.waitForTimeout(1000);
console.log(JSON.stringify(out));
await browser.close();
"""


class LeadsUiTest(unittest.TestCase):
    """在真浏览器里点「线索与回复」页面（本机有 node 和 playwright 才跑）。"""

    @classmethod
    def setUpClass(cls):
        import server
        node, npm = shutil.which("node"), shutil.which("npm")
        root = ""
        if node and npm:
            try:
                root = subprocess.run([npm, "root", "-g"], capture_output=True, text=True, timeout=60).stdout.strip()
            except (OSError, subprocess.SubprocessError):
                root = ""
        if not (root and os.path.isdir(os.path.join(root, "playwright"))):
            raise unittest.SkipTest("没装 node + playwright，跳过真浏览器里的界面测试")
        cls.node, cls.root = node, root
        cls.home, cls.mc, _ = make_home()
        with open(os.path.join(cls.home, "app_settings.json"), "w", encoding="utf-8") as f:
            json.dump({"anthropic_api_key": "k", "product_name": "PlantPal", "product_pitch": "water reminders", "sender_identity": "I'm the dev",
                       "reddit_client_id": "c", "reddit_client_secret": "s", "reddit_username": "maker", "reddit_password": "p"}, f)
        now = time.strftime("%Y-%m-%d %H:%M:%S")

        def lead(lid, platform, author, status, draft, **kw):
            return {"id": lid, "platform": platform, "kind": "comment", "item_id": lid, "post_id": "n1", "author": author, "author_id": "",
                    "text": "有没有提醒浇水的app", "post_title": "t", "url": "https://www.xiaohongshu.com/explore/n1", "signals": "求工具",
                    "score": 3, "likes": 0, "time": "", "job": "j", "found_at": "2026-10-03 10:00:00", "status": status, "fit_score": 90,
                    "need": "", "reason": "", "lang": "zh", "draft": draft, "edited": False, "error": "", "sent_at": "", "sent_via": "",
                    "sent_ref": "", "replies": [], "hot": False, "tried_at": "", "unsure": False, "manual": False, **kw}
        leads = [lead("xhs-a", "xhs", "小A", "sent", "我是 PlantPal 的开发者", sent_at=now, sent_via="manual"),
                 lead("xhs-b", "xhs", "小B", "draft", "ORIGINAL AI DRAFT 我是 PlantPal 的开发者"),
                 lead("xhs-k", "xhs", "小K", "draft", "我是 PlantPal 的开发者"),
                 lead("rd-u", "reddit", "uu", "failed", "I'm the dev of PlantPal", unsure=True, tried_at=now,
                      error="Reddit 出错了（502）。不确定发出去没有：先去平台上看一眼"),
                 lead("rd-f", "reddit", "ff", "failed", "I'm the dev of PlantPal", error="Reddit 拒绝了：locked"),
                 lead("rd-m", "reddit", "mm", "approved", "I'm the dev of PlantPal", manual=True)]
        os.makedirs(os.path.join(cls.home, "outreach"))
        with open(os.path.join(cls.home, "outreach", "leads.json"), "w", encoding="utf-8") as f:
            json.dump({"version": 1, "leads": {l["id"]: l for l in leads}, "blocked": [["xhs", "小k"]]}, f, ensure_ascii=False)

        def slow_read(**kw):
            time.sleep(2)
            return SimpleNamespace(stop_reason="end_turn", parsed_output=SimpleNamespace(intent="positive", hot=False, summary="客气", suggested_reply=""))
        client = SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(parse=slow_read)))
        cls.app = server.App(home=cls.home, mc_dir=cls.mc, mc_python=sys.executable, auto_check=False,
                             client_factory=lambda key, proxy: client, http=lambda *a, **k: (404, {}))
        cls.app.open_url = lambda url: True
        cls.app.copy_text = lambda text: True
        cls.posts = []
        real = cls.app.outreach_post
        cls.app.outreach_post = lambda path, body: (cls.posts.append((path, body)), real(path, body))[1]
        cls.port = server.free_port(0)
        cls.httpd = server.serve(cls.app, cls.port)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.app.close()
        shutil.rmtree(cls.home, ignore_errors=True)

    def test_leads_page(self):
        script = os.path.join(self.home, "ui.mjs")
        with open(script, "w", encoding="utf-8") as f:
            f.write(UI_SCRIPT)
        r = subprocess.run([self.node, script, self.root, str(self.port)], capture_output=True, text=True, timeout=120)
        self.assertEqual(r.returncode, 0, r.stderr)
        out = json.loads(r.stdout.strip().splitlines()[-1])
        if "nobrowser" in out:
            self.skipTest("playwright 没装浏览器：" + out["nobrowser"][:200])
        self.assertEqual(out["errors"], [])
        acts = out["acts"]
        # 不确定发出去没有的：只能「已经发出去了」或「没发出去」，没有「重试发送」
        self.assertEqual(acts["rd-u"], ["sent", "unsent", "block"])
        self.assertIn("retry", acts["rd-f"])
        # 点过「改为手动发」的（服务端记着）：即使 Reddit 是自动发，也只给复制并打开 / 我已发出
        self.assertIn("open", acts["rd-m"])
        self.assertNotIn("send", acts["rd-m"])
        self.assertEqual(acts["xhs-k"], [], "不再联系名单里的人没有任何发送按钮")
        # 别的操作做完后页面重画：正在改的草稿不能被旧内容盖掉，「复制并打开」也不能把旧内容存回去
        self.assertEqual(out["after"], {"value": "EDITED BY ME 我是 PlantPal 的开发者", "focused": True})
        drafts = [b["draft"] for path, b in self.posts if path == "/api/outreach/leads/xhs-b" and "draft" in b]
        self.assertNotIn("ORIGINAL AI DRAFT 我是 PlantPal 的开发者", drafts)
        self.assertEqual(self.app.outreach.store.get("xhs-b")["draft"], "EDITED BY ME 我是 PlantPal 的开发者")
        self.assertIn("（1 条）", out["queue"], "「发送全部待发送」不算不确定发出去没有的那条")
        self.assertIn(("/api/outreach/leads/rd-u", {"action": "unsent"}), self.posts)
        self.assertFalse(self.app.outreach.store.get("rd-u")["unsure"])


if __name__ == "__main__":
    unittest.main()
