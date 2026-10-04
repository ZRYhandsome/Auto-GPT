"""YouTube 和 X 两个数据源的测试，各数据源都记下作者，merge.py 写出 signals.jsonl。
接口返回用录好的样例数据，不联网。

运行：python -m unittest discover tests
"""
import contextlib
import csv
import glob
import io
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
from sources import appstore, github, hn, reddit, x, youtube  # noqa: E402
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


# ---------- 作者（Reddit / HN / GitHub / App Store 的样例，按各自接口的格式） ----------
REDDIT_POSTS = {"data": [
    {"id": "abc123", "title": "Is there an app that reminds me to water plants?", "selftext": "I keep forgetting", "score": 420,
     "num_comments": 2, "created_utc": 1758000000, "permalink": "/r/SomebodyMakeThis/comments/abc123/x/",
     "subreddit": "SomebodyMakeThis", "author": "plant_lady", "author_fullname": "t2_aaa"},
    {"id": "def456", "title": "Is there a tool that tracks my receipts?", "selftext": "", "score": 3, "num_comments": 0,
     "created_utc": 1758000000, "permalink": "/r/SomebodyMakeThis/comments/def456/y/", "subreddit": "SomebodyMakeThis",
     "author": "[deleted]"}]}
REDDIT_TREE = {"data": [
    {"kind": "t1", "data": {"id": "c1", "body": "I'd happily pay for this", "score": 88, "created_utc": 1758000100,
                            "author": "Buyer_Bob", "author_fullname": "t2_bbb", "parent_id": "t3_abc123",
                            "replies": {"data": {"children": [
                                {"kind": "t1", "data": {"id": "c2", "body": "same, take my money", "score": 5, "parent_id": "t1_c1",
                                                        "created_utc": 1758000200, "author": "[deleted]", "author_fullname": "t2_ccc",
                                                        "replies": ""}}]}}}}]}
HN_STORIES = {"hits": [{"objectID": "111", "title": "Ask HN: Is there a tool for tracking freelance invoices?", "author": "ann"}]}
HN_COMMENT_HITS = {"hits": [{"objectID": "222", "story_id": 333, "story_title": "What do you wish existed?", "parent_id": 333,
                             "comment_text": "<p>I wish there was an app for splitting rent</p>", "created_at_i": 1758000000,
                             "author": "renter"}]}
HN_ITEM = {"id": 111, "type": "story", "author": "ann", "title": "Ask HN: Is there a tool for tracking freelance invoices?",
           "text": "", "points": 150, "created_at_i": 1758000000, "children": [
               {"id": 112, "type": "comment", "author": "fred", "text": "Would pay for this", "created_at_i": 1758000100,
                "parent_id": 111, "children": [
                    {"id": 113, "type": "comment", "author": None, "text": "me too", "created_at_i": 1758000200, "parent_id": 112,
                     "children": []}]}]}
GH_SEARCH = {"items": [{"id": 9, "number": 5, "title": "Feature request: dark mode", "body": "please add dark mode",
                        "html_url": "https://github.com/o/r/issues/5", "comments": 2,
                        "comments_url": "https://api.github.com/repos/o/r/issues/5/comments", "reactions": {"+1": 321},
                        "created_at": "2026-01-01T00:00:00Z", "repository_url": "https://api.github.com/repos/o/r", "state": "open",
                        "user": {"login": "octocat", "id": 583231}}]}
GH_COMMENTS = [{"id": 77, "body": "+1, would pay for this", "created_at": "2026-01-02T00:00:00Z", "reactions": {"+1": 12},
                "user": {"login": "dev-dan", "id": 42}},
               {"id": 78, "body": "me too", "created_at": "2026-01-03T00:00:00Z", "user": {"login": "ghost", "id": 10137}}]
APP_SEARCH = {"results": [{"trackId": 1050106939, "trackName": "随手记账", "sellerName": "某某科技", "artistId": 31415926,
                           "primaryGenreName": "财务", "averageUserRating": 3.2, "userRatingCount": 12000, "formattedPrice": "免费",
                           "description": "记账软件", "trackViewUrl": "https://apps.apple.com/cn/app/id1050106939",
                           "currentVersionReleaseDate": "2026-09-01T00:00:00Z"}]}
# 苹果真实的 RSS 里作者带着一个空的 label，昵称在 name 里
APP_RSS = {"feed": {"entry": [
    {"author": {"uri": {"label": "https://itunes.apple.com/cn/reviews/id987654321"}, "name": {"label": "小王"}, "label": ""},
     "im:version": {"label": "5.1"}, "im:rating": {"label": "1"}, "id": {"label": "r1"}, "title": {"label": "广告太多了"},
     "content": {"label": "开屏广告忍无可忍，希望能加一个关闭广告的会员"}, "im:voteSum": {"label": "37"},
     "im:voteCount": {"label": "40"}, "updated": {"label": "2026-09-20T08:00:00-07:00"}}]}}
