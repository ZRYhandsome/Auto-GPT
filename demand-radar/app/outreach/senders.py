"""发回复、查回复：只走各平台的官方接口，用的是你自己的一个账号。

- Reddit：在 reddit.com/prefs/apps 建一个 script 类型的应用，用 client id/secret 加你的用户名密码登录（OAuth password 模式）；
- X：developer.x.com 上应用权限设成 Read and write，用 API key/secret 和 access token/secret 签名（OAuth 1.0a）。
其他平台没有能用的官方发帖接口，一律「复制并打开」，你自己去发，再点「我已发出」。
"""
import base64
import hashlib
import hmac
import http.client
import json
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request

API_PLATFORMS = ("reddit", "x")
NO_CONTACT = {"appstore"}  # 不能回复别人 App 的评论


class SendError(Exception):
    """fatal=True：账号不对、被限流这类，后面的也发不出去，整批停下。
    unknown=True：请求已经发出去了，但没等到正常的回应（超时、断线、对方服务器出错），不知道回复发出去没有。"""

    def __init__(self, message, fatal=False, unknown=False):
        super().__init__(message)
        self.fatal = fatal
        self.unknown = unknown


def http_request(method, url, headers=None, form=None, json_body=None, timeout=30, proxy=""):
    """发一个请求，返回 (状态码, 内容)。内容能解析成 JSON 就解析。HTTP 错误码照样返回，连不上才抛 SendError。
    连接、发请求时出的错（urllib 包成 URLError）：对方肯定没收到。请求发出去以后等回应时出的错（超时、断线、内容不全）：
    对方可能已经收到并照做了，非 GET 请求抛 unknown=True，免得把可能已经发出去的回复当成没发、再发一遍。"""
    data = None
    headers = dict(headers or {})
    if form is not None:
        data = urllib.parse.urlencode(form).encode("utf-8")
        headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    elif json_body is not None:
        data = json.dumps(json_body, ensure_ascii=False).encode("utf-8")
        headers.setdefault("Content-Type", "application/json")
    headers.setdefault("Accept", "application/json")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    # 设置里填了代理就用填的，否则用系统代理
    opener = (urllib.request.build_opener(urllib.request.ProxyHandler({"http": proxy, "https": proxy})) if proxy
              else urllib.request.build_opener())
    try:
        with opener.open(req, timeout=timeout) as resp:
            return resp.status, _parse(resp.read())
    except urllib.error.HTTPError as e:
        try:
            body = e.read()
        except (OSError, http.client.HTTPException):
            body = b""
        return e.code, _parse(body)
    except urllib.error.URLError as e:  # 还没连上或请求没发完：对方没收到
        host = urllib.parse.urlparse(url).netloc
        raise SendError(f"连不上 {host}（{getattr(e, 'reason', e)}）。国外网站要开代理") from e
    except (OSError, http.client.HTTPException) as e:  # 请求发出去了，等回应时超时、断线、内容不全
        host = urllib.parse.urlparse(url).netloc
        raise SendError(f"{host} 没有正常回应（{type(e).__name__}: {e}）", unknown=method.upper() != "GET") from e


def _parse(raw):
    text = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else str(raw or "")
    try:
        return json.loads(text) if text.strip() else {}
    except json.JSONDecodeError:
        return text


def _detail(body):
    """从各家的错误返回里挑一句人能看懂的。"""
    if isinstance(body, dict):
        for k in ("detail", "message", "title", "error_description", "error"):
            if body.get(k) and isinstance(body[k], str):
                return body[k]
        errs = body.get("errors")
        if isinstance(errs, list) and errs and isinstance(errs[0], dict):
            return str(errs[0].get("message") or errs[0].get("detail") or errs[0])
    return str(body)[:200]


def _bare(x, prefix):
    x = str(x or "").strip()
    return x[len(prefix):] if x.startswith(prefix) else x


def thing_id(lead):
    """Reddit 的回复对象：评论是 t1_<评论ID>，帖子是 t3_<帖子ID>。"""
    if lead.get("kind") == "comment":
        return "t1_" + _bare(lead.get("item_id"), "t1_")
    return "t3_" + _bare(lead.get("post_id") or lead.get("item_id"), "t3_")


