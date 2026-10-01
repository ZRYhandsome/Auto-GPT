// 浏览器里把整个使用流程走一遍（用的是打包好的 dist/座次桌签.html，和用户双击打开的是同一个文件）：
//   首页 → 示例会议 → 拖座位互换、撤销 → 改职务自动重排、回车加人 → 粘贴名单新建会谈 → 换成宴请圆桌
//   → 导入对话框追加（同名跳过）→ 桌签打印、只重打改过的 → 打印出来的 PDF 尺寸和页数 → 导出 CSV、PNG
//   → 首页查找、复制、删除再撤销 → 把 Excel 文件拖进窗口新建会议。
// 运行：npm run build && node tests/smoke.playwright.mjs
//   CHROMIUM=浏览器路径  SHOT_DIR=截图目录  BASE=页面地址（默认打开 dist 里的文件）
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PW_GLOBAL || '/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outDir = process.env.SHOT_DIR || path.join(root, '.smoke');
mkdirSync(outDir, { recursive: true });
const base = process.env.BASE || pathToFileURL(path.join(root, 'dist', '座次桌签.html')).href;

// 下载的中文文件名要求系统是 UTF-8 环境（Linux 容器默认的 C 环境下会变成 "download"）
const env = { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' };
const launch = process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM, env } : { env };
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1, locale: 'zh-CN', acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
let failed = 0;
const step = async (name, fn) => {
  try { await fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message.split('\n')[0]); }
};
const expectEq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: 期望 ${JSON.stringify(b)}，实际 ${JSON.stringify(a)}`); };
const shot = (name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
const seatNames = () => page.$$eval('#e-chart svg g.seat', (gs) => gs.map((g) => g.dataset.name));
const rosterNames = (side = '') => page.$$eval(`tbody${side ? `[data-side="${side}"]` : ''} tr[data-id] .c-name input`, (els) => els.map((e) => e.value));
const paste = (text) => page.evaluate((t) => {
  const dt = new DataTransfer();
  dt.setData('text/plain', t);
  document.body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
}, text);
const dragSeat = async (from, to) => {
  const a = await page.locator(`#e-chart g.seat[data-name="${from}"]`).boundingBox();
  const b = await page.locator(`#e-chart g.seat[data-name="${to}"]`).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 20, a.y + 20, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await page.mouse.up();
};

await step('打开首页：空状态和三种会议', async () => {
  await page.goto(base);
  await page.waitForSelector('.home .mempty');
  expectEq(await page.$$eval('.tile b', (b) => b.map((x) => x.textContent)), ['主席台', '会见会谈', '宴请圆桌'], '新建会议类型');
  // 桌面版之外拦住打印，记下打印时的内容，后面拿来出 PDF
  await page.evaluate(() => {
    window.__prints = [];
    window.print = () => window.__prints.push({ html: document.getElementById('print-root').innerHTML, css: document.getElementById('print-page-size')?.textContent || '' });
  });
  await shot('01-home');
});

await step('打开示例会议：主席台 7 人，从台下看 7 5 3 1 2 4 6', async () => {
  await page.click('[data-sample="podium"]');
  await page.waitForSelector('.editor #e-chart svg');
  expectEq(await page.inputValue('#e-title'), '全市经济形势分析会', '会议名称');
  expectEq(await rosterNames(), ['王建华', '陈平', '赵国强', '刘晓梅', '孙伟', '吴志刚', '周文静'], '自动排序');
  expectEq(await seatNames(), ['周文静', '孙伟', '赵国强', '王建华', '陈平', '刘晓梅', '吴志刚'], '座次');
  await shot('02-podium');
});

await step('"左右怎么算"里的示意和实际排法一致', async () => {
  await page.click('#e-howto');
  const demos = await page.$$eval('dialog .demo', (ds) => ds.map((d) => [...d.querySelectorAll('span')].map((x) => x.textContent).join(' ')));
  expectEq(demos, ['7 5 3 1 2 4 6', '5 3 1 2 4 6'], '示意');
  await page.keyboard.press('Escape');
});