SIGNAL_KEYS = ["platform", "platform_name", "kind", "id", "post_id", "author", "author_id", "text", "post_title", "post_type",
               "url", "signals", "score", "likes", "replies", "time", "keyword"]


def write_jsonl(root, platform, kind, rows):
    d = os.path.join(root, platform, "jsonl")
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f"search_{kind}_2026-10-01.jsonl"), "a", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


class AuthorTest(Base):
    def setUp(self):
        super().setUp()
        self.subs = os.environ.get("RADAR_REDDIT_SUBS")
        os.environ["RADAR_REDDIT_SUBS"] = "SomebodyMakeThis"
        # Reddit 至少停 2 秒、GitHub 搜索至少停 6 秒，测试里不停
        self.saved_pause = {mod: mod.pause for mod in (reddit, github)}
        for mod in self.saved_pause:
            mod.pause = lambda base: None

    def tearDown(self):
        for mod, fn in self.saved_pause.items():
            mod.pause = fn
        if self.subs is None:
            os.environ.pop("RADAR_REDDIT_SUBS", None)
        else:
            os.environ["RADAR_REDDIT_SUBS"] = self.subs
        super().tearDown()

    def run_reddit(self, out=None):
        self.fake(reddit, [("posts/search", REDDIT_POSTS), ("comments/tree", REDDIT_TREE)])
        reddit.run(opts(keywords=["plants"], sub=True), Writer(out or self.tmp, "reddit", "search"))

    def test_reddit_records_authors(self):
        self.run_reddit()
        posts = {p["note_id"]: p for p in read(os.path.join(self.tmp, "reddit/jsonl/*contents*"))}
        comments = {c["comment_id"]: c for c in read(os.path.join(self.tmp, "reddit/jsonl/*comments*"))}
        self.assertEqual((posts["abc123"]["nickname"], posts["abc123"]["user_id"]), ("plant_lady", "t2_aaa"))
        self.assertEqual((posts["def456"]["nickname"], posts["def456"]["user_id"]), ("", ""))  # 删号的记成空
        self.assertEqual((comments["c1"]["nickname"], comments["c1"]["user_id"]), ("Buyer_Bob", "t2_bbb"))
        self.assertEqual((comments["c2"]["nickname"], comments["c2"]["user_id"]), ("", ""))
        # 详情页兜底（帖子没取到）也带着这两个字段
        self.assertEqual(reddit.author_of({"id": "x"}), ("", ""))

    def test_hn_records_authors(self):
        self.fake(hn, [("tags=story", HN_STORIES), ("tags=comment", HN_COMMENT_HITS), ("/items/111", HN_ITEM)])
        hn.run(opts(keywords=["invoice"], sub=True), Writer(self.tmp, "hn", "search"))
        posts = {p["note_id"]: p for p in read(os.path.join(self.tmp, "hn/jsonl/*contents*"))}
        comments = {c["comment_id"]: c for c in read(os.path.join(self.tmp, "hn/jsonl/*comments*"))}
        self.assertEqual((posts["111"]["nickname"], posts["111"]["user_id"]), ("ann", "ann"))
        self.assertEqual(posts["333"]["nickname"], "")  # 只从评论里知道这个帖子，不知道发帖人
        self.assertEqual((comments["112"]["nickname"], comments["112"]["user_id"]), ("fred", "fred"))
        self.assertEqual(comments["113"]["nickname"], "")  # 删掉的评论没有作者
        self.assertEqual((comments["222"]["nickname"], comments["222"]["user_id"]), ("renter", "renter"))

    def test_github_records_authors(self):
        self.fake(github, [("search/issues", GH_SEARCH), ("issues/5/comments", GH_COMMENTS)])
        github.run(opts(keywords=["dark mode"]), Writer(self.tmp, "github", "search"))
        post = read(os.path.join(self.tmp, "github/jsonl/*contents*"))[0]
        comments = read(os.path.join(self.tmp, "github/jsonl/*comments*"))
        self.assertEqual((post["nickname"], post["user_id"]), ("octocat", "583231"))
        self.assertEqual([(c["nickname"], c["user_id"]) for c in comments], [("dev-dan", "42"), ("", "")])  # ghost = 注销的账号

    def test_appstore_records_review_authors(self):
        self.fake(appstore, [("itunes.apple.com/search", APP_SEARCH), ("sortby=mosthelpful", APP_RSS)])
        appstore.run(opts(keywords=["记账"]), Writer(self.tmp, "appstore", "search"))
        post = read(os.path.join(self.tmp, "appstore/jsonl/*contents*"))[0]
        review = read(os.path.join(self.tmp, "appstore/jsonl/*comments*"))[0]
        self.assertEqual((post["nickname"], post["user_id"]), ("某某科技", "31415926"))
        self.assertEqual((review["nickname"], review["user_id"]), ("小王", "987654321"))
        self.assertTrue(review["content"].startswith("【1星】广告太多了"))
        web = appstore.parse_catalog_reviews({"data": [{"id": "w1", "attributes": {"rating": 2, "review": "x", "userName": "u"}}]})
        self.assertEqual((web[0]["author"], web[0]["author_id"]), ("u", ""))

    def test_merge_load_reads_author_keys(self):
        write_jsonl(self.tmp, "xhs", "contents", [{"note_id": "n1", "title": "有没有app可以记衣服", "nickname": "小红", "user_id": "u1"}])
        write_jsonl(self.tmp, "xhs", "comments", [{"comment_id": "c1", "note_id": "n1", "content": "同求", "nickname": "阿青",
                                                    "user_id": "u2", "parent_comment_id": 0}])
        write_jsonl(self.tmp, "douyin", "comments", [{"comment_id": "d1", "aweme_id": "a1", "content": "蹲安卓", "nickname": "抖友",
                                                       "sec_uid": "MS4w"}])
        write_jsonl(self.tmp, "zhihu", "contents", [{"content_id": "z1", "title": "问题", "content_text": "求推荐", "user_nickname": "知友",
                                                      "user_id": "zid"}])
        write_jsonl(self.tmp, "web", "contents", [{"note_id": "p1", "title": "a", "author": "someone", "author_id": "9"},
                                                   {"note_id": "p2", "title": "b", "screen_name": "tw"},
                                                   {"note_id": "p3", "title": "c"}])
        items, _ = merge.load(self.tmp)
        got = {i["id"]: (i["author"], i["author_id"]) for i in items}
        self.assertEqual(got, {"n1": ("小红", "u1"), "c1": ("阿青", "u2"), "d1": ("抖友", "MS4w"), "z1": ("知友", "zid"),
                               "p1": ("someone", "9"), "p2": ("tw", ""), "p3": ("", "")})

    def test_merge_writes_signals_jsonl(self):
        self.run_reddit()
        # MediaCrawler 的抖音目录叫 douyin，signals.jsonl 里要记软件里的平台 ID dy
        write_jsonl(self.tmp, "douyin", "contents", [{"aweme_id": "a1", "title": "", "desc": "为什么没有人做一个老人专用的防诈骗app",
                                                       "liked_count": "5000", "comment_count": "800", "nickname": "老王",
                                                       "user_id": "dy-1", "aweme_url": "https://www.douyin.com/video/a1",
                                                       "source_keyword": "为什么没有人做", "create_time": 1758000000}])
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            self.assertEqual(merge.main(self.tmp), 0)
        with open(os.path.join(self.tmp, "signals.jsonl"), encoding="utf-8") as f:
            raw = f.read()
        rows = [json.loads(line) for line in raw.splitlines() if line.strip()]
        with open(os.path.join(self.tmp, "需求信号.csv"), encoding="utf-8-sig") as f:
            table = list(csv.reader(f))
        # CSV 的列不变；signals.jsonl 和 需求信号.csv 行数、顺序一致
        self.assertEqual(table[0], ["平台", "类型", "需求信号", "得分", "内容", "点赞", "回复数", "所属帖子", "帖子类型", "链接", "搜索词", "时间"])
        self.assertEqual(len(rows), len(table) - 1)
        self.assertEqual([(r["text"], str(r["score"])) for r in rows], [(t[4], t[3]) for t in table[1:]])
        self.assertIn(f"其中 {len(rows)} 条命中需求信号。", out.getvalue())  # jobs.py 读这一行
        self.assertTrue(all(list(r) == SIGNAL_KEYS for r in rows))
        self.assertIn("老人专用", raw)  # 中文原样写，不转成 \\u
        by_id = {r["id"]: r for r in rows}
        post, buyer = by_id["abc123"], by_id["c1"]
        self.assertEqual((post["platform"], post["platform_name"], post["kind"]), ("reddit", "Reddit", "帖子"))
        self.assertEqual((post["author"], post["author_id"], post["post_id"]), ("plant_lady", "t2_aaa", "abc123"))
        self.assertEqual((buyer["kind"], buyer["author"], buyer["author_id"], buyer["post_id"]), ("评论", "Buyer_Bob", "t2_bbb", "abc123"))
        self.assertEqual(buyer["url"], "https://www.reddit.com/r/SomebodyMakeThis/comments/abc123/x/")
        self.assertEqual(buyer["post_title"], "Is there an app that reminds me to water plants?")
        self.assertEqual((buyer["likes"], buyer["keyword"]), (88, "plants"))
        self.assertIsInstance(buyer["score"], float)
        self.assertTrue(buyer["signals"])
        dy = by_id["a1"]
        self.assertEqual((dy["platform"], dy["platform_name"], dy["author"], dy["author_id"]), ("dy", "抖音", "老王", "dy-1"))

    def test_signals_jsonl_empty_when_nothing_hits(self):
        write_jsonl(self.tmp, "xhs", "contents", [{"note_id": "n1", "title": "今天的晚饭", "desc": "好吃", "nickname": "小红"}])
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(merge.main(self.tmp), 0)
        with open(os.path.join(self.tmp, "signals.jsonl"), encoding="utf-8") as f:
            self.assertEqual(f.read(), "")


