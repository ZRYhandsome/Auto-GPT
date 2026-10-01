// 界面用的小工具：转义、图标、提示条、对话框、弹出菜单。
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const PATHS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  swap: '<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  file: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
  paste: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>',
  archive: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  sort: '<path d="M3 6h13M3 12h9M3 18h5"/><path d="M18 9V21M15 18l3 3 3-3"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
};

/** 软件图标（和 icon.svg 一样）：一张立在桌上的桌签。 */
export const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#b91c1c"/><rect x="8" y="46" width="48" height="5" rx="2.5" fill="#f6c453"/><path d="M14 20 L50 20 L52 46 L12 46 Z" fill="#ffffff"/><path d="M15 16 L49 16 L50 20 L14 20 Z" fill="#f3d4d4"/><rect x="19" y="27" width="7.5" height="9" rx="1.2" fill="#b91c1c"/><rect x="28.25" y="27" width="7.5" height="9" rx="1.2" fill="#b91c1c"/><rect x="37.5" y="27" width="7.5" height="9" rx="1.2" fill="#b91c1c"/><rect x="22" y="39" width="20" height="2.4" rx="1.2" fill="#e8b4b4"/></svg>';

export function icon(name, size = 18) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;
}

/** 三种会议的小示意图，用在首页和会议列表。 */
export function typeArt(type, size = 64) {
  const seat = (x, y, fill = '#fff') => `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" rx="2" fill="${fill}" stroke="#7c2d12" stroke-width="1.2"/>`;
  let body = '';
  if (type === 'podium') {
    body = '<rect x="6" y="10" width="52" height="22" rx="4" fill="#fde7c2" stroke="#d97706" stroke-width="1.2"/>'
      + [14, 23, 32, 41, 50].map((x) => seat(x, 23, x === 32 ? '#fca5a5' : '#fff')).join('')
      + [12, 22, 32, 42, 52].map((x) => `<circle cx="${x}" cy="44" r="2.4" fill="#a8a29e"/>`).join('')
      + [17, 27, 37, 47].map((x) => `<circle cx="${x}" cy="53" r="2.4" fill="#a8a29e"/>`).join('');
  } else if (type === 'facing') {
    body = '<rect x="10" y="26" width="44" height="12" rx="3" fill="#e7e5e4" stroke="#a8a29e" stroke-width="1.2"/>'
      + [20, 32, 44].map((x) => seat(x, 18, x === 32 ? '#bfdbfe' : '#eff6ff')).join('')
      + [20, 32, 44].map((x) => seat(x, 46, x === 32 ? '#fca5a5' : '#fff')).join('')
      + '<path d="M26 60h12M26 60a6 6 0 016-6" fill="none" stroke="#78716c" stroke-width="1.4"/>';
  } else {
    body = '<circle cx="32" cy="30" r="15" fill="#fdf6e3" stroke="#d6b36a" stroke-width="1.4"/>'
      + Array.from({ length: 8 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 4;
        return seat(32 + 22 * Math.cos(a), 30 + 22 * Math.sin(a), i === 0 ? '#fca5a5' : i === 7 || i === 1 ? '#bfdbfe' : '#fff');
      }).join('')
      + '<path d="M26 61h12M26 61a6 6 0 016-6" fill="none" stroke="#78716c" stroke-width="1.4"/>';
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
}

// ---------- 提示条 ----------
let toastBox = null;
/** 换页面时清掉提示条：上面的"撤销"只对原来那一页有效。 */
export function clearToasts() {
  if (toastBox) toastBox.innerHTML = '';
}
export function toast(message, { action = '', onAction = null, timeout = 4500, kind = '' } = {}) {
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.className = 'toasts';
    toastBox.setAttribute('role', 'status');
    toastBox.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastBox);
  }
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button" class="toast-act">${esc(action)}</button>` : ''}`;
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); };
  if (action) el.querySelector('.toast-act').addEventListener('click', () => { close(); if (onAction) onAction(); });
  toastBox.appendChild(el);
  while (toastBox.children.length > 3) toastBox.firstChild.remove();
  setTimeout(close, timeout);
  return close;
}

