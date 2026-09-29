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

## 使用

```bash
~/demand-radar/radar.sh -p xhs -n 20 -c 10     # 先只试小红书
~/demand-radar/radar.sh                        # 跑全部默认平台
~/demand-radar/radar.sh -p "xhs zhihu" -k "有没有app可以 记账,求推荐 记账软件"
```

| 参数 | 含义 | 默认 |
|---|---|---|
| `-p` | 平台，空格分隔：xhs 小红书、dy 抖音、ks 快手、bili B站、wb 微博、tieba 贴吧、zhihu 知乎 | `xhs zhihu dy bili wb tieba` |
| `-k` | 关键词，英文逗号分隔；不填就读 `keywords.txt` | 读文件 |
| `-n` | 每个关键词最多抓多少条帖子，小红书最少 20 | 20 |
| `-c` | 每条帖子最多抓多少条一级评论 | 20 |
| `-s` | 同时抓楼中楼回复，会更慢 | 不抓 |
| `-m 目录` | 不抓取，只对已有结果重新合并打分 | |

**第一次跑某个平台**会弹出一个独立的 Chrome 窗口，用手机上对应的 App 扫码登录。登录状态会保存，下次不用再扫。遇到滑块验证，就在这个窗口里手动拖一下。

**关键词**写在 `~/demand-radar/keywords.txt`，每行一个。越像用户求助、抱怨的原话越好，可以在后面加领域词缩小范围，比如"有没有app可以 记账"。

## 结果

每次运行在 `~/demand-radar/runs/时间戳/` 下生成：

| 文件 | 内容 |
|---|---|
| `需求信号.xlsx` / `需求信号.csv` | 命中需求信号的帖子和评论，按得分排序，带点赞数、所属帖子和链接 |
| `全部数据.csv` | 所有抓到的帖子和评论 |
| `summary.md` | 各平台数量、信号分布、得分最高的 50 条 |
| `crawl.log` | 抓取日志，出错时看这里 |

**打分方式：** 每条文字先看命中了哪些信号，求工具、缺失、抱怨现有、付费意愿、想要、附和各有权重。再按点赞数和回复数放大，代表有多少人跟着说。这一步只做初筛，把 `需求信号.xlsx` 发给 Claude，可以继续做聚类，并核实这些需求是不是已经有人做好了。

## 常见问题

- **一直要扫码或提示登录失败：** 在弹出的窗口里手动完成验证后重跑。登录信息存在 `~/demand-radar/MediaCrawler/browser_data/`，删掉对应平台的文件夹即可重新登录。
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
| `run_mc.py` | MediaCrawler 启动包装，改为自己开独立浏览器窗口，不改 MediaCrawler 源码 |
| `merge.py` | 合并各平台 jsonl 结果、识别需求信号、打分并输出表格 |
| `keywords.txt` | 默认关键词 |
| `tests/test_merge.py` | 用模拟的 7 个平台数据测试 merge.py：`python3 -m unittest discover tests` |
