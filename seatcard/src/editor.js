// 会议编辑页：左边名单，右边座次图 / 桌签。所有改动自动保存，可以撤销。
import { esc, $, $$, icon, typeArt, toast, popMenu, debounce, pickFiles, readDropped } from './dom.js';
import {
  TYPES, displayTitle, guessTitle, peopleInOrder, autoSort, addFromText, addPerson, removePeople, swapPeople,
  layoutOf, changedSincePrint, markPrinted, checks, setType,
} from './meeting.js';
import { rankOf } from './rank.js';
import { roleName } from './round.js';
import { layoutRows, toCsv } from './layout.js';
import { PRESETS } from './cards.js';
import { chartSvg, cardPages, FONTS } from './render.js';
import { History } from './history.js';
import { cleanName, parseRoster } from './parse.js';
import { importDialog, printDialog, sortDialog, rulesDialog, filesToText } from './dialogs.js';
import { desktop, printNow, savePdf, saveFile, showInFolder, modKey, setTitle } from './platform.js';
import { SAMPLES } from './samples.js';

const ACCEPT = '.xlsx,.xlsm,.docx,.csv,.txt,.tsv,.xls,.doc,.et,.wps';
const isField = (el) => el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button'].includes(el.type)) || el.isContentEditable);

const measureCache = new Map();
function makeMeasure(fontCss, weight) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${weight} 100px ${fontCss}`;
  return (text) => {
    const key = `${fontCss}|${weight}|${text}`;
    if (!measureCache.has(key)) measureCache.set(key, ctx.measureText(text).width / 100);
    return measureCache.get(key);
  };
}

export function createEditor(root, { store, meeting, onExit, onDuplicate }) {
  let m = meeting;
  const hist = new History();
  let sel = null; // 选中的人
  let swapFrom = null; // 等着点第二个座位互换
  let tab = store.prefs().tab === 'cards' ? 'cards' : 'chart';
  let typing = false; // 这一轮输入是否已经记过撤销点
  let pendingSort = false;
  let zoom = 0; // 0 = 适应窗口，否则为放大倍数
  const fresh = new Set(); // 刚加的空行：没填就离开时自动去掉
  let importNotes = []; // 上次导入时的提醒（重名等）
  const dirty = { chart: true, cards: true };

  root.innerHTML = `<div class="editor">
  <header class="bar">
    <button type="button" class="bar-back" id="e-back" title="回到会议列表">${icon('back')}<span>会议列表</span></button>
    <div class="bar-title">
      <input id="e-title" class="title-input" placeholder="会议名称（会印在座次图上）" aria-label="会议名称" autocomplete="off" spellcheck="false">
      <input id="e-date" type="date" class="date-input" aria-label="会议日期">
    </div>
    <div class="seg" id="e-type" role="radiogroup" aria-label="会议类型">
      ${Object.entries(TYPES).map(([k, t]) => `<button type="button" role="radio" data-type="${k}" title="${esc(t.hint)}">${t.label}</button>`).join('')}
    </div>
    <div class="bar-right">
      <span class="saved" id="e-saved" aria-live="polite"></span>
      <button type="button" class="icon-btn" id="e-undo" title="撤销（${modKey}+Z）" aria-label="撤销">${icon('undo')}</button>
      <button type="button" class="icon-btn" id="e-redo" title="重做（${modKey}+Shift+Z）" aria-label="重做">${icon('redo')}</button>
      <button type="button" id="e-export">${icon('download', 16)}<span>导出</span>${icon('chevron', 14)}</button>
      <button type="button" class="primary" id="e-print">${icon('print', 16)}<span>打印…</span></button>
    </div>
  </header>
  <main class="work">
    <section class="pane roster-pane" id="e-roster-pane" aria-label="名单">
      <div class="pane-head">
        <h2>名单<span class="count" id="e-count"></span></h2>
        <div class="pane-tools">
          <button type="button" id="e-import" title="粘贴名单，或者导入 Excel、Word 文件（${modKey}+O）">${icon('paste', 16)}导入 / 粘贴</button>
          <button type="button" id="e-add" title="在名单最后加一个人">${icon('plus', 16)}加一人</button>
        </div>
      </div>
      <div class="sortbar" id="e-sortbar"></div>
      <div class="checks" id="e-checks"></div>
      <div class="roster-scroll" id="e-roster"></div>
      <div class="dropcover" aria-hidden="true">${icon('upload', 34)}<b>松开鼠标，导入名单</b></div>
    </section>
    <section class="pane view-pane" aria-label="座次图和桌签">
      <div class="pane-head">
        <div class="seg tabs" role="tablist" id="e-tabs">
          <button type="button" role="tab" data-tab="chart">座次图</button>
          <button type="button" role="tab" data-tab="cards">桌签</button>
        </div>
        <div class="view-tools for-chart" id="e-chart-tools">
          <label>尊位 <select data-s="rule"><option value="left">以左为尊</option><option value="right">以右为尊</option></select></label>
          <label class="only-podium">每排 <select data-s="perRow"><option value="0">全坐一排</option>${Array.from({ length: 23 }, (_, i) => i + 3).map((n) => `<option value="${n}">最多 ${n} 人</option>`).join('')}</select></label>
          <label class="only-facing check"><input type="checkbox" data-s="alignFirst"> 1 号对 1 号</label>
          <label class="only-round">每桌 <select data-s="tableSize">${Array.from({ length: 19 }, (_, i) => i + 6).map((n) => `<option value="${n}">${n} 人</option>`).join('')}</select></label>
          <label class="only-round">坐法 <select data-s="scheme"><option value="pair">主陪 + 副陪</option><option value="single">主人居中</option></select></label>
          <label class="not-round">看图方向 <select data-s="view"><option value="front">从台下 / 门口看</option><option value="back">从台上 / 里侧看</option></select></label>
          <button type="button" class="link" id="e-howto">${icon('help', 15)}左右怎么算</button>
        </div>
        <div class="view-tools for-cards" id="e-card-tools">
          <label>版式 <select data-c="preset">${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join('')}<option value="custom">自定义尺寸</option></select></label>
          <label class="only-custom">每面宽 <input type="number" data-c="customW" min="40" max="297" class="num"> 高 <input type="number" data-c="customH" min="20" max="148" class="num"> 毫米</label>
          <label>字体 <select data-c="font">${Object.entries(FONTS).map(([k, f]) => `<option value="${k}">${esc(f.label)}</option>`).join('')}</select></label>
          <label>颜色 <select data-c="color"><option value="#000000">黑色</option><option value="#c00000">红色</option></select></label>
          <label>第二行 <select data-c="sub"><option value="none">不印</option><option value="title">印职务</option><option value="unit">印单位</option></select></label>
          <label class="check"><input type="checkbox" data-c="bold"> 加粗</label>
          <label class="check"><input type="checkbox" data-c="widen"> 两字名加宽</label>
          <label class="check"><input type="checkbox" data-c="guides"> 折线和裁切线</label>
        </div>
      </div>
      <div class="view for-chart" id="e-chart-view">
        <div class="selbar" id="e-selbar" hidden></div>
        <div class="chart-stage" id="e-chart"></div>
        <div class="hint" id="e-chart-hint"><span>${icon('swap', 14)} 按住一个座位拖到另一个座位上，两人互换位置；点一下座位可以选中。</span>
          <span class="zoom" role="group" aria-label="缩放座次图"><button type="button" class="icon-btn" data-zoom="-1" title="缩小" aria-label="缩小">－</button><button type="button" class="link" data-zoom="0" id="e-zoom">适应窗口</button><button type="button" class="icon-btn" data-zoom="1" title="放大" aria-label="放大">＋</button></span></div>
      </div>
      <div class="view for-cards" id="e-cards-view">
        <div class="cards-sum" id="e-cards-sum"></div>
        <div class="sheets" id="e-sheets"></div>
      </div>
    </section>
  </main>
