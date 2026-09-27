// 素账 PlainLedger — 账本文件导出/导入/三向合并（零账号共享）与可选加密

export const LEDGER_FORMAT = 'plainledger/ledger';
export const LEDGER_VERSION = 1;
export const COLLECTIONS = ['members', 'transactions', 'rules', 'budgets', 'settlements'];

/** 组装可导出的账本对象。 */
export function buildLedger({ meta = {}, members = [], transactions = [], rules = [], budgets = [], settlements = [] }) {
  return {
    format: LEDGER_FORMAT,
    version: LEDGER_VERSION,
    exportedAt: new Date().toISOString(),
    meta: { name: meta.name || '我的账本', ledgerId: meta.ledgerId || '', ...meta },
    members, transactions, rules, budgets, settlements,
  };
}

export function isLedger(obj) {
  return !!obj && obj.format === LEDGER_FORMAT && Array.isArray(obj.transactions);
}

/**
 * 按 id + updatedAt 合并两份集合：新者胜；墓碑（deleted:true）同样按 updatedAt 比较，避免被旧数据复活。
 * 返回 { merged, stats:{added, updated, unchanged, conflicts} }，conflicts 为双方都在本地导出后修改过的记录（可视化用）。
 */
export function mergeCollection(local = [], incoming = [], { since = 0 } = {}) {
  const byId = new Map(local.map((x) => [x.id, x]));
  const stats = { added: 0, updated: 0, unchanged: 0, conflicts: 0 };
  const conflicts = [];
  for (const inc of incoming) {
    if (!inc || !inc.id) continue;
    const cur = byId.get(inc.id);
    if (!cur) { byId.set(inc.id, inc); stats.added++; continue; }
    const a = Number(cur.updatedAt || 0); const b = Number(inc.updatedAt || 0);
    // 只有在已知上次同步时间（since>0）且双方都在其后修改过时才算冲突；since=0 表示未知，不判冲突
    if (since > 0 && a > since && b > since && a !== b && JSON.stringify(strip(cur)) !== JSON.stringify(strip(inc))) { stats.conflicts++; conflicts.push({ local: cur, incoming: inc }); }
    if (b > a) { byId.set(inc.id, inc); stats.updated++; }
    else stats.unchanged++;
  }
  return { merged: [...byId.values()], stats, conflicts };
}

function strip(x) { const { updatedAt, ...rest } = x; return rest; }

/** 合并整本账本。transactions 额外按指纹去重：同一笔导入记录在两台设备各自导入时 id 不同但 fingerprint 相同。 */
export function mergeLedgers(local, incoming, opts = {}) {
  const out = { ...local };
  const report = {};
  for (const col of COLLECTIONS) {
    const r = mergeCollection(local[col] || [], incoming[col] || [], opts);
    out[col] = r.merged;
    report[col] = { ...r.stats, conflicts: r.conflicts };
  }
  // 指纹级去重：保留 updatedAt 更早（先导入）的那条，把另一条标为删除
  const seen = new Map();
  let fpDupes = 0;
  for (const t of out.transactions) {
    if (t.deleted || !t.fingerprint) continue;
    const prev = seen.get(t.fingerprint);
    if (!prev) { seen.set(t.fingerprint, t); continue; }
    const loser = (prev.updatedAt || 0) <= (t.updatedAt || 0) ? t : prev;
    const winner = loser === t ? prev : t;
    // 手改过的分类/分摊优先保留
    if (!winner.category && loser.category) winner.category = loser.category;
    if (!winner.split && loser.split) { winner.split = loser.split; winner.payerId = winner.payerId || loser.payerId; }
    loser.deleted = true; loser.updatedAt = Date.now();
    seen.set(t.fingerprint, winner);
    fpDupes++;
  }
  report.fingerprintDuplicates = fpDupes;
  out.meta = { ...(incoming.meta || {}), ...(local.meta || {}) };
  return { ledger: out, report };
}

// ---------- 可选加密（WebCrypto：PBKDF2 + AES-GCM） ----------
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function unb64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptJson(obj, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
  return { format: 'plainledger/encrypted', version: 1, kdf: 'PBKDF2-SHA256-200k', salt: b64(salt), iv: b64(iv), data: b64(ct) };
}

export async function decryptJson(blob, password) {
  if (!blob || blob.format !== 'plainledger/encrypted') throw new Error('不是加密账本文件');
  const key = await deriveKey(password, unb64(blob.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.data));
  return JSON.parse(dec.decode(pt));
}

export function isEncrypted(obj) { return !!obj && obj.format === 'plainledger/encrypted'; }
