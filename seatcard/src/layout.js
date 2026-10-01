import { roleName } from './round.js';

// 排座规则。位次 rank 从 0 开始（0 = 1 号位）。
//
// "左""右"一律以就座的人自己的朝向为准，这正是大家最容易搞混的地方
// （评论区常问"是拍照人的左边还是被拍照人的左边"）。
//   以左为尊（党政机关惯例）：2 号在 1 号左手，3 号在 1 号右手，依次左右交替；
//     人数为双数时，1、2 号同时居中，2 号仍在 1 号左手。
//   以右为尊（商务、涉外惯例）：左右对调。
// 主席台从台下看过去，左右正好反过来：以左为尊、7 人时，台下看到的是 7 5 3 1 2 4 6。

/** 一排 n 个座位里，第 k 个人坐在哪：返回就座者视角下从左数的下标（0..n-1）。 */
export function centerOrder(n, rule = 'left') {
  const pos = [];
  if (n % 2 === 1) {
    const c = (n - 1) / 2;
    for (let k = 0; k < n; k++) {
      const step = Math.ceil(k / 2);
      pos.push(k === 0 ? c : k % 2 === 1 ? c - step : c + step);
    }
  } else {
    const m = n / 2; // 居中两座里靠右的一个（就座者视角）
    for (let k = 0; k < n; k++) {
      if (k === 0) pos.push(m);
      else if (k === 1) pos.push(m - 1);
      else {
        const j = k - 2;
        const step = Math.floor(j / 2) + 1;
        pos.push(j % 2 === 0 ? m + step : m - 1 - step);
      }
    }
  }
  return rule === 'right' ? pos.map((p) => n - 1 - p) : pos;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * 主席台。people 已按位次排好；perRow 为每排最多人数，多出来的排到第二排、第三排。
 * 返回 rows[0] 为第一排（靠台口）；每个座位的 x 为"从台下看，从左数"的下标。
 */
export function podium(people, { rule = 'left', perRow = 0 } = {}) {
  const size = perRow > 0 ? perRow : Math.max(people.length, 1);
  let rankBase = 0;
  const rows = chunk(people, size).map((group, r) => {
    const n = group.length;
    const pos = centerOrder(n, rule);
    const seats = group.map((person, k) => ({ person, rank: rankBase + k, x: n - 1 - pos[k] }));
    seats.sort((a, b) => a.x - b.x);
    rankBase += n;
    return { row: r, n, seats };
  });
  return { kind: 'podium', rule, rows };
}

/**
 * 会见、会谈的长桌对坐。门在下方：主方背门坐近门一侧，客方面门坐远端（"面门为上"）。
 * x 为以桌子中线为 0 的横坐标（从门口看过去，左负右正），可能是 0.5 的倍数。
 * alignFirst：两方都按同一个方向排，让 1 号对 1 号、2 号对 2 号。
 *   不对齐时各自按自己的朝向排，人数为双数时两方 1 号会错开半个座位。
 */
export function facing(hosts, guests, { rule = 'left', alignFirst = true } = {}) {
  const place = (group, facingDoor) => {
    const n = group.length;
    const pos = centerOrder(n, rule);
    const mid = (n - 1) / 2;
    return group.map((person, k) => {
      // 背门（面朝里）的人，自己的左手就是从门口看的左边；面门的人正好相反
      const x = facingDoor && !alignFirst ? mid - pos[k] : pos[k] - mid;
      return { person, rank: k, x };
    }).sort((a, b) => a.x - b.x);
  };
  return { kind: 'facing', rule, alignFirst, far: place(guests, true), near: place(hosts, false) };
}

/** 导出成表格行：排或方 / 座位（从台下或门口看从左数；圆桌从主位起顺时针数）/ 位次 / 姓名 / 职务 / 单位。 */
export function layoutRows(layout) {
  const out = [];
  if (layout.kind === 'podium') {
    for (const row of layout.rows) {
      row.seats.forEach((s, i) => out.push({ group: `第${row.row + 1}排`, seat: i + 1, rank: s.rank + 1, ...pick(s.person) }));
    }
  } else if (layout.kind === 'round') {
    for (const s of layout.seats) {
      if (s.person) out.push({ group: s.side === 'guest' ? '客方' : '主方', seat: s.seat + 1, rank: roleName(s.side, s.rank, layout.scheme), ...pick(s.person) });
    }
  } else {
    const add = (label, seats) => seats.forEach((s, i) => out.push({ group: label, seat: i + 1, rank: s.rank + 1, ...pick(s.person) }));
    add('客方（面门）', layout.far);
    add('主方（背门）', layout.near);
  }
  return out;
}

function pick(p) {
  return { name: p.name, title: p.title || '', unit: p.unit || '' };
}

export function toCsv(rows, kind = 'podium') {
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const head = kind === 'round'
    ? ['主/客', '座位（主位为 1，顺时针数）', '称呼', '姓名', '职务', '单位']
    : [kind === 'podium' ? '排' : '主/客', kind === 'podium' ? '座位（从台下看，从左数）' : '座位（从门口看，从左数）', '位次', '姓名', '职务', '单位'];
  return '\ufeff' + [head, ...rows.map((r) => [r.group, r.seat, r.rank, r.name, r.title, r.unit])].map((r) => r.map(esc).join(',')).join('\r\n');
}
