// 生成座次图和桌签的 SVG 字符串。座次图用像素坐标，桌签用毫米坐标（打印时 1:1）。
import { sheetLayout, paginate, faceText, defaultMeasure } from './cards.js';
import { roleName } from './round.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const FONTS = {
  song: { label: '宋体', css: '"Songti SC","STSong","SimSun","Noto Serif CJK SC","Source Han Serif SC",serif' },
  xbs: { label: '小标宋（有则用）', css: '"FZXiaoBiaoSong-B05S","方正小标宋简体","FZXBSJW--GB1-0","STZhongsong","Songti SC","SimSun",serif' },
  hei: { label: '黑体', css: '"PingFang SC","Heiti SC","Microsoft YaHei","SimHei","Noto Sans CJK SC",sans-serif' },
  kai: { label: '楷体', css: '"Kaiti SC","STKaiti","KaiTi","KaiTi_GB2312",serif' },
};

// ---------- 座次图 ----------
const SEAT_W = 104;
const SEAT_H = 66;
const GAP = 12;

// 座位：data-id 供界面点选、拖动互换；selected 时加粗描边
function seatBox(x, y, seat, { showTitle = true, sub = '', badge = '', selectedId = null, guest = false } = {}) {
  const p = seat.person;
  const second = sub || (showTitle ? p.title : '');
  const title = second ? `<text x="${x + SEAT_W / 2}" y="${y + 54}" class="seat-title">${esc(trim(second, 8))}</text>` : '';
  const cls = ['seat', p.id !== undefined && p.id === selectedId ? 'selected' : '', guest ? 'guest' : ''].filter(Boolean).join(' ');
  return `<g class="${cls}" data-name="${esc(p.name)}" data-id="${esc(p.id ?? '')}">
  <rect x="${x}" y="${y}" width="${SEAT_W}" height="${SEAT_H}" rx="8" class="seat-box"/>
  <circle cx="${x + 15}" cy="${y + 15}" r="11" class="seat-badge${guest ? ' guest' : ''}"/>
  <text x="${x + 15}" y="${y + 19.5}" class="seat-rank">${badge || seat.rank + 1}</text>
  <text x="${x + SEAT_W / 2}" y="${y + 37}" class="seat-name">${esc(trim(p.name, 6))}</text>${title}
</g>`;
}

function emptySeat(x, y) {
  return `<g class="seat-empty"><rect x="${x}" y="${y}" width="${SEAT_W}" height="${SEAT_H}" rx="8" class="empty-box"/><text x="${x + SEAT_W / 2}" y="${y + 38}" class="note">空位</text></g>`;
}

function trim(s, n) {
  const a = [...String(s)];
  return a.length > n ? a.slice(0, n - 1).join('') + '…' : a.join('');
}

const CHART_STYLE = `<style>
.seat-box{fill:#fff;stroke:#1f2937;stroke-width:1.4}
.seat.guest .seat-box{fill:#eff6ff}
.seat.selected .seat-box{stroke:#b91c1c;stroke-width:3}
.empty-box{fill:none;stroke:#cbd5e1;stroke-width:1.2;stroke-dasharray:4 3}
.round-table{fill:#fdf6e3;stroke:#d6b36a;stroke-width:2}
.seat-badge{fill:#b91c1c}
.seat-badge.guest{fill:#1d4ed8}
.seat-rank{fill:#fff;font:600 12px system-ui,sans-serif;text-anchor:middle}
.seat-name{fill:#111827;font:600 17px "PingFang SC","Microsoft YaHei",sans-serif;text-anchor:middle}
.seat-title{fill:#6b7280;font:11px "PingFang SC","Microsoft YaHei",sans-serif;text-anchor:middle}
.stage{fill:#fef3c7;stroke:#d97706}
.table{fill:#f3f4f6;stroke:#9ca3af}
.label{fill:#374151;font:600 14px "PingFang SC","Microsoft YaHei",sans-serif;text-anchor:middle}
.note{fill:#6b7280;font:12px "PingFang SC","Microsoft YaHei",sans-serif;text-anchor:middle}
.door{fill:none;stroke:#6b7280;stroke-width:2}
</style>`;

/**
 * mirror=false：从台下（或门口）看；mirror=true：从台上（或背对门口）看。
 */
export function chartSvg(layout, { mirror = false, title = '', selectedId = null } = {}) {
  const opts = { selectedId };
  if (layout.kind === 'podium') return podiumSvg(layout, mirror, title, opts);
  if (layout.kind === 'round') return roundSvg(layout, title, opts);
  return facingSvg(layout, mirror, title, opts);
}

