import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoster } from '../src/parse.js';
import { rankOf, sortByRank } from '../src/rank.js';
import { centerOrder, podium, facing, layoutRows, toCsv } from '../src/layout.js';
import { sheetLayout, PRESETS, fitFontSize, faceText, paginate, defaultMeasure } from '../src/cards.js';

const names = (seats) => seats.map((s) => s.person.name).join(' ');
const mk = (list) => list.map((name, i) => ({ id: i, name, title: '', unit: '', side: 'host', order: i }));

test('解析：Excel 粘贴、表头、逗号、空格分隔的两字名', () => {
  const { people } = parseRoster('姓名\t职务\t单位\n张三\t局长\t财政局\n李四\t副局长\t财政局\n');
  assert.deepEqual(people.map((p) => [p.name, p.title, p.unit]), [['张三', '局长', '财政局'], ['李四', '副局长', '财政局']]);
  const b = parseRoster('王五，处长，办公室\n赵 六  科长  办公室\n欧阳娜娜、主任');
  assert.deepEqual(b.people.map((p) => [p.name, p.title, p.unit]), [['王五', '处长', '办公室'], ['赵六', '科长', '办公室'], ['欧阳娜娜', '主任', '']]);
});

test('解析：表头列顺序不同、主客列、重名提醒', () => {
  const { people, warnings } = parseRoster('单位\t姓名\t主客\t职务\n甲公司\t张三\t客\t总经理\n乙局\t李四\t主\t局长\n乙局\t张三\t主\t科长');
  assert.deepEqual(people.map((p) => [p.name, p.title, p.unit, p.side]), [
    ['张三', '总经理', '甲公司', 'guest'], ['李四', '局长', '乙局', 'host'], ['张三', '科长', '乙局', 'host']]);
  assert.equal(warnings.length, 1);
  const noHead = parseRoster('张三\t总经理\t客');
  assert.equal(noHead.people[0].side, 'guest');
  assert.equal(noHead.people[0].unit, '');
});

test('职务分档：地方领导、部门层级、正副、其他', () => {
  const tier = (t) => rankOf(t).label;
  assert.equal(tier('市委书记'), '地方书记');
  assert.equal(tier('副市长'), '地方副职');
  assert.equal(tier('常务副县长'), '地方副职');
  assert.equal(tier('县委副书记'), '地方副书记');
  assert.equal(tier('市人大常委会主任'), '地方正职');
  assert.equal(tier('市纪委书记'), '地方副职');
  assert.equal(tier('党委书记'), '书记');
  assert.equal(tier('党组书记、局长'), '书记');
  assert.equal(tier('局长'), '正职·局');
  assert.equal(tier('党组成员、副局长'), '副职·局');
  assert.equal(tier('处长'), '正职·处');
  assert.equal(tier('副科长'), '副职·科');
  assert.equal(tier('办公室主任'), '正职');
  assert.equal(tier('副总经理'), '副职');
  assert.equal(tier('总经理'), '正职');
  assert.equal(tier('销售总监'), '其他职务');
  assert.equal(tier('部门经理'), '其他职务');
  assert.equal(tier('纪委书记'), '副职');
  for (const t of ['工会主席', '秘书长', '副主任科员', '局长助理']) assert.equal(tier(t), '其他职务', t);
  assert.equal(tier(''), '未识别');
  assert.equal(tier('教授'), '未识别');
  assert.equal(tier('副处长'), '副职·处', '副处长是职务，不是写明的副处级');
  assert.equal(tier('调研员（正处级）'), '正处级');
});

test('按职务排序：副市长在局长前，局 > 处 > 科，同单位书记在前，同档按粘贴顺序或单位顺序', () => {
  const ppl = [
    { name: '甲', title: '副局长', unit: '财政局' }, { name: '乙', title: '局长', unit: '财政局' },
    { name: '丙', title: '副局长', unit: '教育局' }, { name: '丁', title: '党组书记', unit: '财政局' },
    { name: '戊', title: '科员', unit: '教育局' }, { name: '己', title: '副市长', unit: '市政府' },
    { name: '庚', title: '预算科科长', unit: '财政局' },
  ].map((p, i) => ({ ...p, order: i }));
  const order = (opts) => sortByRank(ppl, opts).map((p) => p.name).join('');
  assert.equal(order(), '己丁乙甲丙庚戊');
  assert.equal(order({ unitOrder: ['教育局', '财政局'] }), '己丁乙丙甲庚戊');
  assert.equal(order({ partyFirst: false }), '己乙丁甲丙庚戊');
});

test('主席台：以左为尊，台下看 7 5 3 1 2 4 6；双数 5 3 1 2 4 6', () => {
  const seven = podium(mk(['1', '2', '3', '4', '5', '6', '7']));
  assert.equal(names(seven.rows[0].seats), '7 5 3 1 2 4 6');
  const six = podium(mk(['1', '2', '3', '4', '5', '6']));
  assert.equal(names(six.rows[0].seats), '5 3 1 2 4 6');
  // 就座者视角：2 号永远在 1 号左手
  assert.deepEqual(centerOrder(4), [2, 1, 3, 0]);
  assert.deepEqual(centerOrder(1), [0]);
  assert.deepEqual(centerOrder(2), [1, 0]);
});

