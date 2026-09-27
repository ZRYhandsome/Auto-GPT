// 素账 PlainLedger — 单页应用（无框架、无构建）
import { decodeBytes, parseStatement, dedupe, uuid, SOURCES, fingerprintOf } from './csv.js';
import { CATEGORIES, INCOME_CATEGORIES, categorize, categorizeAll, suggestRule } from './rules.js';
import { sharesOf, validateSplit, computeBalances, settleUp, memberSummary } from './split.js';
import { buildLedger, mergeLedgers, isLedger, encryptJson, decryptJson, isEncrypted } from './merge.js';
import { openStore, requestPersistence, storageEstimate } from './db.js';
import { drawHBars, drawTrend, drawProgress } from './charts.js';

const state = {
  store: null,
  transactions: [], members: [], rules: [], budgets: [], settlements: [],
  meta: { key: 'ledger', name: '我的账本', ledgerId: '', createdAt: 0 },
  route: 'ledger',
  month: currentMonth(),
  filter: { q: '', category: '' },
  report: { mode: 'month', month: currentMonth(), year: new Date().getFullYear() },
  importSession: null,
};

// ---------- 工具 ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => (Math.round((n || 0) * 100) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const live = (arr) => arr.filter((x) => !x.deleted);
function currentMonth(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function monthOf(time) { return String(time).slice(0, 7); }
function dayOf(time) { return String(time).slice(0, 10); }
function shiftMonth(ym, delta) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + delta, 1); return currentMonth(d); }
function nowLocal() { const d = new Date(); const p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`; }
function toInputDT(time) { return String(time).replace(' ', 'T').slice(0, 16); }
function fromInputDT(v) { return v ? `${v.replace('T', ' ')}${v.length === 16 ? ':00' : ''}` : nowLocal(); }
const memberName = (id) => (state.members.find((m) => m.id === id) || {}).name || (id ? '（已删除成员）' : '—');

let toastTimer;
function toast(msg, ms = 2600) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

function openSheet(html, bind) {
  const root = $('#sheet');
  root.innerHTML = `<div class="sheet-backdrop" data-close="1"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  root.hidden = false;
  root.onclick = (e) => { if (e.target.dataset.close) closeSheet(); };
  if (bind) bind(root);
}
function closeSheet() { const root = $('#sheet'); root.hidden = true; root.innerHTML = ''; }

let lastExport = null;
function download(filename, content, type = 'application/json') {
  if (typeof content === 'string') lastExport = { filename, text: content };
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  } catch (e) {
    showTextFallback(filename, typeof content === 'string' ? content : '');
  }
}
function showTextFallback(filename, text) {
  openSheet(`<h2>${h(filename)}</h2><p class="small muted">当前环境不允许直接下载，请复制以下内容自行保存。</p>
    <textarea id="fallbackText" rows="12" readonly>${h(text)}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn primary" id="copyFallback">复制</button><button class="btn" data-close="1">关闭</button></div>`,
  (root) => { $('#copyFallback', root).onclick = async () => { try { await navigator.clipboard.writeText(text); toast('已复制'); } catch (e) { $('#fallbackText', root).select(); toast('请手动复制'); } }; });
}

// ---------- 持久化 ----------
async function loadAll() {
  const s = state.store;
  [state.transactions, state.members, state.rules, state.budgets, state.settlements] = await Promise.all(
    ['transactions', 'members', 'rules', 'budgets', 'settlements'].map((k) => s.getAll(k)));
  const metas = await s.getAll('meta');
  const ledger = metas.find((m) => m.key === 'ledger');
  if (ledger) state.meta = ledger;
  if (!state.meta.ledgerId) { state.meta = { key: 'ledger', name: '我的账本', ledgerId: uuid(), createdAt: Date.now() }; await s.put('meta', state.meta); }
  $('#ledgerName').textContent = state.meta.name;
  // 当前月没有记录但账本非空时，默认展示最近有记录的月份
  const months = [...new Set(live(state.transactions).map((t) => monthOf(t.time)))].sort();
  if (months.length && !months.includes(state.month)) { state.month = months[months.length - 1]; state.report.month = state.month; state.report.year = Number(state.month.slice(0, 4)); }
}
async function saveTxn(t) { t.updatedAt = Date.now(); await state.store.put('transactions', t); if (!state.transactions.includes(t)) state.transactions.push(t); }
async function saveMany(col, items) { const now = Date.now(); items.forEach((x) => { x.updatedAt = x.updatedAt || now; }); await state.store.bulkPut(col, items); }
async function saveOne(col, item) { item.updatedAt = Date.now(); await state.store.put(col, item); const arr = state[col]; if (!arr.includes(item)) arr.push(item); }
async function softDelete(col, item) { item.deleted = true; item.updatedAt = Date.now(); await state.store.put(col, item); }
async function saveMeta() { await state.store.put('meta', state.meta); $('#ledgerName').textContent = state.meta.name; }

// ---------- 路由 ----------
function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'ledger';
  state.route = hash.split('?')[0];
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === state.route));
  render();
}
function render() {
  const view = $('#view');
  const views = { ledger: ledgerView, import: importView, add: addView, reports: reportsView, members: membersView, settings: settingsView };
  const fn = views[state.route] || ledgerView;
  view.innerHTML = fn();
  const binder = { ledger: bindLedger, import: bindImport, add: bindAdd, reports: bindReports, members: bindMembers, settings: bindSettings }[state.route];
  if (binder) binder(view);
  window.scrollTo({ top: 0 });
}

// ---------- 账单 ----------
function monthTxns(ym) { return live(state.transactions).filter((t) => monthOf(t.time) === ym); }
function totals(txns) {
  let expense = 0; let income = 0; let refund = 0;
  for (const t of txns) {
    if (t.direction === 'expense') expense += t.amount;
    else if (t.direction === 'income') { if (t.isRefund || t.category === '退款') refund += t.amount; else income += t.amount; }
  }
  return { expense, income, refund, netExpense: expense - refund, net: income - (expense - refund) };
}
function catIcon(cat) { return { 餐饮: '餐', 交通: '行', 购物: '购', 日用: '日', 居住: '住', 通讯: '话', 娱乐: '娱', 医疗: '医', 教育: '学', 人情: '礼', 旅行: '旅', 宠物: '宠', 育儿: '育', 订阅会员: '订', 转账: '转', 理财: '财', 工资: '薪', 退款: '退', 其他: '它' }[cat] || '它'; }