# ---------- Reddit ----------
class Reddit:
    TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
    API = "https://oauth.reddit.com"

    def __init__(self, settings, http=http_request, clock=time.time):
        self.client_id = str(settings.get("reddit_client_id") or "").strip()
        self.client_secret = str(settings.get("reddit_client_secret") or "").strip()
        self.username = str(settings.get("reddit_username") or "").strip().removeprefix("u/").removeprefix("/u/")
        self.password = str(settings.get("reddit_password") or "")
        self.proxy = str(settings.get("proxy") or "").strip()
        self.http = http or http_request
        self.clock = clock
        self._tok, self._exp = "", 0

    def ready(self):
        return bool(self.client_id and self.client_secret and self.username and self.password)

    @property
    def ua(self):
        return f"desktop:demand-radar:0.4 (by /u/{self.username})"

    def _token(self):
        if self._tok and self.clock() < self._exp:
            return self._tok
        if not self.ready():
            raise SendError("Reddit 账号还没填全（设置 → 发送账号）", fatal=True)
        basic = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode("utf-8")).decode("ascii")
        try:
            status, body = self.http("POST", self.TOKEN_URL, headers={"Authorization": "Basic " + basic, "User-Agent": self.ua},
                                     form={"grant_type": "password", "username": self.username, "password": self.password},
                                     proxy=self.proxy)
        except SendError as e:  # 只是登录没成，回复还没发：不算「不确定发出去没有」
            raise SendError(str(e), fatal=e.fatal) from e
        # 密码不对时 Reddit 也返回 200，只是内容里带 error
        if status == 401 or (isinstance(body, dict) and body.get("error") in ("invalid_grant", "unauthorized_client", 401)):
            raise SendError("Reddit 账号或密码不对，或应用的 client id/secret 不对", fatal=True)
        if status == 429:
            raise SendError("Reddit 限流了，稍后再发", fatal=True)
        if status != 200 or not isinstance(body, dict) or not body.get("access_token"):
            raise SendError(f"Reddit 登录失败（{status}）：{_detail(body)}", fatal=True)
        self._tok = body["access_token"]
        self._exp = self.clock() + max(int(body.get("expires_in") or 3600) - 60, 60)
        return self._tok

    def _call(self, method, path, form=None):
        for attempt in (0, 1):
            headers = {"Authorization": "bearer " + self._token(), "User-Agent": self.ua}
            status, body = self.http(method, self.API + path, headers=headers, form=form, proxy=self.proxy)
            if status == 401 and attempt == 0:  # 令牌过期：重新登录一次
                self._tok = ""
                continue
            if status == 401:
                raise SendError("Reddit 账号或密码不对，或应用的 client id/secret 不对", fatal=True)
            if status == 429:
                raise SendError("Reddit 限流了，稍后再发", fatal=True)
            if status >= 500:  # 发回复时服务器出错：评论可能已经建好了
                if method == "POST":
                    raise SendError(f"Reddit 出错了（{status}）", unknown=True)
                raise SendError(f"Reddit 出错了（{status}），稍后再试")
            return status, body
        return status, body

    def whoami(self):
        status, body = self._call("GET", "/api/v1/me")
        if status != 200 or not isinstance(body, dict) or not body.get("name"):
            raise SendError(f"Reddit 没认出这个账号（{status}）：{_detail(body)}")
        return body["name"]

    def reply(self, lead, text):
        status, body = self._call("POST", "/api/comment", form={"api_type": "json", "thing_id": thing_id(lead), "text": text})
        if status == 403:
            raise SendError("没有权限在这里回复（帖子锁了或你被这个版块限制了）")
        if status == 404:
            raise SendError("Reddit 上找不到这条帖子或评论了（可能被删了）")
        if status != 200 or not isinstance(body, dict):
            raise SendError(f"Reddit 出错了（{status}）：{_detail(body)}", unknown=status == 200)
        j = body.get("json") or {}
        errors = j.get("errors") or []
        if errors:
            msgs = []
            for e in errors:
                e = list(e) if isinstance(e, (list, tuple)) else [str(e)]
                msgs.append(f"{e[1]}（{e[0]}）" if len(e) > 1 and e[1] else str(e[0]))
            rate = any(isinstance(e, (list, tuple)) and e and e[0] == "RATELIMIT" for e in errors)
            raise SendError("Reddit 拒绝了：" + "；".join(msgs), fatal=rate)
        things = (j.get("data") or {}).get("things") or []
        if not things:
            raise SendError("Reddit 没返回新评论", unknown=True)
        d = things[0].get("data") or {}
        return d.get("name") or ("t1_" + str(d.get("id", "")))

    def inbox(self):
        # raw_json=1：不然 Reddit 会把正文里的 & < > 转成 &amp; &lt; &gt;
        status, body = self._call("GET", "/message/inbox?limit=100&raw_json=1")
        if status != 200 or not isinstance(body, dict):
            raise SendError(f"Reddit 收件箱没取到（{status}）：{_detail(body)}")
        out = []
        for c in (body.get("data") or {}).get("children") or []:
            d = c.get("data") or {}
            out.append({"id": d.get("name") or "", "kind": c.get("kind", ""), "parent_id": d.get("parent_id") or "",
                        "author": d.get("author") or "", "text": d.get("body") or "", "at": d.get("created_utc") or 0})
        return out


