# 未被满足的用户需求调研报告（2026-09-27）

> 目标：在小红书、知乎、抖音、微博、B站、V2EX/小众软件、贴吧/豆瓣、少数派/掘金、Hacker News、Product Hunt/Indie Hackers、X/Threads、应用商店评论、Quora/Medium/Substack、YouTube/TikTok、GitHub 以及中英文开放网页上，寻找"很多人反复在喊、特别想要、但至今没有被好好解决"的需求，并据此选定要打造的产品。

## 一、数据规模

| 指标 | 数值 |
|---|---|
| 搜索代理（平台×角度） | 21 路 + GitHub 挖掘 |
| 原始需求条目 | 245 |
| 去重聚类后的需求簇 | 50 |
| 经三视角验证的簇 | 50 |
| 证据 URL（去重） | 144 |

## 二、方法与局限

方法：23路搜索代理在微博、小红书、知乎、抖音、B站、豆瓣、少数派、HN、Product Hunt、X等平台按关键词矩阵扫描普通用户的抱怨与愿望，另有6路GitHub挖掘做需求侧与方案侧的星标/issue核对；相似诉求聚成50个簇，再由三名独立验证者从unmet/crowd/buildable三视角核查打分，总分=unmet×0.4+crowd×0.4+buildable×0.2，任一验证者在unmet或crowd判refuted的簇一律排到榜尾并在risks注明“被反驳”。局限：WebSearch会话配额200次在第一轮即耗尽，每路只完成5-15次查询，样本不是穷尽式的；小红书/抖音/知乎等只能看到搜索引擎摘要与标题，看不到评论区互动数，crowd分数因此偏向GitHub可见的star/issue信号；验证阶段是离线知识+GitHub模式检索而非逐条联网复核原帖，涉及商业产品与平台政策的判断已在原文标注不确定；所有引文与链接只来自输入文件，未做二次爬取。本结构化输出受单轮输出上限约束，各字段为压缩版；完整版（每簇8条链接、4条引文、完整产品概念与风险）见 /tmp/claude-0/-home-user-Auto-GPT/f87645c4-3b4f-513a-8bfa-66d2a4de3ed6/scratchpad/research/report_dump/ranked_full.json。

流程：多路并行搜索（每路 5-36 次查询）→ 分平台聚类 → 跨平台合并 → 每簇三视角对抗验证（unmet：是否真的没被解决；crowd：是否真的很多人要；buildable：能否用软件做出并变现）→ 加权排名（unmet 40% + crowd 40% + buildable 20%）→ 三位评审（用户痛感优先 / 可实现性优先 / 商业优先）各自选品。

**已知局限**：
- 会话级 WebSearch 配额（200 次）在第一轮扫描中即耗尽，每路只完成 5-36 次查询；第二轮补搜未能执行（缺口清单见附录）。
- Reddit 被 Anthropic 爬虫策略拒绝；小红书/知乎/抖音等站点无法直连抓取，只能通过搜索引擎看到标题与摘要，看不到评论区点赞与"同求"数，因此互动数多为 unknown。
- GitHub 是唯一可直连的站点，star 数、issue 👍 数是本报告中最可靠的"多少人要"量化证据。
- 验证阶段为"离线知识 + GitHub"模式，未能联网复核现有竞品的最新状态。

**覆盖范围说明**：已覆盖：微博热搜（含热搜归档仓库）、小红书（仅搜索摘要与聚合问答页）、知乎、抖音搜索词、B站、豆瓣豆列、少数派、36氪/人人都是产品经理、中新网等媒体、Hacker News、Product Hunt/X/Medium/TikTok（英文侧标题级）、GitHub（issue/star/PR，核验最充分）。未覆盖或只能间接覆盖：reddit.com因Anthropic爬虫策略不可访问；threads.net、hn.algolia.com不可直连；小红书/知乎/抖音/微博/B站等国内站点全部无法直连（出口代理拦截），只能通过搜索引擎摘要间接获取，因此看不到评论区、点赞与转发数；除github.com外WebFetch/curl均被拦截，验证者对商业产品与平台政策的判断依赖离线知识。第二轮应补的平台：酷安、吾爱破解、PTT/Dcard、Lemmy、厂商官方反馈板（小米社区/花粉俱乐部等）、职业社区（脉脉/牛客/丁香园）、付费定制需求平台（猪八戒/一品威客）以及各App商店评论区；这些渠道可能显著改变若干簇的crowd分数与排名。

## 三、需求排名（总分 = unmet×0.4 + crowd×0.4 + buildable×0.2）

| 排名 | 需求 | 人群 | 平台 | 独立来源 | unmet | crowd | build | 总分 |
|---|---|---|---|---|---|---|---|---|
| 1 | 自建相册家庭要好用的共享与断点上传 | 自托管相册家庭与NAS用户 | GitHub | 6 | 6 | 8 | 5 | **6.6** |
| 2 | 微信用户要免电脑可读可搜的聊天记录导出与瘦身 | 微信重度用户、换机者、维权者 | 微博、小红书、GitHub | 21 | 6 | 8 | 3 | **6.2** |
| 3 | 消费者要一键直达各企业人工客服的路径库 | 遇售后/快递/银行纠纷的消费者与 | 微博 | 4 | 7 | 5 | 7 | **6.2** |
| 4 | 读者要把公众号等封闭平台变成RSS并归档 | RSS/Obsidian用户 | GitHub | 17 | 6 | 7 | 4 | **6** |
| 5 | 自由行用户要把小红书攻略一键变成可协作行程 | 以小红书为攻略来源的年轻自由行游 | 小红书、GitHub | 10 | 5 | 7 | 6 | **6** |
| 6 | 用户要批量下载备份抖音/B站/视频号内容 | 把短视频当资料库的用户 | GitHub | 19 | 5 | 7.5 | 4 | **5.8** |
| 7 | 多生态设备间要不靠云直连传文件与同步剪贴板 | 多生态设备持有者、办公写作人群 | GitHub、X/Twitter | 10 | 5 | 7 | 5 | **5.8** |
| 8 | 独居者要定时签到、超时自动报警的守护App | 独居青年、空巢老人及子女 | 微博、GitHub | 4 | 5 | 6 | 7 | **5.8** |
| 9 | 用户与独立开发者要可信的干净软件发现分发渠道 | 找无广告替代软件的用户 | 知乎、抖音、v2ex.com、GitHub | 20 | 5 | 7 | 5 | **5.8** |
| 10 | 离线地图用户要公交换乘、轨迹导航与同步 | 用Organic Maps | GitHub | 6 | 5 | 7 | 4 | **5.6** |
| 11 | 记账者要无广告自动导账单可多人共享的记账 | 年轻上班族、情侣室友分账者 | 小红书、知乎、GitHub、Hacker News、TikTok | 28 | 4 | 7 | 5 | **5.4** |
| 12 | 家庭要不限量可拍照/小票自动录入的物品管理 | 衣服多囤货多的年轻女性 | 小红书、GitHub | 12 | 5 | 5 | 7 | **5.4** |
| 13 | 家人要远程守护父母手机防骗与异常扣费预警 | 异地子女、独自用手机的老人 | 微博、知乎、北京日报、文学城、中新网/中消协、GitHub | 14 | 5 | 5.5 | 5 | **5.2** |
| 14 | 中小商家要AI假图鉴别与恶意仅退款申诉工具 | 中小电商与生鲜农产品卖家 | 微博、GitHub | 4 | 6 | 5 | 4 | **5.2** |
| 15 | 消费者要多账号同时比价取证大数据杀熟的工具 | 怀疑被杀熟的外卖/咖啡 | 微博、GitHub | 4 | 7 | 4 | 4 | **5.2** |
| 16 | 大学生要教务课表导入与选课余量捡漏提醒 | 在校大学生 | GitHub | 6 | 4 | 7 | 4 | **5.2** |
| 17 | 听歌用户要免费无广告一站听全并迁移歌单 | 大陆听歌用户、转向本地 | GitHub、appinn.com | 28 | 4 | 7 | 3 | **5** |
| 18 | 手机用户要装上即用的开屏/摇一摇广告屏蔽 | 国产安卓用户、为长辈配机的家庭 | 微博、GitHub | 18 | 4 | 7 | 3 | **5** |
| 19 | 做饭者要结构化可检索菜谱与今天吃什么决策 | 自己做饭的年轻人、双职工父母 | GitHub、小红书 | 16 | 4 | 5 | 7 | **5** |
| 20 | 办公学生要免费离线批量OCR含表格Mac版 | 学生科研人员、行政财务文员 | GitHub、少数派 | 8 | 4 | 5 | 7 | **5** |
| 21 | 技术用户要过滤AI/SEO垃圾的搜索与资讯流 | 开发者、研究者、对AI话题疲劳的 | Hacker News、GitHub | 7 | 4 | 6 | 5 | **5** |
| 22 | 家庭要自己掌握的全家病历与血压用药共享 | 为父母管理健康的异地子女 | 小红书、GitHub | 6 | 6 | 4 | 5 | **5** |
| 23 | 家属要亲人去世后微信/游戏账号内容的托管保存 | 失去亲人的家属、有规划意识的中老 | 微博、GitHub | 3 | 6 | 5 | 3 | **5** |
| 24 | 旅客观众要合规的余票监控与候补成功率工具 | 春运旅客与返乡学生 | 微博、GitHub | 10 | 5 | 5 | 4 | **4.8** |
| 25 | 报销职场人自动从邮箱微信收集发票并生成汇总 | 频繁出差报销的职场人 | GitHub | 2 | 4 | 5 | 6 | **4.8** |
| 26 | 视障者过验证码人脸识别弹窗的本地视觉辅助 | 使用争渡/保益/TalkBack | 中新网、深圳市信息无障碍研究会、GitHub、少数派 | 4 | 5 | 4 | 5 | **4.6** |
| 27 | 消费者要自动盘点订阅/免密授权并代为取消 | 开着多个订阅与免密支付的城市消费 | 微博、小红书、Hacker News、TikTok、X/Twitter、Medium、App Store | 14 | 4 | 5 | 4 | **4.4** |
| 28 | 普通人要免登录、多模型切换核验的AI入口 | 普通AI用户、学生、办公族 | 微博、抖音 | 7 | 5 | 4 | 4 | **4.4** |
| 29 | 外卖用户要下单前核验幽灵店/同址多店的工具 | 外卖用户与家长 | 微博 | 4 | 5 | 4 | 4 | **4.4** |
| 30 | 普通上镜者要AI盗脸盗声的监测取证与维权工具 | 配音演员、带货主播、短视频博主 | 微博 | 4 | 5 | 4 | 3 | **4.2** |
| 31 | 听障者要免费离线不限机型的实时字幕与通话转写 | 听障/聋人学生与职场人 | 知乎、哔哩哔哩、结绳志 | 4 | 4 | 4 | 5 | **4.2** |
| 32 | 手机用户要一站式隐私体检、拦骚扰与泄露溯源 | 隐私敏感手机用户、女性用户 | 微博 | 8 | 4 | 4 | 4 | **4** |
| 33 | 多端用户要隐私友好离线的中文拼音与语音输入 | 隐私敏感的办公人群与程序员 | GitHub | 4 | 3 | 7 | 7 | **5.4** |
| 34 | 用户要把微信读书等平台数据整体导出带走 | 有系统读书笔记习惯的知识工作者 | GitHub | 21 | 3 | 7 | 6 | **5.2** |
| 35 | 多屏Windows用户要按屏独立桌面自动平铺 | Windows多显示器办公 | GitHub | 9 | 3 | 7 | 6 | **5.2** |
| 36 | 多机用户要可靠的短信验证码跨设备转发 | 双卡多机用户、海外用国内号码者 | GitHub | 6 | 3 | 7 | 5 | **5** |
| 37 | 女性要无低俗广告、隐私可信、功能全的经期记录 | 女性用户（含备孕） | 小红书 | 3 | 3 | 6 | 7 | **5** |
| 38 | 自建书库用户要无线投递电纸书与手写批注 | 用Audiobookshelf | GitHub | 16 | 3 | 7 | 4 | **4.8** |
| 39 | 多网盘用户要聚合挂载成本地盘且断点上传 | 持有百度/阿里/夸克/115 | GitHub、v2ex.com、meta.appinn.net | 15 | 3 | 7 | 4 | **4.8** |
| 40 | 本地优先用户要自托管多端同步与选择性差量同步 | 多设备隐私/自托管用户 | GitHub | 15 | 3 | 7 | 4 | **4.8** |
| 41 | 读者要无广告可换源导入自有书跨端同步阅读器 | 有自有电子书库的重度阅读者 | GitHub、豆瓣豆列 | 5 | 3 | 7 | 4 | **4.8** |
| 42 | 家庭要跨端共享日历待办与家务分工轮换 | 同居情侣、双职工夫妻、合租室友 | 小红书、抖音、GitHub | 9 | 3 | 5 | 7 | **4.6** |
| 43 | 重度用户要跨App的深夜静默与刷屏限额工具 | 想戒短视频的成年重度用户 | 微博 | 4 | 3 | 6 | 5 | **4.6** |
| 44 | UP主与学习者本地免费生成翻译配音视频字幕 | 自媒体/知识类UP主（自制内容 | GitHub | 4 | 2 | 7 | 5 | **4.6** |
| 45 | 家长学生海外华人免费获取按年级检索的电子教材 | K12家长与学生、教师、自学者 | GitHub | 2 | 3 | 7 | 3 | **4.6** |
| 46 | 厌倦订阅者要买断制无广告的单功能工具 | 对广告和订阅疲劳的普通手机用户 | Hacker News、Google Play、App Store、Medium、Substack | 15 | 3 | 6 | 5 | **4.6** |
| 47 | 自我管理者要极简无广告能记耗时主动提醒的打卡 | 学生、考研党、上班族中的自我管理 | 小红书 | 5 | 3 | 5 | 7 | **4.6** |
| 48 | 笔记用户要层级标签、多归属与工作私人分库 | Joplin/Trilium | GitHub | 12 | 2 | 7 | 4 | **4.4** |
| 49 | 普通用户要备份快、视频不锁会员的可靠云相册 | 手机存储吃紧、需长期保存家庭照片 | 小红书 | 5 | 3 | 5 | 4 | **4** |
| 50 | 普通人发布长尾小需求并即时生成可用小应用 | 有个性化小需求、不会编程的普通用 | 36氪、知乎、人人都是产品经理、Quora | 4 | 2 | 4 | 7 | **3.8** |

## 四、评审团选品

### 视角：user-pain-first → 选择「消费者要一键直达各企业人工客服的路径库」（C29）

候补：C01, C03

理由：选 C29 的理由（痛感 × 真实 × 传播 × 硬约束四项同时满足）：

1. 痛感最普遍、情绪最强。"智能客服绕圈找不到人"是几乎每个中国消费者都亲历过的高频愤怒场景（快递丢件、银行冻卡、退款被拒时尤甚），人民日报点名批评 + 同日三个热搜（#12/#18/#20）说明它已上升到公共议题层面。12 个候选里只有它同时拿到 unmet=confirmed(7) 和 buildable=confirmed(7)。crowd 仅 weak(5) 是因为证据是热搜标题而非用户原话，但这类痛点不需要"原话"来证明——美国 GetHuman 靠同一套路径库存活近 20 年，是最好的需求存在性证据。

2. 最容易口口相传。产品的"最小可分享单元"天然存在：一张"京东 950618 → 按 0 → 说'人工'"的小抄图，本身就是小红书/抖音已有的爆款内容类型（"转人工秘籍"）。用户在被机器人折磨 20 分钟后 30 秒接通人工，会立刻转发给朋友。零学习成本、无需注册、不下载 App。

3. 完全符合"无外网容器 + 单开发者"硬约束。纯静态 vanilla HTML/JS + 仓库内 JSON 数据，tel: 链接带暂停/DTMF 自动按键，无平台 API、无付费服务、无逆向、无服务器。我核实了输入里的 https://github.com/FuzzyLogic112/zhuanrengong ：它确实是一个消费者侧静态站（63 家企业、25 条实测路径、0 star、3 commits、vanilla 无 CDN、数据 CC BY-SA），这反过来证明该形态在离线容器里可实现；其零星数只说明它刚建、无传播，不构成需求反证——反而可作为兼容的数据格式/贡献对象。数据准确性是唯一真风险，用"每条路径标注最近验证日期 + 无服务器的众包反馈导出→GitHub PR"来解，不构成"大量人工运营"。

其他候选为何不选（按痛感排序）：
- C03 微信聊天记录：痛感全场最强、呼声最真实（42k★、WeFlow 9 个月 14k★、十年 9 位作者反复重造、腾讯 DMCA 波及 4,195 fork）。但"可搜"必须依赖本地 OCR 模型（tesseract.js chi_sim ≈ 20-40MB 或 PaddleOCR），无外网容器拿不到模型，演示会退化成"截图拼长图"而失去核心价值；且 buildable 已被反驳(3)。故只作候补：一旦开发环境证实有离线 OCR 引擎，应立刻做。
- C01 记账：28 个独立来源、5 平台，是 crowd 最广的；纯前端 PWA + 微信/支付宝官方账单 CSV 导入 + Splitwise 式共享账本完全可离线做。但 unmet 仅 4（BeeCount、ezBookkeeping、钱迹等替代太多），痛感是慢性烦躁而非急性愤怒，口碑传播需要数周使用才发生。作候补 1。
- C14 物品管理：痛点具体（小红书原话"积分用完不能添加/丢图/超 30 件付费"），纯 PWA 可做，但受众窄、crowd weak(5)。
- C27 独居守护：生死议题但低频，核心承诺"超时自动通知联系人"离不开短信/推送通道（付费或平台），容器里无法可信演示；证据来自同一新闻周期，克隆潮无一进商店反证持续需求弱。
- C23/C07/C05/C17/C24/C34/C36：分别依赖 Immich 实例、腾讯正在关闭的旁路、B 站登录态与律师函灰区、热点/Wi-Fi Direct 系统 API、GTFS 外部数据、大量人工标注、LLM+高德 API——都在硬约束之外或无法离线演示。

MVP 定义：【产品名（暂）】找人工 / 一键转人工

【一句话定位】
一个离线可用、无需注册的网页小抄：输入企业名，30 秒内知道打哪个号、按哪几个键、说哪句话能直达人工客服；打不通时一键升级到对应监管投诉渠道并生成投诉信。

【目标用户】
- 主：遇到售后/快递/银行/运营商/出行纠纷、正被智能客服绕圈的普通消费者（25-45 岁城市用户为主）
- 次：替父母处理纠纷的子女（大字模式）、消费维权博主（分享小抄图）

