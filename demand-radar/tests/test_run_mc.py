"""run_mc.py 的测试：用一个假的 MediaCrawler（目录结构和类名照真的来）跑小红书搜索，
看一条笔记出错时是否跳过、被平台拦住时是否停手、保存数据、报出没抓完的关键词。

运行：python -m unittest discover tests
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FILES = {
    "config.py": """
        KEYWORDS = ""
        CDP_CONNECT_EXISTING = False
        AUTO_CLOSE_BROWSER = False
        SAVE_LOGIN_STATE = False
        SORT_TYPE = ""
        CRAWLER_MAX_SLEEP_SEC = 2
        OUT = ""
    """,
    "tools/__init__.py": "",
    "tools/utils.py": """
        import logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger("MediaCrawler")
    """,
    "playwright/__init__.py": "",
    "playwright/async_api.py": """
        class Page:
            async def goto(self, url, **kwargs):
                return None
        class TimeoutError(Exception):
            pass
    """,
    "media_platform/__init__.py": "",
    "media_platform/xhs/__init__.py": "",
    "media_platform/xhs/exception.py": """
        class DataFetchError(Exception):
            pass

        class _Attempt:
            def __init__(self, exc):
                self._exc = exc
            def exception(self):
                return self._exc

        class RetryError(Exception):
            '''和 tenacity.RetryError 一样：真正的错误在 last_attempt 里。'''
            def __init__(self, exc):
                self.last_attempt = _Attempt(exc)
                super().__init__(f"RetryError[<Future at 0x1 state=finished raised {type(exc).__name__}>]")
    """,
    "media_platform/xhs/client.py": """
        import os
        import config

        NOTES = {"k1": ["n1", "n2"], "k2": ["n3", "n4"], "k3": ["n5"], "k4": ["n6"]}

        class XiaoHongShuClient:
            async def get_note_by_keyword(self, keyword, page=1, **kwargs):
                with open(os.path.join(config.OUT, "searched.txt"), "a", encoding="utf-8") as f:
                    f.write(keyword + "\\n")
                return {"has_more": True, "items": [{"id": i} for i in NOTES.get(keyword, [])]}
    """,
    "media_platform/xhs/core.py": """
        import asyncio
        import json
        import os
        import config
        from .client import XiaoHongShuClient
        from .exception import DataFetchError, RetryError

        def write(kind, item):
            d = os.path.join(config.OUT, "xhs", "jsonl")
            os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, f"search_{kind}_2026-10-03.jsonl"), "a", encoding="utf-8") as f:
                f.write(json.dumps(item, ensure_ascii=False) + "\\n")

        class XiaoHongShuCrawler:
            '''照 MediaCrawler 的 search 写：只接住 DataFetchError，别的错误一路冒上去。'''
            def __init__(self):
                self.xhs_client = XiaoHongShuClient()

            async def search(self):
                for kw in config.KEYWORDS.split(","):
                    self.kw = kw
                    try:
                        res = await self.xhs_client.get_note_by_keyword(keyword=kw, page=1)
                        if not res or not res.get("has_more", False):
                            continue
                        details = await asyncio.gather(*[self.get_note_detail_async_task(
                            note_id=i["id"], xsec_source="", xsec_token="", semaphore=None) for i in res["items"]])
                        ids = []
                        for d in details:
                            if d:
                                write("contents", d)
                                ids.append(d["note_id"])
                        await asyncio.gather(*[self.get_comments(note_id=i, xsec_token="", semaphore=None) for i in ids])
                    except DataFetchError:
                        break

            async def get_note_detail_async_task(self, note_id, xsec_source, xsec_token, semaphore):
                if note_id == os.environ.get("FAIL_DETAIL"):
                    raise RetryError(ValueError("page changed"))
                return {"note_id": note_id, "title": "有没有app可以" + note_id, "source_keyword": self.kw}

            async def get_comments(self, note_id, xsec_token, semaphore):
                if note_id == "n2":
                    raise ValueError("odd comment payload")      # 普通错误：跳过这条
                if note_id == os.environ.get("BLOCK_AT", "n3"):
                    raise RetryError(KeyError("Verifytype"))     # 小红书返回了验证页
                write("comments", {"comment_id": "c-" + note_id, "note_id": note_id, "content": "谁做出来我第一个买"})
    """,
    "main.py": """
        import asyncio
        import sys
        import config
        from media_platform.xhs.core import XiaoHongShuCrawler

        args = sys.argv[1:]
        get = lambda k: args[args.index(k) + 1]
        config.KEYWORDS = get("--keywords")
        config.OUT = get("--save_data_path")
        asyncio.run(XiaoHongShuCrawler().search())
        print("crawl finished", flush=True)
    """,
}


class RunMcTest(unittest.TestCase):
    def setUp(self):
        self.mc = tempfile.mkdtemp()
        self.out = os.path.join(self.mc, "out")
        os.makedirs(self.out)
        for name, body in FILES.items():
            path = os.path.join(self.mc, name)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(textwrap.dedent(body))
        shutil.copy(os.path.join(ROOT, "run_mc.py"), self.mc)

    def tearDown(self):
        shutil.rmtree(self.mc, ignore_errors=True)

    def run_mc(self, keywords, **env):
        r = subprocess.run([sys.executable, "run_mc.py", "--platform", "xhs", "--keywords", keywords, "--save_data_path", self.out],
                           cwd=self.mc, capture_output=True, text=True, timeout=60,
                           env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1", **env})
        result = None
        for line in (r.stdout + r.stderr).splitlines():
            if line.startswith("[需求雷达·结果] "):
                result = json.loads(line.split(" ", 1)[1])
        return r, result

    def rows(self, kind):
        path = os.path.join(self.out, "xhs", "jsonl", f"search_{kind}_2026-10-03.jsonl")
        if not os.path.exists(path):
            return []
        with open(path, encoding="utf-8") as f:
            return [json.loads(x) for x in f if x.strip()]

    def searched(self):
        with open(os.path.join(self.out, "searched.txt"), encoding="utf-8") as f:
            return f.read().split()

    def test_blocked_stops_politely_and_keeps_data(self):
        r, result = self.run_mc("k1,k2,k3,k4")
        self.assertEqual(r.returncode, 3, r.stdout + r.stderr)
        # 被拦住以前抓到的都在：k1 两条、k2 两条笔记；n1、n4 之前的评论
        self.assertEqual([x["note_id"] for x in self.rows("contents")], ["n1", "n2", "n3", "n4"])
        self.assertEqual([x["note_id"] for x in self.rows("comments")], ["n1"])
        # 被拦住以后不再请求：k3、k4 直接跳过，没有发搜索请求
        self.assertEqual(self.searched(), ["k1", "k2"])
        self.assertIn("KeyError", result["blocked"])
        self.assertEqual(result["cut_keywords"], ["k2", "k3", "k4"])
        self.assertEqual(result["skipped"], 1, "n2 的评论出错只跳过这一条")
        self.assertIn("小红书拦住了请求", r.stdout)
        self.assertNotIn("Traceback", r.stdout + r.stderr)

    def test_ordinary_errors_only_skip_that_note(self):
        r, result = self.run_mc("k1,k3", BLOCK_AT="none", FAIL_DETAIL="n5")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertEqual(result, {"blocked": "", "cut_keywords": [], "skipped": 2})
        self.assertEqual([x["note_id"] for x in self.rows("contents")], ["n1", "n2"])
        self.assertIn("crawl finished", r.stdout)

    def test_clean_run_prints_no_result_line(self):
        r, result = self.run_mc("k4", BLOCK_AT="none")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIsNone(result)

    def test_describe(self):
        sys.path.insert(0, self.mc)
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("run_mc_under_test", os.path.join(self.mc, "run_mc.py"))
            cwd = os.getcwd()
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            os.chdir(cwd)
        finally:
            sys.path.remove(self.mc)
            sys.modules.pop("config", None)
        self.assertEqual(mod.describe(Exception("CAPTCHA appeared, Verifytype: 1"), "dy")[0], True)
        self.assertEqual(mod.describe(Exception("note 64f1461ab not found"), "xhs")[0], False, "笔记 ID 里的 461 不算验证码")
        self.assertEqual(mod.describe(KeyError("aweme_list"), "dy")[0], False, "只有小红书的 KeyError 当成被拦住")
        self.assertEqual(mod.describe(Exception("XHS request blocked with HTTP 429"), "xhs")[0], True)


if __name__ == "__main__":
    unittest.main()
