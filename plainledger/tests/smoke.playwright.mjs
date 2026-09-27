// 浏览器冒烟测试：导入样例账单 → 账单/报表/分账/设置各页可用，无控制台错误。
// 运行：python3 -m http.server 8765 &  然后  node tests/smoke.playwright.mjs
import { createRequire } from 'node:module';
// 优先本地依赖，其次全局安装（容器预装），避免为一个冒烟脚本引入 node_modules
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PW_GLOBAL || '/opt/node22/lib/node_modules/playwright')); }
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
// Playwright 在部分环境下无法用非 ASCII 路径设置文件，这里改为传入 buffer（保留原文件名）
const samples = ['微信支付账单(20260801-20260831).csv', '支付宝交易明细(20260801-20260831).csv', '某银行流水示例.csv']
  .map((f) => ({ name: f, mimeType: 'text/csv', buffer: readFileSync(path.join(here, '..', 'samples', f)) }));
const outDir = process.env.SHOT_DIR || '/tmp/claude-0/-home-user-Auto-GPT/f87645c4-3b4f-513a-8bfa-66d2a4de3ed6/scratchpad/shots';
mkdirSync(outDir, { recursive: true });
const base = process.env.BASE || 'http://127.0.0.1:8765/index.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2, locale: 'zh-CN' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name, '-', e.message); errors.push(`${name}: ${e.message}`); } };
const text = async (sel) => (await page.locator(sel).first().textContent()) || '';

await step('open app', async () => { await page.goto(base + '#/ledger'); await page.waitForSelector('#view .empty'); });
await step('import samples', async () => {
  await page.goto(base + '#/import');
  await page.setInputFiles('#file', samples);
  await page.waitForSelector('#preview');
  const summary = await text('#preview');
  if (!/新增/.test(summary)) throw new Error('no preview');
  const btn = page.locator('#confirmImport');
  const label = await btn.textContent();
  if (!/导入 4[0-9] 条/.test(label)) throw new Error('unexpected import count: ' + label);
  await page.screenshot({ path: path.join(outDir, '1-import-preview.png'), fullPage: true });
  await btn.click();
  await page.waitForSelector('.txn');
});
await step('ledger shows August 2026 with totals', async () => {
  const kpi = await text('.kpis');
  if (!/支出/.test(kpi)) throw new Error('no kpis');
  const rows = await page.locator('.txn').count();
  if (rows < 30) throw new Error('too few rows: ' + rows);
  await page.screenshot({ path: path.join(outDir, '2-ledger.png'), fullPage: true });
});
await step('re-import is idempotent', async () => {
  await page.goto(base + '#/import');
  await page.setInputFiles('#file', samples.slice(0, 2));
  await page.waitForSelector('#preview');
  const label = await page.locator('#confirmImport').textContent();
  if (!/导入 0 条/.test(label)) throw new Error('duplicates not detected: ' + label);
  await page.click('#cancelImport');
});
await step('add members and split a transaction', async () => {
  await page.goto(base + '#/members');
  for (const n of ['我', '小李']) { await page.fill('#addMember input[name=name]', n); await page.click('#addMember button[type=submit]'); await page.waitForFunction((name) => document.querySelector('.chips').textContent.includes(name), n); }
  const chips = await text('.chips');
  if (!/小李/.test(chips)) throw new Error('member not added');
  await page.goto(base + '#/ledger');
  await page.fill('#q', '海底捞');
  await page.waitForSelector('.txn');
  await page.locator('.txn').first().click();
  await page.waitForSelector('.sheet');
  await page.selectOption('.sheet select[name=payerId]', { label: '我' });
  await page.click('.sheet .split-editor .chip[data-mode=equal]');
  await page.click('.sheet button[type=submit]');
  await page.waitForSelector('.sheet', { state: 'detached' });
  await page.goto(base + '#/members');
  const bal = await text('#view');
  if (!/应付 134\.00/.test(bal)) throw new Error('balance wrong: ' + bal.slice(0, 300));
  await page.screenshot({ path: path.join(outDir, '3-members.png'), fullPage: true });
});
await step('change category creates rule suggestion', async () => {
  await page.goto(base + '#/ledger');
  await page.fill('#q', '拼多多');
  await page.locator('.txn').first().click();
  await page.waitForSelector('.sheet');
  await page.selectOption('.sheet select[name=category]', '日用');
  const visible = await page.locator('#ruleSuggest').isVisible();
  if (!visible) throw new Error('rule suggestion hidden');
  await page.check('#ruleSuggest input[name=makeRule]');
  await page.click('.sheet button[type=submit]');
  await page.waitForSelector('.sheet', { state: 'detached' });
  await page.goto(base + '#/settings');
  const rules = await text('#view');
  if (!/拼多多/.test(rules)) throw new Error('rule not saved');
});
await step('reports render charts', async () => {
  await page.goto(base + '#/reports');
  await page.waitForSelector('#catChart');
  const w = await page.locator('#catChart').evaluate((c) => c.width);
  if (!(w > 0)) throw new Error('canvas not sized');
  await page.screenshot({ path: path.join(outDir, '4-reports.png'), fullPage: true });
});
await step('export ledger json', async () => {
  await page.goto(base + '#/settings');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#exportLedger')]);
  const p = await download.path();
  const { readFileSync } = await import('node:fs');
  const j = JSON.parse(readFileSync(p, 'utf-8'));
  if (j.format !== 'plainledger/ledger' || j.transactions.length < 40) throw new Error('bad export');
  await page.screenshot({ path: path.join(outDir, '5-settings.png'), fullPage: true });
});
await step('desktop layout', async () => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(base + '#/ledger');
  await page.waitForSelector('.txn');
  await page.screenshot({ path: path.join(outDir, '6-desktop.png') });
});
await step('offline: service worker registered', async () => {
  const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r; });
  if (!reg) throw new Error('no sw');
});

await browser.close();
if (errors.length) { console.log('\nERRORS:'); errors.forEach((e) => console.log(' -', e)); process.exit(1); }
console.log('\nsmoke passed; screenshots in', outDir);
