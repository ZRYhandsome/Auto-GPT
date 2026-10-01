// 座次桌签 桌面版主进程：开窗口、中文菜单、打印、存 PDF、另存文件、每天自动备份。
// 界面就是 dist/座次桌签.html（和网页版同一个文件），这里只补上浏览器做不到的事。
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const isMac = process.platform === 'darwin';
const PAGE = path.join(__dirname, '..', 'dist', '座次桌签.html');
// 自动化测试用：设了 SEATCARD_TEST_SAVE_DIR 就不弹"另存为"，直接存进去；SEATCARD_USER_DATA 换一个数据目录
const TEST_SAVE_DIR = process.env.SEATCARD_TEST_SAVE_DIR || '';

app.setName('座次桌签');
// 数据目录固定用英文名，免得不同系统、不同版本下目录名变了导致会议"丢失"
app.setPath('userData', process.env.SEATCARD_USER_DATA || path.join(app.getPath('appData'), 'SeatCard'));
app.commandLine.appendSwitch('lang', 'zh-CN');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// ---------- 窗口位置和大小：下次打开还在原处 ----------
const statePath = () => path.join(app.getPath('userData'), 'window.json');
function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

let lastDir = '';
function settings() {
  return readJson(path.join(app.getPath('userData'), 'settings.json'), {});
}
function saveSettings(patch) {
  const file = path.join(app.getPath('userData'), 'settings.json');
  try { fs.writeFileSync(file, JSON.stringify({ ...settings(), ...patch })); } catch (e) { /* 忽略 */ }
}