</div>`;

  const ed = $('.editor', root);
  const rosterPane = $('#e-roster-pane', root);
  const roster = $('#e-roster', root);
  const stage = $('#e-chart', root);

  // ---------- 数据与保存 ----------
  const person = (id) => m.people.find((p) => p.id === id);
  const named = () => peopleInOrder(m).filter((p) => p.name);
  const grouped = () => m.type !== 'podium';
  const sideOf = (id) => (person(id)?.side === 'guest' ? 'guest' : 'host');

  const savedEl = $('#e-saved', root);
  const saveSoon = debounce(() => {
    const ok = store.save(m);
    savedEl.className = `saved ${ok ? 'ok' : 'bad'}`;
    savedEl.innerHTML = ok ? `${icon('check', 14)}已自动保存` : '保存失败！请先"导出"留一份';
  }, 350);
  function save() {
    savedEl.className = 'saved';
    savedEl.textContent = '保存中…';
    saveSoon();
  }

  /** 改数据的统一入口：先记撤销点，再改，再保存、重画。 */
  function commit(fn, { roster: redrawRoster = true } = {}) {
    hist.record(m);
    typing = false;
    const out = fn();
    save();
    renderAll({ roster: redrawRoster });
    return out;
  }

  function undo() {
    const prev = hist.undo(m);
    if (!prev) { toast('没有可以撤销的了'); return; }
    m = prev;
    afterRestore();
  }
  function redo() {
    const next = hist.redo(m);
    if (!next) return;
    m = next;
    afterRestore();
  }
  function afterRestore() {
    typing = false;
    pendingSort = false;
    if (sel && !person(sel)) sel = null;
    swapFrom = null;
    save();
    renderAll();
  }

  // ---------- 画界面 ----------
  function renderAll({ roster: redrawRoster = true } = {}) {
    renderBar();
    if (redrawRoster) renderRoster();
    renderSortbar();
    renderChecks();
    dirty.chart = true;
    dirty.cards = true;
    renderView();
    renderSelbar();
  }
  const renderViewSoon = debounce(() => { dirty.chart = true; dirty.cards = true; renderView(); }, 200);

  function renderBar() {
    ed.dataset.type = m.type;
    ed.dataset.tab = tab;
    ed.dataset.preset = m.settings.card.preset;
    const title = $('#e-title', root);
    if (document.activeElement !== title) title.value = m.title;
    $('#e-date', root).value = m.date || '';
    $$('#e-type button', root).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.type === m.type)));
    $$('#e-tabs button', root).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $('#e-undo', root).disabled = !hist.canUndo;
    $('#e-redo', root).disabled = !hist.canRedo;
    const n = named().length;
    $('#e-count', root).textContent = n ? `${n} 人` : '';
    // 设置项
    $$('[data-s]', root).forEach((el) => {
      const v = m.settings[el.dataset.s];
      if (el.type === 'checkbox') el.checked = Boolean(v); else el.value = String(v);
    });
    $$('[data-c]', root).forEach((el) => {
      const v = m.settings.card[el.dataset.c];
      if (el.type === 'checkbox') el.checked = Boolean(v); else if (document.activeElement !== el) el.value = String(v);
    });
    setTitle(displayTitle(m));
  }

  function numberLabel(p, n) {
    if (m.type === 'round') return roleName(p.side === 'guest' ? 'guest' : 'host', n, m.settings.scheme);
    return String(n + 1);
  }

  function rowHtml(p, label) {
    const tier = rankOf(p.title, { partyFirst: m.settings.partyFirst }).label;
    const guest = p.side === 'guest';
    return `<tr data-id="${esc(p.id)}" class="${p.id === sel ? 'sel' : ''}">
  <td class="c-no"><span class="grip" draggable="true" title="按住拖动，调整位次">${icon('grip', 14)}</span><span class="no" title="${p.name ? `自动排序依据：${esc(tier)}` : '没填姓名，不排座次'}">${esc(label)}</span></td>
  <td class="c-name"><input class="cell" data-f="name" value="${esc(p.name)}" placeholder="姓名" spellcheck="false" autocomplete="off" aria-label="姓名"></td>
  <td class="c-title"><input class="cell" data-f="title" value="${esc(p.title)}" placeholder="职务" spellcheck="false" autocomplete="off" aria-label="职务"></td>
  <td class="c-unit"><input class="cell" data-f="unit" value="${esc(p.unit)}" placeholder="单位" spellcheck="false" autocomplete="off" aria-label="单位"></td>
  <td class="c-side"><button type="button" class="side ${guest ? 'guest' : 'host'}" title="点一下在主方、客方之间切换" aria-label="${guest ? '客方，点击改为主方' : '主方，点击改为客方'}">${guest ? '客' : '主'}</button></td>
  <td class="c-x"><button type="button" class="x" title="删除这一行" aria-label="删除 ${esc(p.name)}">${icon('x', 14)}</button></td>