await step('拖动座位互换，撤销后复原', async () => {
  await dragSeat('周文静', '孙伟');
  expectEq((await seatNames()).slice(0, 2), ['孙伟', '周文静'], '互换后');
  expectEq(await page.textContent('#e-sortbar .sort-state'), '手动顺序', '互换后变成手动顺序');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z');
  expectEq((await seatNames()).slice(0, 2), ['周文静', '孙伟'], '撤销后');
});

await step('选中座位：位次提前', async () => {
  await page.click('#e-chart g.seat[data-name="陈平"]');
  await page.waitForSelector('#e-selbar:not([hidden])');
  await page.click('#e-selbar [data-sb="up"]');
  expectEq((await rosterNames()).slice(0, 2), ['陈平', '王建华'], '陈平提到第 1 位');
  await page.click('#e-sortbar [data-sort="auto"]');
  expectEq((await rosterNames()).slice(0, 2), ['王建华', '陈平'], '重新按职务排序');
});

await step('在名单里改职务：离开这一行后自动排到新位置', async () => {
  const cell = page.locator('tr[data-id]', { has: page.locator('input[value="孙伟"]') }).locator('.c-title input');
  await cell.click();
  await cell.fill('局长');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  expectEq((await rosterNames()).indexOf('孙伟'), 3, '孙伟排到正职后面');
});

await step('最后一行按回车加人；新加的空行没填就自动去掉', async () => {
  const last = page.locator('tr[data-id]').last().locator('.c-name input');
  await last.click();
  await page.keyboard.press('Enter');
  await page.keyboard.type('李明');
  await page.keyboard.press('Tab');
  await page.keyboard.type('副秘书长');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  expectEq((await rosterNames()).slice(-2), ['李明', ''], '加了李明，光标在新的空行');
  await page.click('#e-chart', { position: { x: 5, y: 5 } });
  await page.waitForTimeout(100);
  expectEq((await rosterNames()).slice(-1), ['李明'], '空行去掉了');
});

await step('桌签：打印全部，再改一个名字，默认只重打改过的', async () => {
  await page.click('#e-tabs [data-tab="cards"]');
  expectEq(await page.locator('.sheet').count(), 8, '8 人 8 页');
  await page.click('#e-print');
  await page.click('dialog .dlg-foot button.primary');
  await page.waitForTimeout(200);
  expectEq(await page.evaluate(() => window.__prints.length), 1, '打印了一次');
  expectEq(await page.locator('.sheet .pill.ok').count(), 8, '都标成已打印');
  const cell = page.locator('tr[data-id]', { has: page.locator('input[value="李明"]') }).locator('.c-name input');
  await cell.click();
  await cell.fill('李敏');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  expectEq(await page.locator('.sheet .pill.new').count(), 1, '1 张有改动');
  await page.click('#e-print');
  expectEq(await page.$eval('input[name="range"]:checked', (e) => e.value), 'changed', '默认只打改过的');
  await page.click('dialog .dlg-foot button.primary');
  await page.waitForTimeout(200);
  const last = await page.evaluate(() => window.__prints.at(-1).html);
  expectEq((last.match(/class="print-page"/g) || []).length, 1, '只打了 1 页');
  await shot('03-cards');
});