test('主席台：以右为尊左右对调；超过每排人数时分排', () => {
  const r = podium(mk(['1', '2', '3', '4', '5']), { rule: 'right' });
  assert.equal(names(r.rows[0].seats), '4 2 1 3 5');
  const two = podium(mk(['1', '2', '3', '4', '5', '6', '7', '8']), { perRow: 5 });
  assert.equal(two.rows.length, 2);
  assert.equal(names(two.rows[0].seats), '5 3 1 2 4');
  assert.equal(names(two.rows[1].seats), '8 6 7');
  assert.deepEqual(two.rows[1].seats.map((s) => s.rank), [7, 5, 6]);
});

test('会谈：客方面门；对齐时 1 号对 1 号、2 号对 2 号', () => {
  const hosts = mk(['主1', '主2', '主3', '主4']);
  const guests = mk(['客1', '客2', '客3', '客4']);
  const aligned = facing(hosts, guests, { alignFirst: true });
  assert.deepEqual(aligned.near.map((s) => s.x), aligned.far.map((s) => s.x));
  aligned.near.forEach((s, i) => assert.equal(s.person.name.slice(1), aligned.far[i].person.name.slice(1)));
  // 不对齐：各自按自己的朝向，客方 2 号在客方 1 号左手（从门口看在右边）
  const own = facing(hosts, guests, { alignFirst: false });
  const g1 = own.far.find((s) => s.person.name === '客1').x;
  const g2 = own.far.find((s) => s.person.name === '客2').x;
  const h1 = own.near.find((s) => s.person.name === '主1').x;
  const h2 = own.near.find((s) => s.person.name === '主2').x;
  assert.ok(h2 < h1, '主方 2 号在主方 1 号左手（从门口看在左边）');
  assert.ok(g2 > g1, '客方面门，2 号在 1 号左手，从门口看在右边');
});

test('导出 CSV：带 BOM，按排和座位输出', () => {
  const rows = layoutRows(podium(mk(['张三', '李四', '王五'])));
  assert.deepEqual(rows.map((r) => [r.seat, r.rank, r.name]), [[1, 3, '王五'], [2, 1, '张三'], [3, 2, '李四']]);
  const csv = toCsv(rows);
  assert.ok(csv.startsWith('\ufeff排,座位（从台下看，从左数）'));
  assert.ok(csv.includes('第1排,2,1,张三'));
});

test('桌签版式：各预设都放得进 A4，台卡小号一页两张', () => {
  for (const [key, p] of Object.entries(PRESETS)) {
    const l = sheetLayout(p);
    assert.ok(l.slots.length >= 1, key);
    for (const s of l.slots) {
      assert.ok(s.x >= 0 && s.y >= 0 && s.x + l.sheet.w <= l.page.w + 1e-9 && s.y + l.sheet.h <= l.page.h + 1e-9, key);
    }
  }
  assert.equal(sheetLayout(PRESETS['a4-fold2']).page.landscape, true);
  assert.equal(sheetLayout(PRESETS['card-180x70']).slots.length, 2);
  assert.deepEqual(sheetLayout(PRESETS['a4-fold3']).faces.map((f) => [f.flip, f.blank]), [[true, false], [false, false], [false, true]]);
  assert.throws(() => sheetLayout({ faceW: 400, faceH: 100, faces: 2 }));
  assert.equal(paginate(mk(['a', 'b', 'c']), 2).length, 2);
});

test('字号：长名字自动缩小，不会超出版心；两字名加宽字距', () => {
  const face = { y: 0, h: 105 };
  const short = faceText({ name: '张三' }, face, { faceW: 297 });
  const long = faceText({ name: '阿卜杜热合曼·买买提' }, face, { faceW: 297 });
  assert.ok(long.nameSize < short.nameSize);
  const usable = 297 * 0.84;
  const n = [...long.name].length;
  assert.ok(long.nameSize * (defaultMeasure(long.name) + long.spacing * (n - 1)) <= usable + 1e-6);
  assert.ok(short.spacing > long.spacing);
  assert.ok(fitFontSize('王', { boxW: 100, boxH: 30 }) === 30, '单字名受高度限制');
  const withSub = faceText({ name: '张三', title: '局长' }, face, { faceW: 297, sub: 'title' });
  assert.ok(withSub.subSize > 0 && withSub.subBaseline > withSub.nameBaseline);
  assert.ok(withSub.subBaseline < face.h);
});

test('解析：表格标题行、序号列、带空格的表头', () => {
  const a = parseRoster('2026年经济形势分析会参会人员名单\n序号\t姓 名\t职务（职级）\t单位\n1\t王建华\t副市长\t市政府\n2\t陈  平\t局长\t教育局');
  assert.deepEqual(a.people.map((p) => [p.name, p.title, p.unit]), [['王建华', '副市长', '市政府'], ['陈平', '局长', '教育局']]);
  const b = parseRoster('全市安全生产工作会议出席领导名单\n1\t王建华\t副市长\n2\t李明\t局长\n3、\t赵国强\t处长');
  assert.deepEqual(b.people.map((p) => [p.name, p.title]), [['王建华', '副市长'], ['李明', '局长'], ['赵国强', '处长']]);
  const c = parseRoster('张三\n李四');
  assert.deepEqual(c.people.map((p) => p.name), ['张三', '李四'], '一列名字不受影响');
});
