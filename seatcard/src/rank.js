// 按职务粗排位次。规则写得很直白，排完可以手动上下调：
//   1. 职务里写了级别（正厅、副处、正科……）的按级别，排在最前；
//   2. 地方党政领导（省、市、县、区、乡镇的书记、正副职，人大、政协负责人）排在部门领导前：
//      副市长是副厅级，市里的局长是正处级；
//   3. 部门领导按层级：部、厅 > 局 > 处 > 科 > 股，同层级正职在副职前；
//      主任、经理、院长、校长等看不出层级的，按局一级算；
//   4. 再往后是秘书长、助理、调研员等其他职务，最后是没写职务的；
//   5. 分数相同时：先按"单位顺序"（如果填了），再把书记排在同单位行政正职前（可关），最后按粘贴顺序。
// "党组书记、局长"这种兼任，取其中最高的一个。

// "副处长""副科长"是职务不是级别，所以级别词后面不能跟"长""员"
const lv = (word, alt) => new RegExp(`${word}(级|(?![长员]))|${alt}`);
const LEVELS = [
  [lv('正部', '省部级正职'), -10, '正部级'], [lv('副部', '省部级副职'), -9, '副部级'],
  [lv('正厅', '厅局级正职'), -8, '正厅级'], [lv('副厅', '厅局级副职'), -7, '副厅级'],
  [lv('正处', '县处级正职'), -6, '正处级'], [lv('副处', '县处级副职'), -5, '副处级'],
  [lv('正科', '乡科级正职'), -4, '正科级'], [lv('副科', '乡科级副职'), -3, '副科级'],
];
const PLACE = '(省|市|州|盟|县|区|旗|镇|乡)';
const LOCAL_SECRETARY = new RegExp(`${PLACE}委(副)?书记$`);
const LOCAL_HEAD = new RegExp(`^(常务)?(副)?${PLACE}长$`);
const LOCAL_CONGRESS = /(人大(常委会)?(副)?主任|政协(副)?主席)$/;
const LOCAL_DISCIPLINE = new RegExp(`${PLACE}(纪委|监委)(副)?书记$`);
// "销售总监""部门经理"在总经理、副总经理之后，按其他职务算
const OTHER = /(秘书长|助理|调研员|巡视员|总师|总经济师|总会计师|总工程师|主任科员|科员|干事|专员|委员|成员|(?<!总)经理|总监|(团委|团工委|支部|总支|工会)(副)?(书记|主席))$/;
const LADDER = [[/(部长|厅长)$/, 0], [/局长$/, 1], [/处长$/, 2], [/科长$/, 3], [/股长$/, 4]];
const LADDER_NAME = ['部厅', '局', '处', '科', '股'];
const HEAD = /(长|主任|董事长|总经理|主席|会长|理事长|总裁|行长|社长|所长|馆长|院长|校长|站长|队长|主编|主委|政委)$/;

function roleScore(role, partyFirst) {
  const r = role.trim();
  if (!r) return { score: 50, label: '未识别', party: false };
  const deputy = /副/.test(r);
  if (LOCAL_DISCIPLINE.test(r)) return { score: 3, label: '地方副职', party: false };
  if (LOCAL_SECRETARY.test(r)) return deputy ? { score: 2, label: '地方副书记', party: false } : { score: 0, label: '地方书记', party: true };
  if (LOCAL_HEAD.test(r) || LOCAL_CONGRESS.test(r)) return deputy ? { score: 3, label: '地方副职', party: false } : { score: 1, label: '地方正职', party: false };
  if (OTHER.test(r)) return { score: 30, label: '其他职务', party: false };
  if (/(纪委|纪检|纪工委|监委)(副)?书记$/.test(r)) return { score: 13, label: '副职', party: false };
  if (/书记$/.test(r)) return { score: 12 + (deputy ? 1 : 0), label: deputy ? '副书记' : '书记', party: !deputy && partyFirst };
  for (const [rx, step] of LADDER) {
    if (rx.test(r)) return { score: 10 + step * 2 + (deputy ? 1 : 0), label: `${deputy ? '副职' : '正职'}·${LADDER_NAME[step]}`, party: false };
  }
  if (HEAD.test(r)) return { score: 12 + (deputy ? 1 : 0), label: deputy ? '副职' : '正职', party: false };
  return { score: 40, label: '未识别', party: false };
}

export function rankOf(title, { partyFirst = true } = {}) {
  const t = String(title || '');
  for (const [rx, level, label] of LEVELS) if (rx.test(t)) return { score: level, label, party: false };
  const roles = t.split(/[、,，/／;；\s]+/).filter(Boolean);
  let best = roleScore('', partyFirst);
  for (const r of roles) {
    const s = roleScore(r, partyFirst);
    if (s.score < best.score || (s.score === best.score && s.party)) best = s;
  }
  return best;
}

export function sortByRank(people, { unitOrder = [], partyFirst = true } = {}) {
  const unitIdx = new Map();
  unitOrder.map((u) => u.trim()).filter(Boolean).forEach((u, i) => { if (!unitIdx.has(u)) unitIdx.set(u, i); });
  const unitKey = (p) => (unitIdx.has(p.unit) ? unitIdx.get(p.unit) : unitOrder.length);
  return people
    .map((p) => ({ p, r: rankOf(p.title, { partyFirst }) }))
    .sort((a, b) => a.r.score - b.r.score
      || unitKey(a.p) - unitKey(b.p)
      || (a.p.unit && a.p.unit === b.p.unit ? Number(b.r.party) - Number(a.r.party) : 0)
      || a.p.order - b.p.order)
    .map((x) => x.p);
}