await step('打印效果：桌签 A4 横放、每人一页；座次图 1 页', async () => {
  const pdfOf = async (job) => {
    await page.evaluate((j) => {
      document.getElementById('print-root').innerHTML = j.html;
      document.getElementById('print-page-size').textContent = j.css;
    }, job);
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => { document.getElementById('print-root').innerHTML = ''; });
    const s = pdf.toString('latin1');
    const boxes = [...s.matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\]/g)].map((m) => [Math.round(m[1] / 72 * 25.4), Math.round(m[2] / 72 * 25.4)]);
    return { pdf, boxes };
  };
  const all = await page.evaluate(() => window.__prints[0]);
  const cards = await pdfOf(all);
  writeFileSync(path.join(outDir, 'cards.pdf'), cards.pdf);
  expectEq(cards.boxes.length, 8, '桌签页数');
  expectEq(cards.boxes[0], [297, 210], '桌签纸张');
  await page.click('#e-tabs [data-tab="chart"]');
  await page.click('#e-print');
  await page.click('dialog input[value="chart"]');
  await page.click('dialog .dlg-foot button.primary');
  await page.waitForTimeout(200);
  const chart = await pdfOf(await page.evaluate(() => window.__prints.at(-1)));
  writeFileSync(path.join(outDir, 'chart.pdf'), chart.pdf);
  expectEq(chart.boxes, [[297, 210]], '座次图 1 页横放');
});

await step('导出座次表 CSV 和座次图 PNG', async () => {
  const csvDl = page.waitForEvent('download');
  await page.click('#e-export');
  await page.click('.pop button:has-text("座次表")');
  const csv = await csvDl;
  const text = readFileSync(await csv.path(), 'utf8');
  if (!text.startsWith('﻿排,座位（从台下看，从左数）')) throw new Error('CSV 表头不对');
  if (!text.includes('第1排') || !text.includes('王建华')) throw new Error('CSV 内容不对');
  const pngDl = page.waitForEvent('download');
  await page.click('#e-export');
  await page.click('.pop button:has-text("座次图图片")');
  const png = await pngDl;
  expectEq(png.suggestedFilename(), '全市经济形势分析会-座次图.png', 'PNG 文件名');
  const bytes = readFileSync(await png.path());
  expectEq(bytes.subarray(1, 4).toString(), 'PNG', 'PNG 文件头');
});

await step('新建会见会谈：粘贴带主客列的名单，客方坐面门一侧', async () => {
  await page.click('#e-back');
  await page.click('.tile[data-type="facing"]');
  await page.waitForSelector('.empty-roster');
  await paste('姓名\t职务\t单位\t主客\n李卫东\t董事长\t远航科技\t客\n张  敏\t副总经理\t远航科技\t客\n钱国平\t区长\t高新区\t主\n郑丽华\t副区长\t高新区\t主');
  await page.waitForSelector('#e-chart svg');
  expectEq(await rosterNames('guest'), ['李卫东', '张敏'], '客方');
  expectEq(await rosterNames('host'), ['钱国平', '郑丽华'], '主方');
  expectEq(await page.$$eval('#e-chart g.seat.guest', (g) => g.length), 2, '客方座位标成客');
  await shot('04-facing');
});

await step('换成宴请圆桌：主陪在主位，主宾在主陪右手', async () => {
  await page.click('#e-type [data-type="round"]');
  expectEq(await page.$$eval('tbody[data-side="guest"] .no', (n) => n.map((x) => x.textContent)), ['主宾', '副主宾'], '客方称呼');
  expectEq(await page.$$eval('tbody[data-side="host"] .no', (n) => n.map((x) => x.textContent)), ['主陪', '副陪'], '主方称呼');
  expectEq(await page.$eval('#e-chart g.seat[data-name="钱国平"] .seat-rank', (t) => t.textContent), '主', '主位');
  await shot('05-round');
});

await step('导入对话框：追加名单，同名的跳过', async () => {
  await page.click('#e-import');
  await page.fill('#imp-text', '王五\t副总经理\t远航科技\t客\n李卫东\t董事长\t远航科技\t客');
  expectEq(await page.textContent('#imp-ok'), '导入 1 人', '按钮');
  await shot('06-import');
  await page.click('#imp-ok');
  await page.waitForFunction(() => document.querySelectorAll('tbody[data-side="guest"] tr[data-id]').length === 3);
  expectEq(await rosterNames('guest'), ['李卫东', '张敏', '王五'], '追加后的客方');
});

