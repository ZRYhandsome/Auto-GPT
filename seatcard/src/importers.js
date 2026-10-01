// 从文件导入名单：Excel（.xlsx）、Word（.docx 里的第一张表格）、CSV、TXT。
// 不依赖第三方库：xlsx 和 docx 都是 zip 包里的 XML，这里自己解压、用正则取单元格文字。
// 老格式（.xls、.doc、.et、.wps）读不了，提示用户另存或直接复制粘贴。
// 统一转成"制表符分隔的文字"，再交给 parse.js 识别表头和列，和粘贴走同一条路。

export class ImportError extends Error {}

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

async function inflateRaw(data) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([data]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** 读 zip：返回 { 文件名: Uint8Array }。只支持存储和 deflate 两种压缩方式（Office 文件就这两种）。 */
export async function readZip(buffer) {
  const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) {
    if (u32(b, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new ImportError('文件不是有效的 Office 文档（可能已损坏，或是老格式）');
  const count = u16(b, eocd + 10);
  let p = u32(b, eocd + 16);
  const out = {};
  const dec = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (u32(b, p) !== 0x02014b50) throw new ImportError('文件目录损坏');
    const method = u16(b, p + 10);
    const csize = u32(b, p + 20);
    const nameLen = u16(b, p + 28);
    const extraLen = u16(b, p + 30);
    const commentLen = u16(b, p + 32);
    const local = u32(b, p + 42);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    const lNameLen = u16(b, local + 26);
    const lExtraLen = u16(b, local + 28);
    const start = local + 30 + lNameLen + lExtraLen;
    const raw = b.subarray(start, start + csize);
    if (method === 0) out[name] = raw;
    else if (method === 8) out[name] = await inflateRaw(raw);
  }
  return out;
}

export function xmlText(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

function colIndex(ref) {
  const letters = ref.replace(/\d+/g, '');
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Excel：取第一张有内容的工作表，返回二维文字数组。 */
export function xlsxRows(files) {
  const dec = new TextDecoder();
  const read = (name) => (files[name] ? dec.decode(files[name]) : '');
  const shared = [];
  const ss = read('xl/sharedStrings.xml');
  for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    // 只取 <t> 里的字，跳过拼音注音 <rPh>
    const body = m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '');
    shared.push([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1])).join(''));
  }
  // 按工作簿里的顺序找工作表
  const wb = read('xl/workbook.xml');
  const rels = read('xl/_rels/workbook.xml.rels');
  const relMap = {};
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /Id="([^"]+)"/.exec(m[0]);
    const target = /Target="([^"]+)"/.exec(m[0]);
    if (id && target) relMap[id[1]] = target[1].replace(/^\/?xl\//, '').replace(/^\//, '');
  }
  const sheets = [...wb.matchAll(/<sheet\b[^>]*r:id="([^"]+)"[^>]*\/?>/g)].map((m) => `xl/${relMap[m[1]] || ''}`);
  if (!sheets.length) sheets.push(...Object.keys(files).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort());
  for (const sheet of sheets) {
    const xml = read(sheet);
    const rows = [];
    for (const r of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      let next = 0;
      for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1];
        const body = c[2] || '';
        const ref = /r="([A-Z]+\d+)"/.exec(attrs);
        const idx = ref ? colIndex(ref[1]) : next;
        const type = (/t="(\w+)"/.exec(attrs) || [])[1];
        let v = '';
        if (type === 'inlineStr') v = [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1])).join('');
        else {
          const raw = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1];
          if (raw !== undefined) v = type === 's' ? shared[Number(raw)] ?? '' : xmlText(raw);
        }
        row[idx] = v;
        next = idx + 1;
      }
      rows.push(Array.from(row, (x) => x ?? ''));
    }
    if (rows.some((r) => r.some((x) => String(x).trim()))) return rows;
  }
  return [];
}

/** Word：取第一张至少两行的表格；没有表格就按段落一行一个人。 */
export function docxRows(files) {
  const xml = files['word/document.xml'] ? new TextDecoder().decode(files['word/document.xml']) : '';
  if (!xml) throw new ImportError('这个 Word 文件里找不到正文');
  const paraText = (s) => [...s.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
    .map((p) => [...p[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((t) => xmlText(t[1])).join(''))
    .filter((t) => t.trim()).join(' ');
  for (const t of xml.matchAll(/<w:tbl>([\s\S]*?)<\/w:tbl>/g)) {
    const rows = [...t[1].matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((tr) => [...tr[0].matchAll(/<w:tc>([\s\S]*?)<\/w:tc>/g)].map((tc) => paraText(tc[1]).trim()));
    if (rows.filter((r) => r.some(Boolean)).length >= 2) return rows;
  }
  return [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
    .map((p) => [...p[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((t) => xmlText(t[1])).join('').trim())
    .filter(Boolean).map((line) => [line]);
}

/** CSV：自动识别 UTF-8 和 GBK（Excel 在中文 Windows 上默认存 GBK）。 */
export function decodeText(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return new TextDecoder('utf-8').decode(b.subarray(3));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b);
  } catch (e) {
    return new TextDecoder('gbk').decode(b);
  }
}

export function csvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function rowsToText(rows) {
  return rows
    .map((r) => r.map((c) => String(c ?? '').replace(/[\t\r\n]+/g, ' ').trim()))
    .filter((r) => r.some(Boolean))
    .map((r) => r.join('\t'))
    .join('\n');
}

/** 统一入口：name 用来判断格式，bytes 为文件内容。返回 { text, from }。 */
export async function importFile(name, bytes) {
  const ext = (/\.([a-z0-9]+)$/i.exec(name) || [])[1]?.toLowerCase() || '';
  if (['xls', 'et', 'doc', 'wps'].includes(ext)) {
    throw new ImportError(`".${ext}" 是老格式，读不了。请在 Excel、Word 或 WPS 里"另存为" .xlsx 或 .docx，或者直接把表格复制粘贴进来。`);
  }
  if (ext === 'xlsx' || ext === 'xlsm') return { text: rowsToText(xlsxRows(await readZip(bytes))), from: 'Excel' };
  if (ext === 'docx') return { text: rowsToText(docxRows(await readZip(bytes))), from: 'Word' };
  if (ext === 'csv') return { text: rowsToText(csvRows(decodeText(bytes))), from: 'CSV' };
  if (ext === 'txt' || ext === 'tsv' || ext === '') return { text: decodeText(bytes), from: '文本' };
  throw new ImportError(`不认识".${ext}"格式。支持 Excel（.xlsx）、Word（.docx）、CSV 和 TXT。`);
}