// ---------- 对话框 ----------
/**
 * 打开一个模态对话框。buttons: [{ label, value, kind:'primary'|'danger'|'', id }]
 * onMount(dialog, close) 里可以绑定事件；返回 Promise，点哪个按钮就得到哪个 value，关掉得到 null。
 */
export function openDialog({ title, body = '', buttons = [{ label: '好', value: true, kind: 'primary' }], onMount = null, className = '' }) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = `dlg ${className}`;
    dlg.innerHTML = `<form method="dialog" class="dlg-form">
  <header class="dlg-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn dlg-x" aria-label="关闭">${icon('x')}</button></header>
  <div class="dlg-body">${body}</div>
  <footer class="dlg-foot">${buttons.map((b, i) => `<button type="button" class="${b.kind || ''}" data-i="${i}"${b.id ? ` id="${b.id}"` : ''}>${esc(b.label)}</button>`).join('')}</footer>
</form>`;
    document.body.appendChild(dlg);
    let result = null;
    const close = (value = null) => {
      result = value;
      if (dlg.open) dlg.close();
    };
    dlg.addEventListener('close', () => { dlg.remove(); resolve(result); });
    dlg.querySelector('.dlg-x').addEventListener('click', () => close(null));
    dlg.querySelectorAll('.dlg-foot button').forEach((btn) => btn.addEventListener('click', () => {
      const b = buttons[Number(btn.dataset.i)];
      if (b.onClick) { b.onClick(close, dlg); return; }
      close(b.value);
    }));
    dlg.addEventListener('submit', (e) => e.preventDefault());
    dlg.showModal();
    if (onMount) onMount(dlg, close);
    const auto = dlg.querySelector('[autofocus]') || dlg.querySelector('.dlg-foot .primary');
    if (auto) auto.focus();
  });
}

export function confirmDialog(message, { title = '请确认', ok = '确定', cancel = '取消', danger = false } = {}) {
  return openDialog({
    title,
    body: `<p class="dlg-msg">${esc(message)}</p>`,
    buttons: [{ label: cancel, value: false }, { label: ok, value: true, kind: danger ? 'danger' : 'primary' }],
  }).then(Boolean);
}

// ---------- 弹出菜单 ----------
export function popMenu(anchor, items) {
  document.querySelectorAll('.pop').forEach((p) => p.remove());
  const pop = document.createElement('div');
  pop.className = 'pop';
  pop.setAttribute('role', 'menu');
  pop.innerHTML = items.map((it, i) => (it === '-' ? '<hr>' : `<button type="button" role="menuitem" data-i="${i}"${it.disabled ? ' disabled' : ''}>${it.icon ? icon(it.icon, 16) : ''}<span>${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</button>`)).join('');
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  pop.style.top = `${r.bottom + 6}px`;
  pop.style.left = `${Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8))}px`;
  const off = (e) => {
    if (e.type === 'keydown' && e.key !== 'Escape') return;
    if (e.type === 'pointerdown' && pop.contains(e.target)) return;
    done();
  };
  const done = () => {
    pop.remove();
    document.removeEventListener('pointerdown', off, true);
    document.removeEventListener('keydown', off, true);
  };
  setTimeout(() => {
    document.addEventListener('pointerdown', off, true);
    document.addEventListener('keydown', off, true);
  });
  pop.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    done();
    items[Number(btn.dataset.i)].onClick();
  });
  const first = pop.querySelector('button:not([disabled])');
  if (first) first.focus();
  return done;
}

export function debounce(fn, ms) {
  let t = 0;
  const run = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  run.flush = (...args) => { clearTimeout(t); fn(...args); };
  run.cancel = () => clearTimeout(t);
  return run;
}

export function timeAgo(ts, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return '刚刚';
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  const d = new Date(ts);
  const n = new Date(now);
  const pad = (x) => String(x).padStart(2, '0');
  if (d.getFullYear() === n.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 选文件：返回 [{ name, bytes }]；用户取消返回空数组。 */
export function pickFiles(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      const files = await Promise.all([...input.files].map(async (f) => ({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
      input.remove();
      resolve(files);
    });
    input.addEventListener('cancel', () => { input.remove(); resolve([]); });
    input.click();
  });
}

export async function readDropped(dataTransfer) {
  const files = [...(dataTransfer?.files || [])];
  return Promise.all(files.map(async (f) => ({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
}