【核心功能（第一版 6 项）】
1. 企业检索 + 通话小抄卡：按名称/行业（电商、快递、银行、运营商、航司铁路、外卖出行、保险、政务）/号码搜索。每家一张卡：官方热线（含地区差异）、转人工按键序列（如"10086 → 0 → 0"）、语音关键词（说"人工""投诉"）、在线客服转人工触发词与入口层级、推荐拨打时段、最近验证日期、社区成功率。
2. 一键拨号自动按键：移动端 tel: 链接嵌入暂停与 DTMF（如 tel:10086,,0,0），点一下拨出并自动按键；桌面端显示大字小抄 + 复制号码。
3. 万能技巧 + 失败升级路径：通用"转人工万能法"卡（按 0/#、说"人工"、重复"投诉"、静默等待）；每家卡片底部按行业给出升级渠道并一键拨号：12315 消费者、12305 邮政快递申诉、12300/12381 工信部电信申诉、12378 金融消费者、12328 交通运输、12326 民航、12345 政务。
4. 投诉信/申诉模板生成器：填订单号、金额、时间线、诉求 → 生成结构化投诉信（含《消费者权益保护法》第八/十/五十五条等常用引用）→ 一键复制，可直接粘到 12315 或企业在线客服。
5. 无服务器众包验证闭环：拨打后弹"接通人工了吗？用了多久？"记录到 localStorage；"导出我的验证"生成 JSON/Markdown 贡献片段，用户到 GitHub 提 PR 合并入 data/*.json；页面显示"n 人验证 / 最近验证于 / 成功率"，90 天未验证自动标"待复核"。
6. 分享小抄图 + 离线 PWA：Canvas 生成每家企业的小抄图片卡（适配微信/小红书竖图），一键保存分享；Service Worker 缓存全站，地铁/信号差时也能查。

【形态】
纯静态 PWA（vanilla HTML/CSS/JS，无框架、无 CDN、无构建步骤），数据是仓库内 JSON（schema 固定：company/industry/hotline/dtmf_sequence/voice_keywords/online_path/best_time/regulator/last_verified/votes）。file:// 直接打开即可演示；附一个 Python 标准库脚本 validate.py 校验数据 schema 与 tel: 链接格式。代码 MIT、数据 CC BY-SA 4.0（与已存在的 zhuanrengong 仓库数据许可兼容，便于互相合并）。

【第一版不做什么】
- 不做服务器、账号、评论、排行榜（众包完全走 GitHub PR）
- 不做小程序/App（需平台审核），先 H5/PWA
- 不做自动代拨、代排队、语音识别应答（需电话/系统 API）
- 不做在线客服自动化脚本或抓取企业页面（灰色/反爬）
- 不追求 300 家全覆盖：首版 60-100 家高频企业 + 全部监管渠道，每条路径诚实标注"已验证/待验证"，宁缺毋假
- 不采集任何用户个人信息，投诉信生成完全本地
- 不做企业侧 SaaS（客服系统转人工 SDK）

【怎么验证真的解决了问题】
- 演示验收（容器内）：任选 10 家企业检索 → 卡片正确 → 手机点击 tel: 链接能带 DTMF 拨出；模板生成器输出可复制的完整投诉信；断网后页面仍可打开；validate.py 全部通过。
- 北极星指标（用户自报，功能 5 收集）：从打开页面到接通人工的中位时长 < 90 秒（对照现有测评均值 171 秒、最长 660 秒）；标"已验证"路径的接通成功率 ≥ 70%。
- 传播信号：把 5 张小抄图分别发到小红书/微博，看 7 天自然转发与收藏；页面"分享小抄图"点击率 ≥ 15%；GitHub star 与每周 PR 贡献 ≥ 3 条即视为众包闭环成立。
- 数据健康：每条路径 90 天内至少 1 次验证；👎 反馈 24 小时内变"待复核"。
- 停止信号（反证）：若拨号后反馈率 < 5%、7 日回访 < 10%、60 天内 40% 路径失效且无人贡献，说明痛点被"随手搜一下社交平台"足够满足，应停止投入而非加功能。

### 视角：buildability-first → 选择「记账者要无广告自动导账单可多人共享的记账」（C01）

候补：C14, C24

理由：按"一个开发者、无外网容器、纯前端/本地优先、不碰平台私有接口、不靠人工运营和双边网络效应、合法"逐条筛 12 个候选，只有 C01、C14、C24 三个能完整通过，其中 C01 的需求证据最硬（28 个独立来源、5 个平台、crowd=confirmed 7），所以选 C01。

选 C01 的理由：
1) 三个核心痛点里两个能被软件本身彻底消除：a) 开屏广告/突然付费/限额导流——纯前端本地优先 PWA 天然没有这些；b) 手动录入累——微信支付「账单下载」和支付宝「交易流水」都是官方提供、用户自己发起的 CSV 导出，解析 CSV 不碰任何私有接口、不需要 Xposed/无障碍/爬虫，完全合法；第三个痛点"共享弱"可以用"无账号的账本文件合并 + Splitwise 式分摊结算"覆盖 70%，剩下的实时多端同步留给后续（用户自带 WebDAV），不需要我们运营服务器，也就没有 PIPL 备案问题。
2) 工程量可控且无依赖风险：容器里已有 Node 22 / Python 3.11，浏览器与 Node 的 TextDecoder 原生支持 GBK（已实测），CSV 解析、去重、规则归类、IndexedDB 存储、Canvas 画图、WebCrypto 加密全部是 Web 平台内建能力，不需要 npm install 任何东西。一个开发者 2-3 周可以做出可演示、可真实使用的版本。
3) 不依赖网络效应：共享是 2-4 人小组的文件交换，第一个用户独自使用就有完整价值。

明确的风险：unmet 只有 4——ezBookkeeping（自托管）、BeeCount（13 个月 2.4k★，Flutter）等开源方案已存在，钱迹/MOZE 付费无广告。差异化只能靠"零安装 PWA + 零账号共享/分摊 + 官方账单导入即用"这一组合，不靠技术壁垒；这在 buildability-first 下可接受，但产品侧要认清是"把现有需求做对而不是做新"。本会话无法核验 BeeCount/ezBookkeeping #53 的具体功能（代理 403、GitHub MCP 仅限单一仓库），以上基于输入证据。

淘汰理由（按 buildability 约束）：
- C29 转人工路径库：软件部分是个静态目录+tel: 拨号链接，价值 95% 在"持续实测入库 Top300 企业"的数据，这是大量人工运营，且容器里无法打电话验证——违反"软件消除痛点/不靠人工运营"。
- C27 独居守护：核心动作"超时通知联系人"需要短信/推送/微信等外部通道，纯前端和容器里都做不到；被动心跳依赖 HealthKit/微信运动（需审核平台接口）；且涉生死责任，证据只有一个新闻周期、GitHub 克隆全部 ≤15★。
- C05、C03、C07：分别依赖 B 站 wbi 签名+SESSDATA（已收律师函）、微信数据库/沙盒（腾讯 DMCA）、腾讯正在关闭的旁路接口——违反"不破解/逆向/私有接口"。
- C36：依赖 LLM 与高德 API（付费、需网络、需 key），无外网容器无法运行。
- C23：只能寄生 Immich API 且上游正在重做 #12614，容器里无 Immich 可演示。
- C17：热点创建需 OS/硬件能力，容器无 Wi-Fi 无法演示；同网传输部分 LocalSend/PairDrop 已解决。
- C34：目录站的价值是数据与社区（双边）、需要持续人工标注，且"免会员去广告"一半需求是破解需求。

候补：
- C14 家庭物品管理：与 C01 同样可做成零依赖本地优先 PWA（IndexedDB 存照片 blob、位置树、批量拍照、zip 导出），"不限量不丢图不付费"被软件直接消除，buildable=7；但 crowd 仅 5、证据无 URL，且 OCR 小票在无外网容器里拿不到模型数据只能砍掉，故居次。
- C24 离线公交换乘：可缩为"用户自带 GTFS 的浏览器内 RAPTOR 换乘 PWA"，开放数据合法、纯前端可做、crowd=7 有具体 issue；但容器内无真实 GTFS 可演示、大文件解析工程量大、iOS PWA 存储 7 天驱逐与无离线底图削弱"离线"价值，受众付费意愿低，故排第三。

MVP 定义：【产品暂名】素账（PlainLedger）

【一句话定位】
一个零依赖、纯前端、本地优先的记账 PWA：把微信/支付宝官方导出的账单 CSV 拖进来自动去重归类，和伴侣/室友用"账本文件"共享与分摊结算——永远没有广告、没有会员墙、数据不离开你的设备。

【目标用户】
1) 被随手记/鲨鱼记账的开屏广告和"突然付费"赶走、又不想为钱迹/MOZE 付年费的年轻上班族；2) 需要分账的情侣/室友/合租小组（2-4 人）；3) 对流水隐私敏感、不想注册账号、不想装 Xposed 类灰色工具的人。愿意每月花 5 分钟从微信/支付宝导一次官方账单。

【核心功能（6 个）】
1. 官方账单导入：识别微信支付「账单下载」与支付宝「交易流水」两种 CSV 格式（GBK/UTF-8 自动检测、跳过表头表尾说明行、可视化字段映射确认），以 交易单号+时间+金额 为指纹去重，重复导入幂等；退款/转账自动对冲；同时保留"手动快速记一笔"。其他来源走通用 CSV 映射。
2. 规则归类引擎：内置约 50 条商户关键词→分类默认规则；用户每手改一次分类，自动提示生成"以后含 XX 的都归 YY"规则；导入后显示"未归类 N 条"批量处理视图。目标：默认规则归类率 ≥70%，用户训练一个月后 ≥90%。
3. 共享账本与分摊结算：账本内可加成员（本地记录，无账号）；每笔可设付款人与分摊方式（平均/比例/指定人/不分摊）；实时显示"谁欠谁多少"，一键生成结算记录（Splitwise 式）。
4. 零账号文件式共享：账本一键导出为单个 .json（可选 WebCrypto 密码加密），通过微信文件/AirDrop/网盘任意渠道发给对方；对方导入时按记录 UUID + 修改时间三向合并，不覆盖、不重复、冲突可视化。（预留接口：用户自带 WebDAV 地址即可自动同步。）
5. 报表与预算：月/年收支概览、分类占比、成员分摊表、月度对比；每分类月预算与超支提示；图表用 Canvas/SVG 手绘，不引入任何图表库。
6. 数据主权：全部数据在 IndexedDB，PWA 可安装、断网可用；一键全量导出 CSV/JSON，一键清空；无遥测、无服务器。

【形态】
纯前端 PWA：一个 index.html + 少量原生 JS/CSS + manifest + service worker，零 npm 依赖，用 Node/Python 内建静态服务器即可本地演示与部署到任何静态托管；手机浏览器"添加到主屏幕"即成 App。不上架商店、不做小程序，不需要备案与审核。

【第一版不做什么】
- 不做任何"自动同步流水"：不接无障碍/通知监听/Xposed，不爬微信支付宝，不接银行接口（中国无合法实时路径）。
- 不做账号系统、不做自建服务器的实时多端同步（避免 PIPL 备案与运营成本）；共享只做文件合并。
- 不做银行/信用卡账单专用解析（只做微信+支付宝两种格式，其他走通用映射）。
- 不做 OCR 小票、不做 AI 归类、不做投资/资产净值/汇率。
- 不做原生 App（Flutter/iOS/Android）、不做桌面安装包。
- 不做多币种、不做发票报销。

【怎么验证真的解决了问题】
容器内演示验收（开发者自测）：
- 用 3 份构造的账单文件（微信 GBK、支付宝含表头说明行、故意重复导入+含退款）导入：去重准确率 100%、退款对冲正确、默认规则归类率 ≥70%、10k 条导入 <3 秒。
- 两个浏览器 Profile 分别记账并互相导出/导入，合并后记录数与手算一致、无丢失无重复；分摊结算金额与手算一致。
- 断网后打开 PWA 仍可记账与看报表。
真实用户验证（发布后 4 周，找 10-15 位随手记/鲨鱼流失用户、含 ≥3 对情侣/室友）：
- 导入成功率（无需手动改字段映射）≥90%；
- 从导入到全部归类完成的时间 ≤5 分钟/月，对比其原手动录入耗时缩短 ≥70%（自报）；
- 第 2 个月仍主动导入账单的留存 ≥50%；
- ≥3 组完成至少一次文件式共享合并并产生一条结算记录；
- 问卷"是否愿意换回原 App"：≥70% 回答否，并能说出留下的原因是"无广告/导入省事/能分账"之一。
不达标的含义：若导入成功率或归类耗时不达标，说明"官方 CSV 半自动导入"没有消除手动录入之痛，方案核心假设不成立；若共享指标不达标而其余达标，则砍掉共享专注单人无广告记账。

### 视角：business-first → 选择「家庭要不限量可拍照/小票自动录入的物品管理」（C14）

候补：C01, C29

理由：business-first 四问：谁付钱、能否持续收、竞品为什么没填、有没有护城河；再叠加硬约束（单人、无外网容器、纯前端/本地优先、不碰审核 API/付费三方/逆向/人工运营）。

【为什么选 C14】
1) 付费意愿已被竞品验证：氧气/尽简在 30/49 件处设付费墙，收纳先生/橘兜用积分限额——用户是撞到付费墙才去小红书写"硬伤测评"的，说明他们高频使用到了付费决策点，抗拒的是"为限额付费"而不是付费本身。
2) 竞争空白是结构性的、不是没人想到：input 的 why_unsolved 写明"靠限额/积分变现与不限量冲突"——竞品把图片放自家云上，每多一张图就多一分成本，所以必须限量或丢图。本地优先（IndexedDB 存图、用户自己的设备/网盘做备份）把边际成本压到零，"永不限量、永不丢图"对我们是免费的、对竞品是亏钱的。这是可持续的成本结构优势，也是竞品短期难跟的原因。
3) 护城河：几百件带照片、带位置的个人物品库迁移成本极高，长期留存天然好；一次性 Pro 解锁（导出/迁移/多设备）无服务器成本，独立开发者可盈利。
4) 完全满足硬约束：摄像头 input、浏览器端压图、IndexedDB、模糊搜索、ZIP 导入导出全是纯前端可做，不需任何 API、模型下载或运营，容器内即可做出可演示 PWA；buildable=confirmed(7)，是 12 个里少数不被平台/法律/基础设施封顶的。
5) 主要风险是 crowd 仅 weak(5)、"细分小众低付费"。business-first 的回应：小众但付费路径清晰、零边际成本，比"人多但没人付钱/收不了钱"更值得先做；验证方案直接测"越过竞品付费墙的比例"和 Pro 转化，两周即可判生死。

【为什么 C01 是候补而非首选】记账是 28 来源/5 平台、最扎实的需求，钱迹/MOZE 证明用户会付费。但 unmet 仅 4：无广告已有钱迹免费版、开源 BeeCount/ezBookkeeping，"竞争空白"不成立；"自动导入"在国内无合法实时路径，"多人共享"必须要账号+后端，与本地优先/单人 MVP 相冲突，红海里只能拼体验。若 C14 验证失败，可用同一套本地优先+官方账单 CSV 导入的技术底子转向这里。

【为什么 C29 是候补而非首选】唯一 unmet 与 buildable 双 confirmed 的候选，且 GetHuman 用路径库活了近 20 年，是有先例的生意；人民日报批评+三热搜是政策顺风。但它本质是持续众包验证的内容库——正违反"不能大量人工运营"，且无外网的开发者在容器里无法核实任何一家热线按键序列，演示只能是未经验证的数据，有误导风险；国内消费者侧付费与 B2B 中立性冲突，变现路径不清。适合作为有运营资源后的第二步。

【明确排除】C27 的"付费榜第一"是最强的直接付费信号，但同一新闻周期、下架、31 个克隆无一进商店说明是热点而非持续需求；通知联系人必须依赖短信/推送三方服务，且涉生死责任与合规下架风险，business-first 不该碰。C03/C05/C07 被腾讯/B 站法律姿态与加密封死；C23/C24/C34 面向 FOSS/自托管用户付费意愿低或自述"无商业模式"；C36 依赖 LLM 与地图 API 且携程/高德随时补齐；C17 被 iOS 封顶一半。

MVP 定义：【暂名】满屋 —— 本地优先的不限量家庭物品/衣橱管理 PWA

一句话定位：拍一张就是一件、永不限量、照片永不丢的家庭物品库，三秒找到"东西在哪"。竞品靠限额和积分收费，我们把图存在你自己的设备上，所以可以不限量。

目标用户：
- 核心：衣服多、囤货多的 22-35 岁年轻女性（小红书"衣橱管理/收纳/断舍离/囤货"人群），已试用过收纳先生/橘兜/氧气/尽简并撞过付费墙或丢过图。
- 次级：多储物空间的家庭主理人、频繁搬家的租房者。

核心功能（v1，6 项）：
1. 批量拍照入库：一次拍/选多张，每张自动生成一件物品，浏览器端压缩（长边 1280、约 150KB），先入库、后补信息；支持一张图裁多件。
2. 三级位置树 + 物品卡：房间→家具→格/箱；物品含名称、分类、标签、数量、购入日期、价格、备注；批量移动位置；每个位置可打印/生成二维码标签（纯前端生成，扫码即定位到该格）。
3. 即时搜索与快捷视图：名称/标签/位置/分类模糊搜索，"很久没用""即将过期（囤货）""某季衣物""某位置全部"一键筛选。
4. 不限量本地存储：IndexedDB 存物品与图片 Blob，申请 persistent storage，存储占用可视化，绝不设件数/图片上限。
5. 一键导出/导入：整库导出 ZIP（JSON+图片）或 JSON；导入可恢复/合并，换机与"永不丢图"的信任基础；这也是后续 Pro 付费点的入口。
6. 只读分享页：把某个位置/标签/全部衣橱生成一张单文件 HTML 或长图清单（晒衣橱、给家人看），无需服务器。

形态：PWA 纯前端网页（单页应用，可添加到手机桌面、完全离线可用），无后端、无账号；后续可用 Capacitor 套壳上架或做小程序版。容器内实现：vanilla JS/TS + IndexedDB + Canvas 压图 + 自带 ZIP 打包，无外部依赖。

第一版不做：
- 账号、云同步、多人协作（有需求再用用户自有 WebDAV/网盘做 Pro 同步，不自建云）。
- 小票 OCR 与 AI 识物（需模型下载或第三方 API，无外网不可做；且属"锦上添花"不是付费墙痛点）。
- 条码扫描、电商订单导入、到期提醒推送。
- 小程序版（需审核）、任何积分/限额/广告机制。

怎么验证是否真的解决了问题（上线后两周内判断，埋点为本地匿名计数、用户可选上报）：
- 入库门槛：首次打开 10 分钟内录入 ≥10 件的用户占比 ≥40%（批量拍照是否真降低了录入负担）。
- 越过竞品付费墙：7 天内单用户 ≥50 件（对应竞品 30/49 件付费点）的占比 ≥25%——证明"不限量"是真需求而非口号。
- 检索价值：第 2-4 周搜索/筛选次数 ÷ 新增件数 ≥1（真在用它找东西而不只是录入）；D30 留存 ≥20%。
- 付费意愿：导出备份/换机迁移/多设备入口设 Pro 一次性解锁（¥28-38），在 ≥50 件用户中转化 ≥5%；同时以测评帖形式发小红书，收藏率对标现有"物品管理 App 测评"帖。
- 定性：邀请 10 位写过相关测评的小红书作者试用，看"不限量不丢图"是否成为其推荐的首条理由；不足则说明痛点不在此，转向候补 C01。

## 五、需求详情与证据

本文只展开前 15 名；全部 50 个簇的详情见同目录 [details.md](details.md)，原始数据见 data/。

### 1. 自建相册家庭要好用的共享与断点上传（C23，总分 6.6）

**一句话**：寄生Immich API的家庭共享伴侣服务

**用户与场景**：自托管相册家庭与NAS用户。伴侣共享只能整库不能挑图库且官方冻结两年

**现有方案及不足**：Immich四套共享（自认confusing）

**为何至今没解决**：共享涉及访问控制重构，Immich 2024-09起feature

**验证结论**：unmet=weak(6) crowd=confirmed(8) buildable=weak(5)

- *unmet* → weak（6）：核实结论（2026-09-27，GitHub 实查 + 既有知识）：

1) 免费开源自托管阵营里没有一个方案同时覆盖"按图库选择性共享+一致的权限模型+给伴侣照片点收藏/合并人物+分块断点上传+相册与网盘共用一份存储"。
- Immich（115.1k★，最活跃）：#12614「Better sharing in Immich (feature freeze)」仍 open，👍749/总 reactions 1020、259 评论，最近更新 2026-05-31，冻结自 2024-09 已持续两年；v3.2.0（2026-09-10）新增 cluster groups/trusted users，官方措辞仅是"the first step towards better sharing"。分块上传：讨论 #1674 780 票（feature-request 榜首），服务端 PR #22385「feat(server): resumable uploads」2025-09-25 开至今仍 open（最近活动 2026-09-26），卡在 iOS URLSession 无分块概念 + Cloudflare 100MB 限制；2026-08 新 issue #30747 实测 6–9 GiB 视频三个月都传不完（"non-resumable POST"），被 closed as dup
  - 竞品/替代：Immich（自托管，115.1k★，AGPL） — 不够用。四套共享机制（相册/伴侣/链接/外部库）并存，最高票 issue #12614 冻结两年仍 open；v3.2.0（2026-09）才迈出"第一步"（跨用户人脸 cluster groups）。分块/断点上传 PR #22385 开了一年未合并，2026-08 仍有多 GB 视频传不完的实测。核心团队在做，但截至今日未解决。（https://github.com/immich-app/immich）
  - 竞品/替代：PhotoPrism（自托管，40.2k★，社区版免费+Plus/Pro 会员） — 不覆盖。多用户私有/共享图库 #98 自 2019 年 open（844 reactions，in-progress），社区版所有用户共用一个库、无按用户收藏；高级功能（完整用户管理等）在付费会员层。（https://github.com/photoprism/photoprism）
  - 竞品/替代：Nextcloud + Memories（3.8k★，AGPL，活跃） — 部分覆盖、体验弱。唯一原生做到"网盘与相册同一份文件"且 Nextcloud 客户端支持分块上传；共享走 Nextcloud 成熟的用户/群组/链接机制。但共享相册未纳入全部功能（#724）、共享相册权限（#530）仍 open，人脸靠 Recognize 插件偏弱，iOS 无 Memories 客户端、Nextcloud iOS 自动上传口碑差（#2225 131 reactions）。（https://github.com/pulsejet/memories）
  - 竞品/替代：Ente Photos 自托管（29.1k★，E2EE） — 覆盖共享子集，不覆盖存储合一。协作相册、分享链接、家庭计划、后台上传（S3 多段）在自托管下可用；但官方声明自托管文档不完善、不优先支持；加密对象存储无法与 NAS 目录/网盘共用文件、无法导入现有目录树，ML 仅端侧。（https://github.com/ente-io/ente）
  - 竞品/替代：LibrePhotos（8.1k★） — 不够用。协作相册/共享 ACL(#261)、共享库(#395)、共享人脸标签(#632) 全部 open 多年，移动端备份弱。（https://github.com/LibrePhotos/librephotos）
  - 竞品/替代：Photoview（6.5k★）/ PiGallery2（2.3k★） — 不覆盖。目录只读画廊，按用户授权文件夹和分享链接可以，但无手机自动备份、无伴侣共享/协作相册。（https://github.com/photoview/photoview）
- *crowd* → confirmed（8）：逐条核验簇内证据（全部在 github.com 上实际打开）：(1) immich #12614 经 GitHub API 核实：👍749、总 reactions 1020、259 条评论、label sharing、2024-09-12 由维护者 jrasm91 开启、至今 open；引文 "Sharing precious photos and videos is an important part of immich, but right now it is a bit confusing and limiting" 属实，是维护者对功能缺陷的承认而非推荐/清单内容。(2) Discussions 榜单核实：Upload large files in chunks #1674 现为 792 票（采集时 780）、24 评论+58 回复、2022-09 开启、2024-10 被锁定，对应的服务端 PR #22385 "resumable uploads" 2025-09-25 开启、截至 2026-09-26 仍 open（👍38）；Choose Libraries for Partner Sharing #4500 291 票。簇里把 nested albums/partner sharing/locked folder 的票数错位了一行（291/261/232 的归属与页面
  - 竞品/替代：Immich built-in sharing (albums / partner sharing / shared links / external libraries) — 115.1k stars；功能存在但维护者自认 'confusing and limiting'，2024-09 起 feature freeze，2025-05 仍称权限机制重做要等 stable 之后；partner sharing 只能整库共享（#4500 291票未解决）；断点上传 PR #22385 开了一年仍未合并（https://github.com/immich-app/immich）
  - 竞品/替代：PhotoPrism multi-user / sharing — 40.2k stars；多用户共享 epic #98 自 2019 年 open 至今（👍610），标 in-progress；现有共享主要靠链接与 WebDAV，不满足家庭级伴侣共享（https://github.com/photoprism/photoprism/issues/98）
  - 竞品/替代：Nextcloud Memories — 3.8k stars；有相册共享与外部分享，但共享相册权限（#530）、共享相册纳入时间线/搜索（#724/#503）等仍是 open 需求；AI 能力弱（https://github.com/pulsejet/memories）
  - 竞品/替代：Ente (self-hostable, E2EE) — 29.1k stars；README 明确提供 family plans、collaborative albums、private sharing，且可自托管——簇未提及，是家庭共享这一分支的部分替代；但自托管门槛较高、依赖其官方客户端、E2EE 模型下服务端 AI/人脸功能受限（此点为经验判断，不确定最新状态）（https://github.com/ente-io/ente）
  - 竞品/替代：xXRoxXeRXx/integration_immich (Nextcloud app) — 74 stars；把 Immich 库嵌进 Nextcloud 浏览，是'网盘与相册合一'的只读桥接，不解决账号打通与共用存储（https://github.com/xXRoxXeRXx/integration_immich）
  - 竞品/替代：felixandersen/sneak-link — 187 stars；为 Immich/Nextcloud 分享链接加访问控制的外挂，解决的是对外分享安全，不是家庭内部共享（https://github.com/felixandersen/sneak-link）
- *buildable* → weak（5）：【簇事实核对（2026-09-27 GitHub 实查）】Immich 115k star，最新 v3.2.2（2026-09-15）。#12614「Better sharing (feature freeze)」仍 open，749 👍 / 1020 reactions / 259 评论，最后更新 2026-05-31，tracker 状态仍是 Ready，冻结 2 年未见重设计发布。分块上传：feature-request 讨论仍 open（557 upvotes，2022-09 发起）；上游 PR #22385（服务端 RUFH resumable upload）仍 open，卡在 Cloudflare Tunnel + iOS URLSession 100MB 限制，2026-09 评论提到 iOS 27 新 API 可能解锁；2026-08 issue #30747 证实 Android 客户端仍是"不可续传 POST + 3 并发固定通道 + 19 分钟后台取消"，6-9GB 视频数月备份不上。痛点真实且上游尚未解决。

【Q1 小团队 2-6 周能否做出 MVP】部分可以，但只能做"外挂"，碰不到核心权限模型：
(a) 家庭共享层：Immich 有完整 OpenAPI + 每用户 API key，可在 2-4 周做一个 Web 伴侣应用（参考 immich-power
  - 竞品/替代：Immich PR #22385 feat/server-chunked-uploads (RUFH) — 上游官方断点/分块上传服务端实现，截至 2026-09 仍 open，卡在 Cloudflare Tunnel + iOS 100MB 请求限制，无 ETA；落地后将直接消除续传痛点并使第三方 sidecar 失去价值。（https://github.com/immich-app/immich/pull/22385）
  - 竞品/替代：immich-public-proxy (alangrainger) — 2.3k star，只解决公开链接安全分享，只读、无家庭/伴侣权限模型，不覆盖选择性共享与收藏。（https://github.com/alangrainger/immich-public-proxy）
  - 竞品/替代：immich-power-tools — 2.7k star，AGPL 非官方客户端，提供相册批量共享/编辑、人物合并等组织工具；证明 API 外挂模式可行，但无规则式伴侣共享、无可解释权限、无续传。（https://github.com/immich-power-tools/immich-power-tools）
  - 竞品/替代：immich-drop — 625 star，零登录收集他人照片进自己 Immich 的小工具，覆盖'家人往共享相册投稿'的一小块，无权限管理。（https://github.com/Nasogaa/immich-drop）
  - 竞品/替代：immich-go (simulot) — 6.9k star，Go CLI 批量上传/Google Takeout 迁移，无移动端、未见分块续传能力。（https://github.com/simulot/immich-go）
  - 竞品/替代：immich-upload-optimizer — 305 star，上传前置代理模式（压缩），验证 sidecar 拦截上传可行，但不做分块续传。（https://github.com/miguelangel-nubla/immich-upload-optimizer）

**用户原话 / 关键证据**：
> Immich #12614「Better sharing」👍749/259评论，仓库最高票，冻结至今open
> 「Upload large files in chunks」792票榜首

**证据链接**：
- [] https://github.com/immich-app/immich/issues/12614 — Sharing precious photos and videos is an importan…（👍 749, 总 reactions 1020 (❤9…）
- [] https://github.com/immich-app/immich/discussions/categories/feature-request?discussions_q=is%3Aopen+sort%3Atop — [Feature]: Upload large files in chunks 780 upvot…（780 / 291 / 261 / 232 / 198…）
- [] https://github.com/immich-app/immich/issues/16549 — [META] Stacks on all views — For album sharing sp…（👍 96, 14 评论, Backlog）
- https://github.com/immich-app/immich/pull/22385
- https://github.com/photoprism/photoprism/issues/98

**产品概念**：Docker单容器+Web面板：成员各用API key接入

**MVP 范围**：4-6周1-2人：API配对、规则共享

**风险**：价值全寄生Immich API且上游已在做（#12614重设计

### 2. 微信用户要免电脑可读可搜的聊天记录导出与瘦身（C03，总分 6.2）

**一句话**：不碰微信数据库的聊天存证归档器：截图本地OCR→可检索档案

**用户与场景**：微信重度用户、换机者、维权者。微信占满手机、迁移需两台设备且备份加密不可读

**现有方案及不足**：官方迁移备份（加密）；WeChatMsg 42k★停更

**为何至今没解决**：SQLCipher加密+iOS沙盒使手机端读取不可能

**验证结论**：unmet=weak(6) crowd=confirmed(8) buildable=refuted(3)

- *unmet* → weak（6）：结论：方案很多，但没有一个覆盖簇定义的核心场景（免电脑、跨iOS/安卓、可读可搜、选择性导出），且头部开源方案基本被腾讯DMCA/律师函打死；只能判 weak 而非 refuted，也不到 confirmed，因为"可读导出"这一底层需求对有电脑的用户已有活跃可用方案。

GitHub 实证（2026-09-27）：
1) 被打死/停更：LC044/WeChatMsg 42,086★ README自述不再更新；xaoyaoo/PyWxDump 9.7k★ 收到微信法务函后删光代码并要求用户删除本地副本；SuxueCode/WechatBakTool 3.7k★ 收到腾讯向GitHub提交的DMCA、不再提供源码；hicccc77/WeFlow 14.5k★ 明写"不再提取密钥/不再解密数据库/不再干扰软件运行"、Releases 页面为空（无可下载版本）；ycccccccy/echotrace 3.8k★ 明写"现已停止维护"；echotrace 推荐的替代 ILoveBingLu/miyu 返回404。
2) 仍活跃但全部依赖电脑：LifeArchiveProject/WeChatDataAnalysis 3.4k★（今日仍有push，支持微信4.x，Win/macOS 15+ ARM，导出HTML/JSON/TXT/xlsx含图片语音，靠扫描进程内存取key，免责声明提示"账号
  - 竞品/替代：微信官方：聊天记录迁移与备份 / 存储空间管理 / 腾讯文件助手小程序 — 不够。迁移到手机为整机或按聊天的加密迁移，不可读不可搜；备份到电脑需电脑与手机同一Wi-Fi且备份文件加密不可读；存储空间管理只能按聊天删缓存，不做归档导出；文件助手小程序非会员500MB且不是聊天导出。是否已上线付费云备份不确定。
  - 竞品/替代：LifeArchiveProject/WeChatDataAnalysis（开源，活跃） — 对有 Windows/Apple Silicon Mac 的用户基本够用：支持微信4.x，导出HTML/JSON/TXT/xlsx含图片语音，2026-09仍在更新。但必须电脑、靠扫进程内存取key、有账号异常与法律风险、微信升级需等适配、近期有2.3.0无法启动的严重issue；不解决免电脑与安卓端。（https://github.com/LifeArchiveProject/WeChatDataAnalysis）
  - 竞品/替代：BlueMatthew/WechatExporter（开源，iOS备份路线） — iOS用户有电脑时可用：iTunes加密备份→HTML/PDF/TXT，8.5k★。缺点：需电脑，最后更新2025-02，131个open issue，安卓需先迁到苹果设备；新版微信解析兼容性存疑。（https://github.com/BlueMatthew/WechatExporter）
  - 竞品/替代：chclt/oh-my-wechat（开源，浏览器本地读iOS备份） — 部分够用：本地浏览+搜索+年度报告，但需电脑做iTunes/Finder加密备份，且自述微信8.0.55+大部分数据无法解析，仅iOS。（https://github.com/chclt/oh-my-wechat）
  - 竞品/替代：WeChatMsg / WeFlow / PyWxDump / WechatBakTool / echotrace（历代头部开源） — 不够。合计约7万★但全部停更或被腾讯DMCA/律师函清场：WeChatMsg不再更新；WeFlow删除密钥提取与解密且无Release；PyWxDump删库；WechatBakTool删源；echotrace停维护。老版本仅对微信3.x有效。（https://github.com/LC044/WeChatMsg）
  - 竞品/替代：wx-cli-again / wechat-db-decrypt-macos / pc_wechat_exp / wechat-local-viewer / robbin wechat-exporter（2026年新一代CLI） — 开发者可用，普通用户不够用：命令行、以macOS为主、只测过特定微信小版本（如4.1.2.241）、每次微信更新需重适配、需电脑。（https://github.com/jackwener/wx-cli-again）
- *crowd* → confirmed（8）：对簇内 evidence 的审视：(1) 3 条证据全是 GitHub，其中第 2 条（搜索页 198 仓库）与第 1/3 条重叠，且 198 里含镜像/fork（jacklilyhello/WeFlow 228★、xxxxshuai/WeChatMsg 290★ 均为复制品）和无关仓库，"top-8 合计 37k"有小幅高估；描述中提到的微博热搜、小红书 4 个问答页未出现在 evidence 数组，无法核实 independent_source_count=21。(2) 但引文本身不是软文/清单，而是"想要且现有的都不行"的直接表述：WeChatMsg README "此项目很久没有（也不会）更新了"、WeFlow README "我们曾天真地以为，你和家人的聊天记录、你和老板的工作对接…是属于你自己的"+"不再提取密钥/不再解密数据库"，均已在页面原文核实。(3) 互动全部可见且巨大：WeChatMsg 42.1k★/5.3k fork；WeFlow 2026-01 创建、9 个月 14,488★/485F/93 open issues；PyWxDump 9.7k★（2025-10-20 收微信律师函后删库）；WechatExporter 8.5k★/130 issues；echotrace 3.8k★（5 个月即"现已停止维护"）；WechatBakTool 3.7k★；W
  - 竞品/替代：hicccc77/WeFlow — 最活跃方案（14.5k★），但仅 PC 端、遭 DMCA 后自阉密钥提取/解密，用户报告封号（#414），4.1.x 版本适配持续打补丁（https://github.com/hicccc77/WeFlow）
  - 竞品/替代：LC044/WeChatMsg — 42k★ 但已弃维护，仅 Windows PC，issue 已关闭（https://github.com/LC044/WeChatMsg）
  - 竞品/替代：xaoyaoo/PyWxDump — 9.7k★，2025-10 收律师函后删库，不可用（https://github.com/xaoyaoo/PyWxDump）
  - 竞品/替代：BlueMatthew/WechatExporter — 8.5k★，iOS 用户需 iTunes 全量备份到 PC/Mac 再解析，安卓需先迁到 iPhone/iPad；最后推送 2025-02，兼容只到微信 8.0.9（https://github.com/BlueMatthew/WechatExporter）
  - 竞品/替代：ycccccccy/echotrace — 3.8k★，已停止维护（https://github.com/ycccccccy/echotrace）
  - 竞品/替代：SuxueCode/WechatBakTool — 3.7k★，Windows PC 版专用，被列入 2026-01 腾讯 DMCA 名单（https://github.com/SuxueCode/WechatBakTool）
- *buildable* → refuted（3）：【1. 小团队 2-6 周能否做出真正解决核心痛点的 MVP】核心痛点 = 免电脑 + 跨 iOS/安卓 + 含图片语音的全保真选择性导出为可读可搜格式 + 释放空间。可选技术路径逐条核查：
(a) 电脑端解密本地数据库（WeChatMsg/WeFlow/WechatBakTool/EchoTrace/WeChatDataAnalysis 路线）：技术上有大量开源参考、1-2 人两周可复刻，但它恰恰是"需要电脑"的路线，微信 4.x 每次升级即失效，且是腾讯 DMCA 的直接打击对象——不满足痛点定义且灰色，不能作为产品基础。
(b) iTunes/Finder 未加密备份解析（BlueMatthew/WechatExporter 8.5k★、仍在维护、输出 HTML/PDF/Text）：不需要从内存抠密钥，合规性相对最好，但仍需电脑、仅 iOS（安卓要先迁移到 iPhone），且是已存在的成熟方案，没有新增产品空间。
(c) 真正"免电脑"的手机端路径：iOS 沙盒下第三方 App、快捷指令均无法读取微信容器，iCloud 备份不开放，无越狱无解——iOS 端在物理上不可能；安卓非 root 无法读取 /data/data/com.tencent.mm，微信 allowBackup=false，剩下只有无障碍服务读屏/自动滚动（微信有外挂检测，封号风险，且拿不到语音原文件、图片原
  - 竞品/替代：BlueMatthew/WechatExporter（iTunes 未加密备份解析，Windows/Mac，输出 Text/HTML/PDF） — 8.5k★、v1.8.0.10 仍在维护、不解密不抠密钥、合规性最好；但必须电脑、必须关闭备份加密、仅 iOS（安卓需先迁移到 iPhone），不满足'免电脑'。（https://github.com/BlueMatthew/WechatExporter）
  - 竞品/替代：hicccc77/WeFlow（本地微信聊天导出 + 年度报告） — 14.5k★，2026-01 收 DMCA 后声明不再提取密钥/不解密数据库，功能实质停摆；证明解密路线法律上不可持续。（https://github.com/hicccc77/WeFlow）
  - 竞品/替代：LC044/WeChatMsg — 42.1k★，作者声明'不会更新'，仅留'截图+OCR 也许一年也许十年'的设想；PC 解密路线已被作者放弃。（https://github.com/LC044/WeChatMsg）
  - 竞品/替代：LifeArchiveProject/WeChatDataAnalysis（微信 4.x 解密 + 年度总结） — 3.4k★、2026-09 仍在活跃更新，是目前 4.x 上最新的 PC 解密方案；但社区已建'survives upstream takedown'备份仓（wukongtime/WeChatDataAnalysis-backup），下架预期明确，需电脑且灰色。（https://github.com/LifeArchiveProject/WeChatDataAnalysis）
  - 竞品/替代：shibanyu333/wechat-chat-export（macOS 读屏+滚动截图+本地 OCR → Word/Markdown，不解密不读库） — 0-1★、2026-08/09 新建，验证了'不碰数据库的 OCR 路线'技术可行且合规；但仍是 Mac 端、单会话、有损，无语音，不能瘦身。（https://github.com/shibanyu333/wechat-chat-export）
  - 竞品/替代：WechatBakTool / EchoTrace / wx4py / pc_wechat_exp 等 PC 解密工具 — 3.7k/3.8k/749/566★，均依赖 Windows 端解密微信数据库，随微信升级失效，同属腾讯打击范围。（https://github.com/search?q=%E5%BE%AE%E4%BF%A1+%E8%81%8A%E5%A4%A9%E8%AE%B0%E5%BD%95+%E5%AF%BC%E5%87%BA&type=repositories&s=stars&o=desc）

**用户原话 / 关键证据**：
> WeChatMsg 42,086★首行「此项目很久没有（也不会）更新了」；WeFlow 9个月14,488★
> 腾讯2026-01-08 DMCA点名29仓库、波及4,195 fork；十年≥9位作者反复重造

**证据链接**：
- [] https://github.com/LC044/WeChatMsg — README 首行："此项目很久没有（也不会）更新了（未来也许会考虑截图+OCR实现…（42,086 stars / 5,329 forks；）
- [] https://github.com/search?q=%E5%BE%AE%E4%BF%A1+%E8%81%8A%E5%A4%A9%E8%AE%B0%E5%BD%95+%E5%AF%BC%E5%87%BA&type=repositories&s=stars&o=desc — 198 repositories：WeFlow 14.5k / WechatExporter 8.…（198 个仓库；top-8 合计约 37k stars）
- [] https://github.com/hicccc77/WeFlow — "我们曾天真地以为，你和家人的聊天记录、你和老板的工作对接、你保存在本地电脑上的数据…（14.5k stars, 484 forks…）
- https://github.com/github/dmca/blob/master/2026/01/2026-01-08-tencent.md
- https://github.com/LifeArchiveProject/WeChatDataAnalysis

**产品概念**：手机端对会话录屏/连续截图，本地OCR按气泡分割解析说话人与时间戳

**MVP 范围**：3-5周：截图→OCR→分割去重、导出

**风险**：buildable被反驳(3)：免电脑全保真被沙盒与腾讯法律姿态封死

### 3. 消费者要一键直达各企业人工客服的路径库（C29，总分 6.2）

**一句话**：持续验证的各企业转人工路径库+一键拨号按键序列+投诉模板

**用户与场景**：遇售后/快递/银行纠纷的消费者与。智能客服绕圈找不到人工，各家路径不同且频繁改动；12315只登记不解决接通

**现有方案及不足**：GetHuman（美国）、Pixel/iOS 26代排队（大陆不可用）

**为何至今没解决**：企业刻意隐藏并频繁改入口需持续众包验证

**验证结论**：unmet=confirmed(7) crowd=weak(5) buildable=confirmed(7)

- *unmet* → confirmed（7）：海外有成熟对标：GetHuman（2006 年起，众包各公司客服电话、"按 0 再说 representative"式转人工按键序列、等待时长、最佳拨打时段，免费广告模式）证明"反客服路径库"这个品类成立且可持续 20 年；Google Pixel 的 Direct My Call（IVR 菜单转文字可点选）+ Hold for Me、Apple iOS 26 的 Hold Assist（2025 年 WWDC 发布，自动等待人工接听）说明"自动排队/导航"部分正在被操作系统层吸收；DoNotPay 的 Skip Waiting on Hold 走付费墙且 2024 年被 FTC 处罚、口碑差；FastCustomer/LucyPhone 等独立 hold-for-me 应用已停运。但以上全部只覆盖欧美企业与英文 IVR，对簇的目标人群（中国消费者、微博/人民日报/12345 语境）零覆盖。中国市场核心场景（持续更新的各企业转人工路径库 + 自动拨号按键序列）目前没有任何像样的产品：黑猫投诉/12315/12345/消费保只做投诉登记与升级，不解决"接通人工"；工信部适老化要求的运营商/银行"老年人一键转人工"只对 65 岁以上、且只限少数行业；小米/华为/OPPO/vivo/荣耀的 AI 通话助理主要面向来电代接、实时字幕，未见针对外呼客服排队+IVR 导航的功能（2025-20
  - 竞品/替代：GetHuman (gethuman.com) — 海外最成熟对标：2006 年起众包各公司客服电话、转人工按键序列、等待时长、最佳拨打时段，免费（广告/少量付费）。真正覆盖该场景，但只有欧美企业与英文 IVR，对中国企业零覆盖；20 年未做大、用户常抱怨数据过期，说明众包维护是结构性难点。不够用（中国市场）。（https://gethuman.com）
  - 竞品/替代：Google Pixel Direct My Call + Hold for Me — Direct My Call 把 IVR 语音菜单转成可点选文字，Hold for Me 自动等待人工接听后提醒。系统级、免费、体验好，但 Pixel 独占、仅美加英澳等英语市场，中国大陆不可用；且不提供跨企业路径库。不够用。
  - 竞品/替代：Apple iOS 26 Hold Assist — 2025 年 WWDC 发布，识别等待音乐后自动排队、人工接听时通知。覆盖'自动等待'子需求，但不提供转人工按键路径，且中国大陆是否可用不确定（依赖运营商与地区支持）。部分覆盖。
  - 竞品/替代：DoNotPay – Skip Waiting on Hold — 付费订阅，2024 年因虚假宣传被美国 FTC 处罚，口碑差；仅美国企业。不够用。
  - 竞品/替代：FastCustomer / LucyPhone（hold-for-me 独立应用） — 早期'帮你排队'应用，均已停运（具体停运时间不确定）。说明独立做'自动排队'难以商业化。
  - 竞品/替代：黑猫投诉（新浪） — 免费、国内知名、企业迫于曝光通常会回应，较好覆盖'投诉升级'子需求；但只做投诉登记，不解决'当下接通人工'，也无路径库和拨号序列。部分覆盖。（https://tousu.sina.com.cn）
- *crowd* → weak（5）：证据本身审视：(1) 三条 evidence 的 quote 全是微博热搜"话题标题"（《人民日报批智能客服不智能》《人工客服难找对消费者带来哪些困扰》《如何解决智能客服不智能》），不是任何用户的原话；没有一条在说"我想要一个各企业转人工路径库/自动拨号/投诉话术模板"，簇的"诉求"完全是整理者的推断，把媒体议程（人民日报评论引发的话题运营）读成了产品需求。(2) 来源不独立：3 条全部来自 s.weibo.com、同一天快照、同一个新闻触发点（人民日报一篇批评稿带出的3个衍生话题），实际是 1 个来源；字段 independent_source_count=4 与 platforms=["微博"]、evidence=3 条自相矛盾。描述中"多省因此取消12345语音导航"无引用，无法核实，标记为不确定。(3) 互动：只有热搜榜位（#12/#18/#20，上榜1天），没有任何单条帖子的转评赞，看不到有多少人"跟着说"，更看不到有人附和"需要第三方路径库"。(4) 常识判断：底层痛点（智能客服绕圈、找不到人工）在中国确实是多年反复被抱怨的公共议题——中消协年度报告、315 报道多次点名，工信部近年也在推动基础电信企业客服热线"一键转人工"（具体文件年份不确定）；海外 GetHuman 自 2006 年起专做"各公司电话+按键序列直达人工"并长期存活，Google Pixel 的 Ho
  - 竞品/替代：GetHuman (gethuman.com) — 海外（主要美国）各公司客服电话+按键序列+等待时间数据库，2006 年起存在，证明该产品形态在英语市场有需求；基本不覆盖中国企业，中文用户不可用。（https://gethuman.com）
  - 竞品/替代：Google Pixel 'Hold for Me' / 'Direct My Call' — Pixel 手机内置，替用户排队并显示 IVR 菜单选项；仅限美国等少数地区、仅电话渠道，不覆盖 App 内聊天机器人转人工。
  - 竞品/替代：Apple Hold Assist (iOS 26, 2025 WWDC 发布) — 系统级代排队等待人工；不提供各企业转人工路径，且中国区可用性不确定。
  - 竞品/替代：工信部对基础电信企业客服热线'一键转人工'的要求（具体文号/年份不确定） — 监管强制运营商提供直达人工入口，部分消解运营商场景的需求，但不覆盖电商、快递、银行以外的多数行业。
  - 竞品/替代：12315 / 黑猫投诉 — 投诉受理渠道，不解决'接通人工'问题；GitHub 上 12315 相关仓库均为 0 star 的投诉材料 Agent Skill。
  - 竞品/替代：FuzzyLogic112/zhuanrengong — 今日新建、0 star、63 家企业 25 条实测记录，无社区参与；疑为本工作流自产，不能证明需求。（https://github.com/FuzzyLogic112/zhuanrengong）
- *buildable* → confirmed（7）：【1. 可建性：高】1-3 人 2-4 周可做出真正有用的 MVP，核心是"内容运营 + 轻量前端"，不是技术难题。技术路径：(a) 数据层：结构化条目库（企业名/行业/热线号码/DTMF 转人工按键序列/在线客服转人工关键词与步骤（如连发"人工""投诉"）/最佳拨打时段/上级监管投诉渠道：12315、12345、工信部 12300 电信申诉、国家邮政局 12305 快递申诉、金融监管 12378、黑猫投诉），先由团队自己在 1-2 周内手工打电话验证 Top 200-300 家（三大运营商、主要银行/保险、快递、电商与外卖平台、航空/12306、微信支付宝等）即可覆盖绝大多数消费者纠纷场景，不依赖冷启动众包。(b) 前端：微信小程序 + H5（老年人以大字号、语音播报、家人代查为主），搜索企业 → 一屏展示路径 → 一键拨号。Android 上 `tel:` URI 支持","暂停符自动发送 DTMF（`tel:10086,,0`），iOS Safari/小程序 `wx.makePhoneCall` 对暂停符支持不可靠，需退化为"大字显示按键序列 + 复制 + 边听边按"提示，这是主要技术瑕疵但不致命。(c) 话术/升级模板：静态模板 + 可选 LLM 按用户填写的事实生成投诉信/申诉信（12315 与工信部申诉文书），成本极低。(d) 保鲜机制：每条目带"最近验证日期"、用户一
  - 竞品/替代：GetHuman（美国） — 海外同类先例：企业人工客服电话/按键路径库 + 排队代打 + 用户反馈保鲜，运营近 20 年，证明模式可持续；不覆盖中国企业，国内无等价产品。（https://gethuman.com）
  - 竞品/替代：DoNotPay（美国） — 消费者维权/投诉信自动生成的付费订阅先例，对应本簇'投诉升级话术模板'部分；仅美国市场。（https://donotpay.com）
  - 竞品/替代：黑猫投诉 — 只做投诉曝光与转办，不提供各企业转人工路径与按键序列，不解决'找不到人工入口'。（https://tousu.sina.com.cn）
  - 竞品/替代：全国12315平台 — 官方投诉/举报入口，是升级渠道之一，但不提供企业客服直达路径，流程慢。（https://www.12315.cn）
  - 竞品/替代：工信部电信用户申诉受理中心（12300） — 仅针对电信运营商的升级申诉渠道，可作为路径库中的'升级节点'，本身不解决入口问题。（https://yhssglxt.miit.gov.cn）
  - 竞品/替代：国家邮政局申诉（12305） — 仅针对快递的升级申诉渠道，同上。（https://sswz.spb.gov.cn）

**用户原话 / 关键证据**：
> 《人民日报批智能客服不智能》热搜#12，同日《人工客服难找》#20、#18三话题在榜
> GitHub「转人工/gethuman」127个仓库无一是消费者侧工具；GetHuman靠路径库存活近20年

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E4%BA%BA%E6%B0%91%E6%97%A5%E6%8A%A5%E6%89%B9%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D%E4%B8%8D%E6%99%BA%E8%83%BD%23&t=31&band_rank=12&Refer=top — 热搜话题：《人民日报批智能客服不智能》（微博热搜榜(快照排名#12，上榜1天)）
- [] https://s.weibo.com//weibo?q=%E4%BA%BA%E5%B7%A5%E5%AE%A2%E6%9C%8D%E9%9A%BE%E6%89%BE%E5%AF%B9%E6%B6%88%E8%B4%B9%E8%80%85%E5%B8%A6%E6%9D%A5%E5%93%AA%E4%BA%9B%E5%9B%B0%E6%89%B0&t=31&band_rank=20&Refer=top — 热搜话题：《人工客服难找对消费者带来哪些困扰》（微博热搜榜(快照排名#20，上榜1天)）
- [] https://s.weibo.com//weibo?q=%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D%E4%B8%8D%E6%99%BA%E8%83%BD&t=31&band_rank=18&Refer=top — 热搜话题：《如何解决智能客服不智能》（微博热搜榜(快照排名#18，上榜1天)；）
- https://gethuman.com
- https://github.com/FuzzyLogic112/zhuanrengong

**产品概念**：小程序+H5：收录Top300企业热线、DTMF转人工按键序列、在线客服转人工步骤与申诉渠道

**MVP 范围**：2-4周：实测入库Top200-300家

**风险**：crowd仅weak(5)：证据全为热搜标题无用户原话

### 4. 读者要把公众号等封闭平台变成RSS并归档（C07，总分 6）

**一句话**：合规收缩的公众号归档器：自有号导出+正文剪藏检索+私有RSS

**用户与场景**：RSS/Obsidian用户。公众号无RSS；三大开源方案2026集体失守（exporter 13k★停维

**现有方案及不足**：微信读书订阅、搜狗搜索、we-mp-rss 4.7k★

**为何至今没解决**：腾讯主动关闭旁路（2026-07-31关搜索接口）

**验证结论**：unmet=weak(6) crowd=confirmed(7) buildable=weak(4)

- *unmet* → weak（6）：核心场景（任意公众号→稳定RSS+全文归档检索）目前没有成熟、免费、口碑好的方案，但并非"完全没有像样方案"，且簇里捆绑的若干子场景其实已被解决，因此判 weak 而非 confirmed。

已在 GitHub 上核实的事实（2026-09-27）：
1) 三个最大的开源方案在 2026 年集体失守：wewe-rss 9.7k★ 于 2026-05-11 归档、274 open issue（#209"因数量过多被永封"）；wechat-article-exporter 13k★ 于 2026-07-30 发 #200 宣布停止维护（"上游核心接口已被微信关闭"），#199 报 200013 freq control，域名 2026-10-30 到期；feeddd 2.1k★ 2023-07 关闭、wechat-feeds 2021 停服、zhu327/rss 归档。
2) 仍存活的方案全部在灰色旁路上挣扎：we-mp-rss 4.7k★（2026-09-24 仍有推送）在 #456 证实 7/31 后公众平台接口被封、刷新返回空，#442 改走微信读书 web 接口且自述"Cookie 刷新、风控均未测试"，#411 重新授权后订阅丢失、#465 订阅成功但列表无内容；wechat-download-api 1.1k★ 7/31 起 #22 freq control，9/24 #
  - 竞品/替代：we-mp-rss (rachelos) — 当前唯一仍活跃维护的自建公众号RSS方案（4.7k★，2026-09-24 有推送，支持RSS/MD/PDF导出/Webhook）。但依赖微信读书登录态、token 默认3天过期需扫码续期；2026-07-31 后旧接口被封改走微信读书 web 接口，作者自述风控与 cookie 刷新未测试；重新授权后订阅丢失、部分公众号永不更新的 issue 长期存在。能用但不稳，普通读者门槛高。（https://github.com/rachelos/we-mp-rss）
  - 竞品/替代：Wechat2RSS (ttttmr / wechat2rss.xlab.app) — 自2021年运营的托管服务，免费部分只覆盖维护者精选的 300+ 公众号，任意公众号需付费私有部署（并自备账号）；issue 区几乎全是求添加公众号的请求，说明自助订阅任意号未被满足；有付费后未激活的投诉。（https://github.com/ttttmr/Wechat2RSS）
  - 竞品/替代：wewe-rss (cooderl) — 曾是最流行方案（9.7k★），2026-05-11 已归档只读，274 open issue；单微信读书账号订阅数量过多即进小黑屋甚至永封。不再可依赖。（https://github.com/cooderl/wewe-rss）
  - 竞品/替代：wechat-article-exporter — 13k★ 的批量导出工具（HTML/Markdown/Excel 含阅读量评论），2026-07-30 因微信关闭上游接口停止维护，域名 2026-10-30 到期。已失效。（https://github.com/wechat-article/wechat-article-exporter）
  - 竞品/替代：wechat-download-api (tmwgsicp) — 走公众平台后台接口，需自己拥有一个公众号并扫码登录，带代理池反风控和 RSS/MCP；2026-07-31 起报 freq control，9/24 用户问'项目失效？'无回复，最后提交 7/27。目前疑似失效。（https://github.com/tmwgsicp/wechat-download-api）
  - 竞品/替代：qiye45/wechatDownload — 9.6k★ 活跃桌面工具（v4.7，Win/macOS），通过微信客户端密钥批量下载历史文章为 html/mhtml/md/pdf/docx/csv，含评论和图片。较好覆盖'批量导出归档'子场景，但不提供 RSS 追更，且 2026-09 大量'起始下载页数：0'卡住的 issue，稳定性随微信客户端变化波动。（https://github.com/qiye45/wechatDownload）
- *crowd* → confirmed（7）：对簇内 3 条 evidence 的逐条审视：(1) RSSHub "Everything is RSSible" 是产品 tagline，不是需求引文，只能算供给侧信号（46.3k★，且 lib/routes/wechat 下有 13 个文件：sogou/wechat2rss/feeddd/uread/ce/data258/ershcimi/msgalbum/mp…——多条旁路并存本身说明需求长期存在且每条路都会断）；(2) newsnow #199 是真实 feature request，但无正文、0 评论、无可见 reaction，属"一个人提了一句"；同仓库 2026-07 另有独立作者 #364 "没有微信公众号…现在微信公众号还是蛮火的吧"，同样 0 评论；(3) "112 repositories" 是搜索计数，前十里混入 china-dictatorship、learning-golang、gege-circle 等噪音，但核心项目 star 数经核实属实。三条证据全部来自 GitHub 单一平台，簇声称 17 个独立来源但 evidence 只列 3 条，"每账号约 10 个公众号"上限未在 README 找到原文（README 只写"添加频率过高容易被封控，等24小时解封"；issue #209 有人"因数量过多被永封"）。

但独立复核 GitHub 后，"只
  - 竞品/替代：wewe-rss (cooderl) — 借道微信读书；9.7k★ 但 2026-05-11 归档，270 open issues，频繁"小黑屋"/永封，已不可作为长期方案。（https://github.com/cooderl/wewe-rss）
  - 竞品/替代：wechat-article-exporter — 批量导出+阅读量/评论；13k★，2026-07-30 因微信关闭上游接口停止维护，域名 2026-10-30 到期。（https://github.com/wechat-article/wechat-article-exporter）
  - 竞品/替代：we-mp-rss (rachelos) — 4.7k★ 仍活跃，RSS+MD/PDF 导出；但依赖扫码登录态，2026-07~09 多次"抓不到新文章""扫不了码"，脆弱。（https://github.com/rachelos/we-mp-rss）
  - 竞品/替代：feeddd/feeds — 免费公众号 RSS，2.1k★、3.3k issues，2023-07-05 已关站。（https://github.com/feeddd/feeds）
  - 竞品/替代：Wechat2RSS (ttttmr) — 1.6k★，公开源 300+ 公众号，私有部署收费；248 open issues；是当前少数仍在运行的托管方案，覆盖面受限。（https://github.com/ttttmr/Wechat2RSS）
  - 竞品/替代：wechat-download-api (tmwgsicp) — 1.1k★，较新，RSS+7 格式导出+MCP，需代理池对抗风控，另有 SaaS；长期稳定性未经时间验证。（https://github.com/tmwgsicp/wechat-download-api）
- *buildable* → weak（4）：【1. 小团队 2-6 周能否做出 MVP／技术路径】
代码层面"能做"：GitHub 上已有 5+ 个开源实现可直接复用（we-mp-rss 4.7k★ 活跃、wechat-download-api 1.1k★、moore-wechat-article-downloader 293★、多个 CDP/Markdown 导出脚本），1-3 人 2-4 周即可拼出"订阅→抓列表→抓正文→转 Markdown/RSS→本地全文检索"的自托管 MVP。但"真正解决核心痛点（稳定、无人值守地订阅任意公众号）"做不到，因为所有可用的文章列表发现通道都是旁路且正在被腾讯逐个关闭：
(a) 公众号后台"搜索他人文章"接口（wechat-article-exporter 13k★ 依赖）——2026-07-30 被微信官方关闭，项目归档；
(b) 公众号后台 QR 授权拉列表（we-mp-rss / wechat-download-api）——需要用户自己拥有一个公众号管理员身份，token ~4 天过期需反复扫码，ret=200013 频控（we-mp-rss #469、#465、#466 2026-09 仍在报"订阅成功但无内容/授权后无法同步"）；
(c) 微信读书 Web API（wewe-rss 9.7k★，2026-05-11 归档、270 open issue；we-mp-rss #4
  - 竞品/替代：wechat-article-exporter (13k★) — 曾是最好的批量导出工具（HTML/PDF/Markdown），依赖公众号后台搜索接口；2026-07-30 因微信关闭上游核心接口停止维护并归档，域名 2026-10-30 到期，无可行 workaround。（https://github.com/wechat-article/wechat-article-exporter）
  - 竞品/替代：wewe-rss (9.7k★) — 借微信读书账号生成 RSS，私有部署；每号约 10 个公众号即触发 24h 小黑屋、账号频繁失效；2026-05-11 归档，270 open issue，已不可依赖。（https://github.com/cooderl/wewe-rss）
  - 竞品/替代：we-mp-rss (4.7k★) — 当前最活跃替代（3 天前仍更新），QR 授权公众号后台 + 可选微信读书模式，支持 RSS/Markdown/PDF 导出与 webhook；但 2026-09 仍有 200013 频控、授权后无法同步、订阅无内容等 open issue，稳定性差。（https://github.com/rachelos/we-mp-rss）
  - 竞品/替代：wechat-download-api (1.1k★) — AGPL 开源 + SaaS，QR 登录公众号后台，curl_cffi 伪装指纹 + SOCKS5 代理池；凭证约 4 天过期，单实例单账号，不支持阅读量/评论；明确处于对抗反爬的灰色地带。（https://github.com/tmwgsicp/wechat-download-api）
  - 竞品/替代：Wechat2RSS (1.6k★) — 2021 年起运营的公共 RSS 服务，免费池 300+ 号，付费出售私有化部署——证明有付费意愿，但公共全文分发他人文章版权风险最高，抓取方式不公开。（https://github.com/ttttmr/Wechat2RSS）
  - 竞品/替代：RSSHub (46k★) — 覆盖 Telegram/App 更新/微博等大量来源，是次要需求的现成解；公众号路由依赖搜狗/新榜等旁路，长期重复抓取、缺正文、多路由标记 Not planned。（https://github.com/DIYgod/RSSHub）

**用户原话 / 关键证据**：
> wechat-article-exporter 13k★ #200「停止维护说明」：所依赖的微信上游核心接口已被官方关闭
> wewe-rss 9.7k★ 2026-05归档，#209「订阅数量过多被永封了」

**证据链接**：
- [] https://github.com/DIYgod/RSSHub — Everything is RSSible / 万物皆可 RSS（覆盖 wechat、weibo…（46,332 stars / 10,242 forks）
- [] https://github.com/ourongxing/newsnow/issues/199 — 后续能否增加微信公众号和小红书版块（newsnow 21.8k star 热点聚合项目）（仓库 21.8k star，142 open issu…）
- [] https://github.com/search?q=%E5%85%AC%E4%BC%97%E5%8F%B7+RSS&type=repositories&s=stars&o=desc — 112 repositories：wewe-rss 9.7k / we-mp-rss 4.7k /…（112 个仓库；6 个同类项目合计 ~20k star…）
- https://github.com/wechat-article/wechat-article-exporter/issues/200
- https://github.com/cooderl/wewe-rss
- https://github.com/DIYgod/RSSHub/tree/master/lib/routes/wechat

**产品概念**：创作者用自己后台一键把自有公众号历史文章导出HTML/PDF/MD并增量归档

**MVP 范围**：3-5周：剪藏插件+FTS、自有号导出

**风险**：buildable仅weak(4)：任意号稳定RSS依赖腾讯正在关闭的旁路

### 5. 自由行用户要把小红书攻略一键变成可协作行程（C36，总分 6）

**一句话**：小红书攻略→LLM抽地点生成行程→免下载链接多人共编→导航

**用户与场景**：以小红书为攻略来源的年轻自由行游。收藏几十篇攻略后手动抄地点逐个搜地图

**现有方案及不足**：圆周旅迹、点点AI、携程/高德AI行程、腾讯文档

**为何至今没解决**：攻略是非结构化UGC且小红书反爬严；旅行App依赖装机量不做免下载协作

**验证结论**：unmet=weak(5) crowd=confirmed(7) buildable=weak(6)

- *unmet* → weak（5）：结论：链条上每一环都已有像样的方案，但没有任何一个成熟、口碑好、面向中国普通自由行用户的产品把"贴小红书链接→抽地点生成逐日行程→免下载链接多人共编→高德导航/记账/清单"串成一条；因此不能判 refuted，也够不上 confirmed。

已被解决的部分：
1) "免下载链接多人实时共编 + 记账分账 + 打包清单 + PWA 离线 + 中文界面"——开源 TREK（liketrek/TREK，2026-03 创建，已 14,388 star、1,246 fork，几乎每日更新，AGPL，有 demo 实例）做得非常完整：WebSocket 实时协作、邀请链接、无账号访客、公开只读分享链接、成本按分摊、23 种语言含简/繁中文、MCP server、插件系统。这是这个簇里"协作免下载"痛点最强的反例。海外商业侧 Wanderlog 也已是成熟免费的协作行程工具（可导入网页/博客地点、Google Maps 列表、分账、打包清单），GitHub 上还有基于它的 MCP（shaikhspeare/wanderlog-mcp 140 star），说明它是事实上的行业基线。
2) "小红书笔记→行程"——小红书官方点点 AI（持有笔记数据、能生成行程）、新品圆周旅迹（贴链接生成行程）已覆盖单人生成；开发者侧 2026 年出现大量 Claude Code/Codex skill：hiye
  - 竞品/替代：TREK (liketrek/TREK, 开源自托管) — 协作层完全覆盖且超出诉求：实时共编、邀请链接、无账号访客与公开只读链接、分账记账、打包清单、PWA 离线、中文界面、MCP/插件，14.4k star 且日更、口碑好。但对簇内用户不够用：需自托管（目标人群不会部署，暂无已知中国托管实例）；地图依赖 OSM/Nominatim/Wikipedia，issue #2420 证实大陆访问数秒超时，高德适配补丁被维护者以 not planned 关闭；原生不读小红书，唯一插件 qiufengcrl/ai-guide 为 0 star。AGPL 许可对商业托管有约束。（https://github.com/liketrek/TREK）
  - 竞品/替代：Wanderlog（海外商业，免费+Pro） — 成熟、口碑好的协作行程工具：多人实时编辑、从网页/博客 URL 抽地点、Google Maps 列表导入、分账、打包清单、离线（Pro 付费）。不覆盖本簇核心：无法解析小红书链接（登录墙/反爬）、地图与 POI 基于 Google 在大陆不可用、参与编辑需注册账号、无中文本地化（据我所知）。
  - 竞品/替代：点点 AI（小红书官方 AI 生活助手 App） — 唯一合法持有小红书笔记/收藏数据、能'一键'从笔记生成行程的一方，覆盖'小红书→行程'最关键的一环；但是独立 App，协作能力弱（簇内已指出'重生成轻协作'），是否支持贴链接与多人共编：不确定。若小红书补上协作，此簇会被官方直接吃掉，是最大风险。
  - 竞品/替代：圆周旅迹（新品 App） — 贴小红书链接生成行程已实现，是最贴合诉求的商业产品；缺陷正是簇的核心痛点：多人协作需每个同伴下载注册 App，用户退回微信群截图。新品，口碑与留存未验证。
  - 竞品/替代：携程行程助手 / 携程 TripGenie、飞猪 AI 行程、高德地图 AI 行程规划、马蜂窝/穷游行程助手 — 装机量大、免额外下载门槛低；携程/高德的 AI 行程生成与分享可用，高德解决导航。但均不能读取小红书笔记，协作弱或需同 App；穷游行程助手曾支持多人共编但维护状态不确定；马蜂窝行程助手是否仍在运营不确定。不覆盖'小红书攻略→行程'与'免下载共编'。
  - 竞品/替代：腾讯文档 / 飞书 / Notion 模板 + 微信群 — 腾讯文档在微信内可免下载多人共编，是目前用户实际采用的替代路径；但纯文本表格，无地点抽取、无地图/导航、无记账联动，需要手动抄地点，正是用户抱怨的现状。
- *crowd* → confirmed（7）：【簇内证据审视：薄弱，且部分被误读】(1) evidence 仅 3 条，全部来自小红书单一平台，engagement 全部缺失；声称 independent_source_count=10、crowd_signal=many，但 evidence 数组无法支撑。(2) 第 1 条"天呐！所有不想做旅行攻略的姐妹都给我去用…复制小红书攻略链接"是典型种草/推广文案（很可能是圆周旅迹类产品的软文），表达的是"有产品了快用"，不是"想要但没有"，被误读为需求。(3) 第 2 条是圆周旅迹测评，"多人协作需要下载 App 才能参与编辑"是真实摩擦点，但 n=1、测评体。(4) 第 3 条用 Gemini 自制日本旅行网页 App 是 DIY 信号，n=1。(5) "23 次查询中复现 5 次"是检索管线自身的重复，不是独立用户附和。仅凭簇内证据只能给 weak（3-4 分）。

【GitHub 外部证据：强且相互独立，推翻"极少数人"的假设】
A. "可协作、免下载/免登录的行程"这一半：liketrek/TREK（2026-03-19 创建）6 个月 14,388 star / 1,246 fork / issue 编号已过 #2500，README 明确对标 Wanderlog/TripIt，功能就是 C36 诉求的对照表：实时多人协作、可复用邀请链接、"Guest accounts
  - 竞品/替代：liketrek/TREK（开源，自托管） — 14.4k star。已实现实时多人协作、免登录 Guest、邀请链接、公开只读页、预算、行李清单——覆盖 C36 的'协作/记账/清单'一半；但需自托管（目标人群无法部署）、无小红书/社媒链接导入、地图为 Google/Naver 体系、对中文出境场景无适配。（https://github.com/liketrek/TREK）
  - 竞品/替代：qiufengcrl/ai-guide（TREK 小红书插件） — 0 star、刚创建；把小红书 URL/笔记正文→地点→TREK 行程，是 C36 两半拼在一起的雏形，但极早期、依赖 TREK 自托管。（https://github.com/qiufengcrl/ai-guide）
  - 竞品/替代：hiyeshu/trip-map-builder — 236 star。Agent Skill，小红书调研→单文件 HTML 地图页，输出可分享但静态、不可多人编辑，需要会用 Claude Code/OpenCLI 的技术用户。（https://github.com/hiyeshu/trip-map-builder）
  - 竞品/替代：dwsera/Tour-AI — 167 star。能解析小红书分享链接生成结构化行程，有账号与订阅层，但无协作/共享功能。（https://github.com/dwsera/Tour-AI）
  - 竞品/替代：DankeQAQ/Anygo — 95 star。小红书灵感+预算+每日卡片，纯单人生成器，无协作。（https://github.com/DankeQAQ/Anygo）
  - 竞品/替代：zh-lon/travel-planner — 3 star。功能清单与 C36 几乎逐条对应（小红书攻略导入、分天看板、高德路线、开销分摊、行前清单、共享可编辑），但本地运行、管理员建账号，不是免下载链接。（https://github.com/zh-lon/travel-planner）
- *buildable* → weak（6）：【簇C36摘要】需求=贴小红书攻略→自动抽地点生成逐日行程→免下载链接多人共编→导航/记账/清单/出境入口。crowd_signal=many，10个独立来源，已有新品圆周旅迹/点点做前半段但协作需全员装App。

【1. MVP可行性：可以，3-5周，1-3人】
关键技术路径（全部是成熟组件）：
- 输入层：①用户粘贴笔记正文/分享文案；②上传截图→多模态LLM（Qwen-VL/GPT-4o/Claude）抽地点——用户本来就在微信群发截图，零学习成本且完全合规；③贴链接解析（见灰色地带）；④Web端浏览器插件读取用户自己登录态下的收藏夹DOM（用户侧工具，相对合规但小红书Web端用户少）。
- 抽取层：LLM结构化输出{poi名, 城市, 类型, 建议天次, 备注, 价格/营业时间}；同名歧义靠城市上下文。
- 地理编码：国内高德Web服务API关键字/POI搜索（商用需企业认证，量小免费）；出境用Google Places（海外服务器可调）/Mapbox/Foursquare；按邻近度聚类分天+距离矩阵排序。
- 协作层：Next.js/H5 + Supabase Realtime 或 Yjs/Liveblocks，链接即协作、免登录昵称编辑、评论、在线状态——这正是对圆周旅迹的差异化打击点，微信内置浏览器可直接打开H5。
- 工具层：一键导航=高德/百度/Apple Map
  - 竞品/替代：圆周旅迹（新品App） — 部分：支持贴小红书链接生成行程，但多人协作要求每个同伴下载注册App，未解决'免下载链接共编'这一核心协作痛点；链接解析处于灰色地带。
  - 竞品/替代：点点（小红书官方AI搜索/行程生成，较确定为小红书自研） — 部分：合规拥有数据，重生成轻协作；是第三方产品的最大平台竞争风险，补协作功能只是产品决策。
  - 竞品/替代：dwsera/Tour-AI（开源，167★） — 技术验证：单人Next.js项目已实现解析小红书分享链接→AI行程+地图，无多人协作；证明抽取管线是几周工作量。（https://github.com/dwsera/Tour-AI）
  - 竞品/替代：NanmiCoder/MediaCrawler（开源，65.8k★） — 仅证明小红书内容技术上可抓取，但需登录浏览器+签名，作者明确禁止商用；凸显数据获取的灰色属性。（https://github.com/NanmiCoder/MediaCrawler）
  - 竞品/替代：Wanderlog（海外协作行程工具） — 海外对标：链接分享协作+地图+记账+Pro订阅/酒店联盟变现模式成熟，但不读小红书、中文/国内地图支持弱。
  - 竞品/替代：携程/马蜂窝/穷游/高德 AI行程助手 — 不足：能生成行程但不能吃小红书笔记，协作弱或需装App，绑定各自OTA生态。

**用户原话 / 关键证据**：
> 小红书测评：「多人协作功能需要下载App才能参与编辑和查看详情」
> TREK 6个月14,388★"Guest accounts requiring no login"

**证据链接**：
- [] https://www.xiaohongshu.com/explore/698ff00a000000001d0108bd — 标题：天呐！所有不想做旅行攻略的姐妹都给我去用；摘要：复制喜欢的小红书攻略链接…
- [] https://www.xiaohongshu.com/explore/6a48c8bb000000002103f29e — 圆周旅迹，用起来到底顺不顺？——多人协作功能需要下载App才能参与编辑和查看详情，在真实旅行场景里…
- [] https://www.xiaohongshu.com/explore/698c3c8b000000001d013706 — 标题：日本旅行ために ー 我自制了日本旅行 APP。用户用Gemini自制网页版旅行APP…
- https://github.com/liketrek/TREK
- https://github.com/liketrek/TREK/issues/2420

**产品概念**：微信内可开的H5/PWA：粘贴攻略或上传截图，多模态LLM抽取地点/天次/价格

**MVP 范围**：3-5周：截图→LLM→高德→聚类

**风险**：贴链接若服务端抓取属灰色只能截图粘贴；点点AI同赛道，携程随时加协作

### 6. 用户要批量下载备份抖音/B站/视频号内容（C05，总分 5.8）

**一句话**：个人收藏备份器：用本人B站账号枚举收藏夹

**用户与场景**：把短视频当资料库的用户。收藏夹视频"已失效"无通知；平台不提供导出

**现有方案及不足**：MediaCrawler 65.8k★

**为何至今没解决**：平台视留存为核心资产，持续升级签名/风控并以律师函清除下载器

**验证结论**：unmet=weak(5) crowd=confirmed(7.5) buildable=weak(4)

- *unmet* → weak（5）：试图反驳"需求未被满足"的结论，部分成功、部分失败。反驳成立的部分：单条视频"我想存这一个视频"的需求对技术用户基本已解决——抖音有 Douyin_TikTok_Download_API（20.4k★，4天前更新，v5 自维护身份池+Docker）、TikTokDownloader（16.3k★，账号作品/点赞/收藏批量、CSV/SQLite 导出）；B站有 Bili23-Downloader（7.8k★，活跃，收藏夹/历史/字幕/弹幕/8K/登录）、bili-sync（2.6k★，收藏夹/合集/稍后再看自动同步到 NAS 并生成 Emby/Jellyfin 命名）、mybili（700★，收藏夹备份，2026-09 仍在更新）、yt-dlp（194k★，含 BiliBili/BilibiliPlaylist/BilibiliSpaceVideo/XiaoHongShu/Douyin 提取器）；视频号有 res-downloader（20.2k★，3天前更新）、wx_channels_download（9.5k★）、qiye45/wechatVideoDownload（5.8k★，含直播回放/图集/范围批量）；小红书有 XHS-Downloader（12.8k★）；评论/数据采集有 MediaCrawler（65.8k★）。方案数量和社区规模都很大。反驳失败的部分（导致不能判 re
  - 竞品/替代：Douyin_TikTok_Download_API (Evil0ctal) — 部分够用。20.4k★、活跃、v5 自维护访客身份池、REST/MCP/CLI/Web 控制台、PostgreSQL 归档，Apache 2.0。缺点：面向自部署（Docker Compose），是给开发者/运营者的 API 而非普通用户的一键备份工具。（https://github.com/Evil0ctal/Douyin_TikTok_Download_API）
  - 竞品/替代：TikTokDownloader (JoeanAmier) — 部分够用但脆弱。16.3k★、活跃，支持账号发布/点赞/收藏批量、直播、评论、CSV/XLSX/SQLite。缺点：必须提供 cookie；README 明确'为合规不再维护加密参数算法，用户需自备'，平台一升级就可能失效；6.0 重构中。（https://github.com/JoeanAmier/TikTokDownloader）
  - 竞品/替代：jiji262/douyin-downloader — 核心场景不够用。12.1k★ 但 README 自述抖音请求校验已阻止 CLI 下载单条视频/图集/合集/音乐/点赞/收藏，仅主页作品可尝试浏览器回退且不保证成功；桌面端 Douzy 部分功能需激活。（https://github.com/jiji262/douyin-downloader）
  - 竞品/替代：F2 (Johnserf-Seed) — 部分够用。2.7k★ 活跃，抖音/TikTok/微博批量下载主页/点赞/收藏/合集/直播。CLI + Python，64 open issues，面向技术用户。（https://github.com/Johnserf-Seed/f2）
  - 竞品/替代：yt-dlp — B站/小红书够用，抖音/视频号不够用。194k★ 有 BiliBili/BilibiliPlaylist/BilibiliSpaceVideo/XiaoHongShu 提取器可批量抓 UP 主空间与收藏列表；但 Douyin 提取器自 2024-04 起 'fresh cookies needed' 长期失效，完全不支持微信视频号和快手；命令行工具，无自动定时备份。（https://github.com/yt-dlp/yt-dlp）
  - 竞品/替代：BBDown (nilaoda) — 已停更。13.9k★ 曾是 B站 CLI 首选（批量/收藏夹/字幕/弹幕/大会员），2026-05-14 归档只读，不再维护。（https://github.com/nilaoda/BBDown）
- *crowd* → confirmed（7.5）：对簇内 3 条证据的审视：(1) 引文性质——三条全是 GitHub 星数/搜索结果，不是用户说"我想要但没有"的原话；星数是"有人在用某个解法"的代理信号，不是抱怨本身。MediaCrawler 65.8k★ 的主体是关键词搜索+评论爬取（研究/运营人群），与"普通用户备份收藏夹"是两类人群，簇把 B03/D02 合并后用一个总星数背书两种诉求，有混算成分。"top-6 合计 ~80k"里含 Jack-Cherish/python-spider（19.8k，爬虫教程仓库，非下载工具），且 res-downloader 在"抖音 下载"和"视频号 下载"两次检索中被重复计入。(2) 独立性——核实后作者确实互不相同（NanmiCoder / putyy / Evil0ctal / JoeanAmier / ltaoo / qiye45 / lecepin / nobiyou / nilaoda / ScottSloan / yaobiao131 / nICEnnnnnnnLee / jiji262 / Johnserf-Seed / ihmily / amtoaer 等 ≥15 个独立作者），但 platforms 只有 GitHub 一个平台，没有任何知乎/V2EX/微博/Reddit 的用户原声，"19 个独立来源"实际是 19 个仓库而不是 19 个诉苦的人。(3) 互动——
  - 竞品/替代：NanmiCoder/MediaCrawler — 面向研究/运营的多平台采集（帖子+评论+媒体），65.8k★；需登录态与代理池，仅供学习声明，核心能力部分转付费 Pro；不面向普通用户备份收藏夹（https://github.com/NanmiCoder/MediaCrawler）
  - 竞品/替代：putyy/res-downloader — 视频号/抖音/小红书等通用抓包下载，20.2k★，跨平台 GUI；需装证书走代理，单条为主，维护者精力有限（https://github.com/putyy/res-downloader）
  - 竞品/替代：Evil0ctal/Douyin_TikTok_Download_API — 自托管 API/CLI/MCP，20.4k★，面向开发者，需 Docker 部署与账号池，非普通用户产品（https://github.com/Evil0ctal/Douyin_TikTok_Download_API）
  - 竞品/替代：JoeanAmier/TikTokDownloader — 覆盖抖音账号作品/喜欢/收藏/收藏夹批量下载与直播录制，16.3k★；2026-08 收藏夹批量接口被平台签名拦截（#785），依赖 cookie，随时失效（https://github.com/JoeanAmier/TikTokDownloader）
  - 竞品/替代：ltaoo/wx_channels_download — 视频号专用，9.5k★，注入 PC 微信加下载按钮；需装证书，微信升级即可能失效；lecepin/WeChatVideoDownloader 4.7k 已归档（https://github.com/ltaoo/wx_channels_download）
  - 竞品/替代：nilaoda/BBDown / Bili23-Downloader / downkyicore / BilibiliDown — B站下载生态成熟（13.9k/7.8k/7.5k/5.3k★），支持收藏夹/稍后再看批量下载；但均为手动触发的下载器，非自动备份（https://github.com/search?q=bilibili+%E4%B8%8B%E8%BD%BD&type=repositories&s=stars&o=desc）
- *buildable* → weak（4）：【1. 可建性】1-3 人 2-6 周做出"能用"的 MVP：可以，但只是把开源轮子封装成 GUI。技术路径按平台差异极大：(a) B站——最顺：bilibili-API-collect（20.2k★）文档齐全，用用户自己的 SESSDATA cookie + wbi 签名即可枚举收藏夹/稍后再看/点赞列表并拉 dash 流，ffmpeg 合流；"收藏夹失效前自动备份到 NAS"2 周内可做。(b) 抖音——需要 a_bogus/X-Bogus 等签名 + cookie + ms_token，平台月级别改算法；TikTokDownloader 作者已声明"为确保项目合法合规，本项目的加密参数算法不再维护"，说明可靠路径是让用户在 douyin.com 已登录网页里用浏览器插件/自动化浏览器（CDP）取页面已解析出的播放地址，不做逆向签名。(c) 微信视频号——无网页端、流加密，唯一路径是本地 MITM 代理 + 安装根证书 + 向微信 PC 客户端 webview 注入 JS 抓解密后的流（res-downloader、wx_channels_download 都是这样做），微信升级即可能失效，且要求管理员权限装证书——这是明确的灰色地带（规避技术保护措施）。(d) 小红书——x-s/x-t 签名 + 风控，同抖音。(e)"批量抓评论做分析"——纯爬虫，MediaCrawler 已
  - 竞品/替代：NanmiCoder/MediaCrawler (65.8k★) — 覆盖小红书/抖音/快手/B站/微博/贴吧/知乎笔记+评论爬取，需扫码登录+Chrome CDP；README 明确'仅供学习研究、禁止商用'并引用爬虫违法案例；作者另售 MediaCrawlerPro 订阅版。对研究者/运营者够用，对普通用户门槛高。（https://github.com/NanmiCoder/MediaCrawler）
  - 竞品/替代：putyy/res-downloader (20.2k★, 3 天前更新) — 本地代理抓包（127.0.0.1:8899）+ 安装根证书，覆盖视频号/小程序/抖音/快手/小红书/直播流/m3u8；逐条手动捕获，不支持收藏夹批量与自动备份；'仅供学习研究，禁止商用'。（https://github.com/putyy/res-downloader）
  - 竞品/替代：ltaoo/wx_channels_download (9.5k★) — 代理 + 根证书 + 向微信 PC webview 注入 JS 加下载按钮，需管理员权限；单条下载，依赖微信客户端版本；属规避加密的灰色做法。（https://github.com/ltaoo/wx_channels_download）
  - 竞品/替代：JoeanAmier/TikTokDownloader (16.3k★) — 支持账号发布/点赞/收藏/合集批量下载、直播录制、评论采集、CSV/XLSX/SQLite 导出、Web UI/Docker；但作者'为确保项目合法合规，加密参数算法不再维护'，平台改签名后需用户自备算法，稳定性差。（https://github.com/JoeanAmier/TikTokDownloader）
  - 竞品/替代：Evil0ctal/Douyin_TikTok_Download_API (20.4k★) — 纯 Python 实现 a_bogus/X-Bogus/X-Gnarly 签名 + 浏览器兜底，v5 引入身份池自愈；Apache 2.0；作者以 TikHub.io 付费数据 API 变现，证明 B2B API 变现路径存在但仍是灰色。（https://github.com/Evil0ctal/Douyin_TikTok_Download_API）
  - 竞品/替代：jiji262/douyin-downloader (12.1k★) — 抖音单条+主页批量下载，SQLite 去重、断点重试；技术用户可用，普通用户需命令行。（https://github.com/jiji262/douyin-downloader）

**用户原话 / 关键证据**：
> downkyicore 7.5k★「本仓库停止维护并永久关停」——2026-07收到B站律师函
> ≥15位作者累计>200k★；"抖音 下载"920个仓库

**证据链接**：
- [] https://github.com/search?q=%E6%8A%96%E9%9F%B3+%E4%B8%8B%E8%BD%BD&type=repositories&s=stars&o=desc — Douyin_TikTok_Download_API 20.4k（无水印视频下载 API）（top-6 合计 ~80k stars）
- [] https://github.com/NanmiCoder/MediaCrawler — "小红书笔记 \| 评论爬虫、抖音视频 \| 评论爬虫、快手视频 \| 评论爬虫…（65,794 stars / 12,686 forks…）
- [] https://github.com/search?q=%E8%A7%86%E9%A2%91%E5%8F%B7+%E4%B8%8B%E8%BD%BD&type=repositories&s=stars&o=desc — res-downloader 20.2k / wx_channels_download 9.5k（…（6 个专用工具合计 ~44k stars…）
- https://github.com/yaobiao131/downkyicore
- https://github.com/amtoaer/bili-sync

**产品概念**：桌面/NAS Docker应用：用已登录B站账号（SESSDATA+公开wbi签名

**MVP 范围**：3-5周：B站收藏同步+失效检测

**风险**：buildable仅weak(4)：视频号/抖音属规避技术措施灰区

### 7. 多生态设备间要不靠云直连传文件与同步剪贴板（C17，总分 5.8）

**一句话**：跨iPhone/Android/Win/Mac不同网扫码热点

**用户与场景**：多生态设备持有者、办公写作人群。AirDrop/Quick Share生态锁定

**现有方案及不足**：LocalSend 92.8k★（同网）、PairDrop

**为何至今没解决**：iOS无热点/Wi-Fi Direct API、后台读剪贴板不允许

**验证结论**：unmet=weak(5) crowd=confirmed(7) buildable=weak(5)

- *unmet* → weak（5）：簇 C17 实际是三个子需求的合并：(a) 跨生态设备同一局域网内 AirDrop 式传文件；(b) 不在同一路由器/不靠云的直连传输（Wi-Fi Direct/热点/蓝牙/Wi-Fi Aware）；(c) 手机⇄电脑的本地优先剪贴板历史同步（文本/图片/文件、OCR 搜索）。逐项核实（今日 GitHub 数据）：

(a) 已被很好解决：LocalSend 92,798★、持续活跃（最近推送 2026-09-24），覆盖 Android/iOS/macOS/Windows/Linux；PairDrop 11.5k★、NearDrop 6.3k★（Android→Mac Quick Share）、KDE Connect 全平台含 iOS 官方 App。这部分不能算未满足。

(b) 只有带明显缺陷的方案：LocalSend 的 #189（手机流量+PC Wi-Fi 不同网）与 #850（蓝牙发现）至今 Open、无关联 PR、无维护者实现计划，README 也完全不提 Wi-Fi Direct/蓝牙/热点。开源里真正做到"无需路由器"的是 FlyingCarpet（5,331★，活跃，v10，热点+蓝牙/二维码配对，五平台互传），但其 README 自述：Apple↔Apple 仍需共享网络、使用期间会断掉无线上网、"does not work on some Xiaomi, MI
  - 竞品/替代：LocalSend — 同一局域网内跨五平台传文件的事实标准（92.8k★，活跃，口碑好，免费开源）。不够用之处：仅局域网，#189（Wi-Fi Direct/不同网）与 #850（蓝牙发现）自 2023 年起 Open 且无实现计划；无后台常驻发现、无剪贴板同步。覆盖子需求(a)，不覆盖(b)(c)。（https://github.com/localsend/localsend）
  - 竞品/替代：FlyingCarpet — 开源里唯一真正做到'无需路由器'的跨五平台传输（5.3k★，活跃，热点+蓝牙/二维码配对，Noise 加密）。缺陷：Apple↔Apple 仍需共享网络；传输时断掉无线上网；部分小米/MIUI/HarmonyOS 不可用；每次手动配对、无自动发现、无持续同步、无剪贴板。可用但体验远不及 AirDrop。（https://github.com/spieglt/FlyingCarpet）
  - 竞品/替代：Syncthing + Synctrain(iOS, 免费) / Möbius Sync(iOS, 付费) + Syncthing-Fork(Android) — 持续文件同步子需求基本已解决：Syncthing 89k★，iOS 有第三方 Synctrain（2.1k★，免费，后台同步、相册备份）与 Möbius Sync；Android 官方 App 废弃但 Syncthing-Fork 活跃。全局发现/中继默认走 Syncthing 基金会服务器但可自建，数据端到端加密。缺陷：官方仍拒绝 iOS；配置对普通用户偏重；不是 AirDrop 式即时投送。（https://github.com/pixelspark/sushitrain）
  - 竞品/替代：PairDrop — 11.5k★ 网页版，免安装，局域网内即开即用；'配对'功能可跨网络但依赖公共信令服务器与 WebRTC/TURN，不算完全不靠云；浏览器内无后台，不做剪贴板。上次推送 2026-04，维护节奏放缓。（https://github.com/schlagmichdoch/PairDrop）
  - 竞品/替代：KDE Connect（含官方 iOS App） — Linux/Windows/macOS/Android/iOS 全覆盖，免费开源，含文件传输与剪贴板共享。缺陷：仅局域网（或需 VPN）；iOS 后台无响应被官方定为 intended，剪贴板需手动发送；Android 10+ 后台读剪贴板受限；无剪贴板历史/OCR。（https://github.com/KDE/kdeconnect-ios）
  - 竞品/替代：SyncClipboard — 跨 Win/Mac/Linux/Android/iOS/HarmonyOS 的剪贴板实时同步+历史，支持文本/图片/文件（5k★，活跃，MIT）。缺陷：必须自建服务器或 WebDAV/S3，普通用户门槛高；iOS 端靠快捷指令变通、非原生后台；无 OCR 搜索。是(c)最接近的开源方案但非消费级。（https://github.com/Jeric-X/SyncClipboard）
- *crowd* → confirmed（7）：对 evidence 数组本身的审视：3 条里只有 1 条（LocalSend #850）是真实的"想要但没有"表达；EcoPaste 和 tiez-clipboard 两条引文都是仓库的产品描述（"跨平台的剪贴板管理工具"/"A cross-platform clipboard manager..."），是产品列表被误读成需求，且两者都是桌面端（Win/macOS/Linux）剪贴板管理器，并不覆盖"手机↔电脑"或"不靠云"这一核心诉求——EcoPaste 社区实际最热的相关 issue（#1415、#1444）反而是在求"云同步"，与簇里"不依赖云"的表述相反。三条来源作者/仓库互相独立但全在 GitHub 单一平台；description 里引用的 X/Twitter（Steph Smith）无法核实，记为未验证。因此按 evidence 数组原样看，证据质量偏弱、有明显误读。

但用 GitHub 实证补查后，"很多人跟着说"这一点成立：(1) LocalSend（92.8k star，1,140 open issues）按 👍 排序的前 4 个 open issue 全是同一诉求——不在同一路由器/局域网下也能发现和传输：#189 Wi-Fi Direct+扫码 👍63（2023-02 开，至今 open）、#850 蓝牙发现 👍48/27 评论、#2523 Wi-Fi 
  - 竞品/替代：LocalSend — 92.8k star 事实标准，但需同一局域网；其 👍 最高的 4 个 open issue 全是要求跨网/蓝牙/Wi-Fi Direct/Wi-Fi Aware 发现，2023 年至今未实现。（https://github.com/localsend/localsend）
  - 竞品/替代：PairDrop / Snapdrop — 11.5k/19.7k star，WebRTC 浏览器方案，PairDrop 可通过配对码跨网络传输（走公共信令服务器），但无后台、无持续同步、依赖浏览器。（https://github.com/schlagmichdoch/PairDrop）
  - 竞品/替代：Syncthing — 89k star 持续同步方案，但无官方 iOS 客户端（#102 自 2014 年 👍68 被锁定），Android 官方 wrapper 已 archived；第三方 iOS 客户端存在（名称不确定）。（https://github.com/syncthing/syncthing）
  - 竞品/替代：KDE Connect — 4k star，Android/Linux/Windows/macOS 剪贴板+文件+通知，但无 iOS 端，且需同一局域网。（https://github.com/KDE/kdeconnect-kde）
  - 竞品/替代：SyncClipboard — 5k star 跨平台剪贴板同步，需自建/使用 WebDAV 服务器中转，不是纯设备直连。（https://github.com/Jeric-X/SyncClipboard）
  - 竞品/替代：CrossPaste — 2.6k star，LAN-only、无云、带 OCR，但仅桌面三端，无手机端。（https://github.com/CrossPaste/crosspaste-desktop）
- *buildable* → weak（5）：【簇拆解】C17 实际是两件事：(a) 跨生态、不同网、不走云的近场文件直传；(b) 手机⇄电脑的剪贴板历史同步（文本/图片/文件+OCR搜索）。两者的软件可解部分与平台封顶部分差异很大，分开评估。

【1. 小团队 2-6 周 MVP 可行性】
可做的切片（3-6 周，Tauri/Rust 或 Flutter，1-3 人）：
- 文件直传"不同网"的核心路径 = Soft-AP + 二维码 + LAN HTTPS，而不是 Wi-Fi Direct/Wi-Fi Aware/蓝牙：Windows 用 NetworkOperatorTetheringManager、Linux 用 NetworkManager 起热点，Android 用 LocalOnlyHotspot（8+，不耗流量、随机 SSID/PSK）；把 SSID+PSK+IP+证书指纹编进 WIFI: 二维码。手机侧 Android 10+ 与 iOS 相机都原生支持扫 Wi-Fi 二维码入网，无需 App 权限；入网后打开 PWA 或 App 走 LocalSend/PairDrop 式 HTTPS 传输（自签证书+指纹校验）。Android 9+/iOS 会保留蜂窝上网，恰好解决 LocalSend #189（👍63）"手机走流量、PC 走 Wi-Fi 也能传"。Mac 无法程序化开热点，但可用 CoreWLAN 程序
  - 竞品/替代：LocalSend — 92.8k stars、1140 open issues，Apache-2.0，全平台含 iOS；多播发现+HTTPS 传输，需同一局域网，无热点/二维码/蓝牙发现（#189 👍63、#850 👍48 长期 open）；免费基线极高，随时可补热点功能。（https://github.com/localsend/localsend）
  - 竞品/替代：PairDrop / Snapdrop — 11.5k stars，浏览器 WebRTC 免安装，同网或配对码跨网（需公共信令服务器）；无后台、无剪贴板历史。（https://github.com/schlagmichdoch/PairDrop）
  - 竞品/替代：KDE Connect — 桌面 4k / Android 1.5k / iOS 424 stars，自带剪贴板同步、文件传输、远程输入；需同网，iOS 端受限（无后台剪贴板），UI 面向 Linux 用户。（https://github.com/KDE/kdeconnect-kde）
  - 竞品/替代：SyncClipboard — 5k stars，MIT，Win/mac/Linux 桌面，iOS 靠快捷指令、Android 靠社区客户端；需自建服务器/WebDAV/S3，不是直连，无 OCR。（https://github.com/Jeric-X/SyncClipboard）
  - 竞品/替代：EcoPaste — 7.5k stars，仅 macOS/Windows 本地剪贴板管理（FTS5 搜索），无移动端、无跨设备同步、无 OCR；证明剪贴板管理需求真实但未跨端。（https://github.com/EcoPasteHub/EcoPaste）
  - 竞品/替代：ClipShare — 319 stars，Flutter，Android/Win/Linux/mac 剪贴板历史+同步，Android 10+ 后台同步靠 Shizuku 等绕过；无 iOS。（https://github.com/aa2013/ClipShare）

**用户原话 / 关键证据**：
> LocalSend 92.8k★按👍前4个open issue全是"不同网也能传"：#189👍63、#850👍48
> PowerToys #26296「Mouse Without Borders for Android」👍146

**证据链接**：
- [] https://github.com/EcoPasteHub/EcoPaste — "跨平台的剪贴板管理工具"；"A local-first clipboard manager fo…（7,452 stars / 127 open issu…）
- [] https://github.com/jimuzhe/tiez-clipboard — "TieZ 是一款基于 Tauri 的跨平台剪贴板管理器 / with history, tags…（2,882 stars（6 个月））
- [] https://github.com/localsend/localsend/issues/850 — Currently it is impossible to discover devices ou…（👍48, 27 条评论 (另 #144 蓝牙传输 👍3…）
- https://github.com/localsend/localsend/issues/189
- https://github.com/microsoft/PowerToys/issues/26296
- https://github.com/spieglt/FlyingCarpet

**产品概念**：Tauri/Flutter工具：Win/Linux/Android开热点并把SSID+PSK+IP

**MVP 范围**：4-6周1-3人：热点二维码传输

**风险**：iPhone侧被Apple硬封顶只能消除一半

### 8. 独居者要定时签到、超时自动报警的守护App（C27，总分 5.8）

**一句话**：低负担被动式"我还在"守护：长时间无活动才升级提醒并通知联系

**用户与场景**：独居青年、空巢老人及子女。独居突发疾病无人知晓；手机SOS需本人触发、老人不戴手环

**现有方案及不足**：死了么/活了么（下架）、系统SOS、手表跌倒检测、社区智能水表

**为何至今没解决**：独立产品因命名与合规争议夭折；大厂认为市场小涉生死责任不碰

**验证结论**：unmet=weak(5) crowd=weak(6) buildable=confirmed(7)

- *unmet* → weak（5）：分市场看：(1) 海外该场景已有成熟方案——Snug Safety（美国，每日签到、漏签自动通知紧急联系人，免费档可用，付费档可派警上门查看）几乎逐字覆盖"定时签到+超时报警"；iOS 17 的 Check In（计时模式，超时未响应通知联系人+位置）、Pixel 的 Personal Safety「Safety Check」、Kitestring 短信签到、美国医疗报警服务（Life Alert/Bay Alarm/Medical Guardian）、日本成熟的"見守り"产业（象印 iPot、日本邮政、SECOM/ALSOK）、澳洲红十字 Telecross 免费每日电话等都在长期运营。因此从全球看这不是空白。(2) 但簇的证据和受众全部在中国市场，而中国市场恰恰没有任何一个主流、在维护、低心理负担的应用：唯一走红的「死了么」登顶付费榜后因命名/合规被砍到只剩2个功能并下架，这本身证明需求真实且供给缺位；海外方案（Snug/Pixel Safety Check）在国内不可用或不适配（不发中国短信、Pixel 不在华销售、Check In 依赖 iMessage 且区域可用性不确定）；国内替代只有需要佩戴的硬件（Apple/华为手表跌倒检测+SOS）、需本人主动触发的系统 SOS、以及只覆盖登记在册高龄独居老人的社区试点（智能水表、一键通）——独居青年完全没有被覆盖。(3) Git
  - 竞品/替代：死了么 / 活了么（独立开发者，中国，2026-01） — 曾登顶App Store付费榜第一，证明需求与付费意愿；但因命名争议与合规压力被砍到仅剩2个功能后下架，目前不可用。是需求空窗的直接原因。
  - 竞品/替代：Snug Safety（美国，iOS/Android） — 最接近的成熟方案：每日签到，漏签后自动通知紧急联系人（免费档），付费档（约$10/月）由 Snug 人工核实并可申请警方 welfare check。海外口碑较好、持续运营。缺陷：面向美国用户，依赖美国号码/短信与派警体系，不适用于中国市场；不打通物业/120。
  - 竞品/替代：Apple iOS 17+ Check In（信息App内置） — 系统级：'After a timer' 模式下计时结束未响应则自动把位置发给联系人。免费、无需第三方。缺陷：一次性设定、无每日循环、需要双方 iMessage，定位为出行/短时场景而非独居日常守护；在中国大陆的可用性不确定。
  - 竞品/替代：Google Pixel Personal Safety「Safety Check」 — 设定时长的签到，超时未确认自动分享位置给紧急联系人，可接 Emergency Sharing。缺陷：仅 Pixel 设备，Pixel 不在中国大陆正式销售；同样是单次计时非每日循环。
  - 竞品/替代：Kitestring（短信签到服务） — 平台给你发短信，不回复则通知联系人；无需装App，有免费档。缺陷：美国/英文向，维护活跃度低（近年更新极少，现状不确定），不覆盖中国号码。
  - 竞品/替代：美国医疗报警服务：Life Alert / Bay Alarm Medical / Medical Guardian / Philips Lifeline — 成熟行业（几十年），吊坠一键报警+24小时监控中心，可选跌倒检测，直接联动急救。缺陷：$20-50/月硬件订阅，主要面向老人，美国市场；不是'低心理负担的签到App'，不适用中国。
- *crowd* → weak（6）：【簇内证据审视】(1) 3条evidence全部是微博热搜"话题标题"（《死了么APP回应下载量登顶付费榜第一》《死了么APP真的能救命吗》《死了么APP下架》），引文本身是媒体/榜单叙事，没有任何一条是用户第一人称的"我想要/现有的不行"；(2) 3条来自同一平台（platforms只有微博）、围绕同一个App的同一轮新闻周期（2026-01上旬~中旬），实质是1个事件被计了3次，independent_source_count=4 明显高估；(3) engagement 只有热搜名次(#11/#34/#47)，无转评赞、无用户附和数；(4) "《老人5次打120未接通后身亡》"只是描述里提到，未列入evidence。因此按簇自身材料，独立性和"很多人跟着说"的直接证据不足。
【GitHub补充证据——部分支持】用 github.com 精确搜"死了么"得 31 个仓库，加上独居/living-alone 关键词共找到约 40 个相互独立作者的仓库，几乎全部创建于 2026-01-09~01-27（与热搜同步），覆盖 iOS/Android/鸿蒙/微信小程序/H5/Apple Shortcuts/小米手环表盘/Discord bot/自托管 等形态，且 2026-03/04/05/08 仍有新仓库出现（si-le-me、-APPwhh、WYN、imstillalive、im-ok
  - 竞品/替代：死了么 App（独立开发者，2026-01） — 曾登顶 App Store 付费榜第一并多次上热搜，证明有付费意愿；据簇描述随后改名、功能被砍、下架——下架细节我无法在 GitHub 之外独立核实。
  - 竞品/替代：GitHub 上约 30~40 个死了么克隆/独居签到项目（zaima、to-be-live、areYouAlive、Demumu-Android、sileme-clone、DeadYet 等） — 数量多但成熟度极低：最高 15★，多数 0~2★、无 issue、自称十分钟/30 分钟 AI 复刻或仅供学习；多为 H5/自托管/需技术能力，无法触达老人和普通独居青年，也无一形成事实标准。（https://github.com/search?q=%22%E6%AD%BB%E4%BA%86%E4%B9%88%22&type=repositories）
  - 竞品/替代：circa10a/dead-mans-switch（自托管通用 Dead Man's Switch，PWA） — 48★，支持邮件/推送/Discord/Twilio/webhook，对技术用户够用；但需自建服务器，非面向大众的低门槛产品。（https://github.com/circa10a/dead-mans-switch）
  - 竞品/替代：rememory / aeterna / Timeseal 等高星 dead-man's-switch 项目 — 1454★/301★/61★，但解决的是数字遗产、密钥释放，不是超时自动向联系人/物业/120 报警的独居安全场景。（https://github.com/eljojo/rememory）
  - 竞品/替代：Google Pixel「个人安全」App 的定时安全检查（Safety Check） — 据我所知：可设定时长，到期未确认则自动向紧急联系人分享位置——功能上最接近诉求，但仅限 Pixel 且大陆不可用。
  - 竞品/替代：Apple iOS 17+ 信息「Check In」 — 据我所知：面向出行到达确认，不是每日/长期独居签到；在中国大陆是否可用不确定。
- *buildable* → confirmed（7）：【1. MVP可行性：可以，2-4周】核心是一个"人体 dead man's switch"：用户设签到周期+宽限期 → 服务端定时任务检查最近心跳 → 超时按梯度升级（推送催签→给本人打语音电话→短信/语音通知1-3个紧急联系人，附最近位置与预留信息）。技术路径：微信小程序（uni-app/Taro，覆盖老人子女两端、免安装）+ Serverless后端（Supabase/腾讯云函数）+ 定时任务 + 阿里云/腾讯云短信与语音通知模板。GitHub上2026年1月事件后一周内即出现多个可用复刻（haocker/zaima "死了么开源平替" 15★、minorcell/sileme-clone 用Expo+Supabase"十分钟复刻"、sunshun10000-web/imstillalive 自托管邮件通知），证明基础功能对1人团队是"天级"工作量。真正解决痛点的关键不是签到本身，而是"低心理负担"：(a) 被动心跳替代主动打卡——小程序 wx.getWeRunData 拿微信运动步数、Android UsageStats/解锁事件、HealthKit步数，白天连续N小时零活动才触发，签到从"每天点一下"降为"异常时才打扰"；(b) 宽限期内多级确认降低误报；(c) 联系人无需装App（短信/电话即可），零冷启动。iOS后台限制导致被动检测在iPhone上弱于Android，
  - 竞品/替代：死了么 / 活了么（独立开发者App，2026-01） — 曾登顶App Store付费榜第一，因命名争议改名、功能砍至2项后下架；证明需求与付费意愿，但因PR/合规运营失败退出，现无可用版本。
  - 竞品/替代：haocker/zaima（死了么APP开源平替） — Vue实现，15★/6 fork，2026-01创建，9月仍在更新；功能覆盖签到+超时通知，但自托管、无被动检测、无面向普通用户的分发，验证了技术门槛极低。（https://github.com/haocker/zaima）
  - 竞品/替代：minorcell/sileme-clone — Expo+Supabase '十分钟复刻'的demo，3★，仅供学习；说明MVP骨架可在极短时间搭出。（https://github.com/minorcell/sileme-clone）
  - 竞品/替代：sunshun10000-web/imstillalive — TypeScript+Express+JSON存储的自托管每日签到，超时邮件通知多联系人，可自定义频率与宽限期；3★，仅邮件通道，非面向大众。（https://github.com/sunshun10000-web/imstillalive）
  - 竞品/替代：circa10a/dead-mans-switch — 通用自托管dead man's switch（Go+SQLite，含mobile-app标签），48★，多通道消息；面向技术用户，非独居守护场景化产品。（https://github.com/circa10a/dead-mans-switch）
  - 竞品/替代：meis1983/zaine-app（在呢+ 独居安全守护 Flutter iOS） — 2026-06创建的同题iOS项目，0★，活跃度未知；显示事件后有多方在做同类产品但均未形成规模。（https://github.com/meis1983/zaine-app）

**用户原话 / 关键证据**：
> 《死了么APP回应下载量登顶付费榜第一》热搜#34，5天上榜10余次，随后《死了么APP下架》#11
> GitHub搜"死了么"31个仓库、约40位作者克隆几乎全建于2026-01，但最高仅15★无一进商店

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E6%AD%BB%E4%BA%86%E4%B9%88APP%E5%9B%9E%E5%BA%94%E4%B8%8B%E8%BD%BD%E9%87%8F%E7%99%BB%E9%A1%B6%E4%BB%98%E8%B4%B9%E6%A6%9C%E7%AC%AC%E4%B8%80%23&t=31&band_rank=34&Refer=top — 热搜话题：《死了么APP回应下载量登顶付费榜第一》——付费榜第一，直接证明愿意付费（微博热搜榜(快照排名#34)；死了么相关话题2026-…）
- [] https://s.weibo.com//weibo?q=%23%E6%AD%BB%E4%BA%86%E4%B9%88APP%E7%9C%9F%E7%9A%84%E8%83%BD%E6%95%91%E5%91%BD%E5%90%97%23&t=31&band_rank=47&Refer=top — 热搜话题：《死了么APP真的能救命吗》（微博热搜榜(快照排名#47，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E6%AD%BB%E4%BA%86%E4%B9%88APP%E4%B8%8B%E6%9E%B6%23&t=31&band_rank=11&Refer=top — 热搜话题：《死了么APP下架》(前有《死了么APP仅剩2个功能》2026-01-13…（微博热搜榜(快照排名#11，上榜1天)）
- https://github.com/search?q=%22%E6%AD%BB%E4%BA%86%E4%B9%88%22&type=repositories
- https://github.com/slinky-daxie/sweetpea-public

**产品概念**：中性命名（如"在呢"）的小程序+App：被动心跳读取微信运动步数/解锁事件/HealthKit

**MVP 范围**：2-4周：签到+宽限+梯度升级

**风险**：证据三条同一App同一新闻周期，克隆星数反证持续需求弱；签到疲劳留存下滑

### 9. 用户与独立开发者要可信的干净软件发现分发渠道（C34，总分 5.8）

**一句话**：中文版AlternativeTo：干净软件目录

**用户与场景**：找无广告替代软件的用户。国产App强更膨胀会员广告；搜软件满是捆绑下载器与假官网；好软件停更找不到替代

**现有方案及不足**：AlternativeTo（英文）、小众软件/少数派

**为何至今没解决**：下载站靠捆绑盈利，干净目录无商业模式；商店外分发受备案/网信办规定制约

**验证结论**：unmet=weak(5) crowd=confirmed(7) buildable=weak(5)

- *unmet* → weak（5）：作为怀疑者我尽力反驳，但结论只能到 weak：这是一个把「用户侧发现」+「开发者侧分发/曝光」两端合并的宽簇，某些切面确实被成熟方案很好覆盖，但没有任何单一成熟方案覆盖其核心中国场景，且开发者侧分发是结构性未解。

已被较好覆盖的切面（支持部分反驳）：
1) 全球软件发现/替代品：AlternativeTo 成熟、免费、活跃；awesome-mac（jaywcjlove，114,975 star，今日仍在更新）、ruanyf/weekly（104,795 star，活跃）为高质量中文向清单。
2) 中文精选「干净软件」推荐：小众软件 appinn.com、少数派 sspai.com 都是口碑好、活跃、免费的编辑化推荐媒体，长期填补「找无广告轻量软件」需求。
3) Android 商店外干净分发：F-Droid（官方 FOSS 应用商店，活跃）、Obtainium（20,010 star，活跃，直接从开发者源拉取更新，正是「干净、直连开发者」诉求）、酷安 coolapk（国内安卓应用发现+社区口碑+分发的事实标准）、APKMirror（校验签名，口碑较好）。Windows 侧有 Scoop（24,701 star）、winget（微软官方）等无捆绑包管理器。
4) iOS 侧载：AltStore（14,457 star，活跃）+ AltStore PAL（欧盟 DMA 市场）、Sid
  - 竞品/替代：小众软件 appinn.com — 够用度中等偏上。长期活跃、免费、口碑好的中文「干净/轻量软件」推荐媒体，直接命中『找无广告轻量软件』诉求；但它是编辑化推荐博客，不是可搜索的安全下载/分发渠道，不解决入口层假官网/捆绑问题，也不覆盖 App 分发。不确定其确切规模数据。（https://www.appinn.com）
  - 竞品/替代：少数派 sspai.com — 够用度中等。成熟活跃的中文应用/效率工具推荐平台，兼有独立开发者曝光与付费专栏，口碑好；但偏编辑化/商业化内容媒体，非可信『分发渠道』，且以推荐为主、不解决普通用户的安全安装包获取。（https://sspai.com）
  - 竞品/替代：AlternativeTo — 够用度中等。全球最成熟的软件替代品发现站，免费、活跃、口碑好；但如簇中所述『英文、缺国产软件』，对中国用户与国产 App 场景覆盖弱。（https://alternativeto.net）
  - 竞品/替代：F-Droid — 够用度中等偏下（对本场景）。安卓 FOSS 应用商店，免费、活跃、口碑好，是『干净无广告』分发的标杆；但仅收录开源应用，国产商业 App 不在其中，国内访问慢，普通用户知晓度低。（https://f-droid.org）
  - 竞品/替代：Obtainium — 够用度中等。20,010 star、活跃，直接从开发者源（GitHub/GitLab 等）拉取更新，正中『干净、直连开发者』诉求；但要求应用发布在可识别源上，国产 App 多数不在，且有技术门槛，非普通用户向。（https://github.com/ImranR98/Obtainium）
  - 竞品/替代：酷安 coolapk — 够用度中等偏下。国内安卓应用发现+社区口碑+分发的事实标准，免费、体量大；但近年重社交化/广告化、口碑下滑，且仅安卓，某种程度已成为『套路』问题的一部分。不确定当前运营细节。（https://www.coolapk.com）
- *crowd* → confirmed（7）：对簇内证据本身的审视（16 条 URL，非声称的 20 条）：(1) 引文质量参差：约 6 条是知乎专栏清单/软文/教程（"免费、无套路，良心的10款软件！""相似软件推荐服务汇总""如何获取软件资源""我是如何在网上找软件的""电脑常用软件去哪下载呢"），它们是"供给侧内容"而非用户抱怨，被误读为需求；3 条是怀旧/观点题（"有哪些失传了的优秀软件""曾经很火如今没落的软件""为什么我国各大软件几乎都需要收费"），不表达"想要但没有"；真正的痛点表达只有约 4 条（iPhone 强更烦死、"上架app到应用商店到底有多难"、V2EX"产品做出来了但没人知道"、抖音 4 个"商店没有的软件去哪下载"搜索词）。V2EX 1242696"做了个推荐站接受自荐"是解决尝试/自推广，而非抱怨。(2) 独立性：跨知乎/抖音/V2EX 三平台、作者大体不同，但簇由 A17+A18+B25 三个异质子需求（普通用户找干净软件 / 商店外装 App / 开发者曝光）硬合并，"20 个独立来源"是三件事的加总，单件事各只有 3-9 条。(3) 互动：全部 engagement=unknown，簇内没有任何可见赞/回答/评论数。仅凭簇内材料只能给 weak。

但 GitHub 补充证据把"多少人要"抬到了 confirmed 档：开发者侧——1c7/chinese-independent-devel
  - 竞品/替代：1c7/chinese-independent-developer（中国独立开发者项目列表） — 61.6k star、持续接收「申请收录」issue，已是中文独立开发者最主要的免费曝光清单；但只是静态 README 列表，无分类筛选/用户侧发现/下载可信度标注，且投稿量大导致曝光稀释（https://github.com/1c7/chinese-independent-developer）
  - 竞品/替代：521xueweihan/HelloGitHub — 178.8k star，月刊+自荐 issue，覆盖开源项目曝光；仅限开源、面向程序员，不解决普通用户找干净闭源软件/安装包的问题（https://github.com/521xueweihan/HelloGitHub）
  - 竞品/替代：ruanyf/weekly（科技爱好者周刊） — 104.8k star，每周精选自荐工具；名额极少（每周几条）而投稿每天数十条，9k+ open issue 说明供给远小于需求（https://github.com/ruanyf/weekly）
  - 竞品/替代：XiaomingX/1000-chinese-independent-developer-plus — 1.8k star，101 个自荐 issue 积压，人工维护、更新滞后（https://github.com/XiaomingX/1000-chinese-independent-developer-plus）
  - 竞品/替代：jaywcjlove/awesome-mac / 0PandaDEV/awesome-windows — 115k / 2.9k star 的精选软件清单，能部分替代「干净软件发现目录」；但按平台分散、无「无广告/不强更/免费」筛选维度、不覆盖国产安卓 App（https://github.com/jaywcjlove/awesome-mac）
  - 竞品/替代：ImranR98/Obtainium（含 Droid-ify、AuroraStore、F-Droid） — 20k star，解决「从源直接装/更新 Android App」；需用户懂 GitHub/仓库地址，只覆盖有公开 release 的开源应用，不覆盖国产闭源 App 与 iOS，也不给「是否安全/有何替代」的引导（https://github.com/ImranR98/Obtainium）
- *buildable* → weak（5）：【簇拆解】C34 实际包含三个不同可解性的子需求：(A) 中文"干净软件"发现目录+可信官方下载链接；(B) 商店外 App 分发渠道（安卓 APK / iOS 下架应用）；(C) 中文独立开发者曝光渠道。三者可软件化程度差异很大，整体判 weak。

【1. MVP 可行性】
(A) 目录+可信链接：1-3 人 2-4 周可做出真正解决"搜到的全是捆绑高速下载器/假官网"这一核心痛点的 MVP，路径清晰、无灰色地带：
- 数据冷启动全部来自开放、可商用的机器可读源：winget-pkgs / Scoop buckets / Homebrew casks 清单（含官方下载 URL + SHA256）、F-Droid index、GitHub Releases API，以及 GitHub 上的中文/通用清单（jaywcjlove/awesome-mac 115k★、1c7/chinese-independent-developer 61.5k★、android-foss 11.3k★、0PandaDEV/awesome-windows 2.9k★）。可在一周内种子化 2-5k 条目。
- LLM 批量生成中文描述+结构化标签（免费/无广告/无强更/无需登录/开源/便携/国产/停更年份），人工抽检。
- "可信"落地方式：只链接官网域名白名单/GitHub Release，抓取时计算 
  - 竞品/替代：jaywcjlove/awesome-mac（GitHub 清单，115k★） — macOS 高质量软件清单，中英文，可作数据种子；但仅列表无搜索/替代品关系/下载校验，且不覆盖 Windows/安卓/国产 App。（https://github.com/jaywcjlove/awesome-mac）
  - 竞品/替代：1c7/chinese-independent-developer（61.5k★） — 中国独立开发者产品清单，证明供给侧存在且可冷启动；纯 README 列表，无发现/曝光机制，不解决用户侧痛点。（https://github.com/1c7/chinese-independent-developer）
  - 竞品/替代：ImranR98/Obtainium（20k★） — 从 GitHub/官方源直接获取安卓 App 更新，思路正确；但依赖 GitHub 可达性、面向极客、无中文目录，不解决国产 App 与 iOS 场景。（https://github.com/ImranR98/Obtainium）
  - 竞品/替代：offa/android-foss（11.3k★） — 安卓开源软件清单，可作种子；英文、无国产应用、无分发。（https://github.com/offa/android-foss）
  - 竞品/替代：0PandaDEV/awesome-windows（2.9k★） — Windows 工具清单，英文，可作种子；无中文语境、无下载校验。（https://github.com/0PandaDEV/awesome-windows）
  - 竞品/替代：Droid-ify / Neo-Store（F-Droid 客户端，7.5k★/5.2k★） — F-Droid 生态客户端，只覆盖开源安卓应用，国内网络与厂商侧装警告导致普通用户体验差。（https://github.com/Droid-ify/client）

**用户原话 / 关键证据**：
> 知乎「苹果手机app不更新就用不了怎么解决？每天都一大堆APP等着更新 烦都烦死了」
> 阮一峰周刊104,796★/9,246 open issue一天十条「开源自荐」

**证据链接**：
- [] https://www.zhihu.com/question/371060188 — 苹果手机app不更新就用不了怎么解决？每天都一大堆APP等着更新 烦都烦死了 而且越来越大！！
- [] https://www.zhihu.com/question/624443834 — 为什么我国各大软件几乎都需要收费？
- [] https://www.zhihu.com/question/427898783 — 上架app到应用商店到底有多难？
- https://github.com/ruanyf/weekly/issues?q=is%3Aissue+%E8%87%AA%E8%8D%90
- https://github.com/ImranR98/Obtainium

**产品概念**：结构化目录站+插件：从winget/Scoop/Homebrew（含官方URL与SHA256）

**MVP 范围**：3-5周：导入标注2-5k条

**风险**：商店外分发受管、iOS无侧载，约一半痛点不能覆盖；"免会员去广告"是破解需求须排除

### 10. 离线地图用户要公交换乘、轨迹导航与同步（C24，总分 5.6）

**一句话**：隐私离线地图用户的开源离线公交换乘+GPX轨迹导航

**用户与场景**：用Organic Maps。完全离线的公交换乘无人做成（#5331最高票悬赏两年）；GPX不能沿轨迹导航

**现有方案及不足**：OsmAnd 6k★（有轨迹导航无时刻表公交）

**为何至今没解决**：全球GTFS聚合需资金/许可（部分禁再分发，中国无开放GTFS）

**验证结论**：unmet=weak(5) crowd=confirmed(7) buildable=weak(4)

- *unmet* → weak（5）：簇是多个子需求的合集，逐项核实后：(1) 轨迹导航（Organic Maps #1360，仍 open、无 PR、官方唯一 workaround 是手动加途经点）在 OsmAnd 里早已是成熟免费功能（"Navigation by track"，沿 GPX 转向语音、attach to roads、反向导航），Locus Map/Komoot/Kurviger 等也覆盖——这一子需求本质上是"Organic Maps 缺、隔壁有"。(2) 书签同步：Organic Maps iOS 已通过 PR #7641 实现 iCloud 同步（#2678 closed/Released），Android 的 Nextcloud/WebDAV 备份 PR #13583 于 2026-09-18 提交但尚无 review；OsmAnd Cloud 提供跨 Android/iOS/Web 同步（免费 Start 档仅 5MB，完整需 Pro 订阅）；Syncthing/Nextcloud 同步 KML 文件夹是常见手工方案。部分解决、有付费墙。(3) 限速标志：OsmAnd 免费支持显示+超速提醒；Organic Maps README 已列 "Speed limit"，#952 仍 open 主要是 CarPlay/Android Auto 未覆盖。(4) 核心头条需求——完全离线、含时刻表、全
  - 竞品/替代：OsmAnd（Navigation by track / 限速显示 / OSM公交路线 / OsmAnd Cloud） — 轨迹导航子需求基本够用：免费、离线、沿GPX转向语音、attach to roads、反向导航，是该场景事实标准；限速显示+超速提醒免费可用。公交换乘不够用：仅基于OSM关系、无时刻表、官方自述testing phase无完整导航。同步部分够用：OsmAnd Cloud跨Android/iOS/Web，但免费Start档仅5MB，完整需Pro订阅（付费墙）。路况完全没有（#6878 open 7年仅Nice to Have）。口碑：功能强但UI复杂、部分付费是长期抱怨。（https://github.com/osmandapp/OsmAnd）
  - 竞品/替代：Organic Maps 自身进展（iCloud同步已实现；Android Nextcloud备份PR、TomTom路况PR在途） — iOS书签同步已通过iCloud解决（#2678 closed）；Android同步PR #13583（2026-09-18）尚未review；路况PR #13421为草稿且仅显示不参与路径计算；轨迹导航#1360和公交#5331无任何PR。README已列速度限制。整体：同步在iOS够用、Android未完成，其余仍空缺。（https://github.com/organicmaps/organicmaps）
  - 竞品/替代：Transitous + MOTIS（开源全球公交换乘服务）及客户端 Transportia / KDE Itinerary / Träwelling — 覆盖'开源、隐私友好、免费、跨国界公交换乘'的大部分诉求，2026-09仍非常活跃（720★，全球MOTIS实例）。但是在线服务，不满足'完全离线'；客户端Transportia仅53★、早期；尚未集成进Organic Maps/CoMaps（#5331 提到 transitous/motis 仅此一议题）。对出境无流量用户不够用。（https://github.com/public-transport/transitous）
  - 竞品/替代：Transportr / Öffi（隐私公交App） — Transportr 1.2k★、GPLv3、无追踪，但依赖各运营商在线API，覆盖以欧洲为主，非离线，不做地图导航。部分够用（隐私）但不覆盖离线核心。（https://github.com/grote/Transportr）
  - 竞品/替代：OpenTripPlanner / Navitia 等服务端开源换乘引擎 — 成熟（2.7k★，16年），但是需要自建服务器和GTFS数据聚合，不是终端用户可用的离线App方案。（https://github.com/opentripplanner/OpenTripPlanner）
  - 竞品/替代：CoMaps（Organic Maps 社区分叉） — 活跃（560★ GitHub镜像，主仓库在Codeberg），但README同样只有地铁图层、无沿轨迹导航、无同步、无路况，与Organic Maps缺口一致。（https://github.com/comaps/comaps）
- *crowd* → confirmed（7）：逐条核验（GitHub search API 实时数据，2026-09-27）：
(1) 引文性质：三条 evidence 均为用户在 issue 里明确表达"想要但没有"，不是推荐/清单/软文。#5331 OP 原文确有 "worldwide public transport routing better than Google … open-source" 且确认挂了 Polar.sh 悬赏；#622 OP 原文确有 "disabled because of proprietary server"，并提出自建开源后端；OsmAnd #6878 OP 原文确有 "it would be an enormous relief, if it was possible to access traffic information databases"，标签 Nice to Have（"no priority… within current horizon planning"）。引文未被误读。
(2) 独立性：3 条 evidence 来自 3 个不同作者（dikkechill / matrixik / wehkah）、2 个仓库、2 个独立维护团队；但全部集中在 GitHub 单一平台，簇的 independent_source_count=6 只是把同仓库多条 issue 分别计数，平
  - 竞品/替代：OsmAnd (osmandapp/OsmAnd, 6,042 stars) — 部分解：已有 GPX 沿轨导航、基于 OSM 数据的公交路线（无时刻表/换乘时间）、付费 OsmAnd Cloud 收藏同步；无实时路况（#6878 仍 Nice to Have）。复杂度高、部分付费，正是 Organic Maps 用户不愿切换的原因（https://github.com/osmandapp/OsmAnd）
  - 竞品/替代：Transportr (grote/Transportr, 1,173 stars) — 在线公交助手，依赖各地运营商 API，不离线（#126 离线搜索已关闭），全球路由靠 Transitous 仍在讨论（#954 open）（https://github.com/grote/Transportr）
  - 竞品/替代：MOTIS / Transitous (motis-project/motis, 593 stars) — 服务器端多模式路由引擎，Transitous 提供社区运营的全球在线公交换乘 API；需联网，不满足'完全离线'，但已被 OsmAnd/Transportr 用户要求接入（https://github.com/motis-project/motis）
  - 竞品/替代：OpenTripPlanner (2,746 stars) — 服务器端 GTFS 行程规划，需自建/联网，非移动端离线方案（https://github.com/opentripplanner/OpenTripPlanner）
  - 竞品/替代：organicmaps/gtfs-osm-matcher (17 stars, 2025-12 创建) — Organic Maps 官方为 GTFS 站点与 OSM 匹配做的前置工具，说明项目方认可需求并在推进，但离线换乘尚未落地（https://github.com/organicmaps/gtfs-osm-matcher）
  - 竞品/替代：rudokemper/google-maps-places-to-comaps (118 stars) — 第三方脚本把 Google Maps 收藏导出为 GPX/KMZ 导入 CoMaps/Organic Maps，侧面反映书签迁移/备份的手工替代需求；不解决跨设备同步（https://github.com/rudokemper/google-maps-places-to-comaps）
- *buildable* → weak（4）：簇 C24 实际是 5-6 个互不相同的功能请求捆绑在一起，需拆开评估：

【1. 2-6 周小团队 MVP 可行性】
- 完全离线公交换乘（#5331，簇内最高票、有 Polar.sh 悬赏至今无人完成）：算法层面早已解决（RAPTOR / Connection Scan 在城市级 GTFS 上手机端 <100ms），数据聚合层面 Transitous（public-transport/transitous，GitHub 720★，社区运营、基于 MOTIS/MIT 593★，聚合全球开放 GTFS/GTFS-RT）已证明可行但只提供在线 API，不做离线。可行的 MVP 技术路径：服务端从 Mobility Database / Transitous feed 注册表抓取许可允许再分发的 GTFS → 预处理为按城市/都会区的紧凑二进制（stops/trip patterns/压缩 stop_times，单城约 5-50MB）→ CDN 分发 → 客户端（Rust/C++/Kotlin）跑 RAPTOR + 用 OSM 预计算步行换乘边；联网时代理 Transitous 取实时。1-3 人 2-6 周可覆盖 10-30 个开放数据城市的离线换乘 Demo（Web 或 Android）。但 issue 的目标"全球、比 Google 更好"在 6 周内不可能：全球时刻表持续维护、
  - 竞品/替代：Transitous (public-transport/transitous) — 社区运营的全球开放 GTFS/GTFS-RT 聚合与路线规划服务（720★），已解决数据聚合与在线路由，但仅在线 API、无离线客户端路由；Organic Maps #5331 中已被讨论为集成方向（https://github.com/public-transport/transitous）
  - 竞品/替代：MOTIS — MIT 开源多模式路由引擎（593★），支持 GTFS/NeTEx/GTFS-RT/GBFS + OSM，行星级部署；为服务器设计，未针对手机离线（https://github.com/motis-project/motis）
  - 竞品/替代：OpenTripPlanner — 2.7k★ LGPL 多模式行程规划服务器（Java），面向联网部署，非离线移动端（https://github.com/opentripplanner/OpenTripPlanner）
  - 竞品/替代：Transportr — 1.2k★ GPL 隐私友好 Android 公交 App，通过 public-transport-enabler 调各运营商在线 API，不离线（https://github.com/grote/Transportr）
  - 竞品/替代：CoMaps (Organic Maps 社区 fork) — 560★（GitHub 镜像），支持 KML/KMZ/GPX 导入导出与地铁换乘层，未见公交换乘、轨迹导航或书签同步（https://github.com/comaps/comaps）
  - 竞品/替代：OsmAnd — 已实现沿 GPX 轨迹导航（Navigate by track）与限速显示，付费 Pro 版证明小额付费意愿；无实时路况（#6878 仅 Nice to Have），无公交离线换乘（https://github.com/osmandapp/OsmAnd）

**用户原话 / 关键证据**：
> Organic Maps #5331「public transport routing」👍82/82评论
> OsmAnd #6878避开拥堵👍85/102评论自2019仅Nice to Have

**证据链接**：
- [] https://github.com/organicmaps/organicmaps/issues/622 — I see that it was disabled because of proprietary…（👍63, 113 条评论, 最近更新 2026-09-…）
- [] https://github.com/osmandapp/OsmAnd/issues/6878 — Possibility of avoiding traffic jam? — “it would …（102 👍, label: Nice to Have）
- [] https://github.com/organicmaps/organicmaps/issues/5331 — Implement public transport routing — 目标是做 "worldw…（👍82 ❤️22, 82 条评论, 最近更新 2026…）
- https://github.com/organicmaps/organicmaps/issues/1360
- https://github.com/public-transport/transitous

**产品概念**：专注离线公交换乘的App/SDK：服务端从Mobility Database

**MVP 范围**：4-6周：GTFS抓取/许可过滤/打包

**风险**："全球、实时路况"被GTFS许可碎片化锁死；FOSS用户付费低（悬赏两年无人领）

### 11. 记账者要无广告自动导账单可多人共享的记账（C01，总分 5.4）

**一句话**：无广告、账单半自动导入、零门槛家庭共享账本

**用户与场景**：年轻上班族、情侣室友分账者。记账App开屏广告、突然付费、限额导流、共享弱、手动录入累

**现有方案及不足**：随手记/鲨鱼（广告导流）、钱迹/MOZE（付费）

**为何至今没解决**：微信/支付宝/银行不开放交易接口，"自动"只能CSV或Xposed灰色手

**验证结论**：unmet=weak(4) crowd=confirmed(7) buildable=weak(5)

- *unmet* → weak（4）：核实结论：该场景不是"没人做"，而是"每个方案都缺一角"，且缺的恰好是簇里最核心的两点——零门槛多人共享 与 微信/支付宝/银行的真自动同步。
(1) 最接近的方案是开源 BeeCount（2,436★，2026-09-25 刚发 3.8.2，App Store+Google Play+Web，README 明写"完全免费""零广告/零追踪""CSV(支付宝/微信账单)导入""共享账本 Owner 一键生成邀请码"）。但共享账本必须自己用 Docker 部署 BeeCount-Cloud（仅163★，无官方托管），对学生/情侣这类目标用户是硬门槛；家庭账本功能 2026-05 才关闭 issue #105 上线，8-9 月仍有共享账本/同步 bug（#435 #443 #459 #489），成熟度和口碑量级都远够不上"主流"；许可证为 BSL。
(2) Cent（1.2k★，"完全免费、开源的多人协作记账"，支持微信/支付宝账单导入，iOS+PWA）靠 GitHub 仓库 Collaborator/WebDAV 做多人同步，需要 token，无 Android 原生、无 release，属于极客向。
(3) ezbookkeeping（5.7k★，自托管，代码里有 alipay/wechat/jdcom 转换器）多用户但各自独立，"shared/co-owned accounts"
  - 竞品/替代：BeeCount（蜜蜂记账，开源，iOS/Android/Web） — 最接近的方案：完全免费、零广告、上架 App Store/Google Play、支付宝/微信 CSV 导入、截图 OCR、iCloud/WebDAV/S3 同步、共享账本(Owner/Editor+邀请码)。缺陷：共享账本必须自己 Docker 部署 BeeCount-Cloud（163★，无官方托管），非技术用户门槛高；家庭账本 2026-05 才上线，8-9 月仍在修共享/同步 bug；2.4k★ 用户量小，谈不上口碑成熟；BSL 许可；'自动导入'仍是手动 CSV/截图。基本够个人+技术家庭用，不够普通情侣/学生零门槛用。（https://github.com/TNT-Likely/BeeCount）
  - 竞品/替代：Cent（开源多人协作记账 Web/PWA/iOS） — 免费、多人协作、微信/支付宝导入，但同步依赖 GitHub/Gitee 仓库或 WebDAV 并要手填 token，无 Android 原生、无 release、单人维护、CC BY-NC-SA。极客可用，普通用户不够。（https://github.com/glink25/Cent）
  - 竞品/替代：ezBookkeeping（开源自托管） — 5.7k★、MIT、内置支付宝/微信/京东/随手记转换器、PWA。但需自托管；多用户各自隔离，共享账户请求 #53 自 2025-02 开放无维护者回应；不覆盖家庭共享。（https://github.com/mayswind/ezbookkeeping）
  - 竞品/替代：AutoAccounting + 钱迹/一木/一羽/小星（Android 自动记账链路） — 929★，活跃；通过 Xposed/LSPatch/无障碍 Hook 微信支付宝通知自动记入钱迹等。仅 Android，iOS 无解；依赖无障碍/Root 等不稳定手段；下游 App 是否有会员/共享账本因产品而异（钱迹据我所知无广告、支持账单导入，其共享账本与会员细节不确定）。覆盖'自动'半个平台，不覆盖 iOS 与共享。（https://github.com/AutoAccountingOrg/AutoAccounting）
  - 竞品/替代：Actual Budget（开源，local-first） — 29k★、MIT、免费、桌面+Web。银行同步面向欧美(GoCardless/SimpleFIN 等)，无中国支付渠道导入；单预算文件、无多人权限模型；需自托管或 PikaPods 付费托管；无原生手机 App。对中国用户不覆盖核心场景。（https://github.com/actualbudget/actual）
  - 竞品/替代：Firefly III（开源自托管） — 24.7k★、AGPL、免费。多用户但不共享账户；导入靠 data-importer(CSV/GoCardless/Salt Edge)无微信支付宝；无官方移动端；部署门槛高。（https://github.com/firefly-iii/firefly-iii）
- *crowd* → confirmed（7）：对簇内证据逐条审视：(1) 引文性质——GitHub 侧只有 ezbookkeeping#53 是真实"想要但没有"（已核实 👍29、14 评论、2025-02-06 开至今仍 open，且是该仓库 👍 最高 open issue）；ezbookkeeping/BeeCount/Cent 的 README 引文是产品自我描述，不是用户抱怨，只能以 star 作需求代理；captn3m0/ideas、awesome-foss-android-apps"Finance 仅 4 个"是点子清单/推断；小红书 5 条中 3 条（Numbers 免费无广告、钱迹可导入账单、Excel/腾讯文档记账）是推荐/清单型内容，且全部来自 xiaohongshu.com/mobile/question/* 这类聚合问答页而非个人帖，仅"以前免费突然付费…找来找去没有功能差不多的软件"和"不开会员跳不过开屏广告"是真抱怨；HN 4 条只有标题，其中"How do you manage your personal finances"是中性提问、Show HN Trackm 是产品发布；TikTok 2 条是"不存在的 App 点子"合集页，几乎无效。(2) 独立性——ezbookkeeping 仓库与其 issue 被计两次，BeeCount 在 B16/D30 重复，小红书条目同站同类型页面；标称 in
  - 竞品/替代：BeeCount (TNT-Likely/BeeCount) — 2,436★/329 forks/112 open issues，2025-09 建。已同时提供：免费无广告无追踪、iOS 15.5+/Android 5+/Web、支付宝/微信 CSV 导入、共享账本（Owner/Editor 角色、三端实时同步）、自建云端/iCloud/WebDAV/S3 同步。基本覆盖簇内三合一诉求；缺口仅剩'真正自动抓取'（仍是 CSV 导入，Android 无障碍/AutoAccounting 桥接 #251/#170 仍 open）以及共享需自建服务。对该簇的'why_unsolved'构成实质反证。（https://github.com/TNT-Likely/BeeCount）
  - 竞品/替代：Cent (glink25/Cent) — 1,213★，2025-08 建。免费开源多人协作记账，用 GitHub/Gitee 私有仓库当后端免服务器，PWA + iOS App Store + 桌面，支持微信/支付宝账单导入。覆盖'免费+多人共享+多端'；自动记账 #253 已关闭未做；依赖 GitHub 账号对普通中国用户门槛高。（https://github.com/glink25/Cent）
  - 竞品/替代：ezBookkeeping (mayswind/ezbookkeeping) — 5,666★/694 forks/12 open issues。自托管、无广告、导入 CSV/Excel/OFX/QIF/Beancount 等多格式。多用户但无共享账户，#53 请求 👍29 开放 20 个月无维护者回应；无自动抓取。部分满足。（https://github.com/mayswind/ezbookkeeping）
  - 竞品/替代：AutoAccounting + Qianji_auto — 929★ 与 546★。Android-only，靠 Xposed/LSPatch/通知/OCR 抓微信、支付宝、云闪付、招行等交易，可对接钱迹等。解决'自动记账'但仅安卓、需 root/框架、稳定性依赖各 App 改版；iOS 无解。（https://github.com/AutoAccountingOrg/AutoAccounting）
  - 竞品/替代：Actual Budget (actualbudget/actual) — 29,173★。本地优先、免费无广告、可自托管；多用户 #1091（👍26）被关为 not planned，银行同步靠 SimpleFIN/GoCardless 面向欧美，不支持微信/支付宝。对海外人群部分满足。（https://github.com/actualbudget/actual）
  - 竞品/替代：Maybe (archived) / Sure / Wealthfolio / securo — 54,261★(已归档) / 10,203★ / 9,062★ / 3,831★。欧美开源个人理财，满足'无广告+隐私+自托管'，但银行聚合需付费接口、无中国支付渠道、多人共享普遍薄弱。（https://github.com/maybe-finance/maybe）
- *buildable* → weak（5）：【结论】"无广告+多人共享+跨端同步+可导出"这四项是纯产品/商业模式选择，1-3人 4-6 周可做出 MVP（BeeCount 已由个人开发者用 Flutter 证明可行）；但簇的头号诉求"微信/支付宝/银行账单自动同步"在中国大陆没有合法的实时路径，软件只能做到"半自动"（官方账单导出 CSV/邮件收单 + Android 通知监听），全自动依赖 Xposed 钩子/无障碍抓屏等灰色手段。价值一半依赖封闭平台数据，且赛道已有多款近似替代品，故判 weak/5。

【1. MVP 可行性与技术路径】
可行范围（4-6 周，2-3 人）：
- 客户端：Flutter（iOS/Android/桌面）或先做 PWA；本地 SQLite(Drift) 离线优先，服务端 Postgres+RLS（Supabase 或自建 Go/Node），LWW+服务端时间戳做多端同步；国内部署需阿里云+ICP 备案域名（Supabase 海外节点在国内延迟差）。
- 数据模型：账本(Book) → 成员(owner/editor/viewer) → 交易(付款人、分摊规则 等额/精确/比例) → 结算余额（Splitwise 式最小现金流算法）。个人账本与共享账本分离，只有打到共享账本的交易对他人可见，兼顾隐私。
- 账单导入（合法路径）：微信 "我-服务-钱包-账单-常见问题-下载账单(用于个人对账)
  - 竞品/替代：BeeCount（蜜蜂记账） — 最接近簇定义：Flutter，iOS/Android/Web，微信/支付宝 CSV 导入，多用户共享(Owner/Editor)，自建云/iCloud/WebDAV/S3 同步，AI/OCR/语音录入；2.4k★、112 open issues、BSL 许可（商用需授权）、个人开发者维护。缺：实时自动捕获、应用商店成熟度。证明可行性，也压缩差异化空间。（https://github.com/TNT-Likely/BeeCount）
  - 竞品/替代：ezBookkeeping — 5.7k★ MIT 自托管，多用户、多种导入格式(CSV/OFX/QIF/Beancount 等)、PWA；无微信/支付宝专用导入，共享/共有账户请求 issue #53 自 2025-02 开放至今无维护者响应。适合技术用户，不满足共享诉求。（https://github.com/mayswind/ezbookkeeping）
  - 竞品/替代：AutoAccounting（自动记账） — 929★ GPL-3.0，仅 Android，作为钱迹/一羽等的采集插件；靠 Xposed hook 微信/支付宝、通知监听、无障碍抓屏、短信监听。是'自动'的现实写照：灰色手段、需 LSPosed/技术门槛、iOS 不可用。（https://github.com/AutoAccountingOrg/AutoAccounting）
  - 竞品/替代：Actual Budget — 29.2k★ MIT，local-first，桌面/Web/Docker，据知识可通过 SimpleFIN/GoCardless 做海外银行同步；无中国支付账单导入、无多角色共享（单预算共用密码）。覆盖 HN 海外人群，不覆盖国内。（https://github.com/actualbudget/actual）
  - 竞品/替代：Spliit — 3k★ MIT，免账号、链接分享的 Splitwise 替代品，解决多人分账；不做个人记账/账单导入。（https://github.com/spliit-app/spliit）
  - 竞品/替代：Cent（协作记账 PWA） — GitHub 搜索结果显示约 1.2k★、TypeScript PWA、定位'免费开源协作记账'；详情页抓取被限流(429)，功能覆盖度不确定。（https://github.com/search?q=Cent+collaborative+accounting&type=repositories）

**用户原话 / 关键证据**：
> ezBookkeeping 5.7k★ #53「shared/co-owned accounts
> 小红书「以前免费突然付费…找来找去没有功能差不多的软件」；BeeCount 13个月2,436★

**证据链接**：
- [] https://github.com/mayswind/ezbookkeeping/issues/53 — Feature Request: Add shared/co-owned accounts —— …（👍29，14 评论，无维护者回复；仓库 5.7k st…）
- [] https://github.com/mayswind/ezbookkeeping — ezBookkeeping is an open source, powerful…（5,666 stars）
- [] https://github.com/TNT-Likely/BeeCount — 对比表："❌ 隐私可能被分析利用 → ✅ 离线优先 + 自建云端,开发者无法访问"；（2,436 stars / 329 forks / 1…）
- https://github.com/AutoAccountingOrg/AutoAccounting

**产品概念**：Flutter三端本地优先记账：账本分个人与共享（成员角色、Splitwise式分摊结算）

**MVP 范围**：4-6周2-3人：Flutter

**风险**："真自动同步"在中国无合法实时路径；流水属PIPL敏感需备案

### 12. 家庭要不限量可拍照/小票自动录入的物品管理（C14，总分 5.4）

**一句话**：不限量不丢图、批量拍照/小票AI自动入库

**用户与场景**：衣服多囤货多的年轻女性。测评多款App每款有硬伤：积分用完不能添加、免费但丢图、超30/49件付费

**现有方案及不足**：收纳先生/橘兜（限量丢图）、氧气/尽简（30/49件付费）

**为何至今没解决**：细分小众低付费，靠限额/积分变现与不限量冲突

**验证结论**：unmet=weak(5) crowd=weak(5) buildable=confirmed(7)

- *unmet* → weak（5）：分维度反驳后的结论：该簇不是"无人解决"，而是"被大量部分解决、没有一个方案同时覆盖核心组合"。(1) 衣橱子场景在海外已被较好解决：Whering、Acloset、Indyx 免费不限量+AI抠图，Stylebook 一次性付费不限量且自带 cost-per-wear（正是"每次使用均摊成本"诉求）；开源侧 2026 年新增 wardrowbe（738★，AI 自动打标+去背+穿着统计，可用本地 Ollama）和 Libre-Closet（342★，v0.5.1 于 2026-09 发布，自动去背、不限量、PWA）。因此"忘记有哪些衣服/均摊成本"在英文市场基本不成立，但这些产品对中国用户存在访问/中文/服务器问题，国内同类（氧气/尽简/蜗牛/收纳先生等）确如簇所述限量或积分变现。(2) 家庭库存：Homebox（sysadminsmedia 分支 7,386★，2026-06 发布 v0.26.x，活跃）已是成熟、免费、不限量、带图片/位置/标签/保修/购买价的方案，并有 homebox-companion（388★，拍照→AI 多物品识别→自动入库）补上"拍照自动录入"；但全部要求自托管 Docker/NAS，且无原生手机 App、无保质期提醒、无小票解析，对小红书上的收纳/囤货女性用户门槛过高。商业侧 Sortly 免费档限 100 件、Encircle 免费但偏保险用途、
  - 竞品/替代：Homebox (sysadminsmedia/homebox) — 最成熟的免费不限量家庭物品库存方案（7.4k★，活跃维护，图片/位置/标签/保修/购买价/导入导出）。不够用之处：必须自托管 Docker/NAS，无原生手机 App，无保质期/开封到期提醒，无小票 OCR 或 AI 录入，对簇内小红书收纳/囤货用户门槛过高。（https://github.com/sysadminsmedia/homebox）
  - 竞品/替代：homebox-companion — 证明'拍照→AI 多物品识别→自动入库'已可行（2025-11 起，388★）。但依赖 Homebox + OpenAI API Key（付费、隐私外传），无小票导入、无到期提醒，仍是极客工具。（https://github.com/Duelion/homebox-companion）
  - 竞品/替代：grocy + grocy-android — 9.5k★，最完整的家庭消耗品/保质期/条码管理开源方案。硬伤：小票 OCR 需求 #404 从 2019 年开放至今未实现；自托管；偏食品，不适合衣橱/化妆品；录入成本高。（https://github.com/grocy/grocy）
  - 竞品/替代：wardrowbe — 2026 年新开源自托管 AI 衣橱（738★）：AI 自动打标、去背、不限量、穿着次数统计、可用本地 Ollama。覆盖'忘记有哪些衣服/均摊成本'核心，但需自建服务器，非移动 App，中文用户体验未知。（https://github.com/Anyesh/wardrowbe）
  - 竞品/替代：Libre-Closet — 自托管不限量衣橱，自动去背，PWA，2026-09 仍在发版。不够用：需 Docker 部署，无 AI 识别、无成本均摊、无到期提醒。（https://github.com/Lazztech/Libre-Closet）
  - 竞品/替代：Whering / Acloset / Indyx（海外电子衣橱 App） — 免费、不限量、AI 抠图，Acloset/Indyx 含 cost-per-wear。对英文用户基本解决衣橱子场景；对中国用户存在网络访问、中文、云端丢图风险和广告/会员推送问题，且不覆盖囤货/化妆品/小票。
- *crowd* → weak（5）：证据本身审视：簇 evidence 仅 3 条、全部来自 GitHub（合并前的 D22 子簇），标题主体"小红书 不限量/不丢图/到期提醒"（A16 子簇）在 evidence 数组里一条都没有——"系统测评多款App""8个按品牌聚合页""2019年至今仍在问"均无 URL/引文可核，independent_source_count=12 与 crowd_signal=viral 无法由所给证据支撑。3 条 GitHub 证据逐条核验：(a) tasks/tasks#784 实为"任务标题里写日期自动解析（TickTick Smart Date）"，与物品/照片/小票毫无关系，属明显误读；(b) paperless-ngx discussion#6932 "Fill custom fields from machine learning" 确有 162 upvotes/35 评论，但它是文档管理系统的通用 ML 字段抽取诉求，不是家庭物品/小票录入，最多算远亲；(c) grocy/grocy#404 "OCR shopping receipts" 确实切题，2019-10-01 开启至今仍 open，在 grocy 全库按👍排序位列第 2（簇称第 1，不准确），但页面渲染未显示👍30/17评论，该数字未能核实。三条来源作者/仓库互不相同（独立），但 2/3 跑题，真正切题且可见
  - 竞品/替代：sysadminsmedia/homebox — 7.4k★ 自托管家庭物品清单，不限量、支持传图/购买价/保修，但无 OCR 小票或拍照 AI 自动填字段（#685 被 closed as not planned）；需自建服务器，非目标人群（小红书收纳用户）可用（https://github.com/sysadminsmedia/homebox）
  - 竞品/替代：grocy/grocy — 9.5k★ 自托管家庭库存/囤货/保质期管理，条码扫描可用；小票 OCR 需求 #404 自 2019 年开放至今未实现（https://github.com/grocy/grocy）
  - 竞品/替代：Anyesh/wardrowbe — 738★ 自托管 AI 衣橱：拍照→AI 自动打标签→穿搭建议，明确针对云端衣橱 App 的付费墙/隐私问题；解决了'不限量+拍照自动录入'但需自托管+自备 LLM，门槛高（https://github.com/Anyesh/wardrowbe）
  - 竞品/替代：zebangeth/ai-closet — 291★ iOS/Android AI 衣橱数字化（自动抠图+属性识别+虚拟试穿），README 未提条目上限；开源但非商店上架成品（https://github.com/zebangeth/ai-closet）
  - 竞品/替代：erinalbers/grocy-receipt-ocr — 18★ 小票导入 grocy 的社区脚本，说明有人自己造轮子，但无社区规模（https://github.com/erinalbers/grocy-receipt-ocr）
  - 竞品/替代：danschultzer/receipt-scanner / alfianlosari/AIReceiptScanner — 314★/95★ 通用小票 OCR/GPT-4o 库，是开发者组件而非面向家庭用户的库存产品（https://github.com/danschultzer/receipt-scanner）
- *buildable* → confirmed（7）：【1. 可建性：能，4-6 周内 1-3 人可做出真正命中核心痛点的 MVP】
核心痛点拆解为四点：(a) 不限量、不丢图；(b) 录入成本高（拍照+抠图+打标签）；(c) 小票/订单自动入库；(d) 到期/开封提醒与均摊成本。四点全部是纯软件问题，且 (b)(c) 在 2025-2026 已被多模态 LLM 商品化：
- 技术路径：小程序或 Flutter/RN App + Supabase/微信云开发 + 对象存储（用户自有图片按原图存 OSS，成本约 ¥0.1/GB/月，"不限量"在成本上完全成立）+ 视觉大模型 API（国内 Qwen-VL/豆包 vision，单图约 ¥0.003-0.01；海外 GPT-4o-mini/Gemini Flash）做结构化抽取（JSON schema：名称/类目/品牌/颜色/数量/保质期/PAO 开封期标识）。批量导入相册 50 张衣服照片 → 一次性自动打标签，这是旧产品做不到的"录入成本消除"。
- 抠图：rembg（开源）服务端或 iOS 16+ Vision 主体抠图/Android MLKit 端侧，零成本。
- 小票：纸质小票拍照 → LLM 直接抽取行项目（比 tesseract 类方案如 ReceiptManager/receipt-parser-legacy 准确率高得多，不需自己训模型）；电商订单用"订单页截图"让 LL
  - 竞品/替代：Homebox (sysadminsmedia/homebox) — 7.4k stars 自托管家庭库存，支持图片、保修/文档追踪，但无小票 OCR、无 AI 识别、需自建服务器，非目标用户（小红书年轻女性）可用方案。（https://github.com/sysadminsmedia/homebox）
  - 竞品/替代：grocy — 自托管家庭库存/食品管理；小票 OCR 需求 #404 自 2019-10 开放至今未实现（👍30），证明需求存在且开源社区未补齐。（https://github.com/grocy/grocy/issues/404）
  - 竞品/替代：zebangeth/ai-closet — 291 stars React Native AI 电子衣橱（数字化衣柜+搭配+虚拟试穿），验证 AI 衣橱技术路径可行，但为个人开源项目，非成熟产品，且不覆盖囤货/化妆品/小票。（https://github.com/zebangeth/ai-closet）
  - 竞品/替代：ReceiptManager/receipt-parser-legacy — 853 stars tesseract 小票解析，规则式、准确率有限、已标 legacy；说明传统 OCR 路线不够，LLM 视觉抽取是现在的正确路径。（https://github.com/ReceiptManager/receipt-parser-legacy）
  - 竞品/替代：bhimrazy/receipt-ocr — 726 stars LLM-OCR 小票引擎，可直接作为 MVP 小票录入模块的参考/依赖。（https://github.com/bhimrazy/receipt-ocr）
  - 竞品/替代：paperless-ngx — 文档管理而非物品管理；'ML 填充自定义字段' 162 upvotes 说明自托管用户也在等 AI 自动录入，但该项目定位不覆盖衣橱/囤货。（https://github.com/paperless-ngx/paperless-ngx/discussions/categories/feature-requests?discussions_q=is%3Aopen+sort%3Atop）

**用户原话 / 关键证据**：
> grocy 9.5k★ #404「OCR shopping receipts」2019-10开至今👍30/17评论
> 小红书测评：「积分用完不能再添加」「免费但丢过图片」「超过30/49件就付费」

**证据链接**：
- [] https://github.com/paperless-ngx/paperless-ngx/discussions/categories/feature-requests?discussions_q=is%3Aopen+sort%3Atop — Fill custom fields from machine learning（另有 Add a…（162 upvotes, 35 评论）
- [] https://github.com/tasks/tasks/issues/784 — I really liked that feature in TickTick (Smart Da…（👍 32, 6 评论 — tasks 仓库 👍 第 1）
- [] https://github.com/grocy/grocy/issues/404 — Feature Request: OCR shopping receipts（自动提取商品与价格入…（👍 30, 17 评论 — grocy 仓库 👍 第 1）
- https://github.com/sysadminsmedia/homebox
- https://github.com/Duelion/homebox-companion

**产品概念**：小程序/Flutter+对象存储：物品与存储永不限（OSS约¥0.1/GB/月）

**MVP 范围**：4-6周3人：不限量库+位置树+OSS

**风险**：crowd仅weak(5)：GitHub证据2条跑题，小红书测评无URL

### 13. 家人要远程守护父母手机防骗与异常扣费预警（C13，总分 5.2）

**一句话**：跨品牌跨App跨支付：父母手机异常扣费/可疑安装

**用户与场景**：异地子女、独自用手机的老人。父母被骗老人App、免密支付、短剧套娃付费、AI仿声

**现有方案及不足**：小米/华为/OPPO亲情守护（同品牌无支付预警）

**为何至今没解决**：跨App/支付监控权限iOS拿不到，安卓受厂商限制且HarmonyOS

**验证结论**：unmet=weak(5) crowd=weak(5.5) buildable=weak(5)

- *unmet* → weak（5）：结论：有大量"局部方案"，但没有任何一个成熟产品覆盖簇的核心场景——跨品牌、跨App、跨支付渠道地让外地子女实时收到父母手机的"异常扣费/可疑安装/大额转账/AI仿冒来电"预警。判为 weak(5)，而非 confirmed，因为部分子场景其实已被解决得不错，簇里的 why_unsolved（平台权限壁垒、厂商绑定）基本成立。

已被较好覆盖的子场景：
1) 同品牌家庭的远程协助/应用管控：华为「亲情关怀/远程协助」、小米「亲情守护」、OPPO/vivo「亲情守护/亲情关怀」都能远程看屏、代操作、限制/审批装App、设使用时长。缺点：子女与父母须同品牌（甚至同系统版本），且没有支付异常预警，不覆盖iPhone用户。
2) 支付宝体系内：「安全守护」（设守护人，风险交易推送守护人并可一键锁定账户）、「亲情号」（子女代付+额度）、「延时转账」；微信支付「亲属卡」（月额度、每笔消费通知出资人）、「延时转账」。这是最接近"异常扣费预警"的现成功能，但只管各自钱包，Apple ID/应用商店内购、话费代扣、银行卡直扣、短剧小程序免密支付都不在其中。
3) AI防诈来电：荣耀 MagicOS「AI换脸检测」、华为 HarmonyOS NEXT「AI防诈」、Google Pixel「Scam Detection」（Gemini Nano）、Truecaller AI Call Scanner（美
  - 竞品/替代：小米 亲情守护（MIUI/HyperOS） — 部分够用：子女可远程看屏/代操作、审批或禁止安装App、限制使用时长、看位置。缺陷：双方须小米/Redmi 设备，无支付异常或大额转账预警，不分析通话内容，iPhone 父母无法使用。
  - 竞品/替代：华为 亲情关怀 / 远程协助 + HarmonyOS NEXT AI防诈 — 部分够用：畅连远程协助可看屏代操作；HarmonyOS NEXT 新机内置端侧 AI 防诈提示。缺陷：品牌绑定、AI防诈仅新旗舰独占，结果只提示本机不推送子女，无跨App扣费监控。
  - 竞品/替代：OPPO/vivo/荣耀 亲情守护、荣耀 MagicOS AI换脸检测 — 与上同类：同品牌远程协助与应用管控；荣耀 AI 换脸检测仅覆盖视频通话且为新机卖点。厂商各自为战、无统一标准，换品牌即失效。
  - 竞品/替代：支付宝 安全守护（守护人）/ 亲情号 / 延时转账 — 支付宝体系内最接近'异常扣费预警'：可设守护人接收风险交易提醒并一键锁定，亲情号让子女代付并设额度。缺陷：只覆盖支付宝，App 内购、话费代扣、银行卡直扣、微信小程序免密支付不在其中。
  - 竞品/替代：微信支付 亲属卡 / 延时转账 / 关怀模式 — 亲属卡每笔消费通知出资人并有月额度，是可行的被动预警；延时转账需老人自己主动选择。缺陷：仅微信支付、需子女出资、不覆盖直播打赏与外部App扣费；关怀模式只放大字体。
  - 竞品/替代：国家反诈中心 App — 免费、装机量巨大：号码库来电预警、风险App装包检测、身份核验。缺陷：对AI变声/仿冒熟人电话无效，不做支付监控，不向家人推送任何预警，且用户口碑对其权限侵入性有争议。
- *crowd* → weak（5.5）：证据本体审视：(1) evidence 数组仅 3 条，全部是微博热搜"话题标题"，没有任何一条是个人用户在说"我想要一个能远程守护爸妈手机的东西但市面上没有/都不行"。三条里只有《真的建议检查一下爸妈的手机》与簇主题直接相关，且它表达的是"子女手动去翻一遍"，不是对远程监控工具的诉求；《呼吁老人大额转账设24小时冷静期》是两会代表的银行转账政策建议，对象是银行/监管而非手机端产品；《终于懂老年人对时代的无力感了》是泛数字鸿沟情绪话题。(2) 来源独立性：三条同为微博热搜榜，属单一平台的媒体/话题聚合；description 里提到的北京日报、文学城、中新网/中消协、GitHub 均无 URL 进入 evidence，independent_source_count=14 只是断言，未被证据支撑。(3) 互动：热搜排名 #12/#18/#33 是真实的大众关注度信号（量级通常是百万级阅读），但没有任何帖子级点赞/评论/转发数，也没有具体个人引文。(4) 簇合并了 4 个成员，把"配偶网游充 20 万/全家打赏 650 万退款被拒"这种成年人沉迷消费问题并入老人防骗簇，人群与诉求并不相同，有拼凑放大之嫌。

常识层判断：底层痛点在中国确实普遍而非个别——国务院办公厅 2020 年《关于切实解决老年人运用智能技术困难的实施方案》、工信部 2021 年互联网应用适老化专项行动、国家反诈中
  - 竞品/替代：手机厂商内置亲情守护/远程协助（小米 家人守护/亲情守护、华为 畅连远程协助与亲情关怀、OPPO/vivo 远程守护等） — 基于知识判断：覆盖远程屏幕协助、部分覆盖应用安装/支付提醒，但品牌绑定、子女与父母需同生态、老机型/低端机常缺失；无法跨品牌统一。具体功能名称与覆盖范围随版本变化，不完全确定。
  - 竞品/替代：国家反诈中心 App — 基于知识判断：号码/链接黑库拦截与预警，装机量巨大，但对 AI 仿声熟人电话、App 内诱导付费、自动续费无效，且无子女侧联动推送。
  - 竞品/替代：微信关怀模式 / 支付宝、淘宝、抖音长辈模式 — 基于知识判断：主要是大字体与简化界面，不解决扣费与诈骗监控。
  - 竞品/替代：gkd-kit/gkd — 42k★ 无障碍自动跳广告工具，能显著减少误触，但需要子女手动安装配置、依赖无障碍权限且厂商系统频繁限制；面向极客，非老人/子女守护产品，issue 区无老人相关诉求。（https://github.com/gkd-kit/gkd）
  - 竞品/替代：zfdang/Android-Touch-Helper — 5.3k★ 开屏广告跳过，同上，只解决开屏广告一个点。（https://github.com/zfdang/Android-Touch-Helper）
  - 竞品/替代：zlzddlg/UninstallApp — 7★，一键卸载老人误装垃圾App，事后清理工具，非实时守护，长期无维护。（https://github.com/zlzddlg/UninstallApp）
- *buildable* → weak（5）：【1. MVP 可行性】可以，但只能覆盖簇里四个子需求中的一个半（"及时发现异常扣费/可疑安装"+"事后追回助手"），且仅限安卓。关键技术路径：
- 父母端 Android APK（Kotlin，2 人 3-5 周）：NotificationListenerService 抓微信支付/支付宝/云闪付/银行 App 的支付与扣款通知 + READ_SMS 抓银行扣款短信；ACTION_PACKAGE_ADDED 广播 + PackageManager.getInstallSourceInfo 判断"非应用商店来源安装"；UsageStatsManager 统计短剧/直播/网游 App 时长与深夜使用；READ_CALL_LOG 做"陌生号码长通话后 5 分钟内打开支付 App"组合规则；通知文本关键词/小模型分类（"自动扣款""连续包月""免密""打赏""充值"）+ 金额阈值 → 分级告警。这条路径已被 SmsForwarder（28.1k star，通知/短信/来电转发到 webhook/Telegram/Bark）和多个"通知监听自动记账"开源项目验证可行，属于组合创新而非技术突破。
- 子女端：微信小程序订阅消息/公众号模板消息（子女无需装 App），后端极简（配对码、事件流、规则配置）。
- 附加低风险功能：一键"体检报告"（高危 App 清单、近 30 天自动续费/免密扣款
  - 竞品/替代：pppscn/SmsForwarder（短信转发器，28.1k star） — 验证了技术路径：监控安卓短信/来电/App通知并按规则转发到微信机器人、Bark、Telegram、webhook，还能远程查通话记录。但是极客工具，无老人友好安装引导、无防骗/异常扣费规则、无子女端产品化，不能直接给普通家庭用。（https://github.com/pppscn/SmsForwarder）
  - 竞品/替代：gkd-kit/gkd（42.3k star）+ 李跳跳 APK 备份仓（2.6k star） — 无障碍自动跳广告/自动点击，可解决'关不掉的弹窗、误触跳转'子需求，但属灰色地带（李跳跳已停更、只剩备份仓），老人自己装不了，且随时可能被平台法务或应用商店下架，不应作为产品核心。（https://github.com/gkd-kit/gkd）
  - 竞品/替代：通知监听自动记账类开源项目（MickLife/KeepAccounts_v2.0 310 star；FridayKoi/WhereIsMyMoney、DykiSensei/seamless-bookkeeping、abeet233/MoneyMate-android 等个位数 star） — 证明 NotificationListenerService 抓取微信/支付宝/银行扣款通知并结构化可行且门槛低，但都是个人记账用途，没有远程推送给家人、没有风险规则。（https://github.com/MickLife/KeepAccounts_v2.0）
  - 竞品/替代：2026 年新出现的 0-star 反诈/守护学生项目（Tianshang301/TianshangGuard、dq-hai/anti-fraud-guard、hzySerein/HeartGuard、bjfwan/yinxing 老人桌面 17 star） — 说明'通知监听+无障碍双通道采集+RAG 判定+语音阻断'的思路已有人在做，但均为 demo 级、无用户、无子女端，验证了需求热度而非有成熟替代品。（https://github.com/Tianshang301/TianshangGuard）
  - 竞品/替代：厂商/平台自带方案：华为亲情关怀/远程协助、小米家人守护、支付宝亲情账户与关怀模式、微信亲属卡与转账延迟到账、国家反诈中心 App、荣耀/华为新机 AI 换脸变声检测 — 各自覆盖一角：品牌绑定或新机独占；支付宝/微信只管自家渠道且不向子女推送异常扣费（是否已有'大额支付通知家人'功能不确定）；国家反诈中心靠号码库，对 AI 仿冒亲人无效。跨品牌、跨支付渠道的统一告警仍是空白，也是本产品唯一可切入的缝隙。

**用户原话 / 关键证据**：
> 《真的建议检查一下爸妈的手机》热搜#12；《呼吁老人大额转账设24小时冷静期》#18上榜2天
> GitHub 2026年≥8位开发者各自造"远程守护父母手机"轮子（Lead 2★、clan 0★）全部0-7★弃坑

**证据链接**：
- [] https://s.weibo.com//weibo?q=%E7%BB%88%E4%BA%8E%E6%87%82%E8%80%81%E5%B9%B4%E4%BA%BA%E5%AF%B9%E6%97%B6%E4%BB%A3%E7%9A%84%E6%97%A0%E5%8A%9B%E6%84%9F%E4%BA%86&t=31&band_rank=33&Refer=top — 热搜话题：《终于懂老年人对时代的无力感了》(同类话题《终于明白老年人玩智能机的无力感了》2025-…（微博热搜榜(快照排名#33，上榜1天)；）
- [] https://s.weibo.com//weibo?q=%23%E5%91%BC%E5%90%81%E8%80%81%E4%BA%BA%E5%A4%A7%E9%A2%9D%E8%BD%AC%E8%B4%A6%E8%AE%BE24%E5%B0%8F%E6%97%B6%E5%86%B7%E9%9D%99%E6%9C%9F%23&t=31&band_rank=18&Refer=top — 热搜话题：《呼吁老人大额转账设24小时冷静期》（微博热搜榜(快照排名#18，上榜2天)）
- [] https://s.weibo.com//weibo?q=%E7%9C%9F%E7%9A%84%E5%BB%BA%E8%AE%AE%E6%A3%80%E6%9F%A5%E4%B8%80%E4%B8%8B%E7%88%B8%E5%A6%88%E7%9A%84%E6%89%8B%E6%9C%BA&t=31&band_rank=12&Refer=top — 热搜话题：《真的建议检查一下爸妈的手机》（微博热搜榜(归档快照排名#12，上榜1天)）
- https://github.com/pppscn/SmsForwarder
- https://github.com/search?q=elderly+scam+protection&type=repositories&s=stars&o=desc

**产品概念**：父母端Android（老人可见可关）+子女端小程序订阅消息：NotificationListener

**MVP 范围**：3-5周2人：通知/短信采集+安装来源

**风险**：只能发现不能拦截；iOS不可行，华为老人第一品牌而NEXT不兼容APK

### 14. 中小商家要AI假图鉴别与恶意仅退款申诉工具（C28，总分 5.2）

**一句话**：商家侧售后AI假图多信号鉴别+按平台规则组织申诉材料

**用户与场景**：中小电商与生鲜农产品卖家。买家用AI生成烂水果假图仅退款，职业退款人一人退款上千次

**现有方案及不足**：平台申诉与高退款屏蔽、2025取消强制仅退款

**为何至今没解决**：裁决权在平台且倾向买家；平台掌握原图/身份/全网记录

**验证结论**：unmet=weak(6) crowd=weak(5) buildable=weak(4)

- *unmet* → weak（6）：结论：有"零件"没有"产品"，核心场景未被覆盖，但也不是完全空白，故判 weak(6) 而非 confirmed。

已存在且可用的部分：(1) 通用 AI 图片鉴别工具大量存在——免费网页版（腾讯朱雀 AI 检测助手、Hive AI-Generated Content Detection 演示、AI or Not freemium）、企业 API（阿里云/百度/火山 AIGC 检测、Sightengine）、开源（lynote-ai/ai-image-detector 327★ MIT 带 CLI/API/Web UI；MatrixA/aicheck 240★；学术仓库 AIDE/Effort/AIGI-Holmes 等）。(2) 平台内置：淘宝 2024.8 起对体验分高商家减少仅退款介入、2025 年淘宝/拼多多/京东/抖音等宣布取消强制"仅退款"改由商家处理，并有"高退款人群屏蔽"/异常仅退款识别与申诉通道。(3) 海外有 Signifyd/Forter/Riskified 的 Return Abuse 产品和 Appriss Retail 跨零售商退货滥用名单，以及 Chargeflow 等拒付申诉自动化。

为何仍不够用：(a) 通用鉴图工具输出是概率而非证据——lynote-ai README 自述"Treat the output as one signal, no
  - 竞品/替代：腾讯朱雀 AI 检测助手（AI 生成图片检测，免费网页版） — 部分可用：免费、中文、支持图片 AI 生成检测，是商家当下最可及的鉴图入口。不够用：通用场景、输出概率不出报告、对经平台/微信压缩的售后凭证准确率不明、不生成申诉材料、结果不被平台当作裁决依据。（https://matrix.tencent.com/ai-detect）
  - 竞品/替代：阿里云内容安全 / 百度智能云 / 火山引擎 AIGC 图片检测 API — 企业级收费 API，需开发接入，面向内容平台审核而非商家售后；中小商家无法直接使用。是否已被淘宝/拼多多审核端内置用于识别假凭证：不确定。
  - 竞品/替代：Hive AI-Generated Content Detection — 海外口碑较好的通用检测，有免费网页演示、API 收费，英文界面；通用而非售后场景，无申诉材料生成，对中国商家可达性差。（https://hivemoderation.com/ai-generated-content-detection）
  - 竞品/替代：AI or Not / Sightengine / Illuminarty 等通用 AI 图鉴别 SaaS — freemium 或 API 计费，海外产品、英文，通用图片；不覆盖售后申诉流程与买家风险。（https://www.aiornot.com）
  - 竞品/替代：Content Credentials Verify（C2PA）/ Google SynthID Detector — 只对带凭证/水印且未被剥离的图有效；买家上传假图经截图、微信/平台转存后元数据全失，对本场景几乎无效。SynthID Detector 仅覆盖 Google 生成内容且需申请，公开可用性不确定。（https://contentcredentials.org/verify）
  - 竞品/替代：淘宝/天猫 仅退款策略调整 + 商家申诉通道 + 高退款人群屏蔽/异常仅退款识别 — 平台内置：2024.8 起体验分≥4.8 商家减少平台介入，2025 年多平台宣布取消强制仅退款改由商家处理，并提供高退款买家屏蔽。缺陷：屏蔽单向、单平台、阈值不透明；申诉仍由平台裁决，簇证据显示 2026 年榴莲商家两次申诉被驳回，说明对中小商家未落地。
- *crowd* → weak（5）：证据本身审视：(1) 三条 evidence 全是微博热搜话题标题（新闻事件），表达的是"平台仅退款政策+买家造假造成商家损失"的社会议题，而非商家在说"想要一个AI假图鉴别/申诉材料生成/买家风险提示工具但现在没有"。工具诉求是簇作者从新闻推断出的，quote 里没有任何一句是商家本人的功能诉求。(2) 独立性差：三条全部来自微博热搜；第2条（榴莲商家两次申诉被拒）与第3条（损失20万有单不敢接）按 description 自述是同一榴莲商家事件（2026-05~06），第1条是2025-08央视曝光AI假图骗退款的报道——实际只有约2个独立新闻事件、1个平台，independent_source_count=4 明显高估。(3) 互动信号：热搜排名#11/#20/#30 是真实的大众关注度，但那是围观新闻的流量，不是"附和某个工具需求"的 👍/回帖数；没有任何商家社群（派代、卖家网、抖店/拼多多商家论坛）的原帖或回帖计数。(4) 常识判断：底层痛点确实普遍——"仅退款"滥用/职业退款人是2023-2025中国电商商家最集中的抱怨之一，甚至推动了2025年监管介入和淘宝/拼多多/京东/抖音相继宣布取消或收缩平台强制仅退款；用AI生成烂果/死蟹图骚扰售后是2025年出现的新变种并被央视报道。所以"很多商家在抱怨"成立。但商家的诉求对象几乎全是平台（要求平台鉴图、放宽申诉、拉黑买家）
  - 竞品/替代：平台商家后台申诉通道（淘宝/拼多多/京东/抖店售后申诉） — 存在且是唯一官方路径；商家普遍抱怨驳回率高、举证窄。2025年起淘宝、拼多多、京东、抖音相继宣布取消/收缩平台强制'仅退款'、把仅退款处置权交回商家（具体时间与范围不确定），底层问题正由平台+监管侧部分缓解。
  - 竞品/替代：平台侧AI假图识别（淘宝/拼多多售后图片AI鉴别） — 不确定：记忆中2025年央视曝光后淘宝等平台宣称在售后环节引入AI生成图识别，但无法核实细节。若成立，则第三方工具的核心功能被平台内置替代。
  - 竞品/替代：平台'高退款/高退货率买家'屏蔽、拦截功能 — 淘宝/拼多多等提供单向屏蔽或标签，仅限本平台、覆盖有限；跨店铺/跨平台黑名单涉及个人信息合规，第三方无法合法提供。
  - 竞品/替代：通用AI生成图检测开源工具 — 327★，通用CLI/API/Web UI；不面向售后，对经截图/重拍/压缩的买家照片准确率不足以作为申诉证据。（https://github.com/lynote-ai/ai-image-detector）
  - 竞品/替代：aicheck（元数据/水印离线AI内容检测） — 240★，依赖元数据与隐水印，买家截图或平台压缩后即失效，不适合售后取证。（https://github.com/MatrixA/aicheck）
  - 竞品/替代：商业AI图鉴别服务（Hive Moderation AI detector、Sightengine、Illuminarty；国内云厂商AIGC鉴别API） — 存在通用付费API（国内云厂商具体产品名不确定）；未与任何电商售后流程集成，中小商家需手动下载图片逐张检测，非'售后场景'方案。
- *buildable* → weak（4）：【簇核心】三段痛点：(a) 买家用AI假图（烂水果/死螃蟹）申请仅退款，商家无鉴别手段；(b) 职业退款人跨店铺作案，商家无法识别；(c) 申诉材料准备耗时且驳回率高。信号强（微博热搜10+话题近2个月、央视曝光），但需求本质是"平台裁决偏向买家"，这一点软件从商家侧无法消除。

【1. MVP可行性：可做，但只能做"辅助层"】
- 2-6周、1-3人可做出的MVP = 网页/小程序（手动上传售后图+订单信息）+ 可选浏览器插件（千牛/拼多多商家后台/抖店页面一键抓取售后图与聊天记录）：
  ① AI假图检测：技术路径为"多信号融合"——元数据/隐水印检测（aicheck类，检测C2PA、SynthID、EXIF残留）+ 像素级检测器（开源 AIDE/ai-image-detector/Effort-AIGI 类模型，或直接调阿里云内容安全/腾讯云/合合信息等国内AIGC图像鉴别API——具体产品名以我的知识判断存在但不确定最新形态）+ 多模态大模型做"常识一致性"分析（如：榴莲品种/包装/快递面单与订单是否一致、光影/文字/物理合理性）+ 同图跨订单/网图反查（图像哈希）。1-2周可接通。
  ② 申诉材料生成：LLM按平台争议规则（淘宝/拼多多/抖店售后规则）把订单、物流、发货视频、聊天记录、检测报告组织成结构化申诉文书 + 12315/报警/小额诉讼模板。1周可做，是最确定能
  - 竞品/替代：平台申诉通道 + 淘宝'高退款人群屏蔽'等平台原生工具（据我所知2025年起淘宝/天猫等在售后环节引入AIGC图片识别，细节不确定） — 占据了唯一有裁决权和全量数据的位置，但单向、覆盖有限、偏向买家体验；商家申诉驳回率高的问题由平台策略决定，第三方无法替代。
  - 竞品/替代：开源AI生成图检测器：AIDE (~339 stars, ICLR 2025)、ai-image-detector (~327 stars, CLI/API/Web UI)、aicheck (~240 stars, 元数据/隐水印离线检测)、Effort-AIGI-Detection (~232 stars) — 可作为MVP检测模块的技术底座，1-2周可集成；但均为通用/学术模型，未针对平台压缩、翻拍、生鲜商品域优化，检测结果对平台客服无约束力，且面向商家售后场景的封装产品在GitHub上未发现（'仅退款'关键词搜索无相关仓库）。（https://github.com/search?q=AI+generated+image+detection&type=repositories&s=stars&o=desc）
  - 竞品/替代：商业AIGC图像鉴伪API（Hive、Sightengine等海外；国内阿里云内容安全、腾讯云、合合信息等我认为有类似能力，最新产品形态不确定） — 可直接调用降低技术门槛，但同样不面向售后场景、不解决平台采信问题；按调用计费对小商家工具毛利有压力。
  - 竞品/替代：商家ERP/客服SaaS（千牛服务市场生态：聚水潭、店小秘、旺店通、晓多等类似产品） — 据我所知均未提供AI假图鉴别或申诉文书生成功能，但它们最容易把此功能作为模块追加，独立小团队产品的护城河薄。
  - 竞品/替代：跨店恶意买家黑名单类服务 — 历史上存在过第三方尝试，但订单信息密文化后无法合规匹配，收集消费者个人信息触碰《个人信息保护法》；目前无我能确认存在且合规运营的产品，属灰色地带。

**用户原话 / 关键证据**：
> 《遭仅退款损失20万老板有单也不敢接》热搜#11；榴莲事件共10+话题上榜近2个月
> GitHub「仅退款」28个、「恶意买家」35个均无关

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E5%A4%AE%E8%A7%86%E6%9B%9D%E5%85%89%E7%94%A8AI%E9%80%A0%E5%81%87%E5%9B%BE%E9%AA%97%E9%80%80%E6%AC%BE%E4%B9%B1%E8%B1%A1%23&t=31&band_rank=30&Refer=top — 热搜话题：《央视曝光用AI造假图骗退款乱象》(另有《用AI造假图仅退款》2025-08-21…（微博热搜榜(快照排名#30，上榜1天)；）
- [] https://s.weibo.com//weibo?q=%23%E9%81%AD%E6%81%B6%E6%84%8F%E4%BB%85%E9%80%80%E6%AC%BE%E6%A6%B4%E8%8E%B2%E5%95%86%E5%AE%B6%E4%B8%A4%E6%AC%A1%E7%94%B3%E8%AF%89%E8%A2%AB%E6%8B%92%23&t=31&band_rank=20&Refer=top — 热搜话题：《遭恶意仅退款榴莲商家两次申诉被拒》(榴莲仅退款事件2026-05-08~06-26 共…（微博热搜榜(快照排名#20)；同事件10+话题持续上榜…）
- [] https://s.weibo.com//weibo?q=%23%E9%81%AD%E4%BB%85%E9%80%80%E6%AC%BE%E6%8D%9F%E5%A4%B120%E4%B8%87%E8%80%81%E6%9D%BF%E6%9C%89%E5%8D%95%E4%B9%9F%E4%B8%8D%E6%95%A2%E6%8E%A5%23&t=31&band_rank=11&Refer=top — 热搜话题：《遭仅退款损失20万老板有单也不敢接》（微博热搜榜(快照排名#11，上榜1天)）
- https://github.com/lynote-ai/ai-image-detector

**产品概念**：商家侧鉴伪申诉助手：上传售后图+订单，多信号融合（元数据/隐水印+像素级检测或AIGC API

**MVP 范围**：3-5周1-3人：三层鉴别+报告

**风险**：核心是平台裁决权商家侧软件不能消除；报告对平台无约束力，误报真实买家有法律风险

### 15. 消费者要多账号同时比价取证大数据杀熟的工具（C30，总分 5.2）

**一句话**：邀好友各自查同一商品价格，OCR对齐时间与券/会员标识

**用户与场景**：怀疑被杀熟的外卖/咖啡。瑞幸4部手机3种价格且会员更贵、携程被罚后仍被问为何还杀熟

**现有方案及不足**：慢慢买/Keepa（单账号历史价）、changedetection.io

**为何至今没解决**：定价按账号/设备实时生成无API，唯一合法数据源是用户自己的屏幕

**验证结论**：unmet=confirmed(7) crowd=weak(4) buildable=weak(4)

- *unmet* → confirmed（7）：簇的核心诉求是"同一平台、不同账号/设备、同一时刻"的价差自动捕获与举证，外加跨平台历史价格追踪，场景是外卖/咖啡/OTA/运营商这类 App 内定价。逐类核查现有方案：(1) 历史价格类（慢慢买、购物党、Keepa、camelcamelcamel、changedetection.io 34.6k★、pricebuddy 1.3k★、PriceGhost 1.1k★）只解决"同一账号下价格随时间变化"，全部是单会话/单账号视角，且以网页版电商为对象，覆盖不到瑞幸/美团/携程 App 内的会员价、券后价；(2) 多开/分身类（手机厂商内置应用双开、平行空间、VirtualApp 开源版 2017 年停更并转商业授权）只提供"多一个账号"，不做价格抓取、对齐、留证，且平台杀熟常基于设备指纹/手机号实名，双开账号本身就难注册；(3) 跨平台比价（去哪儿、Google Flights、Trivago、外卖比价小程序及 GitHub 上一堆 0-2★ 的美团/饿了么比价脚本）比的是"平台间"而非"账号间"，与 existing_solutions 字段描述一致；(4) 监管与投诉渠道（个人信息保护法第 24 条、算法推荐管理规定、2024-25 年"清朗·算法典型问题治理"专项、12315/黑猫投诉、美国 FTC 2024 年 surveillance pricing 6(b) 调查）是事后
  - 竞品/替代：慢慢买 / 购物党(gwdang) 历史价格插件与 App — 不够用。免费、在维护、中国市场口碑尚可，但只做京东/淘宝/天猫等电商商品的历史价格曲线与跨平台比价，视角是单账号；不覆盖外卖、咖啡会员价、OTA 酒店机票、运营商套餐，也不比同平台不同账号的差价。
  - 竞品/替代：网易惠惠购物助手 — 不够用且已停运（停运具体时间不确定）。曾是主流历史价格插件，同样只做电商单账号价格历史。
  - 竞品/替代：Keepa / camelcamelcamel（海外） — 不够用。Amazon 专用历史价格追踪，口碑好、免费为主，但仅电商、单账号、不做个性化定价检测。
  - 竞品/替代：changedetection.io（开源，34.6k★） — 部分可用于'历史价格追踪'子需求：可监控任意网页价格并出图，活跃维护。但是单会话工具，无多账号并行、无跨账号差价对齐与举证输出，对只在 App 内展示的瑞幸/美团/携程会员价无能为力，需要自建部署，非普通消费者能用。（https://github.com/dgtlmoon/changedetection.io）
  - 竞品/替代：pricebuddy / PriceGhost / Discount-Bandit（开源自托管价格追踪） — 不够用。面向欧美电商网页的自托管降价提醒，1.3k/1.1k/743★，活跃；'多用户'是指家庭多人各自追踪，不是同商品多账号 A/B 抓价，不支持中国 App 平台。（https://github.com/jez500/pricebuddy）
  - 竞品/替代：手机厂商应用双开 / 平行空间 / 双开助手 / VirtualApp — 不够用。系统内置双开免费可用，可开第二个账号；但不采集价格、不对齐、不留证，且平台杀熟常基于设备指纹与手机号实名，双开账号难注册、双开环境常被识别。VirtualApp 开源版 2017 年停更转商业授权。（https://github.com/asLody/VirtualApp）
- *crowd* → weak（4）：证据审视：(1) 三条 evidence 全是微博热搜话题标题（《瑞幸回应4部手机点出3种价格》《罚了51.79亿携程为何还在杀熟》《携程 杀熟》），表达的是对"被杀熟"的愤怒和对平台/监管的追问，没有任何一条原话在说"我想要一个多账号比价/取证工具、现有工具都不行"。"多账号同时比价、价差自动记录、跨平台历史价格追踪"这套诉求是分析者从事件反推出来的，属于推断而非用户原声。(2) 来源不独立：3 条全部来自微博热搜，且第 2、3 条是同一携程事件的两个话题；瑞幸条目自述"同事件 3 个话题上榜"。实际是 1 个平台、2 个新闻事件，independent_source_count=4 明显虚高。(3) 互动可见：热搜榜 #5/#8/#20 说明"杀熟"这个抱怨确有海量围观，但围观的是丑闻本身，不是对某种工具的附和；没有任何 👍/转评数据指向"要工具"。(4) 常识判断：大数据杀熟自 2018 年起就是中国消费者最持久的抱怨之一（携程 2020 绍兴柯桥判例、复旦孙金云团队 2021 年用多部手机 800+ 次打车做的杀熟报告、北京消协 2019 年调查中约 88% 受访者认为杀熟普遍、315 晚会多次提及），"个人举证难"也是每次事件评论区的固定台词，所以底层痛点普遍成立。但"4 部手机比价"本身正是因为稀罕才能上热搜，日常大众的应对是发截图、吐槽、要监管罚款，而非寻找并使用一个
  - 竞品/替代：dgtlmoon/changedetection.io — 34.5k★ 通用网页/价格变动监控。能做单账号历史价格追踪，不能模拟多账号/多设备同一时刻拉价，也不产出可举证的价差记录；对外卖/OTA App 内价格无能为力。（https://github.com/dgtlmoon/changedetection.io）
  - 竞品/替代：jez500/pricebuddy / clucraft/PriceGhost / Cybrarist/Discount-Bandit — 1.3k★/1.1k★/743★ 自托管跨店价格追踪器，面向电商商品页；不涉及同平台账号间价格歧视。（https://github.com/jez500/pricebuddy）
  - 竞品/替代：yangka1212/JiPiao、zhanglong-ustc/flight-price-monitor、Cain2501/hotel-price-monitor — 12★/6★/4★ 国内 OTA 机票/酒店跨平台价格监控脚本，单账号、跨平台，不做跨账号取证。（https://github.com/yangka1212/JiPiao）
  - 竞品/替代：ZHOUKAILIAN/FoodDeliveryPriceComparisonApplication、bettermen/waimai-compare — 2★/1★ 外卖跨平台千人千面比价（用用户自己 cookie），最接近本簇但仍是跨平台而非同平台多账号；几乎无人使用。（https://github.com/ZHOUKAILIAN/FoodDeliveryPriceComparisonApplication）
  - 竞品/替代：sunbufu/revolt-big-data、red-fox-yj/Capture、Bhuvanesh3602/JACOBI-Agent、citp/rideshare-personalized-pricing — 直接瞄准'检测大数据杀熟/个性化定价'的尝试，合计不到 10★，分别是停更、未完成的科研项目、新建 demo 和学术采集插件；说明有人想做但没有形成任何用户聚集。（https://github.com/red-fox-yj/Capture）
  - 竞品/替代：慢慢买 / 购物党 / 惠惠购物助手（商业，基于既有知识） — 国内电商历史价格与跨平台比价浏览器插件/App，覆盖京东淘宝等商品页价格曲线，不覆盖外卖、咖啡、OTA、运营商套餐，也不比同平台不同账号价差。
- *buildable* → weak（4）：【簇要点】C30：消费者要「同平台多账号同时比价 + 价差自动取证 + 跨平台历史价格追踪」，场景为瑞幸/美团外卖、携程OTA、运营商套餐；证据为微博热搜(viral, 4源)；why_unsolved：定价数据在平台侧、举证需多账号多设备、平台用券/会员包装规避、监管滞后。

【1. 小团队 2-6 周能否做出真正解决痛点的 MVP】
只有三条技术路径，均无法在合法前提下消除核心痛点：
- 路径A（自动化多账号并发查价）：登录多个账号并发调用瑞幸/美团/携程 App 接口。需逆向 App 签名与风控（美团 mtgsig/_token、携程/瑞幸 App 加签与设备指纹）、过验证码、对抗同设备多账号风控；账号需实名手机号，「一人多号」靠养号/买号，已属黑灰产。国内司法实践中绕过 App 反爬批量抓取多次被认定为不正当竞争甚至「非法获取计算机信息系统数据罪」（大众点评诉百度、「车来了」案、多起爬取电商/OTA 数据刑案）。这是灰→黑地带，明确降分；且一旦规模化，平台封号/换签名即失效，维护成本远超 1-3 人团队。GitHub 佐证：携程/美团爬虫仓库仅 0-6 star 且多年不更新（lxldfzr/Xiecheng 6★、Yybrook/ctrip-ticket-crawler 0★），「美团 mtgsig」检索 0 结果，没有任何可复用的稳定接口层。
- 路径B（众包见证/众包
  - 竞品/替代：慢慢买（跨平台历史价格查询，电商侧） — 覆盖淘宝/京东等电商的历史价格曲线与跨平台比价，靠爬取+CPS返佣变现；不覆盖外卖/OTA/运营商，不做同平台不同账号价差对比，无法用于杀熟举证。（https://www.manmanbuy.com）
  - 竞品/替代：什么值得买 / 购物党（比价与优惠聚合） — 跨平台优惠信息与价格历史，不解决同平台多账号价差与取证。（https://www.smzdm.com）
  - 竞品/替代：Keepa / CamelCamelCamel（Amazon 价格历史） — 海外电商单平台历史价格追踪的成熟范式，证明历史价格追踪可商业化（订阅+API），但不涉及个性化定价对比，且不适用于中国 App 生态。（https://keepa.com）
  - 竞品/替代：Hopper（机票/酒店价格预测与追踪） — OTA 侧价格趋势与买入时机建议，靠 GDS/合作数据源而非爬取，不做账号间价差检测。（https://hopper.com）
  - 竞品/替代：黑猫投诉 / 12315 平台 — 投诉与曝光渠道，是杀熟取证的下游出口，但不提供比价与自动取证能力；可作为 MVP 的投诉对接目标而非竞争者。（https://tousu.sina.com.cn）
  - 竞品/替代：Mozilla Rally（已关停的众包数据审计项目） — 众包浏览器插件审计平台的先例，2023 年关停，印证众包审计模式冷启动与持续运营困难。（https://rally.mozilla.org）

**用户原话 / 关键证据**：
> 《瑞幸回应4部手机点出3种价格》热搜#8上榜2天；《携程 杀熟》#5、《罚了51.79亿携程为何还在杀熟》#20
> GitHub「杀熟」32个仓库仅2个相关且均2★；changedetection.io 34,584★但全部单账号

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E7%91%9E%E5%B9%B8%E5%9B%9E%E5%BA%944%E9%83%A8%E6%89%8B%E6%9C%BA%E7%82%B9%E5%87%BA3%E7%A7%8D%E4%BB%B7%E6%A0%BC%23&t=31&band_rank=8&Refer=top — 热搜话题：《瑞幸回应4部手机点出3种价格》(前有《开了瑞幸会员卡价格反比别人贵》…（微博热搜榜(快照排名#8，上榜2天)；同事件3个话题上榜）
- [] https://s.weibo.com//weibo?q=%23%E7%BD%9A%E4%BA%8651.79%E4%BA%BF%E6%90%BA%E7%A8%8B%E4%B8%BA%E4%BD%95%E8%BF%98%E5%9C%A8%E6%9D%80%E7%86%9F%23&t=31&band_rank=20&Refer=top — 热搜话题：《罚了51.79亿携程为何还在杀熟》（微博热搜榜(快照排名#20，上榜1天)）
- [] https://s.weibo.com//weibo?q=%E6%90%BA%E7%A8%8B%20%E6%9D%80%E7%86%9F&t=31&band_rank=5&Refer=top — 热搜话题：《携程 杀熟》（微博热搜榜(快照排名#5，上榜1天)）
- https://github.com/red-fox-yj/Capture
- https://github.com/dgtlmoon/changedetection.io

**产品概念**："比价房间"小程序：发起人建房间选定商品，邀3-5位不同画像好友在各自App查同一商品并上传截图

**MVP 范围**：2-4周1-2人：房间/邀请/上传

**风险**：crowd仅weak(4)：证据全为热搜标题无人表达"要工具"

## 附录 A：搜索代理分工

- `xhs-求app`（xiaohongshu.com）：小红书 求app/求软件/谁能开发/蹲一个/同求
- `xhs-吐槽`（xiaohongshu.com）：小红书 吐槽角度：所有app都不好用/为什么没有一个app能/停更求替代
- `xhs-垂直1`（xiaohongshu.com）：小红书 按人群：打工人/大学生/考研考公/宝妈/养宠/租房/装修/留学生/跨境电商/自媒体/小商家/老年人
- `xhs-垂直2`（xiaohongshu.com）：小红书 按生活场景：记账/健康/吃药/饮食/睡眠/情绪/时间管理/家务/收纳/二手/出行/拼单/搭子
- `zhihu-有没有`（zhihu.com）：知乎 有没有一款软件可以/为什么至今没有/市场空白
- `zhihu-为什么没人做`（zhihu.com）：知乎 为什么没有人做xx/为什么中国没有xx app/什么功能你一直希望有
- `douyin`（douyin.com）：抖音 求推荐有没有这种软件/谁做出来我第一个买
- `weibo`（weibo.com）：微博 有没有什么app能/谁能做一个/愿意付费
- `bilibili`（bilibili.com）：B站 求一个软件/UP主自己做了个软件因为找不到
- `v2ex-appinn`（v2ex.com、appinn.com、meta.appinn.net）：V2EX + 小众软件 求软件版块/自荐因为找不到就自己写了
- `tieba-douban`（tieba.baidu.com、douban.com）：贴吧+豆瓣小组 求软件帖
- `sspai-juejin`（sspai.com、juejin.cn、ithome.com、36kr.com）：少数派/掘金/IT之家/36氪 开发者自述因为找不到才自己做
- `hn-wish`（news.ycombinator.com）：HN Ask HN what tool do you wish existed / I would pay for
- `hn-complaints`（news.ycombinator.com）：HN every X app is bad / why is X still so hard / enshittification
- `ph-ih`（producthunt.com、indiehackers.com、ycombinator.com）：Product Hunt / Indie Hackers / YC RFS 需求帖
- `x-threads`（x.com、twitter.com、threads.com）：X/Threads why isn't there an app that / someone please build
- `appstores`（apps.apple.com、play.google.com）：应用商店评论 wish it could / please add / 就差这个功能
- `github-issues`（github.com）：GitHub 高赞 feature request / awesome ideas 列表
- `quora-medium`（quora.com、medium.com、substack.com）：Quora/Medium/Substack what app do you wish existed
- `youtube-tiktok`（youtube.com、tiktok.com）：YouTube/TikTok app that doesn't exist but should
- `open-zh-1`（全网）：中文全网 为什么没有一个app能/伪需求还是真需求（配额耗尽后转 GitHub 开源社区 star/issue 挖掘）
- `open-zh-2`（全网）：中文全网 按人群：老年人/残障/农民/骑手/教师护士/宝妈/留学生/小商家/自由职业
- `open-en`（全网）：英文全网 why is there still no app for / I would pay for an app that

## 附录 B：覆盖缺口与第二轮补搜建议（需提高 WebSearch 配额后执行）

- 分工失效/产出为零：bilibili、zhihu-为什么没人做、ph-ih 三个分工在 sweep 中 0 条产出；xhs-求app/xhs-吐槽 为部分失败后 salvaged；tieba-douban 仅 5 条（贴吧 1 条）、appstores 5 条、x-threads 6 条。这些平台实际上等于没搜。
- 证据质量偏弱：微博 75 条证据里 72 条是 s.weibo.com 热搜榜页（话题标题），不是用户'求软件'原帖/评论，A06/A07/A08/A10/A11/A13/A23/A24/A26 全部只靠热搜页撑起 viral；抖音 28 条里 25 条是搜索聚合页；知乎直连不可用，只靠 zhuanlan 与搜索摘要。
- 未覆盖的中文'求软件'聚集地：酷安（求软件/有没有 app 是核心内容）、吾爱破解悬赏问答（有偿求软件/脚本）、花粉俱乐部与鸿蒙 NEXT '缺哪些 app/求鸿蒙版' 讨论、远景/卡饭、linux.do、即刻（独立开发者/求推荐圈子）、gitee/oschina/csdn/segmentfault、百度知道/搜狗问问（下沉市场措辞）、今日头条/微头条、公众号文章（搜狗微信）、什么值得买、虎扑步行街/NGA、黑猫投诉/人民网领导留言板（投诉即需求）、猪八戒/码市/程序员客栈/电鸭（付费定制需求）、国产安卓商店评论（华为/小米/应用宝/TapTap）。
- 未覆盖的繁体中文市场：PTT、Dcard、Mobile01、LIHKG 完全没搜，措辞不同（有沒有推薦的App/有冇app/為什麼沒人做），且台湾/香港特有场景（发票载具对奖、健保、台铁高铁、八达通、强积金、长者手机）可与大陆簇做跨区域交叉验证。
- 未覆盖的英文聚集地：Reddit 不可用但其替代品 Lemmy（c/asklemmy、c/opensource、c/selfhosted、c/privacy、c/android）与 Mastodon 未搜；softwarerecs.stackexchange（未回答问题=供给空缺）、AlternativeTo 讨论区、Lobsters/Tildes、needgap（专门发'问题求解决'）、dev.to/hashnode 未搜；闭源产品官方反馈板（Canny/UserVoice/Nolt/Featurebase 公开板、Spotify Ideas、Obsidian forum、Home Assistant community、XDA app request、Apple/MS 社区）未搜——与 GitHub issue 不同，这类是'厂商多年不做'的第三方机会；Upwork/Freelancer/Fiverr/Kickstarter 的付费需求未搜。
- 人群缺口：open-zh-2 按人群（老人/残障/农民/骑手/教师护士/宝妈/小商家）在全网泛搜下几乎无产出（只得 B20-B23），需改为进入其自有社区定向搜：医生（丁香园）、网文作者（龙空）、货车司机（卡车之家）、家长/中学生错题与家校多 app（家长帮）、宝妈（宝宝树/妈妈网）、新能源车主充电桩聚合与车机广告（汽车之家）、摄影师、民宿房东、基层公务员表格填报。英文侧完全没有按人群搜：ADHD/神经多样性、慢病与症状记录、照护者、视障/听障/轮椅、教师护士卡车司机农民、移民/ESL。
- 措辞角度缺口（中文）：'有偿求/悬赏/求大佬开发/谁能写个脚本/付费定制'（付费意愿最强证据）、'X 停服/下架/限速后用什么'（迁移期暴露功能缺口）、'鸿蒙版什么时候上/鸿蒙 NEXT 缺什么 app'、'每个小区/医院/学校/停车场/充电桩一个 app 受不了，有没有聚合'、'iOS 有没有类似安卓 xx 的'。措辞角度缺口（英文）：ISO (in search of)、shut up and take my money、'alternatives after X shut down'（Pocket 2025-07、Skype 2025-05、Omnivore、Mint、Google Podcasts、Kindle 取消 USB 下载、Windows 10 EOL 2025-10 迁 Linux）、厂商社区里的 'is there a way to'。
- 簇证据偏少需定向补搜：A04/A05/A27/A28/A29/A30（单平台 3-4 条：独居守护、父母防骗、家庭充值预警、去世账号托管、老人健康共享、经期记录）；B13/B14（各 2 条）；B25-B30（2-3 条：独立开发者曝光、本地笔记检索、课表、选课、数据带走、发票收集）；C14-C19（1-2 条，单个 GitHub issue 撑起 viral：播客多队列、iPad VS Code、Flutter 热更新、WSL2 磁盘回收、终端 buddy、OLED 子像素渲染）；抖音簇 A02/A18/A22 依赖搜索聚合页。
- 结构性不可搜渠道（记录以便说明局限）：微信群/QQ 群/小程序评论、Discord/Telegram、快手、闲鱼定制需求、Apple Feedback/Microsoft Feedback Hub 不公开；日韩等非中英市场不在范围。

- `coolapk-52pojie-harmony`（coolapk.com、52pojie.cn、club.huawei.com、bbs.pcbeta.com、bbs.kafan.cn）：国产安卓/Windows 硬核用户的'求软件'聚集地，此前完全未搜。酷安：搜'求软件''求推荐''有没有一个app能''谁能做一个''求鸿蒙版'的动态与评论区（记录点赞/评论数）；吾爱破解：'悬赏问答''求助'版块里'有偿求/求脚本/求破解不如求替代'的帖子，重复主题=真实付费需求；花粉俱乐部+酷安：鸿蒙 NEXT '缺哪些 app''什么时候上架鸿蒙''鸿蒙上没有 xx 怎么办'的清单式帖子（2024-2026 新增市场空白）；远景/卡饭：Windows '求一个能 xx 的软件''找了很久没找到'。顺带补证 A09/B04（广告屏蔽）、B11（验证码转发）、B14（输入法）、B18（剪贴板）、A25/A26（隐私/骚扰）。每条记录：帖子 URL、原话、互动数、是否有人回复'没有/自己写了'。
- `paid-custom-demand`（zbj.com、epwk.com、codemart.com、proginn.com、eleduck.com、zb.oschina.net、upwork.com、freelancer.com、fiverr.com、peopleperhour.com、kickstarter.com）：付费意愿最强的证据源：个人/小商家掏钱定制的小软件需求。中文：猪八戒/一品威客/码市/程序员客栈/电鸭/开源众包上预算几百到几千元的'开发一个小程序/脚本/插件/爬虫/自动化/Excel处理/微信机器人/提醒工具'需求，按主题归并，找多个不同雇主反复发布的同类需求（如：多平台房态同步、订单/发票汇总、群消息统计、抢票/监控、批量下载）。英文：Upwork/Freelancer/PPH 中 'build a simple app that''Chrome extension that''script to automate' 的小预算重复主题，Fiverr 的热门定制类目；Kickstarter 软件/App 类众筹里达标项目与评论区'finally someone made this'。记录预算、发布频次、是否已有现成产品。
- `en-recs-lemmy-shutdowns`（softwarerecs.stackexchange.com、alternativeto.net、lemmy.world、lemmy.ml、programming.dev、lobste.rs、tildes.net、mastodon.social、fosstodon.org、needgap.com、dev.to）：Reddit 不可访问，用 Lemmy 全套替代：c/asklemmy、c/opensource、c/selfhosted、c/privacy、c/android、c/degoogle、c/linux 中 'is there an app that''looking for a tool that''does anything exist that''ISO' 帖，记录评论数与'没有，我也在找'附和。softwarerecs.SE：按标签浏览未回答/低分问题与高票问题，未被满意回答=供给空缺。AlternativeTo：'looking for alternative to X with Y' 讨论 + 2025-2026 关停迁移潮（Pocket 2025-07、Skype 2025-05、Omnivore、Mint、Google Podcasts、Kindle 取消 USB 下载、Arc 停更、Windows 10 EOL 迁 Linux）中反复出现的'所有替代品都缺 X 功能'。needgap：用户发布的待解决问题及投票。Lobsters/Tildes/dev.to：'I built X because nothing existed' 自述。Mastodon：'someone please build''wish there was an app' 帖。顺带补证 C05、C11、C14、C19、C30。
- `en-feedback-boards`（canny.io、uservoice.com、nolt.io、featurebase.app、community.spotify.com、forum.obsidian.md、community.home-assistant.io、xdaforums.com、discussions.apple.com、answers.microsoft.com）：闭源/商业产品的官方反馈板与厂商社区——与 GitHub issue 不同，这里是'厂商多年不做'的高票需求，直接对应第三方工具机会。Canny/UserVoice/Nolt/Featurebase 公开板：搜 'most voted''under review''not planned' 且创建 2+ 年仍 open 的条目（Notion、Todoist、Raycast、Arc、Figma、Linear、Strava 等的 feedback.* 子域）。Spotify Ideas（Live Idea 高票且多年未实现）、Obsidian forum 的 Feature requests 与 Plugin ideas 板、Home Assistant community 的 Feature Requests 高票帖、XDA 'app request'/'is there an app' 帖、Apple 与 Microsoft 社区 'is there a way to''any app that can' 问题中官方答复'不支持'的。记录票数、开放年限、官方状态。顺带补证 C12/C14/C15/C30。
- `zh-hant-tw-hk`（ptt.cc、dcard.tw、mobile01.com、lihkg.com）：繁体中文市场此前零覆盖。措辞：'有沒有推薦的App''求推薦 app''有冇 app 可以''為什麼沒有人做''跪求''有人做出來我一定付費''找不到好用的'。PTT 看板：MobileComm、iOS、Android、Soft_Job、Lifeismoney、e-shopping、home-sale；Dcard：3C、理財、APP、租屋、考試；Mobile01：軟體討論、Apple/Android 軟體；LIHKG：科技台、Apps台、財經台。重点场景：記帳/發票載具對獎、健保快易通、台鐵高鐵訂票、悠遊卡/八達通、強積金、長者手機、租屋、補習/考公職、外送。除挖新簇外，标注哪些需求与大陆簇（记账 A15、老人 A05、抢票 A11、订阅管理 A03、云相册 A21）同构，形成跨区域交叉证据。
- `zh-occupational-forums`（dxy.cn、lkong.com、360che.com、jzb.com、babytree.com、mama.cn、club.autohome.com.cn、bbs.hupu.com、bbs.nga.cn、xitek.com）：open-zh-2 按人群泛搜几乎无产出，改为进入各职业/身份的自有社区。丁香园：医生/护士'有没有软件能'（排班、病历模板、文献、值班提醒、患者随访）；龙的天空：网文作者码字软件/大纲/防丢稿/多平台发布痛点；卡车之家：货车司机找货、油价、限行、ETC 对账、多平台接单聚合；家长帮：错题本、家校多 app（钉钉/班级小管家/校讯通）、作业打卡、中学生时间管理；宝宝树/妈妈网：疫苗提醒、辅食、母乳/睡眠记录、多人共育、育儿账本；汽车之家论坛：新能源车主'每个充电桩品牌一个 app'聚合、车机广告、一车一 app、停车/洗车/保养分散；无忌：摄影师选片交片客片管理；虎扑步行街/NGA 水区：'有没有什么 app 能''求一个软件'高回复帖。措辞加'求推荐''有没有软件''自己做了个''受不了'。每条记录职业身份、原话、回复中有无现成方案。
- `zh-mass-qa-complaints`（zhidao.baidu.com、toutiao.com、weixin.sogou.com、mp.weixin.qq.com、tousu.sina.com.cn、liuyan.people.com.cn、cca.org.cn、thepaper.cn）：下沉市场、中老年、非一线城市用户的声音，以及'投诉即需求'。百度知道/头条：'有没有什么软件可以…''什么 app 能…不要钱''求一个不收费的''谁能开发一个'，看提问量与'我也想找'追问；公众号（搜狗微信搜索 + mp.weixin.qq.com）：'有没有这样一个 App''为什么没人做''我们做了个 xx 因为找不到'文章及阅读/在看数与留言区。黑猫投诉：按'自动续费''免密扣款''未成年人充值退款''老人误扣''演出退票''找不到人工客服''押金不退''会员共享'归并投诉量，提炼用户想要但没有的工具；人民网领导留言板/澎湃问政/中消协：'每个小区/医院/学校/停车场/充电桩一个 app''政务 app 太多''老人不会用'类留言。重点补证只有单一平台的 A03/A04/A05/A07/A10/A27/A28/A29/A30。
- `zh-dev-communities-2`（linux.do、gitee.com、oschina.net、csdn.net、segmentfault.com、okjike.com、web.okjike.com、github.com）：此前未搜的中文开发者/独立开发者社区（github.com 仅限 ruanyf/weekly 与 HelloGitHub 仓库的 issue 评论区，勿再泛搜 GitHub）。linux.do（2024-2026 最活跃中文技术社区）：'求推荐''有没有''自己写了个因为找不到''需求验证'帖，记录回复数与'+1'；即刻：'独立开发者的日常''AI探索站''产品经理的日常''求推荐'圈子里'有没有一个 app''这个需求有人做吗''愿意付费'动态；gitee issues：中文 feature request 高赞；oschina/segmentfault/csdn 问答：'有没有开源的 xx''国内能用的 xx 替代''不用翻墙的'；阮一峰周刊 issue 评论区：读者'求推荐/求软件'。另加迁移角度：'印象笔记/有道云笔记/网易相册/迅雷/百度网盘限速/某工具停服后用什么'。补证 B13/B14/B17/B25/B26/B29/B30。
- `en-underserved-groups`（全网）：英文侧按人群定向搜（对应中文 open-zh-2 的英文版，此前完全没有）。神经多样性：'ADHD app that actually''why is every ADHD app''autistic adults wish there was an app''dyslexia friendly app wish'；慢病与症状记录：'chronic illness tracker wish it could''endometriosis/POTS/migraine app frustrating'；照护者：'caring for aging parent wish there was an app''remote monitoring dad's phone scams'；无障碍：'as a blind user I wish''screen reader users app that''deaf app wish existed''wheelchair accessibility map lacking'；职业：'as a nurse/teacher/trucker/farmer/electrician I wish there was an app''small trade business still using Excel'；移民/ESL/非美国市场（印度、巴西、欧盟）'no app for X in my country'。来源不限：博客、Medium、Quora、dev.to、论坛、新闻、TikTok 文字页。记录原话、人群、有无现成方案、是否愿付费。顺带补证 C20/C21/C23 在这些人群中的表现。
- `zh-social-verify`（s.weibo.com、weibo.com、douban.com、bilibili.com、zhuanlan.zhihu.com）：定向补证与失败分工重跑，不再抓热搜榜页。微博：用 s.weibo.com/weibo?q=<簇关键词> 搜真实原帖与评论（如'微信 聊天记录 导出 求软件''自动续费 有没有app 管理''独居 定时 报警 app''幽灵外卖 核验 工具'），为 A01-A13、A23-A28 每簇补 3-5 条带转评赞数的用户原话，特别是目前只有热搜页的 A06/A07/A08/A10/A11/A13/A23/A24/A26。豆瓣小组：指定'App推荐''我们都爱效率工具''极简生活''生活组织学''独立开发者''社畜茶水间'等组搜'求 app''有没有''谁能做一个'。B站（上次 0 产出）：改搜 bilibili.com/read 专栏与视频页标题/简介'求一个软件''自己做了个 xx 因为找不到''这个需求为什么没人做'。知乎（直连不可用）：仅用 zhuanlan.zhihu.com 与搜索摘要，补上未跑成的'为什么没人做/什么功能你一直希望有/如果有人做 xx 你会付费吗'角度。

## 最终决定：做「素账 PlainLedger」（C01）

三位评审分别选了 C29（用户痛感优先）、C01（可实现性优先）、C14（商业优先）。最终选择 C01，理由：

- 它是全部 50 个簇里唯一 crowd=confirmed（28 个独立来源、5 个平台、有用户原话）且能在无外网、不依赖平台私有接口、合法合规的前提下完整做出来的需求，并同时出现在另外两位评审的候补名单中。
- C29「找人工」的核心价值是各企业热线的转人工按键路径，本次无法逐一拨打核实，以未验证数据上线会误导用户；C14「物品管理」的人群呼声证据偏弱（crowd=5）。
- 差异化不靠技术壁垒，而靠把用户反复抱怨的四件事一次做对：没有广告与会员墙、官方账单 CSV 导入即用、零账号的账本文件合并共享与分摊结算、数据完全留在本机可随时导出。

产品代码在仓库 `plainledger/` 目录，含 15 项单元测试与 10 步浏览器冒烟测试。
