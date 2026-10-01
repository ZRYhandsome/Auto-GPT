// 给网页一个小小的、固定的接口（window.seatcardDesktop），不把 Node 的能力直接交给网页。
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('seatcardDesktop', {
  version: ipcRenderer.sendSync('app-version'),
  print: (opts) => ipcRenderer.invoke('print', opts),
  savePdf: (name, opts) => ipcRenderer.invoke('save-pdf', { name, ...opts }),
  saveFile: (name, bytes) => ipcRenderer.invoke('save-file', { name, bytes }),
  autoBackup: (json) => ipcRenderer.invoke('auto-backup', json),
  showInFolder: (file) => ipcRenderer.invoke('show-in-folder', file),
  openPath: (file) => ipcRenderer.invoke('open-path', file),
  onMenu: (fn) => {
    ipcRenderer.removeAllListeners('menu');
    ipcRenderer.on('menu', (_e, cmd) => fn(cmd));
  },
});
