import { parseRoster } from './parse.js';
import { sortByRank, rankOf } from './rank.js';
import { podium, facing, layoutRows, toCsv } from './layout.js';
import { PRESETS } from './cards.js';
import { chartSvg, cardPages, FONTS } from './render.js';

const $ = (sel) => document.querySelector(sel);
const STORE_KEY = 'seatcard.v1';

const SAMPLE = `姓名\t职务\t单位
王建华\t副市长\t市人民政府
陈  平\t局长\t市教育局
刘晓梅\t副局长\t市财政局
赵国强\t党组书记、局长\t市财政局
孙  伟\t副局长\t市教育局
周文静\t预算科科长\t市财政局
吴志刚\t党组成员、副局长\t市财政局`;

const SAMPLE_TALK = `姓名\t职务\t单位\t主客
李卫东\t董事长\t远航科技有限公司\t客
张  敏\t副总经理\t远航科技有限公司\t客
何晓峰\t销售总监\t远航科技有限公司\t客
钱国平\t区长\t高新区管委会\t主
郑丽华\t副区长\t高新区管委会\t主
冯  涛\t招商局局长\t高新区管委会\t主`;

const state = {
  text: '', units: '', partyFirst: true, sortMode: 'auto', seq: [], people: [],
  mode: 'podium', rule: 'left', perRow: 0, alignFirst: true, view: 'front', title: '',
  preset: 'a4-fold2', customW: 200, customH: 90, font: 'song', bold: true, color: '#000000', sub: 'none', widen: true, guides: true,
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && typeof saved === 'object') Object.assign(state, saved, { people: [], seq: [] });
  } catch (e) { /* 隐私模式等情况下读不到，就用默认值 */ }
}

function save() {
  try {
    const { people, seq, ...rest } = state;
    rest.seqNames = ordered().map((p) => p.name);
    localStorage.setItem(STORE_KEY, JSON.stringify(rest));
  } catch (e) { /* 存不了也不影响使用 */ }
}

