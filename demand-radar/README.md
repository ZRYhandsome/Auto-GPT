# 需求雷达

在你自己的电脑上，按关键词抓小红书、知乎、抖音、B站、微博、贴吧的帖子和评论，自动挑出"有没有 app 可以""为什么没人做""同求""谁做我第一个买"这类需求信号，按热度排好序。

底层抓取用开源项目 [MediaCrawler](https://github.com/NanmiCoder/MediaCrawler)，它用真实 Chrome 浏览器和你自己的登录状态访问页面。需求雷达负责安装、批量运行、合并各平台结果和打分。MediaCrawler 的许可证只允许学习和个人研究使用，不允许商用。

## 安装（macOS）

需要先装好 Google Chrome。其他依赖由脚本自动安装：uv、Python 3.11 以上和 MediaCrawler 的依赖。没有 Node.js 时会用 Homebrew 安装。

```bash
git clone --depth 1 --branch claude/user-demand-research-qzl4la --filter=blob:none --sparse \
  https://github.com/ZRYhandsome/Auto-GPT.git ~/demand-radar-kit
cd ~/demand-radar-kit && git sparse-checkout set demand-radar
bash ~/demand-radar-kit/demand-radar/setup_mac.sh
```

装好后所有东西都在 `~/demand-radar`。脚本可以重复运行，重跑会把 MediaCrawler 更新到最新版。

**升级需求雷达：**

```bash
git -C ~/demand-radar-kit pull && bash ~/demand-radar-kit/demand-radar/setup_mac.sh
```

没改过 `keywords.txt` 的话，会顺带换成新版默认关键词；改过就保留你的。

## 使用

```bash
~/demand-radar/radar.sh -p xhs -n 20 -c 10     # 先只试小红书
~/demand-radar/radar.sh                        # 跑全部默认平台
~/demand-radar/radar.sh -p "xhs zhihu" -k "有没有app可以 记账,求推荐 记账软件"
~/demand-radar/radar.sh -p xhs -d "帖子链接1,帖子链接2"   # 深挖：把这几个帖子的评论抓全
~/demand-radar/radar.sh -m ~/demand-radar/runs/20261001-152817   # 不抓取，用新规则重新打分
```

| 参数 | 含义 | 默认 |
|---|---|---|
| `-p` | 平台，空格分隔：xhs 小红书、dy 抖音、ks 快手、bili B站、wb 微博、tieba 贴吧、zhihu 知乎 | `xhs zhihu dy bili wb tieba` |
| `-k` | 关键词，英文逗号分隔；不填就读 `keywords.txt` | 读文件 |
| `-n` | 每个关键词最多抓多少条帖子，小红书最少 20 | 20 |
| `-c` | 每条帖子最多抓多少条一级评论 | 20 |
| `-s` | 同时抓楼中楼回复，会更慢 | 不抓 |
| `-d 链接` | 深挖：不搜索，只抓指定帖子的评论，链接用英文逗号分隔。一次一个平台，每帖默认 300 条一级评论并抓楼中楼 | |
| `-m 目录` | 不抓取，只对已有结果重新合并打分 | |

**第一次跑某个平台**会弹出一个独立的 Chrome 窗口，用手机上对应的 App 扫码登录。登录状态会保存，下次不用再扫。遇到滑块验证，就在这个窗口里手动拖一下。

**关键词**写在 `~/demand-radar/keywords.txt`，每行一个。越像用户求助、抱怨的原话越好，可以在后面加领域词缩小范围，比如"有没有app可以 记账"。

## 结果

每次运行在 `~/demand-radar/runs/时间戳/` 下生成：

| 文件 | 内容 |
|---|---|
| `需求信号.xlsx` | 两页：“需求信号”和“按帖子汇总”，内容同下面两个 csv |
| `需求信号.csv` | 命中需求信号的帖子和评论，按得分排序，带点赞数、所属帖子、帖子类型和链接 |
| `按帖子汇总.csv` | 每个帖子的评论区命中了多少条需求、多少人求安卓或鸿蒙版、代表评论 |
| `全部数据.csv` | 所有抓到的帖子和评论 |
| `summary.md` | 各平台和各搜索词的命中情况、得分最高的 50 条、评论区需求最多的帖子、值得深挖的帖子和深挖命令 |
| `crawl.log` | 抓取日志，出错时看这里 |

**打分方式：**

1. **认帖子类型。** 标题在问“你想要什么 app”“为什么没人做”的是征集需求帖，在找工具或找人开发的是求助帖，开发者介绍自己产品的是推广帖，其余算其他。
2. **认信号。** 每条文字看命中了哪些信号，各有权重：付费意愿 4，求工具、缺失 3，抱怨现有、想要、求其他平台、找人开发、回应征集 2，改进建议、痛点、附和 1。征集帖下的评论哪怕只写了一个点子，比如“记录梦境！”，也记一个“回应征集”。引流、接单、发邀请码的评论不算。
3. **按热度放大。** 点赞和回复代表有多少人跟着说，取对数放大：1 万赞只比 10 赞高几倍，不会高一千倍。
4. **按帖子类型加权。** 推广帖本身只算两成分，它的评论区算七成：那里多是对某个现成产品的反馈，比如“蹲安卓”。征集帖下的评论加两成。带 [doge] 的玩笑话打六折。

这一步只做初筛。把 `需求信号.xlsx` 发给 Claude，可以继续聚类，并核实这些需求是不是已经有人做好了。

**深挖：** 搜索模式每帖只抓前 20 条评论，像“明明很需要的 APP 功能，为什么就是没有人做？”这种两千条评论的帖子，大部分点子都没抓到。`summary.md` 末尾会列出这类帖子，并给出现成的深挖命令，复制运行即可。

## 常见问题

- **一直要扫码或提示登录失败：** 在弹出的窗口里手动完成验证后重跑。登录信息存在 `~/demand-radar/MediaCrawler/browser_data/`，删掉对应平台的文件夹即可重新登录。
- **日志里有 `--- Logging error ---`：** 旧版的问题，不影响抓取。MediaCrawler 会把整页搜索结果写进日志，一行几十 KB，经 `tee` 写日志时会失败。新版把每条日志截到 300 字，数据照常完整写进 jsonl。要看完整日志就设置 `RADAR_LOG_FULL=1`。
- **小红书搜索排序：** 默认用综合排序。MediaCrawler 原本按最热排序，搜出来多是高赞的推广帖和段子。想换回去就设置 `RADAR_XHS_SORT=popularity_descending`，按最新排序用 `time_descending`。
- **被限流或封号：** 用小号登录；把 `-n` 和 `-c` 调小；加长间隔，例如 `RADAR_SLEEP_SEC=5 ~/demand-radar/radar.sh`。
- **依赖安装很慢或失败：** MediaCrawler 默认用清华镜像，脚本连不上时会自动改用官方 PyPI。
- **想用日常 Chrome 的登录状态：** 按 MediaCrawler 文档给日常 Chrome 开启远程调试，再运行 `RADAR_CONNECT_EXISTING=1 ~/demand-radar/radar.sh`。
- **用 Edge 或 Chrome 不在默认位置：** 设置 `RADAR_BROWSER_PATH=浏览器可执行文件路径`。
- **某个平台失败：** 脚本会跳过它继续跑别的平台，最后告诉你哪些失败了。单独重跑即可，例如 `radar.sh -p dy`。

## 文件

| 文件 | 作用 |
|---|---|
| `setup_mac.sh` | 一键安装 |
| `radar.sh` | 批量运行多个平台，然后合并打分 |
| `run_mc.py` | MediaCrawler 启动包装：自己开独立浏览器窗口、小红书用综合排序、截短日志，不改 MediaCrawler 源码 |
| `merge.py` | 合并各平台 jsonl 结果、识别需求信号、打分并输出表格 |
| `keywords.txt` | 默认关键词 |
| `tests/test_merge.py` | 用模拟的 7 个平台数据和真实跑出来的误报、漏报测试 merge.py：`python3 -m unittest discover tests` |
