// 浏览器冒烟测试：填入示例 → 自动排序 → 主席台和会谈座次图 → 导出 CSV、PNG → 桌签打印成 PDF。
// 运行：node tests/smoke.playwright.mjs（脚本自己起一个本地静态服务器）
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PW_GLOBAL || '/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outDir = process.env.SHOT_DIR || path.join(root, '.smoke');
mkdirSync(outDir, { recursive: true });
const port = process.env.PORT || '8766';
const server = process.env.BASE ? null : spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const base = process.env.BASE || `http://127.0.0.1:${port}/index.html`;
await new Promise((r) => setTimeout(r, 800));

const launch = process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {};
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
let failed = 0;
const step = async (name, fn) => {
  try { await fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
};
const expectEq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: 期望 ${JSON.stringify(b)}，实际 ${JSON.stringify(a)}`); };
const seatNames = (sel = '#chart svg g.seat') => page.$$eval(sel, (gs) => gs.map((g) => g.dataset.name));

await step('打开页面', async () => {
  await page.goto(base);
  await page.waitForSelector('#people li.empty');
});

await step('填入示例并自动排序：副市长在前，局长按粘贴顺序，科长在副局长后', async () => {
  await page.click('#btn-sample');
  await page.waitForFunction(() => document.querySelectorAll('#people li[data-id]').length === 7);
  const names = await page.$$eval('#people li[data-id] .who b', (bs) => bs.map((b) => b.textContent));
  expectEq(names, ['王建华', '陈平', '赵国强', '刘晓梅', '孙伟', '吴志刚', '周文静'], '位次');
});

await step('主席台：从台下看 7 5 3 1 2 4 6', async () => {
  expectEq(await seatNames(), ['周文静', '孙伟', '赵国强', '王建华', '陈平', '刘晓梅', '吴志刚'], '座次');
});

await step('以右为尊左右对调；从台上看再镜像回来', async () => {
  await page.selectOption('#rule', 'right');
  await page.waitForTimeout(300);
  expectEq(await seatNames(), ['吴志刚', '刘晓梅', '陈平', '王建华', '赵国强', '孙伟', '周文静'], '以右为尊');
  await page.selectOption('#view', 'back');
  await page.waitForTimeout(300);
  expectEq(await seatNames(), ['周文静', '孙伟', '赵国强', '王建华', '陈平', '刘晓梅', '吴志刚'], '从台上看');
  await page.selectOption('#rule', 'left');
  await page.selectOption('#view', 'front');
});

await step('每排 4 人时分两排', async () => {
  await page.fill('#per-row', '4');
  await page.waitForTimeout(300);
  const text = await page.textContent('#chart');
  if (!text.includes('第2排')) throw new Error('没有第二排');
  await page.fill('#per-row', '0');
});

await step('上移下移调整位次', async () => {
  await page.click('#people li[data-id] button[data-move="1"]');
  await page.waitForTimeout(300);
  const first = await page.textContent('#people li[data-id] .who b');
  expectEq(first, '陈平', '下移后第一位');
  await page.click('#btn-autosort');
  await page.waitForTimeout(300);
});

await step('导出 CSV', async () => {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btn-csv')]);
  const file = path.join(outDir, 'seats.csv');
  await dl.saveAs(file);
  const csv = readFileSync(file, 'utf8');
  if (!csv.includes('第1排,4,1,王建华')) throw new Error('CSV 内容不对：' + csv.slice(0, 200));
});

await step('导出 PNG', async () => {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btn-png')]);
  const file = path.join(outDir, 'chart.png');
  await dl.saveAs(file);
  const buf = readFileSync(file);
  if (buf.length < 2000 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('PNG 不对');
});

await step('桌签预览和页数', async () => {
  const info = await page.textContent('#card-info');
  if (!info.includes('共 7 人，7 页 A4（横放，每页 1 人）')) throw new Error(info);
  const sheets = await page.$$eval('#card-preview .sheet', (s) => s.length);
  expectEq(sheets, 3, '预览页数');
  await page.screenshot({ path: path.join(outDir, 'app.png'), fullPage: true });
});

await step('打印桌签成 PDF：7 页 A4 横向，上半面倒印', async () => {
  await page.evaluate(() => { window.print = () => {}; });
  await page.click('#btn-print-cards');
  const pages = await page.$$eval('#print-root .print-page', (p) => p.length);
  expectEq(pages, 7, '打印页数');
  const flipped = await page.$$eval('#print-root .print-page:first-child g[transform^="rotate(180"]', (g) => g.length);
  expectEq(flipped, 1, '倒印的一面');
  await page.emulateMedia({ media: 'print' });
  await page.screenshot({ path: path.join(outDir, 'card-page.png') });
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  writeFileSync(path.join(outDir, 'cards.pdf'), pdf);
  const raw = pdf.toString('latin1');
  const count = (raw.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  expectEq(count, 7, 'PDF 页数');
  const box = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!box || Math.abs(Number(box[1]) - 841.89) > 2 || Math.abs(Number(box[2]) - 595.28) > 2) throw new Error('不是 A4 横向：' + (box && box[0]));
  await page.emulateMedia({ media: 'screen' });
});

await step('小号台卡一页两人；三折版每页三面中两面印字', async () => {
  await page.selectOption('#preset', 'card-180x70');
  await page.waitForTimeout(300);
  const info = await page.textContent('#card-info');
  if (!info.includes('4 页 A4（竖放，每页 2 人）')) throw new Error(info);
  await page.selectOption('#preset', 'a4-fold3');
  await page.waitForTimeout(300);
  const texts = await page.$$eval('#card-preview .sheet:first-child svg > g, #card-preview .sheet:first-child svg > g g', (g) => g.length);
  if (texts < 2) throw new Error('三折版文字组太少：' + texts);
  await page.selectOption('#preset', 'a4-fold2');
});

await step('会谈：客方面门，1 号对 1 号', async () => {
  await page.click('#btn-sample-talk');
  await page.waitForTimeout(400);
  const mode = await page.evaluate(() => document.body.dataset.mode);
  expectEq(mode, 'facing', '模式');
  const all = await seatNames();
  // 上排客方（面门）、下排主方（背门），从门口看；主方 2 号在 1 号左手，客方 2 号对着主方 2 号
  expectEq(all, ['张敏', '李卫东', '何晓峰', '郑丽华', '钱国平', '冯涛'], '会谈座次');
  const groups = await page.$$eval('#people li.group', (g) => g.map((x) => x.textContent));
  expectEq(groups, ['客方（面门）', '主方（背门）'], '名单分组');
  // 会谈时下移只和同一方的人换位：客方 1 号李卫东下移后，客方 2 号张敏变成 1 号
  await page.click('#people li[data-id] button[data-move="1"]');
  await page.waitForTimeout(300);
  const firstGuest = await page.textContent('#people li[data-id] .who b');
  expectEq(firstGuest, '张敏', '客方内换位');
  await page.click('#btn-autosort');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'facing.png'), fullPage: true });
});

await step('刷新后名单和设置还在', async () => {
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('#people li[data-id]').length === 6);
  const mode = await page.evaluate(() => document.body.dataset.mode);
  expectEq(mode, 'facing', '刷新后模式');
});

await step('没有控制台错误', async () => {
  if (errors.length) throw new Error(errors.join('\n'));
});

await browser.close();
if (server) server.kill();
console.log(failed ? `\n${failed} 项失败` : '\n全部通过');
process.exit(failed ? 1 : 0);
