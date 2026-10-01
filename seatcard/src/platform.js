// 网页版和桌面版的差别都在这里。桌面版（Electron）的 preload 会在 window 上放一个 seatcardDesktop。
const bridge = typeof window !== 'undefined' ? window.seatcardDesktop || null : null;

export const desktop = Boolean(bridge);
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';

/**
 * 打印当前页面里 #print-root 的内容（打印样式会把界面藏起来）。
 * 桌面版能知道用户是不是点了取消，返回 true/false；网页版没法知道，按打印了算。
 */
export async function printNow({ landscape = false } = {}) {
  if (bridge) return bridge.print({ landscape });
  window.print();
  return true;
}

/** 存成 PDF：桌面版弹出"另存为"，返回保存的路径，取消返回 null。网页版不支持，返回 undefined。 */
export async function savePdf(defaultName, { landscape = false } = {}) {
  if (!bridge) return undefined;
  return bridge.savePdf(defaultName, { landscape });
}

/** 桌面版：把全部会议写一份到"自动备份"文件夹（每天一个文件，留 30 天）。 */
export async function autoBackup(json) {
  if (!bridge?.autoBackup) return null;
  return bridge.autoBackup(json);
}

/** 保存文件：桌面版弹出"另存为"并返回路径；网页版直接下载，返回文件名。 */
export async function saveFile(name, blob) {
  if (bridge) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return bridge.saveFile(name, bytes);
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return name;
}

/** 在文件夹里显示刚保存的文件（只有桌面版有）。 */
export function showInFolder(path) {
  if (bridge && path) bridge.showInFolder(path);
}

export function openPath(path) {
  if (bridge && path) bridge.openPath(path);
}

/** 桌面版菜单栏里的命令（新建、导入、打印、撤销……）转给界面处理。 */
export function onMenu(handler) {
  if (bridge) bridge.onMenu(handler);
}

export function setTitle(title) {
  document.title = title ? `${title} - 座次桌签` : '座次桌签';
}

export const appVersion = bridge?.version || '';