function podiumSvg(layout, mirror, title, opts) {
  const maxN = Math.max(1, ...layout.rows.map((r) => r.n));
  const width = Math.max(maxN * (SEAT_W + GAP) - GAP + 80, 420);
  const rowsH = layout.rows.length * (SEAT_H + 26);
  const top = title ? 64 : 34;
  const height = top + 40 + rowsH + 70;
  const parts = [];
  if (title) parts.push(`<text x="${width / 2}" y="30" class="label" style="font-size:20px">${esc(title)}</text>`);
  // 主席台在上方，第一排离台下最近，画在最下面
  parts.push(`<rect x="20" y="${top}" width="${width - 40}" height="${rowsH + 40}" rx="10" class="stage"/>`);
  parts.push(`<text x="${width / 2}" y="${top + 24}" class="label">主席台</text>`);
  layout.rows.forEach((row, r) => {
    const y = top + 36 + (layout.rows.length - 1 - r) * (SEAT_H + 26);
    const rowW = row.n * (SEAT_W + GAP) - GAP;
    const x0 = (width - rowW) / 2;
    const seats = mirror ? [...row.seats].reverse() : row.seats;
    seats.forEach((s, i) => parts.push(seatBox(x0 + i * (SEAT_W + GAP), y, s, opts)));
    if (layout.rows.length > 1) parts.push(`<text x="${x0 - 8}" y="${y + SEAT_H / 2 + 4}" class="note" style="text-anchor:end">第${r + 1}排</text>`);
  });
  const by = top + rowsH + 40 + 30;
  parts.push(`<text x="${width / 2}" y="${by}" class="label">${mirror ? '↓ 本图为从台上往台下看' : '↑ 本图为从台下看主席台'}</text>`);
  parts.push(`<text x="${width / 2}" y="${by + 22}" class="note">${layout.rule === 'left' ? '以左为尊：2 号在 1 号左手（以台上就座者自己的左右为准）' : '以右为尊：2 号在 1 号右手（以台上就座者自己的左右为准）'}</text>`);
  return wrap(width, height, parts.join('\n'));
}

function facingSvg(layout, mirror, title, opts) {
  const xs = [...layout.far, ...layout.near].map((s) => s.x);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(0, ...xs);
  const span = (maxX - minX + 1) * (SEAT_W + GAP);
  const width = Math.max(span + 120, 460);
  const top = title ? 64 : 30;
  const cx = width / 2;
  const toPx = (x) => cx + (mirror ? -x : x) * (SEAT_W + GAP) - SEAT_W / 2;
  const parts = [];
  if (title) parts.push(`<text x="${cx}" y="30" class="label" style="font-size:20px">${esc(title)}</text>`);
  const farY = top + 26;
  const tableY = farY + SEAT_H + 12;
  const tableH = 46;
  const nearY = tableY + tableH + 12;
  const farLabel = mirror ? '主方（背门）' : '客方（面门）';
  const nearLabel = mirror ? '客方（面门）' : '主方（背门）';
  const farSeats = mirror ? layout.near : layout.far;
  const nearSeats = mirror ? layout.far : layout.near;
  parts.push(`<text x="${cx}" y="${farY - 8}" class="label">${farLabel}</text>`);
  farSeats.forEach((s) => parts.push(seatBox(toPx(s.x), farY, s, { ...opts, guest: s.person.side === 'guest' })));
  parts.push(`<rect x="${cx - span / 2 - 10}" y="${tableY}" width="${span + 20}" height="${tableH}" rx="8" class="table"/>`);
  parts.push(`<text x="${cx}" y="${tableY + tableH / 2 + 5}" class="note">会谈桌</text>`);
  nearSeats.forEach((s) => parts.push(seatBox(toPx(s.x), nearY, s, { ...opts, guest: s.person.side === 'guest' })));
  parts.push(`<text x="${cx}" y="${nearY + SEAT_H + 22}" class="label">${nearLabel}</text>`);
  // 门的弧线向上画 26 像素，要和上面"主方（背门）"几个字留出空隙
  const doorY = nearY + SEAT_H + 72;
  if (mirror) {
    parts.push(`<text x="${cx}" y="${farY - 30}" class="note">门在这一侧（图的上方）</text>`);
  } else {
    parts.push(`<path d="M ${cx - 26} ${doorY} h 52 M ${cx - 26} ${doorY} a 26 26 0 0 1 26 -26" class="door"/>`);
    parts.push(`<text x="${cx}" y="${doorY + 20}" class="note">门（本图为从门口看进去）</text>`);
  }
  const note = layout.alignFirst ? '两方按同一方向排：1 号对 1 号、2 号对 2 号' : '两方各按自己的朝向排：人数为双数时 1 号会错开半个座位';
  parts.push(`<text x="${cx}" y="${doorY + 42}" class="note">${note}</text>`);
  return wrap(width, doorY + 60, parts.join('\n'));
}

