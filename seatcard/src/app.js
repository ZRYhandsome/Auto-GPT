// 入口：首页和会议编辑页之间切换（地址栏 #/m/<会议编号>），全局快捷键和桌面版菜单。
import { createStore, memoryStorage } from './store.js';
import { newMeeting, duplicateMeeting, addFromText, normalizeMeeting, guessTitle, displayTitle } from './meeting.js';
import { parseRoster } from './parse.js';
import { createHome } from './home.js';
import { createEditor } from './editor.js';
import { onMenu, desktop, autoBackup } from './platform.js';
import { SAMPLES } from './samples.js';
import { toast, pickFiles, clearToasts } from './dom.js';
import { filesToText, rulesDialog } from './dialogs.js';

function safeStorage() {
  try {
    const k = 'seatcard.probe';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch (e) {
    return null;
  }
}

const storage = safeStorage();
const store = createStore(storage || memoryStorage());
const root = document.getElementById('app');
let view = null;
let viewId = '';

function go(id) {
  const hash = id ? `#/m/${id}` : '#/';
  if (location.hash === hash) route(); else location.hash = hash;
}

// 桌面版：每次关掉一场会议、每天第一次打开时，自动备份一次
function backupNow() {
  if (desktop && store.list().length) autoBackup(store.exportAll());
}

function show(next, id = '') {
  if (view?.destroy) { view.destroy(); backupNow(); }
  clearToasts();
  document.querySelectorAll('.pop').forEach((p) => p.remove());
  view = next;
  viewId = id;
  window.scrollTo(0, 0);
}

function fresh(type, title = '') {
  return newMeeting(type, { title, card: store.prefs().card });
}

function createMeeting(type) {
  const m = fresh(type);
  store.save(m);
  go(m.id);
}

function openSample(type = 'podium') {
  const s = SAMPLES[type];
  const m = fresh(type, s.title);
  addFromText(m, s.text);
  store.save(m);
  go(m.id);
}

function duplicate(id) {
  const m = store.load(id);
  if (!m) return;
  const copy = duplicateMeeting(normalizeMeeting(m));
  store.save(copy);
  toast(`已复制一份："${displayTitle(copy)}"，日期改成了今天`);
  go(copy.id);
}

async function newFromFiles(files) {
  const text = await filesToText(files, (msg) => toast(msg, { kind: 'bad', timeout: 8000 }));
  if (text === null) return;
  const { people } = parseRoster(text);
  if (!people.length) { toast('没认出名单里的人', { kind: 'bad' }); return; }
  const m = fresh(people.some((p) => p.side === 'guest') ? 'facing' : 'podium', guessTitle(text, files[0].name));
  addFromText(m, text);
  store.save(m);
  toast(`已新建会议，导入 ${m.people.length} 人`);
  go(m.id);
}

function route() {
  const id = (/^#\/m\/([\w-]+)/.exec(location.hash) || [])[1];
  if (id && id === viewId) return;
  if (id) {
    const m = store.load(id);
    if (m) {
      show(createEditor(root, { store, meeting: normalizeMeeting(m), onExit: () => go(''), onDuplicate: duplicate }), id);
      return;
    }
    toast('找不到这场会议，可能已经删除了');
    history.replaceState(null, '', '#/');
  }
  show(createHome(root, {
    store, onOpen: go, onNew: createMeeting, onSample: openSample, onDuplicate: duplicate, onImportFiles: newFromFiles,
  }));
}

window.addEventListener('hashchange', route);
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'n' && !e.shiftKey) { e.preventDefault(); go(''); return; }
  view?.onKey?.(e);
});
document.addEventListener('paste', (e) => view?.onPaste?.(e));
// 文件拖到窗口别处时，别让浏览器把它当网页打开
document.addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', (e) => { if (!e.defaultPrevented) e.preventDefault(); });
window.addEventListener('beforeunload', () => view?.flush?.());
window.addEventListener('pagehide', () => view?.flush?.());

onMenu(async (cmd) => {
  if (cmd === 'home' || cmd === 'new') { go(''); return; }
  if (cmd.startsWith('new-')) { createMeeting(cmd.slice(4)); return; }
  if (cmd === 'rules') { rulesDialog(); return; }
  if (view?.command?.(cmd)) return;
  if (cmd === 'backup' || cmd === 'restore') {
    go('');
    setTimeout(() => view?.command?.(cmd), 0);
    return;
  }
  if (cmd === 'import') {
    const files = await pickFiles('.xlsx,.xlsm,.docx,.csv,.txt,.tsv,.xls,.doc,.et,.wps');
    if (files.length) newFromFiles(files);
    return;
  }
  if (['print', 'pdf-cards', 'pdf-chart', 'export-png', 'export-csv'].includes(cmd)) toast('先打开一场会议');
});

if (!storage) toast('浏览器不让保存数据（可能是无痕模式），关掉页面后会议会丢失', { kind: 'bad', timeout: 10000 });
route();
backupNow();