# ---------- X ----------
def _pct(s):
    return urllib.parse.quote(str(s), safe="~-._")


def _signature(method, url, params, consumer_secret, token_secret):
    """OAuth 1.0a HMAC-SHA1 签名（RFC 5849）。params 是参与签名的全部参数（oauth_*、查询参数、表单参数），dict 或 (键, 值) 列表。"""
    items = params.items() if isinstance(params, dict) else params
    pairs = sorted((_pct(k), _pct(v)) for k, v in items)
    u = urllib.parse.urlsplit(url)
    base_url = f"{u.scheme.lower()}://{u.netloc.lower()}{u.path}"
    base = "&".join([method.upper(), _pct(base_url), _pct("&".join(f"{k}={v}" for k, v in pairs))])
    key = f"{_pct(consumer_secret)}&{_pct(token_secret)}"
    return base64.b64encode(hmac.new(key.encode("utf-8"), base.encode("utf-8"), hashlib.sha1).digest()).decode("ascii")


class X:
    API = "https://api.x.com/2"

    def __init__(self, settings, http=http_request, nonce=None, now=None):
        self.api_key = str(settings.get("x_api_key") or "").strip()
        self.api_secret = str(settings.get("x_api_secret") or "").strip()
        self.token = str(settings.get("x_access_token") or "").strip()
        self.token_secret = str(settings.get("x_access_secret") or "").strip()
        self.proxy = str(settings.get("proxy") or "").strip()
        self.http = http or http_request
        self._nonce = nonce if callable(nonce) else ((lambda: nonce) if nonce else (lambda: secrets.token_hex(16)))
        self._now = now if callable(now) else ((lambda: now) if now else time.time)
        self._me = None

    def ready(self):
        return bool(self.api_key and self.api_secret and self.token and self.token_secret)

    def _auth(self, method, url, query=None):
        """Authorization 头。签名包括 oauth_* 和查询参数，不包括 JSON 内容。"""
        oauth = {
            "oauth_consumer_key": self.api_key, "oauth_nonce": str(self._nonce()), "oauth_signature_method": "HMAC-SHA1",
            "oauth_timestamp": str(int(self._now())), "oauth_token": self.token, "oauth_version": "1.0",
        }
        params = list(oauth.items()) + list((query or {}).items())
        if "?" in url:
            params += urllib.parse.parse_qsl(url.split("?", 1)[1], keep_blank_values=True)
        oauth["oauth_signature"] = _signature(method, url, params, self.api_secret, self.token_secret)
        return "OAuth " + ", ".join(f'{_pct(k)}="{_pct(v)}"' for k, v in sorted(oauth.items()))

    def _call(self, method, path, query=None, json_body=None):
        if not self.ready():
            raise SendError("X 的密钥还没填全（设置 → 发送账号）", fatal=True)
        url = self.API + path
        full = url + ("?" + "&".join(f"{_pct(k)}={_pct(v)}" for k, v in query.items()) if query else "")
        headers = {"Authorization": self._auth(method, url, query), "User-Agent": "demand-radar/0.4"}
        status, body = self.http(method, full, headers=headers, json_body=json_body, proxy=self.proxy)
        if status == 401:
            raise SendError("X 的密钥不对", fatal=True)
        if status == 429:
            raise SendError("X 限流了，稍后再发", fatal=True)
        if status >= 500:  # 发推时服务器出错：推文可能已经发出去了
            if method == "POST":
                raise SendError(f"X 出错了（{status}）", unknown=True)
            raise SendError(f"X 出错了（{status}），稍后再试")
        return status, body

    def whoami(self):
        if self._me:
            return self._me
        status, body = self._call("GET", "/users/me")
        if status == 403:
            raise SendError("X 不允许：" + _detail(body))
        data = body.get("data") if isinstance(body, dict) else None
        if status != 200 or not data or not data.get("id"):
            raise SendError(f"X 没认出这个账号（{status}）：{_detail(body)}")
        self._me = (str(data["id"]), data.get("username") or "")
        return self._me

    def reply(self, lead, text):
        target = str(lead.get("item_id") or lead.get("post_id") or "").strip()
        status, body = self._call("POST", "/tweets", json_body={"text": text, "reply": {"in_reply_to_tweet_id": target}})
        if status == 403:
            raise SendError("X 不允许这条回复：" + _detail(body))
        data = body.get("data") if isinstance(body, dict) else None
        if status not in (200, 201) or not data or not data.get("id"):
            raise SendError(f"X 出错了（{status}）：{_detail(body)}", unknown=status in (200, 201))
        return str(data["id"])

    MENTION_PAGES = 8  # X 的提及时间线最多给最近 800 条，一页 100 条

    def mentions(self, since_id=""):
        """返回 (提到我的推文列表, 最新的推文 ID)。下次从这个 ID 往后查，不重复计费。
        一页 100 条，有下一页（next_token）就接着翻，翻完才算查过了，免得一次来了 100 条以上时漏掉后面的。"""
        me = self.whoami()[0]
        query = {"max_results": "100", "tweet.fields": "created_at,conversation_id,referenced_tweets,author_id",
                 "expansions": "author_id", "user.fields": "username"}
        if since_id:
            query["since_id"] = str(since_id)
        items, newest = [], ""
        for _ in range(self.MENTION_PAGES):
            status, body = self._call("GET", f"/users/{me}/mentions", query)
            if status == 403:
                raise SendError("X 不允许读提及：" + _detail(body))
            if status != 200 or not isinstance(body, dict):
                raise SendError(f"X 提及没取到（{status}）：{_detail(body)}")
            users = {u.get("id"): u.get("username", "") for u in (body.get("includes") or {}).get("users") or []}
            for t in body.get("data") or []:
                replied = next((r.get("id") for r in t.get("referenced_tweets") or [] if r.get("type") == "replied_to"), "")
                items.append({"id": str(t.get("id", "")), "text": t.get("text", ""), "author": users.get(t.get("author_id")) or str(t.get("author_id", "")),
                              "at": t.get("created_at", ""), "replied_to": str(replied or ""), "conversation_id": str(t.get("conversation_id") or "")})
            meta = body.get("meta") or {}
            newest = newest or str(meta.get("newest_id") or "")  # 第一页是最新的
            if not meta.get("next_token"):
                break
            query = {**query, "pagination_token": str(meta["next_token"])}
        return items, str(newest or since_id or "")


SENDERS = {"reddit": Reddit, "x": X}


def mode_for(platform, settings):
    """api：批准后用官方接口发（账号填全，并且你在设置里选了自动发）；manual：复制后自己去发；none：没法联系。"""
    if platform in NO_CONTACT:
        return "none"
    if platform in SENDERS and settings.get(f"send_mode_{platform}", "api") == "api" and SENDERS[platform](settings).ready():
        return "api"
    return "manual"