if __name__ == "__main__":
    unittest.main()


class SinceTest(unittest.TestCase):
    """选了"只要多久以内的"：能按时间搜的网站，搜索时就只要这段时间的。"""

    def setUp(self):
        self.saved = {}
        self.env = {k: os.environ.get(k) for k in ("RADAR_SINCE", "RADAR_YOUTUBE_KEY", "RADAR_X_BEARER")}

    def tearDown(self):
        for mod, fn in self.saved.items():
            mod.get_json = fn
        for k, v in self.env.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v

    def fake(self, mod, resp):
        self.saved.setdefault(mod, mod.get_json)
        f = FakeHttp([("", resp)])
        mod.get_json = f
        return f

    def query(self, f):
        return urllib.parse.parse_qs(urllib.parse.urlparse(f.calls[0][0]).query)

    def test_search_params(self):
        from sources import github, hn, reddit
        from sources.common import since_epoch
        os.environ["RADAR_SINCE"] = "2025-01-01"
        f = self.fake(reddit, {"data": []})
        reddit.search("SaaS", "alternative to", 5)
        self.assertEqual(self.query(f)["after"], ["2025-01-01"])
        f = self.fake(hn, {"hits": []})
        hn.search("invoice", "story", 5)
        self.assertEqual(self.query(f)["numericFilters"], [f"created_at_i>{since_epoch()}"])
        f = self.fake(github, {"items": []})
        github.search("dark mode", 5)
        self.assertEqual(self.query(f)["q"], ["dark mode is:issue created:>=2025-01-01"])
        os.environ["RADAR_YOUTUBE_KEY"] = "k"
        f = self.fake(youtube, {"items": []})
        youtube.search("budget app", 5)
        self.assertEqual(self.query(f)["publishedAfter"], ["2025-01-01T00:00:00Z"])
        os.environ["RADAR_X_BEARER"] = "b"
        f = self.fake(x, {"data": []})
        x.search("app", 10)
        self.assertNotIn("start_time", self.query(f), "X 只能搜 7 天，更早的日期不用传")

    def test_x_start_time_inside_week_and_reddit_window(self):
        from datetime import datetime, timedelta
        from sources import reddit
        day = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
        os.environ["RADAR_SINCE"] = day
        os.environ["RADAR_X_BEARER"] = "b"
        f = self.fake(x, {"data": []})
        x.search("app", 10)
        self.assertEqual(self.query(f)["start_time"], [f"{day}T00:00:00Z"])
        self.assertEqual(reddit.reddit_window(), "week")
        os.environ["RADAR_SINCE"] = ""
        self.assertEqual(reddit.reddit_window(), "all")

    def test_no_since_no_params(self):
        from sources import github, hn
        os.environ.pop("RADAR_SINCE", None)
        f = self.fake(hn, {"hits": []})
        hn.search("invoice", "story", 5)
        self.assertNotIn("numericFilters", self.query(f))
        f = self.fake(github, {"items": []})
        github.search("dark mode created:>2020-01-01", 5)
        self.assertEqual(self.query(f)["q"], ["dark mode created:>2020-01-01 is:issue"])
        os.environ["RADAR_SINCE"] = "2025-01-01"
        f = self.fake(github, {"items": []})
        github.search("dark mode created:>2020-01-01", 5)
        self.assertEqual(self.query(f)["q"], ["dark mode created:>2020-01-01 is:issue"], "自己写了 created: 就不再加")
