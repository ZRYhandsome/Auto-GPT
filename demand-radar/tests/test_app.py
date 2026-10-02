"""需求雷达软件的测试：数据源解析、任务执行（用假的 MediaCrawler 和录好的接口数据）、本机服务接口。

运行：python -m unittest discover tests
不联网：数据源的网络请求都换成了 RADAR_FAKE_HTTP 指定的样例数据。
"""
import glob
import json
import os
import shutil
import sys
import tempfile
import textwrap
import threading
import time
import unittest
import urllib.error
import urllib.request

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
        self.assertEqual(done["status"], "done")
        self.assertEqual((steps["xhs"]["state"], steps["xhs"]["posts"], steps["xhs"]["comments"]), ("done", 1, 3))
        self.assertEqual(steps["dy"]["state"], "failed")
        self.assertIn("登录失败", steps["dy"]["error"])
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
        cls.app = server.App(home=cls.home, mc_dir=cls.mc, mc_python=sys.executable)
        cls.port = server.free_port(0)
        cls.httpd = server.serve(cls.app, cls.port)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.app.jobs.stop_all()
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


if __name__ == "__main__":
    unittest.main()