function roundSvg(layout, title, opts) {
  const n = layout.n;
  // 座位排在圆周上，半径随人数变大，保证座位不重叠
  const R = Math.max(150, (n * (SEAT_W + 16)) / (2 * Math.PI) + 30);
  const top = title ? 70 : 34;
  const width = 2 * R + SEAT_W + 80;
  const cx = width / 2;
  const cy = top + SEAT_H / 2 + R;
  const parts = [];
  if (title) parts.push(`<text x="${cx}" y="34" class="label" style="font-size:20px">${esc(title)}</text>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${R - SEAT_H / 2 - 16}" class="round-table"/>`);
  parts.push(`<text x="${cx}" y="${cy - 6}" class="label">${layout.scheme === 'single' ? '主人居中' : '主陪面门 · 副陪背门'}</text>`);
  parts.push(`<text x="${cx}" y="${cy + 16}" class="note">${layout.rule === 'right' ? '以右为尊：主宾在主陪右手' : '以左为尊：主宾在主陪左手'}</text>`);
  for (const s of layout.seats) {
    const a = -Math.PI / 2 + (2 * Math.PI * s.seat) / n;
    const x = cx + R * Math.cos(a) - SEAT_W / 2;
    const y = cy + R * Math.sin(a) - SEAT_H / 2;
    if (!s.person) { parts.push(emptySeat(x, y)); continue; }
    const role = roleName(s.side, s.rank, layout.scheme);
    parts.push(seatBox(x, y, s, { ...opts, showTitle: false, sub: role, badge: s.seat === 0 ? '主' : '', guest: s.side === 'guest' }));
  }
  const doorY = cy + R + SEAT_H / 2 + 34;
  parts.push(`<path d="M ${cx - 26} ${doorY} h 52 M ${cx - 26} ${doorY} a 26 26 0 0 1 26 -26" class="door"/>`);
  parts.push(`<text x="${cx}" y="${doorY + 20}" class="note">门（主位正对门口）</text>`);
  if (layout.overflow) parts.push(`<text x="${cx}" y="${doorY + 40}" class="note" style="fill:#b45309">人数超过设定的每桌人数，已自动加座</text>`);
  return wrap(width, doorY + (layout.overflow ? 56 : 36), parts.join('\n'));
}

function wrap(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="PingFang SC, Microsoft YaHei, sans-serif">${CHART_STYLE}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
}

// ---------- 桌签 ----------

/**
 * 返回 { page, pages:[svg字符串] }。每页是一张 A4，单位毫米。
 * opts: preset({faceW,faceH,faces}), font(css), bold, color, sub('none'|'title'|'unit'), widenTwo, guides, measure
 */
export function cardPages(people, opts) {
  const layout = sheetLayout(opts.preset);
  const { page, sheet, slots, faces } = layout;
  const measure = opts.measure || defaultMeasure;
  const weight = opts.bold ? 700 : 400;
  const pages = paginate(people, slots.length).map((group) => {
    const parts = [];
    group.forEach((person, i) => {
      const { x, y } = slots[i];
      if (opts.guides) parts.push(`<rect x="${x}" y="${y}" width="${sheet.w}" height="${sheet.h}" fill="none" stroke="#c8c8c8" stroke-width="0.2" stroke-dasharray="1.5 1.5"/>`);
      faces.forEach((face, fi) => {
        const fy = y + face.y;
        if (opts.guides && fi > 0) parts.push(`<line x1="${x}" y1="${fy}" x2="${x + sheet.w}" y2="${fy}" stroke="#b0b0b0" stroke-width="0.25" stroke-dasharray="3 2"/>`);
        if (face.blank) return;
        const t = faceText(person, face, { faceW: sheet.w, sub: opts.sub, measure, widenTwo: opts.widenTwo });
        const g = [];
        g.push(spacedText(t.name, x + sheet.w / 2, fy + t.nameBaseline, t.nameSize, t.spacing, measure, opts, weight));
        if (t.sub) g.push(spacedText(t.sub, x + sheet.w / 2, fy + t.subBaseline, t.subSize, 0.05, measure, opts, 400));
        const cx = x + sheet.w / 2;
        const cy = fy + face.h / 2;
        parts.push(face.flip ? `<g transform="rotate(180 ${cx} ${cy})">${g.join('')}</g>` : g.join(''));
      });
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${page.w} ${page.h}" width="${page.w}mm" height="${page.h}mm"><rect width="${page.w}" height="${page.h}" fill="#fff"/>${parts.join('\n')}</svg>`;
  });
  return { page, perPage: slots.length, pages };
}

// 逐字定位，不依赖浏览器对 letter-spacing 的实现，保证居中
function spacedText(text, cx, baseline, size, spacing, measure, opts, weight) {
  const chars = [...text];
  const widths = chars.map((c) => measure(c) * size);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * size * Math.max(chars.length - 1, 0);
  let x = cx - total / 2;
  const out = chars.map((c, i) => {
    const mid = x + widths[i] / 2;
    x += widths[i] + spacing * size;
    return `<text x="${mid.toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="middle">${esc(c)}</text>`;
  });
  return `<g font-family='${opts.font}' font-size="${size.toFixed(2)}" font-weight="${weight}" fill="${opts.color || '#000'}">${out.join('')}</g>`;
}
