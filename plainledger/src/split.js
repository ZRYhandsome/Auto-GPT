// 素账 PlainLedger — 多人分摊与结算（Splitwise 式）

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * 计算一笔交易每个成员应承担的金额。
 * split: null | { mode: 'none' } | { mode: 'equal', members: [id] } | { mode: 'exact', shares: {id: amount} } | { mode: 'ratio', shares: {id: weight} }
 * 返回 {memberId: amount}（分摊到分，余数分给前几位，保证总和等于 amount）。
 */
export function sharesOf(amount, split) {
  if (!split || split.mode === 'none' || !amount) return {};
  const cents = Math.round(amount * 100);
  const out = {};
  if (split.mode === 'equal') {
    const ids = (split.members || []).filter(Boolean);
    if (!ids.length) return {};
    const base = Math.floor(cents / ids.length);
    let rem = cents - base * ids.length;
    ids.forEach((id) => { out[id] = (base + (rem-- > 0 ? 1 : 0)) / 100; });
    return out;
  }
  if (split.mode === 'exact') {
    for (const [id, v] of Object.entries(split.shares || {})) out[id] = round2(Number(v) || 0);
    return out;
  }
  if (split.mode === 'ratio') {
    const entries = Object.entries(split.shares || {}).filter(([, w]) => Number(w) > 0);
    const total = entries.reduce((s, [, w]) => s + Number(w), 0);
    if (!total) return {};
    let assigned = 0;
    entries.forEach(([id, w], i) => {
      let c = Math.floor((cents * Number(w)) / total);
      if (i === entries.length - 1) c = cents - assigned;
      assigned += c;
      out[id] = c / 100;
    });
    return out;
  }
  return {};
}

/** 校验精确分摊之和是否等于金额（容差 1 分）。 */
export function validateSplit(amount, split) {
  if (!split || split.mode !== 'exact') return { ok: true };
  const sum = Object.values(split.shares || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  const diff = round2(sum - amount);
  return { ok: Math.abs(diff) < 0.011, diff };
}

/**
 * 计算成员净余额：付款人 +amount，承担者 -share。正数 = 别人欠他，负数 = 他欠别人。
 * 只统计 direction==='expense' 且带 split 的交易；settlements 为已结算记录 [{from,to,amount}]，from 付给 to。
 */
export function computeBalances(transactions, settlements = []) {
  const bal = {};
  const add = (id, v) => { if (!id) return; bal[id] = round2((bal[id] || 0) + v); };
  for (const t of transactions) {
    if (t.deleted || t.direction !== 'expense' || !t.split || t.split.mode === 'none') continue;
    const shares = sharesOf(t.amount, t.split);
    const shared = Object.values(shares).reduce((s, v) => s + v, 0);
    if (!shared) continue;
    add(t.payerId, shared);
    for (const [id, v] of Object.entries(shares)) add(id, -v);
  }
  for (const s of settlements) {
    if (s.deleted) continue;
    add(s.from, s.amount);
    add(s.to, -s.amount);
  }
  return bal;
}

/** 贪心生成最少转账方案：债务人依次付给债权人。 */
export function settleUp(balances) {
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.005).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.005).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const transfers = [];
  let i = 0; let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = round2(Math.min(debtors[i].v, creditors[j].v));
    if (pay > 0) transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: pay });
    debtors[i].v = round2(debtors[i].v - pay);
    creditors[j].v = round2(creditors[j].v - pay);
    if (debtors[i].v < 0.005) i++;
    if (creditors[j].v < 0.005) j++;
  }
  return transfers;
}

/** 每个成员在一段交易内实付、应付与净额的汇总表。 */
export function memberSummary(transactions, members) {
  const rows = {};
  for (const m of members) rows[m.id] = { id: m.id, name: m.name, paid: 0, owed: 0, net: 0 };
  for (const t of transactions) {
    if (t.deleted || t.direction !== 'expense' || !t.split || t.split.mode === 'none') continue;
    const shares = sharesOf(t.amount, t.split);
    const shared = Object.values(shares).reduce((s, v) => s + v, 0);
    if (t.payerId && rows[t.payerId]) rows[t.payerId].paid = round2(rows[t.payerId].paid + shared);
    for (const [id, v] of Object.entries(shares)) if (rows[id]) rows[id].owed = round2(rows[id].owed + v);
  }
  for (const r of Object.values(rows)) r.net = round2(r.paid - r.owed);
  return Object.values(rows);
}
