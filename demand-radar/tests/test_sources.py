"""YouTube 和 X 两个数据源的测试：接口返回用录好的样例数据，不联网。

运行：python -m unittest discover tests
"""
import glob
import json
import os
import shutil
import sys
import tempfile
import unittest
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "app"))

import merge  # noqa: E402
import run_source  # noqa: E402
from sources import x, youtube  # noqa: E402
from sources.common import ERRORS, FetchError, Writer  # noqa: E402

# ---------- 样例数据（按 YouTube Data API v3 和 X API v2 文档里的格式） ----------
YT_SEARCH = {"items": [{"id": {"kind": "youtube#video", "videoId": "dQw4w9WgXcQ"}},
                       {"id": {"kind": "youtube#channel", "channelId": "UCxyz"}}]}
YT_VIDEOS = {"items": [{"id": "dQw4w9WgXcQ", "snippet": {
    "title": "Best budgeting apps 2026", "description": "Which app do you use?", "publishedAt": "2026-09-01T10:00:00Z",
    "channelTitle": "Money Channel", "channelId": "UCmoney"}, "statistics": {"likeCount": "1200", "commentCount": "3"}}]}
YT_THREADS_1 = {"nextPageToken": "P2", "items": [{"id": "t1", "snippet": {"totalReplyCount": 1, "topLevelComment": {
    "id": "Ugx1", "snippet": {"textOriginal": "Is there an app that splits bills with roommates automatically? I'd pay for it",
                              "textDisplay": "x", "likeCount": 42, "publishedAt": "2026-09-02T10:00:00Z",
                              "authorDisplayName": "@sam", "authorChannelId": {"value": "UCsam"}}}},
    "replies": {"comments": [{"id": "Ugx1.r1", "snippet": {"textOriginal": "same here", "likeCount": 3,
                                                          "publishedAt": "2026-09-02T11:00:00Z", "authorDisplayName": "@kim",
                                                          "authorChannelId": {"value": "UCkim"}}}]}}]}
YT_THREADS_2 = {"items": [{"id": "t2", "snippet": {"totalReplyCount": 0, "topLevelComment": {
    "id": "Ugx2", "snippet": {"textDisplay": "great video", "likeCount": 1, "publishedAt": "2026-09-03T10:00:00Z",
                              "authorDisplayName": "@lee"}}}}]}

X_USERS = {"users": [{"id": "11", "username": "maker_amy", "name": "Amy"}, {"id": "22", "username": "bob", "name": "Bob"}]}
X_SEARCH = {"data": [{"id": "1001", "text": "Is there an app that tracks freelance invoices?\nI wish there was one",
                      "author_id": "11", "conversation_id": "1001", "created_at": "2026-09-30T08:00:00.000Z",
                      "public_metrics": {"like_count": 57, "reply_count": 2, "retweet_count": 1}}],
            "includes": X_USERS, "meta": {"result_count": 1}}
X_REPLIES = {"data": [
    {"id": "1002", "text": "@maker_amy would pay for this too", "author_id": "22", "conversation_id": "1001",
     "created_at": "2026-09-30T09:00:00.000Z", "public_metrics": {"like_count": 4, "reply_count": 1},
     "referenced_tweets": [{"type": "replied_to", "id": "1001"}]},
    {"id": "1003", "text": "@bob same", "author_id": "11", "conversation_id": "1001",
     "created_at": "2026-09-30T10:00:00.000Z", "public_metrics": {"like_count": 0, "reply_count": 0},
     "referenced_tweets": [{"type": "replied_to", "id": "1002"}]},
], "includes": X_USERS}
X_LOOKUP = {"data": X_SEARCH["data"][0], "includes": X_USERS}


def opts(**kw):
    o = {"mode": "search", "keywords": ["budget app"], "targets": [], "max_notes": 5, "max_comments": 10, "comments": True,
         "sub": False, "sleep": 0}
    o.update(kw)
    return o


def read(path_glob):
    rows = []
    for p in glob.glob(path_glob):
        with open(p, encoding="utf-8") as f:
            rows += [json.loads(line) for line in f if line.strip()]
    return rows


class FakeHttp:
    """把 get_json 换成查表：按顺序找第一个出现在网址里的片段。"""

    def __init__(self, table):
        self.table = table
        self.calls = []

    def __call__(self, url, params=None, headers=None, **kw):
        full = url + ("?" + urllib.parse.urlencode(params) if params else "")
        self.calls.append((full, headers or {}))
        for frag, resp in self.table:
            if frag in full:
                if isinstance(resp, Exception):
                    raise resp
                return resp
        raise AssertionError(f"没有准备这个网址：{full}")


