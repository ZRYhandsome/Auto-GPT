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

### 16. 大学生要教务课表导入与选课余量捡漏提醒（C39，总分 5.2）

**一句话**：LLM零适配导入教务课表的无广告小组件课表+合规选课余量提醒

**用户与场景**：在校大学生。想一键导入教务课表配小组件但不要广告社交

**现有方案及不足**：超级课程表/课程格子（广告社交）、WakeUp课程表（有广告）

**为何至今没解决**：教务系统数百种无统一接口；教务厂商无候补提醒

**验证结论**：unmet=weak(4) crowd=confirmed(7) buildable=weak(4)

- *unmet* → weak（4）：簇 C39 实际是两个子需求的合并，成熟度差异很大。(1) 「教务课表一键导入 + 无广告 + 桌面/锁屏小组件 + 上课提醒」在中国市场早已被多层方案覆盖：WakeUp课程表（闭源免费、社区 JS 适配脚本覆盖上千所高校、小组件/提醒/同步，长期是"超级课程表广告臃肿"的默认替代品，GitHub 上大量 "xxx→WakeUp" 导出脚本与 "wakeup-alternative" topic 反证其事实标准地位）；小米「小爱课程表」、华为/荣耀/vivo/OPPO 的系统级课程表都内置教务导入与锁屏/桌面组件（GitHub 上 61 个小爱课程表适配仓库）；2025-2026 开源阵营又有拾光课程表 921★（适配仓库 shiguang_warehouse 170 forks，说明社区适配模式在运转）、晴课表 62★、Sleepy 58★、轻屿课表 50★，全部活跃维护、无广告。海外则靠 ICS 标准（Canvas/Moodle/TimeEdit 导出→系统日历小组件）基本无痛。"教务系统数百种无统一接口"是真实痛点，但社区适配脚本模型已运行多年，且 2026 年出现截图+AI 识别导入（嘎嘎课程表、fkwakeup）进一步降低适配门槛。这一半应判 refuted。(2) 「选课余量监控/捡漏提醒」在海外基本已解决：多数高校选课系统（Banner/PeopleSoft/Work
  - 竞品/替代：WakeUp课程表（Android/iOS，闭源免费） — 够用。多年来事实上的「无广告极简课程表」标准品：社区 JS 适配脚本覆盖上千所高校的教务导入，桌面/锁屏小组件、上课提醒、云同步、CSV/ICS 导入齐全；GitHub 上大量「xxx教务→WakeUp csv」脚本与新项目自称 wakeup-alternative 反证其地位。缺点：闭源、依赖社区适配随教务改版可能失效、部分版本有少量广告位。基本覆盖子需求 1。
  - 竞品/替代：小米「小爱课程表」/ 华为·荣耀·vivo·OPPO 系统内置课程表 — 部分够用。系统级免费无广告、自带锁屏/桌面/负一屏组件与提醒，内置教务导入（同样靠适配脚本，GitHub 有 61 个小爱课程表适配仓库）。口碑一般：导入被吐槽「过于破烂」（Xtao-Labs/WakeUp2XiaoAi 项目立项理由），覆盖校数与稳定性不如 WakeUp。
  - 竞品/替代：拾光课程表 ShiGuangSchedule（开源，921★） — 够用（Android）。无广告、Apache-2.0、小组件+提醒+勿扰、适配脚本仓库 170 forks 说明社区适配在运转；iOS 仍在开发中；仅覆盖社区已适配的学校。（https://github.com/ShiGuangSchedule/shiguangschedule）
  - 竞品/替代：轻屿课表 / 晴课表 / Sleepy / 嘎嘎课程表 / fkwakeup（2025-2026 开源 Android 课表） — 部分够用。均无广告、有小组件、活跃维护；轻屿 50★（HyperOS 超级岛、部分学校教务导入+ics 兜底），晴课表 62★，Sleepy 58★，嘎嘎/fkwakeup 用截图+AI 生成课表绕过教务适配问题。单个项目覆盖校数有限，但合起来说明这一子需求供给充足甚至过剩。（https://github.com/Mutx163/mikcb）
  - 竞品/替代：超级课程表 / 课程格子（商业 App） — 不够用于本簇诉求：功能完整、教务导入覆盖广，但广告与社交功能臃肿，正是簇内用户逃离的对象。
  - 竞品/替代：ICS 标准 + 系统日历（海外及部分国内高校） — 海外够用：Canvas/Moodle/TimeEdit/MyTimetable 等普遍提供 iCal 订阅，直接进 Apple/Google 日历小组件与提醒；国内各校有社区「教务→ics」脚本（NEU、BJTU、BUAA 等），但需手动运行。
- *crowd* → confirmed（7）：对簇内原始证据的审视：(1) 三条 evidence 的 quote 全是仓库 README 一句话简介（产品自述），没有一条是用户"想要但没有/现有的都不行"的原话；(2) ClassIsland 明确是"适用于班级多媒体屏幕"的 K-12 教室大屏工具，与"大学生手机课表导入"无关，其 2.8k★ 被误算进本簇；(3) 三条来源均为 GitHub 单一平台，independent_source_count=6 与实际列出的 3 条不符；(4) 互动只有 star 数，没有任何 issue 👍/评论级别的附和。就簇自带证据而言确实薄弱。

但独立在 github.com 复核后，人群广度得到充分证实：
- 抢课/蹲课侧：搜索"抢课"返回 589 个仓库，剔除无关刷榜仓库后仍有一长串不同作者、不同学校、跨 2016-2025 年的独立脚本：PKUAutoElective 768★/231 forks（补退选自动监控，"运行过程中不需要进行任何人为操作"）、HDU-KillCourse 289★（"蹲选课程…若有余量立即选课"）、SUSTech_Tools 264★、ZF_Spider 251★、sjtu-automata 251★、BUPTtakeCourse 205★、PageWatcher 111★（"监控网页内容改变…可以用于抢课"）、sysu 87★、SZU 86★、SEU
  - 竞品/替代：超级课程表 / 课程格子（商业 App） — 覆盖主流教务导入，但广告与社交功能臃肿；GitHub 上多款 2025-2026 新开源课表均以"无广告、极简"作反衬卖点，且存在 wakeup 去广告类仓库，说明用户对广告不满是真实的
  - 竞品/替代：WakeUp课程表 / 小爱课程表（轻量商业/厂商 App） — WakeUp 生态有大量各校导出脚本，但 GitHub 上存在"wakeup课程表 去广告"仓库（28★/15★）说明有广告；小爱课程表被开源作者评价"教务导入过于破烂"（WakeUp2XiaoAi）。主仓库 YZune/WakeUpSchedule_Kotlin 访问返回 404，当前是否开源不确定
  - 竞品/替代：拾光课程表 shiguangschedule — 开源无广告，一年 921★，适配仓 170 forks、约 100+ 校，基本解决课表导入+小组件；但适配靠社区脚本，仅 Android(Kotlin Multiplatform)，不含选课余量监控（https://github.com/ShiGuangSchedule/shiguangschedule）
  - 竞品/替代：Dawn-Course / 晴课表 / Sleepy 课程表（2026 新开源课表） — 各 49-62★，仅适配正方/强智/青果等少数系统或需网页/Excel 导入，功能仍在早期；说明课表导入需求在持续吸引新开发者，但未有一款成为通用解（https://github.com/HF-CYGG/Dawn-Course）
  - 竞品/替代：正方通用抢课脚本 Auto_courseGrabber — 972★，含"发现有余量"监控，但仅限正方教务，需浏览器控制台注入，非普通学生可用的 App，且有校规风险（https://github.com/ceilf6/Auto_courseGrabber）
  - 竞品/替代：各校专属抢课/蹲课脚本（PKUAutoElective、HDU-KillCourse、SUSTech_Tools、BNUCourseGetter、YNU-xk_spider 等数十个） — 每校一套、需 Python/配置文件、多数已停止维护（PKUAutoElective 2021 年停更），存在封号/IP 限流风险；没有任何跨校通用、面向非技术学生的余量提醒产品，这正是簇的 why_unsolved（https://github.com/zhongxinghong/PKUAutoElective）
- *buildable* → weak（4）：簇 C39 由两个子需求合并：(A) 教务课表一键导入+无广告小组件/提醒；(B) 选课余量监控/捡漏提醒或自动选上。两者可行性与风险截然不同，综合判定 weak。

1. MVP 可行性（1-3 人、2-6 周）
(A) 课表导入：可做，且技术路径成熟。标准做法（WakeUp课程表、拾光、轻屿均如此）是 App 内置 WebView 让学生自己登录本校教务系统→页面加载后注入 JS 抓取课表 DOM→解析为结构化 JSON（课程/星期/节次/周次/地点/教师）→本地存储→系统小组件（Android AppWidget、iOS WidgetKit 锁屏、HyperOS 超级岛、鸿蒙服务卡片）+ 本地上课通知 + .ics 导出。2026 年的真正差异化点是用 LLM 做"零适配"解析：把课表页 HTML/文本或课表截图（视觉模型）交给模型抽取，用户确认后入库，可绕过"数百种教务系统每校写脚本"的长尾问题；同时 拾光 shiguang_warehouse 适配脚本仓库为 MIT 许可，可合法复用一批现成适配。Flutter/Kotlin 单端 MVP 2-4 周可出；但 iOS 锁屏小组件必须原生 App（小程序做不了），且国内 App 上架需 ICP 备案+软著，行政周期 1-2 个月。
(B) 余量监控：技术上可做但只能按教务厂商逐个适配（正方新版 xkkc 查询接口、强智、青果
  - 竞品/替代：WakeUp课程表（YZune） — 国内最流行的第三方课表 App，免费、广告极少、桌面小组件、通过社区 JS 适配脚本在 WebView 内导入教务课表，适配高校据称上千所；基本已解决导入侧核心痛点。iOS 版本情况不确定。无余量监控功能。
  - 竞品/替代：拾光课程表 shiguangschedule — 开源（Apache-2.0）、无广告、极简，Android 8+，小组件/深色/WebDAV 备份/日历导出；教务导入靠 shiguang_warehouse（MIT，170 forks）中的社区适配脚本，桌面与 iOS 版仍在开发；无余量监控。921★，活跃更新。（https://github.com/ShiGuangSchedule/shiguangschedule）
  - 竞品/替代：轻屿课表 Mutx163/mikcb — Flutter/Dart Android 课表，HyperOS 超级岛、教务导入、云同步；50★，仍在活跃更新。功能与拾光/WakeUp 高度重叠。（https://github.com/Mutx163/mikcb）
  - 竞品/替代：cakeni/CourseSchedule、lingion/sleepy、HF-CYGG/Dawn-Course — 多款 2025-2026 年活跃的小型开源 Android 课表（40-60★），均主打教务网页/Excel 导入、小组件、提醒，说明导入侧已是拥挤的免费赛道。
  - 竞品/替代：ceilf6/Auto_courseGrabber — 正方教务浏览器控制台注入脚本，默认 2 秒轮询、并发选课、多校实测；972★。需 F12 手动粘贴，非产品形态；自带'仅供学习、遵守校规'免责，说明作者自知违规风险。（https://github.com/ceilf6/Auto_courseGrabber）
  - 竞品/替代：whliao5am/zfnew、vhyz/ZF_Spider、thcpdd/snatcher、helium777/bupt-course-grab — 分别针对正方（Python，含通知/选课）与强智（北邮）的抢课/爬虫脚本，44-251★，均为单厂商或单校、需自行部署，无跨校通用产品。

**用户原话 / 关键证据**：
> Auto_courseGrabber一年972★默认2秒轮询余量
> 拾光课程表一年921★「开源、无广告、极简」适配仓170 forks约100+校；「WakeUp课程表 去广告」28★

**证据链接**：
- [] https://github.com/ClassIsland/ClassIsland — "一款功能强、可定制、跨平台，适用于班级多媒体屏幕的课表信息显示工具"（2,828 stars）
- [] https://github.com/ceilf6/Auto_courseGrabber — 正方教务系统自动抢课脚本（多省市高校实测）：并发选课、课程名/课号检索、时间/教师筛选、换课…（972 stars / 60 forks）
- [] https://github.com/ShiGuangSchedule/shiguangschedule — "一款开源、无广告、极简的课程表 APP，支持教务导入"；"面向中国高校师生的课程表管理工具…（921 stars（一年））
- https://github.com/search?q=%E6%8A%A2%E8%AF%BE&type=repositories&s=stars&o=desc

**产品概念**：极简课表App：App内WebView登录本校教务，LLM解析课表页或截图零适配导入

**MVP 范围**：3-5周：WebView+LLM解析

**风险**：导入侧已被WakeUp/拾光/系统课表解决增量小

### 17. 听歌用户要免费无广告一站听全并迁移歌单（C02，总分 5）

**一句话**：合法切片歌单管家：把网易云/QQ歌单迁到Apple

**用户与场景**：大陆听歌用户、转向本地。版权分裂被迫装3个App各买会员忍广告，歌单大量灰歌不能播

**现有方案及不足**：各平台VIP、洛雪54k★（抽源）、MusicFree 27.1k★

**为何至今没解决**：版权独占与会员模式使合法一站式无广告不成立

**验证结论**：unmet=weak(4) crowd=confirmed(7) buildable=refuted(3)

- *unmet* → weak（4）：簇 C02 实际由三个子需求组成，各自的"已解决程度"差异很大，综合后只能判 weak。

(1) 歌单跨平台搬家：基本已解决，不构成机会。国内三大平台都内置了"导入外部歌单"（网易云支持 QQ/酷狗/酷我 链接、文字、截图识别；QQ音乐支持网易云链接；汽水音乐支持网易云/QQ 链接），Apple Music 2025 年起内置"从其他服务转移音乐"（SongShift 合作）。开源侧 Bistutu/GoMusic 2.5k★，免费托管站 music.unmeta.cn，覆盖 网易云/QQ/汽水 → Apple/YouTube/Spotify；LocalMusicHelper 405★ 覆盖 网易/QQ/酷狗/酷我/汽水/Spotify → 椒盐/APlayer/Poweramp 本地播放器；海外还有 TuneMyMusic/Soundiiz/FreeYourMusic/SongShift 等成熟商业工具。残余痛点只是匹配准确率和免费额度（TuneMyMusic 免费约 500 首），而 GoMusic 去 Apple/Spotify 那一步仍要借道 TuneMyMusic/Spotlistr，说明"一键"在国内→海外链路上仍有一次跳转。

(2) 免费无广告的聚合播放器：方案极多、star 极高（洛雪 54k★、YesPlayMusic 33.3k★、MusicFree 27.
  - 竞品/替代：网易云音乐 / QQ音乐 / 汽水音乐 内置"导入外部歌单" — 平台自带（网易云支持 QQ/酷狗/酷我 链接、文字、截图识别；QQ音乐支持网易云链接；汽水音乐支持网易云/QQ 链接），免费、无需第三方，覆盖国内平台之间的歌单搬家。局限：匹配靠曲名+歌手，目标平台没版权的歌导入后仍是灰色；平台不提供反向"导出"。对"迁移歌单"子需求基本够用。
  - 竞品/替代：Apple Music "从其他音乐服务转移音乐"（SongShift 合作，2025 起） — 官方内置，从 Spotify/YouTube Music/Amazon 等迁入 Apple Music，免费。不覆盖国内平台作为源（不确定是否支持网易云/QQ）。海外迁移场景够用。
  - 竞品/替代：Bistutu/GoMusic — 2.5k★，免费开源，托管站 music.unmeta.cn；网易云/汽水/QQ → Apple/YouTube/Spotify。缺陷：去海外平台那一步仍要借道 TuneMyMusic/Spotlistr，迁回网易云/QQ 需手动；依赖平台非公开接口。对国内→海外迁移基本够用。（https://github.com/Bistutu/GoMusic）
  - 竞品/替代：TuneMyMusic / Soundiiz / FreeYourMusic / SongShift（商业迁移服务） — 海外成熟商业方案，支持几十个平台互转；TuneMyMusic 免费额度约 500 首，Soundiiz 免费版限量，FreeYourMusic 收费。是否直接支持网易云/QQ 作为源：不确定（GoMusic 走的是导出文本再喂给它们）。海外用户够用，国内用户需组合工具。
  - 竞品/替代：Winnie0408/LocalMusicHelper — 405★，安卓，网易/QQ/酷狗/酷我/汽水/Spotify → 椒盐/APlayer/Poweramp 本地播放器歌单。只做歌单转换不做播放，且部分平台无 root 无法完整读取。覆盖"转向本地曲库"的细分需求。（https://github.com/Winnie0408/LocalMusicHelper）
  - 竞品/替代：MusicFree（+ MusicFreeDesktop + 社区插件仓库） — 27.1k★（桌面 8.9k★），免费无广告，活跃维护（13 天前更新）。但官方明确不集成任何音源，示例插件过滤 VIP/付费歌曲，能否"听全"完全取决于第三方插件（qwerwhr 76 插件订阅源 126★ 等），插件失效类讨论 0 回复，导入歌单后整单不能播的 issue 存在；iOS 无法上架。是目前最接近的方案但不稳定、不合法。（https://github.com/maotoumao/MusicFree）
- *crowd* → confirmed（7）：对簇内 evidence 数组本身的审视（偏弱）：(1) 三条引文没有一条是用户在说"我想要但没有"——#1912 是作者公告，另两条是 README 一句话简介，属于产品描述被当作需求引用；(2) 三条里两条来自同一作者/同一仓库（lyswhut/lx-music-desktop），YesPlayMusic 是另一作者但它是网易云单平台第三方客户端，与"一站聚合"只部分相关；平台栏写了 appinn.com 但 evidence 里没有任何 appinn 条目，independent_source_count=28 在可见证据里无法复核；(3) 互动可见：54k/33k star、#1912 88 评论、#1643 220 评论，但公告帖 👍558/❤173 无法通过可访问渠道核实（GitHub 页面在本环境不渲染 reaction 数），只能间接确认 #5/#1643/#1912 是该仓库按 👍 排序的前三名。"MusicFree 最高票讨论求 Spotify 源插件"部分失真：实际最高票是"求插件"（16 赞、0 回复、未回答），"歌单导入限 500 首"未能核实。

但用 GitHub 做独立复核后，"只是极少数人的个别需求"这一反驳不成立：(4) 常识上，大陆版权分裂（腾讯系/网易云/汽水）导致"灰色歌曲""装三个 App 买三份会员"是十年来反复出现的大众抱怨，2021
  - 竞品/替代：洛雪音乐 lx-music-desktop / lx-music-mobile — 54k+18.5k star，但 2023-10 收腾讯警告后抽掉全部内置源，只剩本地播放+自定义源；用户靠互传音源脚本维持，源周期性失效，非官方且法律灰色（https://github.com/lyswhut/lx-music-desktop）
  - 竞品/替代：MusicFree / MusicFreeDesktop — 27.1k+8.9k star，插件制、自身不带音源；可用性完全取决于第三方插件，最高票讨论'求插件'无人回答，无 iOS 上架（https://github.com/maotoumao/MusicFree）
  - 竞品/替代：YesPlayMusic + UnblockNeteaseMusic — 33.3k star，仅网易云单平台的第三方客户端；灰色歌曲靠 UNM 代理替换，YouTube 源需自装 yt-dlp，Web 版不支持（https://github.com/qier222/YesPlayMusic）
  - 竞品/替代：UnblockNeteaseMusic — 17.3k star，需自建代理并配置证书/系统代理，门槛高；只解决网易云灰色歌曲，不解决多平台聚合与歌单迁移（https://github.com/nondanee/UnblockNeteaseMusic）
  - 竞品/替代：Listen1（Chrome 扩展/桌面） — 12.1k+11.4k star，七平台聚合搜索+自动换源；桌面版 934 个 open issue，接口频繁失效，无移动端官方版本（https://github.com/listen1/listen1_desktop）
  - 竞品/替代：any-listen — 4.1k star，洛雪作者的合规替代方案，只做本地/WebDAV 自建曲库，不再解决'一站听全网'（https://github.com/any-listen/any-listen）
- *buildable* → refuted（3）：【结论】核心痛点"免费、无广告、一站听全网、灰色歌全放出来"本质是版权许可与平台商业模式问题，不是软件缺口；能用软件在几周内做出来的那一版（聚合非公开音源/B站音频/解锁灰色歌）恰恰就是洛雪、listen1、MusicFree、UnblockNeteaseMusic 已经做了并被腾讯警告信打掉/半地下化的东西——属于明确的灰色→违法地带；而完全合法的子集（歌单迁移、本地/自建曲库管理）已有免费开源方案且付费意愿极低。因此判 refuted，给 3 分（保留 3 分是因为"歌单迁移"这一合法小切片确实可在 1-2 周做出）。

【1. MVP 可行性与技术路径】
- 灰色版 MVP（1-3 人、2-3 周完全能做）：Electron/RN/Web 播放器 + 聚合搜索（酷我/酷狗/咪咕/网易/QQ 的非公开接口或 B站音频流）+ 解析分享链接导入歌单 + 灰色歌自动换源。技术上零门槛（GitHub 上 MusicFree 插件协议、UNM 的 provider 代码、GD Studio 在线音乐 API 都是现成的，otter-music 426★ 就是这么拼出来的）。但这条路径 = 绕过平台技术措施 + 侵犯信息网络传播权，见第 2 点。
- 合法版 A（歌单迁移工具，1-2 周可做）：读取网易云/QQ/汽水的公开分享链接（半公开歌单接口）→ 曲目文本匹配（歌名+歌手+时长模糊匹配
  - 竞品/替代：lx-music-desktop (洛雪音乐) — 54k★/1282 open issues。2023-10 收腾讯警告信后移除全部内置音源，转向本地播放器与自建私有云新项目 any-listen；用户靠互传自定义音源脚本续命。证明灰色聚合路径在法律压力下不可持续。（https://github.com/lyswhut/lx-music-desktop）
  - 竞品/替代：MusicFree / MusicFreeDesktop — 27k★ + 8.9k★。插件制把音源责任推给插件作者；官方 PluginsHub（3.2k★）已 archived；换源、聚合搜索等 feature 请求（#238/#396/#563）长期 open 且反应数很低。仍属灰色。（https://github.com/maotoumao/MusicFree）
  - 竞品/替代：UnblockNeteaseMusic / server — 17k★ + 7.8k★。通过本地代理为网易云灰色歌曲换源，直接解决'歌单放不出来'痛点，但需配代理、依赖非公开接口，灰色地带。（https://github.com/UnblockNeteaseMusic/server）
  - 竞品/替代：listen1_desktop — 11.4k★/958 open issues，'one for all free music in china'，源频繁失效，维护乏力。（https://github.com/listen1/listen1_desktop）
  - 竞品/替代：YesPlayMusic — 33k★，第三方网易云客户端（无广告、高颜值），单平台，灰色歌需配 UNM；不解决跨平台一站听全。（https://github.com/qier222/YesPlayMusic）
  - 竞品/替代：sunzongzheng/music — 2.6k★，Electron 聚合播放器，支持一键导入平台歌单，已 archived——又一个死掉的聚合器。（https://github.com/sunzongzheng/music）

**用户原话 / 关键证据**：
> 洛雪lx-music-desktop 54.0k★；#1643（220评论）2023-10收腾讯移除通知
> 围绕免费/聚合/复活灰歌至少8位作者合计>190k★；lx-ikun-music-sources

**证据链接**：
- [] https://github.com/lyswhut/lx-music-desktop/issues/1912 — LX Music 项目发展调整与新项目计划 —— 软件本身只是一个可以播放本地歌曲的播放器…（👍558，❤173，88 评论；仓库 54k star）
- [] https://github.com/lyswhut/lx-music-desktop — "一个基于 Electron 的音乐软件"；免责声明"本项目内置的包括酷我、酷狗…（53,969 stars / 7,037 forks …）
- [] https://github.com/qier222/YesPlayMusic — "高颜值的第三方网易云播放器，支持 Windows / macOS / Linux"（33,327 stars / 652 open iss…）
- https://github.com/lyswhut/lx-music-desktop/issues/1643
- https://github.com/Bistutu/GoMusic

**产品概念**：只做合法切片：读取网易云/QQ/汽水公开分享链接，按歌名+歌手+时长模糊匹配

**MVP 范围**：1-2周1人：分享链接解析→Spotif

**风险**：buildable被反驳(3)：核心"免费无广告一站听全"是版权与商业模式问题

### 18. 手机用户要装上即用的开屏/摇一摇广告屏蔽（C06，总分 5）

**一句话**：给爸妈配机的零配置Android开屏跳过器：内置规则

**用户与场景**：国产安卓用户、为长辈配机的家庭。打开国产App看3-5秒开屏，摇一摇误触跳淘宝京东

**现有方案及不足**：GKD 42.3k★（无规则、HyperOS失效not planned

**为何至今没解决**：开屏与跳转是厂商核心收入，SDK持续对抗；无障碍权限被收紧

**验证结论**：unmet=weak(4) crowd=confirmed(7) buildable=refuted(3)

- *unmet* → weak（4）：结论：Android 主流场景（开屏/弹窗跳过）已有成熟、免费、口碑好且仍在活跃维护的方案，簇里"规则订阅仓库归档、规则维护中断"的判断被 GitHub 实况部分推翻；但"装上即用、零配置、老人儿童、摇一摇/支付后跳转、iOS/鸿蒙"这组核心诉求确实没有像样的覆盖，且未覆盖的原因是平台封锁与法律压力，而非没人做。综合判为 weak，偏低分。

(1) Android 上的方案够用：GKD 42.3k★，2026-09-26 仍在推送，13 个 open issue，官方立场"默认不提供规则"是主动规避法律风险的设计。第三方订阅并未死：AIsouler 12k★ 仓库 2026-02 归档后，Lin-arm 续更 Fork 5.5k★（978 个 App / 2436 规则组，每日自动发版，2026-09-26 仍更新），另有 ganlinte 866★（610 App / 1389 规则组）、MengNianxiaoyao 464★，均活跃。SKIP 3.7k★ 自带常见 App 规则、17 天前有提交，接近"装上即用"。Android-Touch-Helper 5.3k★ 关键词匹配无需规则、上架 Google Play/F-Droid，2026-09-22 仍有推送。对愿意开无障碍+粘一个订阅链接的 Android 用户，这个问题基本已解决。

(2) 明显缺口（支撑 weak
  - 竞品/替代：GKD (gkd-kit/gkd) + 社区订阅 (Lin-arm/GKD_subscription, ganlinte, MengNianxiaoyao) — Android 上最成熟方案：42.3k★、免费开源、2026-09 仍活跃；订阅生态未死，Lin-arm Fork 5.5k★ 覆盖 978 App/2436 规则组且每日自动发版，比归档的 AIsouler 更全。对会开无障碍+粘订阅链接的用户已足够。不足：默认无规则（作者规避法律风险）、需手动关厂商电池优化/后台锁定、HyperOS 3/4 与微信新版本频繁失效且维护者一律 not planned、无障碍会触发银行 App 拒登、iOS 请求被拒、鸿蒙 NEXT 无法运行、传感器摇一摇无法拦截。不是'装上即用'。（https://github.com/gkd-kit/gkd）
  - 竞品/替代：SKIP (GuoXiCheng/SKIP) — 3.7k★，自带常见 App 开屏规则，最接近'装上即用'，17 天前仍有提交。不足：只做开屏跳过，不管弹窗/摇一摇/支付后跳转；坐标规则绑定设备分辨率；64 个 open issue；仅 GitHub 发布无应用商店渠道。（https://github.com/GuoXiCheng/SKIP）
  - 竞品/替代：Android-Touch-Helper / AdSkip (zfdang) — 5.3k★，关键词识别'跳过'按钮无需规则、上架 Google Play 和 F-Droid，是真正零配置的方案。但作者已声明无精力维护并推荐 GKD，华为/小米上失效或卡死的 issue 长期 open；国内用户装 Play 版也不便。（https://github.com/zfdang/Android-Touch-Helper）
  - 竞品/替代：李跳跳 (闭源) + 社区自定义规则 — 曾是最流行的零配置方案，2.2 版停在 2023-05，开发者收到腾讯律师函后停更（此为我的知识，GitHub 备份仓库只显示 2023-08 停止分发）。老版本仍可用但新 App/新系统规则由社区 743859910 仓库补丁维持（920★，2025-12 更新），小米15+Android16 上已不可用。停更方案，不够用。（https://github.com/eddlez/litiaotiao_package_backup）
  - 竞品/替代：轻启动 / 一指禅 等付费闭源无障碍跳过器 — 我确知存在（酷安生态、一次性付费几元），但当前是否仍维护、对 HyperOS 4/微信新版是否有效不确定。同样依赖无障碍与规则维护，不能解决 iOS/鸿蒙与摇一摇。
  - 竞品/替代：HyperCeiler 等 Xposed/LSPosed 模块 — 5.4k★活跃，但只处理 HyperOS 系统级广告/功能增强，需 root+LSPosed，且不覆盖第三方 App 开屏广告。普通/老人用户不可行。（https://github.com/ReChronoRain/HyperCeiler）
- *crowd* → confirmed（7）：对簇内 evidence 的审视：(1) 三条引文全是供给侧文本——GKD README 的功能说明、墨鱼仓库的关键词式 description、AIsouler 仓库的归档说明——没有一条是用户"想要但没有/现有都不行"的原话，属于把产品说明当需求引文；(2) 三个作者不同，但 AIsouler 是 GKD 的下游规则仓库，与 GKD 属同一生态，platforms 写了"微博"却没有任何微博证据，independent_source_count=18 无法从 evidence 数组核实；(3) 互动可见且很大：42.3k/13.6k/12k star，但 issue 层面附和极少——GKD 中最高赞的失效类 issue #847"小米15部分app开屏广告无法跳过"仅 1 个👍，#1449"HyperOS 4 对微信无效"、#1237"更新澎湃3.0以后不能跳广告" 均 0 评论即被 not planned 关闭；描述中"338 个 closed-not-planned"我未能核实（页面只看到最近十几条），标为不确定。(4) 常识判断：国产 App 开屏广告与摇一摇跳转是中国手机用户最普遍、反复被投诉的体验问题之一（李跳跳 2023 年因下架事件破圈、摇一摇灵敏度曾进入行业标准与监管讨论），"全体国内手机用户"的受众定位不夸张；但描述中"2026 年监管整治后开屏广告消失"我无
  - 竞品/替代：GKD (gkd-kit/gkd) — 42.3k★，功能最强的无障碍点击器，但不自带规则（官方默认订阅 2024-04 归档），需自找第三方订阅；用户在 HyperOS/澎湃 3.0/4.0 上的失效 issue 被直接 not planned 关闭；非'装上即用'（https://github.com/gkd-kit/gkd）
  - 竞品/替代：AIsouler/GKD_subscription 及社区续更 Lin-arm/GKD_subscription — 最主流规则源，原仓库 12k★ 于 2026-02 因维护者耗尽归档；续更 Fork 10 个月 5.5k★，覆盖 978 个 App，但仍是个人志愿维护、随时可能再次中断（https://github.com/Lin-arm/GKD_subscription）
  - 竞品/替代：SKIP (GuoXiCheng/SKIP) — 3.7k★，定位更接近'装上即用'的开屏跳过，但 64 个 open issue 中大量是具体 App/机型无法跳过、需要用户自己写规则（https://github.com/GuoXiCheng/SKIP）
  - 竞品/替代：李跳跳（闭源，仅 GitHub 备份） — 曾是最出名的傻瓜式方案，闭源且已停止公开分发，只剩 2.6k★ 的 APK 备份和 920★ 的自定义规则仓库，无法持续适配新 App（https://github.com/eddlez/litiaotiao_package_backup）
  - 竞品/替代：HyperCeiler (ReChronoRain/HyperCeiler) — 5.4k★ Xposed 模块，需 root/LSPosed，只覆盖小米 HyperOS，普通用户与长辈儿童机不可用（https://github.com/ReChronoRain/HyperCeiler）
  - 竞品/替代：墨鱼去广告规则 (ddgksf2013) — 13.6k★，基于 QuantumultX/Shadowrocket/Clash 的网络层去广告，需付费代理 App 与配置能力，门槛高，且无法拦截摇一摇这类本地传感器触发（https://github.com/ddgksf2013/ddgksf2013）
- *buildable* → refuted（3）：【1. MVP 可做性】只有「安卓非 root 开屏跳过」这一子集能在 2-4 周内由 1-3 人做出：Kotlin AccessibilityService + 文本/ID/坐标匹配「跳过」按钮 + 内置规则包（SKIP 的 skip_config_v3.yaml、GKD 选择器语法均开源可参考），再加「检测到前台从 App A 突然切到淘宝/京东/拼多多时自动 GLOBAL_ACTION_BACK」的事后补救。但簇的真正核心诉求（2026 整治后开屏基本消失，剩下的是摇一摇、微信支付完成页跳转、弹窗、老人儿童误触、覆盖 iOS/鸿蒙）在软件层面无非 root 路径：摇一摇由广告 SDK 在目标 App 进程内读加速度计触发，AOSP 没有按 App 拒绝加速度计的权限模型（开发者选项「传感器关闭」是全局的），无障碍服务只能在跳转发生后按返回，广告点击已计费且用户仍看到闪跳；真正拦截只有 Xposed/LSPosed hook SensorManager（fuck_shake，100★，需 root）或 Device Owner 冻结购物 App（rule_imprison_android，17★，需 ADB 激活、影响正常使用）。微信支付完成页摇一摇是微信自身行为，非 root 无解。iOS 无任何第三方 UI 自动化接口，只能 VPN/DNS 级（QuantumultX/墨鱼
  - 竞品/替代：GKD (gkd-kit/gkd) — 42.3k★，无障碍+CSS 式选择器+订阅规则，Android only，默认不带规则；13 open issue，HyperOS 4 对微信无效/鸿蒙支持/iOS 均 closed not planned（https://github.com/gkd-kit/gkd）
  - 竞品/替代：SKIP (GuoXiCheng/SKIP) — 3.7k★，无障碍+关键词匹配跳过按钮，自带默认规则 skip_config_v3.yaml，64 open issue；坐标规则只对采集设备分辨率有效（https://github.com/GuoXiCheng/SKIP）
  - 竞品/替代：AIsouler/GKD_subscription — 12k★/494 fork，覆盖 886 个 App、2074 规则组，2026-02-13 维护者倦怠归档，规则供给中断（https://github.com/AIsouler/GKD_subscription）
  - 竞品/替代：gkd-kit/subscription (官方默认订阅) — 2.9k★，2024-04-19 归档只读，官方不再提供规则（https://github.com/gkd-kit/subscription）
  - 竞品/替代：fuck_shake (pwh-pwh) — 100★，Xposed 模块按 App 屏蔽摇一摇，需 root/LSPosed，普通用户不可用（https://github.com/pwh-pwh/fuck_shake）
  - 竞品/替代：rule_imprison_android (Kingtous) — 17★，Device Owner+无障碍冻结购物 App 防摇一摇跳转，需 ADB 激活且影响正常使用（https://github.com/Kingtous/rule_imprison_android）

**用户原话 / 关键证据**：
> GKD 42.3k★但「默认不提供规则」；最大订阅AIsouler 12,010★ 2026-02因维护者热情耗尽归档
> GKD #1449「HyperOS 4对微信无效」、#1247/#1063/#1405全部closed as not

**证据链接**：
- [] https://github.com/gkd-kit/gkd — "某些软件可能在启动时存在一些烦人的流程, 这个软件可以帮你点击跳过这个流程"；（42.3k star；13 open / 338 cl…）
- [] https://github.com/ddgksf2013/ddgksf2013 — "墨鱼去广告计划 \| QuantumultX 去广告 \| 去开屏广告 \| 应用净化 \| 会员解锁…"（13,634 stars）
- [] https://github.com/AIsouler/GKD_subscription — GKD 第三方订阅规则（仓库已 archived，规则维护中断）（12,010 stars / 495 forks）
- https://github.com/gkd-kit/gkd/issues/1449

**产品概念**：Kotlin AccessibilityService+内置规则包（复用SKIP/GKD语法

**MVP 范围**：2-4周：无障碍+规则包+文本跳过

**风险**：buildable被反驳(3)：开屏跳过已被GKD/SKIP免费覆盖且监管整治后开屏基本

### 19. 做饭者要结构化可检索菜谱与今天吃什么决策（C09，总分 5）

**一句话**：基于HowToCook公域语料的结构化中文菜谱库+按食材

**用户与场景**：自己做饭的年轻人、双职工父母。"今天吃什么"决策疲劳与记热量割裂；菜谱App广告多步骤不严谨按食材找菜难

**现有方案及不足**：下厨房/豆果（广告UGC）、薄荷/Keep（弹窗会员）

**为何至今没解决**：商业产品靠广告电商会员变现；HowToCook维护者坚持Markdown

**验证结论**：unmet=weak(4) crowd=weak(5) buildable=confirmed(7)

- *unmet* → weak（4）：该簇是"结构化菜谱库 + 按食材/忌口检索 + 采购清单/换算 + 今天吃什么决策 + 无广告饮食记录 + 小票反推"的组合式诉求。拆开看，其中"菜谱管理"这半边在海外已被成熟方案很好覆盖：Mealie（13.3k★，2026-09-24 刚发 v3.28.0，每周发版；URL/AI 导入、schema.org 结构化、分类/标签/工具、按规则随机排餐、购物清单、REST API、35+ 语言含中文）、Tandoor（8.6k★，v2.6.15 2026-09；全文检索、AI 识图/排步骤/找营养、排餐、购物清单）、Grocy（9.5k★，库存+条码+"what can I cook with what I have"）、Cooklang/cookcli（1.4k★，纯文本结构化菜谱语言，换算、购物清单、pantry、营养标签，iOS/Android 官方 app）、KitchenOwl（3.7k★，原生移动端）；商业侧 Paprika（一次性付费无广告、口碑好）、Samsung Food/Whisk、SuperCook（按现有食材找菜）等口碑稳定。"今天吃什么"在 HowToCook 生态里也已有 AI 可调用方案：HowToCook-mcp（773★，活跃）直接暴露 whatToEat / recommendMeals（支持过敏原、忌口、人数），加上通用 LLM（ChatGPT
  - 竞品/替代：Mealie（自托管菜谱管理+排餐） — 海外最成熟的开源方案：13.3k★、每周发版（v3.28.0 2026-09-24）、URL/AI 导入、schema.org 结构化、分类/标签/工具、planner rules 随机排餐、购物清单、食材替代、REST API、含中文界面。对'结构化可检索菜谱+采购清单'够用；但需 Docker 自托管、无中文菜谱语料需自建、无饮食日记、无小票识别、'今天吃什么'只是规则随机而非基于口味历史。（https://github.com/mealie-recipes/mealie）
  - 竞品/替代：Tandoor Recipes — 8.6k★、v2.6.15 2026-09 活跃；全文检索、AI 识图/排步骤/找营养、排餐、购物清单、多语言。菜谱管理层面够用；同样需自托管、333 open issues、许可证争议（AGPL+Commons Clause）、无饮食记录闭环。（https://github.com/TandoorRecipes/recipes）
  - 竞品/替代：Grocy — 9.5k★，库存/条码/购物清单/排餐/'what can I cook with what I have'，最接近'按现有食材反推能做的菜'。但 UI 偏 ERP 复杂、需自托管、小票 OCR 请求（#404）自 2019 年开着无维护者回应、无营养记录。（https://github.com/grocy/grocy）
  - 竞品/替代：KitchenOwl — 3.7k★，原生 iOS/Android/F-Droid 客户端，购物清单实时同步+菜谱+排餐+家庭记账。轻量易用，但无按食材推荐、无营养、需自托管服务端。（https://github.com/TomBursch/kitchenowl）
  - 竞品/替代：Cooklang / cookcli — 1.4k★，正是 HowToCook #60 想要的'像代码一样的结构化菜谱语言'：换算、购物清单、pantry、营养标签、iOS/Android 官方 app。缺中文语料与社区，面向程序员，不做决策与饮食记录。（https://github.com/cooklang/cookcli）
  - 竞品/替代：HowToCook + HowToCook-mcp — HowToCook 102k★ 提供 ~500 道中文精确菜谱；HowToCook-mcp 773★ 让 AI 直接调用 whatToEat/recommendMeals（支持过敏原、忌口、人数）。对程序员的'今天吃什么'基本够用。缺陷：纯 Markdown、无成品图（#65 自 2022 无回应）、无标签（#3 自 2020）、无结构化 schema（#60 仅 open discussion）、无库存/采购/饮食记录。（https://github.com/worryzyy/HowToCook-mcp）
- *crowd* → weak（5）：簇内证据审视：(1) evidence 仅 3 条，全是 GitHub；platforms 写了"小红书"、description 引用"薄荷app害死人"问答线程，但 evidence 数组里没有任何小红书/问答条目，无法核验；independent_source_count=16 与 3 条证据严重不符。(2) 3 条中 2 条来自同一仓库 HowToCook（仓库本体 + issue #60），实际独立来源 1 个；第 3 条 tastejs/awesome-app-ideas 是"练手 App 点子清单"（Recipes app 只是其中一个条目），不是用户表达"想要但没有"，属于典型误读。(3) HowToCook 102k star 只能证明"干净精确、无广告的菜谱文本"受欢迎，不能直接证明"结构化检索 + 今天吃什么决策 + 饮食记录"这套组合诉求。(4) issue #60 已核实：2022-02 开、仍 open、标签 open discussion，原文"使用规范定义的标记语言、JSON 或 yaml 来定义每一个菜谱……便于程序对菜谱做更深入的处理"——诉求角度是程序员想机器可读，不是消费者抱怨现有 App；页面显示"Reactions are currently unavailable"，簇里写的"👍105、59 评论"无法核实，按 reactions 排序
  - 竞品/替代：Mealie — 13.3k star，结构化菜谱、URL 导入、按规则随机排餐、购物清单，覆盖'结构化可检索+替我决定'大半；需自部署，中餐数据/中文热量库弱（https://github.com/mealie-recipes/mealie）
  - 竞品/替代：Tandoor Recipes — 8.6k star，菜谱管理+排餐+购物清单，成熟；无库存反推、无饮食记录（https://github.com/TandoorRecipes/recipes）
  - 竞品/替代：Grocy — 9.5k star，库存/条码/排餐，最接近'按现有食材做菜'；无小票识别，学习成本高（https://github.com/grocy/grocy）
  - 竞品/替代：KitchenOwl — 3.7k star，移动端购物清单+菜谱+排餐，README 明写'get suggestions on what you want to cook'；无营养记录（https://github.com/TomBursch/kitchenowl）
  - 竞品/替代：HowToCook 及其 web/小程序衍生 — 102k star 纯 Markdown，干净精确无广告；结构化(#60)/成品图(#65)/标签(#3) 多年 open discussion 未落地，搜索/食材反查 issue 0 互动（https://github.com/Anduin2017/HowToCook）
  - 竞品/替代：liu-ziting/what-to-eat（一饭封神） — 3.5k star，AI 生成中餐菜谱+营养分析，直接对'今天吃什么'；生成式而非结构化库，无饮食记录（https://github.com/liu-ziting/what-to-eat）
- *buildable* → confirmed（7）：## 1. 小团队 2-6 周能否做出真正解决核心痛点的 MVP：能（1-2 人，3-4 周）

核心痛点拆解为三件事：(a) 结构化可按食材/忌口/难度/时间检索的菜谱库；(b) 基于现有食材+餐次+口味历史的"今天吃这个"决策；(c) 顺手、无广告的饮食记录。三件全是软件可消除的，且关键原料已在公域：

- **数据源零版权风险**：HowToCook（102,352 stars / 11,101 forks，GitHub 实测 2026-09-27）LICENSE 为 Unlicense（公有领域，实测确认），数百道中餐菜谱，Markdown 结构高度一致（必备原料和工具 / 计算 / 操作 / 附加内容，难度用星级标注，"计算"段自带按人数换算公式）。把它 ETL 成严格 schema（ingredient{name,qty,unit}、steps[]、time、difficulty、allergens、tags）已被多方证明可行：worryzyy/HowToCook-mcp（773 stars，2025-04 创建）已解析成 all_recipes.json 并提供"按分类查""不知道吃什么""按过敏/忌口周菜单"工具；HowToCook issue #766 有个人写的菜谱转 JSON 脚本。用 LLM 批量做一次性归一化（几百道菜、几美元成本、1-2 天），再加 20
  - 竞品/替代：Anduin2017/HowToCook — 102,352 stars / 466 open issues，Unlicense 公有领域。数据源而非产品：纯 Markdown，无结构化检索、无库存/周菜单/记录。issue #60（结构化 YAML/JSON）自 2022-02 挂 open discussion，105👍/59 评论，维护者未采纳——治理问题而非技术问题。（https://github.com/Anduin2017/HowToCook）
  - 竞品/替代：worryzyy/HowToCook-mcp — 773 stars，已将 HowToCook 解析为 all_recipes.json，提供按分类查、指定菜谱、按过敏/忌口周菜单、'不知道吃什么'工具。证明 ETL 与 AI 可调用形态可行；但无 UI、无食材库存/口味历史/饮食记录，README 自述'慎用这个--上下文太大'。（https://github.com/worryzyy/HowToCook-mcp）
  - 竞品/替代：LeeJim/HowToCookOnMiniprogram — 753 stars，HowToCook 小程序阅读器。只解决'手机上看'，无结构化检索、决策、记录。（https://github.com/LeeJim/HowToCookOnMiniprogram）
  - 竞品/替代：Decade-qiu/CookHero — 630 stars，Apache-2.0，2025-11 创建。功能最接近本簇（RAG over HowToCook + 周饮食计划 + AI 饮食记录 + 营养分析），但需 Postgres+Redis+Milvus+MinIO+Etcd 全家桶自部署，35 open issues，面向开发者而非普通做饭者。证明可行性，不构成消费级替代。（https://github.com/Decade-qiu/CookHero）
  - 竞品/替代：liu-ziting/what-to-eat（一饭封神） — 3,549 stars。LLM 即时生成菜谱 + 营养分析 + AI 效果图，需用户自带 OpenAI 兼容 API key，作者自述'不同模型生成质量差异巨大'。无持久化结构库、无库存/历史/记录，不解决'精确可复现'诉求。（https://github.com/liu-ziting/what-to-eat）
  - 竞品/替代：renchenxuan/Umami（膳待家） — 227 stars，MIT，本地优先：拍冰箱出菜谱、记三餐、体重打卡。形态最接近'轻决策+无广告记录'，但 BYO API key、bun run dev 自启动、无结构化菜谱库，仍是开发者玩具。（https://github.com/renchenxuan/Umami）

**用户原话 / 关键证据**：
> HowToCook 102,352★ #60「用JSON或yaml定义每一个菜谱」👍105/59评论
> 小红书「薄荷app害死人」；推荐替代品时「小弹窗广告较少（目前为0）」竟成卖点

**证据链接**：
- [] https://github.com/Anduin2017/HowToCook/issues/60 — 使用规范定义的标记语言、JSON 或 yaml 来定义每一个菜谱。（👍105 😄15，59 评论；仓库 102.4k st…）
- [] https://github.com/Anduin2017/HowToCook — 程序员在家做饭方法指南 / Programmer's guide about how to coo…（102,351 stars / 11,101 fork…）
- [] https://github.com/tastejs/awesome-app-ideas — Recipes app — Cooking instructions and ingredient…（5.7k stars）
- https://github.com/mealie-recipes/mealie

**产品概念**：PWA+小程序+MCP server：把HowToCook（公有领域

**MVP 范围**：3-4周1-2人：ETL+词典+检索

**风险**：crowd仅weak(5)：3条证据2条同仓库1条点子清单

### 20. 办公学生要免费离线批量OCR含表格Mac版（C20，总分 5）

**一句话**：macOS原生、免费离线、批量、含表格→Excel与忽略区域

**用户与场景**：学生科研人员、行政财务文员。想批量把截图/扫描件/PDF/表格识别成可编辑文本/Excel且不上传不限次

**现有方案及不足**：Umi-OCR 47.5k★（Win/Linux）

**为何至今没解决**：大厂把OCR做云服务变现；开源主力绑在Win/Linux

**验证结论**：unmet=weak(4) crowd=weak(5) buildable=confirmed(7)

- *unmet* → weak（4）：拆解需求：免费+离线+批量+表格结构还原+排除页眉页脚水印+Mac+非技术用户可用的 GUI。逐项核实（GitHub 实查 + 自有知识）：

1) 功能层面早已被成熟开源方案覆盖，且都能在 Mac 上跑：MinerU（80.7k★，README 明写支持 Linux/macOS/Windows、Apple Silicon/CPU-only 可用）、Docling（68k★，MIT，"Works on macOS, Linux and Windows… x86_64 and arm64"，表格结构、离线/air-gapped、可用 ocrmac 调 Apple Vision）、Marker（40k★，"works on GPU, CPU, or MPS"，"Removes headers/footers"，自带 streamlit 界面）、PaddleOCR PP-StructureV3（90k★，linux/win/mac，PDF/图片→Markdown/JSON，2026-06 仍在发版）。对会 pip 的学生/科研人员，"免费离线批量含表格、去页眉页脚、Mac"这一整套需求已经被很好地解决，所以不能给 confirmed。

2) 但簇的主体受众是行政财务文员/普通学生，要的是"解压即用"的 GUI。这一层在 Mac 上确有实证缺口：
- Umi-OCR（47.5k★）REA
  - 竞品/替代：Umi-OCR — 不够用（对 Mac 用户）。免费离线批量、忽略区域、导出 csv/md 都有，但只支持 Windows/Linux；Mac 版和表格识别自 2022 年起只停留在'远程计划'，相关 issue 无回复；最后代码提交 2025-05，维护放缓。Windows 用户则基本够用。（https://github.com/hiroi-sora/Umi-OCR）
  - 竞品/替代：MinerU（pip 版 + 官方 Mac ARM 桌面客户端） — pip 版对技术用户够用：免费开源、macOS/Apple Silicon 可跑、PDF→Markdown/JSON、表格/公式/去页眉页脚、可批量。官方 Mac ARM 客户端确证存在（v0.13.0，2026-03），但闭源、issue 中出现'消耗量'配额，是否完全免费本地无限次不确定；对非技术用户是最接近的方案。（https://github.com/opendatalab/MinerU）
  - 竞品/替代：Docling (IBM) — 技术用户够用：MIT、68k★、明确支持 macOS arm64、本地/air-gapped、表格结构(TableFormer)、可用 ocrmac 调 Apple Vision、导出 Markdown/HTML/JSON（表格可转 DataFrame→Excel）。无 GUI，需要 Python。（https://github.com/docling-project/docling）
  - 竞品/替代：Marker — 技术用户够用：40k★、MPS 支持、表格/公式、去页眉页脚、有 streamlit 简易界面；模型权重许可对营收>5M 美元企业收费，学生/个人免费。需要 Python 与数 GB 模型。（https://github.com/VikParuchuri/marker）
  - 竞品/替代：PaddleOCR PP-StructureV3 / RapidOCR + RapidTable — 引擎层够用：90k★、linux/win/mac、表格结构识别、Markdown/JSON（PaddleX 表格管线可存 xlsx）；RapidOCR 8k★ ONNX 轻量跨平台。均为 SDK/CLI，无官方 Mac GUI。（https://github.com/PaddlePaddle/PaddleOCR）
  - 竞品/替代：Stirling-PDF 桌面版 (macOS dmg) — 部分够用：93k★、免费、2026-09 仍在发 macos-universal.dmg，含 OCR（Tesseract/ocrmypdf 生成可搜索 PDF、可批量）；不做表格结构还原、无忽略区域，中文精度受 Tesseract 限制。（https://github.com/Stirling-Tools/Stirling-PDF）
- *crowd* → weak（5）：证据审视：(1) 8 条证据里只有 2 条是用户在"要而没有"——Umi-OCR #445（表格提取，👍5/10 评论）和 #263（macOS 计划，👍3/2 评论）；其余是产品自述（MinerU README 面向"LLM-ready markdown/Agentic workflows"的 AI 开发者，被误读为办公学生需求；Umi-OCR README 是卖点文案）、维护者自己发的功能公告（#254 是作者宣布公式识别插件，32 条评论是试用反馈而非需求）、供给侧清单（chinese-independent-developer 统计 61 款 PDF/16 款 OCR 工具，恰说明供给充足）、少数派推荐文的搜索摘要（不可核）、以及 eSearch 作者换 Linux 找不到 Snipaste 的动机（截图工具，与表格/Mac 无关）。(2) 独立性：8 条中 5 条来自同一仓库 Umi-OCR（README+3 个 issue），真正独立且表达需求的来源约 2 个，independent_source_count=8 明显虚高。(3) 互动：只有两条有真实 👍（5 和 3），其余是 star（衡量工具受欢迎度，不是抱怨数）或 unknown。(4) GitHub 复核：Umi-OCR 里 macOS 请求 2022–2026 持续出现约 10 个 issue（#8 #34 
  - 竞品/替代：Umi-OCR — 47.5k★，Windows/Linux 免费离线批量 OCR、PDF 识别、排除页眉页脚，解压即用无需配置——已基本满足 Windows 端泛需求；不支持 macOS、无表格结构识别（仅 CSV 文本输出），作者明确无精力做 Mac 适配，表格→Excel 列为低优先级（https://github.com/hiroi-sora/Umi-OCR）
  - 竞品/替代：PaddleOCR (PP-Structure) — 90k★，含表格结构识别与版面分析模型，免费离线，但是开发者工具包，非办公用户可直接用的 GUI（https://github.com/PaddlePaddle/PaddleOCR）
  - 竞品/替代：MinerU / docling / marker — 80k★/68k★/40k★，PDF→Markdown/JSON 含表格，跨平台含 macOS，免费离线；面向 AI/RAG 开发者，需命令行或 Python 环境，且模型体积大（https://github.com/opendatalab/MinerU）
  - 竞品/替代：Easydict — 14.8k★ macOS 原生 App，支持离线 OCR（截图取词），免费开源；单图/截图场景，非批量、无表格（https://github.com/tisfeng/Easydict）
  - 竞品/替代：eSearch — 7.2k★，Windows/Linux/macOS 三平台，内置离线 PaddleOCR，免费开源；截图 OCR 为主，无批量/表格（https://github.com/xushengfeng/eSearch）
  - 竞品/替代：NormCap / macOCR / TRex — 2.7k★/2.4k★/1.9k★，macOS 免费离线截图 OCR（Apple Vision 或 tesseract），与 macOS 自带 Live Text 一起覆盖了 Mac 单图 OCR，因此 Mac 版 Umi-OCR 呼声弱；不做批量 PDF 与表格（https://github.com/dynobo/normcap）
- *buildable* → confirmed（7）：【簇要点】C20：学生/财务行政/科研人员要"免费、离线、批量、含表格/公式、排除水印页眉页脚、Mac可用"的OCR/PDF转文档工具。GitHub核验：Umi-OCR 47.5k★，README明确仅支持Windows7 x64/Linux x64，表格→Excel仍在"长期计划"未实现，仓库内12条macOS相关issue，维护者答复"目前没有原生MacOS版本，Linux可用Docker"、"Linux/macOS适配可行但未排期"；MinerU 80.7k★，支持Apple Silicon，但模型0.8-3GB、需8-16GB内存、仅CLI/Gradio WebUI，许可证为Apache2.0+附加条件（须在产品界面显著标注使用MinerU；MAU>1亿或月收入>2000万美元需商业授权）。

【1. 可建性与技术路径】能做，1-2人4-6周可出MVP。路径：(a) 壳：SwiftUI原生App（或Tauri）；PDFKit渲染页面为位图，对已有文本层的PDF直接抽取跳过OCR。(b) 文字OCR：Apple Vision VNRecognizeTextRequest作默认引擎——系统自带、零模型体积、支持简繁中文、Apple Silicon上快、带行级bbox；可选切换RapidOCR ONNX（8.0k★，PaddleOCR模型转ONNX，检测+识别约10-20MB，A
  - 竞品/替代：Umi-OCR — 47.5k★；免费离线批量，但README仅支持Windows/Linux，无macOS版（维护者称适配可行但未排期），表格→Excel仍在长期计划未实现。核心痛点（Mac+表格）未覆盖。（https://github.com/hiroi-sora/Umi-OCR）
  - 竞品/替代：MinerU — 80.7k★；支持Apple Silicon，含表格/公式识别，但模型0.8-3GB、需8-16GB内存、仅CLI/Gradio WebUI，面向技术用户；许可证要求产品界面显著标注且有规模阈值。非面向普通办公/学生的Mac产品。（https://github.com/opendatalab/MinerU）
  - 竞品/替代：Docling — 68k★，MIT，macOS/arm64支持，含表格结构与公式解析；Python库/CLI，无桌面GUI，可作后端组件而非终端产品。（https://github.com/docling-project/docling）
  - 竞品/替代：RapidOCR + RapidTable — RapidOCR 8.0k★、RapidTable 439★，Apache-2.0，ONNX轻量模型（SLANet-Plus 6.8MB），支持macOS；是构建块而非产品。（https://github.com/RapidAI/RapidTable）
  - 竞品/替代：eSearch — 7.2k★，Electron跨平台截图离线OCR，支持macOS，但定位截图/搜索，非批量文档、无表格→Excel。（https://github.com/xushengfeng/eSearch）
  - 竞品/替代：ocrmac — 546★，Apple Vision框架Python封装，证明Apple Vision可作免费离线OCR引擎；仅库不是产品。（https://github.com/straussmaximilian/ocrmac）

**用户原话 / 关键证据**：
> Umi-OCR 47,514★ README「适用于Windows7 x64、Linux x64」
> #677「UMI-OCR对表格的识别太弱了…格式错乱」；作者#146「没有能力和精力去做Linux和Mac的适配」

**证据链接**：
- [] https://github.com/opendatalab/MinerU — "Transforms complex documents like PDFs and Offic…（80,700 stars / 6,734 forks）
- [] https://github.com/hiroi-sora/Umi-OCR — "免费，开源，可批量的离线OCR软件"；"免费：本项目所有代码开源，完全免费。（47,514 stars / 4,645 forks …）
- [] https://github.com/xushengfeng/eSearch — 作者在 Windows 上用 Snipaste，换到 Linux 后没有等价物（Flameshot…（7,214 stars / 518 forks / 7…）
- https://github.com/hiroi-sora/Umi-OCR/issues/1083
- https://github.com/RapidAI/RapidTable

**产品概念**：SwiftUI原生Mac App：拖入文件夹→队列并发OCR→导出txt/md/xlsx/docx

**MVP 范围**：4-6周1-2人：批量队列+双引擎

**风险**：crowd仅weak(5)：8条证据5条同仓库，Mac请求每条0-3👍

### 21. 技术用户要过滤AI/SEO垃圾的搜索与资讯流（C38，总分 5）

**一句话**：LLM语义分主题的"HN minus AI

**用户与场景**：开发者、研究者、对AI话题疲劳的。Google被SEO垃圾与AI内容淹没，DuckDuckGo也在enshitti

**现有方案及不足**：uBlacklist 6.6k★+社区黑名单（中文垃圾站7.5k★

**为何至今没解决**：搜索索引成本极高免费必走广告，付费搜索用户少难摊薄（重度用户API成本$

**验证结论**：unmet=weak(4) crowd=weak(6) buildable=weak(5)

- *unmet* → weak（4）：把簇拆成两半看。(1) "搜索结果去 SEO/AI 垃圾" 这一半其实有成熟方案：uBlacklist（6.6k★，2026-09-27 仍在提交，覆盖 Google/Bing/Brave/DDG/Kagi/SearXNG/Startpage 等，支持订阅列表与多端同步）+ 社区维护的黑名单（cobaltdisco 中文垃圾站 7.5k★、quenhus dev-filter 2.3k★ 屏蔽 GitHub/SO 镜像站、SSS 311★ 每日自动更新含内容农场/生成式 AI 站）是免费且口碑很好的组合；Kagi 是付费但被普遍认可"就是为这个需求做的"产品（域名屏蔽/降权、Lenses、Small Web 1.7k★），抱怨集中在价格；Brave Search Goggles 是免费内置的再排序/过滤机制（官方 quickstart 773★，自带 copycats_removal、tech_blogs、hacker_news 等 goggle）；SearXNG 37.7k★ 活跃，且 searx.space 有大量公共实例，无需自建。所以"没有干净搜索"这个说法基本站不住。(2) 但簇里"按主题/是否 AI 做语义过滤"和"HN 之外的去 AI 技术资讯流"这一半确实没有像样方案：GitHub 上 HN 主题过滤工具全是玩具级（chrome-extension-hn-filte
  - 竞品/替代：uBlacklist + 社区黑名单订阅（cobaltdisco 中文垃圾站、quenhus dev-filter、Super-SEO-Spam-Suppressor、BadWebsiteBlocklist、eallion 订阅合集） — 够用且是该场景最成熟的免费方案：6.6k★、2026-09 仍活跃，覆盖 Google/Bing/Brave/DDG/Kagi/SearXNG 等主流引擎，支持订阅列表与跨设备同步；配合 7.5k★ 的中文垃圾站列表、2.3k★ 的 GitHub/SO 镜像站列表、每日自动更新的 SSS 列表，能直接消灭大部分 SEO 内容农场/镜像站。缺陷：基于域名黑名单，无法做'是否 AI 内容'的语义判断，需要用户自己装扩展+挑列表，且不改变引擎本身的排序/广告。（https://github.com/iorate/ublacklist）
  - 竞品/替代：Kagi（付费搜索：域名屏蔽/降权、Lenses、Small Web、无广告） — 功能上最完整覆盖'干净、无广告、可自定义过滤'的需求，HN 上口碑普遍很好；抱怨集中在价格（Professional 约 $10/月，另有 $5/月 300 次的 Starter 档和 100 次免费试用——价格数字基于我的知识，未在线核实）。Small Web 索引开源 1.7k★ 活跃。属于'有方案但有收费墙'。（https://github.com/kagisearch/smallweb）
  - 竞品/替代：Brave Search + Goggles（免费内置的结果再排序/过滤机制） — 免费、独立索引、内置可禁用 AI 摘要；Goggles 允许用户/社区写规则过滤或提升域名（官方示例含 copycats_removal、tech_blogs、hacker_news），是唯一免费做到'按主题过滤搜索结果'的大厂功能。缺陷：Goggle 生态小（quickstart 仅 773★，第三方 goggle 多为几十星），仍需自己写规则；对 Brave 公司的信任度在技术社区存在争议；免费版有广告。（https://github.com/brave/goggles-quickstart）
  - 竞品/替代：SearXNG（自建或公共实例，searx.space） — 37.7k★ 非常活跃，公共实例众多、无需自建即可使用，无广告无追踪；hostnames 插件可按域名移除/降权/替换结果，支持外部列表。缺陷：结果依赖 Google/Bing 等上游，SEO 垃圾并不会自动消失；hostnames 过滤是实例管理员级配置，普通用户在公共实例上无法自定义（需叠加 uBlacklist）；公共实例常被上游限流。（https://github.com/searxng/searxng）
  - 竞品/替代：Marginalia Search（独立索引的小众网站搜索） — 开源 2.2k★ 活跃、免费、无广告、天生排斥商业 SEO 站，对'找技术博客/个人站'很好；但索引面窄，无法作为日常主力搜索，只能作补充。（https://github.com/MarginaliaSearch/MarginaliaSearch）
  - 竞品/替代：Stract / Whoogle（开源独立/代理搜索） — 不够用：Stract（2.4k★）已于 2026-04-02 归档，Whoogle（11.6k★）已归档，说明面向开发者的开源独立搜索引擎在持续退出，这反而支持'开源侧无稳定替代'的判断。（https://github.com/StractOrg/stract）
- *crowd* → weak（6）：对簇自身证据的审视（C22 合并前完整 7 条，clusters.json 里只剩 3 条截断标题）：
(1) 引文性质：7 条全部是 Ask HN 帖子的标题而非正文引语，没有一条直接说"想要 X 但现有都不行"。5 条切题（DDG 替代品？/ 腐化时代如何搜索？/ HN 之外聊非 AI 技术的地方？/ 把 HN 拆成 AI 与其他？/ What are you working on (Non AI)），2 条明显凑数：38463616"哪些公司在反向 enshittification"是泛商业话题，47215609"你还看哪些类似 HN 的信息源"是普通求推荐帖，与 AI/SEO 垃圾无关。"Kagi $120/年太贵"是簇作者的转述，不是引文；Kagi 实际还有更低价档（Starter 约 $5/月 300 次，凭记忆，2026 现价不确定），"太贵"并非普遍共识——大量 HN 用户是 Kagi 付费用户并主动推荐。
(2) 独立性：7 个不同 HN item id、时间跨 2023-11 至 2026-08，可视为不同作者，但 platforms 只有 Hacker News 一个平台，零跨平台佐证；且把"搜索引擎变差"和"HN 首页 AI 太多"两个不同需求合并后才凑出 7 条，各自只有 3-4 条。
(3) 互动：7 条 engagement 全部 unknown，没有
  - 竞品/替代：uBlacklist + 订阅黑名单（eallion 合集 / awesome-ublacklist / Super-SEO-Spam-Suppressor / Paxxs Google-Blocklist） — 直接命中'过滤 SEO 垃圾/内容农场/机翻站'，支持 Google/Bing/DDG，免费；6.6k★ 主项目 + 数千星的订阅表生态说明被大量使用。局限：靠人工维护域名列表，不是语义级判断，对新出现的 AI 文字站滞后。（https://github.com/iorate/ublacklist）
  - 竞品/替代：laylavish/uBlockOrigin-HUGE-AI-Blocklist — 5.8k★、200 open issues，专门屏蔽搜索结果中 AI 生成图片站点，是'过滤 AI 垃圾'需求的最强开源佐证；但只覆盖图片站，不覆盖 AI 文字内容。（https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist）
  - 竞品/替代：SearXNG（含公共实例） — 37.7k★，免费无广告无追踪、可自建或用公共实例；但结果来自上游 Google/Bing 等，SEO/AI 垃圾照单全收，无 AI 内容过滤；自建对普通用户有门槛。（https://github.com/searxng/searxng）
  - 竞品/替代：Whoogle Search — 11.6k★ 但已归档（Google 反爬导致维护困难），说明'白嫖大厂索引'路线不可持续，支持簇的 why_unsolved。（https://github.com/benbusby/whoogle-search）
  - 竞品/替代：Marginalia Search / Kagi Small Web — 独立索引、面向文本型小站、天然少 SEO 垃圾（2.2k★ / 1.7k★）；但索引规模小，只适合探索性搜索，不能替代日常技术搜索。（https://github.com/MarginaliaSearch/MarginaliaSearch）
  - 竞品/替代：Kagi（商业付费） — 付费无广告、可自定义站点升降权/屏蔽、有 AI 内容标注类功能；Professional 约 $10/月，另有更低价 Starter 档（凭记忆，2026 现价不确定）。HN 上有大量满意付费用户，'$120 太贵'不是共识；它证明需求存在但也证明需求已被相当程度满足。
- *buildable* → weak（5）：簇 C38 实际是两个耦合度不高的子需求，可行性差异很大，需拆开评估。

【子需求 A：HN 资讯流按"是否 AI 话题"语义过滤】——可做、合法、便宜，但几乎无变现。
- 技术路径：HN 官方 Firebase API（免费、无需 key）或 Algolia HN Search API 拉取 top/new/best 故事 → 小模型（Haiku/GPT-4o-mini/本地 7B）对"标题+域名+首段"做多标签分类（AI/LLM、其他），每天约 500-1500 条新故事、每条 <300 token，日成本在几美分到 <1 美元 → 输出：(a) 浏览器插件在 news.ycombinator.com 直接隐藏/折叠/分栏；(b) 托管站点 + RSS 输出（"HN minus AI"、"HN AI-only"）。1 人 1-2 周可交付 MVP，2-6 周可加上自定义主题、关键词/域名规则、评论区过滤。
- 壁垒：无。HN API 是官方公开提供的，展示标题+链接不涉及版权问题；不需要网络效应，因为讨论仍在 HN 站内，插件只是视图层。
- 现状：hnrss.org 提供关键词过滤 RSS、Refined Hacker News 等插件做 UI 增强，但我不知道有被广泛使用的"LLM 语义分主题"的 HN 前端；GitHub 上搜到的同类项目（feedwall、content
  - 竞品/替代：Kagi — 付费无广告搜索，$10/月无限（另有 $5/月 300 次档），支持域名升降权/屏蔽、Small Web；功能上已解决痛点，簇中用户嫌贵——说明问题在成本结构而非功能空白（https://kagi.com）
  - 竞品/替代：SearXNG — 37.7k star 开源元搜索，无广告可自建；但靠抓取 Google/Bing SERP（ToS 灰色地带），公共实例常被封禁，自建门槛高，无语义过滤（https://github.com/searxng/searxng）
  - 竞品/替代：uBlacklist + laylavish/uBlockOrigin-HUGE-AI-Blocklist — 6.6k + 5.8k star，浏览器插件在 Google/Bing/DDG 结果页按域名屏蔽 AI 图站、内容农场、SO 镜像等；免费成熟，覆盖了域名级过滤的大部分价值，但不能做语义级/逐条 AI 判定（https://github.com/iorate/ublacklist）
  - 竞品/替代：Marginalia Search / Stract — 2.2k / 2.4k star 独立索引搜索引擎，专注小站/文本站，无广告；索引覆盖窄，适合探索不适合日常主力搜索（https://github.com/MarginaliaSearch/MarginaliaSearch）
  - 竞品/替代：Brave Search（含 Brave Search API） — 独立索引、无追踪的免费搜索及付费 API；是小团队做元搜索最现实的合法上游，但定价 $3-5/千次决定了下游产品价格下限
  - 竞品/替代：hnrss.org / Refined Hacker News 等 HN 工具 — 提供关键词过滤 RSS 与 UI 增强，但只有关键词级、无 LLM 语义分主题；这是子需求 A 的真实空白（https://hnrss.org）

**用户原话 / 关键证据**：
> HN「Ask HN: How do I search the web in the age of
> uBlacklist 6,645★+AI图站黑名单5,789★/200 open issues

**证据链接**：
- [] https://news.ycombinator.com/item?id=49155492 — Ask HN: What are the viable alternatives to DuckD…
- [] https://news.ycombinator.com/item?id=42281581 — Ask HN: How do I search the web in the age of ens…
- [] https://news.ycombinator.com/item?id=48202486 — Alternatives to HN for 'tech outside of AI' discu…
- https://github.com/iorate/ublacklist
- https://github.com/searxng/searxng

**产品概念**：两个解耦产品件：①"HN分频"——用HN官方API拉top/new

**MVP 范围**：2周HN插件/RSS+2-4周元搜索de

**风险**：元搜索经济结构性不成立：上游API成本使定价下限即Kagi，用户核心抱怨恰是嫌贵

### 22. 家庭要自己掌握的全家病历与血压用药共享（C40，总分 5）

**一句话**：跨品牌的父母血压/血糖/用药家人视图+吃药提醒+家庭药箱

**用户与场景**：为父母管理健康的异地子女。血压计/血糖仪数据锁在各硬件厂商App无家人视图，只能借滴答清单做吃药提醒

**现有方案及不足**：Apple Health共享+用药提醒（需HealthKit血压计）

**为何至今没解决**：健康数据锁在硬件生态（欧姆龙私有BLE），老人端操作复杂

**验证结论**：unmet=weak(6) crowd=weak(4) buildable=weak(5)

- *unmet* → weak（6）：簇含两个子需求：A) 异地子女远程看父母血压/血糖/用药+吃药提醒+家庭药箱；B) 自持有、私有、离线的全家病历聚合本。逐一反驳后的结论：

A 有"拼凑可用"的方案但没有一个跨品牌、跨平台的成熟产品：(1) Apple Health 健康共享（iOS 15+）+ 用药功能（iOS 16+）确实原生覆盖"家人远程看血压/用药、吃药提醒"，免费、口碑好——但要求老人用 iPhone 且血压计支持 HealthKit（欧姆龙/Withings），中国老人主流是华为/小米安卓机+鱼跃/欧姆龙普通血压计，覆盖面有限；(2) 华为运动健康"家人共享/关爱家人"（据我所知 2022-2023 起支持，细节不确定）只覆盖华为 WATCH D 等自家生态；(3) 乐心 GPRS/4G 血压计"父母一测、子女微信收到"、鱼跃 WiFi 血压计+小程序远程查看、九安 iHealth 微信推送——这些真实存在且能解决核心场景，但都绑定单一硬件、换牌即失效，且不含用药/血糖/病历；这与簇证据"小红书搜索只找到硬件选购讨论"完全吻合：解决方案被卖成硬件而非软件；(4) 用药提醒：Medisafe（Medfriend 漏服通知家人）、MyTherapy 海外成熟，但国内安卓端不可用/不本地化；国内只有零散小程序和阿里健康/京东健康的"家庭药箱/用药提醒"（电商附属、数据云端、无测量数据家人视图）；开源 Med
  - 竞品/替代：Apple Health 健康共享 + 用药提醒（iOS 15/16+ 系统内置） — 海外/苹果家庭基本够用：家人可远程看血压（HealthKit 兼容血压计如欧姆龙/Withings）、用药记录与趋势提醒，免费、口碑好。不够之处：要求老人用 iPhone 且血压计支持 HealthKit；中国老人主流为华为/小米安卓+普通血压计；Apple Health Records（病历）中国不可用；无家庭药箱过期管理。
  - 竞品/替代：华为运动健康 家人共享/关爱家人（HarmonyOS，细节不确定） — 据我所知 2022-2023 起支持家人查看心率/睡眠/血压等（血压需 WATCH D 或华为生态设备）。仅覆盖华为生态，不跨品牌，不含病历与用药管理。小米运动健康/OPPO 是否有同类'家人关怀'功能不确定。
  - 竞品/替代：乐心健康 GPRS/4G 血压计（微信推送家人） — 真实存在多年，'父母测量、子女微信即时收到'，是国内最贴近 A 场景的硬件+软件方案。缺陷：绑定乐心硬件，换牌失效；只有血压，没有血糖/用药/病历；数据在厂商云端。
  - 竞品/替代：鱼跃/九安 iHealth/欧姆龙 智能血压计 + 小程序远程查看 — 鱼跃 WiFi 血压计与 iHealth 小程序有'家人远程查看/微信推送'（中等把握；欧姆龙国内小程序是否支持家人共享不确定）。同样是硬件绑定、单一指标、无跨品牌整合——与簇中'小红书只找到硬件选购讨论'一致：方案被卖成硬件。
  - 竞品/替代：Medisafe（Medfriend 漏服通知家人）/ MyTherapy（Team） — 海外成熟、评分高、免费+订阅；Medisafe 可记录血压/血糖并在漏服时通知家人。国内安卓端无法正常获取/推送，无中文本地化生态，老人端不友好；不含病历聚合。
  - 竞品/替代：国家医保服务平台 App 亲情账户 + 省级健康档案（上海健康云/浙里办/粤省事等）+ 腾讯健康/支付宝家庭成员绑定 — 可绑定家人查看医保结算记录和本省公立医院部分就诊/检验记录，免费。缺陷：不跨省、不含体检中心/民营/保险数据、字段深度因地而异、不可整体导出离线，仍是平台持有而非'自己掌握'。
- *crowd* → weak（4）：簇内证据逐条审视：(1) fasten-onprem 2.8k星/182 fork/217 open issues，README 动机句确是真实的「分散在多家机构、自己想掌握」表达，是唯一有分量的证据；但该仓库已于 2026-07-18 归档（#629：直连 EHR 集成不可持续、检索功能迁到商业版 Fasten Connect），「Is this project dead?」#554 零评论，家庭多用户 RBAC #57 是维护者自己开的、零评论——说明星标来自 self-hosted 圈对「自己保管病历」的泛兴趣，而非对「家人视图」这一具体诉求的集体拉动。(2) jwilleke/yourphr 11星是 Fasten 的社区 fork，其「couldn't find any software... so I built」引文原本就是 Fasten 原作者的话被复制进 fork README，与证据 1 同源，属重复计数。(3) 小红书 question/991418 是「血压心率手表哪个牌子好」问答聚合页，是硬件选购，不表达「想要家人远程看数据/吃药提醒但没有」的需求，被误读；描述自己也承认小红书 7 轮搜索均未找到相关提问，把「找不到」反推成「产品缺位信号」是从缺失推断需求，证据力很弱。三条证据无一带可见附和/点赞，independent_source_count=6 与实
  - 竞品/替代：fastenhealth/fasten-onprem — 曾是最接近「自托管全家病历本」的方案（2.8k星），但 2026-07 归档，直连 EHR 集成移除并转商业版 Fasten Connect；家庭多用户 RBAC 从未完成。证明需求存在但整合成本高、社区拉动不足。（https://github.com/fastenhealth/fasten-onprem）
  - 竞品/替代：DMJoh/Mediqux — 214星、活跃、明确面向 individuals and families、纯自托管无云依赖；靠手动录入（无 FHIR 自动拉取），覆盖 D28「自己掌握的私有全家病历本」的手工版。（https://github.com/DMJoh/Mediqux）
  - 竞品/替代：MBombeck/HealthLog — 116星、自托管血压/血糖/用药记录，多用户邀请、服药提醒、Withings/Fitbit/Apple Health 同步；已部分覆盖 A29 的家庭生命体征共享与提醒，但无老人端简化与国产设备对接。（https://github.com/MBombeck/HealthLog）
  - 竞品/替代：LifeValue/HealthWallet.me — 70星、患者自控、FHIR R4 聚合美国 52K+ 机构、离线优先；仅美国医疗体系，对中国用户无效。（https://github.com/LifeValue/HealthWallet.me）
  - 竞品/替代：jwilleke/yourphr — Fasten 的社区 fork，11星、单人维护，可用性未知。（https://github.com/jwilleke/yourphr）
  - 竞品/替代：Apple Health 数据共享 + 用药提醒（iOS 15/16 起，基于知识） — 可与家人共享心率/血压等健康数据并设置用药提醒，覆盖 A29 大部分场景（限 iOS 生态、需老人用 iPhone/Apple Watch 或兼容血压计）。
- *buildable* → weak（5）：簇C40由两个子需求合并：A29(异地子女要父母血压/血糖/用药家庭共享+吃药提醒+家庭药箱过期管理) 与 D28(自托管全家病历聚合本)。

【1. 小团队2-6周MVP可行性：可以，但只能做"手动/拍照/标准BLE"路径，做不到"自动打通厂商生态"】
- A29 技术路径(2-4周,1-2人)：微信小程序或Flutter App + 云端多成员账号(家庭码邀请、子女代录)。数据进入三条合法通道：(a)手动录入/子女代录；(b)拍血压计屏幕→多模态LLM读数(7段数码管识别现已可靠，可一并识别药盒名称与有效期做药箱管理)；(c)蓝牙直连——蓝牙SIG公开标准 Blood Pressure Profile(0x1810)/Glucose Profile(0x1808)，鱼跃/欧姆龙部分型号/A&D/Beurer等实现了标准协议，微信小程序自带wx BLE API可直读，无需绕过任何东西；iOS端另可通过HealthKit、Android端通过Health Connect读取厂商App已写入的血压/血糖(合法、平台鼓励)。提醒：App推送直接；小程序需订阅消息(一次性模板限制较大，长期订阅类目是否覆盖健康管理"不确定")。
- D28 技术路径(3-6周,1-2人)：Docker自托管Web(可直接fork GPL的fasten-onprem/yourphr)或本地优先App + 多
  - 竞品/替代：fastenhealth/fasten-onprem — 自托管家庭PHR，2.8k★/182 fork/195 open issues，GPL-3.0，支持多成员与照护者只读；仅手动录入或导入FHIR Bundle，无设备数据、无提醒、美国中心；仓库页显示2026-07-18已归档转只读，作者转向商业B2B产品Fasten Connect——印证why_unsolved中'开源单人维护+商业化困难导致归档'。对中国家庭不适用。（https://github.com/fastenhealth/fasten-onprem）
  - 竞品/替代：jwilleke/yourphr — Go+SQLite+Angular自托管家庭PHR，11★，GPL-3.0，多成员角色(admin/viewer)，FHIR R4导入+手动录入，单Docker镜像；爱好级项目，无血压/用药/提醒、无拍照抽取、无中文，仅适合美国技术用户。可作为D28的fork基底。（https://github.com/jwilleke/yourphr）
  - 竞品/替代：userx14/omblepy — Python CLI读取欧姆龙BLE血压计，支持10个型号，100★/37 fork/20 open issues，跨平台；证明厂商锁定数据可被合法互操作性逆向读出，但属灰色地带、固件更新易失效、无家人视图无UI，仅是技术组件。（https://github.com/userx14/omblepy）
  - 竞品/替代：waseefakhtar/dose-android — Kotlin/Compose用药提醒Android App，633★，开源领域最高星；单用户、无家人共享、无血压/血糖、无药箱过期管理，不解决异地子女痛点。（https://github.com/waseefakhtar/dose-android）
  - 竞品/替代：Apple Health 健康共享 + 用药提醒(iOS15/iOS16) — 已在iOS生态内解决A29大半：家人可查看共享的健康数据，用药提醒内置；但要求老人使用iPhone且血压计支持HealthKit，中国老人多用安卓/华为，且不做病历聚合与药箱管理。
  - 竞品/替代：华为运动健康 家人健康数据共享(具体功能名不确定) — 华为Watch D等设备数据可分享给家人查看，但锁定华为硬件、不跨品牌、无病历聚合；是小团队跨品牌方案的直接替代威胁。

**用户原话 / 关键证据**：
> fasten-onprem 2,794★/182 fork，README「my medical history
> Mediqux（2025-08，214★）README："I wanted a private,

**证据链接**：
- [] https://github.com/fastenhealth/fasten-onprem — my medical history (and the medical history of my…（2.8k stars, 182 forks…）
- [] https://github.com/search?q=in%3Areadme+%22couldn%27t+find+any%22+%22so+I+built%22&type=repositories&s=stars&o=desc — jwilleke/yourphr — yourphr is an open-source…（11 stars, updated 39 minute…）
- [] https://www.xiaohongshu.com/mobile/question/991418 — 问答聚合页标题：血压心率手表那个牌子好_小红书
- https://github.com/DMJoh/Mediqux

**产品概念**：小程序/Flutter"家庭健康本"：家庭码邀请多成员，父母端极简大字一键

**MVP 范围**：3-5周1-2人：多成员账号

**风险**：crowd仅weak(4)：三条证据一条重复计数一条硬件选购误读

### 23. 家属要亲人去世后微信/游戏账号内容的托管保存（C48，总分 5）

**一句话**：白区数字遗产托管：生前指定联系人+定期备份提醒

**用户与场景**：失去亲人的家属、有规划意识的中老。父亲去世多年微信账号突然消失（热搜2天）、亡妻在游戏中的房子没了

**现有方案及不足**：微信支付余额继承（仅钱包）、微博/B站纪念账号

**为何至今没解决**：腾讯协议账号归腾讯不可继承、无纪念账号/遗产联系人机制

**验证结论**：unmet=weak(6) crowd=weak(5) buildable=refuted(3)

- *unmet* → weak（6）：结论：无法反驳"未被很好解决"，但也不是空白市场——有大量部分覆盖的方案，只是全部绕开了核心场景（微信/国产游戏账号在用户去世后的平台侧托管、纪念保存、朋友圈/游戏内容不被回收）。按评分规则"有方案但不覆盖核心场景→weak"，且"不确定偏向 refuted"，给 6。

分三段诉求逐一核对：
1) 生前指定数字遗产联系人：海外平台侧方案成熟（Apple 遗产联系人 iOS15.2+、Google 闲置账号管理员 2013 起、Facebook Legacy Contact/纪念账号 2015 起），但一个都碰不到微信、QQ、腾讯/网易游戏。国内只有微博（2020）、B站（2020-12）有"纪念账号"，抖音我记忆中也有纪念账号申请但不完全确定；微信截至我的知识截止没有任何遗产联系人/纪念账号机制，只有微信支付钱包余额可凭死亡证明+亲属关系证明走客服继承；《微信软件许可及服务协议》明确账号所有权归腾讯、仅有使用权、不得转让/继承、长期不登录可回收。Steam（Valve 2024 明确不可继承）、PS/Nintendo 同样不可继承；FF14 房屋 45 天未登录自动拆除是海外同类痛点，靠官方临时暂停拆除应急。
2) 内容定期导出归档：聊天记录这一块开源工具极多且 star 很高——WeChatMsg 42.1k、WeFlow 14.5k、PyWxDump 9.7k、WechatE
  - 竞品/替代：微信官方：微信支付余额继承流程 + 用户协议（账号不可继承、长期不登录可回收） — 不够用。仅覆盖钱包余额（需死亡证明+亲属关系证明走客服），聊天记录、朋友圈、账号本身均无遗产联系人/纪念账号机制；协议明确账号所有权归腾讯、不可转让继承，长期未登录可被回收——正是热搜案例的成因。
  - 竞品/替代：微信内置 聊天记录备份与迁移（PC 端备份 / 迁移到新手机） — 部分可用。只能由账号本人在已登录手机上确认操作；不覆盖朋友圈；去世后若手机锁屏或手机号被运营商回收则无法登录/确认，家属基本用不上。
  - 竞品/替代：LC044/WeChatMsg（留痕） — 曾是最流行的微信聊天导出工具（42.1k★），但已停止维护、issue 被关闭、作者转向别的项目；面向微信 3.x，不导出朋友圈；需生前在本人 PC 登录状态下操作。（https://github.com/LC044/WeChatMsg）
  - 竞品/替代：hicccc77/WeFlow — 14.5k★ 的 2026 年新工具，但已收到腾讯 DMCA 1201，自述移除密钥提取与解密功能，Releases 为空，用户 issue 'RIP WeFlow'、'导出失败'。说明第三方导出路线正被平台法律手段封堵。（https://github.com/hicccc77/WeFlow）
  - 竞品/替代：xaoyaoo/PyWxDump — 9.7k★，2025-10-20 收到微信官方律师函后删除全部代码与提交历史，仅剩下架声明并要求用户删除本地副本。不可用。（https://github.com/xaoyaoo/PyWxDump）
  - 竞品/替代：BlueMatthew/WechatExporter — 对家属最友好的一个：从 iTunes 备份导出，不需要微信登录，只要能给逝者 iPhone 做备份。但只导聊天不导朋友圈，README 测试矩阵停在 iOS15/微信8.0.9，131 个未关闭 issue，新版本兼容性存疑。（https://github.com/BlueMatthew/WechatExporter）
- *crowd* → weak（5）：证据本身的问题：(1) 三条 evidence 的 quote 全是微博热搜话题标题（#网友爸爸去世多年微信账号突然消失#、#人去世了微信朋友圈会消失吗#、#亡妻在游戏中的房子没了男子求助#），没有任何一条是用户第一人称说"我想要托管/导出/纪念保存，但现有方案不行"。热搜是围观新闻事件与共情，不等于产品诉求；"微信客服被迫回应"说明的是舆情压力，不是需求方在找解决方案。(2) 三条是三个不同事件、不同当事人，不算同一篇重复计数，但全部来自同一平台（微博热搜榜），independent_source_count=3 其实是"3 个事件、1 个渠道"。(3) 互动可见：榜单排名 #9/#22/#21、上榜 1-2 天，在微博语境下是真实的大流量，这点优于多数簇的 unknown。(4) 常识判断：数字遗产是被反复讨论的公共议题（每年清明前后、QQ/微信长期不登录被回收的新闻周期性出现；Apple 遗产联系人、Google 闲置账号管理、Facebook 纪念账号/遗产联系人、微博与 B 站纪念账号的存在，本身证明各大平台都认为诉求普遍到值得做功能）。但它是低频、事件触发式的痛点：只在亲人去世那一刻爆发，生前几乎没人主动规划，"想要"和"愿意付费/行动"之间差距很大，且微信/游戏侧无 API，第三方只能做导出归档。(5) GitHub 补充：微信聊天记录导出这一"前置能力"需求极大——
  - 竞品/替代：LC044/WeChatMsg — 42k 星，微信 PC 端聊天记录导出为 HTML/Word/CSV，覆盖'生前/有设备访问权时导出归档'这一环；不解决账号继承、去世后访问、朋友圈与游戏内容；作者已停止更新。（https://github.com/LC044/WeChatMsg）
  - 竞品/替代：xaoyaoo/PyWxDump — 9.6k 星，解密微信数据库并导出聊天记录；描述已改为'删库'，显示此类工具面临下架/法律压力，可持续性差。（https://github.com/xaoyaoo/PyWxDump）
  - 竞品/替代：BlueMatthew/WechatExporter — 8.5k 星，基于 iTunes 备份导出 iOS 微信聊天记录；131 个 open issues 表明维护吃力；仍需持有逝者手机与备份密码。（https://github.com/BlueMatthew/WechatExporter）
  - 竞品/替代：giovantenne/lastsignal — 752 星，自托管 dead man's switch，向亲人投递加密消息；解决'生前指定联系人+死后交付'流程，但只投递自己写的内容，不接微信/游戏数据。（https://github.com/giovantenne/lastsignal）
  - 竞品/替代：alpyxn/aeterna — 301 星，End-of-Life/数字遗产规划 dead man's switch；同上，不涉及平台内容抓取。（https://github.com/alpyxn/aeterna）
  - 竞品/替代：ItalyPaleAle/hereditas — 261 星，静态'数字遗产盒'，存放密码/文件供继承人解锁；技术门槛高，面向极客。（https://github.com/ItalyPaleAle/hereditas）
- *buildable* → refuted（3）：【结论】核心痛点（亲人去世后微信聊天/朋友圈/游戏内容被平台回收清空）本质上不是第三方软件能消除的问题：内容存于腾讯/游戏厂商服务器，账号按条款不可继承、长期不登录即回收，事后任何软件都无法找回；事前能"真正保存内容"的技术路径处于与腾讯直接对抗的灰色/黑区，白区路径只剩提醒+保险箱+流程指引，价值有限且付费意愿弱。

【1. 小团队 2-6 周能否做出 MVP / 技术路径】
- 白区可做（2-4 周，Web/小程序即可）："数字遗产托管"= 死人开关（定期签到，超期后向指定家属发送加密保险箱/留言）+ 各平台身后流程指引（Apple 遗产联系人、Google 闲置账号管理员、微博纪念账号、微信/支付宝客服的注销与资金提取流程）+ 定期备份提醒 + 家属加密网盘。技术上零壁垒，开源 Aeterna（Go+React，301★）已是完整参考实现。但它不保存微信/游戏内容本身，只是清单和信封。
- 真正"保存微信内容"的路径全部依赖平台未授权的数据获取：
  a) Windows/Mac 微信 4.x：从进程内存提取 SQLCipher 密钥解密本地库（WeFlow 14.5k★、WechatBakTool 3.7k★、WeChatDataAnalysis 3.4k★ 均此路线）。WeFlow README 已明确因腾讯律师团队（MSK）DMCA 施压"不再提取密钥、不再解密数据库"
  - 竞品/替代：hicccc77/WeFlow（微信聊天记录导出/年度报告，14.5k★） — 曾靠内存取密钥解密微信 4.x 本地库，README 已声明因腾讯律师 DMCA 施压移除密钥提取与解密功能；证明该路径在法律上不可持续。不覆盖朋友圈/游戏，不面向家属。（https://github.com/hicccc77/WeFlow）
  - 竞品/替代：BlueMatthew/WechatExporter（iOS iTunes 备份解析，8.5k★） — 通过 iTunes/Finder 备份导出 iOS 微信聊天为 HTML，灰度相对低，但需电脑+本人解锁信任、131 个 open issues，操作门槛对中老年过高；逝者手机有锁屏则不可用；无朋友圈。（https://github.com/BlueMatthew/WechatExporter）
  - 竞品/替代：SuxueCode/WechatBakTool（3.7k★）/ LifeArchiveProject/WeChatDataAnalysis（3.4k★） — PC 微信数据库解密导出，后者宣称含朋友圈；同属内存取密钥路线，随版本升级失效并面临与 WeFlow 相同的法务风险。（https://github.com/SuxueCode/WechatBakTool）
  - 竞品/替代：JackyLee3362/wemo（微信朋友圈备份，265★） — 读取 PC 微信本地缓存持久化朋友圈图片/视频，需先手动浏览；README 标注 2026-04 起因微信强制升级 4.0 已失效。朋友圈无官方导出口的直接证据。（https://github.com/JackyLee3362/wemo）
  - 竞品/替代：qzz0518/Dukou（微信转发菜单导出/朋友圈批量文本化，160★） — 借微信自带转发/分享把聊天记录送到其他 App 并生成离线 HTML，合规度较高但为手动逐会话操作、以文本为主，不适合作为家属托管方案。（https://github.com/qzz0518/Dukou）
  - 竞品/替代：alpyxn/aeterna（自托管死人开关/数字遗产，301★） — 定期签到、超期自动向收件人发送加密留言与附件，AES-256-GCM，Docker 一键部署。白区方案的完整参考实现，但只传递文件/密码，不解决微信/游戏内容被平台回收的问题。（https://github.com/alpyxn/aeterna）

**用户原话 / 关键证据**：
> 《网友爸爸去世多年微信账号突然消失》热搜#9上榜2天；《人去世了微信朋友圈会消失吗》#22上榜2天，次日微信客服回应
> PyWxDump 9.7k★ 2025-10收微信律师函「删除全部代码与提交历史」

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E7%BD%91%E5%8F%8B%E7%88%B8%E7%88%B8%E5%8E%BB%E4%B8%96%E5%A4%9A%E5%B9%B4%E5%BE%AE%E4%BF%A1%E8%B4%A6%E5%8F%B7%E7%AA%81%E7%84%B6%E6%B6%88%E5%A4%B1%23&t=31&band_rank=9&Refer=top — 热搜话题：《网友爸爸去世多年微信账号突然消失》（微博热搜榜(快照排名#9，上榜2天)）
- [] https://s.weibo.com//weibo?q=%E4%BA%BA%E5%8E%BB%E4%B8%96%E4%BA%86%E5%BE%AE%E4%BF%A1%E6%9C%8B%E5%8F%8B%E5%9C%88%E4%BC%9A%E6%B6%88%E5%A4%B1%E5%90%97&t=31&band_rank=22&Refer=top — 热搜话题：《人去世了微信朋友圈会消失吗》(次日《微信客服回应人去世朋友圈消失》)（微博热搜榜(快照排名#22，上榜2天)）
- [] https://s.weibo.com//weibo?q=%23%E4%BA%A1%E5%A6%BB%E5%9C%A8%E6%B8%B8%E6%88%8F%E4%B8%AD%E7%9A%84%E6%88%BF%E5%AD%90%E6%B2%A1%E4%BA%86%E7%94%B7%E5%AD%90%E6%B1%82%E5%8A%A9%23&t=31&band_rank=21&Refer=top — 热搜话题：《亡妻在游戏中的房子没了男子求助》（微博热搜榜(快照排名#21，上榜1天)）
- https://github.com/xaoyaoo/PyWxDump
- https://github.com/alpyxn/aeterna

**产品概念**：明确不承诺保存微信内容的"数字遗产清单+死人开关"小程序/Web：生前录入账号清单（不存密码或存入E

**MVP 范围**：2-4周：账号清单+E2E保险箱

**风险**：buildable被反驳(3)：核心痛点内容在腾讯/游戏厂商服务器且按条款不可继承

### 24. 旅客观众要合规的余票监控与候补成功率工具（C16，总分 4.8）

**一句话**："只查不抢"的12306余票监控桌面端+微信推送

**用户与场景**：春运旅客与返乡学生。12306开票即候补、候补概率不透明；大麦开票秒空回流靠手动刷新

**现有方案及不足**：12306候补/接续换乘/起售提醒（不显示概率）

**为何至今没解决**：余票与候补队列数据只有12306/票务平台掌握

**验证结论**：unmet=weak(5) crowd=weak(5) buildable=weak(4)

- *unmet* → weak（5）：把 C16 拆成四个子诉求逐一核对：(1) 余票/回流监控+微信通知；(2) 候补成功率估算；(3) 方案规划（换乘/邻站/买长乘短）；(4) 多平台开票日历与规则变更提醒。

(1) 已被大量方案覆盖，但都有明显缺陷：官方侧 12306 自带候补、接续换乘、起售提醒；大麦有缺货登记/开售提醒、猫眼/B站会员购有开售提醒（缺货登记口碑差、几乎不触发，但确实存在）。第三方消费级产品 智行/携程/飞猪/高铁管家 提供余票监控+抢票+加速包，但属灰色地带，2026-02 被约谈、12306 拒绝出票 105 万张，且"预估成功率"被普遍视为营销数字。开源侧 GitHub 实测：12306 方向 testerSunshine/12306（34.1k，2023-12 归档）、pjialin/py12306（14.9k，最后实质更新 2019-01，188+ open issues，无候补）已死；仍活跃的有 wxory/CRTMonitor（328 星，纯查询余票监控，支持企业微信/飞书/Telegram/Bark/邮件，明确"并非抢票软件"，2025-07 最后提交）、Joooook/12306-mcp（1.6k，余票/中转查询，无监控通知）、2026 年仍在更新的抢票类 12306FairTicket/12306-yunying/zezeez。演出方向 ThinkerWen/TicketM
  - 竞品/替代：铁路12306 官方 App（候补购票 / 接续换乘 / 起售提醒 / 余票查询） — 部分够用：候补是唯一合规的排队通道，接续换乘覆盖了「换乘方案」，起售提醒覆盖「开票日历」的铁路部分。不够之处：候补不显示兑现概率（新版本是否有概率提示——不确定），无余票/回流到达推送，不支持邻站/买长乘短规划，规则频繁变化无提醒，节假日高峰期稳定性差。
  - 竞品/替代：智行火车票 / 携程 / 飞猪 / 同程 / 高铁管家 抢票与加速包 — 消费级、零门槛、有余票监控和推送，但属灰色自动化：2026-02 被监管约谈、12306 拒绝出票 105 万张；「预估成功率」被普遍质疑为营销数字而非基于数据；加速包被质疑无效。不满足「合规」前提。
  - 竞品/替代：大麦 缺货登记 / 开售提醒；猫眼 开售提醒；B站会员购 想看/开售提醒 — 官方合规、免费，但按平台割裂，无跨平台开票日历；缺货登记口碑很差（普遍反映几乎不触发、回流票秒被抢），无候补机制。只能算形式上存在。
  - 竞品/替代：Bypass 分流抢票（12306 免费桌面软件，含候补、余票监控、通知） — 长期流行的免费 Windows 工具，覆盖余票监控+通知+候补+自动下单，但属灰色自动化，2026 年是否仍正常可用——不确定；不做成功率估算和方案规划。
  - 竞品/替代：wxory/CRTMonitor（12306 余票监控，纯查询） — 最接近「合规余票监控+通知」的开源方案：明确不抢票，支持企业微信/飞书/Telegram/Bark/邮件。缺陷：328 星的小项目，需 Node.js 自部署或跑可执行文件，2025-07 后无更新，无候补概率、无方案规划。面向开发者而非普通旅客。（https://github.com/wxory/CRTMonitor）
  - 竞品/替代：ThinkerWen/TicketMonitoring（大麦/猫眼/纷玩岛/票星球 回流票监控） — 正好对应「合规回流监控」（仅监控不下单，跨 4 平台）。缺陷：仅邮件通知（无微信），需 Python/Docker，615 星，2025-01 后停更，2024-04 已有大麦必须登录导致失效的 issue；无开票日历。（https://github.com/ThinkerWen/TicketMonitoring）
- *crowd* → weak（5）：证据本体审视：(1) 簇内 3 条 evidence 全是 GitHub 仓库自我描述（"12306智能刷票，订票""大麦自动抢票""抢票软件，余票监控，微信通知"），是产品说明而非用户"想要但没有"的表达；且三者都是自动下单/刷票脚本，恰是簇标题要区别开的"不合规"方案，star 数衡量的是"想要能抢到票的自动化"而非"想要候补成功率估算/方案规划器/开票日历"。(2) 三条来源作者不同、彼此独立，但全部来自单一平台 GitHub；platforms 字段写了"微博"却没有任何微博引文，independent_source_count=10 与实际可见 3 条不符。(3) 互动可见且巨大：testerSunshine/12306 34,070★（已于 2023-12-19 归档）、py12306 14,959★、WECENG 7,280★、MakiNaruto 5,691★、damaihelper 4,192★、shiyutim 3,360★、Pactum7 1,940★——"很多人要抢票工具"成立。但分离出"仅监控+通知、不下单"的合规工具时热度骤降：ThinkerWen/TicketMonitoring 615★、Szymou/NNBS 377★、Bili_Ticket_Monitor 215★；"12306 余票 提醒"整站仅 6 个仓库、最高 21★；"12306 候补"
  - 竞品/替代：12306 官方候补购票 — 官方合规渠道，自 2019 年起提供候补与兑现通知；据我所知不公布候补成功率百分比与队列位置，也无买长乘短/邻站方案建议（有接续换乘推荐）——只覆盖簇诉求的一部分（https://www.12306.cn）
  - 竞品/替代：携程/智行/飞猪 抢票与余票监控（有票提醒、加速包） — 商业产品已提供多车次余票监控+有票推送，基本对应簇中的"合规回流监控"；但加速包有效性长期被质疑，且按簇自述 2026-02 第三方抢票被约谈、12306 拒绝出票——可用性与合规边界不确定
  - 竞品/替代：大麦 缺货登记 / 猫眼 回流提醒 — 据我所知大麦有"缺货登记"售罄回流通知功能（现状与到达率不确定）；猫眼是否有官方回流提醒我不确定。官方无候补队列，回流靠通知竞速，覆盖不足
  - 竞品/替代：pjialin/py12306 — 14,959★ 开源，含多日期余票查询+微信/钉钉/TG 通知+自动下单；issue 显示登录/打码频繁失效，且以自动下单为核心，不属于合规工具（https://github.com/pjialin/py12306）
  - 竞品/替代：ThinkerWen/TicketMonitoring — 615★，四大演出平台回流票纯监控+邮件通知，是最接近"合规回流监控"的开源实现；需自行抓包 token，大麦加验证码/强制登录后可用性下降（https://github.com/ThinkerWen/TicketMonitoring）
  - 竞品/替代：Joooook/12306-mcp — 1,620★，合规只读余票/中转查询 MCP，可作为规划器数据源；本身无监控推送、无候补概率、无下单（https://github.com/Joooook/12306-mcp）
- *buildable* → weak（4）：【1. MVP 可行性】合规子集可做，核心子集做不出。
能在 2-6 周做出的部分：(a) 12306 余票监控+微信通知：12306 的 leftTicket/query 查询接口公开、无需登录，开源 CRTMonitor（328 星）已用它做到「只监控不下单」并推飞书/TG/企微/Bark/SMTP，1 人 1-2 周可复刻；(b) 邻站/换乘/买长乘短方案规划器：站点表（station_name.js）与车次经停站查询均为公开接口，两段换乘搜索+邻站扩展是纯算法工作，2-3 周可完成；(c) 多平台开票日历：人工/众包维护大麦、猫眼、纷玩岛开票时间，加 ICS 导出和公众号提醒，1 周可上线。
做不出或只能做「伪解」的部分：(d) 候补成功率估算——候补队列深度、放票策略只有 12306 掌握，第三方只能靠自己长期轮询积累的「该车次/区段历史放票频率」或用户众包回报做代理指标，冷启动需跨越至少一个春运/国庆才有可信度，2-6 周内只能给启发式标签而非「成功率」；(e) 大麦/猫眼回流票秒级监控——无公开余票接口，需逆向 mtop 签名接口（shiyutim/tickets 3.4k 星的做法）或用 AutoX.js 在安卓上做 UI 自动化（Pactum7/ticket-grabbing 1.9k 星），均属对抗平台反爬。
关键架构约束：微信小程序 request 域名必须是
  - 竞品/替代：wxory/CRTMonitor（12306余票监控程序） — 328 星，JS。明确声明「仅用于学习和监控，并非抢票软件，不会增加抢票功能」，支持飞书/Telegram/企业微信/Bark/SMTP 通知。正是本簇合规核心（余票监控+通知）的开源实现，但需自部署、无个人微信直推、无换乘/邻站规划、无候补成功率估算，仅覆盖极客用户。（https://github.com/wxory/CRTMonitor）
  - 竞品/替代：BobLiu0518/CRTicketMonitor — 15 星，TypeScript，2025-09 更新，同类 12306 余票监控，同样自部署、面向开发者。（https://github.com/BobLiu0518/CRTicketMonitor）
  - 竞品/替代：shiyutim/tickets（大麦/B站会员购抢票） — 3.4k 星，Rust+Tauri，最近 14 天内有更新。含余票监控与微信通知（ClawBot 协议），但核心是自动抢票，靠逆向平台接口，声明「勿用于商业代抢」。属灰色地带，且需用户本地运行。（https://github.com/shiyutim/tickets）
  - 竞品/替代：Pactum7/ticket-grabbing（猫眼/大麦/纷玩岛 AutoX.js） — 1.9k 星，39 个 open issue。安卓 AutoX.js UI 自动化模拟人工点击，含 MaoYanMonitor 低价/余票监控。规避了接口逆向但仍是自动化抢票，需 root/无障碍权限，普通用户门槛高。（https://github.com/Pactum7/ticket-grabbing）
  - 竞品/替代：testerSunshine/12306 — 34.1k 星，2023-12-19 归档只读。自动下单+验证码识别，README 警告 12306 对阿里云/腾讯云服务器 IP 严格封禁。已停止维护，印证中心化轮询路径被封的事实。（https://github.com/testerSunshine/12306）
  - 竞品/替代：12306 官方候补 / 大麦缺货登记 — 12306 候补是唯一被监管认可的排队渠道，但成功率不透明、无回流提醒；大麦「缺货登记」提供回流提醒（存在性较确定，可靠性存疑）。两者是官方替代方案，压缩第三方合规空间。

**用户原话 / 关键证据**：
> testerSunshine/12306 34,070★（归档，issue首页仍是"现在还能用吗？"）
> GitHub搜"12306 候补 成功率"total_count=1且无关，"演唱会 开票 提醒"0结果

**证据链接**：
- [] https://github.com/testerSunshine/12306 — "12306智能刷票，订票"（34,070 stars / 9,584 forks（…）
- [] https://github.com/WECENG/ticket-purchase — "大麦自动抢票，支持人员、城市、日期场次、价格选择"；"双端支持：支持Web端（Selenium）（7,280 stars / 897 forks / 5…）
- [] https://github.com/shiyutim/tickets — 大麦网、bilibili会员购 演唱会调用接口的抢票软件，余票监控，微信通知。（3,359 stars / 85 open issues）
- https://github.com/wxory/CRTMonitor
- https://github.com/search?q=12306+%E5%80%99%E8%A1%A5+%E6%88%90%E5%8A%9F%E7%8E%87&type=repositories

**产品概念**：明确只查不抢的Electron/Tauri桌面端+浏览器插件：用户本机以30-60秒间隔轮询1230

**MVP 范围**：2-6周：桌面端余票监控+微信推送（1-

**风险**：候补队列不公开成功率只能估算且冷启动需跨越一个春运

### 25. 报销职场人自动从邮箱微信收集发票并生成汇总（C50，总分 4.8）

**一句话**：本地优先桌面工具：把QQ/163/Gmail邮箱与微信卡包

**用户与场景**：频繁出差报销的职场人。数电票散落在邮箱/微信/支付宝/短信，月底要一封封翻找下载手工查重分类填Exce

**现有方案及不足**：Invoice-Downloader 443★（仅QQ/163

**为何至今没解决**：微信卡包/支付宝对个人无API，报销方接口仅对企业主体开放

**验证结论**：unmet=weak(4) crowd=weak(5) buildable=weak(6)

- *unmet* → weak（4）：核实结论：该场景"被部分解决、但没有一个成熟且口碑好的方案完整覆盖个人/小微跨渠道归集"。(1) GitHub 实测：搜索"发票 邮箱 报销"仅 7 个仓库，只有 EthanYoQ/Invoice-Downloader 一个像样（443 star/45 fork，2026-03 创建，137 commits，2026-09-27 仍在更新，开放 issue 仅 1 个，Windows/macOS 桌面版，Apache-2.0）。它确实做到了"邮箱批量收集 PDF/OFD/XML → OCR/LLM 识别 → 查重 → 分类归档 → summary_report.xlsx"，说明核心链路已有可用开源实现；但 README 明确只支持 QQ/163 IMAP，不支持 Gmail/Outlook/企业邮箱，不接微信卡包/支付宝/短信渠道，视觉识别依赖智谱 GLM 付费 API（README 建议充值 5 元内），已关闭 issue 里有查重跨运行失效、链接式发票 PDF 丢失等数据完整性 bug（#181/#180），成熟度约等于"能用的个人项目"。其余同类仓库（invoice-copilot、Expense-Material-Inbox、invoice-fetch、invoice-manager、FapiaoAutoFlow 等 10+ 个）均 0-13 star、2026 年新建的 
  - 竞品/替代：EthanYoQ/Invoice-Downloader（开源，桌面版） — 最接近的方案：邮箱 IMAP 批量收票→OCR/LLM 识别→查重→分类→Excel 汇总，443 star、持续维护、免费开源。缺陷：仅支持 QQ/163 邮箱，不支持 Gmail/Outlook/企业邮箱；不接微信卡包/支付宝/短信；视觉识别依赖智谱付费 API；曾有查重跨运行失效、链接票 PDF 丢失等数据完整性 bug；半年项目成熟度有限。对 QQ/163 用户基本够用，对跨渠道/其他邮箱用户不够。（https://github.com/EthanYoQ/Invoice-Downloader）
  - 竞品/替代：erma0/fapiao-print 发票酱（开源） — 本地 PDF/OFD/XML/图片发票识别、按发票号查重、14 字段 Excel 汇总、排版打印，161 star、MIT、活跃。不做任何渠道收集（需手工先下载），仅 Win10+；只覆盖"整理+汇总"半段。（https://github.com/erma0/fapiao-print）
  - 竞品/替代：微信卡包 / 微信发票助手（腾讯内置） — 自动保存微信渠道开具的电子发票，支持抬头管理、批量发送到邮箱、对接部分企业报销 OA。只覆盖微信渠道，不汇集邮箱/支付宝/短信票，不生成报销 Excel；"发送到邮箱"可作为汇总到邮箱的绕路。
  - 竞品/替代：支付宝发票管家（内置） — 归集支付宝渠道电子发票，支持查验、发送邮箱/一键报销到对接 OA。只覆盖支付宝渠道，无跨渠道查重与 Excel 汇总。
  - 竞品/替代：QQ 邮箱 / 网易邮箱大师 发票助手（邮箱内置功能） — 我较确定两者都有自动识别邮箱中发票邮件并归集、合并/导出的功能（具体能力细节不完全确定）。免费、零安装，对邮箱渠道的收集与合并够用；不做跨渠道、OCR 分类与报销台账，也不覆盖 Gmail/企业邮箱用户。
  - 竞品/替代：合思(易快报) / 每刻 / 分贝通 / 汇联易 / 钉钉智能财务 / 金蝶用友费控 等费控 SaaS — 功能上完整覆盖：邮箱收票、微信卡包/支付宝导入、OCR、查重、查验、自动生成报销单、与财务系统对接，口碑成熟。缺陷：面向企业采购与部署，个人/自由职业者无法独立使用；主流按人/年收费，小团队免费版（钉钉智能财务、合思免费版）功能受限。
- *crowd* → weak（5）：对簇内证据的审视：(1) 证据#1 引文是 Invoice-Downloader 仓库自己的一句话简介（产品宣传语），不是任何用户在表达"想要但没有"。仓库真实：443★/45 fork，创建于 2026-03-02，但半年内非作者提交的 issue 只有 3 条（#1 要 126 邮箱、#4 要 NAS/Docker 多账号、#171 要 docker 版），无用户抱怨/附和讨论；作者本人在 eryajf/learning-weekly#132 与 XiaomingX/1000-chinese-independent-developer-plus#113 主动投稿自荐，说明 star 有相当部分来自榜单曝光而非自然口碑。(2) 证据#2 被误读：我 curl 了 1c7/chinese-independent-developer 的原始 README，含"发票"的条目只有 4 行——第 475 与 846 行是同一个 Invoice-Downloader 被重复收录两次，第 521 行 MailMergeOnline 是 PDF 模板批量生成，第 1752 行 Billcraft 是"发票生成工具"（卖方开票，与从邮箱/微信收集报销发票完全无关）。所谓"另有 4 款发票/报销类工具"实际 = 2×同一项目 + 2 个开票/生成类工具，因此证据#2 与证据#1 不独立，簇的有效独立
  - 竞品/替代：EthanYoQ/Invoice-Downloader (InvoiceFlowAI) — 最接近的开源方案：QQ/163 邮箱 IMAP 批量收票 + OCR/视觉识别 + 分类 + Excel 汇总，Win/macOS 桌面版。缺口：不支持 126/Gmail 等其他邮箱（issue #1）、不支持微信卡包/支付宝/短信渠道、需本地常开（issue #4）。443★ 但用户 issue 仅 3 条，社区反馈稀薄。（https://github.com/EthanYoQ/Invoice-Downloader）
  - 竞品/替代：WRCoding/autoEmail — 2024 年个人脚本，Selenium 抓 QQ 邮箱发票并分类，仅 QQ 邮箱，21★，2 个 open issue 未处理，基本停更。（https://github.com/WRCoding/autoEmail）
  - 竞品/替代：ke4king/invoice_system — FastAPI+Vue 自托管，IMAP/POP3 邮箱归集 + OCR + 打印，面向个人私有化部署；24★，需要自己部署服务，普通职场人门槛高。（https://github.com/ke4king/invoice_system）
  - 竞品/替代：wangshub/FapiaoAutoFlow — 邮件监控→解析→下载→按月归档，13★，2026-03 与 Invoice-Downloader 几乎同期出现，功能子集。（https://github.com/wangshub/FapiaoAutoFlow）
  - 竞品/替代：erma0/fapiao-print (发票酱) — 161★，处理已在本地的 PDF/OFD/XML：批量打印、重命名、查重、CSV 汇总；不解决从邮箱/微信收集这一步。（https://github.com/erma0/fapiao-print）
  - 竞品/替代：sanluan/einvoice — 292★ 的发票识别库（PDF/OFD 字段抽取），是底层能力而非面向报销人的完整工具。（https://github.com/sanluan/einvoice）
- *buildable* → weak（6）：【簇 C50 概况】痛点：报销者要从邮箱/微信/支付宝/短信翻找 PDF/OFD/XML 发票、查重、分类、填 Excel。证据主要是 GitHub 开源项目 Invoice-Downloader（2026-03 创建，443 star/45 fork/1 open issue，Apache-2.0，Python，Win/macOS 桌面版）；独立来源 2 个，crowd_signal=several。

【1. 小团队 2-6 周能否做出 MVP：能（邮箱通道），技术路径清晰】
- 采集：IMAP 连接 QQ/163（授权码）、Gmail/Outlook（OAuth/应用密码），按主题/发件人/附件类型（.pdf/.ofd/.xml）四层过滤，附带解析邮件正文里的"下载链接"类发票（百望云/电子税务局链接）。
- 解析：数电票 XML 为结构化格式直接读字段；PDF 有文字层，PyMuPDF/pdfplumber + 正则即可抽发票号码(20位)/日期/金额/税额/购销方，无需 OCR；OFD 本质是 zip+XML，GitHub 已有可复用库（sanluan/einvoice 292★ Java、invoice-ofd2json JS、ofd2img Python）；图片/扫描件才需 OCR（PaddleOCR/云 OCR）。LLM 抽取作为兜底而非主路径。
- 查重：以发票号
  - 竞品/替代：EthanYoQ/Invoice-Downloader (InvoiceFlowAI) — 最接近的开源方案：IMAP 批量收 QQ/163 邮箱 PDF/OFD/XML 发票，本地 OCR+LLM/GLM-4.5V 双轨抽取，分类归档、Excel 汇总，Win/macOS 桌面版。443★/45 fork，2026-03 创建，活跃维护。局限：不支持微信/支付宝/短信渠道；依赖 Playwright+Chromium+ONNX 较重；面向技术用户，非消费级产品；免费，压低商业化定价空间。（https://github.com/EthanYoQ/Invoice-Downloader）
  - 竞品/替代：sanluan/einvoice — Java 电子普票/专票 PDF+OFD 解析库，292★，可作为解析层构件；非终端产品，不做采集与汇总。（https://github.com/sanluan/einvoice）
  - 竞品/替代：erma0/fapiao-print 发票酱 — Rust 桌面+Web，支持 PDF/OFD/XML/图片识别、排版打印、重命名、导出，161★，2026-04 创建。解决整理与打印环节，不做邮箱/微信采集。（https://github.com/erma0/fapiao-print）
  - 竞品/替代：384863451/invoice_ocr — 混合票据 OCR（增值税票、火车票、机票、出租车票等），172★，可用作图片类票据识别构件；非产品。（https://github.com/384863451/invoice_ocr）
  - 竞品/替代：ke4king/invoice_system — 自托管 FastAPI+Vue 发票管理系统，支持邮箱与手动上传归集、百度 OCR、看板、批量导出，24★；需 Docker 部署，面向技术个人。（https://github.com/ke4king/invoice_system）
  - 竞品/替代：steedos/feikongwang 费控王 — 开源 SAP Concur 替代，发票扫描识别、验真、查重、差旅与报销流程，15★；面向企业部署，非个人工具。（https://github.com/steedos/feikongwang）

**用户原话 / 关键证据**：
> WRCoding/autoEmail README："每个月有报销发票的需求
> Invoice-Downloader 2026-03创建半年443★

**证据链接**：
- [] https://github.com/EthanYoQ/Invoice-Downloader — 电子发票整理与报销准备工具：从邮箱批量收集 PDF/OFD/XML 发票…（443 stars / 45 forks）
- [] https://raw.githubusercontent.com/1c7/chinese-independent-developer/master/README.md — "[Billcraft]：单 HTML 文件的发票生成工具，零依赖，支持离线使用"；（清单中发票/报销类产品 4 条）
- https://github.com/EthanYoQ/Invoice-Downloader/issues/1
- https://github.com/WRCoding/autoEmail

**产品概念**：Tauri/Electron本地桌面应用：IMAP/OAuth连接QQ/163/126/Gmail

**MVP 范围**：3-4周1-2人：多邮箱采集+PDF

**风险**：微信/支付宝渠道对个人无API只能靠手动转发，差异化受制于生态

### 26. 视障者过验证码人脸识别弹窗的本地视觉辅助（C46，总分 4.6）

**一句话**：与读屏并存的Android"按需视觉助手

**用户与场景**：使用争渡/保益/TalkBack。登录支付抢票领补贴时被图片验证码、滑块、"请眨眼"人脸活体

**现有方案及不足**：VoiceOver屏幕识别（不理解图形）

**为何至今没解决**：验证码本质反自动化，自动过验证码与风控对立

**验证结论**：unmet=weak(5) crowd=weak(4) buildable=weak(5)

- *unmet* → weak（5）：核心场景拆解为四件事：(1) 在读屏卡住时对当前手机屏幕做视觉理解并告诉"怎么点"；(2) 覆盖图片/滑块验证码；(3) 覆盖"请眨眼"类人脸活体动作提示；(4) 本地运行、中国大陆可用。逐一对照现有方案：

平台内置：Apple VoiceOver 屏幕识别（iOS 14+）在端侧识别无标签按钮/图片，免费、大陆可用，对"找不到弹窗关闭按钮"有部分帮助，但不理解图形语义，对验证码/滑块/活体无效，也不给操作建议。Google TalkBack 2024-2025 起集成 Gemini（Pixel 端侧 Gemini Nano 描图 + 云端 Gemini "询问整屏内容"），是最接近该诉求的成熟产品，但依赖 GMS，大陆手机不预装/不可用，且整屏问答走云端；Google 自身也不宣称能过验证码。

海外 app：Be My Eyes/Be My AI（志愿者视频 + GPT-4V 描述）、Seeing AI 可描述分享过去的截图，免费、口碑好，但走 OpenAI/微软云，大陆网络下不可靠；"截图→分享→等描述→切回"流程对限时验证码和活体检测太慢；志愿者视频无法看到用户自己的手机屏。JAWS Picture Smart AI、NVDA AI Content Describer（开源，70 star，支持整屏描述和本地 Ollama/llama.cpp）覆盖"本地 VLM + 读屏
  - 竞品/替代：Apple VoiceOver 屏幕识别 (Screen Recognition) + 图像描述 — 部分够用：端侧 ML 识别无标签按钮/图片/文本，免费、大陆 iPhone 可用，对'找不到弹窗关闭按钮'有帮助；但不理解图形语义、不给操作指引，对图片验证码、滑块拼图、人脸活体动作提示全部无效，识别准确率不稳定。
  - 竞品/替代：Google TalkBack + Gemini（图像描述 / 询问屏幕内容，Android 15-16） — 最接近诉求的主流产品：可描述无标签图片并对整屏内容问答；但依赖 GMS/Pixel 或 Google 服务，大陆国产安卓不预装且服务不可达；整屏问答为云端；Google 不宣称能过验证码或活体检测。对中国视障用户基本不可用。
  - 竞品/替代：Be My Eyes / Be My AI（志愿者视频 + GPT-4V 描述截图） — 海外口碑很好且免费，可把截图分享给 Be My AI 获得描述；但走 OpenAI 云端，大陆网络下不可靠；'截图→分享→等待→切回'对限时验证码/活体太慢；志愿者视频无法看到用户自己手机屏幕。
  - 竞品/替代：Microsoft Seeing AI — 免费、支持中文，可描述相册中的截图，但以摄像头场景为主，云端处理，不与读屏联动，无法在弹窗/验证码卡住时实时介入。
  - 竞品/替代：NVDA + AI Content Describer 插件（开源） — 思路与诉求最吻合（读屏 + 整屏描述 + 可选本地 Ollama/llama.cpp + 'computer use'），70 star、持续维护；但仅 Windows 桌面，本地模型标注 unstable，完全不覆盖手机 app 场景。（https://github.com/cartertemm/AI-content-describer）
  - 竞品/替代：JAWS Picture Smart AI — 商业读屏 JAWS 的云端 AI 描图/描屏功能，付费、Windows 桌面，不覆盖手机。
- *crowd* → weak（4）：证据本身审视：(1) 三条 evidence 中没有一条是视障用户本人在说"我想要一个本地视觉辅助工具"。中新网 2023-12 稿是记者对痛点的转述（验证码/人脸识别/弹窗令人头疼），是媒体报道而非需求表达；深圳信息无障碍研究会那条引文"一群视障者在互联网上修盲道"是关于视障者自发做无障碍适配的报道，与"本地 VLM 帮我看屏幕"这一诉求无直接关系，很可能是同一批媒体稿的转载（站点不可访问，无法核实，标记不确定）——两条媒体来源相互独立性存疑。(2) HearWeChat 是唯一的"解决方案侧"证据：实测 1 star、1 fork、0 issues、1 commit，是单个开发者的探索性项目，没有任何附和。(3) 簇标 independent_source_count=4、platforms 含"少数派"，但 evidence 只有 3 条且无少数派条目；所有条目 engagement 为 unknown（唯一有数字的是 1 star）。crowd_signal="many" 完全没有可见的互动/点赞/star 支撑。(4) GitHub 补充搜索：中文"视障 读屏 验证码/人脸识别"几乎搜不到用户 issue；仅 deepseek-ai/DeepSeek-V3#609（25 reactions，视障用户抱怨安全验证挡住读屏登录，closed-as-stale）、brave#7
  - 竞品/替代：cartertemm/AI-content-describer (NVDA 插件) — Windows 桌面端已实现'整屏/焦点对象 AI 描述'，支持 Ollama/llama.cpp 本地模型与 AI 操控鼠标键盘；70 star 说明有真实但很小的用户群。不覆盖安卓手机场景，也不能过验证码/活体检测。（https://github.com/cartertemm/AI-content-describer）
  - 竞品/替代：chigkim/VOCR (macOS) — macOS VoiceOver 用户的 OCR+本地视觉模型屏幕理解，85 star，含 Computer Use。同样不覆盖手机端与中文 App 生态。（https://github.com/chigkim/VOCR）
  - 竞品/替代：dessant/buster — 浏览器扩展，用语音识别过 reCAPTCHA 音频挑战，9.3k star；只针对桌面浏览器 reCAPTCHA，对国内 App 内的图片/滑块验证码和人脸活体无效。（https://github.com/dessant/buster）
  - 竞品/替代：laoyin/HearWeChat — 簇内引用的本地 Qwen3-VL 方案，1 star/1 commit，仅限微信消息场景，不处理验证码/人脸/弹窗，处于原型阶段。（https://github.com/laoyin/HearWeChat）
  - 竞品/替代：PineappleSnowy/VisionVoice — 33 star 的中文视障助手，聚焦摄像头场景（避障、寻物、相册），不做屏幕内容理解。（https://github.com/PineappleSnowy/VisionVoice）
  - 竞品/替代：主流读屏/商用 AI 描述（Be My AI、Seeing AI、TalkBack Gemini 图片描述、iOS 屏幕识别、争渡/保益 AI 识图） — 据我所知 2023-2024 起已普遍提供云端 AI 图片/屏幕描述，'帮我看一眼'这一半诉求已被部分覆盖；但均为云端、且不能替代用户完成滑块拖拽或活体动作。具体国内读屏的 AI 识图功能细节不确定。
- *buildable* → weak（5）：【簇要点】C46：中国视障读屏用户在图片验证码、滑块拼图、人脸活体（请眨眼）、无标签弹窗处被卡死，诉求「读屏卡住时帮我看一眼并告诉我怎么点」的本地视觉辅助。4 个独立来源、crowd_signal=many，但 GitHub 上仅 HearWeChat（1 star、单次提交、只在 Redmi K90 Max 上跑通 Qwen3-VL-2B/MNN，竞赛原型）。

【1. 小团队 2-6 周能否做出 MVP】可以，但只能覆盖需求的「合法子集」且仅限 Android。
技术路径（Kotlin）：AccessibilityService 读节点树 + dispatchGesture 代点/拖动；AccessibilityService.takeScreenshot()（Android 11+）或 MediaProjection 截屏；触发方式为音量键长按/悬浮球/无障碍快捷键，与 TalkBack/争渡/保益悦听并存（Android 允许多个无障碍服务并行，本产品定位「按需视觉助手」而非全功能读屏）；视觉理解用云端 VLM（Qwen-VL/GLM-4V/Doubao-vision，单张约 0.002-0.01 元）2 周可跑通；「本地运行」需 Qwen3-VL-2B/MNN 或 llama.cpp，只在 8GB+ 内存旗舰机上 3-8 秒出结果，视障用户普遍用中低端机，只能做本地 OC
  - 竞品/替代：cartertemm/AI-content-describer (NVDA 插件) — 70 stars，Windows NVDA 插件，支持 OpenAI/Gemini/Claude/Ollama/llama.cpp 描述控件与图片，并已加入「computer use」代操作。证明 VLM+读屏 模式可行且有社区需求，但仅桌面 Windows、英文生态、README 不涉及验证码，对中国手机 App 场景无覆盖。（https://github.com/cartertemm/AI-content-describer）
  - 竞品/替代：laoyin/HearWeChat — 1 star、单次提交的竞赛原型：Android 无障碍 + MediaProjection + 本地 Qwen3-VL-2B/MNN 读微信图片/红包，只在 Redmi K90 Max 上跑通。方向与本簇完全一致但不可用，验证了「本地 VLM 需旗舰硬件」的限制。（https://github.com/laoyin/HearWeChat）
  - 竞品/替代：josevitorrodriguess/ClarIAr — 13 stars，Android 增强 TalkBack 的 AI 图片描述，无验证码/弹窗/代点能力，非中文生态。（https://github.com/josevitorrodriguess/ClarIAr）
  - 竞品/替代：Google TalkBack Gemini 图片/屏幕描述、Apple VoiceOver 屏幕识别、Be My Eyes/Be My AI、Microsoft Seeing AI — 基于自有知识：TalkBack 的 Gemini 描述需 GMS，国内不可用；VoiceOver 屏幕识别可识别无标签控件但不处理验证码；Be My AI 可描述照片/截图但需手动分享、云端、非中文优先；均不做代点，也不解决验证码与活体。
  - 竞品/替代：争渡读屏、保益悦听、鱼鱼读屏（中国安卓读屏/OCR） — 簇内已列：只能读有无障碍标签的控件或 OCR 文字，遇图片验证码、滑块、活体全部失效；争渡是否已加 AI 图片描述功能不确定。

**用户原话 / 关键证据**：
> 中新网2023-12："App上的验证码、人脸识别和弹窗常常令人头疼，例如以图片形式呈现的验证码
> DeepSeek-V3 #609（视障用户，25 reactions

**证据链接**：
- [] https://www.chinanews.com.cn/sh/2023/12-06/10123190.shtml — App上的验证码、人脸识别和弹窗常常令人头疼，例如以图片形式呈现的验证码、需要移动滑块完成拼图…
- [] https://www.siaa.org.cn/news_content?id=878 — 一群视障者，在互联网上修'盲道'（视障者自发做无障碍适配的报道）
- [] https://github.com/laoyin/HearWeChat — 在遇到图片、表情包、红包、复杂排版等传统读屏难以处理的内容时，调用本地运行的 Qwen3-VL 视…（1 star, 1 fork）
- https://github.com/deepseek-ai/DeepSeek-V3/issues/609
- https://github.com/cartertemm/AI-content-describer

**产品概念**：与现有读屏并行的Android无障碍服务"看一眼"：音量键长按或悬浮球触发

**MVP 范围**：3-4周1名Android开发

**风险**：iOS完全封闭砍掉一半用户；支付/补贴/人脸页面多设FLAG_SECURE最痛场景拿不到

### 27. 消费者要自动盘点订阅/免密授权并代为取消（C12，总分 4.4）

**一句话**："订阅体检"工具：导入支付宝/微信账单与Apple收据

**用户与场景**：开着多个订阅与免密支付的城市消费。不记得订了什么何时扣款哪些没用；取消入口被刻意做深；三处授权列表互不汇总

**现有方案及不足**：支付宝自动扣款/微信自动续费/Apple订阅页（单渠道）

**为何至今没解决**：续费是平台核心营收，Apple/支付宝/微信不开放授权列表读取与取消接口

**验证结论**：unmet=weak(4) crowd=weak(5) buildable=weak(4)

- *unmet* → weak（4）：把 C12 拆成 5 个子能力：①跨渠道（Apple/微信/支付宝/银行卡/各App）自动汇总订阅与免密授权；②识别未使用项；③到期/异常扣款预警；④代为取消/暂停并一键恢复；⑤协助退费。逐一对照现有方案。

海外：Rocket Money（原 Truebill，Rocket Companies 旗下，千万级用户）通过 Plaid 连银行自动识别周期性扣款、到期提醒，并在 Premium（约 $6-12/月）里提供「代取消」服务，覆盖①(仅银行流水)②③④，属成熟商业方案；但仅美国、需绑定银行、代取消在收费墙后，口碑长期有「自身订阅难取消/上销售/代取消其实是替你发请求且常失败」的抱怨，且 Apple/Google/PayPal 内购订阅第三方无法代取消，⑤退费无覆盖。Privacy.com 按商户虚拟卡（有免费档）是「止付开关」，能解决「停不掉就锁卡」，但不解决盘点、取消与退费。DoNotPay 声称能取消订阅，但 2024 年被 FTC 处罚虚假宣传，口碑差。Apple 设置-订阅、Google Play 订阅、PayPal 自动付款、发卡行「周期性扣款/卡片存档」视图（Chase、Capital One Eno 试用期提醒等）都是单渠道管理页。Mint 2024 年已关闭；Copilot/Monarch/Emma 等记账类能识别周期扣款但不代取消（Emma 部分代取消不确定）
  - 竞品/替代：Rocket Money（原 Truebill） — 美国市场最成熟的商业方案：Plaid 连银行自动识别周期性扣款、到期提醒、Premium（约 $6-12/月）提供代取消（人工/半自动向商家发起）与账单议价（抽成）。覆盖「自动盘点+预警+代取消」大半核心场景，但仅美国、需绑定银行、代取消在付费墙后、无法触达 Apple/Google/PayPal 内购订阅、无退费协助；口碑长期有「自身订阅难取消、上销售、代取消常失败」的抱怨。对海外用户基本够用，对中国用户完全不可用。
  - 竞品/替代：Privacy.com 按商户虚拟卡（及 Capital One Eno / Revolut 一次性卡等） — 给每个订阅单独发卡、可随时暂停/关闭，从支付侧「一键止付」，免费档 12 张/月。解决「取消入口太深就直接锁卡」，但不做盘点、不识别闲置、不走正式取消流程（商家可能催收）、不协助退费；仅美国/欧洲。
  - 竞品/替代：支付宝「免密支付/自动扣款」管理页、微信支付「扣费服务/自动续费」管理页 — 中国用户的平台内置入口：列出该渠道全部免密/自动扣款授权，可一键关闭，且 2024-07 起依《消保法实施条例》在扣款前推送提醒。覆盖单渠道的「我订了什么、何时扣、一键关」，但与 Apple/银行卡/其他渠道互不汇总、不识别未使用、不代取消商家侧会员、不协助退费；入口层级深、老人不易找到。属基本可用但不完整。
  - 竞品/替代：Apple 设置-订阅 / Google Play 订阅 / 华为、小米应用商店自动续费管理 / PayPal 自动付款 / 发卡行周期性扣款视图 — 各自渠道内的订阅清单与取消入口，Apple/Google 会在续费前发邮件提醒。仅覆盖本渠道，且 Apple/Google 不开放第三方代取消，是第三方汇总方案的硬性障碍。
  - 竞品/替代：Wallos / SubsTracker / huhusmang Subscription-Management / wapy.dev / ajnart-subs / subtrackr 等开源自托管订阅追踪器 — 活跃、免费、可自托管（Wallos 8.6k 星、SubsTracker 3.2k 星中文），提供手工录入、日历、到期多渠道提醒与统计。不接银行/邮箱/支付平台、不自动盘点、不代取消、不识别闲置，只解决「记住订了什么」中愿意手工维护的那部分用户，不覆盖核心诉求。（https://github.com/ellite/Wallos）
  - 竞品/替代：rohunvora/just-fucking-cancel（Claude Code skill） — 最接近「自动盘点+代取消」的开源实现：银行 CSV → LLM 识别周期扣款 → 审计报告 → 浏览器自动化走取消流程。但需 Claude Code 付费订阅与本机 Chrome、手动导出 CSV、逐步人工确认、无 App Store/Google Play/PayPal、无退费/暂停恢复、498 星、2026-01 后基本停更，属演示级而非可交付产品。（https://github.com/rohunvora/just-fucking-cancel）
- *crowd* → weak（5）：对簇内证据逐条审视（C12 由 A03 六条 + C21 八条合并，声称 14 个独立来源）：
(1) 引文是否表达"想要但没有"：微博 4 条全是新闻事件热搜（关闭支付功能仍被扣184万＝异常扣款/疑似诈骗个案；爱奇艺充25年退费难＝误操作退费纠纷；两会建议严禁免密默认勾选＝政策提案；为关闭扣费下载软件被骗18万＝诈骗案），没有任何一条是用户说"我要一个能汇总并代取消的工具"，"工具需求"是簇作者从事故新闻反推出来的。小红书 2 条是"番茄清单/日历app"问答聚合页，搜索代理自己注明"没找到订阅管理相关内容"，纯噪音。英文侧：HN 43772295 是 Ask HN 里一条个人回答；Suhail 推文是 2020 年（6 年前）一个人的想法，且当时 Truebill 已存在；TikTok 两条是"someone should build"点子清单（同一内容重复计数）；Medium 两篇是观点文/enshittification 文章，非需求；"Ask HN: Your paid subscriptions"是互相晒订阅，非需求；MonoBoost 差评算"现有方案不行"的有效证据。真正的直接需求表达只有 HN 一条、Suhail 一条、MonoBoost 差评，其余是被误读或无关。
(2) 独立性：184万事件 4 个话题、爱奇艺事件 3 个话题被分别计数；TikTok 两页同
  - 竞品/替代：ellite/Wallos（开源自托管订阅追踪器） — 8.6k★，覆盖'盘点与到期提醒'，但需手动录入；银行同步(Plaid)请求被维护者关闭为 not planned；无代取消、无退费协助，不接支付宝/微信/Apple。（https://github.com/ellite/Wallos）
  - 竞品/替代：rohunvora/just-fucking-cancel（Claude Code 代取消订阅） — 498★，最接近'自动审计+代为取消'：解析信用卡 CSV 识别循环扣费并用浏览器自动化走取消流程（需用户确认）。局限：仅美国银行 CSV 导出、需 Claude Code + Claude Pro（$20/月）、非产品化、不覆盖中国支付体系与免密授权。（https://github.com/rohunvora/just-fucking-cancel）
  - 竞品/替代：huhusmang/Subscription-Management（中英双语订阅管理） — 900★，面向中文用户的手动订阅台账+提醒（Telegram/Email），无自动识别、无取消。（https://github.com/huhusmang/Subscription-Management）
  - 竞品/替代：wapy.dev / ajnart/subs / bscott/subtrackr 等 OSS 追踪器 — 各 470-530★，同为手动录入+提醒，不解决'自动发现'与'代取消'。（https://github.com/search?q=subscription+tracker&type=repositories&s=stars&o=desc）
  - 竞品/替代：Rocket Money（前 Truebill）/ Trim 等美国商业方案（基于知识，未访问） — 连接银行自动识别订阅并提供付费/抽成的代取消服务，Truebill 2021 年被 Rocket 收购（约 12.75 亿美元），说明美国市场该需求已被商业化大规模服务；局限：仅美国、需连银行、自身收费、隐私顾虑。
  - 竞品/替代：支付宝'免密支付/自动扣款'管理页、微信'自动续费'管理页、Apple/Google 订阅页、主流美国银行 App 的订阅识别功能（基于知识，未访问） — 各自能查看并关闭本平台内的授权/订阅，但互不汇总、无未使用识别、无异常预警、无退费协助；中国监管（2024 年消保法实施条例要求自动续费前提醒）以约谈与个案处理为主，无统一管理入口。
- *buildable* → weak（4）：【簇拆解】痛点分四层：(a)跨支付宝/微信/Apple/银行卡自动盘点订阅与免密授权；(b)识别未使用项+扣费/异常预警；(c)代为取消/暂停/恢复；(d)协助退费。评估结论：(b)(d)和"半自动的(a)"可在2-6周做出，但簇标题里的"自动盘点"与"代为取消"两个核心承诺恰好卡在平台壁垒上，且这正是 why_unsolved 的真实原因，而非"没人想到"。

【1. MVP 可行性】
可做（1-3人、3-5周）：网页/小程序/iOS App，路径为——用户手动导出支付宝账单CSV、微信账单（邮件zip）、Apple 收据邮件/`reportaproblem.apple.com` 页面复制、银行扣款短信（仅Android可读取；iOS完全不可）→ LLM 归一化商户名并识别周期性扣费 → 生成订阅清单、下次扣款日历、"N个月无使用"提示（只能基于扣费规律与用户自报，拿不到使用数据）→ 每个商户附深度链接+图文取消路径（支付宝"支付设置-免密支付/自动扣款"、微信"服务-支付-自动续费"、iOS 设置-订阅）→ LLM 生成 12315/黑猫投诉/平台客服退费申诉模板。技术上全部是成熟组件（CSV 解析、LLM 分类、日历提醒、模板生成），2-6周绰绰有余。
做不到（在合法边界内）：
- "自动"汇总：国内无 Plaid 类开放银行接口；支付宝/微信不向第三方开放自动扣款/免密授权
  - 竞品/替代：Wallos（开源自托管订阅追踪） — 8.6k stars、432 forks、61 open issues；纯手工录入订阅+多渠道到期提醒+统计日历+多币种，可接 ChatGPT/Ollama 做建议。不自动从银行/邮件/支付平台发现订阅，不做取消。覆盖了 MVP 可合法实现的"可见性+提醒"部分且免费，说明该层无付费空间。（https://github.com/ellite/Wallos）
  - 竞品/替代：Rocket Money（原 Truebill） — 美国市场事实标准：Plaid 连接银行自动识别周期扣费，Premium 6-12 美元/月，"代取消"由人工客服替用户联系商户完成，另有账单议价抽成。2021 年以约 12.75 亿美元被 Rocket Companies 收购，证明美国有付费意愿；但依赖美国开放银行数据与人力运营，对中国用户不可用，且已占据该赛道。（https://www.rocketmoney.com）
  - 竞品/替代：支付宝"自动扣款/免密支付"管理、微信"自动续费"管理、iOS 设置-订阅 — 各自只覆盖本平台通道，互不汇总；在监管要求下已有到期前提醒（国内要求到期前5日显著提醒）。是用户实际取消的唯一合法入口，第三方工具只能深链跳转到这些页面。
  - 竞品/替代：subflo / MailSpend-AI（GitHub，Gmail+LLM 自动识别订阅） — 0 stars；技术路径（扫描邮件收据→LLM 识别周期性扣费，无需银行 API）与本簇 MVP 的"半自动盘点"一致，但零关注，且国内 App 几乎不发账单邮件，该路径在中国无效。（https://github.com/huzaifa525/subflo）
  - 竞品/替代：Bobby 等 iOS 手工订阅记账 App — App Store 上长期存在的一次性付费/免费手工订阅追踪类 App（Bobby 较确定存在，其余不逐一确认）。手工录入+提醒，不自动发现、不代取消。
  - 竞品/替代：Trim（美国账单议价/订阅取消服务） — 曾提供订阅识别与取消、账单议价，后被 OneMain Financial 收购；截至知识截止日其独立产品现状不确定。

**用户原话 / 关键证据**：
> 微博热搜《男子爱奇艺会员充了25年遇退费难》#2、同事件3话题上榜；《建议严禁免密支付默认勾选》#10
> Wallos 8.6k★/432 forks，topic:subscription-tracker共142个仓库全部手工

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E5%A4%9A%E6%96%B9%E5%9B%9E%E5%BA%94%E5%85%B3%E9%97%AD%E6%94%AF%E4%BB%98%E5%8A%9F%E8%83%BD%E5%90%8E%E8%A2%AB%E6%89%A3184%E4%B8%87%23&t=31&band_rank=32&Refer=top — 热搜话题：《多方回应关闭支付功能后被扣184万》(相关《关闭支付宝支付功能后被扣捐赠184万》《支…（微博热搜榜(快照排名#32，上榜2天)；）
- [] https://s.weibo.com//weibo?q=%23%E7%94%B7%E5%AD%90%E7%88%B1%E5%A5%87%E8%89%BA%E4%BC%9A%E5%91%98%E5%85%85%E4%BA%8625%E5%B9%B4%E9%81%87%E9%80%80%E8%B4%B9%E9%9A%BE%23&t=31&band_rank=2&Refer=top — 热搜话题：《男子爱奇艺会员充了25年遇退费难》(同日《视频平台不能因为监督才退费》《爱奇艺回应充2…（微博热搜榜(快照排名#2，上榜1天)；同事件3个话题上榜）
- [] https://s.weibo.com//weibo?q=%23%E5%BB%BA%E8%AE%AE%E4%B8%A5%E7%A6%81%E5%85%8D%E5%AF%86%E6%94%AF%E4%BB%98%E9%BB%98%E8%AE%A4%E5%8B%BE%E9%80%89%23&t=31&band_rank=10&Refer=top — 热搜话题：《建议严禁免密支付默认勾选》(两会建议)（微博热搜榜(快照排名#10，上榜1天)）
- https://github.com/ellite/Wallos
- https://github.com/rohunvora/just-fucking-cancel

**产品概念**：网页/小程序"订阅体检"：用户导出支付宝账单CSV、微信账单邮件zip

**MVP 范围**：3-5周1-3人：账单解析+LLM识别

**风险**：Apple/支付宝/微信不开放读取与取消接口，"自动盘点+代取消

### 28. 普通人要免登录、多模型切换核验的AI入口（C21，总分 4.4）

**一句话**：微信小程序形态的"多模型陪审团"：openid静默登录免手机

**用户与场景**：普通AI用户、学生、办公族。DeepSeek反复崩（同话题上榜13天）、豆包收费后月活减610万

**现有方案及不足**：duck.ai/LMArena/ChatGPT免登录（需翻墙）

**为何至今没解决**：国内生成式AI管理办法与实名制让合规产品无法真免登录

**验证结论**：unmet=weak(5) crowd=weak(4) buildable=weak(4)

- *unmet* → weak（5）：簇C21把5个诉求打包：免登录即用、多模型可用性兜底/切换、并列对比交叉核验、广告标注、小白模板。逐项对照现有方案：

【海外已基本解决】duck.ai（DuckDuckGo AI Chat）完全免登录、免费、可在GPT-4o mini/Claude Haiku/Llama/Mistral等模型间切换，口碑好、持续维护；LMArena/arena.ai（GitHub org "Arena (formerly LMArena)"，FastChat 39.6k★，页面自述"serving over 10 million chat requests for 70+ LLMs"）免登录即可让两个模型并列回答同一问题并投票——这正是"5家AI答案不一样、不知信谁"的现成交叉核验入口；ChatGPT 2024年4月起免登录可用；OpenRouter Chatroom/Poe 提供多模型切换与对比（需登录，freemium）。对海外普通用户，"免登录+多模型+并列对比"已经被口碑好的免费产品覆盖，这一半应判 refuted。但这些全部需要翻墙，对簇的证据来源（微博/抖音上的中国普通用户、学生、上班族）不可达。

【中国市场：多模型切换已解决，免登录被监管结构性封死】DeepSeek 2025年初崩溃后，腾讯元宝（DeepSeek R1/混元切换）、纳米AI搜索（360，聚合DeepSeek/豆包
  - 竞品/替代：duck.ai (DuckDuckGo AI Chat) — 海外场景基本够用：完全免登录、免费、匿名，可在 GPT-4o mini / Claude Haiku / Llama / Mistral 等模型间一键切换，口碑好、持续维护。缺陷：无并列对比/交叉核验；只提供中小型模型；中国大陆需翻墙，对簇的目标用户不可达。（https://duck.ai）
  - 竞品/替代：LMArena / Arena (lmarena.ai → arena.ai) — 最接近'并列对比交叉核验'诉求：免登录、免费，同一问题两个模型并排回答并投票，覆盖70+模型。缺陷：定位是评测工具而非日常AI入口（有速率限制、无历史/模板、回答可能来自匿名模型）；需翻墙。（https://lmarena.ai）
  - 竞品/替代：ChatGPT 免登录模式 / Microsoft Copilot 网页版 — 免登录即可用，免费。缺陷：单一厂商模型，无多模型切换或对比；中国大陆不可直接访问。（https://chatgpt.com）
  - 竞品/替代：Poe (Quora) / OpenRouter Chatroom — 多模型切换成熟，OpenRouter 可多模型并列回答。缺陷：都必须注册登录；Poe 免费额度有限、会员墙；需翻墙。（https://poe.com）
  - 竞品/替代：腾讯元宝（微信/QQ登录，DeepSeek R1 + 混元切换） — 国内可达、免费、双模型切换，DeepSeek官方崩溃时是最主流的替代入口，微信身份登录无需单独注册手机号。缺陷：仍需实名身份登录；只有腾讯自选的两三个模型；无并列对比、无广告标注。（https://yuanbao.tencent.com）
  - 竞品/替代：纳米AI搜索 / 360 AI浏览器（聚合 DeepSeek/豆包/Kimi/通义等） — 国内最接近'多模型一个入口'的产品：免费、聚合十余家模型可切换，360 AI浏览器有多模型同时作答/对比功能（细节不确定）。缺陷：需 360/手机号登录；口碑一般（360 生态、推广多）；不做答案交叉核验或广告标注。（https://www.n.cn）
- *crowd* → weak（4）：证据审视：(1) 3条evidence全是微博热搜"话题标题"，不是任何人在说"我想要一个免登录、多模型切换核验的入口"。《DeepSeek崩了》《豆包崩了》=宕机吐槽；《刘美含吐槽5家AI答案不一样》=艺人个人段子；《突然发现很多人不会用AI》=社会观察；《豆包收费》《你问AI得到的答案可能是广告》=新闻评论。簇描述里的"诉求"（自动切换+并列核验+标注广告+免登录+小白模板）是分析者把6个互不相关的热搜缝合出来的产品设想，没有一条原话表达"想要但没有"。抖音搜索词"免费的ai聊天软件不用登录"在description里提到但evidence数组中没有URL，无法核验。(2) 来源不独立：3个URL全部是微博热搜同一渠道，每条URL捆绑2个话题（"另有…"），independent_source_count=7被高估；platforms写了抖音但无抖音证据。(3) 互动：热搜排名#42-#47、上榜1-13天是真实的大众关注（这是簇最硬的部分），但关注的是"宕机/新闻"，不是对该方案的附和。(4) 常识：DeepSeek 2025年初宕机确是普遍抱怨，但市场几周内就解决了——腾讯元宝、百度、360纳米AI等接入DeepSeek-R1供切换，元宝一度登顶App Store；"免登录"与国内实名制/生成式AI管理规定直接冲突，普通用户对手机号/微信一键登录并无持续抱怨；"5家答案不一
  - 竞品/替代：open-webui（多模型对比视图内置） — 153k★，一问多答并排+合并回答已是内置功能；但需自部署/自带API key，非普通人入口（https://github.com/open-webui/open-webui）
  - 竞品/替代：karpathy/llm-council — 25k★，多模型互评并综合出最终答案，正是'交叉核验'；本地运行需OpenRouter key，面向开发者（https://github.com/karpathy/llm-council）
  - 竞品/替代：ChatALL — 16.5k★桌面端并列对比40+bot（含Kimi/千问/文心/星火）；2024年起维护停滞（'project is down?' 36👍），需各家自行登录（https://github.com/ai-shifu/ChatALL）
  - 竞品/替代：ChatHub 浏览器扩展 — 10.7k★，同时与多bot对话比较答案；开源版是否已停更不确定，需各平台账号（https://github.com/chathub-dev/chathub）
  - 竞品/替代：Cherry Studio / Chatbox — 52k★/42k★多供应商客户端，可手动切换模型；自动故障切换与多模型对比仅有1-3👍的零星请求（https://github.com/CherryHQ/cherry-studio）
  - 竞品/替代：gpt4free — 66.7k★免费免账号调用多模型，但为逆向灰色方案、不稳定、面向开发者（https://github.com/xtekky/gpt4free）
- *buildable* → weak（4）：【簇要点】C21：普通用户/学生/上班族要一个"免登录、自动切换可用模型、并列对比/交叉核验答案、标注广告、给小白模板"的AI入口。证据为微博热搜（DeepSeek崩了13天、5家AI答案不一样、豆包收费后月活-610万）+抖音搜索"免费的ai聊天软件不用登录"，crowd_signal=viral，7个独立来源。

【1. 小团队2-6周能否做出MVP】技术上完全可行，2-3周够：
- 前端：H5/PWA 或微信小程序；后端：Node/Python 薄层。
- 多模型接入：DeepSeek、通义千问(百炼)、豆包(火山方舟)、Kimi(Moonshot)、智谱GLM、MiniMax 等均有 OpenAI 兼容官方API，用 LiteLLM(59.7k★)/One-API/New-API 类网关做健康探测+超时熔断+fallback，"单一模型崩了自动切换"是网关的标准功能，无需自研。
- 并列对比：一次请求 fan-out 到 2-3 个模型流式并排展示（Open WebUI 153k★ 已有 Multi-Model Conversations；ChatALL 16.5k★、ChatHub 10.7k★ 就是这个形态）。
- 交叉核验：再用一个便宜模型做"裁判"，抽取各答案的事实断言，标出一致/冲突点并给出置信提示；这是提示工程级工作量，不需要训练。
- 小白模板：静态 prom
  - 竞品/替代：ChatALL (sunner/ChatALL) — 16.5k★，桌面端向40+机器人并发提问并排对比；需用户自备各家账号/API key，网页模式依赖各家前端易失效；面向极客，不解决小白免登录与自动切换（https://github.com/sunner/ChatALL）
  - 竞品/替代：ChatHub (chathub-dev/chathub) — 10.7k★，浏览器插件同时与多个聊天机器人对话对比答案，支持DeepSeek/千问等；需用户自有账号（仍要各家登录），无核验/裁判功能（https://github.com/chathub-dev/chathub）
  - 竞品/替代：Open WebUI — 153.3k★，自部署，支持任意OpenAI兼容API与多模型同屏对话；需自建与登录管理，非面向普通消费者的免登录入口（https://github.com/open-webui/open-webui）
  - 竞品/替代：NextChat (ChatGPTNextWeb/NextChat) — 88.8k★，已接入百度/字节/阿里/讯飞/智谱/DeepSeek/硅基流动等国内厂商，支持访问码免注册部署；单次只用一个模型，无并排对比与自动故障切换；大量国内镜像站基于它但多为未备案灰色运营（https://github.com/ChatGPTNextWeb/NextChat）
  - 竞品/替代：LiteLLM — 59.7k★，100+模型统一OpenAI格式网关，内置重试/fallback/负载均衡，可直接作为'自动切换可用模型'的后端组件，非终端产品（https://github.com/BerriAI/litellm）
  - 竞品/替代：LobeChat (lobehub/lobe-chat) — 82.8k★，多提供商聊天框架，README未见并排对比或自动故障切换；需部署与登录（https://github.com/lobehub/lobe-chat）

**用户原话 / 关键证据**：
> 微博热搜《DeepSeek崩了》同一话题上榜13天，《豆包崩了》上榜3天；《刘美含吐槽5家AI答案不一样》#42
> gpt4free 66.7k★/13.5k forks 2026-09仍更新

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23DeepSeek%E5%B4%A9%E4%BA%86%23&t=31&band_rank=47&Refer=top — 热搜话题：《DeepSeek崩了》(另有《豆包崩了》2026-01-28上榜3天…（微博热搜榜(快照排名#47)；同一话题上榜13天）
- [] https://s.weibo.com//weibo?q=%23%E5%88%98%E7%BE%8E%E5%90%AB%E5%90%90%E6%A7%BD5%E5%AE%B6AI%E7%AD%94%E6%A1%88%E4%B8%8D%E4%B8%80%E6%A0%B7%23&t=31&band_rank=42&Refer=top — 热搜话题：《刘美含吐槽5家AI答案不一样》(另有《你问AI得到的答案可能是广告》2026-03-1…（微博热搜榜(快照排名#42，上榜1天)）
- [] https://s.weibo.com//weibo?q=%E7%AA%81%E7%84%B6%E5%8F%91%E7%8E%B0%E5%BE%88%E5%A4%9A%E4%BA%BA%E4%B8%8D%E4%BC%9A%E7%94%A8AI&t=31&band_rank=45&Refer=top — 热搜话题：《突然发现很多人不会用AI》(另有《豆包收费 大模型将告别免费时代》2026-05-13…（微博热搜榜(快照排名#45，上榜2天)）
- https://github.com/xtekky/gpt4free
- https://github.com/karpathy/llm-council

**产品概念**：微信小程序"三问"：openid静默登录让用户感知上不用注册手机号，以企业主体做生成式AI应用登记

**MVP 范围**：2-3周1-2人：小程序+网关接3-5家

**风险**：面向公众的生成式AI服务须备案/登记、内容审核、AI标识，真免登录与实名制冲突

### 29. 外卖用户要下单前核验幽灵店/同址多店的工具（C43，总分 4.4）

**一句话**："截图核验"小程序：上传美团/饿了么商家资质截图

**用户与场景**：外卖用户与家长。"你点的三家外卖可能出自同一口锅"、点到僵尸店骑手被罚

**现有方案及不足**：美团/饿了么法定证照公示（看不出挂靠/无堂食）

**为何至今没解决**：平台不愿暴露损害GMV的商户状况

**验证结论**：unmet=weak(5) crowd=weak(4) buildable=weak(4)

- *unmet* → weak（5）：GitHub 核实（通过 GitHub API 搜索 15 组关键词，中英文）：没有任何一个开源项目做"下单前核验幽灵店/同址多店"。"同址多店""外卖 商家 核验""virtual brand restaurant detector""美团 商家 证照""食品经营许可证 查询""ghost kitchen finder browser extension"均返回 0 条结果；"ghost kitchen"161 条结果全是云厨房点餐系统课程作业；最贴近的只有 4165306/Chengdu-Takeaway-Blacklist（0 star、3 次提交、名单放在 QQ 文档里的人工黑榜）和 joshle298/nlp-research（2 star、2023 年停更的大学课程论文，用 NLP 给 Uber Eats 幽灵店打标签）。存在美团/饿了么商家数据爬虫（mudiyouyou/waimai-crawler 187 star、jakejie/MeiTuanWaiMai 5 star，能抓店名/地址），说明按地址聚合在技术上可行，但没人做成面向消费者的产品。

基于我的知识，现有覆盖是"平台内置的碎片化功能 + 监管顶层推动"，而非独立工具：(1) 美团/饿了么依 2018《网络餐饮服务食品安全监督管理办法》必须在店铺页公示营业执照和食品经营许可证——用户能看证照，但看不出证照
  - 竞品/替代：美团外卖/饿了么 店铺页「商家资质」证照公示（营业执照+食品经营许可证） — 法定必备（2018《网络餐饮服务食品安全监督管理办法》），免费、全覆盖。但只能逐店点开看证照图片，无法识别证照挂靠/借用、无法判断有无堂食、无法看出同一地址挂了多少家店；用户口碑上普遍认为'有证≠真实经营'。不覆盖核心场景。
  - 竞品/替代：美团「明厨亮灶」/饿了么「阳光厨房」后厨直播 — 平台内置、免费，但商家自愿接入、覆盖率低（多为连锁品牌），直播可录播/造假、可只拍局部，簇内证据也指出这一点。只解决'后厨状况'一项，且不能用于筛选。
  - 竞品/替代：京东外卖「只招募品质堂食餐厅」策略（2025 年上线） — 平台级正面回应幽灵店问题的最直接方案，且免费。缺陷：只覆盖京东自家供给，美团/饿了么用户无法用它核验；上线后仍有报道称混入无堂食店，审核依赖商家自报+抽查；本质是换平台而非核验工具。
  - 竞品/替代：美团「浣熊食堂」集中式合规外卖厨房（2025 年宣布） — 把幽灵店集中到自营/合作的透明厨房，配明厨亮灶与溯源。方向是把无堂食店'合规化'，不帮用户识别现有店铺是否幽灵/同址多店；覆盖规模仍在建设中，尚不足以改变整体供给。
  - 竞品/替代：美团/饿了么「堂食店」筛选标签 — 不确定是否已正式上线为全国性筛选项；即便有，也依赖商家自报，且不解决同址多店聚合。
  - 竞品/替代：Uber Eats 虚拟品牌披露规则 + DoorDash virtual brand 标识（海外，2023 年起） — 海外最成熟的'同址多店透明化'先例：虚拟品牌页面须标注由哪家实体餐厅制作、同址菜单需≥60% 差异化。但仅限海外平台、仅平台内展示、无第三方核验或众包实拍；中国平台无对应功能。
- *crowd* → weak（4）：证据审视：(1) 三条 evidence 全是微博热搜"话题标题"（媒体曝光《你点的三家外卖可能出自同一口锅》、监管新闻《整治幽灵外卖新规发布》、两会代表建议《建议设立无堂食外卖举报平台》），quote 就是标题本身，没有任何一条是用户在说"我想在下单前查同址店铺/证照但没有工具"。"按地址聚合查同址店铺数、众包实拍"这一诉求是撰写者从新闻推导出的产品构想，属于对新闻热点的误读为工具需求。(2) 独立性差：platforms 只有微博，independent_source_count=4 实际是同一话题"上榜4次"的计数，不是4个独立作者/平台；三条热搜分别对应2026-02监管新规、03月两会、04月央视曝光同一条新闻链。(3) 互动：只有热搜快照排名(#20/#30/#37，各上榜1天)，无任何评论/👍/转发数，热搜排名反映的是媒体议题热度而非"要工具"的附和。(4) 常识：外卖食安/幽灵外卖确实是中国多年反复出现的公共议题——GitHub 上的热搜归档仓库可证 2024-08-25 就有《幽灵外卖乱象遭曝光》#10、《央视曝光的多家脏乱外卖停业整改》#19、《外卖要想放心点平台监管不能缺位》#34，2025-07/10 有"无堂食外卖"相关条目，2026-04-17 又有《幽灵外卖线上光鲜线下无店》《什么叫幽灵店铺》。所以底层焦虑普遍且反复，但群众的表达方式一贯是"要监管/要
  - 竞品/替代：jakejie/MeiTuanWaiMai（美团/饿了么商家数据采集爬虫，5 star） — 仅是抓取店铺名称/地址/电话/销量的爬虫，可作为同址聚合的数据源构件，但不是面向消费者的核验工具，star 极低，不构成解决方案也不构成需求信号（https://github.com/jakejie/MeiTuanWaiMai）
  - 竞品/替代：平台内商家资质公示（营业执照/食品经营许可证）与后厨直播/明厨亮灶功能（美团、饿了么） — 依2018年《网络餐饮服务食品安全监督管理办法》平台须在店铺页公示证照，因此簇内'证照核验'这一半已在 App 内存在；后厨直播覆盖率低、可造假（与簇 existing_solutions 描述一致）。'同址店铺数聚合'与'有无堂食'仍无产品化透明展示。具体功能命名与覆盖率不确定
  - 竞品/替代：GitHub 上面向消费者的幽灵店/同址多店核验开源项目 — 未找到任何一个（多组中英文关键词搜索均为 0 或全是无关噪声），说明开发者社区侧没有人动手做，也没有可用 star/issue 数佐证'多少人要'
- *buildable* → weak（4）：【簇要点】C43：外卖用户下单前无法判断店铺是否真实存在/有无堂食/是否同址多店/后厨状况；诉求=按地址聚合同址店铺数+证照核验+骑手/用户众包实拍。证据为微博热搜（≥4次上榜）+两会建议+2026-02监管新规，crowd_signal=many，但均是舆情信号而非付费信号。

【1. MVP 可行性与技术路径】
可做的合法 MVP（1-3 人、3-5 周，小程序/网页）："截图核验"路径：用户把美团/饿了么店铺页的「商家资质」（营业执照+食品经营许可证，平台按 2018《网络餐饮服务食品安全监督管理办法》必须展示）截图上传 → OCR 提取主体名称/统一社会信用代码/经营场所地址 → 调用付费企业信息 API（企查查/天眼查一类，按次计费，合法采购）核验证照有效性、主体成立时间、经营范围、同一登记地址下的其他餐饮主体数（地址反查在这类 API 是否开放属"不确定"，网页端可按地址关键词搜，API 层级未必支持）→ 输出"疑似集中式外卖厨房/同址 N 店/新注册个体户/无堂食风险"评分 → 叠加众包实拍（骑手/用户上传门头/后厨照片）。技术栈全是现成件（OCR、地址标准化/相似度匹配、地图 POI 校验、小程序），工作量可控。
但它只部分消除核心痛点：(a) 登记地址匹配脆弱，集中厨房内各档口地址写法不一，"同址 N 店"召回率低；(b) 有无堂食、后厨实况在任何登记数据里都不存
  - 竞品/替代：美团/饿了么 App 内「商家资质」公示（营业执照+食品经营许可证） — 法规强制的单店公示，含经营场所地址，但无同址聚合、无堂食标注、用户几乎不点开；是合法 MVP 唯一可用的输入源（截图 OCR）。
  - 竞品/替代：平台明厨亮灶直播 / 美团浣熊食堂（集中式透明厨房，据我所知 2025 年推出，细节不确定）/ 京东外卖「品质堂食」定位 — 平台侧正在被监管推动补齐透明度，覆盖率仍低且可选择性展示；但说明需求正被平台+监管路径吸收，第三方窗口收窄。
  - 竞品/替代：企查查 / 天眼查 / 爱企查（企业与行政许可信息查询，付费 API） — 可合法核验证照与主体，是 MVP 的数据后端；但无外卖店铺映射、地址反查 API 是否开放不确定、无堂食/后厨信息。
  - 竞品/替代：yuncaiji/API（GitHub，约375★，含美团/饿了么逆向接口） — 证明全量店铺数据只能靠逆向/对抗反爬获取，属灰色地带，不能作为合规产品的数据源。（https://github.com/yuncaiji/API）
  - 竞品/替代：mudiyouyou/waimai-crawler（GitHub，约187★） — 商户侧订单抓取工具，面向商家而非消费者核验，与本需求无直接关系。（https://github.com/mudiyouyou/waimai-crawler）
  - 竞品/替代：Eliwangzenglin/waimaipingtai（GitHub，约27★，2024） — 美团/饿了么/百度外卖店铺与菜品爬虫源码，小规模、易失效，仍属爬取平台数据的灰色路径。（https://github.com/Eliwangzenglin/waimaipingtai）

**用户原话 / 关键证据**：
> 微博热搜《你点的三家外卖可能出自同一口锅》#20、《整治幽灵外卖新规发布》#30
> GitHub搜"同址多店""外卖 商家 核验""美团 商家 证照"全部total_count=0

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E4%BD%A0%E7%82%B9%E7%9A%84%E4%B8%89%E5%AE%B6%E5%A4%96%E5%8D%96%E5%8F%AF%E8%83%BD%E5%87%BA%E8%87%AA%E5%90%8C%E4%B8%80%E5%8F%A3%E9%94%85%23&t=31&band_rank=20&Refer=top — 热搜话题：《你点的三家外卖可能出自同一口锅》（微博热搜榜(快照排名#20，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E6%95%B4%E6%B2%BB%E5%B9%BD%E7%81%B5%E5%A4%96%E5%8D%96%E6%96%B0%E8%A7%84%E5%8F%91%E5%B8%83%23&t=31&band_rank=30&Refer=top — 热搜话题：《整治幽灵外卖新规发布》(另有《女子点外卖点到僵尸店骑手被罚款》2026-02-11…（微博热搜榜(快照排名#30，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E5%BB%BA%E8%AE%AE%E8%AE%BE%E7%AB%8B%E6%97%A0%E5%A0%82%E9%A3%9F%E5%A4%96%E5%8D%96%E4%B8%BE%E6%8A%A5%E5%B9%B3%E5%8F%B0%23&t=31&band_rank=37&Refer=top — 热搜话题：《建议设立无堂食外卖举报平台》(两会建议)（微博热搜榜(快照排名#37，上榜1天)）
- https://github.com/justjavac/weibo-trending-hot-search/blob/master/archives/2024-08-25.md
- https://github.com/4165306/Chengdu-Takeaway-Blacklist

**产品概念**：微信小程序"这家店真的吗"：用户把店铺"商家资质"页截图上传，OCR提取主体名称

**MVP 范围**：3-5周1-3人：截图OCR

**风险**：数据与下单入口都在平台手里，第三方无法嵌入下单流程每次切出截图摩擦极高

### 30. 普通上镜者要AI盗脸盗声的监测取证与维权工具（C44，总分 4.2）

**一句话**：面向配音师/主播/被盗脸者的"线索比对+一键取证+投诉包

**用户与场景**：配音演员、带货主播、短视频博主。普通人形象被AI短剧盗脸、配音师声音被AI克隆商用、演员被换脸做不雅视频

**现有方案及不足**：Loti AI（个人免费基础版，不覆盖中国平台）

**为何至今没解决**："主动发现"需持有抖音/快手/红果全量内容并做人脸/声纹检索

**验证结论**：unmet=weak(5) crowd=weak(4) buildable=refuted(3)

- *unmet* → weak（5）：该需求可拆成三层：(1) 以脸/声纹为索引的全网主动监测；(2) 一键取证固证；(3) 投诉/维权模板与渠道。逐层核对：
【监测层】海外已有基本成型的方案：Loti AI（面向个人的 likeness protection，2025 年起对个人开放免费基础版，脸+声音索引、每日扫描、自动发送 takedown），YouTube 的 likeness detection（平台内置，2025 年向 YPP 创作者开放，可检测使用创作者面部的 AI 视频并申请删除），PimEyes / FaceCheck.ID（付费人脸反向搜索，PimEyes PROtect 档含代发删除请求，仅图片、无声音、隐私争议大），Vermillio TraceID / Sensity / Reality Defender（B2B 或名人/工作室导向）。这些方案：a) 全部不覆盖抖音、红果、快手、微博、B站、小红书、微信视频号——而簇证据里的痛点恰恰全在中国平台；b) 声音克隆的个人级监测几乎只有 Loti 一家宣称支持，配音师"声音被 AI 商用"的场景基本无工具。中国市场：我确知存在的只有"检测型"产品（瑞莱智慧 RealBelieve/DeepReal、腾讯朱雀、合合信息篡改检测、中科睿鉴等）——它们回答"我看到的这条内容是不是假的"，而不是"我的脸/声音有没有在全网被人用"，且多数面向政企/金融；面向普
  - 竞品/替代：Loti AI (goloti.com, likeness protection) — 海外最接近该需求的产品：以人脸+声音为索引监测全网、自动发 takedown，2025 年起对个人提供免费基础版；但覆盖的是 YouTube/Instagram/TikTok/X 等英文平台，不覆盖抖音、红果、快手、微博、B站、小红书、视频号，对簇内中国用户几乎不可用；声音监测效果口碑缺乏公开验证。
  - 竞品/替代：YouTube likeness detection（平台内置） — 平台自带的创作者面部 AI 冒用检测+删除申请，2025 年向 YPP 创作者开放；只覆盖 YouTube 站内、需身份验证和创作者资格，无声音、不对普通上镜者，与中国平台无关。
  - 竞品/替代：PimEyes / FaceCheck.ID — 付费人脸反向搜索引擎（PimEyes 约 $30/月起，PROtect 档含代发删除请求）；仅索引公开网页图片，不做视频逐帧、不做声音，对社交/短视频平台覆盖弱，隐私伦理争议大且在部分地区受监管处罚；能部分解决'我的脸在哪被用了'，不解决短剧盗脸和声音克隆。
  - 竞品/替代：Vermillio TraceID / Sensity AI / Reality Defender / Pindrop — B2B 或名人/工作室/唱片公司导向的深伪监测与检测服务，按企业合同收费，普通人不可购买。
  - 竞品/替代：瑞莱智慧 RealBelieve(尊嘟假嘟)/DeepReal、腾讯朱雀 AI 检测、合合信息篡改检测、中科睿鉴 — 中国的'检测型'工具，回答'这段内容是否 AI 伪造'，多数面向政企金融或作为浏览器插件/视频通话实时检测；不提供以本人脸/声纹为索引的全网主动监测、不做取证与投诉，不覆盖核心场景。
  - 竞品/替代：各平台举报/肖像权投诉入口（抖音/快手/B站/微博/红果）+ 12377 举报中心 + 《人工智能生成合成内容标识办法》(2025-09-01 施行) — 存在且免费，但被动：需本人先发现、逐平台填表、平台自裁；AI 标识可被剥离（GitHub 上即有 C2PAremover 等工具），标识办法不提供任何面向个人的监测能力。
- *crowd* → weak（4）：证据审视：(1) 三条 evidence 全是微博热搜"话题标题"（红果回应普通人被AI短剧盗脸 / 央视曝AI克隆声音乱象 / 史泽鲲称声音被AI偷用维权），是新闻事件而非任何用户说"我想要主动监测+一键取证工具、现有的都不行"。description 里的"诉求：以脸/声纹为索引的主动监测+一键取证+平台投诉模板"是整理者的产品推演，没有一条引文直接支持。(2) 来源独立性：4 个"独立源"实际是同一平台（微博热搜榜）的 3 个话题，第 4 个只是第 3 条括号里附带的另一个话题；事件不同但全部是媒体/机构驱动（平台公关、央视、个案当事人），无跨平台、无普通用户原话。(3) 互动：热搜排名 #10/#35/#50 说明公众关注度高，但关注的是"乱象"新闻本身，不是对工具的附和；没有任何对"要工具"的 👍/评论计数。(4) 常识：底层问题确实是大众级焦虑——AI换脸/克隆声用于诈骗、带货、色情在中国是反复上热搜的议题（雷军AI配音、名人AI带货仿冒、女性被"一键脱衣"等），且法规已跟进（民法典1019条、2024北京互联网法院AI声音侵权首案配音师胜诉、《人工智能生成合成内容标识办法》2025-09-01 起施行——簇里"AI水印仅提案阶段"已过时）。但"主动监测+取证+投诉"这种工具型诉求现实中集中在三类人：配音师（小众职业但抱怨反复出现）、带货主播/博主（被AI克隆直播带货）
  - 竞品/替代：Fawkes (SAND Lab, UChicago) — 开源人脸隐私扰动工具 — 5.6k★，面向普通人的主动防护，但只能对抗人脸识别训练，不能监测/取证/维权；且对已公开的旧照片无效（https://github.com/Shawn-Shan/fawkes）
  - 竞品/替代：eye_of_web / pavelgonchar/face-search — 开源人脸检索引擎 — 324★/199★，可自建以人脸为索引的全网爬取检索，技术上覆盖"主动监测"，但需自行爬取与算力，定位 OSINT/学术，无取证与投诉流程，普通人无法使用（https://github.com/MehmetYukselSekeroglu/eye_of_web）
  - 竞品/替代：Chayn Tools — 免费 AI 删除信生成器（图像滥用受害者） — 34★，覆盖"平台投诉模板"一环（含 deepfake 场景、按平台指引），英文/全球平台为主，不含监测与取证，不适配中国平台（https://github.com/chaynHQ/tools）
  - 竞品/替代：nsfw_face — 自动举报泄露/合成裸照 — 51★，2018 年概念项目，明确针对"普通人"被盗脸，未成熟、已停滞（https://github.com/arvindrvs/nsfw_face）
  - 竞品/替代：C2PA 内容凭证 / 中国《人工智能生成合成内容标识办法》(2025-09-01 施行) — 簇里"AI水印仅提案阶段"已过时，标识已成强制法规；但属事前标识而非事后监测，GitHub 上已有多个去水印/去 C2PA 工具（image-fingerprint-remover、Synthid-remover），可被规避（https://github.com/contentauth/c2pa-rs）
  - 竞品/替代：商业人脸自查/肖像保护服务（PimEyes、FaceCheck.ID、Loti AI、Vermillio、Ceartas/Rulta 等） — 基于既有知识、本会话无法验证：付费自查人脸、创作者 DMCA 监测与名人肖像保护品类在海外已存在，证明付费需求真实；但客群为成人创作者/名人/网红，价格与覆盖范围不面向中文平台普通人，且 PimEyes 本身争议大
- *buildable* → refuted（3）：【核心痛点拆解】簇的核心诉求是"以脸/声纹为索引的全网主动监测"，其次才是取证与投诉模板。取证/模板是薄层，监测才是价值所在，也是"至今没解决"的根因。

【1. 小团队 2-6 周 MVP 可行性】
- 可做的部分（2-4 周）：(a) 用户上传自拍/录音→用 InsightFace ArcFace（代码 MIT，29.8k★，但预训练模型仅限非商用）和 SpeechBrain ECAPA-TDNN（Apache-2.0，11.8k★）提取脸/声纹向量；(b) 用户自己发现可疑链接后粘贴→下载视频→逐帧人脸比对+声纹相似度→输出相似度报告；(c) 生成取证包（原始文件哈希、抓取时间、录屏、页面快照）+ 各平台肖像权/声音权投诉话术、12377 举报文案、律师函模板。这一切 1-3 人可以做出。
- 做不到的部分（核心）：主动发现。要在抖音/快手/红果/B站/小红书的海量短视频里找到某一张普通人的脸或某一个声音，必须持有这些平台的内容语料并对其做人脸检测+嵌入+向量检索，且持续增量。抖音日新增视频量级在千万级，人脸检测+嵌入的 GPU 成本远超小团队承受；更关键的是根本没有合法数据入口——平台无公开 API，唯一路径是爬虫：GitHub 上 MediaCrawler（65.8k★）README 明确"仅供学习、禁止商用"并附中国爬虫入罪判例链接；Douyin_TikTok_Down
  - 竞品/替代：MediaCrawler (NanmiCoder) — 65.8k★，覆盖抖音/快手/B站/小红书/微博等 7 平台，是获取平台内容的唯一实际路径；但 README 明确仅供学习、禁止商用，并附中国爬虫入罪判例，商用建人脸索引不可行。（https://github.com/NanmiCoder/MediaCrawler）
  - 竞品/替代：Douyin_TikTok_Download_API (Evil0ctal) — 20.4k★，纯 Python 复现 a_bogus/X-Bogus 签名+自愈身份池绕过反爬，可用于"用户粘贴链接→下载视频"环节，但属于对抗平台技术措施的灰色地带。（https://github.com/Evil0ctal/Douyin_TikTok_Download_API）
  - 竞品/替代：InsightFace (ArcFace) — 29.8k★，代码 MIT，人脸嵌入开箱可用；但预训练模型仅限非商用，商用需自训或改用云厂商人脸 API（同样受生物识别合规约束）。（https://github.com/deepinsight/insightface）
  - 竞品/替代：SpeechBrain ECAPA-TDNN — 11.8k★，Apache-2.0，声纹嵌入可商用；解决比对不解决发现，且 AI 克隆声的相似度阈值无法律标准。（https://github.com/speechbrain/speechbrain）
  - 竞品/替代：Awesome-Deepfakes-Detection / DeepfakeBench 等深伪检测 — 研究级（1.8k/1.1k★），对新生成模型泛化差，不能作为证据级判定，也不解决"谁的脸被盗"。（https://github.com/search?q=deepfake+detection&type=repositories&s=stars&o=desc）
  - 竞品/替代：PimEyes / FaceCheck.ID 等海外人脸搜索引擎 — 付费人脸反搜，基本不索引抖音/快手等中文平台内容；在欧盟多次被数据保护机构处罚，恰好说明该模式的合规困境。

**用户原话 / 关键证据**：
> 微博热搜《央视曝AI克隆声音乱象》#10（同日《央视曝光AI仿冒名人乱象》）
> 生成侧远大于防护侧：Deep-Live-Cam 96.8k★/14.1k forks、faceswap 57.6k★

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E7%BA%A2%E6%9E%9C%E5%9B%9E%E5%BA%94%E6%99%AE%E9%80%9A%E4%BA%BA%E5%BD%A2%E8%B1%A1%E8%A2%ABAI%E7%9F%AD%E5%89%A7%E7%9B%97%E8%84%B8%23&t=31&band_rank=35&Refer=top — 热搜话题：《红果回应普通人形象被AI短剧盗脸》（微博热搜榜(快照排名#35，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E5%A4%AE%E8%A7%86%E6%9B%9DAI%E5%85%8B%E9%9A%86%E5%A3%B0%E9%9F%B3%E4%B9%B1%E8%B1%A1%23&t=31&band_rank=10&Refer=top — 热搜话题：《央视曝AI克隆声音乱象》(同日《央视曝光AI仿冒名人乱象》)（微博热搜榜(快照排名#10，上榜1天)）
- [] https://s.weibo.com//weibo?q=%E5%8F%B2%E6%B3%BD%E9%B2%B2%E7%A7%B0%E5%A3%B0%E9%9F%B3%E8%A2%ABAI%E5%81%B7%E7%94%A8%E7%BB%B4%E6%9D%83&t=31&band_rank=50&Refer=top — 热搜话题：《史泽鲲称声音被AI偷用维权》(另有《配音师声音遭AI商用成功维权》2025-05-28…（微博热搜榜(快照排名#50，上榜1天)）
- https://github.com/hacksider/Deep-Live-Cam
- https://github.com/chaynHQ/tools

**产品概念**：明确不做全网扫描的"维权工具箱"网页/小程序：用户上传自拍与录音在本地生成脸

**MVP 范围**：2-4周1-3人：本地脸/声纹比对

**风险**：buildable被反驳(3)：核心价值"主动发现"需要全网人脸/声纹索引

### 31. 听障者要免费离线不限机型的实时字幕与通话转写（C47，总分 4.2）

**一句话**：基于sherpa-onnx的免费离线中文实时字幕App

**用户与场景**：听障/聋人学生与职场人。要把周围人说的话实时变成字幕、打电话对方语音转文字自己打字转语音

**现有方案及不足**：音书（免费云端听障专用）、讯飞输入法/讯飞听见（付费）

**为何至今没解决**：Android 9+与iOS均不向第三方开放通话音频流

**验证结论**：unmet=weak(4) crowd=weak(4) buildable=weak(5)

- *unmet* → weak（4）：把需求拆成两半看。(1) 面对面/上课/开会的实时字幕：这一半在中国市场已经被免费方案大量覆盖——音书（听障人士专用、免费、云端）、讯飞输入法/讯飞听见的语音输入（免费云端，听障者常用它当字幕）、腾讯会议/飞书会议免费实时字幕、小米「AI字幕」、华为「AI字幕」等系统级功能；离线方面 Windows 11 自带 Live Captions（23H2 起据我了解已支持简体中文，本地推理、免费、任何 Win11 电脑）可覆盖上课/开会场景；Android 上 sherpa-onnx（GitHub 15.0k star，持续活跃）已提供离线中文流式识别的预编译 APK，技术上「免费+离线+不限机型」已经可行，只是缺少面向听障者打磨过的产品壳（GitHub 上此类壳子如 LocalCaption 0 star、HearMe 9 star、Hearth 5 star、livelens 1 star，全是 2026 年新建的个人 POC）。所以「免费/低费的实时字幕」这一诉求（知乎 2020 年那条证据）今天基本已不成立。(2) 电话字幕：这是真正的缺口，但也是技术上被封死的缺口——Android 10+ 和 iOS 均不向第三方 App 开放通话音频流，Google Play 2022 起还禁止无障碍服务录音，因此只能靠 OEM 内置（iPhone 11+ 的实时字幕支持电话/FaceTim
  - 竞品/替代：音书（听障沟通 App，中国） — 面向听障者的免费实时语音转文字+文字转语音，在聋人社群知名度高、口碑尚可；依赖云端 ASR，无离线；是否内置电话字幕我不确定。面对面场景够用，离线/通话场景不够。
  - 竞品/替代：讯飞输入法 / 讯飞听见 — 讯飞输入法语音输入免费（云端，另有离线语音包），听障者常拿它当临时字幕，但它是键盘不是字幕悬浮窗，无通话转写。讯飞听见实时转写按时长收费，正是簇里抱怨的付费墙。
  - 竞品/替代：腾讯会议 / 飞书会议 实时字幕 — 免费、中文识别质量好、任何手机/电脑都能用，上课开会常被听障者用作字幕（自建会议开字幕即可）；云端、需网络，不能做电话字幕。
  - 竞品/替代：联通畅听王卡 + 腾讯天籁行动 — 给听障者的免费通话字幕，但必须换联通卡且在微信内接打，覆盖面小——正是簇里的痛点，不算解决。
  - 竞品/替代：iPhone 实时字幕（iOS 16+，iPhone 11 及以上） — 端侧推理、离线、免费，支持电话与 FaceTime 通话字幕；据我了解 iOS 17/18 已加入中文（普通话）但不完全确定。限 iPhone 11+ 机型，Android 用户无缘。对 iPhone 用户是成熟解，簇内「需网络」的说法不准确。
  - 竞品/替代：小米 AI通话 / AI字幕（MIUI 12+/HyperOS） — AI通话提供通话中语音转文字与打字转语音（明确面向听障用户）、AI字幕提供系统音频字幕，免费；限小米/Redmi 部分机型，是否全离线不确定。对小米用户基本够用。
- *crowd* → weak（4）：对簇内 3 条证据逐条审视：(1) 知乎 376800723 是真实的"想要"表达，但措辞是"求推荐免费/低费工具"（2020 年前后的提问），并非"现有的都不行"，也未提离线/不限机型/通话字幕；互动量 unknown，单一作者。(2) B 站 opus "听障人士不用免提—实时语音转文字（字幕固话）"从标题看是一篇做法/成品展示（DIY 字幕固话教程类），是解决方案内容而不是抱怨，被误读为需求。(3) 结绳志文章是学术/评论随笔（"实时字幕、聋听空间与沟通劳动"），讨论的是无障碍与沟通劳动的社会学问题，不是用户诉求。三者作者与平台确实互不相同，但 independent_source_count 标 4 而 evidence 只有 3 条，crowd_signal 标 "many" 却没有任何一条有可见点赞/评论/转发，"很多人跟着说"缺乏直接证据。"免费+离线+不限机型+通话字幕"这一叠加诉求更像是整理者的综合，而非引文里反复出现的原话。GitHub 侧：泛用离线 ASR 基础设施 sherpa-onnx 14,984 星（非听障向）、Linux 离线字幕 LiveCaptions 1,791 星（README 不提聋人，仅英文，多语言请求 issue #17 0 评论）；听障专用项目里最热的是英文世界的 andygmassey/telephone-and-conversat
  - 竞品/替代：k2-fsa/sherpa-onnx — 离线中文 ASR 基础库，支持 Android/iOS/HarmonyOS，技术上已使'免费+离线+全机型'可行，但只是 SDK/示例，不是面向听障者的成品，也拿不到通话音频（https://github.com/k2-fsa/sherpa-onnx）
  - 竞品/替代：abb128/LiveCaptions — Linux 桌面离线实时字幕，1,791 星，仅支持英文、非手机、不含通话；对中文听障用户不可用（https://github.com/abb128/LiveCaptions）
  - 竞品/替代：andygmassey/telephone-and-conversation-transcriber — 为聋人父亲做的树莓派固话+环境转写设备（约 163 美元硬件），可离线，130 星；英文向、需 DIY 硬件和 USB 电话录音器，不解决手机通话（https://github.com/andygmassey/telephone-and-conversation-transcriber）
  - 竞品/替代：Johnnycn1213/LocalCaption — 正是簇所描述的'中文离线 Android 听障实时字幕'，但 0 星、POC beta、仅面对面场景无通话字幕（https://github.com/Johnnycn1213/LocalCaption）
  - 竞品/替代：smallmj/talksee — 中文听障向桌面离线实时字幕（sherpa-onnx），2 星，桌面端无手机/通话（https://github.com/smallmj/talksee）
  - 竞品/替代：guchang233/VOICE2TYPE — 支持本地离线模型的实时字幕/语音输入桌面工具，48 星，非听障向、非手机（https://github.com/guchang233/VOICE2TYPE）
- *buildable* → weak（5）：簇 C47 实际包含两个可行性差异极大的半独立痛点：(A) 环境声实时字幕（上课/开会/医院柜台），要求免费、离线、不限机型；(B) 电话字幕——对方语音实时转文字、自己打字转语音，且"不用免提"。

1. MVP 可行性
(A) 环境字幕：完全可行，1-3 人 2-4 周可交付。技术路径：k2-fsa/sherpa-onnx（GitHub 约 15k star，Apache-2.0，官方提供 Android/iOS/HarmonyOS/Flutter/WASM 示例与预编译 APK）+ 流式 Zipformer 中英双语 int8 模型（几十 MB）或 Paraformer/SenseVoice 离线模型，2019 年后的中端 Android 可实时运行；iOS 端可用 sherpa-onnx Swift 或系统 SFSpeechRecognizer 的 on-device 模式（zh-CN 离线支持范围需实测，不确定所有 iOS 版本均支持）。产品层只需做大字号字幕 UI、说话人分段、历史记录、快捷回复短语 TTS、模型下载/热词。Web 端用 sherpa-onnx WASM + PWA 缓存模型也能做到离线可用。GitHub 上已有 VOICE2TYPE（48 star）、ezA2T、livelingo、SystemAudioCaption 等小型离线实时字幕项目，说明技术
  - 竞品/替代：k2-fsa/sherpa-onnx（开源离线 ASR，含 Android/iOS/HarmonyOS 预编译实时识别 APK） — 约 15k star，Apache-2.0，中英流式 Zipformer/Paraformer/SenseVoice 模型，已能免费离线跨机型做环境字幕；但只是开发者工具/demo，无听障者友好 UI，且完全不覆盖通话字幕。（https://github.com/k2-fsa/sherpa-onnx）
  - 竞品/替代：google/live-transcribe-speech-engine（Live Transcribe 开源音频引擎） — 约 1.5k star，面向听障者的实时字幕参考实现，但依赖 Google Cloud Speech 云端，国内不可用，不离线。（https://github.com/google/live-transcribe-speech-engine）
  - 竞品/替代：VOICE2TYPE / ezA2T / livelingo / SystemAudioCaption（GitHub 小型离线实时字幕项目） — 1-48 star 的个人项目，证明离线中文实时字幕技术门槛已低，但均为桌面/开发者向，非成品，不解决通话。（https://github.com/search?q=%E5%AE%9E%E6%97%B6%E5%AD%97%E5%B9%95+%E7%A6%BB%E7%BA%BF&type=repositories）
  - 竞品/替代：音书（听障沟通 App） — 免费实时字幕与沟通工具，但依赖云端 ASR，离线不可用；通话字幕依赖免提或特定合作。
  - 竞品/替代：讯飞听见 / 讯飞听见实时字幕 — 识别质量高但按时长计费，云端，不满足免费/离线诉求。
  - 竞品/替代：联通畅听王卡（联通+微信无障碍通话） — 运营商侧实现真正的电话字幕，但必须换联通卡且在微信内接打，覆盖面小；恰好说明通话流只有运营商能拿到。

**用户原话 / 关键证据**：
> 知乎376800723："本人听障大学生。请问有免费或者低费的实时或者快速将声音转化为字幕的工具 软件吗 求推荐
> andygmassey/telephone-and-conversation-transcriber（130★

**证据链接**：
- [] https://www.zhihu.com/question/376800723 — 本人听障大学生。请问有免费或者低费的实时或者快速将声音转化为字幕的工具 软件吗 求推荐 呜呜呜 ?
- [] https://www.bilibili.com/opus/419185024225451761 — 听障人士不用免提—实时语音转文字（字幕固话）
- [] https://tyingknots.net/2021/02/access-and-subtitles/ — '无障碍'之障 \| 实时字幕、聋听空间与沟通劳动
- https://github.com/k2-fsa/sherpa-onnx
- https://github.com/andygmassey/telephone-and-conversation-transcriber

**产品概念**：Android/iOS/HarmonyOS三端免费离线实时字幕App：内置sherpa-onnx流式

**MVP 范围**：2-4周1-3人：Android端she

**风险**：通话字幕在"不限机型、不免提"前提下第三方软件做不到（Android

### 32. 手机用户要一站式隐私体检、拦骚扰与泄露溯源（C37，总分 4）

**一句话**：Android端"隐私管家"：枚举已装App高危权限生成体检

**用户与场景**：隐私敏感手机用户、女性用户。央视曝光"App小程序成隐私刺客"、315曝光骚扰电话黑色产业链

**现有方案及不足**：iOS App隐私报告/安全检查/静音未知来电

**为何至今没解决**：跨App权限读写是OS特权，Android/iOS/鸿蒙都在收紧

**验证结论**：unmet=weak(4) crowd=weak(4) buildable=weak(4)

- *unmet* → weak（4）：C37 是六个子需求的拼盘，逐项拆开看：(1) 权限体检/批量关权限：iOS 15.2+ App 隐私报告、iOS 16 安全检查、Android 12+ 隐私仪表盘、Android 11+ 未使用应用权限自动重置（经 Play 服务回溯到旧版本）、国产 ROM（MIUI/HyperOS 隐私保护与隐私风险扫描、ColorOS/OriginOS 隐私中心、HarmonyOS 隐私中心与权限访问记录、三星 Privacy Dashboard/Auto Blocker）已把"谁在什么时候用了什么权限"做成系统级可视化，口碑总体正面；开源侧 AppManager(9.1k★,活跃)、PermissionManagerX(787★)、TrackerControl(2.7k★)、Exodus 也能做批量撤权与追踪器扫描，但要 ADB/Root/Shizuku，只服务极客。"术语难懂""分散"是真实摩擦但属于 UX 打磨，且因为 Android 10+/iOS 沙箱限制，第三方 App 根本不可能替用户跨 App 改权限，所谓"一站式"只能退化为清单+跳转引导，而这类清单内容（公众号教程、厂商隐私中心）已大量存在，几乎无护城河。(2) 骚扰拦截：全球范围是被解决得最彻底的子需求——Google 电话 App 来电过滤/Call Screen、iOS 静音未知来电与 iOS 26 通话筛选、Tr
  - 竞品/替代：iOS 系统隐私功能（App 隐私报告 iOS 15.2+、安全检查 iOS 16+、隐私与安全性设置、ATT、静音未知来电、iOS 26 通话筛选/实时语音信箱、隐藏邮件地址） — 够用度高：系统级、免费、口碑好，覆盖"谁用了什么权限"的体检与按权限逐 App 关闭；骚扰拦截靠静音未知来电+第三方 CallKit 拦截 App。缺点：没有跨 App 的"隐私开关清单"（快递面单/步数），隐藏邮件需 iCloud+ 付费，无验证码轰炸预警。
  - 竞品/替代：Android 系统隐私功能（Android 12+ 隐私仪表盘、Android 11+ 未使用应用权限自动重置、Google 电话 App 来电过滤/Call Screen、Google Messages 垃圾短信检测、Play Protect、Google 暗网报告） — 够用度高：免费内置，权限自动重置实际实现了"批量关闭闲置 App 权限"，隐私仪表盘按权限维度可视化；Pixel 及多数海外机型的来电过滤口碑好。缺点：国内 GMS 缺位，术语（"大致位置""附近的设备"）对普通用户仍难懂。
  - 竞品/替代：国产 ROM 隐私/安全中心（小米 HyperOS 隐私保护与隐私风险扫描、华为 HarmonyOS 隐私中心与权限访问记录、ColorOS/OriginOS 隐私中心、三星 Privacy Dashboard/Auto Blocker）+ 自带骚扰拦截与号码标记 + AI 通话助理代接 — 基本够用：各家都有"一键隐私扫描"和骚扰拦截/号码标记（数据源多为 360/腾讯/电话邦），AI 代接对营销电话很有效，免费且普及率极高。缺点：各家入口/术语不一，跨品牌无统一；鸿蒙 NEXT 的默认拒权只限华为。
  - 竞品/替代：三大运营商免费防骚扰服务（中国移动高频骚扰电话防护、中国联通防骚扰/沃助理、中国电信天翼防骚扰） — 部分够用：免费、网络侧拦截、不依赖手机型号，但需主动短信/公众号开通、各家只管自家号段、误拦与漏拦并存，运营商自身也是营销方，激励不纯。验证码轰炸方面是否有专门防护我不确定。
  - 竞品/替代：Truecaller / Hiya / 三星 Smart Call / RoboKiller / Nomorobo / 美国运营商 Scam Shield、ActiveArmor + STIR/SHAKEN — 海外市场骚扰拦截成熟：Truecaller 用户量巨大、免费版可用，但因上传通讯录有隐私争议；RoboKiller/Nomorobo 收费。中国大陆基本不可用。（https://www.truecaller.com）
  - 竞品/替代：腾讯手机管家 / 360 手机卫士（含 iOS 版 CallKit 骚扰拦截、隐私保护/权限管理引导） — 可用但口碑一般：号码库大、iOS 上是主流拦截选项；但 Android 10+ 上无法替其他 App 改权限只能引导，App 本身臃肿、广告和自身数据采集受诟病，在权限体检上被系统功能取代。
- *crowd* → weak（4）：证据审视：(1) 3 条 evidence 全是 s.weibo.com 热搜话题页，quote 只是话题标题（《AI眼镜成为隐私重灾区》《央视曝App小程序成隐私刺客》《接不完的骚扰电话有条黑色产业链》），是央视/315 晚会的新闻议程，不是任何用户在说"我想要一个 X 但现有的都不行"；没有一条用户原话，更没有人提出"一站式体检+拦截+溯源+起诉材料"这种产品诉求。(2) 来源不独立：platforms 仅 ["微博"]，三条都是媒体曝光驱动的热搜（315 同日），independent_source_count=8 与可见的 3 条不符；簇本身是 A25(权限体检)+A26(骚扰拦截/溯源) 的人工合并，"一站式"是分析者拼出来的，不是人群表达。(3) 互动只有热搜排名(#10/#15/#26)，这是新闻关注度，不是对某个需求的附和/👍。(4) 常识层面：骚扰电话、验证码轰炸、App 过度索权确实是中国手机用户长期、反复的抱怨（315 多年反复曝光、工信部定期通报违规 App），这一点成立；但子需求已被大量方案覆盖——iOS 15.2+ App 隐私报告与 Android 12+ 隐私信息中心本身就是"隐私体检"，小米/华为/OPPO 系统自带云标记拦截，腾讯手机管家/360 手机卫士用户量级巨大，运营商高频骚扰防护、国家反诈中心 App、菜鸟/顺丰/京东隐私面单均存在。"泄
  - 竞品/替代：aj3423/SpamBlocker (开源 Android 来电/短信拦截) — 覆盖骚扰拦截子需求，规则/正则/联系人白名单，活跃维护；无中国云号码库、无溯源与轰炸预警（https://github.com/aj3423/SpamBlocker）
  - 竞品/替代：TrackerControl / Exodus Privacy — 覆盖 App 追踪器体检子需求（Android），英文向、对国内 App 追踪 SDK 识别有限（https://github.com/TrackerControl/tracker-control-android）
  - 竞品/替代：MuntashirAkon/AppManager、PermissionManagerX — 可查看/批量改 AppOps 权限，但需 ADB/Shizuku/Root，面向极客而非普通用户（https://github.com/MuntashirAkon/AppManager）
  - 竞品/替代：iOS App 隐私报告(iOS 15.2+)、Android 12+ 隐私信息中心 — 系统级'隐私体检'已内置：按权限/时间线展示各 App 访问记录并可直接改权限；覆盖簇中'体检+关权限'的大部分，只是入口深
  - 竞品/替代：腾讯手机管家 / 360 手机卫士 / 小米·华为·OPPO 系统自带骚扰拦截(云标记) — 国内主流骚扰电话与垃圾短信拦截方案，用户量级巨大，默认或一键开启；误拦与黑产换号是固有问题
  - 竞品/替代：运营商高频骚扰电话防护(移动/联通/电信)、国家反诈中心 App、12321 举报 — 覆盖拦截与举报，需主动开通，举报反馈弱
- *buildable* → weak（4）：【簇拆解】C37 是 A25(隐私体检/批量关权限) + A26(骚扰拦截/泄露溯源/轰炸预警/一键投诉) 的合并簇，六个子诉求的"软件可解性"差异极大，必须分开评。

1. MVP 可行性（1-3 人、2-6 周）
可以做出一个 Android 端 MVP（约 4-6 周），但只能覆盖约一半诉求：
- 权限体检（可做）：Android 无 root 可用 PackageManager.GET_PERMISSIONS + requestedPermissionsFlags 枚举全部已装 App 的已授予权限，生成"高危权限清单"（通讯录/短信/通话记录/位置/后台弹窗），并用 ACTION_APPLICATION_DETAILS_SETTINGS 深链到每个 App 的设置页。需申请 QUERY_ALL_PACKAGES，国内商店可过，Google Play 基本过不了。
- 批量关权限（不可做）：pm revoke 需要 shell 权限（root/Shizuku 无线调试），大众用户不可能；用无障碍服务自动点击是灰色地带（各厂商商店明令禁止非无障碍用途、且各 ROM 设置页 UI 不同极易失效）。iOS/鸿蒙 NEXT 沙箱下第三方 App 连"枚举其他 App"都做不到，只能做纯文字清单引导。即簇里 why_unsolved 自己也承认"只能做检查清单+引导"——这是平台壁垒
  - 竞品/替代：aj3423/SpamBlocker（开源 Android 来电/短信拦截，约1.9k star） — 验证了 CallScreeningService 无 root 规则拦截可行，但纯规则、无国内黑产号码库、无隐私体检与溯源；面向极客用户。（https://github.com/aj3423/SpamBlocker）
  - 竞品/替代：腾讯手机管家 / 360手机卫士 — 免费、拥有大规模众包号码库与骚扰拦截，早期也做权限检测；缺点是广告重、权限检测受新版 Android 限制，且巨头不做泄露溯源。是本簇拦截子需求的直接免费替代，压缩第三方付费空间。
  - 竞品/替代：厂商 ROM 内置隐私保护（MIUI/HyperOS、ColorOS、OriginOS、HarmonyOS 隐私中心；具体功能命名不确定）+ Android 12+ Privacy Dashboard、iOS App 隐私报告 — 唯一有权真正批量修改权限、记录权限使用、系统级拦截与号码标记的一方；缺点是各品牌分散、术语难懂、无跨品牌统一体验。第三方无法替代其能力，只能做引导。
  - 竞品/替代：运营商高频骚扰电话拦截（移动/联通/电信，短信开通，免费） — 网络侧拦截、覆盖全部机型，但需主动开通、有误拦、规则不透明；运营商本身也是营销方。
  - 竞品/替代：熊猫吃短信（iOS 垃圾短信过滤，独立开发者，一次性付费，价格约十几元，不确定） — 证明 iOS ILMessageFilterExtension 端侧过滤可做成小众付费产品；仅覆盖短信，不覆盖来电、权限、溯源。
  - 竞品/替代：运营商副号服务（中国移动和多号、中国电信天翼小号等） — 国内实名制下唯一合法的'分号'来源，可用于泄露溯源，但每人 1-3 个、按月收费、非第三方 App 可提供。

**用户原话 / 关键证据**：
> 微博热搜《央视曝App小程序成隐私刺客》#10、《接不完的骚扰电话有条黑色产业链》#15（315晚会同日）
> aj3423/SpamBlocker 1,865★（2024-04创建

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23AI%E7%9C%BC%E9%95%9C%E6%88%90%E4%B8%BA%E9%9A%90%E7%A7%81%E9%87%8D%E7%81%BE%E5%8C%BA%23&t=31&band_rank=26&Refer=top — 热搜话题：《AI眼镜成为隐私重灾区》（微博热搜榜(快照排名#26，上榜2天)）
- [] https://s.weibo.com//weibo?q=%23%E5%A4%AE%E8%A7%86%E6%9B%9DApp%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%88%90%E9%9A%90%E7%A7%81%E5%88%BA%E5%AE%A2%23&t=31&band_rank=10&Refer=top — 热搜话题：《央视曝App小程序成隐私刺客》（微博热搜榜(快照排名#10，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E6%8E%A5%E4%B8%8D%E5%AE%8C%E7%9A%84%E9%AA%9A%E6%89%B0%E7%94%B5%E8%AF%9D%E6%9C%89%E6%9D%A1%E9%BB%91%E8%89%B2%E4%BA%A7%E4%B8%9A%E9%93%BE%23&t=31&band_rank=15&Refer=top — 热搜话题：《接不完的骚扰电话有条黑色产业链》(同日《315曝光骚扰电话产业链》…（微博热搜榜(快照排名#15，上榜1天)；315晚会主题）
- https://github.com/aj3423/SpamBlocker
- https://github.com/zuzhiang/SMS_Bomber

**产品概念**：Android端"隐私管家"App：用PackageManager枚举全部已装App的已授予高危权限

**MVP 范围**：4-6周1-2人：Android权限体检

**风险**：批量关权限需root/Shizuku，iOS/鸿蒙NEXT下连枚举其他App都做不到

### 33. 多端用户要隐私友好离线的中文拼音与语音输入（C26，总分 5.4）

**一句话**：把Rime+雾凇拼音与离线中文语音输入打包成带GUI安装器

**用户与场景**：隐私敏感的办公人群与程序员。搜狗/百度/讯飞输入法弹窗广告、词库与音频上传、各平台体验不一致

**现有方案及不足**：Rime引擎与各端前端+雾凇拼音/oh-my-rime

**为何至今没解决**：验证显示核心诉求实际已被解决：Rime生态（Weasel 8.1k★

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=confirmed(7)

- *unmet* → refuted（3）：簇 C26 是两个子需求的合并：(A) 隐私/离线/跨平台一致的中文拼音输入法；(B) 按住即说、离线、可自定义热词的中文语音输入。2026-09-27 在 GitHub 逐项核实。

(A) 拼音：Rime 生态已是成熟、活跃维护、口碑极好的完整方案——前端 Weasel(Win, 8.1k★)、Squirrel(macOS, 6.4k★)、fcitx5/ibus-rime(Linux)、fcitx5-android(5.7k★, Google Play/F-Droid 可装, 支持 Rime 插件)、仓输入法 Hamster(iOS, App Store 免费, 1.6k★)、语燕/Xime(Android)；配置包 rime-ice 19.5k★（完全离线、跨平台一致、支持 plum 一键安装与 git pull 更新，open issues 仅 3）、oh-my-rime 4.9k★（词库经 GitHub Actions 自动更新，覆盖 Win/mac/Linux/Android/iOS）、rime-frost 3.7k★。"一键安装"缺口已有 rime-auto-deploy(1.9k★, mac/Linux/Win, 内置雾凇, 带升级模式) 填补；Rime 自身有 sync_dir 用户词库同步机制（可指向 iCloud/网盘目录）。单一生态用户的核心诉求（离线、无广
  - 竞品/替代：Rime 引擎 + 各平台前端（Weasel/Squirrel/fcitx5-rime/ibus-rime/fcitx5-android/仓输入法 Hamster/同文 Trime） — 够用。完全离线、无广告、GPL 免费、Win/mac/Linux/Android/iOS 全覆盖且长期活跃维护（Weasel 8.1k★、Squirrel 6.4k★、fcitx5-android 5.7k★ 上架 Play/F-Droid、Hamster App Store 免费）。自带 sync_dir 用户词库同步（可指向 iCloud/网盘）。缺点：默认词库弱需配合配置包，同步需手动触发，非技术用户有门槛。（https://github.com/rime/weasel）
  - 竞品/替代：雾凇拼音 rime-ice — 够用。19.5k★、open issues 仅 3、长期维护；官方定位就是“开箱即用、完全离线、跨平台一致”，支持 plum 命令行一键安装和 git pull 更新词库。缺口只是没有图形化安装器/后台自动更新。（https://github.com/iDvel/rime-ice）
  - 竞品/替代：oh-my-rime（薄荷输入法配置） — 够用。4.9k★，词库经 GitHub Actions 自动更新，明确覆盖 Win/mac/Linux/Android/iOS，有完整文档与视频教程；仍需手动放置文件并重新部署。（https://github.com/Mintimate/oh-my-rime）
  - 竞品/替代：rime-auto-deploy 一键部署脚本 — 部分够用。1.9k★，mac/Linux/Win 一条命令安装 Rime + 雾凇 + 皮肤，带升级模式；但依赖 Ruby 3、走命令行，对“普通人”仍不够零门槛。（https://github.com/Mark24Code/rime-auto-deploy）
  - 竞品/替代：白霜拼音 rime-frost / rime-pure / rime-crane 等配置包 — 够用。3.7k★，词库准确率自评不输商业输入法，被墨奇输入法内置（该产品细节不确定）。同样属于需手动部署的配置包。（https://github.com/gaboolic/rime-frost）
  - 竞品/替代：Apple 自带拼音输入法 + 端侧听写（macOS/iOS） — 对苹果生态用户够用。完全离线、无广告、用户词典/文本替换经 iCloud 同步，端侧听写支持普通话离线。缺点：不跨 Windows/Linux，听写不能自定义热词。
- *crowd* → confirmed（7）：对簇内证据的严格审视：(1) 三条 quote 全是项目 README 的自我描述（「开箱即用…完全离线」「完全离线、响应极快」「极简、优雅、好用」），没有一条是用户在说「我想要但现有的都不行」——属于供给侧信号被当成需求引文，有误读风险；但它们附带的 star/fork 是真实、可见的群体互动，不是 unknown。(2) 三个来源作者不同（iDvel / HaujetZhao / SivanLaai），无重复计数，但全部来自 GitHub 单一平台，人群明显偏程序员/极客；声称 independent_source_count=4 只见到 3 条；audience 中「老年人与手部不便者」没有任何证据支撑。(3) 簇把两个不同产品（拼音输入法 B14、离线语音输入 D29）合并，人数被叠加。

GitHub 实查（2026-09-27）反驳「极少数人」：rime-ice 19,519★/1,190 fork（纯配置仓库）；Rime 前端 weasel 8,071★、squirrel 6,397★、librime 4,630★、fcitx5-android 5,692★；同类独立配置包 oh-my-rime 4,943★、rime-wanxiang 4,659★、rime-frost 3,683★（自称「准确性已不输于商业输入法」）、ssnhd/rime 3,535★、rime-
  - 竞品/替代：Rime 生态：雾凇拼音 rime-ice + 小狼毫/鼠须管/fcitx5/fcitx5-android — 对极客用户已足够（19.5k★、open issue 仅 3–5 个说明满意度高），完全离线、隐私友好、跨平台；但需手动装前端+下载配置+部署，无官方一键安装、词库自动更新、多端同步。（https://github.com/iDvel/rime-ice）
  - 竞品/替代：rime-auto-deploy / 各类一键安装脚本 — 1.9k★，部分解决安装门槛，仍是命令行脚本，面向开发者；不解决同步与自动更新。（https://github.com/Mark24Code/rime-auto-deploy）
  - 竞品/替代：墨奇输入法（moqi-im-windows） — 323★，Windows 原生 TSF 前端 + 白霜词库 + WebDAV 多端同步 + AI 功能，是最接近「产品化 Rime」的尝试，但仅 Windows（安卓版另有），规模小、32 个 open issue。（https://github.com/gaboolic/moqi-im-windows）
  - 竞品/替代：oh-my-rime / rime-wanxiang / rime-frost 等配置包 — 各 3.7k–4.9k★，同为配置包，同样要手动部署；说明方案层供给充足，缺的是安装/同步产品层。（https://github.com/Mintimate/oh-my-rime）
  - 竞品/替代：CapsWriter-Offline — 6.9k★，离线、低延迟、热词、按住即说松开上屏，基本满足 Windows 用户；仅 Windows、控制台运行、需手动配置，macOS/Linux 靠第三方移植（14★ 级别）。（https://github.com/HaujetZhao/CapsWriter-Offline）
  - 竞品/替代：VocoType-linux — 252★，Linux & macOS 离线中文语音输入、~0.1s 上屏、CPU 可跑，正在填补 CapsWriter 的 mac/Linux 缺口，但仍早期、无 Windows。（https://github.com/LeonardNJU/VocoType-linux）
- *buildable* → confirmed（7）：【簇拆解】C26 实际是两条子需求：(a) 把 Rime+雾凇拼音"产品化"——一键安装、词库自动更新、多端同步；(b) 完全离线、按住即说松开上屏、可自定义热词的跨平台中文语音输入。两者都属于纯软件可解、无网络效应的单机工具。

【1. 小团队 2-6 周 MVP 可行性：可行】
- 语音输入(b)：技术栈已完全商品化。sherpa-onnx（k2-fsa，约 1.5 万★）提供 Win/Mac/Linux/Android/iOS 的离线推理，可直接跑 SenseVoice-Small(int8 约 200-250MB)、Paraformer-zh（含 contextual 版本原生支持热词偏置）、Qwen3-ASR(Apache-2.0)、Fun-ASR-Nano，CPU 即可达 <0.3s 上屏。客户端用 Tauri 2/Rust 或 Swift：全局热键（按住录音/松开识别）+ Silero VAD + 剪贴板粘贴或 Accessibility 插入文本 + 用户热词表（拼音模糊匹配后处理，CapsWriter 已验证）+ ITN 数字转换。GitHub 上一人项目已多次证明周期：openless（2026-04 创建，Tauri，内置本地 Qwen3-ASR，Mac+Win，3.6k★）、VocoType-linux（2025-12 创建，Linux+Mac，252★，~
  - 竞品/替代：iDvel/rime-ice 雾凇拼音 — 19.5k★，长期维护的离线词库+配置，CC BY 4.0；但仅是配置包，需用户自行安装 Rime 壳、手动下载部署、无自动更新与 GUI，普通人门槛高（https://github.com/iDvel/rime-ice）
  - 竞品/替代：Mark24Code/rime-auto-deploy — 1.9k★，Ruby 命令行脚本自动安装 Rime+配置，证明'一键安装'需求真实；但仍是终端工具，无 GUI、无后台词库自动更新与多端同步（https://github.com/Mark24Code/rime-auto-deploy）
  - 竞品/替代：Mintimate/oh-my-rime — 4.9k★，跨 Win/Mac/Linux/iOS/Android 的 Rime 配置模板，词库靠 GitHub Actions 更新；用户仍需手动下载部署，靠爱发电捐赠，无产品化（https://github.com/Mintimate/oh-my-rime）
  - 竞品/替代：HaujetZhao/CapsWriter-Offline — 6.9k★，按住 CapsLock 说话松开上屏、支持 Paraformer/SenseVoice/Fun-ASR-Nano/Qwen3-ASR 与热词；但仅保证 Windows，明确不支持 macOS，需分别启动 server/client 两个 exe，199 个 open issues（https://github.com/HaujetZhao/CapsWriter-Offline）
  - 竞品/替代：LeonardNJU/VocoType-linux — 252★，Linux(IBus/Fcitx5)+macOS 离线中文语音输入，FunASR contextual Paraformer，~0.1s 上屏、图形化热词、提供 DMG/DEB/RPM；不支持 Windows，规模小（https://github.com/LeonardNJU/VocoType-linux）
  - 竞品/替代：Open-Less/openless — 3.6k★，Tauri 2，Mac+Win（Linux/Android 实验），按住说话松开上屏，可内置本地 Qwen3-ASR 也可接火山/腾讯/讯飞云 ASR，中文优先；偏向 AI 润色而非纯离线，AGPL-3.0，无拼音输入法整合（https://github.com/Open-Less/openless）

**用户原话 / 关键证据**：
> rime-ice 19,519★/1,190 forks且open issues仅3-5个
> CapsWriter-Offline 6,873★/211 open issues

**证据链接**：
- [] https://github.com/iDvel/rime-ice — "雾凇拼音是一份开箱即用的简体中文 Rime 输入法配置，词库长期维护，基本功能齐全，使用完全离线…（19,514 stars / 1,190 forks）
- [] https://github.com/HaujetZhao/CapsWriter-Offline — 完全离线（不受网络限制）、响应极快、高准确率 且 高度自定义……macOS unsupported…（6.9k stars / 637 forks / 19…）
- [] https://github.com/SivanLaai/rime-pure — "基于 Rime（小狼毫 / 同文）的极简、优雅、好用的中英文输入方案整合包。（1,133 stars）
- https://github.com/cjpais/Handy
- https://github.com/Mark24Code/rime-auto-deploy

**产品概念**：Tauri 2桌面应用"静默输入"：GUI安装器检测系统后静默安装对应Rime壳（Weasel

**MVP 范围**：4-6周1-3人：Windows

**风险**：unmet被反驳：验证者核实Rime生态、rime-ice

### 34. 用户要把微信读书等平台数据整体导出带走（C04，总分 5.2）

**一句话**：基于微信读书2026-05官方Skill API的免逆向

**用户与场景**：有系统读书笔记习惯的知识工作者。微信读书内置导出仅划线/想法、有条数限制格式差

**现有方案及不足**：微信读书官方Skill API（2026-05）

**为何至今没解决**：验证显示核心场景已被解决：微信读书2026-05-17发布官方Agent

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(6)

- *unmet* → refuted（3）：簇的核心场景（微信读书划线/想法/书评 → Markdown/Notion/Obsidian/flomo）已被成熟、免费、活跃维护的方案覆盖，且簇里 why_unsolved 的关键前提已过时。GitHub 上多个仓库（awesome-weread、weread-cli、readneo、weread2notion 的提交记录）一致显示：微信读书于 2026-05-17 发布了官方 Agent Gateway / 个人 API Key（wrk-…），只读开放书架、阅读进度、阅读统计、划线与想法、书籍搜索。头部工具已全部迁移到官方接口：weread2notion（2.9k stars，2026-05-19 提交 "feat: use weread gateway api key"，README 写明"新版不再需要复制微信读书 Cookie"，最近提交 2026-07）、obsidian-weread-plugin（2.3k stars，v2.0 优先 API Key、Cookie 兜底，2026-09 仍在推送）、readneo（Markdown ZIP / Notion / flomo 一键导出，2026-09 活跃）、weread-toolbox（353 stars，图文 Markdown）。awesome-weread 收录 60+ 个基于官方 API 的 CLI/SDK/MCP
  - 竞品/替代：微信读书官方 Agent Skill / Agent Gateway API Key（2026-05-17 发布） — 够用（对划线/想法/书评/书架/进度/统计）。官方只读 API，用户在 App 设置开启 Skill 即得 API Key，不再依赖 Cookie 或逆向接口，直接消解了簇里'非公开接口易失效、封号风险'的 why_unsolved。不够的地方：不开放全书正文（版权原因，短期不会变）、写入能力有限、是否有配额/长期稳定性尚待观察（发布仅 4 个月）。（https://github.com/BENZEMA216/awesome-weread）
  - 竞品/替代：malinkang/weread2notion（含 weread2notion-pro 3.4k stars） — 够用。2.9k stars，GitHub Action 一键部署，2026-05 已迁移官方 gateway API key，同步书籍/划线/笔记/进度到 Notion 并持续更新；2026-07 仍在维护。缺陷：会重写同步页（不能在 Notion 页内加私人批注），历史 issues 多为 Cookie 过期（新版已不需要）。（https://github.com/malinkang/weread2notion）
  - 竞品/替代：zhaohongxuan/obsidian-weread-plugin — 够用。2.3k stars，Obsidian 社区插件商店可直接安装，v2.0 优先 API Key，同步划线/笔记/书评/热门划线 + 书架 + 阅读统计热力图，可自定义模板，2026-09 活跃。缺陷：93 个 open issues（多为模板/UI 功能请求）、图片型想法尚未同步、偶发登录卡死。（https://github.com/zhaohongxuan/obsidian-weread-plugin）
  - 竞品/替代：extrastu/readneo — 够用。基于官方 Skill API 的开源自托管面板，一键导出 Markdown ZIP、同步 flomo/Notion，浏览器本地存储，2026-09 活跃；覆盖了簇里'导到 flomo'这条线。规模较小（183 stars）。（https://github.com/extrastu/readneo）
  - 竞品/替代：sancijun/weread-toolbox、shiquda/weread-cli、awesome-weread 收录的 60+ CLI/SDK/MCP 项目 — 补充选项充足。工具箱支持图文 Markdown 导出+Notion 同步；weread-cli 基于官方 API 供人和 Agent 使用；生态里已有 Python/Rust/TS SDK 和 MCP server，说明'导出到任意知识库'的长尾需求可由用户/Agent 自行拼装。（https://github.com/sancijun/weread-toolbox）
  - 竞品/替代：微信读书内置「笔记导出/分享」 — 不够用但已被上面方案取代。内置导出仅划线+想法、纯文本格式差、有条数限制，这正是簇 evidence 的痛点来源；但 2026-05 官方 Skill API 事实上成为新的官方导出通道。
- *crowd* → confirmed（7）：对簇内 3 条证据的审视：(1) WeFlow(14.5k★) 是微信聊天记录导出，README 与微信读书无任何关系，被以"同属拿回数据动机"硬拉入簇，其 star 不能记到 C04 头上；InfoSpider(8.3k★) 是 2020 年的多源爬虫工具箱，8k★ 但仅 2 个 open issue，更像概念热度而非持续使用；只有 weread2notion(2.9k★) 直接命中。(2) 三条来源作者不同但全部来自 GitHub 单一平台，簇声称 independent_source_count=21 却只列出 3 条，无任何论坛/社区抱怨原文。(3) 互动可见（star 数），非 unknown。(4) 常识：微信读书是国内最主流的阅读 App，官方笔记导出仅为文本/图片分享、不支持结构化批量导出（具体限额不确定），Obsidian/Notion 中文 PKM 社区确实长期反复讨论此事。(5) GitHub 独立核验结果强于簇自身证据：微信读书导出/同步类工具至少 15 个独立作者且各 >280★——weread2notion-pro 3,414★/6,417 forks、weread2notion 2,926★/6,713 forks（fork 即使用模式，forks 数是真实用户量信号）、obsidian-weread-plugin 2,259★/93 open iss
  - 竞品/替代：malinkang/weread2notion & weread2notion-pro — 仅面向 Notion，GitHub Actions 定时同步；单向覆盖式同步会删除用户在 Notion 上的补充笔记；依赖 cookie/非公开接口（https://github.com/malinkang/weread2notion-pro）
  - 竞品/替代：zhaohongxuan/obsidian-weread-plugin — 仅 Obsidian；93 open issues，cookie 失效/无法同步类 issue 反复出现（#355 52 评论、#364 27 评论），随微信读书改版反复失效（https://github.com/zhaohongxuan/obsidian-weread-plugin）
  - 竞品/替代：drunkdream/weread-exporter — 导出整本书为 epub/pdf/mobi，82 open issues；逆向私有格式，法律边界模糊（https://github.com/drunkdream/weread-exporter）
  - 竞品/替代：lbq110/weread-exporter (Canvas Hook) — 2026 年新出的 Canvas Hook 方案，说明旧方案已失效需重做；321★，尚不成熟（https://github.com/lbq110/weread-exporter）
  - 竞品/替代：sancijun/weread-toolbox — 浏览器扩展导出 Markdown/同步 Notion，353★，33 open issues，维护一般（https://github.com/sancijun/weread-toolbox）
  - 竞品/替代：hadynz/obsidian-kindle-plugin — Kindle 侧已有官方 My Clippings/Notebook 导出，该插件 1,283★ 基本够用，Kindle 子需求痛点明显弱于微信读书（https://github.com/hadynz/obsidian-kindle-plugin）
- *buildable* → weak（6）：【簇的异质性】C04 混合了 5 类子需求，可建性差异极大，必须拆开评：(A) 微信读书/Kindle 划线·想法·书评 → Markdown/Notion/Obsidian/flomo 持续同步；(B) 把已购整本书导出到本地/Kindle；(C) Apple Notes 批量导出含附件；(D) 拿回京东/淘宝/支付宝/运营商/知乎/B站历史数据；(E) 自托管应用（Paperless/Mealie/memos）通用格式导出。

【关键新事实：壁垒已在 2026-05 部分坍塌】GitHub 证据显示微信读书于 2026-05-17 发布官方 Agent Skill（文档 weread.qq.com/r/weread-skills，App 内「我→设置→微信读书 Skill」或 weread.qq.com/api/skills/apikeyGet 领取 wrk- 前缀 API Key），只读开放书架、阅读进度、阅读统计、划线与想法、书籍搜索。簇里 why_unsolved 写的「Canvas 渲染+加密接口、不提供 API、封号风险」对子需求 A 已不再成立：weread2notion（2.9k★）与 obsidian-weread-plugin（2.3k★）都已切到 API Key 模式，README 明确「不再需要复制 Cookie」；4 个月内 awesome-weread
  - 竞品/替代：微信读书官方 Agent Skill / API Key（2026-05-17 发布） — 官方只读开放书架、进度、统计、划线与想法、搜索；消除了子需求 A 的逆向与封号壁垒，但仅是数据接口，不含 Markdown/Notion/Obsidian 导出体验；不含正文；ToS 商用边界与限流未公开。（https://github.com/BENZEMA216/awesome-weread）
  - 竞品/替代：obsidian-weread-plugin — 2.3k★，已支持官方 API Key + Cookie 双模式，同步书架/划线/想法/书评到 Obsidian；仍有 91 个 open issue（2026-09 登录卡死、封号疑问），只服务 Obsidian 用户且需自行配置。（https://github.com/zhaohongxuan/obsidian-weread-plugin）
  - 竞品/替代：weread2notion / weread2notion-pro — 2.9k★/3.4k★，GitHub Actions 定时同步到 Notion，已改用官方 API Key；pro 版当前标注不可用并建议改用 Chrome 扩展；对非技术用户门槛高（fork 仓库、配 Secrets）。（https://github.com/malinkang/weread2notion）
  - 竞品/替代：readneo — 183★，2026-05 基于官方 Skill API 的数据面板，一键导出 Markdown ZIP / Notion / flomo，数据仅存浏览器 localStorage；自托管为主，附 iOS App 与小程序，是与本簇子需求 A 最接近的既有产品。（https://github.com/extrastu/readneo）
  - 竞品/替代：mcp-server-weread — 576★，仅 Cookie 认证，README 承认 Cookie 频繁过期需配 CookieCloud；面向 AI 助手查询而非批量导出。（https://github.com/freestylefly/mcp-server-weread）
  - 竞品/替代：weread-exporter（Canvas Hook 整本书导出） — 2.1k★，导出整本书为 epub/pdf/mobi，README 自带「仅供技术研究、勿商用」免责声明；属绕过版权保护的灰色/违法方案，不能作为产品路径。（https://github.com/drunkdream/weread-exporter）

**用户原话 / 关键证据**：
> 微信读书导出/同步类工具至少15个独立作者且各>280★：weread2notion-pro 3,414★/6,417
> obsidian-weread-plugin #355"[BUG]登录后，显示cookie失效，登录失败"52条评论

**证据链接**：
- [] https://github.com/hicccc77/WeFlow — WeFlow - 一个本地的微信聊天记录导出和年度报告应用（同属『拿回自己的数据』动机）（14,486 stars）
- [] https://github.com/kangvcar/InfoSpider — INFO-SPIDER 是一个集众多数据源于一身的爬虫工具箱，旨在安全快捷的帮助用户拿回自己的数据…（8,258 stars）
- [] https://github.com/malinkang/weread2notion — "将微信读书划线同步到Notion"（2,926 stars）
- https://github.com/BENZEMA216/awesome-weread
- https://github.com/zhaohongxuan/obsidian-weread-plugin/issues/355

**产品概念**：面向非技术用户的托管同步器"书摘流"：用户粘贴微信读书官方API Key（App内设置一键获取）

**MVP 范围**：2-4周1-2人：官方API接入

**风险**：unmet被反驳：验证者核实weread2notion/obsidian-weread-

### 35. 多屏Windows用户要按屏独立桌面自动平铺（C18，总分 5.2）

**一句话**：面向非技术多屏用户的零配置GUI工具：应用层cloak实现

**用户与场景**：Windows多显示器办公。切换虚拟桌面时所有显示器一起切（PowerToys #58 👍337自2019

**现有方案及不足**：komorebi 15.2k★（商用需许可、CLI配置）

**为何至今没解决**：验证显示komorebi 15.2k★与GlazeWM

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(6)

- *unmet* → refuted（3）：簇的核心诉求（按屏独立“桌面”切换 + i3 式新窗口自动平铺）在 Windows 上已被两个成熟、活跃、口碑好的开源/源码公开项目覆盖：komorebi（15.2k★，nightly 2026-09-27 仍在发版，v0.1.41 2026-05；设计文档明确「Every monitor has its own collection of virtual workspaces」，`komorebic focus-workspace` 只切当前显示器的工作区，`focus-monitor-workspace` 切别的显示器）和 GlazeWM（12.8k★，GPL-3，i3 风格，「A workspace is automatically assigned to each monitor on startup」，可 bind_to_monitor）。二者免费可得（GlazeWM 完全自由；komorebi 个人非商用免费，上班使用需买个人商用许可），且已被 PowerToys 社区自己在 2026 年的 issue 里当作参照物点名（#47176 2026-04、#50384 2026-09，后者被官方以「重复 #2694」关闭）。另有 FancyWM（1.2k★，微软商店免费，集成原生虚拟桌面、按屏布局）、workspacer（1.8k★，MIT）等轻量替代。子诉求也各有现成方案
  - 竞品/替代：komorebi (LGUG2Z/komorebi) — 够用（核心场景）。15.2k★、2026-09-27 仍有 nightly。每台显示器有自己独立的一组 workspace，focus-workspace 只切当前屏，其他屏不动——正是 #58 要的效果；新窗口自动进入 BSP/列/网格等布局，即 i3 式自动平铺；stack/monocle 让「分区内最大化」需求消失。缺点：Komorebi License 2.0 禁止商用（上班用需买个人商用许可），CLI+JSON 配置+whkd 热键有学习曲线，靠 cloak/隐藏窗口实现 workspace，Win+Ctrl+方向键的原生虚拟桌面仍是全局的，UWP/管理员窗口有兼容问题。面向 power user 而非普通办公用户。（https://github.com/LGUG2Z/komorebi）
  - 竞品/替代：GlazeWM (glzr-io/glazewm) — 够用（核心场景）且完全免费 GPL-3。12.8k★，i3 风格，YAML 配置，每屏一个活跃 workspace、切换互不影响，可把 workspace 绑定到指定显示器；自动平铺、浮动、全屏状态齐全，winget/scoop 一键安装。缺点：最近正式版 v3.10.1 停在 2026-03，413 个 open issue；与 Windows 原生虚拟桌面并用会串屏（#432 未解决）；同样是键盘驱动的 WM 范式。（https://github.com/glzr-io/glazewm）
  - 竞品/替代：FancyWM (FancyWM/fancywm) — 部分够用。1.2k★，微软商店免费，动态平铺（水平/垂直/堆叠面板）、鼠标+键盘混合操作、按屏或全局布局、集成 Windows 原生虚拟桌面，对普通用户门槛最低。但它复用原生虚拟桌面，因此不能按屏独立切换桌面；平铺可关，面板内窗口即等价于分区内最大化。（https://github.com/FancyWM/fancywm）
  - 竞品/替代：workspacer (workspacer/workspacer) — 勉强。1.8k★、MIT、C# 脚本化配置，每屏独立 workspace + 自动平铺，功能与需求匹配，但社区活跃度明显低于 komorebi/GlazeWM，95 个 open issue，更新缓慢。（https://github.com/workspacer/workspacer）
  - 竞品/替代：bug.n (fuhsjr00/bug.n) — 不够用。AutoHotkey 写的经典 Windows 平铺 WM，3.4k★，但最后提交 2023-01，实质停更。（https://github.com/fuhsjr00/bug.n）
  - 竞品/替代：Windows 内置：任务视图「在所有桌面上显示此窗口」+ Win+数字键 + AltTabSettings 注册表 — 部分覆盖子需求。把 Outlook 钉到所有桌面即可在切换其他桌面时保留（#58 的举例场景）；任务栏固定应用按 Win+1..9 本身就是 launch-or-focus（已运行则聚焦，否则启动）；注册表 HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\AltTabSettings=1 恢复无缩略图的经典 Alt+Tab。但真正的按屏独立虚拟桌面和自动平铺 Windows 11 至今没有（Snap Layouts/FancyZones 仍是手动）。
- *crowd* → confirmed（7）：一、对簇内 evidence 的逐条审视（3 条，全部来自 GitHub 单一仓库 microsoft/PowerToys）：
(1) evidence[0] 是一个搜索结果页 URL，引文"Improved subpixel text rendering for OLED (#25595)"与本簇（多屏/桌面/平铺）毫无关系，是把该仓库票数第一的 OLED 字体渲染 issue 误读进来；engagement 字符串"354 / 189 / 65 / 65 / 63"把 OLED issue 的 👍354 与其他 issue 的评论数混在一起，属于错误归因。
(2) evidence[1] #279 "Maximize window within a zone"（senk-msft，2019-09）是 FancyZones 超宽屏分区内最大化的诉求，是真实需求（簇称 👍333、189 评论，搜索页确认其位列第 3），但与标题"按屏独立桌面"是不同的需求。
(3) evidence[2] #4 "Full window manager including specific layouts for docking and undocking laptops"（jcotton42，2019-05-07）是笼统的"要个完整窗口管理器"的愿望，标题侧重笔记本插拔坞站的布局恢复，作为"按屏独
  - 竞品/替代：komorebi (LGUG2Z) — 15,222★，活跃。按显示器独立 workspace + 自动平铺，直接覆盖标题两大诉求；但需接受平铺 WM 工作方式，且许可证禁止工作场景使用（需付费个人商用许可），与 Windows 原生虚拟桌面不互通。簇的 existing_solutions 未列出。（https://github.com/LGUG2Z/komorebi）
  - 竞品/替代：GlazeWM (glzr-io) — 12,812★，活跃。workspace 绑定显示器、多屏支持；但 FAQ 承认无原生自动布局，需社区脚本；不整合 Windows 虚拟桌面。簇未列出。（https://github.com/glzr-io/glazewm）
  - 竞品/替代：Seelen UI (eythaann) — 17,891★，含平铺窗口管理的完整桌面环境替换；对普通办公用户过重。簇未列出。（https://github.com/eythaann/Seelen-UI）
  - 竞品/替代：Whim (dalyIsaac) — 469★。明确以'Windows 虚拟桌面无法按显示器独立激活'为设计出发点，自建 workspace + 自动布局引擎；小众。（https://github.com/dalyIsaac/Whim）
  - 竞品/替代：FancyWM — 1,224★，动态平铺 WM，活跃；覆盖自动平铺，不解决原生虚拟桌面按屏切换。（https://github.com/FancyWM/fancywm）
  - 竞品/替代：workspacer — ~1.8k★，i3/xmonad 风格平铺 WM；覆盖自动平铺。（https://github.com/workspacer/workspacer）
- *buildable* → weak（6）：【簇要点】C18 = PowerToys 仓库 2019 年起累计 👍1300+ 的一组未实现需求：按显示器独立切换虚拟桌面(#58)、FancyZones 分区内最大化(#279)、i3 式自动平铺(#4)、launch-or-focus 热键、Alt+Tab 无缩略图、文件对话框跳转已打开的资源管理器路径。

【1. 小团队 2-6 周能否做出 MVP】
可以做出"窄 MVP"，但做不出"完整平铺窗口管理器"。
- 关键技术路径（已被开源社区验证）：不要碰 Windows 虚拟桌面。komorebi/GlazeWM 的做法是把"工作区"实现为应用层的窗口集合：SetWinEventHook 监听窗口创建/销毁/前台变化，EnumWindows + GetMonitorInfo 把窗口归属到显示器，切换工作区时用 ShowWindow(SW_HIDE) 或 DwmSetWindowAttribute(DWMWA_CLOAK) 隐藏/显示该显示器上的一组窗口，其他显示器不受影响——这直接消除 #58 的核心痛点，且完全绕开系统级改动。平铺用 BSP/列布局 + SetWindowPos/DeferWindowPos；分区内最大化用 EVENT_OBJECT_LOCATIONCHANGE/WS_MAXIMIZE 检测后回写分区矩形；launch-or-focus 用 Register
  - 竞品/替代：komorebi (LGUG2Z) — 15.2k★，87 open issues。Rust 实现的 Windows 平铺 WM，每个显示器拥有独立工作区，切换只影响当前屏，自动平铺；不使用系统虚拟桌面而是应用层隐藏/显示窗口，因此不受 COM GUID 变动影响。个人免费、商用需付费许可 + 赞助。已解决核心痛点，但配置文件/CLI 驱动，主流办公用户门槛高。（https://github.com/LGUG2Z/komorebi）
  - 竞品/替代：GlazeWM (glzr-io) — 12.8k★，350 open issues，GPL-3.0，i3 风格。工作区可 bind_to_monitor，各显示器独立切换；自动布局需社区脚本。同样面向键盘流开发者。（https://github.com/glzr-io/glazewm）
  - 竞品/替代：FancyWM — 1.2k★，MIT，winget/Microsoft Store 分发，零配置动态平铺，可按显示器独立面板布局，与 Windows 原生虚拟桌面集成（依赖未公开 COM，随系统更新有断裂风险）。最接近'主流用户版'，但传播度远低于前两者。（https://github.com/FancyWM/fancywm）
  - 竞品/替代：workspacer — 1.8k★，MIT，C# 平铺 WM，按显示器工作区；维护活跃度中等。（https://github.com/workspacer/workspacer）
  - 竞品/替代：MScholtes/VirtualDesktop 与 Ciantic/VirtualDesktopAccessor — 788★ / 1.1k★。操控 Windows 虚拟桌面的唯一途径 = 未文档化 COM 接口，需为 Win10/Win11/24H2/Server 分别维护版本，证明'走系统虚拟桌面'路线的平台脆弱性。（https://github.com/MScholtes/VirtualDesktop）
  - 竞品/替代：PowerToys FancyZones + Run Window Walker — 官方免费；FancyZones 只做手动分区无自动平铺、不支持分区内最大化(#279 open 自 2019)；按屏独立虚拟桌面(#58)标 Idea-New PowerToy 进 Backlog 无里程碑。（https://github.com/microsoft/PowerToys）

**用户原话 / 关键证据**：
> PowerToys #58："I always have Outlook on monitor 1, but want
> 反证：komorebi 15,222★"Every monitor has its own collection of

**证据链接**：
- [] https://github.com/search?q=repo%3Amicrosoft%2FPowerToys+is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc&type=issues — Improved subpixel text rendering for OLED (#25595)（354 / 189 / 65 / 65 / 63 👍）
- [] https://github.com/microsoft/PowerToys/issues/279 — Maximize window within the zone. Maximizing the w…（👍333, 189 条评论）
- [] https://github.com/microsoft/PowerToys/issues/4 — Full window manager including specific layouts fo…（👍293, 27 条评论）
- https://github.com/microsoft/PowerToys/issues/58
- https://github.com/LGUG2Z/komorebi
- https://github.com/glzr-io/glazewm

**产品概念**：Rust/C#托盘应用"Spaces for Windows"：不碰系统虚拟桌面

**MVP 范围**：4-6周1名Win32开发：按屏独立工作

**风险**：unmet被反驳：komorebi/GlazeWM/FancyWM已覆盖且免费活跃

### 36. 多机用户要可靠的短信验证码跨设备转发（C22，总分 5）

**一句话**：免webhook的"扫码配对"短信转发：Android副机E

**用户与场景**：双卡多机用户、海外用国内号码者。验证码发到另一台手机要跑去拿；SmsForwarder 28k★需自建webho

**现有方案及不足**：SmsForwarder 28.1k★（#760/#727保活open

**为何至今没解决**：验证显示SmsForwarder已成熟覆盖（28,138★、通道全

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(5)

- *unmet* → refuted（3）：核心场景（安卓副卡/备用机 → 主力手机/电脑/微信/钉钉/飞书/Telegram/邮箱，含验证码正则提取）已被 pppscn/SmsForwarder 成熟覆盖：28,138★/3,432 fork、2021 年至今持续维护（v3.5.0 于 2026-02-14 发布"五周年版"，最新构建 3.5.0.260920），通道覆盖钉钉/企业微信/飞书/Telegram/邮箱/Bark/webhook/Server酱/PushPlus/Gotify/ntfy/短信，v3.3.3 起支持 Bark 自动复制（iPhone 主力机可一键复制验证码），wiki 有"附录4：APP怎么保活"逐厂商教程，周边生态齐全（微信小程序端、webhook 服务端 nmhjklnm/sms_server 自动提取验证码、PushPlus 专供版、鸿蒙 NEXT 接收端 Hotify 2.0）。非技术用户走 PushPlus/Server酱 只需扫码取 token，门槛并不高。补充方案还有 capcom6/android-sms-gateway（5.8k★、免费、sms:received webhook）、notify-me（638★）、¥28 级硬件转发器（chenxuuu/sms_forwarding 1.5k★、Air780 系列、sms-bridge）以及 Windows 的 Microsoft 
  - 竞品/替代：SmsForwarder（pppscn） — 够用且是事实标准：免费开源、28k★、2026 年仍在发版，覆盖短信/来电/App通知 → 钉钉/企业微信/飞书/Telegram/邮箱/Bark/webhook/Server酱/PushPlus/Gotify/ntfy/短信，正则提取验证码，Bark 通道可自动复制到 iPhone 剪贴板，wiki 含逐厂商保活教程；缺陷：需自行配置通道（PushPlus/Server酱 扫码即可，Telegram/webhook 需技术）、安卓端不做本地剪贴板自动复制（not planned）、受小米 FBE 首次开机/一加/HyperOS4 beta 等 OEM 管控影响（属平台限制，任何第三方 App 同样受限）、鸿蒙 NEXT 不能作发送端。（https://github.com/pppscn/SmsForwarder）
  - 竞品/替代：SMS Gateway for Android（capcom6/android-sms-gateway） — 部分够用：5.8k★、免费、Apache-2.0，收到短信可 webhook 推送，支持云端/私有服务端；面向开发者 API，非技术用户不友好，不内置微信/钉钉通道。（https://github.com/capcom6/android-sms-gateway）
  - 竞品/替代：notify-me（jinweijie） — 够用的轻量替代：638★，短信/来电 → Bark/邮件/webhook，双卡支持，配置比 SmsForwarder 简单；无验证码提取，通道少，同样受 OEM 杀后台影响。（https://github.com/jinweijie/notify-me）
  - 竞品/替代：android_income_sms_gateway_webhook（bogkonstantin） — 极简短信→URL 转发，676★，仍在更新；只给 webhook，需自建接收端，仅适合技术用户。（https://github.com/bogkonstantin/android_income_sms_gateway_webhook）
  - 竞品/替代：smsforwarder.cn 短信转发助手（huahaotech） — 新项目（2025-12），31★，MIT，内置验证码提取与关键词过滤，通道企业微信/钉钉/飞书/webhook，仅 GitHub 发 APK；证明有人在做'更简单的 SmsForwarder'，但尚未形成口碑。（https://github.com/huahaotech/smsforwarder.cn）
  - 竞品/替代：硬件转发器：chenxuuu/sms_forwarding（ESP32C3+ML307R）、dushixiang/uart_sms_forwarder（Air780）、skylerhes/sms-bridge（USB 4G 上网卡+Linux）、knownsec/gsm（树莓派） — 对'副卡不想插手机'与海外华人保号场景够用且成熟（1.5k★，成本 ¥28 左右，淘宝有成品套件，三大运营商，通道 Bark/钉钉/飞书/PushPlus/Server酱/Telegram）；需焊接/刷固件或购买成品，非技术用户门槛中等；不覆盖'老人手机上的短信'场景。（https://github.com/chenxuuu/sms_forwarding）
- *crowd* → confirmed（7）：对簇内 evidence 本身的严格审视：(1) 3 条证据里 2 条是项目 README 的产品自述（SmsForwarder、smsforwarder.cn），不是用户在说"想要但没有"；第 3 条 issue #760 是单一用户（LSHGREAR，2026-07-12）对小米 FBE 首次开机不自启的诉求，页面上 0 可见评论/0 reaction。(2) 来源不独立：3 条全在 GitHub，其中 2 条来自同一仓库 pppscn/SmsForwarder；smsforwarder.cn 仅 31★、2025-12 新建，几乎没有附和。声称的 independent_source_count=6 与 platforms 仅 GitHub 不符，实际可见独立源约 2-3 个；"crowd_signal: viral" 是把 star 数当成了附和。(3) 簇描述里引用的各条厂商问题（一加掉线 #727、澎湃OS4 bark 失效 #772、鸿蒙接收 #765、验证码自动复制 #159/#609）核实都真实存在，但每条都是单人 issue、无可见 +1，#159 甚至无正文、#609 被 closed as not planned。仅看簇给的证据只能算 weak。
但 GitHub 交叉验证把结论抬到 confirmed：(a) SmsForwarder 28,138★/3,
  - 竞品/替代：pppscn/SmsForwarder — 事实上的主流方案，28.1k★；但需自配钉钉/企微/飞书/Telegram 机器人或 webhook/Bark 服务器，≥9 位不同用户报告被小米/OPPO/一加/ColorOS 杀后台或不自启，自动复制验证码请求被 closed as not planned；仅 Android，鸿蒙 NEXT 需靠第三方接收端（https://github.com/pppscn/SmsForwarder）
  - 竞品/替代：chenxuuu/sms_forwarding（ESP32+4G 模块硬件） — 1.5k★，绕开手机系统管控，稳定；但要买模块、烧固件，只解决副卡/保号场景，不能转发主力机上的 App 通知，非技术用户不可用（https://github.com/chenxuuu/sms_forwarding）
  - 竞品/替代：skylerhes/sms-bridge（USB 上网卡+Linux 盒子） — 431★、2025-11 新建，定位“云手机”替代备用机；需要玩客云/树莓派和 Docker，门槛同上（https://github.com/skylerhes/sms-bridge）
  - 竞品/替代：jinweijie/notify-me / SMS2Email / bogkonstantin webhook 网关 / sms-telebot / SMS2Telegram 等 — 数十到数百★的同类 Android 转发器，功能各覆盖一个通道（邮箱/Bark/Telegram/webhook），同样受 Android 后台限制，没有验证码跨设备自动填充（https://github.com/SMS2Email/SMS2Email）
  - 竞品/替代：huahaotech/smsforwarder.cn — 31★ 新项目，仍走企微/钉钉/飞书/webhook 通道，未降低配置门槛（https://github.com/huahaotech/smsforwarder.cn）
  - 竞品/替代：苹果“短信转发/iMessage 同步”、小米/华为/OPPO/荣耀自家多设备互联 — 只在同品牌生态内有效，跨品牌（如安卓副卡机→iPhone/Windows）无官方方案
- *buildable* → weak（5）：【簇核验】C22 数据来自 GitHub：pppscn/SmsForwarder 28.1k★/3.4k fork，2026-09-27 仍活跃，v3.5.0(2026-02)，15 open issues；仓库 issue 证实痛点：#760 HyperOS FBE 首次开机无法自启(open, help wanted, 无维护者回复)；#727 一加 Android16 "锁不住会掉线"(open, 13 评论, 2026-04)；#755 小米15/HyperOS3 "普通短信能转发、企业平台真实验证码短信收不到，OPPO/华为同配置正常"(2026-07)——说明 OEM 已开始把验证码短信对第三方 app 屏蔽；#639 ColorOS15 无法后台转发；#609/#149/#159 三次要求"验证码自动复制"，均 closed 未实现；#657 求鸿蒙版(不可能)。同时 GitHub 上硬件方案 chenxuuu/sms_forwarding 1.5k★、sms-bridge 431★、uart_sms_forwarder 369★、knownsec/gsm 348★——大量用户宁可把 SIM 卡插进 ESP32/4G 模块，说明"手机 app 常驻不可靠"是真实且长期的核心痛点。

【1. MVP 可行性：能做，2-6 周可出可用版，但"可靠"只能部分解决】关键技术路
  - 竞品/替代：pppscn/SmsForwarder — 28.1k★ 事实标准，渠道最全(钉钉/企微/飞书/邮箱/Bark/webhook/Telegram/Server酱/PushPlus/短信)，但需自建机器人/webhook、无官方接收端、无验证码自动复制(#609/#149/#159 closed 未做)，受 HyperOS FBE(#760 open)、一加 Android16 杀后台(#727 open)、小米15 验证码短信被系统屏蔽(#755)、ColorOS15(#639) 困扰，单人维护。（https://github.com/pppscn/SmsForwarder）
  - 竞品/替代：chenxuuu/sms_forwarding (ESP32C3+ML307R 硬件) — 1.5k★，把 SIM 插入几十元硬件模块转发，绕开手机 OS 管控最彻底，但需购买/焊接/刷固件，非技术用户不可用；同类 skylerhes/sms-bridge 431★、dushixiang/uart_sms_forwarder 369★、knownsec/gsm 348★。（https://github.com/chenxuuu/sms_forwarding）
  - 竞品/替代：jinweijie/notify-me — 638★，Bark/邮箱/Webhook 三渠道的轻量替代，同样受 OEM 后台限制，无接收端与自动复制。（https://github.com/jinweijie/notify-me）
  - 竞品/替代：bogkonstantin/android_income_sms_gateway_webhook — 676★，纯 webhook 网关，面向开发者，不解决非技术用户问题。（https://github.com/bogkonstantin/android_income_sms_gateway_webhook）
  - 竞品/替代：huahaotech/smsforwarder.cn — 31★，2025-12 新建，企微/钉钉/飞书/webhook + 验证码提取，纯本地无云服务，本质是 SmsForwarder 精简版，未解决可靠性。（https://github.com/huahaotech/smsforwarder.cn）
  - 竞品/替代：Microsoft Phone Link / Link to Windows — 免费，Android→Windows 跨品牌短信同步含验证码，但需微软账号与 Windows，且不覆盖手机→手机/微信；国内 ROM 与网络下可用性不确定。

**用户原话 / 关键证据**：
> SmsForwarder 28,138★/3,432 forks，搜"保活"命中10个issue、9个不同作者
> 过去2年至少10位作者重造并向硬件走：sms_forwarding 1,531★（¥27.8模块）

**证据链接**：
- [] https://github.com/pppscn/SmsForwarder — 短信转发器——监控Android手机短信、来电、APP通知，并根据指定规则转发到其他手机：钉钉群自…（28.1k stars, 3.4k forks…）
- [] https://github.com/huahaotech/smsforwarder.cn — 短信转发助手-再也不错过任何重要短信 轻量、稳定、开源的 Android 短信转发应用。（2025-12 新建）
- [] https://github.com/pppscn/SmsForwarder/issues/760 — 希望增加对小米手机（HyperOS / 澎湃OS）无人值守运行的支持——开启锁屏密码后首次开机无法…（open, label help wanted…）
- https://github.com/chenxuuu/sms_forwarding

**产品概念**：三件套：Android发送端（前台服务+directBootAware组件解决HyperOS

**MVP 范围**：4-6周1-3人：Android发送端

**风险**：unmet被反驳：SmsForwarder及周边生态已成熟，新产品只在UX增量

### 37. 女性要无低俗广告、隐私可信、功能全的经期记录（C49，总分 5）

**一句话**：本地优先、零广告零埋点的国产经期与备孕记录App

**用户与场景**：女性用户（含备孕）。美柚等头部经期App"功能一直没有提升"且"各种低俗小广告霸屏"

**现有方案及不足**：苹果健康经期跟踪、华为/小米/三星健康周期

**为何至今没解决**：验证显示用户已找到满意替代：簇内原帖自己推荐苹果健康

**验证结论**：unmet=refuted(3) crowd=weak(6) buildable=confirmed(7)

- *unmet* → refuted（3）：簇的证据本身就说明用户已经找到了满意的替代：小红书原帖推荐苹果健康"无广告、无付费、操作简单"，转向小米运动健康、Flo/Clue 的用户也表示"简洁和无广告"。逐项对照诉求：(1) 干净无广告+隐私可信：iOS 自带"健康-经期跟踪"（iOS 13 起内置，中文本地化，数据端到端加密，含经期/症状/排卵试纸结果/受孕窗口预测，iOS 17 起加妊娠模式与周期偏差提醒，配 Apple Watch S8+ 可用腕温估算排卵）已是成熟、口碑好、完全免费的方案；Android 侧华为运动健康、小米运动健康、三星健康均内置无广告生理周期模块（三星用 Natural Cycles 算法+手表体温）。(2) 功能全含备孕+本地化：Clue（柏林，GDPR，无第三方广告，有简体中文，Clue Conceive 备孕模式）与 Flo（简中，备孕/怀孕模式，匿名模式）功能都远超美柚基础版；缺陷是 Clue 高级预测走付费墙、Flo 有 2021 FTC 数据共享和解史、数据出境。(3) 开源/本地优先：drip.（symptothermal 法，BBT+宫颈黏液，真正支持备孕/自然避孕，iOS+Android 商店可下）、Mensinator（143★，F-Droid/Play，14 语言，活跃）、Peri（105★，23 语言含中文，Web/iOS/Android）、Menstrudel（109★
  - 竞品/替代：苹果健康「经期跟踪」(iOS 内置 Cycle Tracking) — 足够用（iPhone 用户）：免费、零广告、中文本地化、数据加密且可不离设备；经期/流量/症状/排卵试纸结果/受孕窗口与排卵预测，iOS 17+ 增加妊娠记录与周期偏差提醒，Apple Watch S8+ 可用腕温回溯排卵。簇内小红书证据自己就推荐它。短板：仅 iPhone；无 BBT 曲线、社区、专业备孕指导。（https://support.apple.com/en-us/HT210407）
  - 竞品/替代：华为运动健康 / 小米运动健康 / 三星健康 生理周期模块 — 基本够用（Android 主流国产/三星机）：系统级、无广告、中文、免费，含经期记录、预测、易孕期提示；三星健康周期功能基于 Natural Cycles 算法并可用 Galaxy Watch 体温。短板：功能偏基础，备孕专项弱，依赖品牌手机生态。
  - 竞品/替代：Clue — 功能上最接近'干净+功能全+备孕'：柏林公司、GDPR 约束、无第三方广告、有简体中文、Clue Conceive 备孕模式、症状/情绪/性生活等维度丰富。缺陷：排卵/更精细预测在 Clue Plus 付费墙后（约 40 美元/年）；数据在境外，部分中国用户顾虑；无微信生态。（https://helloclue.com）
  - 竞品/替代：Flo — 全球用户量最大，简中界面，备孕/怀孕模式，症状/健康助手，2022 年后有匿名模式；免费版无第三方展示广告但有 Premium 推销。缺陷：2021 年 FTC 就与 Facebook/Google 共享健康数据达成和解，隐私口碑受损；数据出境。（https://flo.health）
  - 竞品/替代：drip.（bloodyhealth，FOSS，GitLab 托管） — 隐私最强的备孕/自然避孕工具：GPL 开源，数据仅本地，symptothermal 法（基础体温+宫颈黏液+LH），F-Droid/Google Play/App Store 均可下。缺陷：是否有中文界面不确定；国内 Android 需侧载或 F-Droid，普通用户上手门槛高；界面偏工具化。（https://bloodyhealth.gitlab.io/）
  - 竞品/替代：Mensinator（FOSS Android） — 干净、本地、可导出、活跃维护、Play/F-Droid 可下、14 语言；经期+排卵+症状够日常用。缺陷：仅 Android，是否含中文不确定，无备孕专项（BBT 图表等）。（https://github.com/EmmaTellblom/Mensinator）
- *crowd* → weak（6）：对簇自带证据的审视：(1) 引文性质：证据1是"许多用户反映…低俗小广告霸屏"的转述式概括，不是第一人称"想要但找不到"的原话；证据2、3来自 xiaohongshu.com/mobile/question/ 页面，内容是产品对比/推荐清单（"不太推荐""适合没有备孕需求的用户""姨妈来咯是国产…"），属于清单类内容被读成需求，其中证据3只是在推荐苹果健康，根本不含抱怨。(2) 独立性：3条全部来自小红书单一平台；证据2、3的 question ID 相邻（1066648/1067643），高度疑似同一类聚合问答页而非两位独立作者，实际独立来源≈2；证据1的 note ID 5b0bada1 解码为 2018-05-28，已是8年前的旧帖，不能证明"现在仍无解"。(3) 互动：evidence 数组完全没有 engagement 字段，赞/评/收藏全部未知；independent_source_count=3 与 crowd_signal=several 明显高估。(4) 常识：不过，"经期App广告多/电商化/隐私不可信"是现实中反复出现的普遍抱怨——美柚、大姨妈靠广告与电商变现在应用商店评论和社区里被长期吐槽；海外方面 Flo 因向第三方SDK共享数据在2021年与FTC和解，2022年后"删掉经期App"的隐私讨论大规模出现，苹果在系统健康里内置经期记录、Clue/Euki 
  - 竞品/替代：getify/youperiod.app (open source, PWA) — 461★ 隐私优先、本地存储；英文、无中文本地化、最后更新 2023-09，功能偏基础，无备孕深度功能。（https://github.com/getify/youperiod.app）
  - 竞品/替代：EmmaTellblom/Mensinator (open source, Android) — 143★ 无追踪无注册，14 种语言；仅 Android，无 iOS，国内分发渠道弱，备孕功能有限。（https://github.com/EmmaTellblom/Mensinator）
  - 竞品/替代：ovumcy/ovumcy-web (open source, self-hosted) — 123★ 活跃维护、无广告无遥测；需自建 Docker 服务器，面向技术用户，不适合普通女性用户。（https://github.com/ovumcy/ovumcy-web）
  - 竞品/替代：J-shw/Menstrudel (open source, Flutter) — 109★ 离线本地存储；英文为主，功能基础。（https://github.com/J-shw/Menstrudel）
  - 竞品/替代：chaodeng060-source/period-tracker (open source, 中文自托管) — 23★ 极简单页自托管，功能极少，不是可用的消费级产品。（https://github.com/chaodeng060-source/period-tracker）
  - 竞品/替代：苹果健康 经期记录 (iOS 内置) — 无广告、隐私可信；但仅 iOS，功能基础，备孕/排卵追踪弱，Android 用户无法使用。
- *buildable* → confirmed（7）：【簇要点】C49：女性（含备孕）嫌美柚等头部经期App广告霸屏、功能不迭代；系统自带（苹果健康/小米）干净但备孕功能弱；Flo/Clue 体验好但担心本地化与数据出境。3 个小红书来源，crowd_signal=several，信号偏弱但痛点具体。

【1. 可建性：能，2-4 周出 MVP】
经期记录是典型"单机 CRUD + 规则预测"应用，无外部数据依赖，1-2 人足够。
关键技术路径：
- 本地优先、无账号：iOS 走 Swift/SwiftUI + SwiftData（可选 CloudKit 同步，中国区 iCloud 由云上贵州承载，规避数据出境疑虑）；跨端可用 Flutter + SQLite(drift)。全程不设自有服务器，"隐私可信"靠架构而非承诺。
- HealthKit 读写：直接导入用户已迁到"苹果健康"的经期/宫颈黏液/基础体温/排卵试纸记录，解决迁移成本，并把"苹果健康功能少"的用户接过来。
- 预测算法：近 6 周期均值+标准差预测经期；排卵日=下次经期-14 天，易孕窗 ±5 天；备孕模式加 BBT 折线图与"3-over-6"升温判定、LH 试纸结果记录、备孕→怀孕模式切换。
- MVP 功能：日历、经量/症状/情绪打卡、预测、本地通知提醒、BBT 图、备孕模式、CSV/JSON 导出导入、FaceID 应用锁、桌面小组件；零广告、零埋点 SDK
  - 竞品/替代：bloodyhealth/drip (开源, GPL-3, React Native) — 数据完全本地、含症状体温法(NFP)与备孕预测，功能上最接近目标；但英文/欧洲导向，无中文本地化与国内分发，Android 为主、iOS 尚在开发。（https://github.com/bloodyhealth/drip）
  - 竞品/替代：Mensinator (开源, Kotlin) — 隐私优先安卓经期记录，143★，无备孕深度功能、无中文。（https://github.com/search?q=period+tracker&type=repositories&s=stars&o=desc）
  - 竞品/替代：Menstrudel (开源, Flutter) — 离线免费，109★，近期活跃；基础记录为主，无本地化。（https://github.com/search?q=period+tracker&type=repositories&s=stars&o=desc）
  - 竞品/替代：YouPeriod.app (开源 PWA) — 隐私优先网页版，461★，2023 年后停止更新。（https://github.com/search?q=period+tracker&type=repositories&s=stars&o=desc）
  - 竞品/替代：ovumcy/ovumcy-web (开源, 自托管) — Docker 自托管，123★，面向极客，不适合大众女性用户。（https://github.com/search?q=menstrual+cycle+privacy&type=repositories&s=stars&o=desc）
  - 竞品/替代：国内小程序开源仓库（小姨妈/big-aunt 等） — 均为 2016-2021 练手项目，<40★，不可作为成熟方案。（https://github.com/search?q=%E5%A7%A8%E5%A6%88+%E5%B0%8F%E7%A8%8B%E5%BA%8F&type=repositories&s=stars&o=desc）

**用户原话 / 关键证据**：
> 小红书：许多用户反映美柚等应用"功能一直没有提升"和"各种低俗小广告霸屏"；"姨妈来了在进入App时有广告，不太推荐"
> 3位用户在2个去广告规则仓库分别提issue「请添加【美柚】去广告规则」

**证据链接**：
- [] https://www.xiaohongshu.com/discovery/item/5b0bada1aac7cb3c66d93506 — 许多用户反映美柚等应用存在"功能一直没有提升"和"各种低俗小广告霸屏"的问题
- [] https://www.xiaohongshu.com/mobile/question/1067643 — 部分应用如"姨妈来了"在进入App时有广告，而且页面设计一般，不太推荐
- [] https://www.xiaohongshu.com/mobile/question/1066648 — 苹果自带的"健康"应用无广告、无付费，操作简单，无需下载，适合没有备孕需求的用户……姨妈来咯是国产…
- https://github.com/getify/youperiod.app
- https://github.com/EmmaTellblom/Mensinator

**产品概念**：iOS优先（SwiftUI+SwiftData，可选CloudKit走云上贵州

**MVP 范围**：2-4周1-2人：iOS版日历打卡

**风险**：unmet被反驳：苹果健康、华米三星健康、Clue/Flo

### 38. 自建书库用户要无线投递电纸书与手写批注（C08，总分 4.8）

**一句话**：Audiobookshelf的Kobo/OPDS桥接器

**用户与场景**：用Audiobookshelf。想要Send-to-Kindle同等体验：一键无线推EPUB到电纸书并同步进度（

**现有方案及不足**：Calibre-Web（逆向Kobo商店协议

**为何至今没解决**：验证显示Calibre-Web 18.3k★/CWA 6.3k★

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(4)

- *unmet* → refuted（3）：簇的核心场景——自建书库无线投递 EPUB 到 Kobo/Boox 并同步进度——已被多个成熟、免费、活跃维护且口碑良好的开源项目覆盖：Calibre-Web（18.3k★，README 明写"Sync Kobo devices with your Calibre library"+OPDS+一键送书）、Calibre-Web-Automated（6.3k★，自动转 kepub，"KOReader → CWA → Kobo"三方进度统一）、Komga（6.7k★，Kobo Sync + KOReader Sync + OPDS v1/v2）、BookLore（1.3k★，Kobo/OPDS/KOReader/Send-to-Kindle 全有）。这些是 r/selfhosted、r/kobo 的标准推荐。此外 Kobo 新机型（Sage/Libra 2/Clara 2E/Libra Colour 等）原生支持 Dropbox 与 Google Drive 无线同步（基于我的知识；GitHub 上 FeedstoKobo/kpub 等项目"via Dropbox"侧面佐证），send2ereader（1k★，有公共实例 send.djazz.se）用 Kobo 自带浏览器即可收书；Boox 是 Android，原生有 BooxDrop/push.boox.com/文石传书小程序，且可
  - 竞品/替代：Calibre-Web（Kobo Sync + OPDS + 一键送书） — 够用且是事实标准：18.3k★、活跃维护、免费。Kobo 一次性改 eReader.conf 的 api_endpoint 后即可无线收书并回传阅读进度/统计、按书架选择同步。缺点：逆向 Kobo 商店协议，固件更新偶有破坏（12 个相关 open issue），不同步 PDF，大库可能超时，删书不会从设备移除。（https://github.com/janeczku/calibre-web）
  - 竞品/替代：Calibre-Web Automated (CWA) — 够用、口碑好：6.3k★，2026-09 仍每日提交。自动入库、自动转 KEPUB、Kobo Sync、内置 KOSync 并做 KOReader→CWA→Kobo 三方进度统一，正是簇要的"投递+进度同步"。缺点同 CW 的协议脆弱性（#1418 固件 4.45+ 曾中断，社区已提修复），458 个 open issue 说明打磨中。（https://github.com/crocodilestick/Calibre-Web-Automated）
  - 竞品/替代：Komga — 够用：6.7k★，Kobo Sync + KOReader Sync + OPDS v1/v2 全部内置，活跃。偏漫画/杂志向但支持 EPUB。（https://github.com/gotson/komga）
  - 竞品/替代：BookLore — 够用（较新）：1.3k★，Kobo 同步、OPDS、KOReader 进度同步、发送到 Kindle/邮箱一站式；不含有声书。（https://github.com/booklore-app/booklore）
  - 竞品/替代：KOReader（OPDS 客户端 + Calibre 无线接收 + KOSync） — 投递/浏览子需求够用：29.9k★，可装在 Kobo/Kindle/PocketBook/Boox/reMarkable，直接浏览任意 OPDS 书库下载、接收 Calibre 无线推送、KOSync 同步进度。手写批注子需求不够用：#2633 自 2017 年 open 至今、help-wanted，无官方实现。（https://github.com/koreader/koreader）
  - 竞品/替代：pencil.koplugin（KOReader 手写插件） — 不够用：148★，2026-01 才起步，仅支持 Kobo Libra Colour+Kobo Stylus 2、EPUB，重排版后笔迹错位，30 个 open issue，实验性。是开源手写批注方向唯一有人气的尝试。（https://github.com/mysticknits/pencil.koplugin）
- *crowd* → confirmed（7）：核验结论：反驳失败——这不是个别人的想法，但簇的表述有三处夸大。

(1) 引文性质：#3504 原帖是真实的"想要但没有"（ABS 只能邮件投递、Kobo 无邮件通道），#2633 是真实功能请求（Boox 用户要在 KOReader 里手写批注）；#189 作者自称 "pie in the sky idea"，是设想而非抱怨，属弱证据。三条均非软文/清单。

(2) 独立性：三位不同作者（emteedubs 2024、chenxingqun 2017、zombiehoffa 2021），两个仓库，但**只有 GitHub 一个平台**（platforms 字段自己也只写了 GitHub），且三条证据分别对应三个不同子诉求（Kobo 投递 / 手写批注 / 读听同步），并不是"很多人说同一件事"，而是把三个各自最高票的 issue 拼成一个簇；independent_source_count=16 无法从 evidence 数组核对。

(3) 互动可见性：无法通过可用工具读到精确 👍 数（API 被会话策略拦截、issue 页为 React 渲染），但已核实：按 👍 降序，#3504 在 audiobookshelf（14.5k★，~1k open issues）排第 1；#2633 在 koreader（29.9k★）排第 1（去掉置顶）、#8537 stylus PDF 批
  - 竞品/替代：Calibre-Web (janeczku) — 18.3k★；README 明确 'Sync Kobo devices with your Calibre library' 与 OPDS feed。逆向 Kobo API，需反代/配置，但已是事实标准；'kobo' 相关 issue 多为同步偶发故障（#3714, #3688, #3656），说明被大量使用。基本解决 Kobo 无线投递子诉求。（https://github.com/janeczku/calibre-web）
  - 竞品/替代：Calibre-Web-Automated — 6,334★；继承 Kobo Sync，并已实现 KOReader 进度同步（#319 Done）。对自建书库+Kobo/KOReader 用户覆盖度高。（https://github.com/crocodilestick/Calibre-Web-Automated）
  - 竞品/替代：Komga — 6,694★；内建 OPDS、Kobo Sync、KOReader Sync。面向漫画但支持 eBook；证明该功能已被多个项目独立实现。（https://github.com/gotson/komga）
  - 竞品/替代：BookLore — 1,251★（2024-12 起）；Kobo & KOReader sync、OPDS 开箱即用。新一代自建书库把 Kobo 同步当作标配。（https://github.com/booklore-app/booklore）
  - 竞品/替代：Grimmory — 4,438★（2026-03 起）；ebooks+comics+audiobooks 一体，配 KOReader 插件与 OPDS；issue #22 提及 kobo sync。部分覆盖'书+有声书一个库'的诉求。（https://github.com/grimmory-tools/grimmory）
  - 竞品/替代：Stump — Kobo Sync 请求 #361 已通过 PR #1046 实现并关闭。（https://github.com/stumpapp/stump/issues/361）
- *buildable* → weak（4）：簇C08实际捆绑了三个异质需求：(a) 自建书库→Kobo/Boox 无线投递+进度同步；(b) 有声书/电子书读听同步（EPUB3 media overlay + Whisper 对齐）；(c) 开源阅读器（KOReader）里的 e-ink 手写批注。三者可行性差异极大，需拆开评估。

【1. 小团队 2-6 周能否做出 MVP】
(a) 投递+同步：可以，但只是"桥接器"而非独立产品。技术路径：一个 Docker 小服务，读 Audiobookshelf REST API（ABS 有 token 化 API），对外暴露 ①OPDS 目录（KOReader/Boox 任何阅读器可浏览下载，标准协议，1 周内可做）；②Kobo 同步端点——移植 Calibre-Web 的 kobo.py（模拟 Kobo 商店同步 API，设备端改 Kobo eReader.conf 的 api_endpoint 指向自建服务器；CWA/Komga 已证明 2-3k 行代码可实现）；③KOReader kosync 进度端点并把进度回写 ABS；④对新款 Kobo（Sage/Elipsa/Libra 2/Clara 2E 及以后，固件原生支持 Dropbox/Google Drive）用云盘推送实现"真正一键无线"。1-2 人 3-5 周可做完。注意 Calibre-Web 为 GPLv3，若直接
  - 竞品/替代：Calibre-Web (janeczku) — 18.3k star。已实现逆向 Kobo 同步、OPDS、邮件 send-to-ereader；缺点是需第二套 Calibre 书库、设备改 api_endpoint、配置门槛高。覆盖投递核心痛点的大部分。（https://github.com/janeczku/calibre-web）
  - 竞品/替代：Calibre-Web-Automated — 6.3k star，活跃维护。Kobo 同步、KOReader kosync、一键/自动 send-to-ereader、kepub 转换、OPDS，README 明确“Syncs KOReader → CWA → Kobo”。基本就是簇内投递+进度同步需求的现成答案，只是与 Audiobookshelf 不是同一书库。（https://github.com/crocodilestick/Calibre-Web-Automated）
  - 竞品/替代：Komga — 6.7k star，仓库描述明确写 “OPDS, Kobo Sync and KOReader Sync support”，证明 Kobo 逆向同步已成自托管书库的标配功能。（https://github.com/gotson/komga）
  - 竞品/替代：Sake — 2026-03 新项目，102 star，宣称 KOReader 同步、进度与笔记同步、OPDS、WebDAV、自动投递书籍——直接对标本簇。（https://github.com/Sudashiii/Sake）
  - 竞品/替代：BookOrbit / grimmory — 2026 年新出的自托管书库（分别 4.7k/4.4k star），均带 OPDS 与有声书/电子书统一管理，说明赛道拥挤、免费方案迭代快。（https://github.com/bookorbit/bookorbit）
  - 竞品/替代：Readest — 24.6k star 跨平台开源阅读器，支持 OPDS、WebDAV、Calibre、KOReader 同步插件、TTS；Boox（Android）用户可直接用，削弱 Boox 侧投递痛点。（https://github.com/readest/readest）

**用户原话 / 关键证据**：
> ABS #3504："Currently send to ereader only supports via
> koreader #2633手写批注👍95/47评论，koreader（29.9k★）开放issue榜第1

**证据链接**：
- [] https://github.com/advplyr/audiobookshelf/issues/3504 — Support kobo sync for ebooks — "Currently send to…（👍 256, ❤11, 14 评论, labels: …）
- [] https://github.com/koreader/koreader/issues/2633 — I'm using Onyx Boox Max 13.3 inches android eink …（👍 95, ❤22, 🚀16, 47 评论…）
- [] https://github.com/advplyr/audiobookshelf/issues/189 — [enhancement] sync ebooks and audiobooks via proc…（👍 91, 36 评论）
- https://github.com/janeczku/calibre-web

**产品概念**：Docker小服务"ABS Bridge"：读取Audiobookshelf REST API

**MVP 范围**：3-5周1-2人：OPDS目录（1周

**风险**：unmet被反驳：Calibre-Web/CWA/Komga

### 39. 多网盘用户要聚合挂载成本地盘且断点上传（C10，总分 4.8）

**一句话**："OpenList增强发行版"：Tauri桌面壳一键打包Op

**用户与场景**：持有百度/阿里/夸克/115。每个网盘一个App、非会员限速几十KB/s、不给直链不支持WebDAV

**现有方案及不足**：OpenList 24.8k★（40+驱动、分块续传、安全分享）

**为何至今没解决**：验证显示OpenList PR #2723（2026-08

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(4)

- *unmet* → refuted（3）：簇的核心场景（把百度/阿里/夸克/115/OneDrive 等多网盘聚合成一个入口、挂本地盘/WebDAV 给播放器与备份、网盘间互传、带密码/有效期/次数的分享链接、断点分块上传）在 2026-09 已被免费、活跃、高口碑的方案覆盖，且簇 why_unsolved 里点名的两处"未做"已经过时：(1) OpenList 后端 PR #2723「feat(fs): add pipelined multipart upload」2026-08-06 合并、前端 PR #577「multipart uploader with resumable chunked transfer」2026-08-08 合并，明确针对 Cloudflare 免费版 100MB 413 问题，支持中断后从最后一个 chunk 续传、失败会话保留 30 分钟、对全部 87 个驱动零改动、已在 local/S3/WebDAV/百度/123 上测试（仍未做的只是 WebDAV 端分块，issue #460 因此仍 open）。(2) 分享系统：PR #991「support more secure file sharing」2025 年合并，internal/model/sharing.go 已有 Pwd/Expires/MaxAccessed/Disabled/Readme 字段，并强制 web 代理隐藏真实路
  - 竞品/替代：OpenList（AList 社区 fork） — 够用，且是该场景事实标准。24.8k★、月度发版、40+ 驱动覆盖百度/阿里/夸克/115/OneDrive/123/PikPak/迅雷等，提供 WebDAV、跨存储复制、离线下载。簇里点名的两大缺口已补齐：2025 年 PR #991 上线带密码/有效期/最大访问次数/强制代理隐藏路径的分享（2026-05 再加自定义分享 ID）；2026-08 PR #2723+前端 #577 上线浏览器端分块+断点续传，专门解决 Cloudflare 免费版 100MB 413 与失败重传。剩余不足：WebDAV 端分块未做（#460 仍 open）；需自建 Docker；驱动依赖逆向接口会周期性失效；非会员限速无法绕过。（https://github.com/OpenListTeam/OpenList）
  - 竞品/替代：OpenList-Desktop — 够用于「挂成本地盘」。1.5k★，GPL-3，Win/mac/Linux 图形化管理 OpenList 并通过 rclone 把 WebDAV 挂为网络驱动器，v0.9.1（2026-07）支持每挂载点独立设置与 VFS 写缓存。缺点：Windows 需另装 WinFsp，本质仍是 rclone mount 的封装。（https://github.com/OpenListTeam/OpenList-Desktop）
  - 竞品/替代：AList（原项目，现由新所有者维护） — 功能上仍覆盖聚合+WebDAV+分享，50k★；但 2025 年出售后社区信任度下降，分块上传与精细分享功能落后于 OpenList，使用需自担信任风险。（https://github.com/AlistGo/alist）
  - 竞品/替代：rclone — 海外网盘（OneDrive/Google Drive/Dropbox/S3/PikPak 等）挂载与同步的黄金标准，60k★，v1.75.1（2026-09）活跃，mount+chunker+crypt 原生支持大文件分块与断点。缺点：无百度/阿里云盘/夸克/115 原生后端（#2099 自 2018 年 open 至今），国内网盘只能经 OpenList 的 WebDAV 间接挂载；纯 CLI，普通用户门槛高。（https://github.com/rclone/rclone）
  - 竞品/替代：CloudDrive2（cloud-fs） — 中国 Emby/NAS 圈最常用的图形化本地挂载方案：支持 115/阿里云盘/百度/夸克/天翼/OneDrive/Google Drive/WebDAV 等挂为本地盘符与网盘间互传，Windows/Linux/Docker/群晖，2026-09 仍在持续发版与处理 issue（186 个 issue、1.6k★ 追踪仓库）。缺点：闭源、免费版对挂载数量等有限制需付费解锁（具体额度不确定）、部分用户报告播放卡顿/CPU 占用问题。（https://github.com/cloud-fs/cloud-fs.github.io）
  - 竞品/替代：LitePan — 部分够用：1.3k★、7 天前更新，多网盘聚合 + WebDAV + FUSE 本地挂载 + STRM + 网盘间秒传 + 断点/缓存传输，面向 Emby/Jellyfin。缺点：PolyForm 非商业许可，Go 重写仍是 beta，支持的网盘列表未在 README 明示。（https://github.com/Ponphil/LitePan）
- *crowd* → confirmed（7）：对簇内证据的审视：(1) evidence 数组仅 3 条，引文全是仓库自我描述（"一个支持多存储的文件列表/WebDAV程序"、"A new AList Fork…"、"集成了分享链接/秒传链接转存功能"），属产品说明而非"想要但没有"的用户表达；description 里的关键叙事（413/从头传、"标accepted未做"、迁移公告👍386、sign链接暴露路径）均不在 evidence 数组内。(2) 独立性：AList 与 OpenList 是同一代码库的 fork，用户群高度重叠，50k+25k 星不能简单相加；BaiduPCS-Go 是单网盘 CLI，与"聚合挂载"关联弱。platforms 声称含 v2ex/appinn，但没有任何一条来自这两处；independent_source_count=15 无对应证据支撑。(3) 互动：星数可见且巨大，但"分块/断点上传"这一具体诉求的单条 issue 互动很薄——OpenList #460 0 评论、AList #5480/#7026 页面未显示👍；#5176 被 closed not planned，两条 413 报告被标 invalid。(4) 未核实/与事实不符：AList 中 label:accepted+上传 只有 2 条已关闭 issue（#5579 API task id、#5392 百度>10G 已修）
  - 竞品/替代：AList (AlistGo/alist) — 事实标准，50.2k★/524 open issues；多网盘聚合+WebDAV 可用；分块/断点上传自 2023 起反复被要求仍 open；2025-06 商业化信任危机导致社区分裂（https://github.com/AlistGo/alist）
  - 竞品/替代：OpenList (OpenListTeam/OpenList) — AList 社区 fork，15 个月 24.8k★；同一代码库，分块上传 #460 仍 open（0 评论），无 accepted 标签 issue；大文件上传各驱动（夸克/115/123/天翼）失败报告持续出现（https://github.com/OpenListTeam/OpenList）
  - 竞品/替代：rclone — 60k★ 通用挂载工具，但无百度/夸克/115 等国内网盘后端；#2099 百度网盘支持自 2018 年开至今未做，需配合 AList WebDAV 使用（https://github.com/rclone/rclone）
  - 竞品/替代：CloudPaste — 2.7k★，Serverless 多存储聚合+WebDAV 挂载，已实现分块断点上传与密码/有效期/次数分享；但不支持百度/阿里/夸克/115 等国内网盘，Workers 部署仍受 CF 100MB 限制（https://github.com/ling-drag0n/CloudPaste）
  - 竞品/替代：LitePan — 1.3k★，多网盘聚合挂载+STRM+媒体整理，面向 Emby/Jellyfin；非商业许可，README 未列支持网盘清单，成熟度与生态远小于 AList（https://github.com/Ponphil/LitePan）
  - 竞品/替代：messense/aliyundrive-webdav — 9.8k★ 单网盘 WebDAV 桥，已归档——第三方依赖私有接口失效的典型（https://github.com/messense/aliyundrive-webdav）
- *buildable* → weak（4）：【簇要点】C10 = 多网盘聚合挂载(本地盘符/WebDAV) + 断点续传上传 + 带密码/有效期/次数的分享短链 + "非会员不限速"。AList 50.2k★/524 open issues，OpenList 24.8k★/199 open issues，rclone 60k★但不支持百度/夸克/115。

1. 小团队 2-6 周 MVP 可行性：部分可行，但只对"增量功能"可行，对"整套产品"不可行。
- 聚合挂载本身已被 OpenList(40+ 驱动)+rclone/WinFsp/macFUSE、闭源付费的 CloudDrive2、以及 2025-26 年新出的 LitePan(1.3k★, Go, WebDAV+FUSE+STRM+跨盘秒传, PolyForm Noncommercial)解决；1-3 人不可能在几周内重写 40 个逆向驱动，只能 fork OpenList。
- 真正未做的两块可在 4-6 周内做出：(a) 前端 tus 式分块+断点续传：浏览器切片→服务器落盘暂存→映射到各盘 multipart 接口(百度 precreate/superfile2 4MB 分片、115 Open/阿里 OSS multipart+STS、OneDrive uploadSession、S3/本地)，只覆盖头部 4-5 个驱动；这同时解决 Cloudflare 免费
  - 竞品/替代：AList — 50.2k★/7.9k fork/524 open issues；多存储 WebDAV/文件列表事实标准，2025 年被收购引发信任危机；断点续传(前端分块)与带密码/有效期分享仍未实现；115 令牌相关 issue #9576 (2026-07) 显示驱动持续失效。（https://github.com/AlistGo/alist）
  - 竞品/替代：OpenList — 24.8k★/2.3k fork/199 open issues，AList 社区 fork，40+ 驱动含百度/阿里/夸克/115/OneDrive，支持 WebDAV；README 未提分块续传与密码/过期分享；近期 open issue：#3110 web 上传内存泄漏 OOM、#3124 115 Open STS 凭证过期、#3117 123 云盘上传 500——覆盖聚合挂载但断点上传与分享短链缺口仍在。（https://github.com/OpenListTeam/OpenList）
  - 竞品/替代：rclone — 60k★/993 open issues，本地挂载/同步事实标准，但不支持百度/夸克/115 等国内个人网盘，只能作为 OpenList WebDAV 的挂载层；resumable upload 提案 105👍 长期 open。（https://github.com/rclone/rclone）
  - 竞品/替代：LitePan — 1.3k★/161 fork，2025-26 新项目，Go，'多网盘聚合挂载，支持 WebDAV、STRM、媒体整理、本地挂载(FUSE)、跨盘秒传'，PolyForm Noncommercial 许可(禁商用)、不接受公开 PR、v0.5.6-Beta；证明该方向仍有新入局者且开源免费。（https://github.com/Ponphil/LitePan）
  - 竞品/替代：CloudPaste — 2.7k★，Serverless 自托管文件管理与文本分享，支持多存储与 WebDAV 挂载，偏分享/文本场景，不做国内网盘逆向驱动。（https://github.com/ling-drag0n/CloudPaste）
  - 竞品/替代：CloudDrive2 — 闭源付费(订阅制，价格不确定)，Windows/NAS 上把多网盘挂成本地盘，GitHub 上有一键安装脚本(115★/50★)与 Emby/Jellyfin 伴侣插件生态，是本簇唯一被验证的付费竞品；同样依赖私有接口，无官方 GitHub 仓库。

**用户原话 / 关键证据**：
> AList 50,229★/524 open issues
> rclone #2099"support for baidu pan"自2018 open

**证据链接**：
- [] https://github.com/AlistGo/alist — "一个支持多存储的文件列表/WebDAV程序"（50,229 stars / 7,937 forks …）
- [] https://github.com/OpenListTeam/OpenList — "A new AList Fork to Anti Trust Crisis…a resilien…（24.8k stars, 2.3k forks…）
- [] https://github.com/qjfoidnh/BaiduPCS-Go — "iikira/BaiduPCS-Go原版基础上集成了分享链接/秒传链接转存功能"（5,667 stars / 237 open issu…）
- https://github.com/rclone/rclone/issues/2099

**产品概念**：面向普通NAS/Windows用户的桌面壳"网盘盒"：Tauri打包OpenList内核

**MVP 范围**：4-6周1-3人：桌面壳+一键挂载

**风险**：unmet被反驳：OpenList已上线分块续传与安全分享

### 40. 本地优先用户要自托管多端同步与选择性差量同步（C11，总分 4.8）

**一句话**：Syncthing伴侣面板：Dropbox式勾选树选择性同步

**用户与场景**：多设备隐私/自托管用户。订阅、书签、高亮、时间追踪数据在设备间不同步只能手工导入导出（NewPipe

**现有方案及不足**：Syncthing（Android分支2.9k★

**为何至今没解决**：验证显示文件层已被Syncthing 89k★/Nextcloud

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(4)

- *unmet* → refuted（3）：C11 是 D07（本地优先应用自托管多端同步）与 D12（选择性/差量文件同步）的合并簇，两部分要分开看。

(1) 文件层"自托管 + 选择性 + 差量同步"已被非常成熟、口碑极好的方案覆盖：Syncthing（GitHub 实测 88,965 stars，2026-09-27 仍活跃；块级差量、.stignore 选择性同步、无中心服务器；Android 官方客户端 2024-12 停更但 Catfriend1/syncthing-android 分支 2.9k stars 活跃接手，iOS 有免费开源的 pixelspark/sushitrain(Synctrain) 2,069 stars）；Nextcloud（36.9k stars，桌面端文件夹级选择性同步/虚拟文件）；Seafile（15.3k stars，块级去重差量、按资料库选择同步）；rclone（60k stars，bisync）；商业/平台侧还有 Resilio Sync、Synology Drive 按需同步、坚果云 WebDAV、微力同步等。簇内证据 Syncthing #2491（树状忽略 UI，2015 年开，仍 open）和 #3388（DHT 发现，2016 年开，仍 open）确认属于 Syncthing 的"体验打磨"缺口而非能力缺口——Nextcloud/Seafile/Resilio 早
  - 竞品/替代：Syncthing（+ Catfriend1 Android 分支 + Synctrain/sushitrain iOS） — 够用。89k stars、持续维护的开源 P2P 自托管同步，块级差量、.stignore 选择性同步、加密传输，全平台可用（Android 官方停更但分支活跃，iOS 有免费开源客户端）。缺陷：忽略规则靠手写模式（#2491 树状 UI 十年未做）、依赖官方发现/中继服务器（#3388 未做）；直接同步应用 SQLite 会冲突。是文件层需求的事实标准。（https://github.com/syncthing/syncthing）
  - 竞品/替代：Nextcloud（Server + Desktop/Android/iOS 客户端） — 够用。37k stars 自托管云盘，桌面端点选式选择性同步与虚拟文件（按需下载），移动端 WebDAV；同时是 Joplin/floccus/AntennaPod(gpodder)/Obsidian Remotely Save 等应用的通用同步后端。缺陷：无块级差量（整文件上传）、部署较重、移动端仅自动上传不做双向同步。（https://github.com/nextcloud/server）
  - 竞品/替代：Seafile — 够用。15k stars，块级去重与差量传输、按资料库选择同步、客户端加密资料库，中国团队维护且国内口碑好。缺陷：Pro 版部分功能收费，社区版功能有限。（https://github.com/haiwen/seafile）
  - 竞品/替代：rclone（bisync）/ rsync / Unison — 部分够用。60k stars，支持几十种后端的差量同步与加密；bisync 双向同步长期标记 beta，需脚本与定时任务，面向技术用户。（https://github.com/rclone/rclone）
  - 竞品/替代：Resilio Sync / Synology Drive / 坚果云 / 微力同步（商业或平台内置） — 部分够用。Resilio 提供 P2P 选择性同步但闭源且选择性同步在付费版；Synology Drive 在 NAS 上提供按需同步与多端客户端；坚果云提供 WebDAV 供 Obsidian/Zotero 等同步（免费额度有限）；微力同步为国内 P2P 同步工具。均为闭源/收费墙，但功能成熟。
  - 竞品/替代：Joplin（Nextcloud/WebDAV/S3/Dropbox/OneDrive/Joplin Server/文件系统同步） — 够用。56k stars，笔记类本地优先应用中自托管多端同步做得最完整，端到端加密。缺陷：移动端后台同步受系统限制（簇内提到的问题仍存在）。（https://github.com/laurent22/joplin）
- *crowd* → confirmed（7）：逐条核验 evidence 数组：(1) 第1条 URL 是搜索页而非 issue，指向 syncthing #3388「Use decentralized discovery (DHT)」——实测为维护者 calmh 本人 2016 年写的基础设施路线图 issue（123 评论、👍86 而非簇里写的 101），内容是用 DHT 替代中心化发现服务器，与"选择性/差量同步"或"应用数据多端同步"几乎无关，属于误归入本簇；(2) 第2条 #2491「Next Gen Ignores」也是维护者 calmh 2015 年写的需求规格，但确实是"Dropbox 式勾选树选择哪些目录同步"，👍116 ❤21 🎉11、101 评论、挂了 10 年未做，且按 👍 排序是 Syncthing 全部 open issue 的第 1 名；另有用户自发的 #9083「Selective File Synchronization and Deletion」👍75（第 5 名）佐证同一诉求；(3) 第3条 Organic Maps #622 为普通用户 2021 年发起，👍63 ❤11、113 评论、仍 open，明确要求用开源/自托管后端（git、Nextcloud，见子 issue #10199）。description 里提到但未列入 evidence 的：NewPipe #5325 用户原话「I
  - 竞品/替代：Syncthing — 88,965★ 的通用文件级 P2P 同步。能同步应用数据库文件但不理解结构（易冲突/损坏），选择性同步 UI（#2491 👍116）与 #9083（👍75）多年未实现；差量同步本身已是块级实现，簇中「差量」诉求无证据。（https://github.com/syncthing/syncthing）
  - 竞品/替代：Floccus — 8,499★，仅解决浏览器书签经 Nextcloud/WebDAV 自托管同步；证明单一应用数据的自托管同步有大量受众，但不覆盖 NewPipe/Organic Maps/KOReader 等。（https://github.com/floccusaddon/floccus）
  - 竞品/替代：koreader-sync-server — 769★ 官方可自托管，但只同步阅读进度；高亮/设置/历史同步（#4587/#4780/#4866）仍 open。（https://github.com/koreader/koreader-sync-server）
  - 竞品/替代：highlightsync.koplugin / koreader-syncthing — 第三方插件 235★ / 383★，经 WebDAV/Dropbox/Syncthing 同步高亮，部分填补空缺但非官方、需手动配置。（https://github.com/gitalexcampos/highlightsync.koplugin）
  - 竞品/替代：readest — 24,641★ 的跨平台阅读器，自带同步（含 WebDAV）；对 e-ink 设备覆盖有限，属替代产品而非为 KOReader 用户补齐同步。（https://github.com/readest/readest）
  - 竞品/替代：Joplin 自托管同步（Nextcloud/WebDAV/Joplin Server） — 56,498★，自托管多端同步已解决；未解决的是 Android 后台自动同步（#3872 open, backlog）与同步可靠性（#5779 👍20 136 评论）。（https://github.com/laurent22/joplin）
- *buildable* → weak（4）：簇 C11 由两个异质需求合并（D07 本地优先应用的跨端数据同步；D12 Syncthing 选择性/差量同步），需分开评估。

【1. 小团队 2-6 周能否做出真正消除核心痛点的 MVP】
- D07（NewPipe 订阅/播放列表、Organic Maps 书签、KOReader 高亮、Joplin 移动后台同步、ActivityWatch 时间数据）：核心障碍是平台沙箱——Android/iOS 上第三方 App 无 root 不能读写其它 App 的私有数据库（NewPipe 的 Room DB、Organic Maps 的 KML 目录、KOReader 的 .sdr 元数据在 e-ink 设备上可访问但手机端不行）。因此"外挂式"通用同步产品只能走"用户手动导出 → 同步 → 手动导入"，这正是用户现在已经在做且抱怨的事，痛点没有消除。真正的解决方式是每个上游 App 自己集成同步层（例如 BeeCount 2.4k★、Linkora 920★ 都是应用内自建 WebDAV/S3/自托管同步），这是给各开源项目提 PR 的工程贡献，不是可独立售卖的产品；NewPipe #5325 自 2021 年悬置、ActivityWatch #35 挂 bounty 无人接、Organic Maps #622 是 epic 级讨论，说明各项目维护者精力/意愿是瓶颈，第三方团队几
  - 竞品/替代：koreader/koreader-sync-server — 769★，官方自托管 KOReader 同步服务器；仅同步阅读进度，不同步高亮/批注（协议限制）（https://github.com/koreader/koreader-sync-server）
  - 竞品/替代：gotson/komga — 6.7k★，漫画/电子书媒体服务器，内置 KOReader Sync 与 Kobo Sync；证明'把多个同步协议捆进一个自托管服务'是已被验证的形态，但仍限于进度同步（https://github.com/gotson/komga）
  - 竞品/替代：ActivityWatch/aw-server-rust (aw-sync) — 318★，含实验性 aw-sync 模块（经共享目录如 Syncthing 同步）；issue #35 仍开放且 bounty 无人接，功能未达可用（https://github.com/ActivityWatch/aw-server-rust）
  - 竞品/替代：yausername/newpipe-sync-server — 19★，2019 年第三方 NewPipe 同步服务器尝试，基本停滞；因 NewPipe 未集成客户端，无法自动同步（https://github.com/yausername/newpipe-sync-server）
  - 竞品/替代：aspen-cloud/triplit — 3.1k★，面向开发者的全栈同步数据库（CRDT、可自托管）；解决的是'开发者如何给 App 加同步'，对最终用户无直接价值，需上游 App 采纳（https://github.com/aspen-cloud/triplit）
  - 竞品/替代：sqliteai/sqlite-sync — 570★，SQLite CRDT 离线优先同步扩展；同上，是开发者组件（https://github.com/sqliteai/sqlite-sync）

**用户原话 / 关键证据**：
> NewPipe #5325（2021开仍open无维护者回应）："I have two phones and a
> Syncthing #2491"Next Gen Ignores"要求"simple tree view with

**证据链接**：
- [] https://github.com/search?q=repo%3Asyncthing%2Fsyncthing+is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc&type=issues — syncthing/syncthing #3388 Use decentralized disco…（123 / 101 👍）
- [] https://github.com/syncthing/syncthing/issues/2491 — Next Gen Ignores: Requirements — Simple tree-view…（👍 116, ❤21, 101 评论, 0/20 子任…）
- [] https://github.com/organicmaps/organicmaps/issues/622 — Bookmark synchronization/online backup ... I'm th…（👍 63, ❤11, 113 评论）
- https://github.com/syncthing/syncthing/issues/9083
- https://github.com/TeamNewPipe/NewPipe/issues/5325

**产品概念**：Docker单二进制"SyncHub"：Syncthing伴侣Web面板调用/rest/db

**MVP 范围**：2-4周1-2人：Syncthing选择

**风险**：unmet被反驳：Syncthing/Nextcloud/Seafile与各应用自托管方

### 41. 读者要无广告可换源导入自有书跨端同步阅读器（C25，总分 4.8）

**一句话**：国内自有书库用户的"无广告本地阅读器+托管云同步

**用户与场景**：有自有电子书库的重度阅读者。番茄/七猫广告章节付费无法导出；微信读书/Kindle封闭格式笔记不能跨平台同步

**现有方案及不足**：legado主库（挂阅文侵权公告）及分支

**为何至今没解决**：验证显示换源半边由legado活跃分支（legado-with-MD3

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=weak(4)

- *unmet* → refuted（3）：C25 把两类需求捆在一起，拆开看都已有成熟、口碑好的方案，只各带一个结构性缺陷（法律风险 / 同步收费），不构成「没人做」。

(1) 网文换源+无广告+本地导入+听书+导出+WebDAV 同步：legado（阅读3.0）本身就是该场景的完整答案（自定义书源、本地 TXT/EPUB、TTS 听书、缓存导出、WebDAV 备份进度、免费无广告）。gedoor/legado 主库确实被阅文追责清空（仅 1 commit + 侵权告示，issue 受限），但生态没死：HapeLee/legado-with-MD3 6.3k star、2026-09-26 仍在推送、103 个 open issue；LegadoTeam/legado 1.3k、9-21 推送、8,446 commits；Luoyacheng/legado-E（阅读Sigma）2.8k；legado-Harmony 2.2k；服务端/网页版 hectorqin/reader 11k（本地书+OPDS+远程书源+多用户同步+Android/Web）；书源仓库 XIU2/Yuedu 12.4k、aoaostar/legado 6.5k 当天仍在更新；pengcw/legado.koplugin 把书库接到 KOReader 墨水屏。用户侧「无广告可换源」今天仍能免费满足；缺陷是持续的版权/下架风险和没有官方 iOS 版（iO
  - 竞品/替代：legado 阅读3.0 及其活跃分支（legado-with-MD3 / LegadoTeam / legado-E / legado-Harmony） — 功能上完全覆盖网文半边需求：自定义书源换源、本地 TXT/EPUB 导入、TTS 听书、缓存导出 TXT/EPUB、WebDAV 备份与进度同步、免费无广告。主库被阅文追责清空，但 MD3 分支 6.3k star 昨日仍推送、LegadoTeam 1.3k 上周推送。缺陷：合法性脆弱、随时可能再下架；Android 为主，无官方 iOS；同步靠 WebDAV 自建而非一键账号同步。够用但不安稳。（https://github.com/HapeLee/legado-with-MD3）
  - 竞品/替代：hectorqin/reader（阅读 服务端/网页版，自托管） — 11k star。Docker 一键部署，本地书 + OPDS + 远程书源，多用户各自书架/进度/笔记/高亮，浏览器 + Android 客户端，等于自建跨端同步的换源阅读器。缺陷：需自己部署；无 release，历史被重置为 170 commits，存续同样受版权压力影响。（https://github.com/hectorqin/reader）
  - 竞品/替代：Koodo Reader — 28.3k star，2026-09-26 刚发 v2.4.5。Win/mac/Linux/Android/iOS/Web 六端，导入 EPUB/PDF/MOBI/AZW3/TXT 等，WebDAV/主流网盘同步书与进度，笔记同步到 Notion/Obsidian/Readwise，KOReader 进度互通，无广告无追踪。Kindle 替代场景够用且成熟。不做网文换源。（https://github.com/koodo-reader/koodo-reader）
  - 竞品/替代：Readest — 24.6k star，两周前发 0.12.10，六端 + PWA，官方云同步书/进度/笔记，KOReader 同步，TTS，Audiobookshelf。缺陷：2026-07 起 WebDAV/Google Drive 第三方同步被塞进 Plus £4.99/月 付费墙（issue #5033），云存储有配额；免费用户同步受限。（https://github.com/readest/readest）
  - 竞品/替代：KOReader — 29.9k star，持续活跃。Kindle/Kobo/PocketBook/reMarkable/Android/Linux，KOSync 进度同步（可自建服务器），Calibre 无线传书，OPDS。对墨水屏用户是事实标准；缺 iOS/Windows/mac 原生端，UI 老派。（https://github.com/koreader/koreader）
  - 竞品/替代：Anx Reader — 8.9k star，MIT。Win/mac/iOS/Android，WebDAV 同步书、笔记、进度，TTS，AI，阅读统计。国人开发，中文体验好，对 Kindle 手机版替代够用。缺 Linux/Web 端。（https://github.com/Anxcye/anx-reader）
- *crowd* → confirmed（7）：对簇内证据本身的审视：(1) 三条 evidence 的 quote 全是项目 README 自我介绍（"阅读是一款可以自定义来源…""A modern ebook manager…""a modern, feature-rich ebook reader…"），没有任何一条是用户在说"想要但没有/现有的都不行"，形式上属于产品描述而非需求表达；(2) 三个项目作者不同、确属独立，但平台只有 GitHub 一个，description 里提到的"豆瓣豆列"没有对应 evidence 条目，independent_source_count=5 与实际 3 条不符，有夸大；(3) 互动不是 unknown，star 数可核实：legado 47,105 star/5,570 fork（仓库仍在，但代码已删、README 只剩侵权公告，"被迫删库"基本属实）；koodo-reader 28,317 star/271 open issues；readest 24,641 star，2024-10 创建，"两年 2.5 万"属实。(4) 常识层面：国内网文读者对"无广告、可换源、能导出/听书"的诉求是长期反复出现的，legado 被下架后一年内出现 legado-with-MD3（6.3k star，2025-08 创建）、legado-E（2.8k）、legado-Harmony（2.2k
  - 竞品/替代：legado / 阅读3.0 (gedoor) — 曾是事实标准（47k star），已因侵权诉讼移除源码，官方渠道不再可用；证明需求巨大但合法路径缺失（https://github.com/gedoor/legado）
  - 竞品/替代：legado-with-MD3 / legado-E / legado-Harmony 等继承分支 — 社区继承，功能完整、无广告、可换源，但同样依赖第三方书源，版权风险相同，随时可能再被下架；仅 Android/鸿蒙（https://github.com/HapeLee/legado-with-MD3）
  - 竞品/替代：hectorqin/reader（阅读 Web 版） — 自部署，多用户进度同步，支持本地书+OPDS+书源；需要自建服务器，门槛高（https://github.com/hectorqin/reader）
  - 竞品/替代：koodo-reader — 跨 6 端、自有书导入、备份同步做得较好，但同步/云功能部分收费（Pro），无书源/网文追更，不接微信读书/Kindle 内容；issue 中用户仍在要 KOReader 同步、微信读书书架导入（https://github.com/koodo-reader/koodo-reader）
  - 竞品/替代：readest — 跨端、云同步、可自托管、KOReader 统计同步，两年 2.5 万 star 增长最快；面向全球 EPUB/PDF 用户，不覆盖网文换源与国内平台内容（https://github.com/readest/readest）
  - 竞品/替代：anx-reader — Flutter 跨端自有书阅读器，8.9k star；同样不覆盖网文换源（https://github.com/Anxcye/anx-reader）
- *buildable* → weak（4）：簇 C25 实际是两个性质完全不同的需求捆在一起，必须拆开评审。

【A 半：网文"换源/追更/番茄下载/导出 TXT"】
- 技术上极易：书源 = 一套 JSON 规则(列表页/目录页/正文的 CSS/XPath/正则) + 抓取器 + 阅读 UI，1 人 1-2 周可复刻 legado 核心；GitHub 上 Tomato-Novel-Downloader(3.9k★, Rust)、fanqienovel-downloader(2.4k★)、Fanqie-novel-Downloader(2.2k★) 等持续涌现即证明门槛为零。
- 但这正是"为什么至今没解决"的真实原因：换源本质是绕过平台付费/广告、二次分发版权内容。legado 仓库现仍在 GitHub(47.1k★)，首页挂着"本项目涉及侵权行为并已承担相应法律责任，请立即停止一切侵权相关行为"的公告；番茄下载器全部依赖逆向番茄 App 私有接口、对抗签名/反爬，接口一变即失效。做成商业产品 = 直接承接 legado 的诉讼风险，且价值依赖社区维护的书源库(网络效应)和目标平台不封接口。明确判定：灰色/违法，软件可做但不可商业化 → 该半部分 refuted。

【B 半：导入自有书 + 无广告 + 跨端同步进度/笔记 + 听书】
- 合法、可做：Tauri/Flutter/PWA + foliate-js 或 epu
  - 竞品/替代：legado (阅读 3.0) — 47.1k★，仓库仍在但首页挂侵权法律公告；换源功能完整，但属版权灰色/已承担法律责任，不可作为商业模板（https://github.com/gedoor/legado）
  - 竞品/替代：koodo-reader — 28.3k★，17 种格式、十余种云盘/WebDAV/SMB 同步、6 端覆盖、无广告、AGPL 免费；已基本覆盖 B 半部分需求（https://github.com/koodo-reader/koodo-reader）
  - 竞品/替代：readest — 24.6k★，Tauri 7 平台，进度/笔记/书籍同步、TTS、翻译、KOReader sync、Calibre/OPDS；免费开源，是最接近该簇合法部分的完整解（https://github.com/readest/readest）
  - 竞品/替代：anx-reader — 8.9k★，国产 Flutter，WebDAV 同步 + AI + TTS，MIT；覆盖国内用户导入自有书跨端同步（https://github.com/Anxcye/anx-reader）
  - 竞品/替代：KOReader — 29.9k★，墨水屏(Kindle/Kobo)+Android，进度同步、OPDS；面向硬件阅读器用户（https://github.com/koreader/koreader）
  - 竞品/替代：hectorqin/reader — 11k★，自托管多用户阅读服务器，本地书+OPDS+远程书源插件；书源部分同样灰色（https://github.com/hectorqin/reader）

**用户原话 / 关键证据**：
> legado 47,105★仓库仅剩1 commit与阅文公告"本项目涉及侵权行为的违法，也为此承担了相应的法律责任"
> koodo-reader 28,317★ #1451："I'd pay that $5 a year for pro

**证据链接**：
- [] https://github.com/gedoor/legado — 描述："阅读是一款可以自定义来源阅读网络内容的工具，为广大网络文学爱好者提供一种方便…（47,105 stars / 5,570 forks）
- [] https://github.com/koodo-reader/koodo-reader — "A modern ebook manager and reader with sync and …（28,317 stars）
- [] https://github.com/readest/readest — "a modern, feature-rich ebook reader…seamless cro…（24,640 stars（两年））
- https://github.com/readest/readest/issues/5033

**产品概念**：Flutter/Tauri跨端自有书阅读器"书箧"：foliate-js渲染EPUB/TXT

**MVP 范围**：2-6周1-3人：Android

**风险**：unmet被反驳：koodo-reader/Readest/Anx

### 42. 家庭要跨端共享日历待办与家务分工轮换（C19，总分 4.6）

**一句话**：微信小程序+H5的"家务轮值表"：情侣/室友

**用户与场景**：同居情侣、双职工夫妻、合租室友。想把家务分工明确化可轮换可统计；搜"家务分配app"只返回家政服务

**现有方案及不足**：Donetick（需自建、iOS alpha）

**为何至今没解决**：验证显示海外已被Cozi、TimeTree、Google家庭组

**验证结论**：unmet=refuted(3) crowd=weak(5) buildable=confirmed(7)

- *unmet* → refuted（3）：核心场景（跨端共享日历+待办+家务轮换/公平统计）在海外已被多套成熟且多为免费的方案覆盖：Cozi（免费、iOS/Android/Web、家庭共享日历/待办/购物/菜单，十余年历史）、TimeTree（免费、双端、情侣/家庭共享日历，在中日韩都广泛使用）、Google 日历家庭组（免费、双端、原生支持"仅显示忙/闲"共享，直接解决 Nextcloud #11214 的诉求）、OurHome/Sweepy/Nipto（双端家务积分、轮值与"谁做了多少"统计）。开源侧在 GitHub 核实：donetick/donetick 2,591★、2026-09-27 仍在推送，README 明确"Assignee Rotation: 按完成最少/随机/轮流(round-robin)自动轮换"、可建群共享、积分系统、iOS TestFlight + Android APK；grocy/grocy 9,537★ 活跃（家务分配+journal 统计，配套 grocy-android 1,198★）；NexaFlowFrance/OpenFamily 179★（2025-12 新项目，日历 iCal 导出 + 循环任务家庭分配与统计 + 预算 + PWA/Android，且自带简体中文界面）；Home Assistant 生态 ChoreOps 430★；共同记账有 spliit 2,956★（S
  - 竞品/替代：Donetick（开源自托管家务/任务管理） — 够用：轮换分配（最少完成者/随机/round-robin）、群组共享、循环计划、积分与完成历史统计、Telegram/Discord/Pushover 提醒、Android APK + iOS TestFlight；2,591★ 持续活跃（2026-09-27 仍推送）。缺点：需自建或用其托管版，iOS 仍是 alpha，无共享日历视图（无 iCal 导出）。（https://github.com/donetick/donetick）
  - 竞品/替代：Grocy + grocy-android — 够用但重：家务（chores）支持按人分配与轮换、完成日志可查谁做了多少，另有任务与 iCal 日历导出；9,537★ 活跃。缺点：ERP 式界面复杂，iCal 只读无法从 CalDAV 客户端标记完成（簇中提到的正是这个缺口）。（https://github.com/grocy/grocy）
  - 竞品/替代：OpenFamily（开源自托管家庭组织器） — 基本覆盖：共享日历（iCal/webcal 导出）、循环任务家庭分配+统计、预算、购物、菜单、PWA + Android APK、简体中文界面。缺点：2025-12 才创建，179★，成熟度和长期维护待观察，无自动轮换策略。（https://github.com/NexaFlowFrance/OpenFamily）
  - 竞品/替代：Cozi Family Organizer — 够用：免费（广告）、iOS/Android/Web，家庭共享日历、待办、购物、菜单，十余年产品、家庭用户量大，Cozi Gold 付费去广告。缺点：无家务自动轮换与公平统计，中国大陆无本地化分发。
  - 竞品/替代：TimeTree — 够用（共享日历部分）：免费、iOS/Android/Web，专为情侣/家庭/合租共享日历设计，中文界面，在中日韩用户量大。缺点：仅日历+备忘，无家务轮换与统计；国内安卓分发渠道不确定。
  - 竞品/替代：Google 日历家庭组 + Google Keep/Tasks — 够用（海外）：免费、跨平台，原生支持把日历以"仅显示忙/闲"共享（直接解决 Nextcloud #11214 诉求），家庭组共享日历/提醒。缺点：中国大陆不可直接使用；无家务轮换。
- *crowd* → weak（5）：证据本身审视：(1) evidence 数组仅 3 条，全部来自同一仓库 nextcloud/server，与簇标题"家庭家务分工轮换"基本无关：#1600 正文用例是"管理员订阅公共假日日历并分享给所有用户"（组织场景）；#11214 是"把整本日历对特定用户/组只显示忙闲"，簇描述自己也写明是"共享给同事"（职场场景）；#1505 是生日日历是否生成提醒，与家庭协作无关。三条都没有出现家务、轮换、情侣、公平统计等诉求。(2) 来源独立性：3 条同仓库 = 1 个来源，声称的 independent_source_count=9 与 crowd_signal=viral 无支撑；A22 那一半（小红书/抖音 情侣家务分工、跨端情侣App）在 evidence 里一条引文都没有，描述中"搜'家务分配app'只返回家政"、"抖音搜'苹果安卓通用情侣app'"是研究者自己的检索观察，不是用户抱怨。(3) 互动：👍102/83/70 我无法直接核验（WebFetch 页面不渲染 reaction 数；某次读取 #11214 显示 3 👍，不确定是否渲染截断），但在 nextcloud/server 开放 issue 按 reactions 排序且含 calendar 的列表中它们分别排第 5/6/9 位，说明确实是该产品用户高票诉求——只是投的是"Nextcloud 日历共享权限"，不是
  - 竞品/替代：Donetick (open source, self-hosted) — 已覆盖家务轮换（round-robin/最少完成/随机）、circles 多人共用、完成记录统计、Web+Android APK+iOS alpha；缺点是需自建、无 CalDAV、iOS 仍 alpha，国内普通情侣不会部署（https://github.com/donetick/donetick）
  - 竞品/替代：grocy (open source) — 9.5k★ 家庭管理含 chores 模块，有 Android 伴侣 App；chores 无 CalDAV 同步（#1651 开放 5 年），偏库存/食品管理，家务轮换公平性弱（https://github.com/grocy/grocy）
  - 竞品/替代：ChoreOps / KidsChores（Home Assistant 集成） — 支持轮换、共享家务、积分统计与 HA 日历集成，但依赖 Home Assistant，面向智能家居玩家而非普通家庭（https://github.com/ccpk1/ChoreOps）
  - 竞品/替代：Nextcloud Calendar/Tasks (CalDAV) — 可跨端共享日历与待办，但订阅日历内部共享、整本忙闲共享等长期未实现（簇证据即此），且无家务轮换/统计（https://github.com/nextcloud/calendar）
  - 竞品/替代：TimeTree（商业，iOS/Android/Web 通用共享日历） — 跨平台家庭/情侣共享日历+备忘，在日本及东亚广泛使用；无家务轮换与公平统计。基于自身知识，未在本次工具中核验
  - 竞品/替代：Cozi / OurHome / Sweepy / Tody / FamilyWall（商业，海外） — 分别覆盖家庭日历+清单、家务积分分配、家务轮换与提醒；多为付费订阅、英文、国内访问与支付不便。基于自身知识，未核验
- *buildable* → confirmed（7）：【簇拆解】C19 由两个子需求合并：A22（情侣/室友/家庭的跨端共享待办+日历+家务轮换+公平统计，国内小红书/抖音信号）和 D21（Nextcloud 自建日历的订阅共享/忙闲共享，GitHub #1600 👍102 开放10年、#11214 👍83 开放8年，均标 "1. to develop" 但无 PR）。两者受众和商业属性完全不同，应分开判断；产品化只对 A22 成立，D21 是开源贡献题。

【1. MVP 可行性：可以，2-6 周、1-3 人足够】
核心痛点 = 家务任务模板 + 周期重复 + 自动轮换（round-robin/最少完成者优先/随机加权）+ 完成打卡 + 谁做了多少的公平统计 + 共享日历/纪念日提醒 + 一人 iPhone 一人安卓。全部是 CRUD + 调度规则 + 图表，无 AI、无外部数据依赖。
关键技术路径：
- 客户端：uni-app/Taro 一套代码出微信小程序 + H5（+ 可选 App 壳）。小程序天然跨 iOS/安卓、无需上架两个商店、靠微信分享邀请伴侣即可完成"两人配对"，直接消掉"苹果安卓不通用"这个痛点。
- 后端：微信云开发或 Supabase/PocketBase，数据模型 household→members→chores(recurrence, rotation_strategy)→completions；轮换算法几
  - 竞品/替代：Donetick（开源，Go+React，AGPLv3） — 2.6k★/201 fork/149 open issues。已有周期任务、三种自动轮换策略（按完成次数/随机/round-robin）、积分与统计、Telegram/Discord/Pushover 通知、iOS TestFlight 与安卓 APK（alpha）。对海外自托管用户基本够用；对国内普通情侣/家庭：需自建服务器、无微信生态、无中文本地化、移动端不成熟——不可直接用，但是极好的算法与数据模型参考。（https://github.com/donetick/donetick）
  - 竞品/替代：Grocy（开源） — 9.5k★。以食材/库存为主，家务只是附属模块，PWA 无原生 App，无轮换分配与公平统计，无 CalDAV 完成标记（簇内即有此诉求）。不解决核心痛点。（https://github.com/grocy/grocy）
  - 竞品/替代：ChoreOps（Home Assistant 集成） — 430★，2026 年新项目，家务游戏化，依赖 Home Assistant，仅智能家居极客可用。（https://github.com/ccpk1/ChoreOps）
  - 竞品/替代：TidyQuest / FamilyNido / HomeOS（自托管家庭看板类） — 125★/73★/55★，均为 2026 年自托管 PWA，FamilyNido 含共享日历+家务+学校日程，说明该品类持续有人重复造轮子；全部需自建，非普通用户可用。（https://github.com/mellow-fox/TidyQuest）
  - 竞品/替代：Rainbow-Cats 情侣任务/商城微信小程序（开源） — 2,268★/511 fork，情侣任务+积分商城模板，证明国内'情侣任务小程序'开发者需求旺盛且小程序路径可行；但无家务轮换、无日历、无公平统计，且是源码模板而非可用产品。（https://github.com/UxxHans/Rainbow-Cats-Personal-WeChat-MiniProgram）
  - 竞品/替代：Tody / Sweepy（海外付费 App，凭知识判断） — 海外成熟的家务安排 App，均有房间/任务模板、努力值/公平统计、家庭共享、iOS+安卓；订阅或买断制。证明品类可付费养活小团队。国内无微信生态、需外区账号、无中文运营，故簇内用户'搜不到'。

**用户原话 / 关键证据**：
> Nextcloud #1600"Allow (internal) sharing of subscribed
> 反证：Donetick 2,591★已实现"按完成最少/随机/轮流(round-robin)自动轮换"

**证据链接**：
- [] https://github.com/nextcloud/server/issues/1600 — Allow (internal) sharing of subscribed webcal cal…（👍 102, 26 评论）
- [] https://github.com/nextcloud/server/issues/11214 — Share calendar to users or groups with "show only…（👍 83, ❤21, 🚀11, 53 评论）
- [] https://github.com/nextcloud/server/issues/1505 — Users should be able to choose whether reminders …（👍 70（👍 排序列表第 13 位））
- https://github.com/donetick/donetick
- https://github.com/grocy/grocy/issues/1651

**产品概念**：uni-app/Taro一套代码出微信小程序+H5：微信分享邀请伴侣/室友即配对天然跨iOS/安卓

**MVP 范围**：2-6周1-3人：小程序+H5前端

**风险**：unmet被反驳：Cozi/TimeTree/Google家庭组/OurHome

### 43. 重度用户要跨App的深夜静默与刷屏限额工具（C31，总分 4.6）

**一句话**：Android端"夜间静默+限额"：识别抖音/快手/B站

**用户与场景**：想戒短视频的成年重度用户。越刷越焦虑、"脑腐"，两会建议短视频凌晨1-5点深夜静默（热搜#1上榜2天）

**现有方案及不足**：iOS屏幕使用时间（Downtime/限额/密码）

**为何至今没解决**：验证显示iOS停用时间/Android就寝模式/华为小米"健康使用手机

**验证结论**：unmet=refuted(3) crowd=weak(6) buildable=weak(5)

- *unmet* → refuted（3）：簇C31的四项诉求（跨App深夜锁定、时长限额、算法关闭、替代内容）中前三项已被多层成熟方案覆盖，只有"替代内容推荐/老年人专属模式"缺产品化方案，但它本质是政策与平台运营议题而非工具空白。证据链：(1) 系统内置：iOS 屏幕使用时间的"停用时间(Downtime)"就是跨App按时段锁定（可设凌晨1-5点），配合App限额+屏幕使用时间密码；Android Digital Wellbeing 有就寝模式/专注模式/应用计时器；国内 HarmonyOS「健康使用手机」、小米 HyperOS「屏幕时间管理」、ColorOS/OriginOS「健康使用手机」都提供带密码的"停用时间"和"应用限额"，直接对应"深夜静默+限额"。簇里"密码易绕过"的抱怨属于自我管控固有难题，而非无人做。(2) 第三方成熟商业产品：iOS 15+ 开放 Screen Time API 后出现 Jomo（中国开发者、App Store 中国区口碑很好、支持按时段锁抖音/小红书、严格模式）、Opal、one sec、ScreenZen（免费）、Freedom（跨设备）、Forest；安卓国内有「不做手机控」（定时锁机/深夜锁机/应用限时，多年运营）、番茄ToDo 学霸模式强制锁机。缺点是 Jomo/Opal 高级功能订阅收费、iOS 侧受苹果API限制。(3) 开源：GitHub 实查 curbox-andr
  - 竞品/替代：iOS 屏幕使用时间（停用时间 Downtime / App限额 / 屏幕使用时间密码） — 系统内置、免费、跨App按时段锁定（可设1:00-5:00）+每日限额+密码。核心场景直接覆盖；缺点是自用时密码自己知道、'忽略限额'易点、报告偶有bug，属于自控机制固有弱点而非功能缺失。
  - 竞品/替代：Android Digital Wellbeing（就寝模式 / 专注模式 / 应用计时器） — 原生免费，有定时就寝模式(灰度+DND)、专注模式暂停App、每App计时器。缺点：无密码保护、计时器可随手删除、就寝模式不硬锁App，对重度用户约束弱。
  - 竞品/替代：国产ROM健康使用手机（HarmonyOS 健康使用手机 / 小米HyperOS 屏幕时间管理 / ColorOS、OriginOS 健康使用手机） — 国内主流安卓系统内置'停用时间(可设深夜时段)+应用限额+密码保护'，即簇所要的跨App深夜静默与限额；家长可替父母/孩子设密码。基本够用；对成年人自用的弱点同样是密码自知。
  - 竞品/替代：Jomo（专注锁机，iOS Screen Time API，中国开发者） — 中国区口碑好，支持按时段/日程锁抖音、小红书等任意App、严格模式防退出、限额。核心场景覆盖；缺点：高级功能订阅收费，受苹果API限制无法做流内屏蔽。
  - 竞品/替代：不做手机控（Android，国内） — 多年运营的国内自控App：定时锁机（可设深夜）、应用限时、强制模式、统计。覆盖国内安卓核心场景；部分功能VIP收费，口碑中等偏上。
  - 竞品/替代：番茄ToDo 学霸模式 / Forest 专注森林 — 番茄ToDo 学霸模式可强制锁机；Forest 偏正向激励不拦截。只覆盖'限时专注'一半场景，不做定时深夜静默。
- *crowd* → weak（6）：簇内证据审视：(1) 三条 evidence 全是微博热搜话题标题，没有任何一条是用户在说"我想要跨App深夜锁定/限额工具而现有的都不行"。#1《建议短视频凌晨1点至5点深夜静默》是两会代表的立法/监管建议，不是用户产品诉求（且微博对"建议XX"类话题历来褒贬参半，"建议专家不要建议"式反弹常见）；#2《短视频可能越刷越焦虑》、#3《频繁刷手机可能导致脑腐》是健康科普/新闻话题，只说明"问题被讨论"，不说明"想要这个工具"。description 里提到的"50个神仙网站逃离信息流"是清单/推荐帖，正是任务警告的被误读类型，且无对应 evidence 条目。(2) 独立性差：platforms 仅["微博"]，三条同一渠道同一形态（热搜榜标题），independent_source_count=4 与实际 3 条不符；热搜排名本身受运营/推广影响，不等于自发附和。(3) 互动：只有榜单排名（话题级聚合热度），没有针对"想要工具"这一具体主张的转评赞。(4) 常识：底层痛点（短视频沉迷、刷到深夜、系统屏幕时间"忽略限额"一键绕过、青少年模式成人不用）是大众级、年年反复的抱怨，商业市场早已验证（Opal、one sec、Forest、番茄ToDo、Cold Turkey、Freedom 等均以此为卖点）；但"凌晨1-5点跨App静默"这一具体表述源自政策建议而非用户，且 iOS 停用
  - 竞品/替代：iOS 屏幕使用时间/停用时间(Downtime) 与 Android 数字健康 就寝模式/专注模式 — 系统自带、本就是跨App的夜间计划与每日限额，覆盖簇诉求的功能面；缺陷是'忽略限额'一键绕过、密码自设自解、国产安卓ROM实现不一，强制力弱。基于常识，未在GitHub核实。
  - 竞品/替代：curbox-android — 1.4k★ 开源安卓App，已有计划限额、短视频(Reels/Shorts)拦截、防篡改、解锁次数限制，功能上基本覆盖簇诉求；但 issue #405/#431 显示仍可通过关闭无障碍服务/安全模式绕过，且不面向国产短视频App。（https://github.com/curbox-app/curbox-android）
  - 竞品/替代：touch-grass — 76★ 中文安卓短视频防沉迷，自采样识别B站/小红书/抖音等竖屏页并按时长全屏拦截，直接命中中文场景；规模小、无深夜时段锁、可绕过。（https://github.com/Snownamida/touch-grass）
  - 竞品/替代：yixi (self-hosted One Sec alternative) — 91★ 面向中国大陆iOS用户的自建'打开前呼吸十秒'摩擦工具，依赖iOS快捷指令自动化；只是延迟而非锁定/限额。（https://github.com/Defiabell/yixi）
  - 竞品/替代：SelfControl (macOS) — 4.4k★，定时不可撤销封锁网站，说明'不可绕过的强制力'是核心卖点；仅macOS、仅网站，不覆盖手机短视频。（https://github.com/SelfControlApp/selfcontrol）
  - 竞品/替代：Olauncher / Escape-Launcher / FokusLauncher 等极简启动器 — 3.8k★等，通过降低手机可用性减少刷屏，间接方案，不做时段锁定与限额。（https://github.com/tanujnotes/Olauncher）
- *buildable* → weak（5）：【1. MVP可行性】能做，但只有Android端能在2-6周内做出"真正拦截"的版本；iOS/鸿蒙/微信视频号三块是硬伤。
- Android技术路径（1名Android开发，3-4周）：UsageStatsManager读前台应用+用量；AccessibilityService或前台检测+SYSTEM_ALERT_WINDOW覆盖层实现"深夜1-5点锁定抖音/快手/B站/小红书"和"每日限额到点弹遮罩"；用accessibility的窗口标题/类名可识别微信内的视频号页面（这是相对系统屏幕时间的差异点）；防绕过用"延迟解锁/输入长随机串/家人远程口令"的摩擦机制而非硬锁。开源可参考：EtashTyagi/SelfLock(4★, accessibility方案)、Prakashmaheshwaran/flint-app(5★, 自称开源Opal替代)、eylonshm/expo-app-blocker(47★, 跨端封装)。
- iOS路径：必须用Screen Time API（FamilyControls/ManagedSettings/DeviceActivity，参考christianp-622/ScreenBreak 122★）。需向Apple申请family-controls分发entitlement（审批数天到数周，不可控），只能按App/网站域名屏蔽，无法屏蔽微信
  - 竞品/替代：iOS屏幕使用时间 / Android数字健康 / 华为健康使用手机 / 小米屏幕时间管理（系统内置） — 免费覆盖限额与停用时间，但密码易绕过、无跨App策略组、不能识别微信视频号；是第三方工具最大的免费竞品
  - 竞品/替代：Opal / one sec / ScreenZen（iOS，基于Screen Time API，订阅制） — 海外验证了付费模型与摩擦式解锁体验；iOS only或iOS为主，对中国App和视频号无针对性
  - 竞品/替代：Jomo（中国团队，iOS/Android，Screen Time API） — 据我所知是国内最接近本簇需求的商业产品，已有订阅付费；具体规模不确定
  - 竞品/替代：不做手机控 / 番茄ToDo / Forest（国内外专注类App） — Forest不拦截；不做手机控有Android锁机但对国产ROM适配和视频号识别不完整，VIP付费但ARPU低
  - 竞品/替代：Brick（NFC硬件+App） — 用物理令牌解决'易绕过'问题，思路值得借鉴，但需硬件不适合纯软件小团队
  - 竞品/替代：christianp-622/ScreenBreak — 122★ iOS Screen Time API示例项目，说明iOS技术路径成熟但仅为demo（https://github.com/christianp-622/ScreenBreak）

**用户原话 / 关键证据**：
> 微博热搜《建议短视频凌晨1点至5点深夜静默》#1上榜2天（两会建议，另有《建议推出老年人防沉迷模式》）
> curbox-android 1.4k★ open issue #431

**证据链接**：
- [] https://s.weibo.com//weibo?q=%23%E5%BB%BA%E8%AE%AE%E7%9F%AD%E8%A7%86%E9%A2%91%E5%87%8C%E6%99%A81%E7%82%B9%E8%87%B35%E7%82%B9%E6%B7%B1%E5%A4%9C%E9%9D%99%E9%BB%98%23&t=31&band_rank=1&Refer=top — 热搜话题：《建议短视频凌晨1点至5点深夜静默》(两会建议；另有《建议推出老年人防沉迷模式》2026…（微博热搜榜(快照排名#1，上榜2天)）
- [] https://s.weibo.com//weibo?q=%23%E7%9F%AD%E8%A7%86%E9%A2%91%E5%8F%AF%E8%83%BD%E8%B6%8A%E5%88%B7%E8%B6%8A%E7%84%A6%E8%99%91%23&t=31&band_rank=34&Refer=top — 热搜话题：《短视频可能越刷越焦虑》（微博热搜榜(快照排名#34，上榜1天)）
- [] https://s.weibo.com//weibo?q=%23%E9%A2%91%E7%B9%81%E5%88%B7%E6%89%8B%E6%9C%BA%E5%8F%AF%E8%83%BD%E5%AF%BC%E8%87%B4%E8%84%91%E8%85%90%23&t=31&band_rank=36&Refer=top — 热搜话题：《频繁刷手机可能导致脑腐》(另有《如果不玩手机可以干什么》2025-06-24…（微博热搜榜(快照排名#36，上榜1天)）
- https://github.com/curbox-app/curbox-android
- https://github.com/Snownamida/touch-grass

**产品概念**：Android优先"夜间静默"App：UsageStatsManager读用量

**MVP 范围**：3-4周1名Android开发：时段锁

**风险**：unmet被反驳：系统内置Downtime/就寝模式与Jomo/Opal/curbox

### 44. UP主与学习者本地免费生成翻译配音视频字幕（C32，总分 4.6）

**一句话**：买断制macOS/Windows双端精致本地字幕配音App

**用户与场景**：自媒体/知识类UP主（自制内容。想给视频一键生成中英字幕、断句校对、翻译、配音并烧录而不按分钟付费不上云

**现有方案及不足**：pyvideotrans（非商业许可、包体2.7GB）

**为何至今没解决**：验证显示pyvideotrans 19.2k★（Windows免Pyth

**验证结论**：unmet=refuted(2) crowd=confirmed(7) buildable=weak(5)

- *unmet* → refuted（2）：簇的核心诉求（本地、免费、一键：ASR→断句校对→翻译→配音→烧录，不按分钟付费、不上传云端）在 2026-09 已被至少 4 个活跃、口碑好、带图形界面/安装包的开源方案完整覆盖，且簇自己引用的"证据"（VideoLingo/VideoCaptioner/SmartSub 的 star 数）恰恰是"方案已存在并被大量采用"的证据，而非未被满足的证据。
1) pyvideotrans（19.2k star，pushed 2026-09-27，仅 11 个 open issue）：官方提供 Windows 10/11 预打包 .exe "无需配置 Python 环境"；faster-whisper 本地离线 ASR；Ollama/M2M100 完全离线翻译；Edge-TTS 免费配音 + F5-TTS/GPT-SoVITS/Index-TTS/Qwen3-TTS 本地克隆；一键流程 ASR→翻译→TTS→合成嵌字幕。这就是该簇描述的产品本身，且由高产作者持续维护近 3 年。
2) SmartSub（5.4k star，MIT，pushed 2026-09-24）：Electron 桌面应用，Releases 直接提供 Windows exe / macOS dmg(arm64+x64) / Linux deb+AppImage，2026 年 8-9 月连发 v3.7/3.8/3.9；
  - 竞品/替代：pyvideotrans (jianchang512) — 够用，且几乎就是簇描述的产品本身：19.2k star、pushed 2026-09-27、仅 11 个 open issue；Windows 预打包 exe 无需 Python；faster-whisper 本地 ASR；Ollama/M2M100 完全离线翻译；Edge-TTS 免费配音及 F5-TTS/GPT-SoVITS/Index-TTS/Qwen3-TTS 本地克隆；一键 ASR→翻译→TTS→合成嵌字幕。GPL-3.0，作者高产维护近 3 年。缺点：界面选项多偏工程化、mac/linux 需源码运行、翻译质量取决于所选模型。（https://github.com/jianchang512/pyvideotrans）
  - 竞品/替代：SmartSub (buxuku) — 够用：MIT 开源 Electron 桌面应用，Releases 直接提供 Win exe / Mac dmg / Linux deb+AppImage，2026-08~09 连发三版；本地 Whisper/FunASR/Qwen3-ASR/sherpa-onnx 离线转写，20 个翻译服务含免费与本地 Ollama，本地 Kokoro/VITS/ZipVoice 配音克隆，软/硬字幕烧录，批量 + GPU 加速。正面回应了'普通创作者上手难'的论点。（https://github.com/buxuku/SmartSub）
  - 竞品/替代：VideoCaptioner 卡卡字幕助手 — 基本够用：16.1k star，Release 安装包，faster-whisper/whisper-cpp 离线，LLM 智能断句校正，bing/google 免费翻译，dub 配音，软/硬字幕烧录，pushed 2026-09-12。已知摩擦：Faster-Whisper 模型下载失败、AMD 显卡不支持、LLM 优化用 API 有 token 成本、文档与实际流程不一致。（https://github.com/WEIFENG2333/VideoCaptioner）
  - 竞品/替代：VideoLingo — 可用但偏技术用户：18.5k star，OneKeyStart.bat 与 Docker 一键装环境，本地 Qwen3-ASR，Edge TTS 免费/GPT-SoVITS 本地配音，pushed 2026-09-27。短板：翻译依赖 LLM API 产生费用、211 个 open issue、安装/依赖类问题反复出现、有用户反馈 v3.0.1 配音效果下降。（https://github.com/Huanshere/VideoLingo）
  - 竞品/替代：YouDub-webui — 够用于搬运场景：5.5k star，面向 YouTube/Bilibili 的 AI 视频翻译配音（Whisper 识别、字幕翻译、声音克隆、Demucs 分离、混音渲染），仅 7 个 open issue，2026-09-27 仍在更新。Web UI 需本地跑 Python。（https://github.com/liuzhao1225/YouDub-webui）
  - 竞品/替代：Subtitle Edit — 够用（老牌免费桌面工具，14.3k star，2014 年起持续维护）：内置 Whisper 多后端（whisper.cpp/faster-whisper 等）本地转写，自动翻译含本地 Ollama/LibreTranslate，4.x 内置 TTS（含本地 Piper）并支持 ffmpeg 烧录。学习曲线稍陡，但对字幕校对/断句是业界标准工具。（https://github.com/SubtitleEdit/subtitleedit）
- *crowd* → confirmed（7）：对簇内 3 条证据的严格审视：(1) 引文全部是仓库自我描述/README 标语（"Netflix级…一键全自动"、"免费开源一站式"），不是用户在说"想要但没有"，属于产品清单型内容被当作需求引文，这是方法上的硬伤。(2) 但来源确实相互独立：Huanshere、WEIFENG2333、buxuku 三个不同作者，无重复计数；不过全部来自 GitHub 单一平台，无 B 站/知乎/Reddit 等抱怨帖。(3) 互动可见且巨大：VideoLingo 18,530 star / 2,038 fork / 211 open issues；VideoCaptioner 16,114 star / 1.4k fork / 179 issues；SmartSub 5,376 star / 409 fork。GitHub 补充搜索发现同赛道另有多个独立高星项目：pyvideotrans 19.2k、KrillinAI(OpenCreator) 12.4k、YouDub-webui 5.5k（README 称有百万粉 B 站 UP 主在生产使用）、Chenyme-AAVT 3.1k（已归档）、ThioJoe Auto-Synced-Translated-Dubs 1.7k、SoniTranslate 1.4k、video-subtitle-generator 1.2k、violin 1.1k、
  - 竞品/替代：SmartSub (buxuku) — 最接近完整解：桌面 GUI，README 明确声称全流程本地、零注册零费用（本地 Whisper/FunASR + 内置免费翻译 + Kokoro/VITS 本地 TTS + FFmpeg 烧录），跨平台 GPU 加速；5.4k star，活跃维护。需求的功能面已被覆盖，残余痛点是 CUDA/环境问题（#130 27 reactions）与翻译失败类 issue。（https://github.com/buxuku/SmartSub）
  - 竞品/替代：pyvideotrans (jianchang512) — 19.2k star，功能最全（ASR+翻译+配音+声音克隆+合成），有 GUI/CLI/Web/Docker 及 Windows 整合包；免费开源但非商业许可，本地模型对 GPU 有要求，高级翻译/TTS 仍常依赖第三方 API。（https://github.com/jianchang512/pyvideotrans）
  - 竞品/替代：VideoCaptioner 卡卡字幕助手 — 16.1k star，安装即用的免费 ASR（B 站接口）+ Bing/Google 翻译，支持 faster-whisper/whisper.cpp 本地；但 LLM 断句/优化/翻译需自配 API key，issue 中大量安装失败、token 消耗、文档不更新抱怨；配音功能弱（#675 仍 open）。（https://github.com/WEIFENG2333/VideoCaptioner）
  - 竞品/替代：VideoLingo — 18.5k star，Streamlit 界面，ASR 默认本地 Qwen3-ASR，但翻译 LLM 必须外接 API（README 推荐付费中转），TTS 部分可本地；211 open issues 多为安装/API 配置问题，对非技术 UP 主门槛高。（https://github.com/Huanshere/VideoLingo）
  - 竞品/替代：KrillinAI / OpenCreator — 12.4k star 桌面应用，已转型为泛创作者 AI 工作台（含视频翻译配音），依赖云端模型/Codex，非纯本地免费方案。（https://github.com/krillinai/OpenCreator）
  - 竞品/替代：YouDub-webui — 5.5k star，面向 YouTube/B 站搬运的本地化配音流水线，数据全本地存储，但翻译需 OpenAI 兼容 API key；有百万粉 UP 主实际使用。（https://github.com/liuzhao1225/YouDub-webui）
- *buildable* → weak（5）：【1. 可建性】可以。技术路径完全由成熟开源件拼装：Tauri/Electron 壳 + whisper.cpp/faster-whisper/FunASR-SenseVoice(本地 ASR，CPU 可跑 small/medium，Apple Silicon 走 Metal/MLX) + 断句/校对与翻译（本地 Ollama/Qwen 小模型或用户自填 OpenAI 兼容 Key，免费兜底走 Edge/Bing 接口）+ Edge-TTS/Kokoro/F5-TTS 本地配音 + ffmpeg+libass 烧录/软封装。1-3 人 2-6 周做出"拖入视频→双语 SRT→配音→导出"MVP 没有问题——SmartSub 就是单人 Electron 项目。真正的工程难点不在拼装而在：安装包体积与模型分发（pyvideotrans 整包 2.7GB、走百度网盘/HF）、Windows 各代显卡 CUDA 兼容（VideoCaptioner 50 系显卡转录失败 issue）、无 GPU 时长视频速度、长停顿导致时间轴漂移、配音时长与画面对齐（需变速/压缩句子）。这些是"打磨"而非"可行性"问题。

【2. 壁垒与灰色地带】无平台壁垒、无数据壁垒、无网络效应依赖（单机工具，价值不依赖双边市场）。模型许可证干净（Whisper MIT、Kokoro Apache、FunASR 可商用需
  - 竞品/替代：pyvideotrans (jianchang512) — 19.2k star，GPL-3.0，提供 Windows 免 Python 环境整包 exe（2.7GB，v4.14 于 2026-09-26 发布），ASR/翻译/TTS 均支持本地引擎（faster-whisper、Ollama、Edge-TTS/F5-TTS/GPT-SoVITS），标明非商业项目。已基本覆盖簇的核心痛点，短板是包体大、macOS/Linux 需源码部署、UI 偏技术向。（https://github.com/jianchang512/pyvideotrans）
  - 竞品/替代：VideoLingo (Huanshere) — 18.5k star，Apache 2.0，Windows OneKeyStart.bat 一键装、Docker、本地 ASR 可 CPU/MLX；但翻译必须配 LLM API Key，且内置 yt-dlp 下载（ToS 灰色）。174 个 open issue 集中在依赖安装失败、模型版本不匹配、长停顿时间轴错误。（https://github.com/Huanshere/VideoLingo）
  - 竞品/替代：VideoCaptioner 卡卡字幕助手 (WEIFENG2333) — 16.1k star，GPL-3.0，Windows 安装包 + pip，本地 faster-whisper/whisper-cpp，免费功能（必剪 ASR、Bing/Google 翻译）零配置——但这些免费通道是逆向第三方接口，属灰色；配音为后加的 dub 命令，mac 版靠社区。（https://github.com/WEIFENG2333/VideoCaptioner）
  - 竞品/替代：SmartSub (buxuku) — 5.4k star，MIT，Electron 打包 Win/macOS/Linux 安装包，本地 ASR（whisper.cpp/faster-whisper/FunASR/Qwen3-ASR/Parakeet）、20 家翻译含 Ollama、本地 TTS（Kokoro/VITS/ZipVoice 零样本克隆）、硬/软字幕烧录，全流程可零付费本地完成，3 天前仍在更新。与簇描述的理想产品几乎一致，说明核心痛点已被免费开源桌面工具解决。（https://github.com/buxuku/SmartSub）
  - 竞品/替代：YouDub-webui (liuzhao1225) — 5.5k star，Apache 2.0，面向 YouTube→B 站搬运的端到端本地化配音流水线，需 Python+Node 环境，内置 yt-dlp（ToS 灰色），翻译需 OpenAI 兼容 API。（https://github.com/liuzhao1225/YouDub-webui）
  - 竞品/替代：VideoSyncMaster (TianDongL) — 164 star，2026 年新项目，WhisperX+Qwen+IndexTTS2 本地多语配音，Python 源码级，尚未打包，验证了赛道持续有新进入者但难以突围。（https://github.com/TianDongL/VideoSyncMaster）

**用户原话 / 关键证据**：
> VideoLingo 18,529★/211 open issues、VideoCaptioner 16,114★
> VideoLingo #415（open）："看说明使用本地ollama，不用配置api key，但为什么还是报错

**证据链接**：
- [] https://github.com/Huanshere/VideoLingo — "Netflix级字幕切割、翻译、对齐、甚至加上配音，一键全自动视频搬运AI字幕组"（18,529 stars）
- [] https://github.com/WEIFENG2333/VideoCaptioner — "卡卡字幕助手 - 基于 LLM 的智能字幕助手 - 视频字幕生成、断句、校正、字幕翻译全流程处理"（16,114 stars）
- [] https://github.com/buxuku/SmartSub — "视频转字幕、字幕翻译、AI 配音与声音克隆、字幕烧录——免费开源的一站式桌面工具。（5,373 stars）

**产品概念**：Tauri打包的macOS/Windows桌面App"字幕工坊

**MVP 范围**：3-5周1-3人：拖入视频→本地ASR→

**风险**：unmet被反驳(2)：pyvideotrans/SmartSub

### 45. 家长学生海外华人免费获取按年级检索的电子教材（C33，总分 4.6）

**一句话**：合法层的"课本导航+本地阅读器"：按年级/学科

**用户与场景**：K12家长与学生、教师、自学者。想免费下载官方小初高课本PDF预习辅导海外中文教育

**现有方案及不足**：basic.smartedu.cn+智慧中小学App（需登录

**为何至今没解决**：验证显示核心场景已被官方国家中小学智慧教育平台（按学段/年级/学科

**验证结论**：unmet=refuted(3) crowd=confirmed(7) buildable=refuted(3)

- *unmet* → refuted（3）：核心场景「免费、按年级/学科/版本检索、看官方小初高电子教材」已经被官方渠道——国家中小学智慧教育平台（basic.smartedu.cn，教育部主办，2022 年起上线，覆盖人教/北师大/苏教/外研等全部主流版本，按学段→年级→学科→版本筛选）及其配套 App「智慧中小学」——直接、免费地满足；ChinaTextbook 和 GitHub 上二十多个下载器的 PDF 全部来自这个平台，说明「有没有」的问题早就解决。剩下的缺口只是「不登录就下 PDF/离线」这一层：官方自 2024 年起要求登录（需手机号）才能下载，于是产生了 happycola233/tchMaterial-parser（6.7k star，今天仍在提交，GUI、按分类筛选+批量下载+自动加书签，Win/mac/Linux）、alterem/knowledge-grab（559 star，桌面端，支持应用内登录）、hantang/smartedu-dl-go（192 star）、vultur/smart-app（47 star，本地预览+批量）等成熟工具，对国内家长/学生而言已经够用。簇的主证据 ChinaTextbook（82.3k star）本身缺陷明显：最后一次提交 2025-10-18 且只是改 README，PDF 按 35MB 切片需要额外合并工具，无按年级/版本检索页面，学生在 issue #198
  - 竞品/替代：国家中小学智慧教育平台（basic.smartedu.cn，教育部）+ 智慧中小学 App — 基本够用：免费、官方、覆盖全部小初高主流版本教材，按学段/年级/学科/版本筛选在线阅读，有 iOS/Android App；是所有 GitHub 下载器的唯一数据源。缺陷：2024 年起下载 PDF 需登录（手机号注册，海外无 +86 号码的用户能否注册我不确定），离线依赖 App，网页检索体验一般。（https://basic.smartedu.cn/tchMaterial）
  - 竞品/替代：happycola233/tchMaterial-parser — 够用（面向有一定动手能力的家长/学生）：6.7k star，今天仍在提交，GUI、按分类筛选、批量下载、自动命名+书签，Win/mac/Linux 全平台且有 WinGet/AUR 分发。缺陷：需要先登录官方平台取 Access Token，Token 会过期。（https://github.com/happycola233/tchMaterial-parser）
  - 竞品/替代：alterem/knowledge-grab — 够用：559 star，Tauri 桌面端，支持应用内登录、断点续传、批量下载课本与视频。缺陷：同样依赖官方登录 token（约一周过期），mac 需绕过 Gatekeeper。（https://github.com/alterem/knowledge-grab）
  - 竞品/替代：hantang/smartedu-dl-go / vultur/smart-app / FlyEduDownloader 等十余个下载器 — 可用但零散：多为粘贴 URL 后下载，smart-app 带本地预览与批量；均为官方平台的薄封装，覆盖「下 PDF」这一步，不解决「按年级浏览」（浏览仍在官网做）。（https://github.com/hantang/smartedu-dl-go）
  - 竞品/替代：TapXWorld/ChinaTextbook — 部分够用（免登录、海外可达），但缺陷明显：PDF 35MB 切片需合并工具、无检索/阅读界面、最后一次实质更新 2025 年、新版教材缺失（issue #198）、版权下架风险（issue #236）。（https://github.com/TapXWorld/ChinaTextbook）
  - 竞品/替代：知海灯塔 books.enjoyser.cn（基于 ChinaTextbook 的第三方网站，issue #118） — 不确定是否仍在线；证明「做一个检索前端」已有人做过，但灰色镜像无法长期维护。
- *crowd* → confirmed（7）：对簇内原始证据的审视：(1) 证据2（chinese-independent-developer 的 WithoutAD 条目）是开发者自荐的产品清单，且内容是"儿童益智游戏平台"，与课本 PDF 无关；抓取当前 README 甚至已找不到该条目。属于典型的"清单类被误读为需求"，应剔除。(2) 因此簇内真正有效的独立来源只有 1 个：TapXWorld/ChinaTextbook，independent_source_count=2 是虚高。(3) 但这一个来源的互动量不是 unknown，而是实测 82.3k star / 18.7k fork / 116 open issues，是可见的、极强的附和信号。(4) 引文本身是作者动机陈述而非用户抱怨，"海外华人"角度在 issue 区搜索 海外/华人/移民 几乎无结果——海外人群诉求是作者的想象，不是用户在说。

我在 GitHub 补充到的独立佐证使结论从"单一来源"变为"多来源相互独立"：
- 另一作者的 happycola233/tchMaterial-parser（官方智慧教育平台电子课本下载器）6.7k star / 862 fork，且衍生出至少 10 个独立作者的克隆/重写（Java 版、Docker 版、Chrome 插件、免登录整理版、Flutter 分类树+内置阅读器版）。一个"从官方站点下载课本 PDF"的
  - 竞品/替代：国家中小学智慧教育平台 basic.smartedu.cn/tchMaterial（官方） — 免费、按学段/学科/版本组织齐全，但需注册登录、PDF 直链带 token/-private 校验，下载需 F12 抓包或第三方工具；第三方下载器随接口变更频繁失效。海外可访问性不确定。（https://basic.smartedu.cn/tchMaterial）
  - 竞品/替代：TapXWorld/ChinaTextbook — 82.3k star，PDF 全量约 43GB 且分卷存放，无在线阅读/检索，普通家长难以使用；有版权争议（issue #236/#64）。（https://github.com/TapXWorld/ChinaTextbook）
  - 竞品/替代：happycola233/tchMaterial-parser 及其约 10 个克隆/重写 — 6.7k star 桌面下载器，需自行填 token，官方接口变更后多次失效（"2025.02.12 软件失效"），无 Mac/手机版，面向技术用户。（https://github.com/happycola233/tchMaterial-parser）
  - 竞品/替代：识本 ShiBen（j4fun.com/shiben，源码 j4fun-ai/j4fun） — 在 ChinaTextbook 上做的按目录在线浏览+分卷自动合并；依赖 GitHub 直连，国内不稳定；个人项目，无 star 数据可查。（https://github.com/TapXWorld/ChinaTextbook/issues/257）
  - 竞品/替代：知海灯塔 books.enjoyser.cn — 个人两周搭建的网站，功能与存续状态不确定。（https://github.com/TapXWorld/ChinaTextbook/issues/118）
  - 竞品/替代：HuggingFace 合并 PDF 数据集 / 国内网盘镜像（issue #240、#250） — 解决了国内高速下载，但仍是 43GB 打包，无按年级检索与阅读。（https://github.com/TapXWorld/ChinaTextbook/issues?q=is%3Aissue+下载）
- *buildable* → refuted（3）：簇核心：免费、按年级/版本检索、可离线下载的官方小初高课本 PDF，主打 K12 家长与海外华人。评审结论：能真正消除痛点的产品形态明显侵权，合法形态消除不了痛点，且无变现路径。

1) MVP 可行性（技术上可做，法律上分叉）
三条技术路径：
(a) 镜像托管型（把 PDF 放到自己服务器/对象存储，做年级-学科-版本检索 + 在线阅读 + 离线下载）：1-2 人 2-3 周即可做出（PDF 来源现成：ChinaTextbook release 或 tchMaterial-parser 抓取；前端做目录树 + pdf.js 阅读器 + CDN）。ChinaTextbook issue #118 里已有人两周搭出了"知海灯塔"站点（books.enjoyser.cn，现状不确定）。这是唯一能同时解决"无需登录、可下载、可离线、检索好用、海外可访问"全部痛点的形态——但它就是对人教社等出版社作品的信息网络传播权直接侵权（见下）。
(b) 客户端下载/整理器（浏览器插件或桌面 App，用用户自己的智慧教育平台账号 token 拉取 PDF，本地建库、按年级检索、离线阅读）：1 人 2-4 周可做。但 tchMaterial-parser（6.7k star，MIT）已经做了核心部分：用户从 localStorage 手动取 Access Token（约 7 天过期），批量下载、自动命名
  - 竞品/替代：TapXWorld/ChinaTextbook — 82.3k star / 18.7k fork。按小学/初中/高中/大学 + 学科组织的 PDF 合集，>50MB 文件切成 35MB 分卷需合并工具；无检索、无阅读器、无网站，走 GitHub release/云盘下载。解决了'有'，未解决'好用'。issue #236（open）已指出在 GitHub 发布教材 PDF 侵犯信息网络传播权并可能触及刑法 217 条；仓库靠非商业、无运营主体存活，不是可复制的产品路径。（https://github.com/TapXWorld/ChinaTextbook）
  - 竞品/替代：happycola233/tchMaterial-parser — 6.7k star，MIT。国家中小学智慧教育平台电子课本批量下载器：用户手动从浏览器 localStorage 提取 Access Token（约 7 天过期）后批量下载、自动命名、加书签；非官方接口，README 自述无 token 方式不长期有效，声明仅限个人学习不得商用/再分发。已覆盖'个人下载器'形态的核心功能，属灰色地带；再做一个更好看的版本增量价值有限。（https://github.com/happycola233/tchMaterial-parser）
  - 竞品/替代：国家中小学智慧教育平台（basic.smartedu.cn）电子课本 — 官方、免费、按学段/学科/版本/年级筛选、在线查看全部人教版等教材。痛点：需登录（注册通常需手机号，海外号码是否可用不确定）、PDF 走带 token 的 CDN、不提供正式离线下载、海外访问速度不确定。这些限制是出版社版权约束下的政策选择，不是软件缺陷，第三方无法合法'修好'。（https://basic.smartedu.cn）
  - 竞品/替代：知海灯塔（books.enjoyser.cn，基于 ChinaTextbook 的第三方站） — 个人两周搭建的网页版，方便按目录浏览/获取 ChinaTextbook 资源。证明形态 (a) 技术上 2 周可做，但同样是再分发侵权；当前是否仍在线不确定。（https://github.com/TapXWorld/ChinaTextbook/issues/118）
  - 竞品/替代：Dujltqzv/Some-Many-Books — 24k star 的 PDF 教材合集（GitHub 搜索结果显示，具体覆盖学段与是否含 K12 官方课本未核实）。同为托管型，同样面临版权问题，且无检索/阅读产品化。（https://github.com/Dujltqzv/Some-Many-Books）
  - 竞品/替代：人教点读 / 人教社官方电子课本（出版社自有渠道） — 人教社自营 App/网页提供部分教材电子版及付费点读功能（具体现状与条款不确定）。说明版权方已有自己的变现产品，不太可能向第三方授权免费分发；也说明市场上合法的'付费教材数字产品'由出版社自己占位。

**用户原话 / 关键证据**：
> ChinaTextbook 82,329★/18,674 forks/116 open issues
> tchMaterial-parser 6.7k★/862 forks（今天仍在提交）衍生至少10个独立作者克隆

**证据链接**：
- [] https://github.com/TapXWorld/ChinaTextbook — "虽然国内教育网站已提供免费资源，但大多数普通人获取信息的途径依然受限。（82,329 stars / 18,674 forks…）
- [] https://raw.githubusercontent.com/1c7/chinese-independent-developer/master/README.md — "[WithoutAD]：面向孩子的学习与益智游戏平台…全站无广告、无付费门槛"
- https://github.com/TapXWorld/ChinaTextbook/issues/198
- https://github.com/happycola233/tchMaterial-parser

**产品概念**：不托管任何PDF的"课本导航"网页+桌面阅读器：网页按学段/年级/学科/版本建立结构化索引

**MVP 范围**：1-2周：索引站+官方深链+教程

**风险**：unmet与buildable均被反驳：官方平台已免费按年级

### 46. 厌倦订阅者要买断制无广告的单功能工具（C35，总分 4.6）

**一句话**：面向macOS/iOS的"买断工具包

**用户与场景**：对广告和订阅疲劳的普通手机用户。记事本、症状记录、课程表、音量控制、小组件这类简单工具打开就弹订阅墙

**现有方案及不足**：Fossify套件（捐赠制、仅Android）

**为何至今没解决**：验证显示供给侧已被成熟方案覆盖：Android有F-Droid

**验证结论**：unmet=refuted(3) crowd=weak(6) buildable=weak(5)

- *unmet* → refuted（3）：簇的核心诉求是"买断/免费、无广告、离线、零登录、只做一件事"的小工具（记事本、日历/课程表、音量、小组件、症状记录）。逐平台核查后，这个场景在供给侧已被成熟方案覆盖，未解决的是"发现渠道"和"商业可持续性"，而非"没有产品"：

1. Android：F-Droid 生态（fdroidclient 3.1k★，持续更新）+ Fossify 套件（SimpleMobileTools 社区分支，Gallery 3.7k★/Calendar 2.2k★/File-Manager 1.8k★/Notes 499★，全部 2026-09-27 当天仍有 push，GPL-3.0，官方口号"open-source, ad-free apps"），再加 Markor 6.2k★、Notally 2.2k★、Quillpad 1.4k★、Loop Habit Tracker 10.3k★、ShizuTools 2.6k★/VolumeManager 571★（每应用音量），且 Notally/Quillpad/Fossify 都同时上架 Google Play，普通用户无需侧载。记事本类甚至已饱和到项目自嘲"like there have been tens of thousands before"。KWGT 小组件为一次性 Pro key（高置信）。
2. iOS：Apple 自带备忘录/提醒
  - 竞品/替代：Fossify 套件 (Gallery/Calendar/Notes/File-Manager/Clock/Music 等, Android) — 够用。SimpleMobileTools 的社区分叉，GPL-3.0，明确 ad-free、离线、无登录，单功能一 app 一事，各 repo 2026-09-27 仍在活跃提交，同时上架 F-Droid 与 Google Play。直接覆盖记事本、日历/课程表、小组件（Calendar/Notes 自带 widget）。缺点：issue 积压多（Gallery 322 open），依赖捐赠。（https://github.com/FossifyOrg）
  - 竞品/替代：F-Droid / IzzyOnDroid (Android FOSS 应用商店) — 够用（Android）。整座商店按定义无广告、无追踪、免费，并标注反功能；是该诉求最系统性的解决渠道。缺点：需侧载、普通 Play 用户不知道，且新版本 Android 对侧载摩擦增大。（https://github.com/f-droid/fdroidclient）
  - 竞品/替代：Notally / NotallyX (Android 极简记事) — 够用。2.2k★，1.4MB APK，无广告、离线、Play 与 F-Droid 均有。但单人维护、已关闭 issue 不接功能请求，社区分叉 NotallyX (745★) 接力——体现买断/免费小工具的维护脆弱性。（https://github.com/OmGodse/Notally）
  - 竞品/替代：Quillpad (Android Markdown 记事) — 够用。1.4k★，GPL，'never show you ads'，可选 Nextcloud 同步，Play/F-Droid 上架。本身是停更 Quillnote 的分叉。（https://github.com/quillpad/quillpad）
  - 竞品/替代：Markor (Android 文本/Markdown/todo.txt 编辑器) — 够用且成熟。6.2k★，纯本地文件，无网络权限诉求，持续更新至 2026-09。（https://github.com/gsantner/markor）
  - 竞品/替代：Loop Habit Tracker (uhabits) — 够用（习惯/日常记录场景）。10.3k★，离线、无广告、免费。不是专门的症状记录，但可作为数值型每日记录替代。（https://github.com/iSoron/uhabits）
- *crowd* → weak（6）：对簇自带证据的审视：(1) 仅 3 条 evidence，全部来自 Hacker News；platforms 字段声称覆盖 Google Play / App Store / Medium / Substack，但没有任何一条来自这些平台，independent_source_count=15 与可见的 3 条严重不符、无法核验。(2) 三条引文全部被截断为 "…"，engagement 全为 unknown，没有任何可见的点数/评论数。(3) 引文 1 "preference for simple apps without ads…" 是转述而非用户原话；引文 3 "Ask HN: Is anybody running a successful non-subscription business?" 是开发者问商业可行性，属于 why_unsolved 侧的供给端问题，不是用户"想要但没有"的表达；只有引文 2 "Ask HN: Anyone tired of everything being a subscription?"(2022-12) 是直接的用户端抱怨帖——就我所知该帖确实是高热度 Ask HN，但本会话无法访问 HN 核实。(4) 描述中点名的 Tracky / Time Table Notes / Volume Control / Widgetsmith 评论区
  - 竞品/替代：Fossify 套件（Android, FOSS） — 对 Android 技术用户基本满足：无广告、无网络权限、离线、GPL；但是免费/捐赠制而非买断，无 iOS 版本，需 F-Droid 或 Play 安装，普通用户知晓度低（https://github.com/FossifyOrg）
  - 竞品/替代：SimpleMobileTools 原版（已售予 ZipoApps） — GitHub 源码仍在但项目已停止维护；Play 商店版本被新东家接手，社区因担忧广告而分叉——恰是簇所描述问题的实例（https://github.com/SimpleMobileTools/Simple-Gallery）
  - 竞品/替代：Notally — 极简 Android 笔记，2.2k★，满足'只做一件事、无广告'；仅 Android（https://github.com/OmGodse/Notally）
  - 竞品/替代：Notepads (Windows) — 10.3k★ 的 Windows 记事本替代，无 Copilot/登录；满足桌面侧诉求（https://github.com/0x7c13/Notepads）
  - 竞品/替代：awesome-privacy / awesome-oss-alternatives 清单 — 帮助技术用户发现替代品，但对普通手机用户和 iOS 用户帮助有限（https://github.com/lissy93/awesome-privacy）
  - 竞品/替代：F-Droid 生态（基于常识，未在本会话核验） — Android 上大量无广告无追踪的单功能工具的事实渠道；不覆盖 iOS，普通用户使用门槛高
- *buildable* → weak（5）：【1. 可建性】技术上极易：任一「单功能、离线、零登录、买断」工具（记事本/症状日志/课程表/音量控件/桌面小组件）1-2 人 1-3 周即可完成 MVP。技术路径：原生（SwiftUI/Kotlin）或 Flutter/Tauri，本地 SQLite/文件存储，无后端；Android 可直接不申请 INTERNET 权限，成为可验证的「永不联网」卖点；iOS 用非消耗型 IAP 一次性解锁，Android 用 Play 一次性购买或 F-Droid 免费+捐赠；桌面端用 Paddle/Gumroad/Lemon Squeezy 发 license key，走 Sublime/Things 式「买断 + 大版本付费升级」。做成「买断工具包」（5-10 个小工具一次性 $9-19）或「买断/无广告/无登录软件目录」（静态站 + 社区核验，2-4 周）同样可做。
【2. 壁垒与为何未解决】无监管、版权、爬虫、破解等灰色地带，合法合规。但真正壁垒不是技术：(a) 需求本质是对商业模式的偏好，分散在几十个工具品类，单个 App 只能覆盖一小片；(b) 每个品类几乎都已有免费 FOSS 替代（Fossify 套件：Gallery 3.7k★、Calendar 2.2k★、File Manager 1.8k★、Messages 1.6k★；Notesnook 14.6k★；Joplin；Sta
  - 竞品/替代：Fossify（Simple Mobile Tools 社区分叉，Android 无广告单功能套件：Gallery/Calendar/File Manager/Messages/Phone/Voice Recorder/Notes） — 高度覆盖需求（无广告、离线、开源、F-Droid 分发、可选 Play 付费版），但仅限 Android；其存在本身说明缺的不是软件而是主流渠道曝光与商业可持续性。（https://github.com/FossifyOrg）
  - 竞品/替代：Simple Mobile Tools（原作者 2023 年底出售给 ZipoApps，后续加入广告/订阅） — 曾是该需求的标杆产品（Gallery 4.0k★、Calendar 3.7k★），出售事件直接证明买断/无广告模式对独立开发者收入不可持续，是 why_unsolved 的实证。（https://github.com/SimpleMobileTools）
  - 竞品/替代：Notesnook（开源端到端加密笔记，14.6k★） — 覆盖记事本品类，免费版可离线使用，但走订阅制同步付费，非纯买断；功能偏重，不是「只做一件事」。（https://github.com/streetwriters/notesnook）
  - 竞品/替代：F-Droid（Android 开源应用商店） — 大量零广告零追踪单功能工具，但用户需主动安装第三方商店，对普通手机用户与 iOS 用户不可达，正是「发现/分发」壁垒的体现。（https://f-droid.org）
  - 竞品/替代：37signals ONCE（Campfire/Writebook，买断制软件） — 验证买断模式在 B2B/自托管工具上可行（Campfire $299），但面向团队而非消费者小工具。（https://once.com）
  - 竞品/替代：Things 3 / iA Writer / Sublime Text 等买断制独立软件 — 证明 macOS/iOS/桌面端买断 + 大版本付费升级模式可持续，但均为成熟品牌、多年积累，非 2-6 周 MVP 可复制的分发优势。

**用户原话 / 关键证据**：
> HN "Ask HN: Anyone tired of everything being a
> SimpleMobileTools 2023-12售予ZipoApps后General-Discussion立刻出现#2

**证据链接**：
- [] https://news.ycombinator.com/item?id=46482268 — preference for simple apps without ads…
- [] https://news.ycombinator.com/item?id=34041962 — Ask HN: Anyone tired of everything being a subscr…
- [] https://news.ycombinator.com/item?id=45769481 — Ask HN: Is anybody running a successful non-subsc…
- https://github.com/FossifyOrg
- https://github.com/SimpleMobileTools/General-Discussion/issues/241

**产品概念**：macOS/iOS优先的"买断工具包"：SwiftUI原生实现5-10个单功能小工具（离线记事本

**MVP 范围**：2-4周1-2人：3个小工具（记事本

**风险**：unmet被反驳：Fossify/F-Droid/Apple内置/买断精品

### 47. 自我管理者要极简无广告能记耗时主动提醒的打卡（C41，总分 4.6）

**一句话**：Flutter双端"照片打卡日历"：自建打卡事件

**用户与场景**：学生、考研党、上班族中的自我管理。小红书"时间管理app"问答反复吐槽：时光序越做越复杂

**现有方案及不足**：Streaks（iOS买断，无照片日历）

**为何至今没解决**：验证显示"极简+无广告+记耗时+可靠提醒"组合已在iOS

**验证结论**：unmet=refuted(3) crowd=weak(5) buildable=confirmed(7)

- *unmet* → refuted（3）：簇的核心诉求拆开是五点：功能精简/界面干净、无广告、能记耗时、不开App也能可靠推送提醒、（可选）照片日历式记录。逐点对照已知产品：(1) iOS 上 Streaks（一次性买断约¥38/US$5.99，Apple Design Award 得主）本身就是"极简+无广告+计时型任务(timed tasks 内置计时器记耗时)+本地通知可靠提醒+Apple 健康联动运动打卡"，几乎逐条命中核心诉求，且在中国区 App Store 可直接购买；(2) Android 上 Loop Habit Tracker（GitHub iSoron/uhabits，10.3k star，GPLv3，README 明写"completely ad-free"，每习惯自定义提醒、桌面小组件、数值型习惯可记录分钟数，2026-08-14 仍发 v2.3.1）是成熟、口碑极好的免费方案，唯缺内置计时器与照片；HabitNow（Android，含习惯计时器/提醒，免费限7个习惯，一次性买断解锁）补上计时器；(3) 跨平台的 Habitify（每习惯计时器、提醒、笔记；免费版有习惯数限制，Pro 订阅）与 HabitKit（GitHub 贴图式网格、无广告、买断制 Pro、提醒）也是被广泛推荐的极简选项；(4) 国内的滴答清单免费版即含习惯打卡+番茄专注（自动记录时长并可关联习惯）+业界公认可靠的推送，无广告，
  - 竞品/替代：Streaks (iOS/watchOS/macOS, Crunchy Bagel) — 够用（iOS 侧最贴合）：极简界面、一次性买断无广告无订阅、内置计时型任务(timed task)直接记耗时、本地通知每任务可定提醒、可联动 Apple 健康自动完成运动类打卡；Apple Design Award 得主，口碑极好，中国区 App Store 可买。缺：无 Android、无照片日历、任务上限 24 个（对极简用户不是问题）。（https://streaksapp.com）
  - 竞品/替代：Loop Habit Tracker (uhabits, Android 开源) — 基本够用（Android 侧）：10.3k star、GPLv3、明确无广告无账号、每习惯提醒+小组件、数值型习惯可手填分钟数记耗时、2026-08 仍在更新，有中文界面。缺：无内置计时器、无照片、国内需从 GitHub/F-Droid 侧载，国产 ROM 后台限制可能影响提醒（Android 通用问题）。（https://github.com/iSoron/uhabits）
  - 竞品/替代：HabitNow (Android) — 基本够用：习惯自带计时器/秒表记耗时、可靠提醒、待办+习惯合一、免费版无广告但限 7 个习惯，一次性买断解锁。缺：无 iOS、无照片日历、Google Play 分发为主。
  - 竞品/替代：Habitify (iOS/Android/Web/Mac) — 功能上覆盖（每习惯计时器、提醒、笔记、情绪、跨端同步、无广告）且界面干净，但免费版习惯数受限，完整功能靠订阅/买断 Pro——属于'收费墙'型方案，口碑良好。（https://www.habitify.me）
  - 竞品/替代：HabitKit (iOS/Android) — 部分够用：GitHub 贴图式极简网格、无广告、买断制 Pro、提醒、跨端；被极简党广泛推荐。缺：不记耗时、无照片，纯打卡向。
  - 竞品/替代：滴答清单 / TickTick — 功能覆盖最全（习惯打卡+番茄/正计时自动记录时长并可关联习惯+业界公认可靠推送+无广告+任务可附图），免费版即可用习惯与专注，但产品整体'大而全'，正是簇内用户嫌复杂的对象；附件等高级项需会员。已在簇 existing_solutions 中。（https://dida365.com）
- *crowd* → weak（5）：证据本体审视：(1) 三条 evidence 全部来自 xiaohongshu.com/mobile/question/* ——这是小红书面向搜索引擎的聚合问答页（对多篇笔记的自动摘要），不是用户原帖。引文措辞是第三人称测评/汇总口吻（"各款时间管理应用都有各自的缺点，如…"、"时光序应用由于版本升级…；小日常应用的缺点是…"），第三条甚至是英文且被截断（"Dot Habit has ads and a crude UI that lacks aesth…"），明显是抓取器/LLM 转述而非原话。这类内容本质是"时间管理 app 推荐/横评"清单，簇描述里的"MarkTimes 本命软件、清新界面、照片日历"更是典型推荐/软文语句，被解读成了"需求"。(2) 独立性差：单一平台；395527 与 395530 ID 近乎连号，极可能是同一批生成的问答页、复述同一组笔记；independent_source_count=5 与只有 3 条 evidence 自相矛盾，crowd_signal="many" 是断言而非展示。(3) 互动数据全无：唯一的"engagement"是"该线程在10次不同查询中出现"，这度量的是抓取查询的重叠度，不是用户点赞/评论/收藏。(4) 常识层面：诉求的"通用内核"（干净、无广告、提醒可靠、不堆功能的打卡/习惯工具）确实是普遍且反复出现的抱怨——国产工
  - 竞品/替代：Loop Habit Tracker (iSoron/uhabits) — 10.3k★，免费开源、无广告、极简、带提醒——已覆盖簇的核心诉求；不足：无耗时/计时统计，部分 Android 机型提醒不可靠（#160、#1808），国内应用商店可见度低（https://github.com/iSoron/uhabits）
  - 竞品/替代：Table Habit (FriesI23/mhabit) — 1.6k★，明确 no ads/no account/离线优先/WebDAV 同步；README 未提提醒与耗时统计，不满足'可靠推送+记耗时'（https://github.com/FriesI23/mhabit）
  - 竞品/替代：Grit (shub39/Grit) — 1.2k★，极简待办+习惯+提醒，Android/F-Droid；无耗时记录、无照片日历（https://github.com/shub39/Grit）
  - 竞品/替代：Beaver Habits (daya0576/beaverhabits) — 1.8k★，自托管极简打卡；无提醒、无耗时，面向能自建服务的技术用户，不适合簇中的学生/家长人群（https://github.com/daya0576/beaverhabits）
  - 竞品/替代：Habo (xpavle00/Habo) — 1.5k★，隐私优先、E2EE 同步、iOS/Android；未核实是否有耗时统计（https://github.com/xpavle00/Habo）
  - 竞品/替代：Habitica (HabitRPG/habitica) — 14.2k★，游戏化而非极简，与'功能精简、界面干净'方向相反（https://github.com/HabitRPG/habitica）
- *buildable* → confirmed（7）：【簇要点】C41：学生/考研/上班族/跳绳家长，要一个"极简、无广告、能记耗时、不开App也能可靠提醒、照片日历式记录"的待办/习惯/运动打卡工具。现有产品各缺一角：时光序越做越重、小日常只按天不记耗时、Blink提醒依赖打开App、Flink无子任务/计时/提醒、Dot Habit有广告、跳绳头部产品开屏广告。independent_source_count=5，crowd_signal=many，但证据全部来自小红书问答，且已有用户把 MarkTimes 称为"本命软件"，说明痛点是"组合缺口"而非"零解决方案"。

【1. 可做性与技术路径】能做。这是单机型效率工具，无外部数据依赖，1-3 人 2-6 周可交付 MVP：
- 客户端：Flutter 或 SwiftUI/Kotlin 原生（推荐 Flutter 双端；开源参考 FriesI23/mhabit、xpavle00/Habo 都是 Flutter 习惯打卡，可借鉴架构）。本地优先 SQLite/Isar 存数据，不做账号也能用。
- 核心功能包：习惯/待办创建（自建打卡事件）、一键打卡、计时器+手动补录耗时、日/周/月耗时统计、照片附着的日历格视图、每日/多时段提醒。以上全是成熟 CRUD+本地通知，工作量约 3-4 周。
- 提醒可靠性（"不打开也能提醒"是最关键的技术差异点）：iOS 本地通知 UNUserNot
  - 竞品/替代：Loop Habit Tracker (iSoron/uhabits) — 10.3k★、GPL、完全无广告、离线、每习惯独立提醒、桌面小组件；但仅 Android、无耗时/计时记录、无照片日历、界面偏工具化且非中文本土审美。覆盖'极简+无广告+提醒'三项，缺'耗时'与'照片记录'两项。（https://github.com/iSoron/uhabits）
  - 竞品/替代：Habitica (HabitRPG/habitica) — 14.2k★，RPG 游戏化习惯追踪，功能重、非极简，与本簇'减法'诉求相反。（https://github.com/HabitRPG/habitica）
  - 竞品/替代：mhabit (FriesI23/mhabit) — 1.6k★，Flutter 开源习惯打卡，WebDAV 同步，多平台；偏打卡评分，无耗时计时与照片日历。可作为 MVP 架构参考。（https://github.com/FriesI23/mhabit）
  - 竞品/替代：Habo (xpavle00/Habo) — 1.5k★，Flutter 隐私优先 iOS/Android 习惯打卡，E2EE 同步；同样缺耗时记录与照片。（https://github.com/xpavle00/Habo）
  - 竞品/替代：Grit (shub39/Grit) — 1.2k★，Android 简洁待办+习惯，带通知；无耗时统计与照片日历，未针对国产 ROM 推送可靠性。（https://github.com/shub39/Grit）
  - 竞品/替代：flutter-checkio — 706★，国内开源 Flutter 习惯打卡 Demo（Bloc 状态管理、动画），演示级，无可靠提醒与耗时统计，不是可用产品。（https://github.com/search?q=%E6%89%93%E5%8D%A1+%E4%B9%A0%E6%83%AF&type=repositories&s=stars&o=desc）

**用户原话 / 关键证据**：
> 小红书问答（该线程在10次不同查询结果中反复出现）："各款时间管理应用都有各自的缺点，如不能具体记录耗时
> "habit tracker"在GitHub命中61,946个仓库

**证据链接**：
- [] https://www.xiaohongshu.com/mobile/question/395527 — 各款时间管理应用都有各自的缺点，如不能具体记录耗时、新添加待办不方便、缺少高阶清单功能…（该线程在10次不同查询的结果中出现）
- [] https://www.xiaohongshu.com/mobile/question/395530 — 时光序应用由于版本升级，越做越复杂和繁琐；小日常应用的缺点是功能太单一，只有打卡功能可以使用
- [] https://www.xiaohongshu.com/mobile/question/355248 — Dot Habit has ads and a crude UI that lacks aesth…
- https://github.com/iSoron/uhabits
- https://github.com/iSoron/uhabits/issues/1808

**产品概念**：Flutter双端App"日拾"：自建打卡事件（习惯/待办/运动）

**MVP 范围**：3-5周1-3人：打卡/计时/耗时统计

**风险**：unmet被反驳：Streaks/Loop/HabitNow/Habitify

### 48. 笔记用户要层级标签、多归属与工作私人分库（C15，总分 4.4）

**一句话**：Joplin "Tag Tree"插件：把现有a/b

**用户与场景**：Joplin/Trilium。Joplin用户要像Evernote那样可折叠的嵌套/层级标签（#375

**现有方案及不足**：Obsidian（闭源免费同步收费）、Logseq 45k★

**为何至今没解决**：验证显示每一类需求都已有成熟免费方案：Obsidian原生嵌套标签

**验证结论**：unmet=refuted(2) crowd=confirmed(7) buildable=weak(4)

- *unmet* → refuted（2）：该簇把"层级标签 / 多归属 / 工作私人分库"三类需求合并，但逐项核实后，每一类在开源与商业市场都已有成熟、口碑好、免费可用且在维护的方案，剩余的只是"想在我正在用的那一款里原生实现"的项目级 feature request，不构成未满足的市场空白。

1) 层级/嵌套标签：Obsidian（#a/b 原生嵌套、标签面板可折叠、个人与商用均免费）、Logseq（namespace 层级页面，AGPL，45k★）、思源笔记 SiYuan（层级标签，AGPL，46.5k★，issue #9489"Hierarchical tags"2023 年已 closed-completed）、QOwnNotes（README 明写 hierarchical note tagging + note subfolders + multiple note folders，GPL，5.9k★）、Trilium/TriliumNext（任意深度树 + 属性系统，38k★）、Notesnook（嵌套 notebook 2024 年完成，GPL，14.6k★）、Teedy（"Tag system with nesting"）。更关键的是簇里作为"开源只有扁平分类"证据的 Paperless-ngx 本身已在 v2.19（PR #10833，2025-10-22 合并）实现嵌套标签（最深 5 级、父标签自动继
  - 竞品/替代：Obsidian（嵌套标签 + 多 Vault） — 足够。#a/b 原生嵌套、标签面板按父级折叠、tag:parent 搜索匹配所有子标签、多 vault 实现工作/私人分库且切换不需重启；个人与商用均免费（同步可用 Syncthing/iCloud/Remotely Save 免费替代）。缺点：闭源、官方同步收费。（https://github.com/obsidianmd/obsidian-help/blob/master/en/Editing%20and%20formatting/Tags.md）
  - 竞品/替代：Logseq（namespace 层级页面） — 足够。a/b/c 命名空间页面自动形成层级树、标签即页面可多归属；AGPL 开源、45k★、免费、活跃（DB 版 beta）。多图库(graph)可分工作/私人。（https://github.com/logseq/logseq）
  - 竞品/替代：思源笔记 SiYuan（层级标签、多工作空间） — 足够，尤其面向中国用户。支持 #父/子# 层级标签并在标签面板树状展示（#9489 2023 年已完成），多工作空间隔离；AGPL、46.5k★、本地使用免费，仅云同步收费；iOS/Android/鸿蒙全端。（https://github.com/siyuan-note/siyuan）
  - 竞品/替代：QOwnNotes（层级标签 + 多 note folder） — 足够。README 明写 hierarchical note tagging、note subfolders、multiple note folders（可分工作/私人库），纯 Markdown 文件、GPL 免费、5.9k★、持续维护。UI 偏工具化，无官方移动端。（https://github.com/pbek/QOwnNotes）
  - 竞品/替代：Trilium / TriliumNext（树 + cloning 多归属 + 属性） — 足够且直接解决"一份笔记属于多个层级"：note cloning 让同一笔记出现在树的多个父节点，属性系统可做多维标签；AGPL、38k★、2024 年社区接管后活跃。学习成本较高、移动端靠第三方客户端。（https://github.com/TriliumNext/Trilium）
  - 竞品/替代：Notesnook（嵌套 notebook + 多标签） — 基本足够。2024 年起支持嵌套 notebook 树、标签多归属、E2EE；GPL 开源、14.6k★；同步需付费订阅（可自托管服务端）。（https://github.com/streetwriters/notesnook）
- *crowd* → confirmed（7）：对"只是极少数人的个别需求"这一反驳假设的检验结果：不成立，但簇本身有拼接问题。

(1) 证据真伪与引文性质：evidence 数组 3 条的 quote 都只是 issue/discussion 标题，不是用户痛点原话，第 3 条 URL 还是 Discussions 分类列表页而非讨论本身（实际讨论是 #437）。但逐条在 GitHub 上核实后数字全部属实：Joplin #375 "[Feature request] Hierarchical tags" 2018-04 开、仍 open、标 high，👍121 ❤43 🚀4 共 168 reactions、77 条评论，最近更新 2026-08-05；paperless-ngx #1841 "multiple ASN-groups" 在 Feature Requests 分类按票数排第 1（222 票、115 条=43 评论+72 回复），页面内可见多位不同用户描述"个人 vs 公司前缀""我和我妈各自 ASN 序列""按保存年限分组"，维护者 shamoon 明确"不反对但要平衡旧用户"；#437 "Allow multiple correspondents" 139 票、31 条、约 21 位参与者，合同双方/全家共用/雇主-孩子-医生-保险多方的真实场景；KOReader #8472 👍76（88 reactions
  - 竞品/替代：Obsidian nested tags (native, #a/b/c, tag pane tree) — 完整解决层级标签；闭源免费，同步付费；有 80-star 插件补图谱视图，说明用户基数大（https://github.com/drPilman/obsidian-graph-nested-tags）
  - 竞品/替代：Evernote / Bear 嵌套标签 — 原生支持，闭源订阅；Joplin #375 正是以 Evernote 截图为范本
  - 竞品/替代：Anki hierarchical tags (::) — 已原生实现（2.1.45 起），证明该需求普遍到成熟项目最终都会做（https://github.com/ankitects/anki/issues/3062）
  - 竞品/替代：Immich hierarchical tags — 已原生实现（2024），现存 issue 只是导入边缘 bug（https://github.com/immich-app/immich/issues/18706）
  - 竞品/替代：memos nested tags (a/b) — 已支持子标签，剩余为选父标签显示子标签的细节（https://github.com/usememos/memos/issues/3753）
  - 竞品/替代：QOwnNotes tag tree — 2016 请求已实现层级标签树（https://github.com/pbek/QOwnNotes/issues/137）
- *buildable* → weak（4）：【簇本质】C15 不是一个独立产品需求，而是 6-7 个不同开源宿主（Joplin/Trilium/Readest/AFFiNE/Paperless-ngx/Simplenote/KOReader）内部的"数据模型缺一维"功能请求集合。用户痛点确凿（Joplin #375 open、labels high/desktop/mobile/cli；Paperless ASN-groups 222 票仍 open），但可交付形态只有三种：宿主插件、上游 PR、或另起一个笔记 App。

【1. 小团队 2-6 周可行性】
- 宿主插件路线（可做，1-3 周）：Joplin 插件 API 提供 data API（tags/notes/notebooks）+ 侧栏 panel + 命令，把现有 "a/b/c" 命名前缀解析成可折叠树、按子树过滤、拖拽重命名，纯前端逻辑，1 人 1-2 周可出 MVP。技术路径：joplin.data.get(['tags']) → 按 "/" 建树 → webview panel 渲染 → joplin.commands 触发搜索 `tag:a/b/*`。但限制：只能"补一个面板"，无法替换原生扁平标签栏；移动端插件 API 能力弱（panel 受限）；同步格式不变，所以无破坏性但也无"真正层级"（仍是字符串约定）。GitHub 上已有同类尝试：alondm
  - 竞品/替代：paperless-ngx PR #10833 Nested Tags（已合并 2025-09-17） — 已解决 Paperless 的层级标签（父子关系、自动继承、深度≤5、UI 树形）；ASN 多组与多通信方仍未解决（https://github.com/paperless-ngx/paperless-ngx/pull/10833）
  - 竞品/替代：Joplin Profiles（内置） — 桌面+移动均支持工作/私人分库，切换需重载应用；基本满足分库子痛点（https://github.com/laurent22/joplin/blob/dev/readme/apps/profiles.md）
  - 竞品/替代：alondmnt/joplin-plugin-tag-navigator — 30★，支持 #parent/child 内联嵌套标签、面板、表格/看板视图、内联与原生标签互转；非原生侧栏，需正则配置，移动端功能不全（https://github.com/alondmnt/joplin-plugin-tag-navigator）
  - 竞品/替代：nickhobbs94/joplin-plugin-advanced-tags — 15★，规则式父标签自动继承/重命名/移动，无树形 UI，标注 experimental（https://github.com/nickhobbs94/joplin-plugin-advanced-tags）
  - 竞品/替代：sanbao/joplin-plugin-tagtree — 1★，标签层级面板，2023 后弃更；说明插件路线可行但无吸引力（https://github.com/sanbao/joplin-plugin-tagtree）
  - 竞品/替代：Trilium Notes — 38k★，clone 机制让一条笔记同时位于多个父节点（多归属），属性系统可做层级；学习成本高（https://github.com/TriliumNext/Trilium）

**用户原话 / 关键证据**：
> Joplin #375"[Feature request] Hierarchical tags"（2018-04开
> "嵌套/层级标签"跨十余个仓库反复出现：AFFiNE被独立提了3次、Notesnook、Karakeep

**证据链接**：
- [] https://github.com/paperless-ngx/paperless-ngx/discussions/1841 — Multiple ASN-groups（222 upvotes, 115 评论）
- [] https://github.com/koreader/koreader/issues/8472 — FR: Flat/Library view（👍 76, 196 评论）
- [] https://github.com/paperless-ngx/paperless-ngx/discussions/categories/feature-requests?discussions_q=is%3Aopen+sort%3Atop — Allow multiple correspondents for a given document（139 upvotes, 31 评论）
- https://github.com/laurent22/joplin/issues/375
- https://github.com/paperless-ngx/paperless-ngx/pull/10833

**产品概念**：Joplin插件"Tag Tree"：用joplin.data.get(['tags'])读取全部标

**MVP 范围**：1-2周1人：Joplin插件树面板

**风险**：unmet被反驳(2)：Obsidian/Logseq/思源/QOwnNotes

### 49. 普通用户要备份快、视频不锁会员的可靠云相册（C42，总分 4）

**一句话**：BYO存储的"自带云相册"App：相机胶卷（含视频

**用户与场景**：手机存储吃紧、需长期保存家庭照片。百度一刻相册/百度网盘备份速度慢、视频要会员才能备份、担心数据能否恢复

**现有方案及不足**：iCloud（云上贵州）、Google Photos/Google

**为何至今没解决**：验证显示该场景已被两条成熟路线覆盖：付费云（iCloud国区50GB

**验证结论**：unmet=refuted(3) crowd=weak(5) buildable=weak(4)

- *unmet* → refuted（3）：簇的核心诉求是「备份快 + 视频不锁会员 + 可靠可导出」的云相册，附带「自动按行程/人物整理」。逐项核对现有方案后，结论是该场景已被多类成熟产品覆盖，簇内「没有胜出者」的判断主要是把「免费且不限速不限视频」当成可行目标，而这在公有云存储经济上本就不成立；真正的痛点只集中在百度系免费产品上。

1) 海外市场：Google Photos（15GB 免费，Google One 100GB≈$1.99/月，2TB≈$9.99/月，视频照片同价、不限速、Takeout 可导出、自动生成回忆/旅行相册）与 iCloud 照片、Amazon Photos（Prime 会员照片无限）已经是「解决完毕」的市场；Ente Photos（开源 E2EE，GitHub 29.1k star，10GB 免费，付费不锁视频，可自托管、有导出工具）是隐私路线的成熟替代。海外维度这个簇不成立。

2) 中国市场，iPhone 用户：iCloud 国区由云上贵州运营，50GB ¥6/月、200GB ¥21/月、2TB ¥68/月，照片视频一视同仁、速度快、系统级自动备份、可通过 iCloud.com / 数据导出取回，口碑稳定，且「回忆」功能自动按行程/人物生成可回看相册。这直接满足簇的「合理付费 + 视频不锁 + 快 + 可导出 + 自动整理」，只是不是免费。

3) 中国市场，Android 用户：华为云空
  - 竞品/替代：iCloud 照片（国区由云上贵州运营） — 够用（iPhone 用户）。50GB ¥6/月、200GB ¥21/月、2TB ¥68/月，照片视频同等对待、系统级自动备份、速度快、可经 iCloud.com/隐私数据导出取回；「回忆」自动按人物/地点/行程生成相册。缺点：仅 5GB 免费、Android 体验差、订阅非买断。
  - 竞品/替代：Google Photos / Google One — 海外完全够用：15GB 免费，100GB≈$1.99/月，2TB≈$9.99/月，视频不额外收费、不限速、Takeout 可导出、自动回忆/旅行相册。缺点：中国大陆不可直连。
  - 竞品/替代：华为云空间 / 小米云服务 / OPPO / vivo / 荣耀云空间（系统内置） — 基本够用（Android 用户）。厂商付费档位照片视频一并备份、不限速、系统级自动备份、可通过网页/PC 端导出。缺点：免费仅约 5GB，换品牌即需迁移；具体价格档位不确定。
  - 竞品/替代：家用 NAS：极空间 / 绿联 / 群晖 Synology Photos / 飞牛 fnOS — 够用且是国内 2023–2025 主流「逃离网盘」答案：硬件买断 ¥1000–3000，手机 App 自动备份照片视频、局域网不限速、无会员墙、数据自持可导出，多数支持一键部署 Immich。缺点：需购买硬件与初始设置，外网访问速度取决于家庭上行带宽。
  - 竞品/替代：Immich — 技术用户够用：115.1k star、持续稳定发版、免费开源、iOS/Android 自动备份照片+视频、人脸/回忆功能。缺点：需 Docker/NAS；手机后台备份可靠性有多个高热度 open issue（iOS 极慢、重复上传、Android 上传循环），对纯普通用户仍有门槛。（https://github.com/immich-app/immich）
  - 竞品/替代：Ente Photos — 海外/隐私用户够用：开源 E2EE、10GB 免费、付费不锁视频、可自托管、有导出工具、经第三方安全审计。缺点：服务器在海外，中国大陆上传速度/可达性不确定；订阅制。（https://github.com/ente-io/ente）
- *crowd* → weak（5）：【证据本身审视】簇内 evidence 仅 3 条，全部来自小红书同一站点的 /mobile/question/ 路径（我不确定这是否为真实用户帖还是聚合问答页），没有一条是可核验的用户原话：(1) 690698 的 quote 是"用户反映备份速度慢、需要会员才能备份视频"——这是转述摘要而非引文，其 engagement 字段"该线程在2次不同查询中出现"只是搜索命中重复，不是附和/点赞；(2) 328662 的 quote 是被截断的英文摘要"Many users have reported issues with 一刻相册 regardi…"，无实质内容；(3) 311738 的 quote 仅是线程标题"文件存储"，与本诉求无关，属于误收。三条均无可见互动数据（全部 unknown）。platforms 只有 1 个，而 independent_source_count 却填 5、crowd_signal 填 many，与 evidence 数组明显不自洽，属于被夸大。description 中"替代列表很长…说明大家仍在逃离"这一推断，实际是把清单类/推荐类内容当作需求表达来解读。就簇内证据而言，"很多人跟着说"不成立。

【常识与市场】但脱离这份证据看，诉求本身在中国确实是长期、普遍的抱怨："百度网盘限速"是全民梗；阿里云盘 2021 年以"不限速"为核心卖点上线并迅
  - 竞品/替代：Immich（自托管） — 功能上完全满足'快、视频不锁、可导出'，但需自备 NAS/服务器与 Docker 运维，对簇定义的'普通用户'门槛过高（https://github.com/immich-app/immich）
  - 竞品/替代：PhotoPrism / Ente / LibrePhotos（自托管或 E2EE 云） — 同上，Ente 有托管付费版但主要服务海外，国内访问与支付均不确定（https://github.com/ente/ente）
  - 竞品/替代：pho（国内作者，手机→NAS/WebDAV/网盘同步） — 最接近国内普通用户场景的开源方案，但仍需自有存储端，且 issue 显示 iOS 视频/实况照片同步有缺陷（https://github.com/fregie/pho）
  - 竞品/替代：MT Photos（国产闭源自托管相册，GitHub 上仅见 unraid 模板与 AI 插件） — NAS 用户中口碑方案，需买断+自备 NAS，不面向无 NAS 的普通用户；具体定价不确定（https://github.com/baofeidyz/unraid-template-mtphotos）
  - 竞品/替代：阿里云盘/夸克网盘（以'不限速'为卖点） — 直接回应'限速'痛点，说明市场承认该需求；但免费容量与相册功能是否长期免费、视频是否受限我不确定
  - 竞品/替代：中国移动云盘（和彩云，宣传不限速） — 存在且宣传不限速；当前免费额度与视频政策不确定
- *buildable* → weak（4）：【簇核心】普通用户要一个"备份快 + 视频不锁会员 + 可靠可恢复 + 免费/合理买断 + 可导出"的云相册，附带"旅行结束自动整理成可回看相册"。

【1. 小团队 2-6 周能否做出 MVP】
核心痛点本质不是软件功能缺失，而是"存储+带宽成本 vs 免费"的商业模型冲突：百度一刻相册限速/视频锁会员是刻意的转化手段，不是技术瓶颈。一个 1-3 人团队没有能力补贴海量存储和出网流量，因此"免费+快+视频不限"在自营托管模式下不可能成立。软件能做的只有三条路径：
(a) BYO 存储客户端（最可行）：Flutter/原生 App，用户自带阿里云 OSS / 腾讯 COS / 七牛 / Cloudflare R2 / WebDAV(坚果云) 账号，App 负责相机胶卷（含视频、Live Photo、HEIC/HEVC）增量上传、断点续传、后台任务、缩略图索引、按时间/GPS 聚类生成"旅行相册"、按 EXIF 导出。用户直接按 GB 向云厂商付费（OSS 标准存储约 0.1 元/GB/月量级，低频/归档更便宜），无会员锁、速度只受用户上行带宽限制。2-6 周可做出可用 MVP（上传引擎 + 相册浏览 + 行程聚类），但"人物识别"需接 iOS Vision / MLKit 端侧人脸聚类，工作量会溢出 6 周。
(b) 局域网/NAS/自托管：Immich（GitHub 115k s
  - 竞品/替代：Immich (immich-app/immich) — 115k star、721 open issues，自托管照片/视频备份、人脸/地点自动整理、手机 App 自动备份、可导出；技术上完全解决核心痛点，但需自购 NAS/服务器并会 Docker，普通用户门槛高。（https://github.com/immich-app/immich）
  - 竞品/替代：PhotoPrism — 40k star，自托管 AI 相册，同样依赖自托管服务器，手机自动备份体验弱于 Immich。（https://github.com/photoprism/photoprism）
  - 竞品/替代：Ente Photos — 29k star，端到端加密托管云相册（可付费订阅或自托管），视频不锁、可导出；但服务器在海外、国内访问速度不稳定，E2EE 在国内合规灰色。（https://github.com/ente/ente）
  - 竞品/替代：PhotoSync / FolderSync 类 BYO 存储备份 App — 付费手机 App，将相机胶卷自动上传到用户自己的 S3/WebDAV/NAS，证明 BYO 存储客户端模式商业上可行但规模小；国内是否有成熟同类不确定。
  - 竞品/替代：群晖 Synology Photos / 极空间 / 绿联 NAS 相册 — 国内普通用户可用的硬件方案，局域网备份快、视频不限、人物/地点整理；需 ¥1000+ 硬件投入，与'手机存储吃紧的普通用户'的低成本诉求冲突。
  - 竞品/替代：百度一刻相册 / 阿里云盘 / 夸克 / 腾讯相册管家 / iCloud — 簇内用户正在逃离的对象：免费档限速、视频锁会员、导出困难；iCloud 付费档体验好但 Android 用户不可用。

**用户原话 / 关键证据**：
> 小红书问答：关于百度网盘的一刻相册服务，用户反映备份速度慢、需要会员才能备份视频等问题
> Immich 115.1k★/7.1k forks（GitHub增长最快项目之一）

**证据链接**：
- [] https://www.xiaohongshu.com/mobile/question/690698 — 关于百度网盘的一刻相册服务，用户反映备份速度慢、需要会员才能备份视频等问题；（该线程在2次不同查询中出现）
- [] https://www.xiaohongshu.com/mobile/question/328662 — Many users have reported issues with 一刻相册 regardi…
- [] https://www.xiaohongshu.com/mobile/question/311738 — 文件存储（问答线程标题，出现在一刻相册替代品搜索结果中）
- https://github.com/immich-app/immich
- https://github.com/fregie/pho

**产品概念**：Flutter/原生"自带云相册"App：用户填入自己的阿里云OSS/腾讯COS/七牛

**MVP 范围**：3-5周1-2人：OSS/COS/R2

**风险**：unmet被反驳：iCloud/厂商云/Google Photos与NAS

### 50. 普通人发布长尾小需求并即时生成可用小应用（C45，总分 3.8）

**一句话**：垂直场景的"说一句就有"小应用生成器：自然语言→受约束单文件

**用户与场景**：有个性化小需求、不会编程的普通用。"怎么没有一个能给猫做健康记录的工具""为什么没有一个简单有趣的聚会抽奖器"

**现有方案及不足**：蚂蚁灵光（免费、持久化与分享待迭代）

**为何至今没解决**：验证显示到2026-09这是消费级AI最拥挤的赛道之一

**验证结论**：unmet=refuted(2) crowd=weak(4) buildable=confirmed(7)

- *unmet* → refuted（2）：簇的核心诉求「普通人用自然语言说出小需求 → 即时得到可用小应用」到 2026-09 已是消费级 AI 最拥挤的赛道之一，海外与国内都有免费、口碑好、大规模使用的成熟方案。海外：Claude Artifacts（2024-06 起，免费档可用，生成即可发布分享链接）、Google AI Studio Build / Gemini Canvas / Google Opal（2025-07，明确面向非程序员的 no-code mini-app 生成，免费）、Lovable（带 Supabase 数据库/登录/托管，2025 年 ARR 破亿美元，用户主体就是非程序员，有免费档）、Base44（定位「给不懂技术的人做 App」，内置数据库/鉴权/托管，2025-06 被 Wix 收购，免费档）、Replit Agent、Bolt.new、v0、GitHub Spark（定位就是「用自然语言做个人 micro-app」）、Canva Code、Figma Make。国内：蚂蚁灵光（簇证据本身：两周 330 万闪应用，免费）、百度秒哒（2025-03，无代码生成应用，面向普通人）、字节扣子 Coze（免费，「应用」模式可生成带 UI 的小应用，开源版 coze-studio 21.6k star 且活跃）、MiniMax Agent、Manus 等。开源侧 GitHub 核实：dyad 21
  - 竞品/替代：蚂蚁灵光（闪应用） — 够用（国内）。簇证据本身：上线两周用户自发生成 330 万个闪应用，免费、手机端、面向普通人。缺陷：上线不足一年，生成质量与数据持久化、分享能力尚在迭代，但已直接覆盖簇中猫健康记录/抽奖器/背单词这类需求。
  - 竞品/替代：Claude Artifacts（Anthropic） — 够用（海外）。2024-06 起，对话中描述需求即生成可交互小应用，可一键发布为公开链接分享，免费档可用；小工具类需求（记录、抽奖、单词卡）完全覆盖。缺陷：持久化依赖浏览器存储或平台能力，国内访问受限。
  - 竞品/替代：Google Opal / Google AI Studio Build / Gemini Canvas — 够用（海外）。Opal（2025-07）明确定位非程序员用自然语言拼装 mini-app 并分享；AI Studio 可从 prompt 生成并一键部署应用；均免费。国内访问受限。
  - 竞品/替代：Lovable — 够用且口碑极好。prompt 生成全栈应用，内置 Supabase 数据库/登录/托管/分享链接，2025 年 ARR 破亿美元，用户主体是非程序员。缺陷：免费档每日消息数有限，付费 $25/月起；国内访问受限。
  - 竞品/替代：Base44（Wix） — 够用。定位就是「不懂技术的人描述需求即得可用 App」，内置数据库、鉴权、托管，2025-06 被 Wix 以约 8000 万美元收购，有免费档。国内访问受限。
  - 竞品/替代：Replit Agent / Bolt.new / v0 / GitHub Spark / Canva Code / Figma Make — 够用（海外）。均为 2024-2025 上线的 prompt-to-app 产品，Replit 带数据库与托管并支持移动端，GitHub Spark 定位即「自然语言做个人 micro-app」。缺陷：Replit 与 Spark 基本需付费订阅；Bolt/v0 免费额度有限。
- *crowd* → weak（4）：证据本身审视：(1) evidence[0] 36氪与 evidence[2] 人人都是产品经理《被超级APP忽视的需求，用户自己来做了》是同一篇文章的原发与转载（簇自己的 engagement 字段就写着"被人人都是产品经理、C114 等多站转载"），被当成两条独立来源重复计数；该文是围绕蚂蚁"灵光"发布的产品报道，"怎么没有一个能给猫做健康记录的工具"等引文是文章作者用来讲故事的示例句，不是可追溯的用户原话，也没有任何点赞/评论数据；"两周 330 万个闪应用"是厂商在免费、重度推广的上线期自报的试用量，衡量的是好奇心和尝鲜，不是持续存在的痛点。(2) evidence[1] 知乎问题"为什么国内没有一个发布需求的app或网站"只是一条匿名提问，无回答数/赞同数；且其前提站不住——猪八戒网、码市、程序员客栈、一品威客等就是国内的"发布需求"平台（基于我的知识，未在本会话验证），这条更像个人不知情而非普遍未被满足的诉求。(3) platforms 列了 Quora 但没有任何 Quora 证据；independent_source_count=4 实际只有 2（一篇文章家族 + 一条知乎提问），三条 engagement 全部不可见。(4) GitHub 补充：prompt→app 这个品类确实有大众级关注（dyad 21.6k★、bolt.diy 19.9k★、open-lov
  - 竞品/替代：dyad (open-source Lovable/Bolt alternative) — 21.6k★，本地 AI 应用生成器，但自我定位为 power users，不面向不会编程的普通人（https://github.com/dyad-sh/dyad）
  - 竞品/替代：bolt.diy — 19.9k★，prompt→全栈应用，面向 developers；需要自行配置模型/密钥（https://github.com/stackblitz-labs/bolt.diy）
  - 竞品/替代：open-lovable — 28.6k★，偏网站克隆/React 生成，开发者工具（https://github.com/firecrawl/open-lovable）
  - 竞品/替代：ToolJet / Budibase — 41k★ / 28k★，低代码+prompt 生成，面向企业内部工具而非个人长尾小需求（https://github.com/ToolJet/ToolJet）
  - 竞品/替代：Lovable / Bolt.new / v0 / Replit Agent（商业产品，基于知识，未在本会话验证） — 已在大规模服务非程序员生成小应用；说明该品类并非'没人做'，而是已被充分供给
  - 竞品/替代：通用聊天助手的应用生成（ChatGPT/Claude artifacts、豆包、Kimi、元宝等，基于知识） — 直接对话即可生成可运行的 HTML 小工具，已吸收大量'背几组单词/抽奖器'级别的微需求
- *buildable* → confirmed（7）：【1. 可行性与技术路径】能做。核心痛点（有小需求、不会编程、找不到对应 App）在"单页小工具"这一量级已被 LLM 代码生成消除，1-3 人 2-6 周可做出真正可用的 MVP。路径：(a) 自然语言 → 受约束的单文件 HTML/JS（Tailwind CDN + vanilla/Alpine，或 ESM CDN 加载 React），流式生成 + 对话式迭代修改；(b) sandbox iframe + CSP 渲染，禁止外部 fetch/表单外发；(c) 每个应用一个短链 /a/{id}，PWA 加到主屏，直接解决簇里提到的"分享能力有限"；(d) 关键差异化点是数据持久化——给生成代码注入一个极小 SDK（window.app.store.get/set），后端用 Cloudflare KV/D1 或 Supabase 按 app+匿名访客 token 分桶存储，解决"闪应用数据不持久"的痛点；(e) 内置长尾模板/意图库（记录类、抽奖/计分/计时类、背诵卡片类、计算器类）降低首屏失败率；(f) 模型用 DeepSeek/Qwen/GLM 单次成本约 ¥0.05-0.5，用 Claude Sonnet 约 $0.05-0.2，可承受。开源可直接借鉴：cloudflare/vibesdk（5.4k star，"build your own vibe-coding platf
  - 竞品/替代：灵光（蚂蚁集团）闪应用 — 簇内证据：上线两周 330 万闪应用，免费、流量大，是国内最直接的竞品；簇指出其生成质量、数据持久化、分享能力有限，这三点即差异化窗口。
  - 竞品/替代：Claude Artifacts / ChatGPT Canvas / Gemini Canvas / Google Opal — 通用聊天助手内置的即时可运行小页面/小应用，覆盖了'说出来就有'的核心体验，但持久化存储、独立分享链接、面向小白的模板与二次迭代较弱；对国内普通用户可达性差。
  - 竞品/替代：Lovable / Bolt.new / v0 / Replit Agent — 面向 prosumer/开发者的全栈 vibe coding 平台，已证明付费意愿，但对'背几组单词'这种微需求过重、英文、需要一定技术理解，不是普通消费者的答案。bolt.new 开源核心 16.6k star。（https://github.com/stackblitz/bolt.new）
  - 竞品/替代：dyad-sh/dyad — 21.6k star 的本地开源 AI 应用构建器（Lovable/v0 替代），面向 power user，需本地安装与自带 API key，不解决普通人零门槛与分享问题；可作为技术参考。（https://github.com/dyad-sh/dyad）
  - 竞品/替代：cloudflare/vibesdk — 5.4k star，Cloudflare 官方开源的'自建 vibe-coding 平台'全栈模板（Workers + Durable Objects + 沙箱预览），几乎就是本簇 MVP 的脚手架，大幅缩短开发周期。（https://github.com/cloudflare/vibesdk）
  - 竞品/替代：nextify-limited/libra — 1.7k star 的开源 V0/Lovable 替代，基于 Cloudflare Workers；技术参考价值高，产品层面仍是开发者向。（https://github.com/nextify-limited/libra）

**用户原话 / 关键证据**：
> 36氪《被超级APP忽视的需求，用户自己来做了》："怎么没有一个能给猫做健康记录的工具？"
> prompt→app品类大众级关注：dyad 21,612★/2,649 forks（2025-04创建）

**证据链接**：
- [] https://36kr.com/p/3582110406376581 — 『怎么没有一个能给猫做健康记录的工具？』『为什么没有一个简单有趣的聚会抽奖器？』『我就想背几组单词…（被人人都是产品经理、C114 等多站转载）
- [] https://www.zhihu.com/question/668224936 — 为什么国内没有一个发布需求的app或网站呢？
- [] https://www.woshipm.com/it/6303136.html — 被超级APP忽视的需求，用户自己来做了
- https://github.com/dyad-sh/dyad

**产品概念**：Web/H5+PWA的"小工具即刻"：自然语言描述→流式生成受约束的单文件HTML

**MVP 范围**：2-6周1-3人：基于cloudflar

**风险**：unmet被反驳(2)：灵光/秒哒/扣子与Claude Artifacts

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