await step('首页：查找、复制一份、删除后撤销', async () => {
  await page.click('#e-back');
  await page.waitForSelector('.mrow');
  expectEq(await page.locator('.mrow').count(), 2, '两场会议');
  await page.click('.mrow [data-dup]');
  await page.waitForSelector('.editor #e-title');
  if (!(await page.inputValue('#e-title')).includes('副本')) throw new Error('复制出来的会议名称应带"副本"');
  await page.click('#e-back');
  await page.waitForSelector('.home .mrow');
  expectEq(await page.locator('.mrow').count(), 3, '复制后三场');
  await page.locator('.mrow [data-del]').first().click();
  expectEq(await page.locator('.mrow').count(), 2, '删掉一场');
  await page.click('.toast-act');
  expectEq(await page.locator('.mrow').count(), 3, '撤销删除');
  await shot('07-home-list');
});

await step('把 Excel 名单拖进首页：自动新建会议、认出标题行和序号列', async () => {
  await page.evaluate(([b64]) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], '全市安全生产工作会议参会人员名单.xlsx'));
    document.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
    document.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, [xlsxBase64()]);
  await page.waitForSelector('.editor #e-chart svg');
  expectEq(await page.inputValue('#e-title'), '全市安全生产工作会议', '从文件名猜出会议名称');
  expectEq(await rosterNames(), ['王建华', '陈平', '赵国强', '刘晓梅'], '名单和顺序');
});

await step('刷新页面后会议还在', async () => {
  await page.reload();
  await page.waitForSelector('.editor');
  expectEq(await rosterNames(), ['王建华', '陈平', '赵国强', '刘晓梅'], '刷新后');
});

if (errors.length) { failed++; console.log('FAIL 页面报错：\n' + errors.join('\n')); }
await browser.close();
console.log(failed ? `\n${failed} 项失败` : '\n全部通过');
process.exit(failed ? 1 : 0);

// 一份最小的 Excel：第一行合并的标题、序号列、"姓  名"这样带空格的表头
function xlsxBase64() {
  const rows = [['全市安全生产工作会议参会人员名单'], ['序号', '姓  名', '单位', '职务'], ['1', '陈 平', '市住建局', '局长'], ['2', '王建华', '市人民政府', '副市长'], ['3', '刘晓梅', '市应急管理局', '副局长'], ['4', '赵国强', '市应急管理局', '党委书记、局长']];
  const strings = [];
  const idx = (s) => (strings.includes(s) ? strings.indexOf(s) : strings.push(s) - 1);
  const col = (i) => String.fromCharCode(65 + i);
  const sheet = `<worksheet><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => (/^\d+$/.test(v) ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${col(ci)}${ri + 1}" t="s"><v>${idx(v)}</v></c>`)).join('')}</row>`).join('')}</sheetData></worksheet>`;
  return zip({
    'xl/workbook.xml': '<workbook><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet,
    'xl/sharedStrings.xml': `<sst>${strings.map((s) => `<si><t>${s}</t></si>`).join('')}</sst>`,
  }).toString('base64');
}

function zip(files) {
  const crc32 = (buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = enc.encode(content);
    const data = deflateRawSync(raw);
    const nameB = Buffer.from(enc.encode(name));
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(8, 8); h.writeUInt32LE(crc32(raw), 14);
    h.writeUInt32LE(data.length, 18); h.writeUInt32LE(raw.length, 22); h.writeUInt16LE(nameB.length, 26);
    locals.push(h, nameB, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(8, 10); c.writeUInt32LE(crc32(raw), 16);
    c.writeUInt32LE(data.length, 20); c.writeUInt32LE(raw.length, 24); c.writeUInt16LE(nameB.length, 28); c.writeUInt32LE(offset, 42);
    centrals.push(c, nameB);
    offset += 30 + nameB.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
