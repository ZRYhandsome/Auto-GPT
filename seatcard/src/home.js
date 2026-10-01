// 首页：新建会议、我的会议（打开、复制、删除、查找）、备份和恢复。
import { esc, $, icon, typeArt, toast, timeAgo, pickFiles, readDropped, LOGO } from './dom.js';
import { TYPES, displayTitle, today } from './meeting.js';
import { saveFile, setTitle, appVersion } from './platform.js';

export function createHome(root, { store, onOpen, onNew, onSample, onDuplicate, onImportFiles }) {
  let query = '';
  root.innerHTML = `<div class="home">
  <header class="home-top">
    <div class="brand">
      <span class="logo" aria-hidden="true">${LOGO}</span>
      <div><h1>座次桌签</h1><p>粘贴名单，自动排座次，一键打印双面桌签</p></div>
    </div>
    <div class="home-tools">
      <button type="button" class="ghost" id="h-backup" title="把所有会议存成一个文件，换电脑、重装系统时带走">${icon('archive', 16)}备份全部</button>
      <button type="button" class="ghost" id="h-restore" title="从备份文件里找回会议">${icon('upload', 16)}从备份恢复</button>
    </div>
  </header>
  <section class="new-row" aria-labelledby="h-new">
    <h2 id="h-new">新建会议</h2>
    <div class="tiles">
      ${Object.entries(TYPES).map(([k, t]) => `<button type="button" class="tile" data-type="${k}">
        ${typeArt(k, 76)}
        <span class="tile-text"><b>${t.label}</b><span>${esc(t.hint)}</span></span>
      </button>`).join('')}
    </div>
    <p class="muted small drop-tip">${icon('upload', 14)} 也可以直接把 Excel、Word 名单文件拖进这个窗口，自动新建一场会议。</p>
  </section>
  <section class="recent" aria-labelledby="h-mine">
    <div class="recent-head">
      <h2 id="h-mine">我的会议</h2>
      <label class="search">${icon('search', 16)}<input type="search" id="h-q" placeholder="按会议名称或人名查找" aria-label="查找会议"></label>
    </div>
    <ul class="mlist" id="h-list"></ul>
  </section>
  <footer class="home-foot muted small">会议和名单只保存在这台电脑上，不联网、不上传。换电脑或重装系统前，点右上角"备份全部"导出一个文件带走。${appVersion ? ` · 版本 ${esc(appVersion)}` : ''}</footer>
</div>`;
  setTitle('');

  const list = $('#h-list', root);
  function render() {
    const all = store.list();
    const q = query.trim();
    const shown = q ? all.filter((x) => `${displayTitle(x)} ${x.names || ''}`.includes(q)) : all;
    $('#h-q', root).parentElement.hidden = all.length < 6 && !q;
    if (!all.length) {
      list.innerHTML = `<li class="mempty">
        <p>还没有会议。点上面的会议类型新建一场。</p>
        <p class="muted">想先看看效果？<button type="button" class="link" data-sample="podium">打开一场示例会议</button></p>
      </li>`;
      return;
    }
    if (!shown.length) {
      list.innerHTML = `<li class="mempty"><p>没有找到"${esc(q)}"</p></li>`;
      return;
    }
    list.innerHTML = shown.map((x) => `<li class="mrow">
      <button type="button" class="mopen" data-open="${esc(x.id)}">
        <span class="mart">${typeArt(x.type, 40)}</span>
        <span class="mmain"><b>${esc(displayTitle(x))}</b><span class="muted">${esc(TYPES[x.type]?.label || '')} · ${x.count} 人${x.date ? ` · ${esc(x.date)}` : ''}</span></span>
        <span class="mtime muted">${esc(timeAgo(x.updatedAt))}修改</span>
      </button>
      <button type="button" class="icon-btn" data-dup="${esc(x.id)}" title="复制一份：例会、同一批人再开一次时用">${icon('copy', 17)}</button>
      <button type="button" class="icon-btn" data-del="${esc(x.id)}" title="删除">${icon('trash', 17)}</button>
    </li>`).join('');
  }

  root.querySelector('.tiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (tile) onNew(tile.dataset.type);
  });
  $('#h-q', root).addEventListener('input', (e) => { query = e.target.value; render(); });
  list.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.open) onOpen(t.dataset.open);
    else if (t.dataset.sample) onSample(t.dataset.sample);
    else if (t.dataset.dup) onDuplicate(t.dataset.dup);
    else if (t.dataset.del) {
      const m = store.load(t.dataset.del);
      store.remove(t.dataset.del);
      render();
      if (m) toast(`已删除"${displayTitle(m)}"`, { action: '撤销', onAction: () => { store.save(m); render(); }, timeout: 7000 });
    }
  });
  $('#h-backup', root).addEventListener('click', async () => {
    const n = store.list().length;
    if (!n) { toast('还没有会议，不用备份'); return; }
    const name = await saveFile(`座次桌签备份-${today()}.json`, new Blob([store.exportAll()], { type: 'application/json' }));
    if (name) toast(`已备份 ${n} 场会议`);
  });
  $('#h-restore', root).addEventListener('click', async () => {
    const [f] = await pickFiles('.json');
    if (!f) return;
    try {
      const n = store.importAll(new TextDecoder().decode(f.bytes));
      toast(n ? `已恢复 ${n} 场会议` : '备份里的会议这里都有，而且不比这里的新，没有改动');
      render();
    } catch (err) {
      toast(`恢复失败：${err.message}`, { kind: 'bad' });
    }
  });

  const onDragOver = (e) => {
    if (![...e.dataTransfer.types].includes('Files')) return;
    e.preventDefault();
    root.querySelector('.home').classList.add('filedrag');
  };
  const onDragLeave = (e) => { if (!e.relatedTarget) root.querySelector('.home')?.classList.remove('filedrag'); };
  const onDrop = async (e) => {
    e.preventDefault();
    root.querySelector('.home')?.classList.remove('filedrag');
    const files = await readDropped(e.dataTransfer);
    if (files.length) onImportFiles(files);
  };
  document.addEventListener('dragover', onDragOver);
  document.addEventListener('dragleave', onDragLeave);
  document.addEventListener('drop', onDrop);

  render();
  return {
    destroy() {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragleave', onDragLeave);
      document.removeEventListener('drop', onDrop);
    },
    onKey(e) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'f') { e.preventDefault(); const q = $('#h-q', root); q.parentElement.hidden = false; q.focus(); }
    },
    command(cmd) {
      if (cmd === 'backup') $('#h-backup', root).click();
      else if (cmd === 'restore') $('#h-restore', root).click();
      else return false;
      return true;
    },
  };
}
