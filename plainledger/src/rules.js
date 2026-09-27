// 素账 PlainLedger — 归类规则引擎（内置关键词规则 + 支付宝分类映射 + 用户自定义规则）

export const CATEGORIES = [
  '餐饮', '交通', '购物', '日用', '居住', '通讯', '娱乐', '医疗', '教育', '人情',
  '旅行', '宠物', '育儿', '订阅会员', '转账', '理财', '工资', '退款', '其他',
];

export const INCOME_CATEGORIES = ['工资', '退款', '理财', '人情', '转账', '其他'];

// 支付宝“交易分类”→ 素账分类
export const ALIPAY_CATEGORY_MAP = {
  '餐饮美食': '餐饮', '交通出行': '交通', '服饰装扮': '购物', '日用百货': '日用', '数码电器': '购物',
  '美容美发': '日用', '运动户外': '娱乐', '爱车养车': '交通', '住房物业': '居住', '生活服务': '日用',
  '文化休闲': '娱乐', '医疗健康': '医疗', '教育培训': '教育', '亲友代付': '人情', '充值缴费': '通讯',
  '转账红包': '转账', '投资理财': '理财', '保险': '理财', '公共服务': '居住', '酒店旅游': '旅行',
  '母婴亲子': '育儿', '宠物': '宠物', '收入': '工资', '退款': '退款', '其他': '其他', '商业服务': '其他',
  '信用借还': '转账', '账户存取': '转账', '公益捐赠': '人情', '家居家装': '居住', '鲜花绿植': '日用',
};

// 微信“交易类型”提示
export const WECHAT_TYPE_MAP = {
  '转账': '转账', '微信红包': '人情', '群收款': '人情', '零钱提现': '转账', '零钱充值': '转账',
  '信用卡还款': '转账', '退款': '退款', '二维码收款': '工资', '微信红包-退款': '退款', '亲属卡交易': '人情',
  '零钱通': '理财', '有价券': '其他',
};

// 内置关键词规则：[正则, 分类]。按顺序匹配 交易对方 + 商品 + 类型 拼接的文本。
export const DEFAULT_RULES = [
  [/会员|VIP|订阅|连续包月|自动续费|Netflix|Spotify|iCloud|Apple Music|B站大会员|爱奇艺|优酷|腾讯视频|芒果TV|QQ音乐|网易云音乐|百度网盘|夸克|WPS|Office|Adobe|ChatGPT|Claude|Notion|豆包|Kimi|阿里云|腾讯云|域名|服务器/, '订阅会员'],
  [/美团外卖|饿了么|肯德基|麦当劳|星巴克|瑞幸|luckin|喜茶|奈雪|蜜雪|茶百道|古茗|沪上阿姨|霸王茶姉|必胜客|汉堡王|德克士|华莱士|塔斯汀|海底捞|西贝|沙县|老乡鸡|真功夫|吉野家|味千|外卖|餐厅|餐饮|饭店|小吃|面馆|烧烤|火锅|奶茶|咖啡|面包|蛋糕|烘焙|食堂|早餐|午餐|晚餐|夜宵/, '餐饮'],
  [/滴滴|高德打车|曹操出行|T3出行|享道|首汽|出租车|地铁|公交|轨道交通|一卡通|羊城通|深圳通|12306|铁路|高铁|火车|航空|机票|航司|春秋|东航|南航|国航|海航|吉祥|哈啰|美团单车|青桔|加油|中石化|中石油|停车|ETC|高速|充电桩|特来电|星星充电/, '交通'],
  [/淘宝|天猫|京东|拼多多|抖音电商|抖店|快手小店|唯品会|得物|闲鱼|苹果|Apple|小米|华为商城|优衣库|UNIQLO|ZARA|H&M|名创优品|无印良品|MUJI|服饰|鞋子|箱包|背包|数码|电器|苏宁|国美/, '购物'],
  [/超市|便利店|全家|罗森|7-ELEVEn|711|美宜佳|盒马|叮咚|每日优鲜|朴朴|多点|永辉|沃尔玛|家乐福|大润发|华润万家|物美|日用|百货|屈臣氏|药妆|理发|美发|洗衣|干洗|家政|保洁|水果|生鲜|菜市场|买菜/, '日用'],
  [/房租|租金|物业|水费|电费|燃气|天然气|煤气|自如|链家|贝壳|蛋壳|公寓|房东|供暖|停车费|维修|家居|宜家|IKEA|装修/, '居住'],
  [/中国移动|中国联通|中国电信|话费|流量|宽带|充值|10086|10010|10000|手机充值|电话费/, '通讯'],
  [/电影|猫眼|淘票票|万达影城|CGV|游戏|Steam|腾讯游戏|网易游戏|王者|原神|米哈游|KTV|酒吧|网吧|演唱会|大麦|门票|景区|健身|Keep|超级猩猩|乐刻|游泳|球馆|哔哩哔哩|音乐/, '娱乐'],
  [/医院|药店|药房|诊所|门诊|挂号|体检|美年|爱康|口腔|牙科|眼科|大药房|海王星辰|老百姓|益丰|叮当快药|医保|医疗/, '医疗'],
  [/学费|培训|课程|网课|教育|考试|报名费|得到|知乎|极客时间|Coursera|Udemy|书店|当当|图书|文具|教材|学而思|新东方|驾校/, '教育'],
  [/红包|礼金|份子|随礼|转账给|亲属|代付|捐赠|公益|水滴筹|轻松筹/, '人情'],
  [/酒店|民宿|携程|飞猪|去哪儿|途家|爱彼迎|Airbnb|Booking|Agoda|华住|如家|汉庭|亚朵|全季|旅游|景点|旅行/, '旅行'],
  [/宠物|猫粮|狗粮|猫砂|宠物医院|波奇|E宠/, '宠物'],
  [/母婴|奶粉|纸尿裤|尿不湿|童装|幼儿园|托育|早教|玩具|孩子王|babycare|Babycare/, '育儿'],
  [/零钱通|余额宝|基金|理财|股票|证券|华泰|中信|招商证券|东方财富|天天基金|蚂蚁财富|保险|平安|人保|太平洋|众安|相互宝/, '理财'],
  [/工资|薪资|薪酬|奖金|报销|劳务|稿费|兼职|收款/, '工资'],
  [/退款|退货|退回/, '退款'],
  [/转账|提现|充值|还款|信用卡|花呗|借呗|白条|微粒贷|京东金融|余额宝转|银行卡/, '转账'],
];