function unitOrder() {
  return state.units.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function reparse({ keepOrder = true } = {}) {
  const { people, warnings } = parseRoster(state.text);
  const prev = keepOrder ? (state.seq.length ? ordered().map((p) => p.name) : state.seqNames || []) : [];
  state.people = people;
  if (state.sortMode === 'paste') {
    state.seq = people.map((p) => p.id);
  } else if (state.sortMode === 'manual' && prev.length) {
    const byName = new Map(people.map((p) => [p.name, p]));
    const kept = prev.filter((n) => byName.has(n)).map((n) => byName.get(n).id);
    const rest = people.filter((p) => !kept.includes(p.id)).map((p) => p.id);
    state.seq = [...kept, ...rest];
  } else {
    state.seq = sortByRank(people, { unitOrder: unitOrder(), partyFirst: state.partyFirst }).map((p) => p.id);
  }
  const msg = people.length ? `识别到 ${people.length} 人` : '';
  $('#parse-msg').textContent = [msg, ...warnings].filter(Boolean).join('；');
}

function ordered() {
  const byId = new Map(state.people.map((p) => [p.id, p]));
  return state.seq.map((id) => byId.get(id)).filter(Boolean);
}

function currentLayout() {
  const list = ordered();
  if (state.mode === 'podium') return podium(list, { rule: state.rule, perRow: Number(state.perRow) || 0 });
  return facing(list.filter((p) => p.side !== 'guest'), list.filter((p) => p.side === 'guest'), { rule: state.rule, alignFirst: state.alignFirst });
}

// ---------- 名单 ----------
function renderPeople() {
  const ol = $('#people');
  const list = ordered();
  if (!list.length) {
    ol.innerHTML = '<li class="empty">左边粘贴名单后，这里显示排好的位次</li>';
    return;
  }
  // 会谈时主客两方分开列、各自编号
  const counters = { host: 0, guest: 0 };
  const groups = state.mode === 'facing'
    ? [['客方（面门）', list.filter((p) => p.side === 'guest')], ['主方（背门）', list.filter((p) => p.side !== 'guest')]]
    : [['', list]];
  ol.innerHTML = groups.map(([label, members]) => (label ? `<li class="group">${label}${members.length ? '' : '：还没有人，在名单里加一列"主 / 客"或在下面切换'}</li>` : '') + members.map((p, i) => {
    const n = state.mode === 'facing' ? ++counters[p.side === 'guest' ? 'guest' : 'host'] : i + 1;
    const tier = rankOf(p.title, { partyFirst: state.partyFirst }).label;
    const side = state.mode === 'facing'
      ? `<select class="side" data-id="${p.id}" aria-label="${esc(p.name)} 属于哪一方"><option value="host"${p.side !== 'guest' ? ' selected' : ''}>主方</option><option value="guest"${p.side === 'guest' ? ' selected' : ''}>客方</option></select>`
      : `<span class="tier">${tier}</span>`;
    return `<li data-id="${p.id}"><span class="rank">${n}</span><span class="who"><b>${esc(p.name)}</b><span>${esc([p.title, p.unit].filter(Boolean).join(' · '))}</span></span>${side}<span class="ctl"><button type="button" data-move="-1" data-id="${p.id}" aria-label="上移 ${esc(p.name)}">↑</button><button type="button" data-move="1" data-id="${p.id}" aria-label="下移 ${esc(p.name)}">↓</button></span></li>`;
  }).join('')).join('');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------- 座次图 ----------
function renderChart() {
  const box = $('#chart');
  const layout = currentLayout();
  const empty = layout.kind === 'podium' ? !layout.rows.length || !layout.rows[0].seats.length : !layout.near.length && !layout.far.length;
  if (empty) {
    box.innerHTML = '<div class="empty">还没有名单</div>';
    return;
  }
  if (layout.kind === 'facing' && !layout.far.length) {
    box.innerHTML = `<div class="empty">会谈排座需要分出主方和客方：在名单里加一列"主 / 客"，或在右边的位次列表里逐个选。</div>` + chartSvg(layout, { mirror: state.view === 'back', title: state.title });
    return;
  }
  box.innerHTML = chartSvg(layout, { mirror: state.view === 'back', title: state.title });
}

// ---------- 桌签 ----------
const measureCache = new Map();
function makeMeasure(fontCss, weight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${weight} 100px ${fontCss}`;
  return (text) => {
    const key = `${fontCss}|${weight}|${text}`;
    if (!measureCache.has(key)) measureCache.set(key, ctx.measureText(text).width / 100);
    return measureCache.get(key);
  };
}

function presetObj() {
  if (state.preset === 'custom') {
    const w = Math.min(Math.max(Number(state.customW) || 200, 40), 297);
    const h = Math.min(Math.max(Number(state.customH) || 90, 20), 148);
    return { faceW: w, faceH: h, faces: 2 };
  }
  return PRESETS[state.preset];
}

function cardOpts() {
  const font = FONTS[state.font] || FONTS.song;
  const weight = state.bold ? 700 : 400;
  return {
    preset: presetObj(), font: font.css, bold: state.bold, color: state.color, sub: state.sub,
    widenTwo: state.widen, guides: state.guides, measure: makeMeasure(font.css, weight),
  };
}

function renderCards() {
  const list = ordered();
  const box = $('#card-preview');
  const info = $('#card-info');
  if (!list.length) {
    box.innerHTML = '<div class="more-pages">粘贴名单后在这里预览</div>';
    info.textContent = '';
    return;
  }
  let result;
  try {
    result = cardPages(list, cardOpts());
  } catch (e) {
    box.innerHTML = `<div class="more-pages">${esc(e.message)}</div>`;
    info.textContent = '';
    return;
  }
  const { page, perPage, pages } = result;
  info.textContent = `共 ${list.length} 人，${pages.length} 页 A4（${page.landscape ? '横放' : '竖放'}，每页 ${perPage} 人）。上半面的字是倒着印的，对折立起后两边都是正的。`;
  const h = 300;
  const w = (h * page.w) / page.h;
  const shown = pages.slice(0, 3).map((svg) => `<div class="sheet" style="width:${w}px;height:${h}px">${svg}</div>`).join('');
  box.innerHTML = shown + (pages.length > 3 ? `<div class="more-pages">还有 ${pages.length - 3} 页</div>` : '');
}

// ---------- 打印与导出 ----------
function printPages(svgs, page) {
  const root = $('#print-root');
  root.innerHTML = svgs.map((svg) => `<div class="print-page" style="width:${page.w}mm;height:${page.h}mm">${svg}</div>`).join('');
  let style = document.getElementById('print-page-size');
  if (!style) {
    style = document.createElement('style');
    style.id = 'print-page-size';
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${page.w}mm ${page.h}mm; margin: 0; }`;
  const cleanup = () => { root.innerHTML = ''; window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

function chartPrintSvg() {
  const svg = chartSvg(currentLayout(), { mirror: state.view === 'back', title: state.title });
  // 横放 A4，留 10 毫米边
  return `<div style="width:297mm;height:210mm;display:flex;align-items:center;justify-content:center">${svg.replace('<svg ', '<svg style="max-width:277mm;max-height:190mm;width:auto;height:auto" ')}</div>`;
}

function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function exportPng() {
  const svg = chartSvg(currentLayout(), { mirror: state.view === 'back', title: state.title });
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const [w, h] = m ? [Number(m[1]), Number(m[2])] : [800, 400];
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => download(`${state.title || '座次图'}.png`, blob), 'image/png');
  };
  img.src = url;
}

// ---------- 事件 ----------
function renderAll() {
  document.body.dataset.mode = state.mode;
  document.body.dataset.preset = state.preset;
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === state.mode)));
  renderPeople();
  renderChart();
  renderCards();
  save();
}

