import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseCsv, decodeBytes, detectSource, parseStatement, dedupe, parseAmount, normalizeTime } from '../src/csv.js';
import { categorizeAll, categorize, suggestRule } from '../src/rules.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = (name) => readFileSync(path.join(here, '..', 'samples', name));

test('parseCsv handles quotes, embedded commas and CRLF', () => {
  const rows = parseCsv('a,b,c\r\n"x, y","he said ""hi""",3\n');
  assert.deepEqual(rows, [['a', 'b', 'c'], ['x, y', 'he said "hi"', '3']]);
});

test('parseAmount strips currency symbols and commas', () => {
  assert.equal(parseAmount('¥1,234.50'), 1234.5);
  assert.equal(parseAmount('-300.00'), 300);
  assert.equal(parseAmount('12元'), 12);
  assert.ok(Number.isNaN(parseAmount('')));
});

test('normalizeTime accepts several formats', () => {
  assert.equal(normalizeTime('2026/8/5 9:03'), '2026-08-05 09:03:00');
  assert.equal(normalizeTime('2026-08-05'), '2026-08-05 00:00:00');
  assert.equal(normalizeTime('共20笔记录'), null);
});

test('wechat statement (UTF-8 BOM) parses, skips failed payments, keeps refunds', () => {
  const { text, encoding } = decodeBytes(sample('微信支付账单(20260801-20260831).csv'));
  assert.equal(encoding, 'utf-8');
  assert.equal(detectSource(text), 'wechat');
  const res = parseStatement(text);
  assert.equal(res.error, undefined);
  assert.equal(res.records.length, 19, '20 rows minus 1 failed payment');
  assert.equal(res.skipped.length, 1);
  const refund = res.records.find((r) => r.type === '退款');
  assert.equal(refund.direction, 'income');
  assert.equal(refund.isRefund, true);
  const expense = res.records.find((r) => r.counterparty === '美团外卖');
  assert.equal(expense.amount, 28.5);
  assert.equal(expense.direction, 'expense');
  assert.equal(expense.orderId, '4200002601010002', 'tab suffix stripped');
  const neutral = res.records.find((r) => r.type === '零钱提现');
  assert.equal(neutral.direction, 'neutral');
  assert.ok(res.records.every((r) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(r.time)));
});

test('alipay statement (GBK) parses with refund and neutral rows', () => {
  const { text, encoding } = decodeBytes(sample('支付宝交易明细(20260801-20260831).csv'));
  assert.equal(encoding, 'gbk');
  assert.equal(detectSource(text), 'alipay');
  const res = parseStatement(text);
  assert.equal(res.error, undefined);
  // 20 rows: one 交易关闭 skipped; 退款成功 row kept as refund income
  assert.equal(res.records.length, 19);
  const refund = res.records.find((r) => r.status === '退款成功');
  assert.equal(refund.isRefund, true);
  assert.equal(refund.direction, 'income');
  const salary = res.records.find((r) => r.rawCategory === '收入');
  assert.equal(salary.direction, 'income');
  assert.equal(salary.amount, 12000);
  const yeb = res.records.find((r) => r.item === '余额宝-转入');
  assert.equal(yeb.direction, 'neutral');
  // footer rows must not leak in
  assert.ok(!res.records.some((r) => /共\d+笔/.test(r.time)));
});

test('generic bank CSV maps 借贷标志 and negative amounts', () => {
  const { text } = decodeBytes(sample('某银行流水示例.csv'));
  assert.equal(detectSource(text), 'generic');
  const res = parseStatement(text);
  assert.equal(res.records.length, 4);
  const salary = res.records[0];
  assert.equal(salary.direction, 'income');
  assert.equal(salary.amount, 12000);
  assert.equal(res.records[1].direction, 'expense');
  assert.equal(res.records[1].amount, 1850);
  assert.equal(salary.time, '2026-08-05 00:00:00');
});

test('dedupe is idempotent across repeated imports and across alipay refund sharing an order id', () => {
  const { text } = decodeBytes(sample('微信支付账单(20260801-20260831).csv'));
  const a = parseStatement(text).records;
  const first = dedupe(a, []);
  assert.equal(first.fresh.length, 19);
  const again = dedupe(parseStatement(text).records, first.fresh.map((r) => r.fingerprint));
  assert.equal(again.fresh.length, 0);
  assert.equal(again.duplicates.length, 19);
  // alipay: refund row shares 交易订单号 with the original purchase -> same fingerprint would collapse them.
  const ali = parseStatement(decodeBytes(sample('支付宝交易明细(20260801-20260831).csv')).text).records;
  const mi = ali.filter((r) => r.counterparty === '小米有品');
  assert.equal(mi.length, 2);
  assert.notEqual(mi[0].fingerprint, mi[1].fingerprint, 'refund and purchase must not dedupe against each other');
});

test('categorization covers the majority of sample rows with sensible categories', () => {
  const w = parseStatement(decodeBytes(sample('微信支付账单(20260801-20260831).csv')).text).records;
  const a = parseStatement(decodeBytes(sample('支付宝交易明细(20260801-20260831).csv')).text).records;
  const all = [...w, ...a];
  const stats = categorizeAll(all);
  assert.ok(stats.rate >= 0.85, `categorized rate ${stats.rate}`);
  const by = (cp) => all.find((r) => r.counterparty.includes(cp)).category;
  assert.equal(by('瑞幸'), '餐饮');
  assert.equal(by('上海地铁'), '交通');
  assert.equal(by('国网上海电力'), '居住');
  assert.equal(by('爱奇艺'), '订阅会员');
  assert.equal(by('叮当快药'), '医疗');
  assert.equal(by('某某科技'), '工资');
  assert.equal(all.find((r) => r.type === '退款').category, '退款');
  assert.equal(all.find((r) => r.type === '微信红包').category, '人情');
});

test('user rules override defaults and suggestRule extracts a keyword', () => {
  const rec = { counterparty: '沙县小吃(南京路店)', item: '午餐', type: '商户消费', source: 'wechat', direction: 'expense' };
  assert.equal(categorize(rec).category, '餐饮');
  const rule = suggestRule(rec, '日用');
  assert.equal(rule.pattern, '沙县小吃');
  assert.equal(categorize(rec, [{ id: 'r1', ...rule }]).category, '日用');
});