/**
 * 规范化用户规则：{ id, pattern(字符串，纯文本包含匹配), category, field('any'|'counterparty'|'item'), updatedAt, deleted }
 */
export function matchUserRule(rule, rec) {
  if (rule.deleted) return false;
  const p = String(rule.pattern || '').trim().toLowerCase();
  if (!p) return false;
  const hay = (rule.field === 'counterparty' ? rec.counterparty : rule.field === 'item' ? rec.item : `${rec.counterparty} ${rec.item} ${rec.type}`)
    .toLowerCase();
  return hay.includes(p);
}

/**
 * 为一条记录分类。优先级：用户规则 > 支付宝原始分类 > 微信交易类型 > 内置关键词 > 兜底。
 * 返回 { category, by }。
 */
export function categorize(rec, userRules = []) {
  for (const rule of userRules) {
    if (matchUserRule(rule, rec)) return { category: rule.category, by: 'user' };
  }
  if (rec.isRefund) return { category: '退款', by: 'refund' };
  const hay = `${rec.counterparty} ${rec.item} ${rec.type}`;
  for (const [re, cat] of DEFAULT_RULES) {
    if (re.test(hay)) return { category: cat, by: 'keyword' };
  }
  if (rec.source === 'alipay' && rec.rawCategory && ALIPAY_CATEGORY_MAP[rec.rawCategory]) {
    return { category: ALIPAY_CATEGORY_MAP[rec.rawCategory], by: 'alipay' };
  }
  if (rec.source === 'wechat' && rec.type) {
    for (const [k, cat] of Object.entries(WECHAT_TYPE_MAP)) {
      if (rec.type.includes(k)) return { category: cat, by: 'wechat-type' };
    }
    if (/商户消费|扫二维码付款/.test(rec.type)) return { category: '其他', by: 'fallback' };
  }
  if (rec.direction === 'income') return { category: '工资', by: 'fallback' };
  return { category: '其他', by: 'fallback' };
}

export function categorizeAll(records, userRules = []) {
  let hits = 0;
  for (const r of records) {
    const { category, by } = categorize(r, userRules);
    r.category = category;
    r.categoryBy = by;
    if (by !== 'fallback') hits++;
  }
  return { total: records.length, categorized: hits, rate: records.length ? hits / records.length : 0 };
}

/** 从一条被手改分类的记录生成建议规则（取交易对方最长的连续中文/字母片段）。 */
export function suggestRule(rec, category) {
  const src = rec.counterparty || rec.item || '';
  const m = src.match(/[一-龥A-Za-z0-9&·]{2,}/g);
  const pattern = m ? m.sort((a, b) => b.length - a.length)[0] : src;
  return pattern ? { pattern, category, field: 'counterparty' } : null;
}
