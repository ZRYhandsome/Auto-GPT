// 桌面版（Electron）测试：真的启动软件，从菜单触发存 PDF、导出图片和表格、自动备份，检查写出来的文件。
// 运行：npm run build && node tests/desktop.playwright.mjs   （Linux 服务器上没有屏幕时：xvfb-run -a node ...）
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, readFileSync, readdirSync, existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
let electron;
try { ({ _electron: electron } = require('playwright')); } catch (e) { ({ _electron: electron } = require(process.env.PW_GLOBAL || '/opt/node22/lib/node_modules/playwright')); }

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(path.join(os.tmpdir(), 'seatcard-desktop-'));
const saveDir = path.join(tmp, 'saved');
const userData = path.join(tmp, 'userdata');
require('node:fs').mkdirSync(saveDir, { recursive: true });

const app = await electron.launch({
  executablePath: require(path.join(root, 'node_modules', 'electron')),
  args: [...(process.platform === 'linux' ? ['--no-sandbox'] : []), root],
  env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', SEATCARD_TEST_SAVE_DIR: saveDir, SEATCARD_USER_DATA: userData },
});
const page = await app.firstWindow();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
let failed = 0;
const step = async (name, fn) => {
  try { await fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message.split('\n')[0]); }
};
const expectEq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: 期望 ${JSON.stringify(b)}，实际 ${JSON.stringify(a)}`); };
const menu = (cmd) => app.evaluate(({ BrowserWindow }, c) => BrowserWindow.getAllWindows()[0].webContents.send('menu', c), cmd);
const waitFile = async (name, ms = 15000) => {
  const t = Date.now();
  while (Date.now() - t < ms) { if (existsSync(path.join(saveDir, name))) return path.join(saveDir, name); await new Promise((r) => setTimeout(r, 200)); }
  throw new Error(`没等到文件 ${name}`);
};
const pdfPages = (file) => [...readFileSync(file, 'latin1').matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\]/g)].map((m) => [Math.round(m[1] / 72 * 25.4), Math.round(m[2] / 72 * 25.4)]);

await step('启动：窗口标题、桌面接口、版本号', async () => {
  await page.waitForSelector('.home');
  expectEq(await page.title(), '座次桌签', '窗口标题');
  const v = await page.evaluate(() => window.seatcardDesktop && window.seatcardDesktop.version);
  expectEq(v, JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).version, '版本号');
  expectEq(await page.evaluate(() => typeof require), 'undefined', '网页里拿不到 Node');
});

await step('菜单新建主席台会议，填入示例', async () => {
  await menu('new-podium');
  await page.waitForSelector('.editor [data-empty="sample"]');
  await page.click('[data-empty="sample"]');
  await page.waitForSelector('#e-chart svg');
});

await step('打印对话框里有"存为 PDF…"', async () => {
  await menu('print');
  await page.waitForSelector('dialog .dlg-foot');
  expectEq(await page.$$eval('dialog .dlg-foot button', (b) => b.map((x) => x.textContent)), ['取消', '存为 PDF…', '打印…'], '按钮');
  await page.keyboard.press('Escape');
});

await step('桌签存为 PDF：7 页 A4 横放，并标为已打印', async () => {
  await menu('pdf-cards');
  const f = await waitFile('全市经济形势分析会-桌签.pdf');
  await page.waitForTimeout(300);
  const pages = pdfPages(f);
  expectEq(pages.length, 7, '页数');
  expectEq(pages[0], [297, 210], '纸张');
  await page.click('#e-tabs [data-tab="cards"]');
  expectEq(await page.locator('.sheet .pill.ok').count(), 7, '已打印标记');
});

await step('座次图存为 PDF：1 页', async () => {
  await menu('pdf-chart');
  expectEq(pdfPages(await waitFile('全市经济形势分析会-座次图.pdf')).length, 1, '页数');
});

await step('导出座次图图片和座次表', async () => {
  await menu('export-png');
  const png = readFileSync(await waitFile('全市经济形势分析会-座次图.png'));
  expectEq(png.subarray(1, 4).toString(), 'PNG', 'PNG 文件头');
  await menu('export-csv');
  const csv = readFileSync(await waitFile('全市经济形势分析会-座次表.csv'), 'utf8');
  if (!csv.includes('王建华')) throw new Error('CSV 里没有名单');
});

await step('回到会议列表时自动备份', async () => {
  await menu('home');
  await page.waitForSelector('.home .mrow');
  await page.waitForTimeout(500);
  const dir = path.join(userData, '自动备份');
  const files = readdirSync(dir);
  if (!files.length) throw new Error('没有备份文件');
  const data = JSON.parse(readFileSync(path.join(dir, files[0]), 'utf8'));
  expectEq(data.meetings.length, 1, '备份里的会议数');
});

if (errors.length) { failed++; console.log('FAIL 页面报错：\n' + errors.join('\n')); }
await app.close();
console.log(failed ? `\n${failed} 项失败` : '\n全部通过');
process.exit(failed ? 1 : 0);
