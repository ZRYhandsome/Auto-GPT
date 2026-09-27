// 素账 PlainLedger — 手绘 Canvas 图表（无第三方库）

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 320;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** 横向条形图：items = [{label, value, color?}]，按 value 降序绘制。 */
export function drawHBars(canvas, items, { maxBars = 10, color } = {}) {
  const data = items.slice(0, maxBars);
  const rowH = 30;
  const height = Math.max(60, data.length * rowH + 12);
  const { ctx, width } = setupCanvas(canvas, height);
  const ink = cssVar('--ink', '#222');
  const ink3 = cssVar('--ink-3', '#888');
  const bar = color || cssVar('--accent', '#3D5A80');
  const max = Math.max(...data.map((d) => d.value), 0.01);
  const labelW = Math.min(110, Math.max(60, width * 0.28));
  const valueW = 80;
  const barW = Math.max(40, width - labelW - valueW - 16);
  ctx.font = '13px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textBaseline = 'middle';
  data.forEach((d, i) => {
    const y = 8 + i * rowH;
    ctx.fillStyle = ink;
    ctx.textAlign = 'left';
    ctx.fillText(truncate(ctx, d.label, labelW - 8), 4, y + 10);
    const w = Math.max(2, (d.value / max) * barW);
    ctx.fillStyle = d.color || bar;
    roundRect(ctx, labelW, y + 2, w, 16, 3);
    ctx.fillStyle = ink3;
    ctx.textAlign = 'left';
    ctx.fillText(fmt(d.value), labelW + w + 6, y + 10);
  });
  if (!data.length) { ctx.fillStyle = ink3; ctx.textAlign = 'center'; ctx.fillText('暂无数据', width / 2, height / 2); }
}

/** 双系列柱状图：points = [{label, a, b}]，a=支出 b=收入。 */
export function drawTrend(canvas, points, { height = 200 } = {}) {
  const { ctx, width } = setupCanvas(canvas, height);
  const ink3 = cssVar('--ink-3', '#888');
  const line = cssVar('--line', '#ddd');
  const cA = cssVar('--expense', '#C0553B');
  const cB = cssVar('--income', '#2E8B57');
  const padL = 44; const padR = 8; const padT = 12; const padB = 26;
  const plotW = width - padL - padR; const plotH = height - padT - padB;
  const max = Math.max(...points.flatMap((p) => [p.a, p.b]), 1);
  const nice = niceMax(max);
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  // 网格与刻度
  for (let i = 0; i <= 4; i++) {
    const y = padT + plotH - (plotH * i) / 4;
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - padR, y); ctx.stroke();
    ctx.fillStyle = ink3; ctx.textAlign = 'right';
    ctx.fillText(compact((nice * i) / 4), padL - 6, y);
  }
  const groupW = plotW / Math.max(points.length, 1);
  const barW = Math.max(4, Math.min(22, groupW * 0.32));
  points.forEach((p, i) => {
    const x0 = padL + i * groupW + groupW / 2;
    const hA = (p.a / nice) * plotH; const hB = (p.b / nice) * plotH;
    ctx.fillStyle = cA; roundRect(ctx, x0 - barW - 2, padT + plotH - hA, barW, hA, 2);
    ctx.fillStyle = cB; roundRect(ctx, x0 + 2, padT + plotH - hB, barW, hB, 2);
    ctx.fillStyle = ink3; ctx.textAlign = 'center';
    ctx.fillText(p.label, x0, height - padB / 2);
  });
  if (!points.length) { ctx.fillStyle = ink3; ctx.textAlign = 'center'; ctx.fillText('暂无数据', width / 2, height / 2); }
}

/** 进度条（预算）：ratio 0..n，超过 1 用 expense 色。 */
export function drawProgress(canvas, ratio) {
  const { ctx, width } = setupCanvas(canvas, 10);
  ctx.fillStyle = cssVar('--line', '#ddd');
  roundRect(ctx, 0, 0, width, 10, 5);
  ctx.fillStyle = ratio > 1 ? cssVar('--expense', '#C0553B') : ratio > 0.8 ? cssVar('--warn', '#B8860B') : cssVar('--accent', '#3D5A80');
  roundRect(ctx, 0, 0, Math.min(1, ratio) * width, 10, 5);
}

function roundRect(ctx, x, y, w, h, r) {
  if (w <= 0 || h <= 0) return;
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.fill();
}

function truncate(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * p;
}

function compact(v) {
  if (v >= 10000) return `${(v / 10000).toFixed(v % 10000 ? 1 : 0)}万`;
  return String(Math.round(v));
}
