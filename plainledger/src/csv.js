// 素账 PlainLedger — 账单 CSV 解析（微信支付 / 支付宝 / 通用）
// 纯 ES Module，浏览器与 Node 通用，无外部依赖。

export const SOURCES = { WECHAT: 'wechat', ALIPAY: 'alipay', GENERIC: 'generic' };

/** RFC4180 风格 CSV 解析：支持引号、引号内逗号与换行、CRLF。返回二维数组。 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** 字节 → 文本：优先按 UTF-8（严格模式）解码，失败则按 GBK（支付宝导出常见）。 */
export function decodeBytes(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  try {
    const t = new TextDecoder('utf-8', { fatal: true }).decode(u8);
    return { text: t.replace(/^﻿/, ''), encoding: 'utf-8' };
  } catch (e) {
    return { text: new TextDecoder('gbk').decode(u8), encoding: 'gbk' };
  }
}

export function detectSource(text) {
  const head = text.slice(0, 4000);
  if (/微信支付账单/.test(head)) return SOURCES.WECHAT;
  if (/支付宝/.test(head) && /(交易记录|交易流水|交易明细)/.test(head)) return SOURCES.ALIPAY;
  if (/交易订单号|收\/付款方式/.test(head)) return SOURCES.ALIPAY;
  if (/交易单号|商户单号/.test(head)) return SOURCES.WECHAT;
  return SOURCES.GENERIC;
}

const norm = (s) => String(s ?? '').replace(/\s+/g, '').replace(/[（(].*?[)）]/g, '').replace(/[:：]$/, '');

// 列名别名表（去掉括号与空白后匹配）
const COLUMN_ALIASES = {
  time: ['交易时间', '交易创建时间', '付款时间', '时间', '日期', '交易日期', '记账日期'],
  type: ['交易类型', '类型', '交易分类'],
  counterparty: ['交易对方', '对方', '商户名称', '对方名称', '收款方', '交易方'],
  item: ['商品', '商品说明', '商品名称', '摘要', '说明', '描述', '交易摘要'],
  direction: ['收/支', '收支', '收支类型', '借贷', '借贷标志'],
  amount: ['金额', '交易金额', '发生额', '金额元'],
  method: ['支付方式', '收/付款方式', '付款方式', '账户', '交易账户'],
  status: ['当前状态', '交易状态', '状态', '资金状态'],
  orderId: ['交易单号', '交易订单号', '交易号', '流水号', '交易流水号', '订单号'],
  merchantOrderId: ['商户单号', '商家订单号', '商户订单号'],
  note: ['备注', '附言', '摘要备注'],
  rawCategory: ['交易分类'],
};

/** 找到表头行索引：包含时间列与金额列的第一行。 */
export function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 60); i++) {
    const cells = rows[i].map(norm);
    const hasTime = cells.some((c) => COLUMN_ALIASES.time.includes(c));
    const hasAmount = cells.some((c) => COLUMN_ALIASES.amount.includes(c));
    if (hasTime && hasAmount) return i;
  }
  return -1;
}

/** 根据表头生成 字段 → 列索引 映射。同一字段命中多列时取第一列。 */
export function mapColumns(headerCells) {
  const cells = headerCells.map(norm);
  const map = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = cells.indexOf(alias);
      if (idx >= 0) { map[field] = idx; break; }
    }
  }
  return map;
}

export function parseAmount(s) {
  if (s == null) return NaN;
  const cleaned = String(s).replace(/[¥￥,\s元]/g, '').replace(/^\+/, '');
  if (cleaned === '' || cleaned === '-') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(Math.abs(n) * 100) / 100 : NaN;
}

