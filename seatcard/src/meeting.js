// 一场会议的数据：名单、位次、座次和桌签设置、哪些人的桌签已经打印过。
import { parseRoster } from './parse.js';
import { sortByRank } from './rank.js';
import { podium, facing } from './layout.js';
import { roundTable } from './round.js';

export const TYPES = {
  podium: { label: '主席台', hint: '大会、报告会：领导坐一排或几排，面向台下' },
  facing: { label: '会见会谈', hint: '会议桌两边对坐：客方面门，主方背门' },
  round: { label: '宴请圆桌', hint: '一张圆桌：主陪面门，主宾在主陪右手' },
};

export const DEFAULT_CARD = {
  preset: 'a4-fold2', customW: 200, customH: 90, font: 'song', bold: true, color: '#000000', sub: 'none', widen: true, guides: true,
};

let seq = 0;
export function uid(prefix = 'm') {
  seq = (seq + 1) % 1e6;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 没起名字的会议在列表里显示成"未命名的主席台会议"；座次图上不印。 */
export function displayTitle(m) {
  return (m.title || '').trim() || `未命名的${TYPES[m.type]?.label || ''}会议`;
}

export function newMeeting(type = 'podium', { title = '', card = DEFAULT_CARD } = {}) {
  const now = Date.now();
  return {
    id: uid('m'), title, type, date: today(),
    people: [], order: [], sortMode: 'auto', unitOrder: '',
    settings: {
      rule: type === 'round' ? 'right' : 'left', perRow: 0, alignFirst: true, view: 'front',
      tableSize: 10, scheme: 'pair', partyFirst: true, card: { ...DEFAULT_CARD, ...card },
    },
    printed: {}, createdAt: now, updatedAt: now,
  };
}

/** 读进来的会议补齐缺的字段（老版本存的、备份文件里的），保证界面不出错。 */
export function normalizeMeeting(raw) {
  const base = newMeeting(TYPES[raw?.type] ? raw.type : 'podium');
  const m = { ...base, ...raw };
  m.type = base.type;
  m.settings = { ...base.settings, ...(raw?.settings || {}) };
  m.settings.card = { ...DEFAULT_CARD, ...(raw?.settings?.card || {}) };
  m.people = Array.isArray(raw?.people) ? raw.people.filter((p) => p && p.id).map((p) => ({ name: '', title: '', unit: '', side: 'host', ...p })) : [];
  m.order = Array.isArray(raw?.order) ? raw.order : m.people.map((p) => p.id);
  m.printed = raw?.printed && typeof raw.printed === 'object' ? raw.printed : {};
  m.title = String(m.title || '');
  return m;
}

/**
 * 从文件名或表格标题猜会议名称："全市安全生产会议参会人员名单.xlsx" → "全市安全生产会议"。
 * 猜不出来返回空字符串。
 */
export function guessTitle(text = '', fileName = '') {
  const strip = (s) => String(s).replace(/\.[a-z0-9]+$/i, '')
    .replace(/[（(]?(\d{1,2}月\d{1,2}日|定稿|终稿|最终版|修改稿|\d+)[)）]?$/g, '')
    .replace(/(的)?(参会|出席|与会|参加)?(人员|领导|嘉宾)?(名单|名册|座次表|座次安排|座次图|安排表|一览表|统计表|签到表)$/, '')
    .trim();
  const first = String(text).split(/\r?\n/).find((l) => l.trim()) || '';
  const cells = first.split('\t').map((c) => c.trim()).filter(Boolean);
  if (cells.length === 1 && /(名单|名册|座次|安排)/.test(cells[0])) {
    const t = strip(cells[0]);
    if (t.length >= 4) return t;
  }
  if (fileName && /(名单|名册|座次|会|宴|座谈|接待)/.test(fileName)) {
    const t = strip(fileName);
    if (t.length >= 4 && !/^(新建|工作簿|Book|文档)/i.test(t)) return t;
  }
  return '';
}

export function duplicateMeeting(m) {
  const copy = JSON.parse(JSON.stringify(m));
  const now = Date.now();
  return { ...copy, id: uid('m'), title: `${displayTitle(m)}（副本）`, date: today(), printed: {}, createdAt: now, updatedAt: now };
}

/** 换会议类型时，宴请默认以右为尊，其余以左为尊（只在用户没改过时跟着变）。 */
export function setType(m, type) {
  const defaultRule = (t) => (t === 'round' ? 'right' : 'left');
  if (m.settings.rule === defaultRule(m.type)) m.settings.rule = defaultRule(type);
  m.type = type;
}

export function peopleInOrder(m) {
  const byId = new Map(m.people.map((p) => [p.id, p]));
  const out = m.order.map((id) => byId.get(id)).filter(Boolean);
  // 保险：不在 order 里的人补在最后
  for (const p of m.people) if (!m.order.includes(p.id)) out.push(p);
  return out;
}

function unitList(m) {
  return String(m.unitOrder || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export function autoSort(m) {
  const list = m.people.map((p, i) => ({ ...p, order: i }));
  m.order = sortByRank(list, { unitOrder: unitList(m), partyFirst: m.settings.partyFirst }).map((p) => p.id);
  m.sortMode = 'auto';
}

/**
 * 把粘贴或导入的文字加进名单。mode：'replace' 换掉原名单，'append' 加在后面。
 * 返回 { added, warnings, skipped }；重名（已在名单里）的人不重复加。
 */
export function addFromText(m, text, mode = 'replace') {
  const { people, warnings } = parseRoster(text);
  if (mode === 'replace') { m.people = []; m.order = []; m.printed = {}; }
  const existing = new Set(m.people.map((p) => p.name));
  const added = [];
  const skipped = [];
  for (const p of people) {
    if (existing.has(p.name)) { skipped.push(p.name); continue; }
    existing.add(p.name);
    const person = { id: uid('p'), name: p.name, title: p.title, unit: p.unit, side: p.side };
    m.people.push(person);
    added.push(person);
  }
  if (mode === 'replace' || m.sortMode === 'auto') autoSort(m);
  else m.order.push(...added.map((p) => p.id));
  return { added, warnings, skipped };
}

export function addPerson(m, fields = {}, afterId = null) {
  const person = { id: uid('p'), name: '', title: '', unit: '', side: 'host', ...fields };
  m.people.push(person);
  const i = afterId ? m.order.indexOf(afterId) : -1;
  if (i >= 0) m.order.splice(i + 1, 0, person.id); else m.order.push(person.id);
  // 不改排序方式：自动排序时，填好职务后会自动排到该在的位置
  return person;
}

export function removePeople(m, ids) {
  const drop = new Set(ids);
  m.people = m.people.filter((p) => !drop.has(p.id));
  m.order = m.order.filter((id) => !drop.has(id));
  for (const id of ids) delete m.printed[id];
}

export function movePerson(m, id, toIndex) {
  const from = m.order.indexOf(id);
  if (from < 0) return;
  m.order.splice(from, 1);
  m.order.splice(Math.max(0, Math.min(toIndex, m.order.length)), 0, id);
  m.sortMode = 'manual';
}

/** 座次图上把两个人拖到一起：互换位次；分属主客两方时连同主客一起互换。 */
export function swapPeople(m, idA, idB) {
  if (idA === idB) return;
  const a = m.order.indexOf(idA);
  const b = m.order.indexOf(idB);
  if (a < 0 || b < 0) return;
  [m.order[a], m.order[b]] = [m.order[b], m.order[a]];
  const pa = m.people.find((p) => p.id === idA);
  const pb = m.people.find((p) => p.id === idB);
  if (pa && pb && pa.side !== pb.side) [pa.side, pb.side] = [pb.side, pa.side];
  m.sortMode = 'manual';
}

export function layoutOf(m) {
  const list = peopleInOrder(m).filter((p) => p.name);
  const s = m.settings;
  if (m.type === 'podium') return podium(list, { rule: s.rule, perRow: Number(s.perRow) || 0 });
  const hosts = list.filter((p) => p.side !== 'guest');
  const guests = list.filter((p) => p.side === 'guest');
  if (m.type === 'facing') return facing(hosts, guests, { rule: s.rule, alignFirst: s.alignFirst });
  return roundTable(hosts, guests, { size: Number(s.tableSize) || 10, scheme: s.scheme, rule: s.rule });
}

/** 桌签上会印出来的内容；变了就说明需要重打。 */
export function cardSignature(p, card) {
  return [p.name, card.sub === 'title' ? p.title : card.sub === 'unit' ? p.unit : ''].join('|');
}

export function changedSincePrint(m) {
  return peopleInOrder(m).filter((p) => p.name && m.printed[p.id] !== cardSignature(p, m.settings.card));
}

export function markPrinted(m, people) {
  for (const p of people) m.printed[p.id] = cardSignature(p, m.settings.card);
}

/** 名单检查：给用户的提醒，不阻止操作。 */
export function checks(m) {
  const out = [];
  const list = peopleInOrder(m);
  const names = new Map();
  for (const p of list) {
    if (!p.name) continue;
    names.set(p.name, (names.get(p.name) || 0) + 1);
  }
  for (const [n, c] of names) if (c > 1) out.push(`"${n}"出现了 ${c} 次`);
  const blank = list.filter((p) => !p.name).length;
  if (blank) out.push(`有 ${blank} 行没填姓名，不会排进座次`);
  if (m.type !== 'podium' && list.length && !list.some((p) => p.side === 'guest')) out.push('还没有客方：在名单的"主/客"一列里选出客人');
  if (m.type === 'round' && list.filter((p) => p.name).length > (Number(m.settings.tableSize) || 10)) {
    out.push(`人数超过一桌 ${m.settings.tableSize} 人，已自动加座；人多时建议分桌`);
  }
  return out;
}
