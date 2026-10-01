// 名单解析：把从 Excel、Word、微信里复制来的名单拆成 { name, title, unit, side }。
// 支持的写法：
//   张三<Tab>局长<Tab>财政局          （从 Excel 复制，最常见）
//   张三，局长，财政局 / 张三、局长      （中英文逗号、顿号、分号）
//   张 三  局长  财政局               （空格分隔；两字名中间常加空格对齐，会自动合并）
// 前几行里如果有"姓名 职务 单位"这样的表头，按表头识别列，表头上面的标题行跳过；第四列"主/客"用于会谈排座。
// 没有表头时，第一列是"1、2、3"这样的序号会自动去掉。

const HEADER = {
  name: /^(姓名|名字|人员|领导|参会人员|出席人员|参会领导|出席领导|嘉宾|嘉宾姓名|领导姓名)$/,
  title: /^(职务|职位|职称|头衔|职级)$/,
  unit: /^(单位|部门|工作单位|所在单位)$/,
  side: /^(主客|主\/客|方|身份|类别|主方客方|主宾|宾主)$/,
};
// "姓 名""职务（职级）"这样的表头：去掉空格和括号里的说明再比
const headKey = (h) => String(h).replace(/[\s　]+/g, '').replace(/[(（][^)）]*[)）]/g, '');
const CJK1 = /^[一-鿿]$/;
const SERIAL = /^(\d{1,3}|[(（]?\d{1,3}[)）.、．]?)$/;
// 表格标题："XX会议参会人员名单"之类，没有表头时也要跳过
const TITLE_LINE = /(名单|名册|座次|安排|一览|参会|出席|会议|统计)/;

function splitLine(line) {
  if (line.includes('\t')) return line.split('\t').map((s) => s.trim());
  if (/[，,、;；|｜]/.test(line)) return line.split(/[，,、;；|｜]/).map((s) => s.trim());
  const parts = line.trim().split(/\s+/);
  // "张 三 局长"：前两段都是单个汉字，是被空格隔开的两字名
  if (parts.length >= 2 && CJK1.test(parts[0]) && CJK1.test(parts[1])) parts.splice(0, 2, parts[0] + parts[1]);
  return parts;
}

export function normalizeSide(v) {
  const s = String(v || '').trim();
  if (/^(客|客方|来宾|宾|对方|外方|客人)$/.test(s)) return 'guest';
  if (/^(主|主方|我方|东道主|中方)$/.test(s)) return 'host';
  return '';
}

/** "陈  平"→"陈平"（汉字之间的对齐空格去掉）；外文名里的空格保留一个。 */
export function cleanName(s) {
  return String(s || '').replace(/[\s　]+/g, ' ').trim().replace(/([一-鿿·])\s+(?=[一-鿿·])/g, '$1');
}

export function parseRoster(text) {
  let lines = String(text || '').split(/\r?\n/).map((l) => l.replace(/\u00a0/g, ' ')).filter((l) => l.trim());
  const warnings = [];
  if (!lines.length) return { people: [], warnings };
  let cols = { name: 0, title: 1, unit: 2, side: 3 };
  const headAt = lines.slice(0, 6).findIndex((l) => splitLine(l).some((h) => HEADER.name.test(headKey(h))));
  let start = 0;
  if (headAt >= 0) {
    const head = splitLine(lines[headAt]);
    cols = { name: -1, title: -1, unit: -1, side: -1 };
    head.forEach((h, i) => { for (const k of Object.keys(HEADER)) if (cols[k] < 0 && HEADER[k].test(headKey(h))) cols[k] = i; });
    start = headAt + 1;
  } else {
    while (start < Math.min(lines.length - 1, 2) && splitLine(lines[start]).filter(Boolean).length === 1 && TITLE_LINE.test(lines[start]) && [...lines[start].trim()].length > 6) start++;
  }
  lines = lines.slice(start);
  // 没有表头、第一列是序号：整列去掉
  const rows = lines.map(splitLine);
  const serial = headAt < 0 && rows.length && rows.filter((r) => r.length > 1 && SERIAL.test(r[0])).length >= Math.max(1, rows.length * 0.6);
  const people = [];
  const seen = new Map();
  rows.forEach((raw, i) => {
    const parts = serial && SERIAL.test(raw[0]) ? raw.slice(1) : raw;
    const pick = (k) => (cols[k] >= 0 && cols[k] < parts.length ? parts[cols[k]] : '');
    const name = cleanName(pick('name'));
    if (!name || SERIAL.test(name)) return;
    let unit = pick('unit');
    let side = normalizeSide(pick('side'));
    // 没有表头时，第三列也可能直接写了"主/客"
    if (!side && cols.side === 3 && normalizeSide(unit) && parts.length === 3) { side = normalizeSide(unit); unit = ''; }
    const person = { id: people.length, name, title: pick('title'), unit, side: side || 'host', order: people.length };
    if (seen.has(name)) warnings.push(`第 ${start + i + 1} 行的"${name}"和前面重名，请确认是不是重复粘贴了`);
    seen.set(name, true);
    people.push(person);
  });
  return { people, warnings };
}