</tr>`;
  }

  function captureFocus() {
    const a = document.activeElement;
    if (!a || !roster.contains(a) || !a.classList.contains('cell')) return null;
    return { id: a.closest('tr').dataset.id, f: a.dataset.f, s: a.selectionStart, e: a.selectionEnd };
  }
  function focusCell(id, f, range = null) {
    const el = roster.querySelector(`tr[data-id="${CSS.escape(id)}"] .cell[data-f="${f}"]`);
    if (!el) return false;
    el.focus();
    try { if (range) el.setSelectionRange(range[0], range[1]); else el.select(); } catch (e) { /* 忽略 */ }
    return true;
  }

  function renderRoster() {
    const f = captureFocus();
    if (!m.people.length) {
      roster.innerHTML = `<div class="empty-roster">
  ${icon('upload', 36)}
  <h3>把名单放进来</h3>
  <p>把 Excel 或 Word 名单文件<b>拖到这里</b>，<br>或者在 Excel 里选中"姓名、职务、单位"几列，复制后按 <kbd>${modKey}</kbd> + <kbd>V</kbd></p>
  <div class="row-center">
    <button type="button" class="primary" data-empty="import">${icon('paste', 16)}导入 / 粘贴名单</button>
    <button type="button" data-empty="add">${icon('plus', 16)}一个个添加</button>
  </div>
  <p class="muted small">第一次用？<button type="button" class="link" data-empty="sample">填入示例名单看看效果</button></p>
</div>`;
      return;
    }
    const cols = grouped() ? 6 : 5;
    const groups = grouped()
      ? [
        { side: 'guest', label: m.type === 'round' ? '客方（宾）' : '客方', note: m.type === 'facing' ? '坐面对门的一侧' : '' },
        { side: 'host', label: m.type === 'round' ? '主方（陪）' : '主方', note: m.type === 'facing' ? '坐背对门的一侧' : '' },
      ]
      : [{ side: '', label: '' }];
    const list = peopleInOrder(m);
    let html = `<table class="roster${grouped() ? ' grouped' : ''}"><thead><tr><th class="c-no">${m.type === 'round' ? '称呼' : '位次'}</th><th class="c-name">姓名</th><th class="c-title">职务</th><th class="c-unit">单位</th><th class="c-side">主/客</th><th class="c-x"></th></tr></thead>`;
    for (const g of groups) {
      const members = g.side ? list.filter((p) => (p.side === 'guest' ? 'guest' : 'host') === g.side) : list;
      html += `<tbody data-side="${g.side}">`;
      if (g.side) {
        const cnt = members.filter((p) => p.name).length;
        html += `<tr class="grp"><td colspan="${cols}"><b>${g.label}</b><span class="muted">${cnt} 人${g.note ? ` · ${g.note}` : ''}</span></td></tr>`;
        if (!members.length) html += `<tr class="grp-empty"><td colspan="${cols}">还没有人。点下面加一位，或者把名单里的人拖到这里，也可以点某一行右边的"${g.side === 'guest' ? '主' : '客'}"切换。</td></tr>`;
      }
      let n = 0;
      for (const p of members) html += rowHtml(p, p.name ? numberLabel(p, n++) : '·');
      if (g.side) html += `<tr class="addrow"><td colspan="${cols}"><button type="button" class="link" data-add="${g.side}">${icon('plus', 14)}加一位${g.side === 'guest' ? '客人' : '主方人员'}</button></td></tr>`;
      html += '</tbody>';
    }
    html += '</table>';
    roster.innerHTML = html;
    if (f) focusCell(f.id, f.f, [f.s, f.e]);
  }

  function renderSortbar() {
    const bar = $('#e-sortbar', root);
    if (!m.people.length) { bar.innerHTML = ''; return; }
    bar.innerHTML = m.sortMode === 'auto'
      ? `<span class="sort-state">${icon('sort', 15)}已按职务自动排序</span><span class="muted">拖动左边的 ${icon('grip', 12)} 可以手动调</span><button type="button" class="link" data-sort="cfg">排序规则</button>`
      : `<span class="sort-state manual">${icon('sort', 15)}手动顺序</span><button type="button" class="link" data-sort="auto">重新按职务排序</button><button type="button" class="link" data-sort="cfg">排序规则</button>`;
  }

  function renderChecks() {
    const box = $('#e-checks', root);
    const items = [...checks(m), ...importNotes];
    box.innerHTML = items.map((t) => `<div class="check-item">${icon('help', 15)}<span>${esc(t)}</span></div>`).join('');
  }

  function renderView() {
    if (tab === 'chart' && dirty.chart) { renderChart(); dirty.chart = false; }
    if (tab === 'cards' && dirty.cards) { renderCards(); dirty.cards = false; }
  }

  function currentChart({ forPrint = false } = {}) {
    return chartSvg(layoutOf(m), {
      mirror: m.type !== 'round' && m.settings.view === 'back',
      title: m.title.trim(),
      selectedId: forPrint ? null : sel,
    });
  }

  function renderChart() {
    if (!named().length) {
      stage.innerHTML = `<div class="view-empty">${typeArt(m.type, 110)}<p>名单里有了人，这里自动画出${TYPES[m.type].label}座次图</p></div>`;
      $('#e-chart-hint', root).hidden = true;
      return;
    }
    stage.innerHTML = currentChart();
    stage.classList.toggle('swapping', Boolean(swapFrom));
    applyZoom();
    $('#e-chart-hint', root).hidden = false;
  }

  function applyZoom() {
    const svg = stage.querySelector('svg');
    $('#e-zoom', root).textContent = zoom ? `${Math.round(zoom * 100)}%` : '适应窗口';
    stage.classList.toggle('zoomed', Boolean(zoom));
    if (!svg) return;
    const w = Number(svg.getAttribute('width'));
    svg.style.width = zoom ? `${w * zoom}px` : '';
    svg.style.maxWidth = zoom ? 'none' : '';
  }
  function setZoom(step) {
    const svg = stage.querySelector('svg');
    if (!svg) return;
    if (step === 0) { zoom = 0; applyZoom(); return; }
    const fit = svg.getBoundingClientRect().width / Number(svg.getAttribute('width'));
    const cur = zoom || fit;
    const next = Math.min(3, Math.max(0.4, Math.round((cur + step * 0.25) * 4) / 4));
    zoom = next;
    applyZoom();
  }

  function cardOpts() {
    const c = m.settings.card;
    const font = FONTS[c.font] || FONTS.song;
    let preset = PRESETS[c.preset];
    if (c.preset === 'custom' || !preset) {
      const w = Math.min(Math.max(Number(c.customW) || 200, 40), 297);
      const h = Math.min(Math.max(Number(c.customH) || 90, 20), 148);
      preset = { faceW: w, faceH: h, faces: 2 };
    }
    return { preset, font: font.css, bold: c.bold, color: c.color, sub: c.sub, widenTwo: c.widen, guides: c.guides, measure: makeMeasure(font.css, c.bold ? 700 : 400) };
  }

  function renderCards() {
    const people = named();
    const sum = $('#e-cards-sum', root);
    const box = $('#e-sheets', root);
    if (!people.length) {
      sum.innerHTML = '';
      box.innerHTML = `<div class="view-empty">${icon('user', 48)}<p>名单里有了人，这里显示每个人的桌签，一页一页和打出来的一样</p></div>`;
      return;
    }
    let res;
    try {
      res = cardPages(people, cardOpts());
    } catch (e) {
      sum.textContent = '';
      box.innerHTML = `<div class="view-empty"><p>${esc(e.message)}</p></div>`;
      return;
    }
    const { page, perPage, pages } = res;
    const changed = new Set(changedSincePrint(m).map((p) => p.id));
    const everPrinted = Object.keys(m.printed).length > 0;
    const status = changed.size === 0
      ? `<span class="pill ok">${icon('check', 13)}全部打印过</span>`
      : everPrinted ? `<span class="pill new">${changed.size} 人新增或改过，还没打印</span>` : '<span class="pill">还没打印过</span>';
    sum.innerHTML = `<span>共 ${people.length} 人，${pages.length} 页 A4（${page.landscape ? '横放' : '竖放'}${perPage > 1 ? `，每页 ${perPage} 人` : '，一页一人'}）</span>${status}