/** 将各种时间写法归一为 "YYYY-MM-DD HH:mm:ss"（本地时间字符串，不做时区换算）。 */
export function normalizeTime(s) {
  const t = String(s ?? '').trim().replace(/\//g, '-').replace(/T/, ' ');
  const m = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const pad = (x) => String(x).padStart(2, '0');
  return `${m[1]}-${pad(m[2])}-${pad(m[3])} ${pad(m[4] ?? 0)}:${pad(m[5] ?? 0)}:${pad(m[6] ?? 0)}`;
}

export function directionOf(text, amountText, type) {
  const d = String(text ?? '').trim();
  if (/^支出$|^出$|^借$|^-$/.test(d) || /支出/.test(d)) return 'expense';
  if (/^收入$|^入$|^贷$/.test(d) || /收入/.test(d)) return 'income';
  if (/不计收支|^\/$|中性|其他/.test(d)) return 'neutral';
  // 无收支列时，按金额符号或类型猜测
  const a = String(amountText ?? '');
  if (/^-/.test(a.trim())) return 'expense';
  if (/^\+/.test(a.trim())) return 'income';
  if (/退款|收款|红包收|工资|转入/.test(String(type ?? ''))) return 'income';
  return d ? 'neutral' : 'expense';
}

/** FNV-1a 32 位哈希，用于无订单号时生成指纹。 */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function fingerprintOf(rec) {
  // 支付宝退款行与原支付行共用同一个交易订单号，因此退款需单独成指纹
  if (rec.orderId) return `${rec.source}:${rec.orderId}${rec.isRefund ? ':refund' : ''}`;
  return `${rec.source}:h:${fnv1a([rec.time, rec.amount, rec.counterparty, rec.direction, rec.item].join('|'))}`;
}

export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const CLOSED_STATUS = /关闭|失败|撤销|取消|已退款给|冻结|等待付款|待付款|交易关闭/;
const REFUND_HINT = /退款|退货|退回/;

/**
 * 解析账单文本，返回 { source, header, records, skipped, mapping }。
 * @param {string} text 已解码文本
 * @param {object} [opts] { source, mapping } 可强制指定来源或列映射（通用格式的手动映射）
 */
export function parseStatement(text, opts = {}) {
  const rows = parseCsv(text).filter((r) => r.some((c) => String(c).trim() !== ''));
  const source = opts.source || detectSource(text);
  const headerIdx = findHeaderRow(rows);
  if (headerIdx < 0) {
    return { source, header: [], records: [], skipped: [], mapping: {}, error: '未找到表头行（需要包含“交易时间”与“金额”列）' };
  }
  const header = rows[headerIdx];
  const mapping = Object.assign(mapColumns(header), opts.mapping || {});
  if (mapping.time == null || mapping.amount == null) {
    return { source, header, records: [], skipped: [], mapping, error: '缺少时间列或金额列，请手动指定' };
  }
  const records = [];
  const skipped = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (f) => (mapping[f] != null ? String(r[mapping[f]] ?? '').trim() : '');
    const timeRaw = get('time');
    // 表尾统计行（如“共10笔记录”“----”）没有可解析时间，直接跳过
    const time = normalizeTime(timeRaw);
    const amount = parseAmount(get('amount'));
    if (!time || !Number.isFinite(amount)) { if (timeRaw) skipped.push({ row: i + 1, reason: '无法解析时间或金额', raw: r }); continue; }
    const status = get('status');
    const type = get('type');
    const rawCategory = source === SOURCES.ALIPAY ? get('rawCategory') || type : get('rawCategory');
    let direction = directionOf(get('direction'), get('amount'), type);
    const isRefund = REFUND_HINT.test(status) || REFUND_HINT.test(type) || REFUND_HINT.test(get('item'));
    if (CLOSED_STATUS.test(status) && !isRefund) { skipped.push({ row: i + 1, reason: `状态为「${status}」`, raw: r }); continue; }
    // 微信“已全额退款”的原支出仍记为支出，另有一条退款收入；支付宝退款行 收/支 常为空或“不计收支”
    if (isRefund && direction === 'neutral') direction = 'income';
    const rec = {
      id: uuid(),
      source,
      time,
      type,
      counterparty: get('counterparty').replace(/^\/$/, ''),
      item: get('item').replace(/^\/$/, ''),
      direction,
      amount,
      method: get('method').replace(/^\/$/, ''),
      status,
      orderId: get('orderId').replace(/^\/$/, '').replace(/\t/g, ''),
      merchantOrderId: get('merchantOrderId').replace(/^\/$/, '').replace(/\t/g, ''),
      note: get('note').replace(/^\/$/, ''),
      rawCategory,
      isRefund,
      category: '',
      payerId: '',
      split: null,
      updatedAt: Date.now(),
      deleted: false,
    };
    rec.fingerprint = fingerprintOf(rec);
    records.push(rec);
  }
  // 微信账单里“已全额退款”的支出记录与对应“退款”收入应互相抵消：在报表中以净额体现，这里只做标记
  return { source, header, records, skipped, mapping };
}

/**
 * 去重：与已有指纹集合比较，返回 { fresh, duplicates }。
 */
export function dedupe(records, existingFingerprints) {
  const seen = new Set(existingFingerprints || []);
  const fresh = [];
  const duplicates = [];
  for (const r of records) {
    if (seen.has(r.fingerprint)) duplicates.push(r);
    else { seen.add(r.fingerprint); fresh.push(r); }
  }
  return { fresh, duplicates };
}
