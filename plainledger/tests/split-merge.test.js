import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sharesOf, computeBalances, settleUp, memberSummary, validateSplit } from '../src/split.js';
import { mergeCollection, mergeLedgers, buildLedger, encryptJson, decryptJson, isEncrypted } from '../src/merge.js';

const tx = (over) => ({ id: over.id, direction: 'expense', amount: 0, deleted: false, updatedAt: 1, ...over });

test('equal split distributes remainder cents deterministically', () => {
  const s = sharesOf(100, { mode: 'equal', members: ['a', 'b', 'c'] });
  assert.deepEqual(s, { a: 33.34, b: 33.33, c: 33.33 });
  assert.equal(Object.values(s).reduce((x, y) => x + y, 0).toFixed(2), '100.00');
});

test('ratio split sums exactly to amount', () => {
  const s = sharesOf(10, { mode: 'ratio', shares: { a: 1, b: 1, c: 1 } });
  assert.equal(Object.values(s).reduce((x, y) => x + y, 0).toFixed(2), '10.00');
  assert.deepEqual(validateSplit(10, { mode: 'exact', shares: { a: 5, b: 5.01 } }).ok, true);
  assert.deepEqual(validateSplit(10, { mode: 'exact', shares: { a: 5, b: 6 } }).ok, false);
});

test('balances and settlement: three roommates', () => {
  const txs = [
    tx({ id: 't1', amount: 300, payerId: 'a', split: { mode: 'equal', members: ['a', 'b', 'c'] } }),
    tx({ id: 't2', amount: 90, payerId: 'b', split: { mode: 'equal', members: ['a', 'b', 'c'] } }),
    tx({ id: 't3', amount: 50, payerId: 'c', split: { mode: 'exact', shares: { a: 50 } } }),
    tx({ id: 't4', amount: 999, payerId: 'a', split: null }), // 不分摊，不计入
    tx({ id: 't5', amount: 40, payerId: 'a', direction: 'income', split: { mode: 'equal', members: ['a', 'b'] } }), // 收入不计入
  ];
  const bal = computeBalances(txs);
  // a paid 300, owes 100+30+50 = 180 -> +120 ; b paid 90 owes 130 -> -40 ; c paid 50 owes 130 -> -80
  assert.deepEqual(bal, { a: 120, b: -40, c: -80 });
  const transfers = settleUp(bal);
  assert.deepEqual(transfers, [{ from: 'c', to: 'a', amount: 80 }, { from: 'b', to: 'a', amount: 40 }]);
  const after = computeBalances(txs, transfers.map((t) => ({ ...t, deleted: false })));
  assert.ok(Object.values(after).every((v) => Math.abs(v) < 0.005));
  const summary = memberSummary(txs, [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }]);
  assert.equal(summary.find((r) => r.id === 'a').net, 120);
});

test('mergeCollection keeps newer records and respects tombstones', () => {
  const local = [{ id: '1', v: 'L', updatedAt: 10 }, { id: '2', v: 'L', updatedAt: 10 }, { id: '3', v: 'L', updatedAt: 30, deleted: true }];
  const incoming = [{ id: '1', v: 'I', updatedAt: 20 }, { id: '2', v: 'I', updatedAt: 5 }, { id: '3', v: 'I', updatedAt: 20 }, { id: '4', v: 'I', updatedAt: 1 }];
  const { merged, stats } = mergeCollection(local, incoming);
  const byId = Object.fromEntries(merged.map((x) => [x.id, x]));
  assert.equal(byId['1'].v, 'I');
  assert.equal(byId['2'].v, 'L');
  assert.equal(byId['3'].deleted, true, 'newer tombstone wins over older resurrection');
  assert.equal(byId['4'].v, 'I');
  assert.deepEqual(stats, { added: 1, updated: 1, unchanged: 2, conflicts: 0 });
});

test('mergeLedgers collapses fingerprint duplicates imported on two devices', () => {
  const L = buildLedger({ transactions: [tx({ id: 'x1', fingerprint: 'wechat:1', amount: 10, category: '餐饮', updatedAt: 100 })] });
  const R = buildLedger({ transactions: [tx({ id: 'y1', fingerprint: 'wechat:1', amount: 10, category: '', split: { mode: 'equal', members: ['a', 'b'] }, payerId: 'a', updatedAt: 200 })] });
  const { ledger, report } = mergeLedgers(L, R);
  const live = ledger.transactions.filter((t) => !t.deleted);
  assert.equal(live.length, 1);
  assert.equal(live[0].id, 'x1');
  assert.equal(live[0].category, '餐饮');
  assert.deepEqual(live[0].split, { mode: 'equal', members: ['a', 'b'] }, 'split info from the losing copy is preserved');
  assert.equal(report.fingerprintDuplicates, 1);
});

test('encrypt/decrypt roundtrip with WebCrypto', async () => {
  const ledger = buildLedger({ transactions: [tx({ id: 'e1', amount: 1 })] });
  const blob = await encryptJson(ledger, 'secret-123');
  assert.ok(isEncrypted(blob));
  const back = await decryptJson(blob, 'secret-123');
  assert.equal(back.transactions[0].id, 'e1');
  await assert.rejects(() => decryptJson(blob, 'wrong'));
});