<span class="muted small">上半面的字是倒着印的：沿中间虚线对折、立起来，两面都是正的。</span>`;
    box.innerHTML = pages.map((svg, i) => {
      const group = people.slice(i * perPage, (i + 1) * perPage);
      const st = group.some((p) => changed.has(p.id)) ? (group.some((p) => m.printed[p.id]) ? ['new', '有改动'] : ['', '未打印']) : ['ok', '已打印'];
      return `<figure class="sheet${group.some((p) => p.id === sel) ? ' sel' : ''}" data-id="${esc(group[0].id)}">
  <div class="paper" style="aspect-ratio:${page.w} / ${page.h}">${svg}</div>
  <figcaption><span class="pg">${i + 1}</span><span class="nm">${group.map((p) => esc(p.name)).join('、')}</span><span class="pill ${st[0]}">${st[1]}</span></figcaption>
</figure>`;
    }).join('');
  }

  function renderSelbar() {
    const bar = $('#e-selbar', root);
    const p = sel && person(sel);
    if (!p || !p.name) { bar.hidden = true; return; }
    bar.hidden = false;
    if (swapFrom) {
      bar.innerHTML = `<span class="swap-tip">${icon('swap', 16)}请点另一个座位，和 <b>${esc(p.name)}</b> 互换</span><button type="button" data-sb="cancel">取消</button>`;
      return;
    }
    const sameSide = peopleInOrder(m).filter((x) => x.name && (!grouped() || sideOf(x.id) === sideOf(p.id)));
    const k = sameSide.findIndex((x) => x.id === p.id);
    const where = m.type === 'round' ? roleName(sideOf(p.id), k, m.settings.scheme) : `${grouped() ? (sideOf(p.id) === 'guest' ? '客方' : '主方') : ''}第 ${k + 1} 位`;
    bar.innerHTML = `<span class="who"><b>${esc(p.name)}</b><span class="muted">${esc(p.title || '')}${p.title ? ' · ' : ''}${esc(where)}</span></span>