class Base(unittest.TestCase):
    ENV = {}

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.saved = {}
        self.env = {k: os.environ.get(k) for k in ("RADAR_YOUTUBE_KEY", "RADAR_X_BEARER")}
        for k in self.env:
            os.environ.pop(k, None)
        os.environ.update(self.ENV)
        ERRORS.clear()

    def tearDown(self):
        for mod, fn in self.saved.items():
            mod.get_json = fn
        for k, v in self.env.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
        ERRORS.clear()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def fake(self, mod, table):
        self.saved.setdefault(mod, mod.get_json)
        f = FakeHttp(table)
        mod.get_json = f
        return f


class YouTubeTest(Base):
    ENV = {"RADAR_YOUTUBE_KEY": "k-123"}

    def test_search_videos_and_paged_comments(self):
        f = self.fake(youtube, [("/search", YT_SEARCH), ("/videos", YT_VIDEOS), ("pageToken=P2", YT_THREADS_2),
                                ("/commentThreads", YT_THREADS_1)])
        w = Writer(self.tmp, "youtube", "search")
        youtube.run(opts(sub=True), w)
        posts = read(os.path.join(self.tmp, "youtube/jsonl/*contents*"))
        comments = read(os.path.join(self.tmp, "youtube/jsonl/*comments*"))
        self.assertEqual(len(posts), 1)  # 频道结果不算视频
        p = posts[0]
        self.assertEqual((p["note_id"], p["liked_count"], p["comment_count"]), ("dQw4w9WgXcQ", 1200, 3))
        self.assertEqual(p["note_url"], "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertEqual((p["nickname"], p["source_keyword"]), ("Money Channel", "budget app"))
        self.assertIsInstance(p["time"], int)
        self.assertEqual([c["comment_id"] for c in comments], ["Ugx1", "Ugx1.r1", "Ugx2"])
        top, reply, second = comments
        self.assertEqual((top["like_count"], top["sub_comment_count"], top["parent_comment_id"]), (42, 1, 0))
        self.assertEqual((top["nickname"], top["user_id"]), ("@sam", "UCsam"))
        self.assertEqual(reply["parent_comment_id"], "Ugx1")
        self.assertEqual(second["content"], "great video")  # 没有 textOriginal 时用 textDisplay
        # key 带在每个请求上；搜索只要视频
        self.assertTrue(all("key=k-123" in u for u, _ in f.calls))
        self.assertIn("type=video", f.calls[0][0])

    def test_without_replies_and_comment_limit(self):
        self.fake(youtube, [("/search", YT_SEARCH), ("/videos", YT_VIDEOS), ("/commentThreads", YT_THREADS_1)])
        w = Writer(self.tmp, "youtube", "search")
        youtube.run(opts(max_comments=1), w)
        comments = read(os.path.join(self.tmp, "youtube/jsonl/*comments*"))
        self.assertEqual([c["comment_id"] for c in comments], ["Ugx1"])

    def test_detail_mode_links(self):
        f = self.fake(youtube, [("/videos", YT_VIDEOS), ("/commentThreads", YT_THREADS_2)])
        w = Writer(self.tmp, "youtube", "detail")
        youtube.run(opts(mode="detail", targets=["https://youtu.be/dQw4w9WgXcQ", "https://example.com/nope"]), w)
        self.assertEqual(len(read(os.path.join(self.tmp, "youtube/jsonl/*contents*"))), 1)
        self.assertIn("id=dQw4w9WgXcQ", f.calls[0][0])

    def test_video_ids(self):
        for t in ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s", "https://youtu.be/dQw4w9WgXcQ",
                  "https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ", "https://m.youtube.com/watch?feature=x&v=dQw4w9WgXcQ"]:
            self.assertEqual(youtube.video_id_of(t), "dQw4w9WgXcQ", t)
        self.assertIsNone(youtube.video_id_of("https://www.youtube.com/@channel"))

    def test_comments_disabled_is_skipped(self):
        self.fake(youtube, [("/search", YT_SEARCH), ("/videos", YT_VIDEOS), ("/commentThreads", FetchError("HTTP 403"))])
        w = Writer(self.tmp, "youtube", "search")
        youtube.run(opts(), w)
        self.assertEqual(w.counts, {"contents": 1, "comments": 0})
        self.assertEqual(len(ERRORS), 1)

    def test_merge_reads_youtube(self):
        self.fake(youtube, [("/search", YT_SEARCH), ("/videos", YT_VIDEOS), ("pageToken=P2", YT_THREADS_2),
                            ("/commentThreads", YT_THREADS_1)])
        youtube.run(opts(), Writer(self.tmp, "youtube", "search"))
        items, posts = merge.load(self.tmp)
        merge.score_items(items, posts)
        hit = next(i for i in items if i["id"] == "Ugx1")
        self.assertEqual(merge.PLATFORM_NAMES[hit["platform"]], "YouTube")
        self.assertEqual(hit["url"], "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertGreater(hit["score"], 0)


class YouTubeNoKeyTest(Base):
    def test_missing_key_fails_clearly(self):
        f = self.fake(youtube, [])
        with self.assertRaises(FetchError) as cm:
            youtube.run(opts(), Writer(self.tmp, "youtube", "search"))
        self.assertIn("YouTube API key", str(cm.exception))
        self.assertEqual(f.calls, [])

    def test_run_source_reports_missing_key(self):
        rc = run_source.main(["--platform", "youtube", "--keywords", "a", "--save_data_path", self.tmp])
        self.assertEqual(rc, 1)


class XTest(Base):
    ENV = {"RADAR_X_BEARER": "bearer-abc"}

    def test_search_and_replies(self):
        f = self.fake(x, [("query=conversation_id%3A", X_REPLIES), ("/tweets/search/recent", X_SEARCH)])
        w = Writer(self.tmp, "x", "search")
        x.run(opts(keywords=['"is there an app" lang:en']), w)
        posts = read(os.path.join(self.tmp, "x/jsonl/*contents*"))
        comments = read(os.path.join(self.tmp, "x/jsonl/*comments*"))
        p = posts[0]
        self.assertEqual((p["note_id"], p["liked_count"], p["comment_count"]), ("1001", 57, 2))
        self.assertEqual(p["note_url"], "https://x.com/maker_amy/status/1001")
        self.assertEqual(p["title"], "Is there an app that tracks freelance invoices? I wish there was one")
        self.assertEqual(p["nickname"], "maker_amy")
        self.assertEqual([c["comment_id"] for c in comments], ["1002", "1003"])
        self.assertEqual(comments[0]["parent_comment_id"], 0)
        self.assertEqual(comments[1]["parent_comment_id"], "1002")
        self.assertEqual(comments[0]["nickname"], "bob")
        # 不搜转推，Bearer Token 放在请求头里
        q = urllib.parse.parse_qs(urllib.parse.urlparse(f.calls[0][0]).query)["query"][0]
        self.assertEqual(q, '"is there an app" lang:en -is:retweet')
        self.assertEqual(f.calls[0][1]["Authorization"], "Bearer bearer-abc")
        self.assertIn("max_results=10", f.calls[0][0])  # X 要求至少 10

    def test_no_reply_fetch_when_no_replies_or_disabled(self):
        quiet = json.loads(json.dumps(X_SEARCH))
        quiet["data"][0]["public_metrics"]["reply_count"] = 0
        f = self.fake(x, [("/tweets/search/recent", quiet)])
        x.run(opts(), Writer(self.tmp, "x", "search"))
        self.assertEqual(len(f.calls), 1)
        f = self.fake(x, [("/tweets/search/recent", X_SEARCH)])
        x.run(opts(comments=False), Writer(self.tmp, "x", "search"))
        self.assertEqual(len(f.calls), 1)

    def test_keeps_explicit_retweet_operator(self):
        f = self.fake(x, [("/tweets/search/recent", {"data": []})])
        x.run(opts(keywords=["app is:retweet"]), Writer(self.tmp, "x", "search"))
        q = urllib.parse.parse_qs(urllib.parse.urlparse(f.calls[0][0]).query)["query"][0]
        self.assertEqual(q, "app is:retweet")

    def test_detail_mode(self):
        f = self.fake(x, [("query=conversation_id%3A", X_REPLIES), ("/tweets/1001", X_LOOKUP)])
        w = Writer(self.tmp, "x", "detail")
        x.run(opts(mode="detail", targets=["https://twitter.com/maker_amy/status/1001?s=20", "not a link"]), w)
        self.assertEqual(w.counts, {"contents": 1, "comments": 2})
        self.assertIn("/tweets/1001?", f.calls[0][0])

    def test_tweet_ids(self):
        self.assertEqual(x.tweet_id_of("https://x.com/a/status/1834567890123456789"), "1834567890123456789")
        self.assertEqual(x.tweet_id_of("https://mobile.twitter.com/a/statuses/123456"), "123456")
        self.assertIsNone(x.tweet_id_of("https://x.com/a"))

    def test_merge_reads_x(self):
        self.fake(x, [("query=conversation_id%3A", X_REPLIES), ("/tweets/search/recent", X_SEARCH)])
        x.run(opts(), Writer(self.tmp, "x", "search"))
        items, posts = merge.load(self.tmp)
        merge.score_items(items, posts)
        post = next(i for i in items if i["id"] == "1001")
        self.assertEqual(merge.PLATFORM_NAMES[post["platform"]], "X")
        self.assertGreater(post["score"], 0)
        self.assertEqual(merge.PLATFORM_ARGS["x"], "x")


class XNoTokenTest(Base):
    def test_missing_token_fails_clearly(self):
        f = self.fake(x, [])
        with self.assertRaises(FetchError) as cm:
            x.run(opts(), Writer(self.tmp, "x", "search"))
        self.assertIn("Bearer Token", str(cm.exception))
        self.assertEqual(f.calls, [])


if __name__ == "__main__":
    unittest.main()
