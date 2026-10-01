import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { roundTable, roleName } from '../src/round.js';
import { importFile, ImportError, readZip, xlsxRows, docxRows } from '../src/importers.js';
import {
  newMeeting, addFromText, peopleInOrder, swapPeople, movePerson, addPerson, removePeople,
  layoutOf, changedSincePrint, markPrinted, checks, setType, duplicateMeeting,
} from '../src/meeting.js';
import { createStore, memoryStorage } from '../src/store.js';
import { History } from '../src/history.js';

const P = (name) => ({ id: name, name, title: '', unit: '', side: 'host' });
const bySeat = (layout) => Object.fromEntries(layout.seats.filter((s) => s.person).map((s) => [s.person.name, s.seat]));

// ---------- 一个最小的 zip 打包器，用来生成测试用的 xlsx / docx ----------
function crc32(buf) {
  let c = ~0;
  for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); }
  return ~c >>> 0;
}
function zip(files) {
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = enc.encode(content);
    const data = deflateRawSync(raw);
    const nameB = enc.encode(name);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(8, 8);
    h.writeUInt32LE(crc32(raw), 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(raw.length, 22); h.writeUInt16LE(nameB.length, 26);
    locals.push(h, nameB, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(8, 10);
    c.writeUInt32LE(crc32(raw), 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(raw.length, 24); c.writeUInt16LE(nameB.length, 28);
    c.writeUInt32LE(offset, 42);
    centrals.push(c, nameB);
    offset += 30 + nameB.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, end]));
}

test('圆桌主副陪：主陪面门、副陪对面，主宾在主陪右手，三宾在副陪右手', () => {
  const l = roundTable([P('主陪'), P('副陪'), P('三陪')], [P('主宾'), P('副主宾'), P('三宾'), P('四宾')], { size: 10 });
  const s = bySeat(l);
  assert.equal(l.n, 10);
  assert.equal(s['主陪'], 0);
  assert.equal(s['副陪'], 5);
  assert.equal(s['主宾'], 9, '主陪面门，右手在图上左侧（逆时针）');
  assert.equal(s['副主宾'], 1);
  assert.equal(s['三宾'], 4, '副陪背门，右手在图上右侧');
  assert.equal(s['四宾'], 6);
  assert.equal(s['三陪'], 8, '其余从靠近主位的空座起');
  assert.equal(l.seats.filter((x) => !x.person).length, 3);
});

test('圆桌：以左为尊对调；主人居中坐法；超过桌位自动加座；称呼', () => {
  const left = bySeat(roundTable([P('主陪')], [P('主宾'), P('副主宾')], { size: 8, rule: 'left' }));
  assert.equal(left['主宾'], 1);
  assert.equal(left['副主宾'], 7);
  const single = bySeat(roundTable([P('主人'), P('陪同')], [P('宾1'), P('宾2'), P('宾3')], { size: 6, scheme: 'single' }));
  assert.deepEqual([single['主人'], single['宾1'], single['宾2'], single['宾3'], single['陪同']], [0, 5, 1, 4, 2]);
  const big = roundTable(Array.from({ length: 7 }, (_, i) => P(`h${i}`)), Array.from({ length: 6 }, (_, i) => P(`g${i}`)), { size: 10 });
  assert.equal(big.n, 13);
  assert.ok(big.overflow);
  assert.equal(roleName('host', 1), '副陪');
  assert.equal(roleName('guest', 1), '副主宾');
  assert.equal(roleName('host', 0, 'single'), '主人');
});

test('导入 Excel：共享字符串、内联字符串、数字、空单元格、第一张有内容的表', async () => {
  const sheet = (rows) => `<worksheet><sheetData>${rows}</sheetData></worksheet>`;
  const files = {
    'xl/workbook.xml': '<workbook><sheets><sheet name="空" sheetId="1" r:id="rId1"/><sheet name="名单" sheetId="2" r:id="rId2"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="worksheets/sheet2.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet(''),
    'xl/worksheets/sheet2.xml': sheet(
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>'
      + '<row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" t="inlineStr"><is><t>局长</t></is></c><c r="C2" t="s"><v>4</v></c></row>'
      + '<row r="3"><c r="A3" t="s"><v>5</v></c><c r="C3" t="s"><v>4</v></c></row>'
      + '<row r="4"><c r="A4" t="s"><v>6</v></c><c r="B4"><v>2026</v></c></row>'),
    'xl/sharedStrings.xml': '<sst><si><t>姓名</t></si><si><t>职务</t></si><si><t>单位</t></si><si><r><t>张</t></r><r><t>三</t></r></si>'
      + '<si><t>财政局 &amp; 税务局</t></si><si><t>李四</t><rPh><t>リ</t></rPh></si><si><t>王五</t></si></sst>',
  };
  const rows = xlsxRows(await readZip(zip(files)));
  assert.deepEqual(rows, [['姓名', '职务', '单位'], ['张三', '局长', '财政局 & 税务局'], ['李四', '', '财政局 & 税务局'], ['王五', '2026']]);
  const { text, from } = await importFile('参会名单.xlsx', zip(files));
  assert.equal(from, 'Excel');
  assert.equal(text.split('\n')[1], '张三\t局长\t财政局 & 税务局');
});