function createWindow() {
  const st = readJson(statePath(), {});
  const win = new BrowserWindow({
    width: st.width || 1360,
    height: st.height || 860,
    x: st.x,
    y: st.y,
    minWidth: 980,
    minHeight: 640,
    title: '座次桌签',
    backgroundColor: '#f4f3ef',
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  if (st.maximized) win.maximize();
  win.loadFile(PAGE);
  win.once('ready-to-show', () => win.show());

  // 网页只在自己这个文件里跳转（#/m/...）；拖进来的文件、外部链接都不让它把窗口换掉
  const self = (url) => url.split('#')[0] === win.webContents.getURL().split('#')[0];
  win.webContents.on('will-navigate', (e, url) => {
    if (!self(url)) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  const remember = () => {
    if (win.isDestroyed()) return;
    const b = win.getNormalBounds();
    try { fs.writeFileSync(statePath(), JSON.stringify({ ...b, maximized: win.isMaximized() })); } catch (e) { /* 忽略 */ }
  };
  win.on('close', remember);
  return win;
}

// ---------- 菜单 ----------
function buildMenu() {
  const send = (cmd) => () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('menu', cmd);
  };
  const sep = { type: 'separator' };
  const template = [
    ...(isMac ? [{
      label: '座次桌签',
      submenu: [
        { label: '关于座次桌签', click: showAbout }, sep,
        { role: 'hide', label: '隐藏座次桌签' }, { role: 'hideOthers', label: '隐藏其他' }, { role: 'unhide', label: '全部显示' }, sep,
        { role: 'quit', label: '退出座次桌签' },
      ],
    }] : []),
    {
      label: '文件(&F)',
      submenu: [
        { label: '会议列表', accelerator: 'CmdOrCtrl+N', click: send('home') },
        { label: '新建主席台会议', click: send('new-podium') },
        { label: '新建会见会谈', click: send('new-facing') },
        { label: '新建宴请圆桌', click: send('new-round') },
        sep,
        { label: '导入名单…', accelerator: 'CmdOrCtrl+O', click: send('import') },
        sep,
        { label: '打印…', accelerator: 'CmdOrCtrl+P', click: send('print') },
        { label: '桌签存为 PDF…', click: send('pdf-cards') },
        { label: '座次图存为 PDF…', click: send('pdf-chart') },
        { label: '导出座次图图片…', click: send('export-png') },
        { label: '导出座次表（Excel）…', click: send('export-csv') },
        sep,
        { label: '备份全部会议…', click: send('backup') },
        { label: '从备份恢复…', click: send('restore') },
        { label: '打开自动备份文件夹', click: () => shell.openPath(backupDir()) },
        sep,
        isMac ? { role: 'close', label: '关闭窗口' } : { role: 'quit', label: '退出', accelerator: 'Alt+F4' },
      ],
    },
    {
      label: '编辑(&E)',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', click: send('undo') },
        { label: '重做', accelerator: isMac ? 'Shift+Cmd+Z' : 'Ctrl+Y', click: send('redo') },
        sep,
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图(&V)',
      submenu: [
        { role: 'zoomIn', label: '放大界面' },
        { role: 'zoomOut', label: '缩小界面' },
        { role: 'resetZoom', label: '界面实际大小' },
        sep,
        { role: 'togglefullscreen', label: '全屏' },
        ...(app.isPackaged ? [] : [sep, { role: 'toggleDevTools', label: '开发者工具' }]),
      ],
    },
    {
      label: '帮助(&H)',
      submenu: [
        { label: '左右怎么算', click: send('rules') },
        { label: '数据保存在哪里', click: showDataInfo },
        sep,
        { label: '关于座次桌签', click: showAbout },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showAbout() {
  dialog.showMessageBox({
    type: 'info',
    title: '关于座次桌签',
    message: `座次桌签 ${app.getVersion()}`,
    detail: '粘贴名单，自动排会议座次，一键打印双面桌签。\n\n所有会议和名单只保存在这台电脑上，不联网、不上传。',
    buttons: ['好'],
  });
}

function showDataInfo() {
  dialog.showMessageBox({
    type: 'info',
    title: '数据保存在哪里',
    message: '会议和名单只保存在这台电脑上',
    detail: `软件数据：${app.getPath('userData')}\n自动备份：${backupDir()}\n\n每天第一次打开软件、每次关掉一场会议时，都会自动备份一次，留最近 30 天。换电脑时，在首页点"备份全部"导出一个文件，到新电脑上点"从备份恢复"。`,
    buttons: ['好', '打开自动备份文件夹'],
  }).then(({ response }) => { if (response === 1) shell.openPath(backupDir()); });
}

// ---------- 自动备份 ----------
function backupDir() {
  const dir = path.join(app.getPath('userData'), '自动备份');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function writeBackup(json) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const name = `座次桌签自动备份-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  const dir = backupDir();
  fs.writeFileSync(path.join(dir, name), json);
  const old = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  for (const f of old.slice(0, Math.max(0, old.length - 30))) fs.rmSync(path.join(dir, f), { force: true });
  return path.join(dir, name);
}

// ---------- 网页那边调用的功能 ----------
async function askSavePath(sender, name, filters) {
  if (TEST_SAVE_DIR) return path.join(TEST_SAVE_DIR, name);
  const win = BrowserWindow.fromWebContents(sender);
  const dir = lastDir || settings().lastDir || app.getPath('documents');
  const { canceled, filePath } = await dialog.showSaveDialog(win, { defaultPath: path.join(dir, name), filters });
  if (canceled || !filePath) return null;
  lastDir = path.dirname(filePath);
  saveSettings({ lastDir });
  return filePath;
}

const FILTERS = {
  pdf: [{ name: 'PDF 文件', extensions: ['pdf'] }],
  png: [{ name: 'PNG 图片', extensions: ['png'] }],
  csv: [{ name: 'CSV 表格（Excel、WPS 可打开）', extensions: ['csv'] }],
  json: [{ name: '座次桌签备份', extensions: ['json'] }],
};
const safeName = (s) => String(s || '未命名').replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 120) || '未命名';

ipcMain.on('app-version', (e) => { e.returnValue = app.getVersion(); });

ipcMain.handle('print', (e, { landscape = false } = {}) => new Promise((resolve) => {
  e.sender.print({ silent: false, printBackground: true, landscape, margins: { marginType: 'none' }, pageSize: 'A4' }, (ok, reason) => {
    resolve(Boolean(ok));
    if (!ok && reason && reason !== 'cancelled' && reason !== 'Print job canceled') {
      dialog.showMessageBox({ type: 'warning', title: '没有打印成功', message: '没有打印成功', detail: `原因：${reason}\n可以先"存为 PDF"，再用 PDF 阅读器打印。`, buttons: ['好'] });
    }
  });
}));

ipcMain.handle('save-pdf', async (e, { name, landscape = false } = {}) => {
  const file = await askSavePath(e.sender, safeName(name).replace(/\.pdf$/i, '') + '.pdf', FILTERS.pdf);
  if (!file) return null;
  const data = await e.sender.printToPDF({ printBackground: true, preferCSSPageSize: true, landscape, margins: { marginType: 'none' } });
  fs.writeFileSync(file, data);
  return file;
});

ipcMain.handle('save-file', async (e, { name, bytes }) => {
  const ext = (/\.([a-z0-9]+)$/i.exec(name) || [])[1]?.toLowerCase();
  const file = await askSavePath(e.sender, safeName(name), FILTERS[ext] || []);
  if (!file) return null;
  fs.writeFileSync(file, Buffer.from(bytes));
  return file;
});

ipcMain.handle('auto-backup', (e, json) => {
  try {
    return writeBackup(String(json));
  } catch (err) {
    return null;
  }
});

ipcMain.handle('show-in-folder', (e, file) => { if (file) shell.showItemInFolder(file); });
ipcMain.handle('open-path', (e, file) => (file ? shell.openPath(file) : ''));

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