function ledgerView() {
  const txns = monthTxns(state.month);
  const t = totals(txns);
  const cats = [...new Set(txns.map((x) => x.category).filter(Boolean))];
  const q = state.filter.q.trim().toLowerCase();
  const shown = txns.filter((x) => (!state.filter.category || x.category === state.filter.category) &&
    (!q || `${x.counterparty} ${x.item} ${x.note} ${x.category} ${x.amount}`.toLowerCase().includes(q)))
    .sort((a, b) => (a.time < b.time ? 1 : -1));
  const groups = {};
  for (const x of shown) (groups[dayOf(x.time)] ||= []).push(x);
  const empty = !live(state.transactions).length;
  return `
  <div class="stack">
    <div class="row between">
      <div class="row"><button class="btn sm" data-action="prev">◀</button><h1 class="num">${h(state.month)}</h1><button class="btn sm" data-action="next">▶</button></div>
      <button class="btn sm" data-action="thisMonth">本月</button>
    </div>
    <div class="kpis">
      <div class="kpi"><span>支出（已扣退款）</span><b class="expense num">${money(t.netExpense)}</b></div>
      <div class="kpi"><span>收入</span><b class="income num">${money(t.income)}</b></div>
      <div class="kpi"><span>结余</span><b class="num">${money(t.net)}</b></div>
    </div>
    ${empty ? `<div class="card empty"><b>还没有任何记录</b>去「导入」页拖入微信/支付宝导出的账单，或直接「记一笔」。<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#/import">导入账单</a><a class="btn" href="#/add">记一笔</a></div></div>` : ''}
    <div class="row">
      <input type="text" id="q" placeholder="搜索商户 / 商品 / 备注 / 金额" value="${h(state.filter.q)}" style="flex:1;min-width:180px">
    </div>
    <div class="chips">
      <button class="chip ${state.filter.category ? '' : 'active'}" data-cat="">全部 ${txns.length}</button>
      ${cats.map((c) => `<button class="chip ${state.filter.category === c ? 'active' : ''}" data-cat="${h(c)}">${h(c)} ${txns.filter((x) => x.category === c).length}</button>`).join('')}
    </div>
    <div class="card" style="padding:0 8px">
      ${Object.keys(groups).sort().reverse().map((day) => {
        const dt = totals(groups[day]);
        return `<div class="daygroup"><div class="dayhead"><span>${h(day)}</span><span class="num">支 ${money(dt.expense)}${dt.income ? ` · 收 ${money(dt.income)}` : ''}</span></div>
        ${groups[day].map((x) => `<div class="txn" data-id="${x.id}" role="button" tabindex="0">
          <div class="cat">${catIcon(x.category)}</div>
          <div><div class="who">${h(x.counterparty || x.item || x.type || '（无对方）')} ${x.split && x.split.mode !== 'none' ? '<span class="tag">分摊</span>' : ''}</div>
          <div class="sub">${h(x.category)}${x.item && x.item !== x.counterparty ? ' · ' + h(x.item) : ''}${x.note ? ' · ' + h(x.note) : ''} · ${h(x.time.slice(11, 16))} <span class="tag src">${h(srcName(x.source))}</span></div></div>
          <div class="amt ${x.direction}">${x.direction === 'expense' ? '-' : x.direction === 'income' ? '+' : ''}${money(x.amount)}${x.payerId ? `<small>${h(memberName(x.payerId))} 付</small>` : ''}</div>
        </div>`).join('')}</div>`;
      }).join('') || (!empty ? '<div class="empty">本月没有匹配的记录</div>' : '')}
    </div>
  </div>`;
}
function srcName(s) { return { wechat: '微信', alipay: '支付宝', generic: 'CSV', manual: '手记' }[s] || s; }
function bindLedger(view) {
  $('[data-action=prev]', view).onclick = () => { state.month = shiftMonth(state.month, -1); render(); };
  $('[data-action=next]', view).onclick = () => { state.month = shiftMonth(state.month, 1); render(); };
  $('[data-action=thisMonth]', view).onclick = () => { state.month = currentMonth(); render(); };
  const q = $('#q', view);
  q.oninput = () => { state.filter.q = q.value; const pos = q.selectionStart; render(); const nq = $('#q'); nq.focus(); nq.setSelectionRange(pos, pos); };
  $$('.chip', view).forEach((c) => { c.onclick = () => { state.filter.category = c.dataset.cat; render(); }; });
  $$('.txn', view).forEach((row) => {
    const open = () => openTxnSheet(row.dataset.id);
    row.onclick = open; row.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  });
}

function splitEditorHtml(t) {
  const members = live(state.members);
  const mode = (t.split && t.split.mode) || 'none';
  const modes = [['none', '不分摊'], ['equal', '平均'], ['exact', '按金额'], ['ratio', '按比例']];
  return `<div class="split-editor">
    <label class="field"><span>付款人</span><select name="payerId">${['<option value="">—</option>', ...members.map((m) => `<option value="${m.id}" ${t.payerId === m.id ? 'selected' : ''}>${h(m.name)}</option>`)].join('')}</select></label>
    <div class="chips" style="margin-top:8px">${modes.map(([k, l]) => `<button type="button" class="chip ${mode === k ? 'active' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
    <div id="splitMembers">${members.length ? members.map((m) => {
      const eq = mode === 'equal' ? (t.split.members || []).includes(m.id) : true;
      const val = mode === 'exact' || mode === 'ratio' ? (t.split.shares || {})[m.id] ?? '' : '';
      return `<div class="row" data-mid="${m.id}"><label class="row" style="min-width:120px"><input type="checkbox" class="eq" ${eq ? 'checked' : ''} ${mode === 'equal' ? '' : 'hidden'}> ${h(m.name)}</label>
        <input type="number" step="0.01" class="share" placeholder="${mode === 'ratio' ? '权重' : '金额'}" value="${h(val)}" ${mode === 'exact' || mode === 'ratio' ? '' : 'hidden'} style="width:120px"></div>`;
    }).join('') : '<p class="small muted">先在「分账」页添加成员，才能分摊。</p>'}</div>
    <p class="small muted" id="splitHint"></p>
  </div>`;
}
function readSplit(root, amount) {
  const mode = $('.split-editor .chip.active', root).dataset.mode;
  const rows = $$('#splitMembers [data-mid]', root);
  if (mode === 'none') return { split: null };
  if (mode === 'equal') {
    const members = rows.filter((r) => $('.eq', r).checked).map((r) => r.dataset.mid);
    if (!members.length) return { error: '请至少勾选一位成员' };
    return { split: { mode, members } };
  }
  const shares = {};
  for (const r of rows) { const v = Number($('.share', r).value); if (v > 0) shares[r.dataset.mid] = v; }
  if (!Object.keys(shares).length) return { error: '请填写至少一位成员的' + (mode === 'exact' ? '金额' : '权重') };
  const split = { mode, shares };
  if (mode === 'exact') { const v = validateSplit(amount, split); if (!v.ok) return { error: `分摊金额之和与总额相差 ${money(v.diff)}` }; }
  return { split };
}
function bindSplitEditor(root, getAmount) {
  $$('.split-editor .chip', root).forEach((c) => {
    c.onclick = () => {
      $$('.split-editor .chip', root).forEach((x) => x.classList.remove('active')); c.classList.add('active');
      const mode = c.dataset.mode;
      $$('#splitMembers [data-mid]', root).forEach((r) => {
        $('.eq', r).hidden = mode !== 'equal';
        const sh = $('.share', r); sh.hidden = !(mode === 'exact' || mode === 'ratio'); sh.placeholder = mode === 'ratio' ? '权重' : '金额';
      });
      updateHint();
    };
  });
  const updateHint = () => {
    const amount = getAmount();
    const r = readSplit(root, amount);
    const hint = $('#splitHint', root);
    if (!hint) return;
    if (r.error) { hint.textContent = r.error; return; }
    if (!r.split) { hint.textContent = ''; return; }
    const shares = sharesOf(amount, r.split);
    hint.textContent = Object.entries(shares).map(([id, v]) => `${memberName(id)} ${money(v)}`).join(' · ');
  };
  root.addEventListener('input', updateHint);
  root.addEventListener('change', updateHint);
  updateHint();
}

function txnFormHtml(t, isNew) {
  const cats = t.direction === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  return `<h2>${isNew ? '记一笔' : '编辑记录'}</h2>
    <div class="grid2" style="margin-top:12px">
      <label class="field"><span>金额</span><input name="amount" type="number" step="0.01" min="0" value="${t.amount || ''}" required></label>
      <label class="field"><span>收/支</span><select name="direction"><option value="expense" ${t.direction === 'expense' ? 'selected' : ''}>支出</option><option value="income" ${t.direction === 'income' ? 'selected' : ''}>收入</option><option value="neutral" ${t.direction === 'neutral' ? 'selected' : ''}>中性（转账/提现）</option></select></label>
      <label class="field"><span>分类</span><select name="category">${CATEGORIES.map((c) => `<option ${t.category === c ? 'selected' : ''} ${!cats.includes(c) ? 'data-dim="1"' : ''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span>时间</span><input name="time" type="datetime-local" value="${toInputDT(t.time || nowLocal())}"></label>
      <label class="field"><span>交易对方</span><input name="counterparty" type="text" value="${h(t.counterparty)}" placeholder="商户 / 人"></label>
      <label class="field"><span>商品 / 说明</span><input name="itemName" type="text" value="${h(t.item)}"></label>
      <label class="field" style="grid-column:1/-1"><span>备注</span><input name="note" type="text" value="${h(t.note)}"></label>
    </div>
    <div id="ruleSuggest" class="small" style="margin-top:8px" hidden><label class="row"><input type="checkbox" name="makeRule"> <span id="ruleText"></span></label></div>
    <h3 style="margin-top:14px">分摊</h3>
    ${splitEditorHtml(t)}
    ${!isNew ? `<p class="small muted" style="margin-top:10px">来源：${h(srcName(t.source))}${t.type ? ' · ' + h(t.type) : ''}${t.status ? ' · ' + h(t.status) : ''}${t.orderId ? ' · 单号 ' + h(t.orderId) : ''}</p>` : ''}
    <div class="row between" style="margin-top:14px">
      <div class="row">${!isNew ? '<button type="button" class="btn danger" id="delBtn">删除</button>' : ''}</div>
      <div class="row"><button type="button" class="btn" data-close="1">取消</button><button type="submit" class="btn primary">保存</button></div>
    </div>`;
}
function bindTxnForm(root, t, isNew, onSaved) {
  const form = $('form', root);
  const amountInput = form.elements.amount;
  bindSplitEditor(root, () => Number(amountInput.value) || 0);
  const origCat = t.category;
  form.elements.category.onchange = () => {
    const sug = suggestRule({ counterparty: form.elements.counterparty.value, item: form.elements.itemName.value }, form.elements.category.value);
    const box = $('#ruleSuggest', root);
    if (sug && form.elements.category.value !== origCat) { box.hidden = false; $('#ruleText', root).textContent = `以后「${sug.pattern}」都归到「${sug.category}」`; box.dataset.pattern = sug.pattern; }
    else box.hidden = true;
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.elements.amount.value);
    if (!(amount > 0)) { toast('请输入大于 0 的金额'); return; }
    const sp = readSplit(root, amount);
    if (sp.error) { toast(sp.error); return; }
    Object.assign(t, {
      amount: Math.round(amount * 100) / 100,
      direction: form.elements.direction.value,
      category: form.elements.category.value,
      time: fromInputDT(form.elements.time.value),
      counterparty: form.elements.counterparty.value.trim(),
      item: form.elements.itemName.value.trim(),
      note: form.elements.note.value.trim(),
      payerId: form.elements.payerId ? form.elements.payerId.value : '',
      split: sp.split,
    });
    if (isNew) { t.fingerprint = fingerprintOf(t); }
    await saveTxn(t);
    if (form.elements.makeRule && form.elements.makeRule.checked && $('#ruleSuggest', root).dataset.pattern) {
      const rule = { id: uuid(), pattern: $('#ruleSuggest', root).dataset.pattern, category: t.category, field: 'counterparty', deleted: false };
      await saveOne('rules', rule);
      const affected = live(state.transactions).filter((x) => x.id !== t.id && x.categoryBy !== 'user' && `${x.counterparty}`.toLowerCase().includes(rule.pattern.toLowerCase()) && x.category !== rule.category);
      for (const x of affected) { x.category = rule.category; x.categoryBy = 'user'; x.updatedAt = Date.now(); }
      if (affected.length) await saveMany('transactions', affected);
      toast(`已保存，并把 ${affected.length} 条同类记录归到「${rule.category}」`);
    } else toast('已保存');
    closeSheet();
    if (onSaved) onSaved();
  };
  const del = $('#delBtn', root);
  if (del) del.onclick = async () => {
    if (del.dataset.confirm) { await softDelete('transactions', t); closeSheet(); toast('已删除'); render(); }
    else { del.dataset.confirm = '1'; del.textContent = '再点一次确认删除'; }
  };
}
function openTxnSheet(id) {
  const t = state.transactions.find((x) => x.id === id);
  if (!t) return;
  openSheet(`<form>${txnFormHtml(t, false)}</form>`, (root) => bindTxnForm(root, t, false, render));
}

// ---------- 记一笔 ----------
function addView() {
  return `<div class="card"><form id="addForm">${txnFormHtml({ amount: '', direction: 'expense', category: '餐饮', time: nowLocal(), counterparty: '', item: '', note: '', payerId: '', split: null }, true)}</form></div>`;
}
function bindAdd(view) {
  const t = { id: uuid(), source: 'manual', type: '手记', status: '', orderId: '', merchantOrderId: '', rawCategory: '', isRefund: false, deleted: false, categoryBy: 'user', amount: 0, direction: 'expense', category: '餐饮', time: nowLocal(), counterparty: '', item: '', note: '', payerId: '', split: null };
  $('[data-close]', view).onclick = () => { location.hash = '#/ledger'; };
  bindTxnForm(view, t, true, () => { state.month = monthOf(t.time); location.hash = '#/ledger'; });
}

// ---------- 导入 ----------
function importView() {
  const s = state.importSession;
  return `<div class="stack">
    <h1>导入官方账单</h1>
    <div class="grid2">
      <div class="card"><h3>微信支付</h3><p class="small muted">微信 → 我 → 服务 → 钱包 → 账单 → 右上角「常见问题」→ 下载账单 → 用于个人对账 → 选择时间范围 → 发送到邮箱。解压后得到 CSV。</p></div>
      <div class="card"><h3>支付宝</h3><p class="small muted">支付宝 → 我的 → 账单 → 右上角「···」→ 开具交易流水证明 → 用于个人对账 → 选择时间范围 → 发送到邮箱。解压后得到 CSV（GBK 编码，可直接导入）。</p></div>
    </div>
    <p class="small muted">文件只在你的浏览器里解析，不会上传到任何服务器。也支持银行导出的 CSV（需要包含时间与金额列，缺少收支列时按正负号判断）。</p>
    <label class="drop" id="drop"><input type="file" id="file" accept=".csv,.txt,text/csv" multiple><b>点击选择或拖入账单文件</b><br><span class="small">可一次选多个；重复导入会自动跳过已存在的记录</span></label>
    ${s ? importPreviewHtml(s) : ''}
  </div>`;
}
function importPreviewHtml(s) {
  const members = live(state.members);
  return `<div class="card stack" id="preview">
    <h2>预览</h2>
    ${s.files.map((f, i) => `<div class="card" data-file="${i}">
      <div class="row between"><b>${h(f.name)}</b><span class="tag src">${h(srcName(f.result.source))} · ${h(f.encoding.toUpperCase())}</span></div>
      ${f.result.error ? `<p class="callout danger small">${h(f.result.error)}</p>${mappingHtml(f, i)}` : `
      <div class="row small" style="margin-top:6px">
        <span>识别 <b>${f.result.records.length}</b> 条</span>
        <span>新增 <b class="income">${f.fresh.length}</b></span>
        <span>重复 <b>${f.duplicates.length}</b></span>
        <span>跳过 <b>${f.result.skipped.length}</b>${f.result.skipped.length ? ` <button class="btn sm" data-showskip="${i}">看原因</button>` : ''}</span>
        <span>自动归类率 <b>${Math.round(f.catRate * 100)}%</b></span>
      </div>
      <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>时间</th><th>对方</th><th>说明</th><th>分类</th><th class="num">金额</th></tr></thead><tbody>
        ${f.fresh.slice(0, 6).map((r) => `<tr><td class="num small">${h(r.time.slice(5, 16))}</td><td>${h(r.counterparty)}</td><td class="small muted">${h(r.item)}</td><td>${h(r.category)}</td><td class="num ${r.direction}">${r.direction === 'expense' ? '-' : r.direction === 'income' ? '+' : ''}${money(r.amount)}</td></tr>`).join('')}
        ${f.fresh.length > 6 ? `<tr><td colspan="5" class="small muted">… 还有 ${f.fresh.length - 6} 条</td></tr>` : ''}
      </tbody></table></div>
      ${f.result.source === SOURCES.GENERIC ? `<details style="margin-top:8px"><summary class="small">列映射不对？手动指定</summary>${mappingHtml(f, i)}</details>` : ''}`}
    </div>`).join('')}
    <div class="row between">
      <label class="field" style="min-width:200px"><span>默认付款人（可选，方便之后分摊）</span><select id="defaultPayer"><option value="">不指定</option>${members.map((m) => `<option value="${m.id}">${h(m.name)}</option>`).join('')}</select></label>
      <div class="row"><button class="btn" id="cancelImport">清空预览</button><button class="btn primary" id="confirmImport" ${s.files.some((f) => f.fresh.length) ? '' : 'disabled'}>导入 ${s.files.reduce((n, f) => n + f.fresh.length, 0)} 条新记录</button></div>
    </div>
  </div>`;
}
function mappingHtml(f, i) {
  const header = f.result.header || [];
  const fields = [['time', '时间*'], ['amount', '金额*'], ['direction', '收/支'], ['counterparty', '交易对方'], ['item', '商品/说明'], ['status', '状态'], ['orderId', '订单号'], ['note', '备注'], ['method', '支付方式'], ['type', '类型']];
  if (!header.length) return '<p class="small muted">未能识别表头，请确认文件是 CSV 且首行或前 60 行内包含列名。</p>';
  return `<div class="grid2" style="margin-top:8px">${fields.map(([k, label]) => `<label class="field"><span>${label}</span><select data-map="${k}"><option value="">（无）</option>${header.map((c, idx) => `<option value="${idx}" ${f.result.mapping[k] === idx ? 'selected' : ''}>${h(c || '(空)')}</option>`).join('')}</select></label>`).join('')}</div>
  <div class="row" style="margin-top:8px"><button class="btn sm" data-remap="${i}">按此映射重新解析</button></div>`;
}
async function ingestFiles(files) {
  const session = state.importSession || { files: [] };
  const existing = new Set(live(state.transactions).map((t) => t.fingerprint));
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { text, encoding } = decodeBytes(bytes);
    const entry = { name: file.name, text, encoding, result: null, fresh: [], duplicates: [], catRate: 0 };
    analyze(entry, existing, {});
    session.files.push(entry);
  }
  state.importSession = session;
  render();
}
function analyze(entry, existing, opts) {
  entry.result = parseStatement(entry.text, opts);
  if (entry.result.error) { entry.fresh = []; entry.duplicates = []; return; }
  const seen = new Set(existing);
  // 同一批次内也去重（用户可能同时拖入两份重叠的账单）
  for (const f of (state.importSession ? state.importSession.files : [])) if (f !== entry) for (const r of f.fresh) seen.add(r.fingerprint);
  const { fresh, duplicates } = dedupe(entry.result.records, seen);
  const stats = categorizeAll(fresh, live(state.rules));
  entry.fresh = fresh; entry.duplicates = duplicates; entry.catRate = stats.rate;
}
function bindImport(view) {
  const drop = $('#drop', view); const input = $('#file', view);
  input.onchange = () => { if (input.files.length) ingestFiles([...input.files]); };
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { const files = [...e.dataTransfer.files]; if (files.length) ingestFiles(files); });
  const s = state.importSession;
  if (!s) return;
  $$('[data-remap]', view).forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.remap); const entry = s.files[i];
      const card = $(`[data-file="${i}"]`, view);
      const mapping = {};
      $$('[data-map]', card).forEach((sel) => { if (sel.value !== '') mapping[sel.dataset.map] = Number(sel.value); });
      const existing = new Set(live(state.transactions).map((t) => t.fingerprint));
      analyze(entry, existing, { mapping, source: entry.result.source });
      render();
    };
  });
  $$('[data-showskip]', view).forEach((btn) => {
    btn.onclick = () => {
      const f = s.files[Number(btn.dataset.showskip)];
      openSheet(`<h2>跳过的行</h2><div class="tablewrap"><table><thead><tr><th>行</th><th>原因</th><th>内容</th></tr></thead><tbody>${f.result.skipped.map((k) => `<tr><td class="num">${k.row}</td><td>${h(k.reason)}</td><td class="small muted">${h(k.raw.slice(0, 6).join(' | '))}</td></tr>`).join('')}</tbody></table></div><div class="row" style="margin-top:10px"><button class="btn" data-close="1">关闭</button></div>`);
    };
  });
  $('#cancelImport', view).onclick = () => { state.importSession = null; render(); };
  $('#confirmImport', view).onclick = async () => {
    const payer = $('#defaultPayer', view).value;
    const all = s.files.flatMap((f) => f.fresh);
    const now = Date.now();
    for (const r of all) { r.updatedAt = now; if (payer && !r.payerId) r.payerId = payer; }
    await state.store.bulkPut('transactions', all);
    state.transactions.push(...all);
    state.importSession = null;
    if (all.length) state.month = monthOf(all.sort((a, b) => (a.time < b.time ? 1 : -1))[0].time);
    toast(`已导入 ${all.length} 条记录`);
    location.hash = '#/ledger';
  };
}

// ---------- 报表 ----------
function periodTxns() {
  const r = state.report;
  return live(state.transactions).filter((t) => (r.mode === 'month' ? monthOf(t.time) === r.month : t.time.slice(0, 4) === String(r.year)));
}
function reportsView() {
  const r = state.report;
  const txns = periodTxns();
  const t = totals(txns);
  const byCat = {};
  for (const x of txns) if (x.direction === 'expense') byCat[x.category] = (byCat[x.category] || 0) + x.amount;
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const byCp = {};
  for (const x of txns) if (x.direction === 'expense') byCp[x.counterparty || x.item || '（未知）'] = (byCp[x.counterparty || x.item || '（未知）'] || 0) + x.amount;
  const topCp = Object.entries(byCp).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const budgets = live(state.budgets);
  const members = live(state.members);
  const summary = members.length ? memberSummary(txns, members).filter((m) => m.paid || m.owed) : [];
  const label = r.mode === 'month' ? r.month : `${r.year} 年`;
  return `<div class="stack">
    <div class="row between">
      <div class="row"><button class="btn sm" data-action="prev">◀</button><h1 class="num">${h(label)}</h1><button class="btn sm" data-action="next">▶</button></div>
      <div class="chips"><button class="chip ${r.mode === 'month' ? 'active' : ''}" data-mode="month">按月</button><button class="chip ${r.mode === 'year' ? 'active' : ''}" data-mode="year">按年</button></div>
    </div>
    <div class="kpis">
      <div class="kpi"><span>支出（已扣退款 ${money(t.refund)}）</span><b class="expense num">${money(t.netExpense)}</b></div>
      <div class="kpi"><span>收入</span><b class="income num">${money(t.income)}</b></div>
      <div class="kpi"><span>结余</span><b class="num">${money(t.net)}</b></div>
    </div>
    <div class="grid2">
      <div class="card"><h3>支出分类</h3><canvas id="catChart" aria-label="支出分类条形图"></canvas></div>
      <div class="card"><h3>近 ${r.mode === 'month' ? '6 个月' : '5 年'}趋势 <span class="small muted">红=支出 绿=收入</span></h3><canvas id="trendChart" aria-label="收支趋势"></canvas></div>
    </div>
    <div class="grid2">
      <div class="card"><h3>去哪儿了：Top 商户</h3>${topCp.length ? `<table>${topCp.map(([k, v]) => `<tr><td>${h(k)}</td><td class="num expense">${money(v)}</td><td class="num muted small">${Math.round((v / (t.expense || 1)) * 100)}%</td></tr>`).join('')}</table>` : '<p class="muted small">暂无支出</p>'}</div>
      <div class="card"><h3>预算 <a class="small" href="#/settings">设置</a></h3>${budgets.length ? budgets.map((b) => {
        const spent = byCat[b.category] || 0; const limit = r.mode === 'month' ? b.monthly : b.monthly * 12;
        return `<div style="margin-top:8px"><div class="row between small"><span>${h(b.category)}</span><span class="num">${money(spent)} / ${money(limit)}</span></div><canvas class="budget" data-ratio="${limit ? spent / limit : 0}" height="10"></canvas></div>`;
      }).join('') : '<p class="muted small">还没有预算。到「设置」里为分类设置每月预算。</p>'}</div>
    </div>
    ${summary.length ? `<div class="card"><h3>成员分摊（${h(label)}）</h3><div class="tablewrap"><table><thead><tr><th>成员</th><th class="num">实付</th><th class="num">应付</th><th class="num">净额</th></tr></thead><tbody>${summary.map((m) => `<tr><td>${h(m.name)}</td><td class="num">${money(m.paid)}</td><td class="num">${money(m.owed)}</td><td class="num ${m.net >= 0 ? 'income' : 'expense'}">${money(m.net)}</td></tr>`).join('')}</tbody></table></div><p class="small muted">净额为正表示别人欠他。完整结算见「分账」页。</p></div>` : ''}
  </div>`;
}
function bindReports(view) {
  const r = state.report;
  $('[data-action=prev]', view).onclick = () => { if (r.mode === 'month') r.month = shiftMonth(r.month, -1); else r.year--; render(); };
  $('[data-action=next]', view).onclick = () => { if (r.mode === 'month') r.month = shiftMonth(r.month, 1); else r.year++; render(); };
  $$('[data-mode]', view).forEach((c) => { c.onclick = () => { r.mode = c.dataset.mode; render(); }; });
  const txns = periodTxns();
  const byCat = {};
  for (const x of txns) if (x.direction === 'expense') byCat[x.category] = (byCat[x.category] || 0) + x.amount;
  drawHBars($('#catChart', view), Object.entries(byCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value), { color: getComputedStyle(document.documentElement).getPropertyValue('--expense').trim() });
  const points = [];
  if (r.mode === 'month') {
    for (let i = 5; i >= 0; i--) { const ym = shiftMonth(r.month, -i); const tt = totals(monthTxns(ym)); points.push({ label: ym.slice(5) + '月', a: tt.netExpense, b: tt.income }); }
  } else {
    for (let i = 4; i >= 0; i--) { const y = String(r.year - i); const tt = totals(live(state.transactions).filter((t) => t.time.slice(0, 4) === y)); points.push({ label: y, a: tt.netExpense, b: tt.income }); }
  }
  drawTrend($('#trendChart', view), points);
  $$('canvas.budget', view).forEach((c) => drawProgress(c, Number(c.dataset.ratio)));
}

// ---------- 分账 ----------
function membersView() {
  const members = live(state.members);
  const txns = live(state.transactions);
  const balances = computeBalances(txns, live(state.settlements));
  const transfers = settleUp(balances);
  const settlements = live(state.settlements).sort((a, b) => (a.time < b.time ? 1 : -1));
  const sharedCount = txns.filter((t) => t.split && t.split.mode !== 'none').length;
  return `<div class="stack">
    <h1>成员与分账</h1>
    <div class="card">
      <div class="row between"><h3>成员</h3><span class="small muted">${sharedCount} 笔已分摊</span></div>
      <div class="chips" style="margin-top:8px">${members.map((m) => `<span class="chip">${h(m.name)} <button class="btn sm" data-rename="${m.id}" title="重命名" style="border:0;padding:0 4px">✎</button><button class="btn sm" data-remove="${m.id}" title="移除" style="border:0;padding:0 4px">×</button></span>`).join('') || '<span class="small muted">还没有成员</span>'}</div>
      <form id="addMember" class="row" style="margin-top:10px"><input type="text" name="name" placeholder="成员名，如：我 / 小李" required style="flex:1;min-width:160px"><button class="btn primary" type="submit">添加</button></form>
      <p class="small muted" style="margin-top:8px">成员只是本地标签，不需要对方注册。把账本文件发给对方合并，就能各自看到同一份分摊。</p>
    </div>
    <div class="card">
      <h3>当前余额</h3>
      ${members.length ? `<table style="margin-top:6px">${members.map((m) => { const v = balances[m.id] || 0; return `<tr><td>${h(m.name)}</td><td class="num ${v > 0.005 ? 'income' : v < -0.005 ? 'expense' : 'muted'}">${v > 0.005 ? '应收 ' : v < -0.005 ? '应付 ' : ''}${money(Math.abs(v))}</td></tr>`; }).join('')}</table>` : '<p class="small muted">添加成员后，在账单记录里设置付款人与分摊方式。</p>'}
    </div>
    <div class="card">
      <h3>结算建议</h3>
      ${transfers.length ? transfers.map((tr) => `<div class="row between" style="margin-top:8px"><span>${h(memberName(tr.from))} → ${h(memberName(tr.to))} <b class="num">${money(tr.amount)}</b></span><button class="btn sm" data-settle="${tr.from}|${tr.to}|${tr.amount}">已转账，记录结算</button></div>`).join('') : '<p class="small muted">大家两清，无需结算。</p>'}
    </div>
    ${settlements.length ? `<div class="card"><h3>结算记录</h3><table style="margin-top:6px">${settlements.map((s) => `<tr><td class="small muted num">${h(s.time.slice(0, 16))}</td><td>${h(memberName(s.from))} → ${h(memberName(s.to))}</td><td class="num">${money(s.amount)}</td><td><button class="btn sm" data-unsettle="${s.id}">撤销</button></td></tr>`).join('')}</table></div>` : ''}
  </div>`;
}
function bindMembers(view) {
  $('#addMember', view).onsubmit = async (e) => {
    e.preventDefault();
    const name = e.target.elements.name.value.trim(); if (!name) return;
    await saveOne('members', { id: uuid(), name, deleted: false }); render();
  };
  $$('[data-rename]', view).forEach((b) => { b.onclick = async () => {
    const m = state.members.find((x) => x.id === b.dataset.rename);
    openSheet(`<h2>重命名</h2><form id="rn"><input type="text" name="name" value="${h(m.name)}" required><div class="row" style="margin-top:10px"><button class="btn" type="button" data-close="1">取消</button><button class="btn primary" type="submit">保存</button></div></form>`, (root) => {
      $('#rn', root).onsubmit = async (e) => { e.preventDefault(); m.name = e.target.elements.name.value.trim(); await saveOne('members', m); closeSheet(); render(); };
    });
  }; });
  $$('[data-remove]', view).forEach((b) => { b.onclick = async () => {
    const m = state.members.find((x) => x.id === b.dataset.remove);
    const used = live(state.transactions).some((t) => t.payerId === m.id || (t.split && ((t.split.members || []).includes(m.id) || (t.split.shares || {})[m.id] != null)));
    if (used && !b.dataset.confirm) { b.dataset.confirm = '1'; toast(`「${m.name}」已出现在分摊记录中，再点一次仍移除（历史记录会显示为已删除成员）`); return; }
    await softDelete('members', m); render();
  }; });
  $$('[data-settle]', view).forEach((b) => { b.onclick = async () => {
    const [from, to, amount] = b.dataset.settle.split('|');
    await saveOne('settlements', { id: uuid(), from, to, amount: Number(amount), time: nowLocal(), deleted: false });
    toast('已记录结算'); render();
  }; });
  $$('[data-unsettle]', view).forEach((b) => { b.onclick = async () => { const s = state.settlements.find((x) => x.id === b.dataset.unsettle); await softDelete('settlements', s); render(); }; });
}

// ---------- 设置 ----------
function settingsView() {
  const rules = live(state.rules);
  const budgets = live(state.budgets);
  const n = live(state.transactions).length;
  return `<div class="stack">
    <h1>设置</h1>
    <div class="card"><h3>账本</h3><form id="nameForm" class="row" style="margin-top:8px"><input type="text" name="name" value="${h(state.meta.name)}" style="flex:1;min-width:160px"><button class="btn" type="submit">改名</button></form>
      <p class="small muted" style="margin-top:6px">账本 ID <span class="mono">${h(state.meta.ledgerId.slice(0, 8))}</span> · ${n} 条记录 · 存储方式 ${h(state.store.kind === 'indexeddb' ? 'IndexedDB（本机）' : '内存 + localStorage 快照')} <span id="estimate"></span></p></div>
    <div class="card stack">
      <h3>共享与备份（零账号）</h3>
      <p class="small muted">导出的账本文件包含全部记录、成员、规则与预算。发给伴侣/室友，对方在这里「导入并合并」，双方各自修改后再互换文件即可保持一致：同一条记录以修改时间新者为准，重复导入的账单按指纹自动合并。</p>
      <div class="row"><input type="password" id="exportPwd" placeholder="可选：设置密码加密（AES-GCM）" style="flex:1;min-width:200px"><button class="btn primary" id="exportLedger">导出账本文件</button></div>
      <div class="row"><label class="btn" for="mergeFile">导入并合并账本文件…</label><input type="file" id="mergeFile" accept=".json,application/json" hidden><button class="btn" id="exportCsv">导出全部记录为 CSV</button><button class="btn sm" id="showLastExport" title="在不允许下载的环境里用复制的方式取回">下载没反应？显示文本</button></div>
    </div>
    <div class="card"><h3>归类规则（${rules.length}）</h3>
      <form id="ruleForm" class="row" style="margin-top:8px"><input type="text" name="pattern" placeholder="包含关键词，如：瑞幸" required style="flex:1;min-width:140px"><select name="category">${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select><button class="btn" type="submit">添加</button></form>
      ${rules.length ? `<table style="margin-top:8px">${rules.map((r) => `<tr><td>「${h(r.pattern)}」</td><td>→ ${h(r.category)}</td><td class="small muted">${h(r.field === 'counterparty' ? '交易对方' : r.field === 'item' ? '商品' : '任意')}</td><td><button class="btn sm" data-delrule="${r.id}">删除</button></td></tr>`).join('')}</table>` : '<p class="small muted" style="margin-top:6px">在账单里手改分类时可一键生成规则；用户规则优先于内置关键词。</p>'}
      <div class="row" style="margin-top:8px"><button class="btn sm" id="recat">用当前规则重新归类所有“自动归类”的记录</button></div>
    </div>
    <div class="card"><h3>每月预算</h3>
      <form id="budgetForm" class="row" style="margin-top:8px"><select name="category">${CATEGORIES.filter((c) => !INCOME_CATEGORIES.includes(c) || c === '其他').map((c) => `<option>${c}</option>`).join('')}</select><input type="number" name="monthly" step="1" min="0" placeholder="每月上限" required style="width:140px"><button class="btn" type="submit">保存</button></form>
      ${budgets.length ? `<table style="margin-top:8px">${budgets.map((b) => `<tr><td>${h(b.category)}</td><td class="num">${money(b.monthly)}</td><td><button class="btn sm" data-delbudget="${b.id}">删除</button></td></tr>`).join('')}</table>` : ''}
    </div>
    <div class="card"><h3>隐私</h3><p class="small muted">素账没有服务器、没有账号、没有统计埋点、没有广告。所有数据只存在这台设备的浏览器里；清除浏览器站点数据会一并删除，请定期导出账本文件备份。</p>
      <div class="row"><button class="btn" id="persist">申请持久化存储</button><span class="small muted" id="persistState"></span></div></div>
    <div class="card callout danger"><h3>清空全部数据</h3><p class="small">此操作不可撤销。请先导出账本文件。输入「清空」以确认。</p><div class="row"><input type="text" id="wipeText" placeholder="清空" style="width:120px"><button class="btn danger" id="wipe">清空</button></div></div>
    <p class="small muted">素账 PlainLedger v0.1 · MIT 许可 · 源自「无广告、不套会员、账单能导入、能多人共享、数据自己拿着」这一被反复提出却少有人满足的需求。</p>
  </div>`;
}
function bindSettings(view) {
  storageEstimate().then((e) => { if (e && e.usage != null) $('#estimate', view).textContent = `· 已用 ${(e.usage / 1024 / 1024).toFixed(1)} MB`; });
  $('#nameForm', view).onsubmit = async (e) => { e.preventDefault(); state.meta.name = e.target.elements.name.value.trim() || '我的账本'; await saveMeta(); toast('已改名'); };
  $('#exportLedger', view).onclick = async () => {
    const ledger = buildLedger({ meta: { name: state.meta.name, ledgerId: state.meta.ledgerId }, members: state.members, transactions: state.transactions, rules: state.rules, budgets: state.budgets, settlements: state.settlements });
    const pwd = $('#exportPwd', view).value;
    const payload = pwd ? await encryptJson(ledger, pwd) : ledger;
    const name = `素账-${state.meta.name}-${new Date().toISOString().slice(0, 10)}${pwd ? '.enc' : ''}.json`;
    download(name, JSON.stringify(payload, null, pwd ? 0 : 1));
    state.meta.lastExportAt = Date.now(); await saveMeta();
    toast(pwd ? '已导出（已加密）' : '已导出');
  };
  $('#mergeFile', view).onchange = async () => {
    const file = $('#mergeFile', view).files[0]; if (!file) return;
    let obj;
    try { obj = JSON.parse(await file.text()); } catch (e) { toast('不是有效的 JSON 文件'); return; }
    const doMerge = async (incoming) => {
      if (!isLedger(incoming)) { toast('不是素账账本文件'); return; }
      const local = buildLedger({ meta: state.meta, members: state.members, transactions: state.transactions, rules: state.rules, budgets: state.budgets, settlements: state.settlements });
      const { ledger, report } = mergeLedgers(local, incoming);
      for (const col of ['members', 'transactions', 'rules', 'budgets', 'settlements']) { state[col] = ledger[col]; await state.store.clear(col); await state.store.bulkPut(col, ledger[col]); }
      const s = report.transactions;
      openSheet(`<h2>合并完成</h2><table style="margin-top:8px">
        <tr><td>新增记录</td><td class="num">${s.added}</td></tr><tr><td>更新记录</td><td class="num">${s.updated}</td></tr><tr><td>未变化</td><td class="num">${s.unchanged}</td></tr>
        <tr><td>按指纹合并的重复导入</td><td class="num">${report.fingerprintDuplicates}</td></tr>
        <tr><td>成员 / 规则 / 预算 / 结算 新增</td><td class="num">${report.members.added} / ${report.rules.added} / ${report.budgets.added} / ${report.settlements.added}</td></tr></table>
        <p class="small muted" style="margin-top:8px">来自「${h(incoming.meta && incoming.meta.name)}」，导出于 ${h(incoming.exportedAt || '')}</p>
        <div class="row" style="margin-top:10px"><button class="btn primary" data-close="1">好</button></div>`);
      render();
    };
    if (isEncrypted(obj)) {
      openSheet(`<h2>输入密码</h2><form id="pwdForm"><input type="password" name="pwd" placeholder="账本文件密码" required autofocus><div class="row" style="margin-top:10px"><button class="btn" type="button" data-close="1">取消</button><button class="btn primary" type="submit">解密并合并</button></div></form>`, (root) => {
        $('#pwdForm', root).onsubmit = async (e) => { e.preventDefault(); try { const dec = await decryptJson(obj, e.target.elements.pwd.value); closeSheet(); await doMerge(dec); } catch (err) { toast('密码错误或文件损坏'); } };
      });
    } else await doMerge(obj);
    $('#mergeFile', view).value = '';
  };
  $('#showLastExport', view).onclick = () => { if (lastExport) showTextFallback(lastExport.filename, lastExport.text); else toast('还没有导出过内容'); };
  $('#exportCsv', view).onclick = () => {
    const rows = [['时间', '收/支', '金额', '分类', '交易对方', '商品/说明', '备注', '来源', '类型', '状态', '订单号', '付款人', '分摊']];
    for (const t of live(state.transactions).sort((a, b) => (a.time < b.time ? -1 : 1))) {
      rows.push([t.time, { expense: '支出', income: '收入', neutral: '中性' }[t.direction], t.amount.toFixed(2), t.category, t.counterparty, t.item, t.note, srcName(t.source), t.type, t.status, t.orderId, memberName(t.payerId), t.split && t.split.mode !== 'none' ? Object.entries(sharesOf(t.amount, t.split)).map(([id, v]) => `${memberName(id)}:${v}`).join(';') : '']);
    }
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    download(`素账-全部记录-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
  };
  $('#ruleForm', view).onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    await saveOne('rules', { id: uuid(), pattern: f.pattern.value.trim(), category: f.category.value, field: 'any', deleted: false });
    render();
  };
  $$('[data-delrule]', view).forEach((b) => { b.onclick = async () => { await softDelete('rules', state.rules.find((r) => r.id === b.dataset.delrule)); render(); }; });
  $('#recat', view).onclick = async () => {
    const rules = live(state.rules);
    const targets = live(state.transactions).filter((t) => t.categoryBy !== 'user');
    let changed = 0;
    for (const t of targets) { const { category, by } = categorize(t, rules); if (category !== t.category) { t.category = category; t.categoryBy = by; t.updatedAt = Date.now(); changed++; } }
    await saveMany('transactions', targets);
    toast(`重新归类完成，${changed} 条发生变化`);
  };
  $('#budgetForm', view).onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target.elements; const cat = f.category.value; const monthly = Number(f.monthly.value);
    let b = state.budgets.find((x) => x.category === cat && !x.deleted);
    if (!b) { b = { id: uuid(), category: cat, monthly, deleted: false }; } else b.monthly = monthly;
    await saveOne('budgets', b); render();
  };
  $$('[data-delbudget]', view).forEach((b) => { b.onclick = async () => { await softDelete('budgets', state.budgets.find((x) => x.id === b.dataset.delbudget)); render(); }; });
  $('#persist', view).onclick = async () => { const ok = await requestPersistence(); $('#persistState', view).textContent = ok ? '已持久化：浏览器不会自动清理本站数据' : '浏览器未授予（安装为 PWA 后通常会自动授予）'; };
  $('#wipe', view).onclick = async () => {
    if ($('#wipeText', view).value.trim() !== '清空') { toast('请输入「清空」确认'); return; }
    for (const col of ['transactions', 'members', 'rules', 'budgets', 'settlements']) { await state.store.clear(col); state[col] = []; }
    toast('已清空'); render();
  };
}

// ---------- 启动 ----------
async function init() {
  state.store = await openStore();
  await loadAll();
  $('#storageBadge').textContent = state.store.kind === 'indexeddb' ? '本地存储' : '临时存储';
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
init();