test('导入 Word：取第一张两行以上的表格，单元格多段落合并', async () => {
  const p = (t) => `<w:p><w:r><w:t>${t}</w:t></w:r></w:p>`;
  const tc = (...ps) => `<w:tc>${ps.map(p).join('')}</w:tc>`;
  const doc = `<w:document><w:body>${p('关于召开会议的通知')}<w:tbl><w:tr>${tc('附件')}</w:tr></w:tbl>`
    + `<w:tbl><w:tr>${tc('姓名')}${tc('职务')}</w:tr><w:tr>${tc('赵六')}${tc('党组书记', '局长')}</w:tr></w:tbl></w:body></w:document>`;
  const rows = docxRows(await readZip(zip({ 'word/document.xml': doc })));
  assert.deepEqual(rows, [['姓名', '职务'], ['赵六', '党组书记 局长']]);
  const noTable = docxRows(await readZip(zip({ 'word/document.xml': `<w:document><w:body>${p('张三 局长')}${p('李四 副局长')}</w:body></w:document>` })));
  assert.deepEqual(noTable, [['张三 局长'], ['李四 副局长']]);
});

test('导入 CSV（GBK）和老格式提示', async () => {
  const gbk = Uint8Array.from(Buffer.from('d5c5c8fd2cbed6b3a40d0ac0eecbc42cb8b1bed6b3a4', 'hex'));
  const { text } = await importFile('名单.csv', gbk);
  assert.equal(text, '张三\t局长\n李四\t副局长');
  await assert.rejects(importFile('名单.xls', new Uint8Array(4)), (e) => e instanceof ImportError && /另存为/.test(e.message));
  await assert.rejects(importFile('坏文件.xlsx', new Uint8Array(40)), ImportError);
});

test('会议：粘贴替换、追加不重复、自动排序、手动调整后追加放最后', () => {
  const m = newMeeting('podium');
  addFromText(m, '张三\t副局长\n李四\t局长');
  assert.deepEqual(peopleInOrder(m).map((p) => p.name), ['李四', '张三']);
  const r = addFromText(m, '王五\t局长\n李四\t局长', 'append');
  assert.deepEqual(r.skipped, ['李四']);
  assert.deepEqual(peopleInOrder(m).map((p) => p.name), ['李四', '王五', '张三'], '自动排序状态下追加会重新排');
  movePerson(m, peopleInOrder(m)[2].id, 0);
  addFromText(m, '赵六\t局长', 'append');
  assert.deepEqual(peopleInOrder(m).map((p) => p.name), ['张三', '李四', '王五', '赵六'], '手动调过就加在最后');
  const extra = addPerson(m, { name: '钱七' }, peopleInOrder(m)[0].id);
  assert.equal(peopleInOrder(m)[1].id, extra.id);
  removePeople(m, [extra.id]);
  assert.equal(m.people.length, 4);
});

test('会议：拖动互换（跨主客连同主客互换）、改类型、复制、提醒', () => {
  const m = newMeeting('facing');
  addFromText(m, '甲\t区长\t\t主\n乙\t副区长\t\t主\n丙\t董事长\t\t客');
  const [a, , c] = peopleInOrder(m);
  swapPeople(m, a.id, c.id);
  assert.equal(m.people.find((p) => p.name === '甲').side, 'guest');
  assert.equal(m.people.find((p) => p.name === '丙').side, 'host');
  assert.equal(layoutOf(m).kind, 'facing');
  setType(m, 'round');
  assert.equal(m.settings.rule, 'right', '宴请默认以右为尊');
  assert.equal(layoutOf(m).kind, 'round');
  setType(m, 'podium');
  assert.equal(m.settings.rule, 'left');
  const copy = duplicateMeeting(m);
  assert.notEqual(copy.id, m.id);
  assert.match(copy.title, /副本/);
  const n = newMeeting('facing');
  addFromText(n, '甲\t局长\n甲\t局长\n\t科长');
  assert.ok(checks(n).some((x) => /客方/.test(x)));
});

