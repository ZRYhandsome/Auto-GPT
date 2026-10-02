"""Hacker News：用 Algolia 提供的官方搜索接口，不用登录。

- 搜帖子：https://hn.algolia.com/api/v1/search?query=关键词&tags=story
- 直接搜评论：tags=comment。HN 上"is there a tool / I wish there was"多半出现在评论里，
  所以搜索时帖子和评论都搜，命中的评论挂到它所属的帖子下。
- 帖子全文和评论树：https://hn.algolia.com/api/v1/items/<ID>

HN 不公开评论的点赞数，评论的"点赞"记 0，回复数照实记。国内要开代理。
"""
import re

from .common import attempt, get_json, log, pause, strip_html

PLATFORM_DIR = "hn"
API = "https://hn.algolia.com/api/v1"


def item_url(i):
    return f"https://news.ycombinator.com/item?id={i}"


def item_id_of(target):
    m = re.search(r"[?&]id=(\d+)", target) or re.fullmatch(r"(\d+)", target.strip())
    return m.group(1) if m else None


def search(q, tags, limit):
    data = get_json(f"{API}/search", {"query": q, "tags": tags, "hitsPerPage": min(max(limit, 1), 100)})
    return (data or {}).get("hits", [])


def write_story(w, sid, title, text, points, num_comments, created, keyword):
    return w.post(
        note_id=str(sid), title=title or "", desc=strip_html(text)[:4000], liked_count=points or 0,
        comment_count=num_comments or 0, note_url=item_url(sid), source_keyword=keyword, time=created or "",
    )


def count_tree(node):
    return sum(1 + count_tree(c) for c in node.get("children") or [] if c.get("type") == "comment")


def flatten(children, story_id, limit, with_replies, out, top=True):
    for c in children or []:
        if len(out) >= limit:
            return
        if c.get("type") != "comment" or not c.get("text"):
            continue
        out.append({
            "comment_id": str(c["id"]), "note_id": str(story_id), "content": strip_html(c["text"]), "like_count": 0,
            "sub_comment_count": count_tree(c), "parent_comment_id": 0 if top else str(c.get("parent_id", "")),
            "create_time": c.get("created_at_i", ""),
        })
        if with_replies:
            flatten(c.get("children"), story_id, limit, with_replies, out, top=False)


def fetch_item(item_id):
    return get_json(f"{API}/items/{item_id}")


def run(opts, w):
    sleep = opts.get("sleep", 1.0)
    want_comments = opts.get("comments", True)

    def story_with_comments(sid, keyword):
        item = attempt(f"帖子 {sid}", fetch_item, sid)
        if not item:
            return 0
        write_story(w, sid, item.get("title"), item.get("text"), item.get("points"), count_tree(item), item.get("created_at_i"), keyword)
        if not want_comments:
            return 0
        out = []
        flatten(item.get("children"), sid, opts["max_comments"], opts.get("sub", False), out)
        for c in out:
            w.comment(**c)
        return len(out)

    if opts["mode"] == "search":
        for kw in opts["keywords"]:
            log(f"搜索帖子：{kw}")
            stories = attempt(f"搜索帖子「{kw}」", search, kw, "story", opts["max_notes"]) or []
            for s in stories[: opts["max_notes"]]:
                n = story_with_comments(s["objectID"], kw)
                log(f"  {(s.get('title') or '')[:50]}：{n} 条评论")
                pause(sleep)
            # 直接搜命中关键词的评论，挂到它所属的帖子下
            hits = attempt(f"搜索评论「{kw}」", search, kw, "comment", opts["max_notes"]) or []
            log(f"搜索评论：{kw}，命中 {len(hits)} 条")
            for h in hits:
                sid = h.get("story_id")
                if not sid:
                    continue
                write_story(w, sid, h.get("story_title"), "", 0, 0, "", kw)
                w.comment(comment_id=str(h["objectID"]), note_id=str(sid), content=strip_html(h.get("comment_text")),
                          like_count=0, sub_comment_count=0,
                          parent_comment_id=0 if str(h.get("parent_id")) == str(sid) else str(h.get("parent_id", "")),
                          create_time=h.get("created_at_i", ""))
            pause(sleep)
    else:
        for target in opts["targets"]:
            iid = item_id_of(target)
            if not iid:
                log(f"认不出帖子 ID，跳过：{target}")
                continue
            n = story_with_comments(iid, "")
            log(f"{target}：{n} 条评论")
            pause(sleep)


def probe():
    hits = search("is there an app", "story", 1)
    return f"能连上，搜到：{(hits[0].get('title') or '')[:40]}" if hits else "能连上，但没搜到结果"