let timer = 0;
function later(fn) {
  clearTimeout(timer);
  timer = setTimeout(fn, 180);
}

function bindInput(sel, key, { number = false, check = false, reparse: rp = false } = {}) {
  const el = $(sel);
  if (check) el.checked = Boolean(state[key]);
  else el.value = state[key];
  el.addEventListener(check || el.tagName === 'SELECT' ? 'change' : 'input', () => {
    state[key] = check ? el.checked : number ? Number(el.value) : el.value;
    if (rp) reparse();
    later(renderAll);
  });
}

function init() {
  load();
  $('#preset').innerHTML = Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join('') + '<option value="custom">自定义尺寸</option>';
  $('#font').innerHTML = Object.entries(FONTS).map(([k, f]) => `<option value="${k}">${f.label}</option>`).join('');
  $('#roster').value = state.text;
  $('#units').value = state.units;
  $('#roster').addEventListener('input', () => { state.text = $('#roster').value; later(() => { reparse(); renderAll(); }); });
  $('#units').addEventListener('input', () => { state.units = $('#units').value; later(() => { if (state.sortMode === 'auto') reparse({ keepOrder: false }); renderAll(); }); });
  bindInput('#party-first', 'partyFirst', { check: true });
  $('#party-first').addEventListener('change', () => { if (state.sortMode === 'auto') { reparse({ keepOrder: false }); renderAll(); } });
  bindInput('#rule', 'rule');
  bindInput('#per-row', 'perRow', { number: true });
  bindInput('#align-first', 'alignFirst', { check: true });
  bindInput('#view', 'view');
  bindInput('#meeting-title', 'title');
  bindInput('#preset', 'preset');
  bindInput('#custom-w', 'customW', { number: true });
  bindInput('#custom-h', 'customH', { number: true });
  bindInput('#font', 'font');
  bindInput('#bold', 'bold', { check: true });
  bindInput('#color', 'color');
  bindInput('#sub', 'sub');
  bindInput('#widen', 'widen', { check: true });
  bindInput('#guides', 'guides', { check: true });

  const fill = (text) => { state.text = text; $('#roster').value = text; state.sortMode = 'auto'; reparse({ keepOrder: false }); renderAll(); };
  $('#btn-sample').addEventListener('click', () => { state.mode = 'podium'; fill(SAMPLE); });
  $('#btn-sample-talk').addEventListener('click', () => { state.mode = 'facing'; fill(SAMPLE_TALK); });
  $('#btn-clear').addEventListener('click', () => fill(''));
  $('#btn-autosort').addEventListener('click', () => { state.sortMode = 'auto'; reparse({ keepOrder: false }); renderAll(); });
  $('#btn-pasteorder').addEventListener('click', () => { state.sortMode = 'paste'; reparse({ keepOrder: false }); renderAll(); });
  $('#people').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-move]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const i = state.seq.indexOf(id);
    const step = Number(btn.dataset.move);
    let j = i + step;
    if (state.mode === 'facing') {
      // 会谈时只和同一方的人换位
      const sideOf = (x) => (state.people.find((p) => p.id === x)?.side === 'guest' ? 'guest' : 'host');
      while (j >= 0 && j < state.seq.length && sideOf(state.seq[j]) !== sideOf(id)) j += step;
    }
    if (i < 0 || j < 0 || j >= state.seq.length) return;
    [state.seq[i], state.seq[j]] = [state.seq[j], state.seq[i]];
    state.sortMode = 'manual';
    renderAll();
    const again = document.querySelector(`#people button[data-id="${id}"][data-move="${btn.dataset.move}"]`);
    if (again) again.focus();
  });
  $('#people').addEventListener('change', (e) => {
    const sel = e.target.closest('select.side');
    if (!sel) return;
    const p = state.people.find((x) => x.id === Number(sel.dataset.id));
    if (p) p.side = sel.value;
    // 主客写回名单文本不现实，记在本地即可；重新粘贴名单时以名单里的"主/客"列为准
    renderAll();
  });
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { state.mode = t.dataset.mode; renderAll(); }));
  $('#btn-print-chart').addEventListener('click', () => { if (ordered().length) printPages([chartPrintSvg()], { w: 297, h: 210 }); });
  $('#btn-png').addEventListener('click', () => { if (ordered().length) exportPng(); });
  $('#btn-csv').addEventListener('click', () => {
    if (!ordered().length) return;
    download(`${state.title || '座次表'}.csv`, new Blob([toCsv(layoutRows(currentLayout()))], { type: 'text/csv;charset=utf-8' }));
  });
  $('#btn-print-cards').addEventListener('click', () => {
    if (!ordered().length) return;
    const { page, pages } = cardPages(ordered(), cardOpts());
    printPages(pages, page);
  });
  reparse();
  renderAll();
}

init();