test('会议：只重打改过的桌签', () => {
  const m = newMeeting('podium');
  addFromText(m, '张三\t局长\n李四\t副局长');
  assert.equal(changedSincePrint(m).length, 2);
  markPrinted(m, peopleInOrder(m));
  assert.equal(changedSincePrint(m).length, 0);
  m.people[0].title = '党组书记、局长';
  assert.equal(changedSincePrint(m).length, 0, '不印职务时改职务不用重打');
  m.settings.card.sub = 'title';
  assert.equal(changedSincePrint(m).length, 2, '改成印职务后都要重打');
  markPrinted(m, peopleInOrder(m));
  m.people[1].name = '李思';
  assert.deepEqual(changedSincePrint(m).map((p) => p.name), ['李思']);
});

test('本机保存：列出、读取、删除、备份导入（新的为准）', () => {
  const store = createStore(memoryStorage());
  const a = newMeeting('podium', { title: '全局工作会' });
  addFromText(a, '张三\t局长');
  store.save(a);
  const b = newMeeting('round', { title: '接待宴请' });
  store.save(b);
  assert.deepEqual(store.list().map((x) => x.title).sort(), ['全局工作会', '接待宴请']);
  assert.equal(store.list().find((x) => x.id === a.id).count, 1);
  const backup = store.exportAll();
  const other = createStore(memoryStorage());
  assert.equal(other.importAll(backup), 2);
  assert.equal(other.importAll(backup), 0, '已有且不更旧的不覆盖');
  store.remove(b.id);
  assert.equal(store.list().length, 1);
  assert.equal(store.load(b.id), null);
  assert.throws(() => store.importAll('{"app":"other"}'));
  store.savePrefs({ card: { font: 'hei' } });
  assert.equal(store.prefs().card.font, 'hei');
});

test('撤销和重做', () => {
  const h = new History(3);
  let state = { n: 0 };
  for (let i = 1; i <= 4; i++) { h.record(state); state = { n: i }; }
  state = h.undo(state); assert.equal(state.n, 3);
  state = h.undo(state); assert.equal(state.n, 2);
  state = h.redo(state); assert.equal(state.n, 3);
  assert.ok(h.canUndo && h.canRedo);
  h.record(state); state = { n: 9 };
  assert.ok(!h.canRedo, '新改动后不能再重做');
  assert.equal(h.undo(state).n, 3);
  assert.equal(new History().undo({}), null);
});

test('猜会议名称、补齐老数据、圆桌导出座次表', async () => {
  const { guessTitle, normalizeMeeting } = await import('../src/meeting.js');
  const { layoutRows, toCsv } = await import('../src/layout.js');
  assert.equal(guessTitle('', '全市安全生产会议参会人员名单.xlsx'), '全市安全生产会议');
  assert.equal(guessTitle('2026年经济形势分析会出席领导名单\n姓名\t职务', 'x.xlsx'), '2026年经济形势分析会');
  assert.equal(guessTitle('姓名\t职务', '工作簿1.xlsx'), '');
  assert.equal(guessTitle('', '名单.xlsx'), '');
  const m = normalizeMeeting({ id: 'old', type: 'facing', people: [{ id: 'a', name: '张三' }], settings: { rule: 'right' } });
  assert.equal(m.settings.card.preset, 'a4-fold2');
  assert.equal(m.settings.rule, 'right');
  assert.deepEqual(m.order, ['a']);
  assert.equal(m.people[0].side, 'host');
  const r = newMeeting('round');
  addFromText(r, '甲\t区长\t\t主\n乙\t董事长\t\t客');
  const rows = layoutRows(layoutOf(r));
  assert.deepEqual(rows.map((x) => [x.name, x.seat, x.rank]), [['甲', 1, '主陪'], ['乙', 10, '主宾']]);
  assert.match(toCsv(rows, 'round'), /顺时针/);
});

test('姓名清理：汉字间空格去掉，外文名保留空格', async () => {
  const { cleanName } = await import('../src/parse.js');
  assert.equal(cleanName(' 陈　 平 '), '陈平');
  assert.equal(cleanName('阿依古丽 · 买买提'), '阿依古丽·买买提');
  assert.equal(cleanName('John   Smith'), 'John Smith');
});
