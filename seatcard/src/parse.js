// 名单解析：把从 Excel、Word、微信里复制来的名单拆成 { name, title, unit, side }。
// 支持的写法：
//   张三<Tab>局长<Tab>财政局          （从 Excel 复制，最常见）
//   张三，局长，财政局 / 张三、局长      （中英文逗号、顿号、分号）
//   张 三  局长  财政局               （空格分隔；两字名中间常加空格对齐，会自动合并）
// 第一行如果是"姓名 职务 单位"这样的表头，按表头识别列；第四列"主/客"用于会谈排座。

const HEADER = {
  name: /^(姓名|名字|人员|领导)$/,
  title: /^(职务|职位|职称|头衔|职级)$/,
  unit: /^(单位|部门|工作单位|所在单位)$/,
  side: /^(主客|主\/客|方|身份|类别|主方客方)$/,
};
const CJK1 = /^[一-鿿]$/;

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

export function cleanName(s) {
  return String(s || '').replace(/[\s　]+/g, '');
}

export function parseRoster(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.replace(/ /g, ' ')).filter((l) => l.trim());
  const warnings = [];
  if (!lines.length) return { people: [], warnings };
  let cols = { name: 0, title: 1, unit: 2, side: 3 };
  let start = 0;
  const head = splitLine(lines[0]);
  if (head.some((h) => HEADER.name.test(h))) {
    cols = { name: -1, title: -1, unit: -1, side: -1 };
    head.forEach((h, i) => { for (const k of Object.keys(HEADER)) if (cols[k] < 0 && HEADER[k].test(h)) cols[k] = i; });
    start = 1;
  }
  const people = [];
  const seen = new Map();
  for (let i = start; i < lines.length; i++) {
    const parts = splitLine(lines[i]);
    const pick = (k) => (cols[k] >= 0 && cols[k] < parts.length ? parts[cols[k]] : '');
    const name = cleanName(pick('name'));
    if (!name) continue;
    let unit = pick('unit');
    let side = normalizeSide(pick('side'));
    // 没有表头时，第三列也可能直接写了"主/客"
    if (!side && cols.side === 3 && normalizeSide(unit) && parts.length === 3) { side = normalizeSide(unit); unit = ''; }
    const person = { id: people.length, name, title: pick('title'), unit, side: side || 'host', order: people.length };
    if (seen.has(name)) warnings.push(`第 ${i + 1} 行的"${name}"和前面重名，请确认是不是重复粘贴了`);
    seen.set(name, true);
    people.push(person);
  }
  return { people, warnings };
}