<button type="button" data-sb="up"${k === 0 ? ' disabled' : ''}>${icon('up', 15)}位次提前</button>
<button type="button" data-sb="down"${k === sameSide.length - 1 ? ' disabled' : ''}>${icon('down', 15)}位次靠后</button>
<button type="button" data-sb="swap">${icon('swap', 15)}和别人换座</button>
<button type="button" data-sb="del" class="danger-ghost">${icon('trash', 15)}删除</button>
<button type="button" class="icon-btn" data-sb="close" aria-label="取消选中" title="取消选中（Esc）">${icon('x', 15)}</button>`;
  }

  // ---------- 选中 ----------
  function select(id, { from = '' } = {}) {
    if (sel === id && from !== 'chart') return;
    sel = id;
    $$('tr.sel', roster).forEach((tr) => tr.classList.remove('sel'));
    if (id) roster.querySelector(`tr[data-id="${CSS.escape(id)}"]`)?.classList.add('sel');
    $$('g.seat', stage).forEach((g) => g.classList.toggle('selected', g.dataset.id === id));
    $$('.sheet', root).forEach((s) => s.classList.remove('sel'));
    renderSelbar();
    if (id && from === 'chart') {
      const tr = roster.querySelector(`tr[data-id="${CSS.escape(id)}"]`);
      if (tr) { tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); flash(id); }
    }
  }
  function flash(id) {
    const tr = roster.querySelector(`tr[data-id="${CSS.escape(id)}"]`);
    if (!tr) return;
    tr.classList.remove('flash');
    void tr.offsetWidth;
    tr.classList.add('flash');
  }

  // ---------- 名单操作 ----------
  function moveStep(id, dir) {
    const order = m.order;
    const i = order.indexOf(id);
    let j = i + dir;
    const ok = (x) => person(x)?.name && (!grouped() || sideOf(x) === sideOf(id));
    while (j >= 0 && j < order.length && !ok(order[j])) j += dir;
    if (i < 0 || j < 0 || j >= order.length) return false;
    commit(() => {
      [order[i], order[j]] = [order[j], order[i]];
      m.sortMode = 'manual';
    });
    flash(id);
    return true;
  }

  function deletePeople(ids) {
    const names = ids.map((id) => person(id)?.name).filter(Boolean);
    commit(() => removePeople(m, ids));
    if (ids.includes(sel)) { sel = null; swapFrom = null; renderSelbar(); }
    toast(names.length ? `已删除 ${names.join('、')}` : '已删除空行', { action: '撤销', onAction: undo });
  }

  function addOne(side = 'host', afterId = null) {
    const p = commit(() => addPerson(m, { side }, afterId));
    fresh.add(p.id);
    focusCell(p.id, 'name');
    return p;
  }

  function doSwap(a, b) {
    const pa = person(a);
    const pb = person(b);
    if (!pa || !pb || a === b) return;
    commit(() => swapPeople(m, a, b));
    swapFrom = null;
    select(a);
    toast(`${pa.name} 和 ${pb.name} 已互换座位`, { action: '撤销', onAction: undo });
  }

  function importText(text, mode = 'replace', { fileName = '' } = {}) {
    const parsed = parseRoster(text);
    if (!parsed.people.length) {
      toast('没认出名单里的人。试试从 Excel 复制"姓名、职务、单位"几列再粘贴', { kind: 'bad', timeout: 7000 });
      return;
    }
    const wasEmpty = !m.people.length;
    const res = commit(() => {
      const r = addFromText(m, text, mode);
      if (!m.title.trim()) m.title = guessTitle(text, fileName);
      // 名单里分了主客，而当前是主席台：多半是会见或宴请
      if (wasEmpty && m.type === 'podium' && r.added.some((p) => p.side === 'guest')) setType(m, 'facing');
      return r;
    });
    importNotes = res.warnings.slice(0, 5);
    renderChecks();
    const skipped = res.skipped.length ? `，${res.skipped.length} 人已在名单里，跳过` : '';
    toast(`已导入 ${res.added.length} 人${skipped}`, { action: '撤销', onAction: undo, timeout: 6000 });
  }

  async function openImport({ text = '', files = [] } = {}) {
    const r = await importDialog({ existing: m.people.filter((p) => p.name), type: m.type, text, files });
    if (r) importText(r.text, r.mode);
  }

  async function importFiles(files) {
    if (!files.length) return;
    if (m.people.length) { openImport({ files }); return; }
    const text = await filesToText(files, (msg) => toast(msg, { kind: 'bad', timeout: 8000 }));
    if (text !== null) importText(text, 'replace', { fileName: files[0].name });
  }

  function fillSample() {
    const s = SAMPLES[m.type];
    importText(s.text, m.people.length ? 'append' : 'replace');
    if (!m.title.trim()) { m.title = s.title; save(); renderBar(); dirty.chart = true; renderView(); }
  }

  // ---------- 打印与导出 ----------
  function chartPage() {
    const svg = currentChart({ forPrint: true });
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    const [w, h] = vb ? [Number(vb[1]), Number(vb[2])] : [800, 500];
    const landscape = w >= h * 0.9;
    const page = landscape ? { w: 297, h: 210 } : { w: 210, h: 297 };
    // 1 像素最多按 0.42 毫米放大，人少时座位不至于大得离谱
    const scale = Math.min((page.w - 24) / w, (page.h - 24) / h, 0.42);
    const sized = svg.replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${(w * scale).toFixed(1)}mm" height="${(h * scale).toFixed(1)}mm"`);
    return { page, pages: [`<div class="chart-print">${sized}</div>`] };
  }

  function mountPrint(pages, page) {
    const rootEl = document.getElementById('print-root');
    rootEl.innerHTML = pages.map((svg) => `<div class="print-page" style="width:${page.w}mm;height:${page.h}mm">${svg}</div>`).join('');
    let style = document.getElementById('print-page-size');
    if (!style) {
      style = document.createElement('style');
      style.id = 'print-page-size';
      document.head.appendChild(style);
    }
    style.textContent = `@page { size: ${page.w}mm ${page.h}mm; margin: 0; }`;
  }
  function unmountPrint() {
    document.getElementById('print-root').innerHTML = '';
  }

  async function output({ what, range = 'all', target = 'print' }) {
    const all = named();
    if (!all.length) { toast('名单还是空的，先导入名单'); return; }
    let list = [];
    let built;
    if (what === 'cards') {
      list = range === 'changed' ? changedSincePrint(m) : all;
      if (!list.length) { toast('没有需要打印的桌签'); return; }
      built = cardPages(list, cardOpts());
    } else {
      built = chartPage();
    }
    mountPrint(built.pages, built.page);
    const base = `${displayTitle(m)}-${what === 'cards' ? '桌签' : '座次图'}`;
    let ok = false;
    try {
      if (target === 'pdf') {
        const path = await savePdf(`${base}.pdf`, { landscape: built.page.w > built.page.h });
        ok = Boolean(path);
        if (path) toast(`已存为 PDF：${path.split(/[\\/]/).pop()}`, { action: '打开所在文件夹', onAction: () => showInFolder(path), timeout: 8000 });
      } else {
        ok = await printNow({ landscape: built.page.w > built.page.h });
      }
    } catch (e) {
      toast(`没有成功：${e.message}`, { kind: 'bad', timeout: 8000 });
    } finally {
      unmountPrint();
    }
    if (ok && what === 'cards') {
      commit(() => markPrinted(m, list), { roster: false });
      if (target === 'print') {
        toast(`已发送 ${list.length} 张桌签去打印`, desktop ? {} : { action: '没打成？撤销"已打印"标记', onAction: undo, timeout: 8000 });
      }
    }
  }

  async function openPrint(initial = tab === 'cards' ? 'cards' : 'chart') {
    const people = named();
    if (!people.length) { toast('名单还是空的，先导入名单'); return; }
    const cards = cardPages(people, cardOpts());
    const ch = chartPage();
    const choice = await printDialog({
      total: people.length,
      changed: changedSincePrint(m).length,
      printedBefore: Object.keys(m.printed).length > 0,
      desktop,
      cardsDesc: `A4 ${cards.page.landscape ? '横放' : '竖放'}，${people.length} 人共 ${cards.pages.length} 页`,
      chartDesc: `A4 ${ch.page.w > ch.page.h ? '横放' : '竖放'}，1 页`,
    }, initial);
    if (choice) await output(choice);
  }

  async function exportPng() {
    if (!named().length) { toast('名单还是空的'); return; }
    const svg = currentChart({ forPrint: true });
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    const [w, h] = vb ? [Number(vb[1]), Number(vb[2])] : [800, 500];
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const path = await saveFile(`${displayTitle(m)}-座次图.png`, blob);
    if (path) toast(desktop ? '座次图图片已保存' : '座次图图片已下载', desktop ? { action: '打开所在文件夹', onAction: () => showInFolder(path) } : {});
  }

  async function exportCsv() {
    if (!named().length) { toast('名单还是空的'); return; }
    const csv = toCsv(layoutRows(layoutOf(m)), m.type);
    const path = await saveFile(`${displayTitle(m)}-座次表.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    if (path) toast(desktop ? '座次表已保存，可以用 Excel 或 WPS 打开' : '座次表已下载，可以用 Excel 或 WPS 打开', desktop ? { action: '打开所在文件夹', onAction: () => showInFolder(path) } : {});
  }

  function openExport(anchor) {
    const items = [
      { icon: 'image', label: '座次图图片（PNG）', hint: '发微信、插进 Word', onClick: exportPng },
      { icon: 'table', label: '座次表（Excel 可打开）', hint: '.csv', onClick: exportCsv },
    ];
    if (desktop) {
      items.push('-',
        { icon: 'file', label: '桌签存为 PDF…', onClick: () => output({ what: 'cards', target: 'pdf' }) },
        { icon: 'file', label: '座次图存为 PDF…', onClick: () => output({ what: 'chart', target: 'pdf' }) });
    }
    items.push('-', { icon: 'copy', label: '复制这场会议', hint: '例会、同一批人再开一次', onClick: () => onDuplicate(m.id) });
    popMenu(anchor, items);
  }

  // ---------- 事件：顶栏 ----------
  $('#e-back', root).addEventListener('click', () => onExit());
  const title = $('#e-title', root);
  title.addEventListener('focus', () => { typing = false; });
  title.addEventListener('input', () => {
    if (!typing) { hist.record(m); typing = true; }
    m.title = title.value;
    save();
    renderBar();
    dirty.chart = true;
    renderViewSoon();
  });
  title.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) title.blur(); });
  $('#e-date', root).addEventListener('change', (e) => commit(() => { m.date = e.target.value; }, { roster: false }));
  $('#e-type', root).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-type]');
    if (!b || b.dataset.type === m.type) return;
    commit(() => setType(m, b.dataset.type));
    if (m.type !== 'podium' && named().length && !named().some((p) => p.side === 'guest')) {
      toast('会见和宴请要分主客：点名单每行右边的"主"改成"客"，或者把人拖到"客方"下面', { timeout: 8000 });
    }
  });
  $('#e-undo', root).addEventListener('click', undo);
  $('#e-redo', root).addEventListener('click', redo);
  $('#e-export', root).addEventListener('click', (e) => openExport(e.currentTarget));
  $('#e-print', root).addEventListener('click', () => openPrint());
  $('#e-import', root).addEventListener('click', () => openImport());
  $('#e-add', root).addEventListener('click', () => addOne(grouped() ? 'guest' : 'host'));
  $('#e-tabs', root).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    store.savePrefs({ tab });
    renderBar();
    renderView();
  });
  $('#e-howto', root).addEventListener('click', () => rulesDialog());
  $('#e-chart-hint', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-zoom]');
    if (b) setZoom(Number(b.dataset.zoom));
  });
  $('#e-chart-tools', root).addEventListener('change', (e) => {
    const el = e.target.closest('[data-s]');
    if (!el) return;
    const k = el.dataset.s;
    const v = el.type === 'checkbox' ? el.checked : ['perRow', 'tableSize'].includes(k) ? Number(el.value) : el.value;
    commit(() => { m.settings[k] = v; }, { roster: k === 'scheme' });
  });
  $('#e-card-tools', root).addEventListener('change', (e) => {
    const el = e.target.closest('[data-c]');
    if (!el) return;
    const k = el.dataset.c;
    const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
    commit(() => { m.settings.card[k] = v; }, { roster: false });
    store.savePrefs({ card: m.settings.card }); // 下次新建会议沿用
  });
  $('#e-sortbar', root).addEventListener('click', async (e) => {
    const b = e.target.closest('[data-sort]');
    if (!b) return;
    if (b.dataset.sort === 'auto') {
      commit(() => autoSort(m));
      toast('已重新按职务排序', { action: '撤销', onAction: undo });
    } else {
      const r = await sortDialog({ partyFirst: m.settings.partyFirst, unitOrder: m.unitOrder || '' });
      if (r) {
        commit(() => { m.settings.partyFirst = r.partyFirst; m.unitOrder = r.unitOrder; autoSort(m); });
        toast('已按新规则重新排序', { action: '撤销', onAction: undo });
      }
    }
  });

  // ---------- 事件：名单表格 ----------
  roster.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (t?.dataset.empty === 'import') { openImport(); return; }
    if (t?.dataset.empty === 'add') { addOne(grouped() ? 'guest' : 'host'); return; }
    if (t?.dataset.empty === 'sample') { fillSample(); return; }
    if (t?.dataset.add) { addOne(t.dataset.add); return; }
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const id = tr.dataset.id;
    if (t?.classList.contains('x')) { deletePeople([id]); return; }
    if (t?.classList.contains('side')) {
      fresh.delete(id);
      commit(() => { const p = person(id); p.side = p.side === 'guest' ? 'host' : 'guest'; });
      select(id);
      flash(id);
      return;
    }
    if (!e.target.closest('input')) select(id);
  });
  roster.addEventListener('focusin', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    typing = false;
    select(cell.closest('tr').dataset.id);
  });
  roster.addEventListener('input', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const p = person(cell.closest('tr').dataset.id);
    if (!p) return;
    if (!typing) { hist.record(m); typing = true; }
    p[cell.dataset.f] = cell.value;
    if (m.sortMode === 'auto' && cell.dataset.f !== 'name') pendingSort = true;
    save();
    renderBar();
    renderChecks();
    renderViewSoon();
  });
  function finishCell(cell) {
    const tr = cell.closest('tr[data-id]');
    const p = tr && person(tr.dataset.id);
    if (!p) return;
    const f = cell.dataset.f;
    const v = f === 'name' ? cleanName(cell.value) : cell.value.trim().replace(/\s+/g, ' ');
    if (v !== cell.value) cell.value = v;
    const changedValue = p[f] !== v;
    p[f] = v;
    typing = false;
    if (changedValue) { save(); renderSortbar(); renderViewSoon(); }
  }
  // 焦点离开一行时：自动排序的话把这一行排到该在的位置；新加的空行没填就去掉
  function leaveRow(id) {
    const active = document.activeElement?.closest?.('tr[data-id]')?.dataset.id;
    if (active === id) return;
    const p = person(id);
    if (p && fresh.has(id) && !p.name && !p.title && !p.unit && m.people.length > 1) {
      fresh.delete(id);
      removePeople(m, [id]);
      if (sel === id) sel = null;
      save();
      renderAll();
      return;
    }
    if (!pendingSort) return;
    pendingSort = false;
    if (m.sortMode !== 'auto') return;
    const before = m.order.join();
    autoSort(m);
    if (m.order.join() === before) return;
    save();
    renderAll();
    flash(id);
    toast(`${p?.name || '这一行'}已按职务排到新位置`, { timeout: 3000 });
  }
  roster.addEventListener('focusout', (e) => {
    const tr = e.target.closest?.('tr[data-id]');
    if (!tr) return;
    if (e.relatedTarget && tr.contains(e.relatedTarget)) return;
    const id = tr.dataset.id;
    setTimeout(() => leaveRow(id), 0);
  });
  roster.addEventListener('change', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) finishCell(cell);
  });
  roster.addEventListener('keydown', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell || e.isComposing || e.keyCode === 229) return;
    const tr = cell.closest('tr[data-id]');
    const id = tr.dataset.id;
    const f = cell.dataset.f;
    const rows = $$('tr[data-id]', roster).map((r) => r.dataset.id);
    const i = rows.indexOf(id);
    if (e.key === 'Enter' || ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.altKey)) {
      e.preventDefault();
      const down = e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey);
      const nextId = rows[i + (down ? 1 : -1)];
      finishCell(cell);
      if (nextId) focusCell(nextId, f);
      else if (down && e.key === 'Enter' && person(id)?.name) {
        addOne(person(id).side, id);
      }
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.altKey) {
      e.preventDefault();
      finishCell(cell);
      if (moveStep(id, e.key === 'ArrowDown' ? 1 : -1)) focusCell(id, f);
    } else if (e.key === 'Escape') {
      cell.blur();
    }
  });
  roster.addEventListener('paste', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const text = e.clipboardData?.getData('text/plain') || '';
    // 往格子里粘进来的是一整张表：当成导入
    if (/[\n\t]/.test(text.trim())) {
      e.preventDefault();
      e.stopPropagation();
      const tr = cell.closest('tr[data-id]');
      const p = tr && person(tr.dataset.id);
      if (p && !p.name && !p.title && !p.unit) commit(() => removePeople(m, [p.id]));
      if (!m.people.length) importText(text, 'replace');
      else openImport({ text });
    }
  });

  // 拖动行调整位次；拖文件进来导入
  let dragId = null;
  let dropAt = null;
  const clearMarks = () => $$('.drop-before,.drop-after,.drop-into', roster).forEach((x) => x.classList.remove('drop-before', 'drop-after', 'drop-into'));
  roster.addEventListener('dragstart', (e) => {
    const grip = e.target.closest?.('.grip');
    if (!grip) return;
    const tr = grip.closest('tr');
    dragId = tr.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-seatcard', dragId);
    e.dataTransfer.setDragImage(tr, 30, tr.offsetHeight / 2);
    requestAnimationFrame(() => tr.classList.add('dragging'));
  });
  roster.addEventListener('dragend', () => {
    dragId = null;
    dropAt = null;
    clearMarks();
    $$('.dragging', roster).forEach((x) => x.classList.remove('dragging'));
  });
  rosterPane.addEventListener('dragover', (e) => {
    const types = [...e.dataTransfer.types];
    if (dragId && types.includes('application/x-seatcard')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearMarks();
      const tr = e.target.closest?.('tr');
      const body = e.target.closest?.('tbody');
      if (tr?.dataset.id) {
        const r = tr.getBoundingClientRect();
        const before = e.clientY < r.top + r.height / 2;
        tr.classList.add(before ? 'drop-before' : 'drop-after');
        dropAt = { id: tr.dataset.id, before, side: body?.dataset.side || '' };
      } else if (body) {
        const head = tr?.classList.contains('grp');
        body.classList.add('drop-into');
        dropAt = { id: null, start: head, side: body.dataset.side || '' };
      } else {
        dropAt = null;
      }
    } else if (types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      rosterPane.classList.add('filedrag');
    }
  });
  rosterPane.addEventListener('dragleave', (e) => {
    if (!rosterPane.contains(e.relatedTarget)) { rosterPane.classList.remove('filedrag'); clearMarks(); }
  });
  rosterPane.addEventListener('drop', async (e) => {
    e.preventDefault();
    rosterPane.classList.remove('filedrag');
    if (dragId) {
      const id = dragId;
      const at = dropAt;
      clearMarks();
      if (!at || at.id === id) return;
      commit(() => {
        const p = person(id);
        if (grouped() && at.side) p.side = at.side;
        const order = m.order.filter((x) => x !== id);
        let idx = order.length;
        if (at.id) idx = order.indexOf(at.id) + (at.before ? 0 : 1);
        else {
          const members = order.filter((x) => !grouped() || sideOf(x) === at.side);
          if (members.length) idx = at.start ? order.indexOf(members[0]) : order.indexOf(members[members.length - 1]) + 1;
        }
        order.splice(idx, 0, id);
        m.order = order;
        m.sortMode = 'manual';
      });
      select(id);
      flash(id);
      return;
    }
    importFiles(await readDropped(e.dataTransfer));
  });

  // ---------- 事件：座次图（点选、拖动互换） ----------
  let press = null;
  let ghost = null;
  const seatAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('#e-chart g.seat');
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const g = e.target.closest('g.seat');
    press = { id: g?.dataset.id || null, x: e.clientX, y: e.clientY, moved: false, pointer: e.pointerId };
    if (g) e.preventDefault();
  });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  function onPointerMove(e) {
    if (!press || !press.id || e.pointerId !== press.pointer) return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 6) return;
    if (!press.moved) {
      press.moved = true;
      ghost = document.createElement('div');
      ghost.className = 'seat-ghost';
      ghost.textContent = person(press.id)?.name || '';
      document.body.appendChild(ghost);
      stage.querySelector(`g.seat[data-id="${CSS.escape(press.id)}"]`)?.classList.add('lifted');
    }
    ghost.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 10}px)`;
    $$('g.seat.target', stage).forEach((g) => g.classList.remove('target'));
    const over = seatAt(e.clientX, e.clientY);
    if (over && over.dataset.id !== press.id) over.classList.add('target');
  }
  function onPointerUp(e) {
    if (!press || e.pointerId !== press.pointer) return;
    const p = press;
    press = null;
    if (ghost) { ghost.remove(); ghost = null; }
    $$('g.seat.target, g.seat.lifted', stage).forEach((g) => g.classList.remove('target', 'lifted'));
    if (p.moved) {
      const over = seatAt(e.clientX, e.clientY);
      if (over && over.dataset.id && over.dataset.id !== p.id) doSwap(p.id, over.dataset.id);
      return;
    }
    if (!stage.contains(e.target)) return;
    if (!p.id) { swapFrom = null; stage.classList.remove('swapping'); select(null); return; }
    if (swapFrom && swapFrom !== p.id) { doSwap(swapFrom, p.id); return; }
    swapFrom = null;
    stage.classList.remove('swapping');
    select(p.id, { from: 'chart' });
  }
  $('#e-selbar', root).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-sb]');
    if (!b || !sel) return;
    const act = b.dataset.sb;
    if (act === 'up' || act === 'down') moveStep(sel, act === 'up' ? -1 : 1);
    else if (act === 'swap') { swapFrom = sel; stage.classList.add('swapping'); renderSelbar(); }
    else if (act === 'cancel') { swapFrom = null; stage.classList.remove('swapping'); renderSelbar(); }
    else if (act === 'del') deletePeople([sel]);
    else if (act === 'close') { swapFrom = null; stage.classList.remove('swapping'); select(null); }
  });
  $('#e-sheets', root).addEventListener('click', (e) => {
    const s = e.target.closest('.sheet');
    if (!s) return;
    select(s.dataset.id, { from: 'chart' });
    $$('.sheet', root).forEach((x) => x.classList.toggle('sel', x === s));
  });

  // ---------- 键盘、粘贴、菜单 ----------
  function onKey(e) {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    const inField = isField(document.activeElement);
    if (document.querySelector('dialog[open]')) return;
    // 撤销、重做：在输入框里撤销打的字，其他时候撤销上一步操作
    if (mod && k === 'z') { e.preventDefault(); command(e.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && k === 'y') { e.preventDefault(); command('redo'); return; }
    if (mod && k === 'p') { e.preventDefault(); openPrint(); return; }
    if (mod && k === 's') { e.preventDefault(); saveSoon.flush(); toast('不用手动保存，每一步改动都会自动保存'); return; }
    if (mod && k === 'o') { e.preventDefault(); openImport(); return; }
    if (e.key === 'Escape' && !inField) { swapFrom = null; stage.classList.remove('swapping'); select(null); return; }
    if (e.key === 'Delete' && !inField && sel) { e.preventDefault(); deletePeople([sel]); }
  }
  function onPaste(e) {
    if (isField(document.activeElement) || document.querySelector('dialog[open]')) return;
    const text = e.clipboardData?.getData('text/plain') || '';
    const files = [...(e.clipboardData?.files || [])];
    if (files.length) { e.preventDefault(); readDropped(e.clipboardData).then(importFiles); return; }
    if (!text.trim()) return;
    e.preventDefault();
    if (!m.people.length) importText(text, 'replace');
    else openImport({ text });
  }
  function command(cmd) {
    const inField = isField(document.activeElement);
    switch (cmd) {
      case 'undo': if (inField) document.execCommand('undo'); else undo(); return true;
      case 'redo': if (inField) document.execCommand('redo'); else redo(); return true;
      case 'import': openImport(); return true;
      case 'print': openPrint(); return true;
      case 'pdf-cards': output({ what: 'cards', target: 'pdf' }); return true;
      case 'pdf-chart': output({ what: 'chart', target: 'pdf' }); return true;
      case 'export-png': exportPng(); return true;
      case 'export-csv': exportCsv(); return true;
      case 'rules': rulesDialog(); return true;
      default: return false;
    }
  }
  // 编辑区外拖文件进来（比如拖到座次图上）也能导入
  const onDocDragOver = (e) => { if ([...e.dataTransfer.types].includes('Files')) e.preventDefault(); };
  const onDocDrop = async (e) => {
    if (rosterPane.contains(e.target)) return;
    e.preventDefault();
    importFiles(await readDropped(e.dataTransfer));
  };
  document.addEventListener('dragover', onDocDragOver);
  document.addEventListener('drop', onDocDrop);

  renderAll();
  savedEl.className = 'saved ok';
  savedEl.innerHTML = `${icon('check', 14)}已自动保存`;
  if (!m.people.length) setTimeout(() => $('[data-empty="import"]', root)?.focus(), 0);

  return {
    onKey,
    onPaste,
    command,
    flush() { saveSoon.flush(); },
    destroy() {
      saveSoon.flush();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('dragover', onDocDragOver);
      document.removeEventListener('drop', onDocDrop);
    },
    get meeting() { return m; },
    pickAndImport: async () => importFiles(await pickFiles(ACCEPT)),
  };
}
