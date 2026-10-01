// 圆桌宴请。座位从正对门的位置（主位）开始顺时针编号 0..n-1，门在下方。
// 中式宴请一般"以右为尊"：主宾坐在主人右手。围桌而坐的人都面朝桌心，所以每个人的右手边
// 都在逆时针方向：主位的右手边是编号 n-1（图上左侧），对面副陪的右手边是 opp-1（图上右侧）。
//
// 两种常见坐法：
//   pair（主副陪，北方常见）：主陪面门坐主位，副陪背门坐对面；主宾在主陪右手、副主宾在主陪左手，
//     三宾在副陪右手、四宾在副陪左手；其余宾主从靠近主位的座位起，宾、陪交替往下坐。
//   single（主人居中）：主人坐主位，客人按主宾、第二宾……在主人右、左交替往下坐，陪同人员坐剩下的位置。
// rule = 'left' 时左右对调。排出来只是起点，可以拖动互换。

export function roundTable(hosts, guests, { size = 10, scheme = 'pair', rule = 'right' } = {}) {
  const total = hosts.length + guests.length;
  const n = Math.max(size, total, 2);
  const seat = new Array(n).fill(null);
  // 尊位一侧的方向：以右为尊时往逆时针方向走（-1）
  const honorStep = rule === 'right' ? -1 : 1;
  const at = (s) => ((s % n) + n) % n;
  const place = (s, person, side, rank) => { seat[at(s)] = { person, side, rank }; };
  const free = (s) => seat[at(s)] === null;
  const opp = Math.floor(n / 2);
  const hostQ = hosts.map((p, i) => ({ person: p, side: 'host', rank: i }));
  const guestQ = guests.map((p, i) => ({ person: p, side: 'guest', rank: i }));

  // 主位附近、按尊卑排好的空座：主位右 1、左 1、右 2、左 2……
  const honorOrder = () => {
    const out = [];
    const r = honorStep;
    for (let k = 1; k < n; k++) {
      for (const s of [at(r * k), at(-r * k)]) if (!out.includes(s) && s !== 0) out.push(s);
    }
    return out;
  };

  if (hostQ.length) { const h = hostQ.shift(); place(0, h.person, h.side, h.rank); }
  else if (guestQ.length) { const g = guestQ.shift(); place(0, g.person, g.side, g.rank); }

  if (scheme === 'pair') {
    if (hostQ.length) { const h = hostQ.shift(); place(opp, h.person, h.side, h.rank); }
    const r = honorStep;
    const targets = [at(r), at(-r), at(opp + r), at(opp - r)];
    for (const s of targets) {
      if (!guestQ.length) break;
      if (!free(s)) continue;
      const g = guestQ.shift();
      place(s, g.person, g.side, g.rank);
    }
    // 其余宾、陪交替
    const rest = [];
    while (guestQ.length || hostQ.length) {
      if (guestQ.length) rest.push(guestQ.shift());
      if (hostQ.length) rest.push(hostQ.shift());
    }
    for (const s of honorOrder()) {
      if (!rest.length) break;
      if (!free(s)) continue;
      const x = rest.shift();
      place(s, x.person, x.side, x.rank);
    }
  } else {
    const rest = [...guestQ, ...hostQ];
    for (const s of honorOrder()) {
      if (!rest.length) break;
      if (!free(s)) continue;
      const x = rest.shift();
      place(s, x.person, x.side, x.rank);
    }
  }
  return {
    kind: 'round', n, scheme, rule, overflow: total > size,
    seats: seat.map((x, s) => ({ seat: s, ...(x || { person: null, side: '', rank: -1 }) })),
  };
}

const HOST_ROLES = ['主陪', '副陪', '三陪', '四陪', '五陪', '六陪'];
const GUEST_ROLES = ['主宾', '副主宾', '三宾', '四宾', '五宾', '六宾'];

/** 座位上的称呼：主陪、副主宾、三宾……；single 坐法下主方 1 号叫"主人"。 */
export function roleName(side, rank, scheme = 'pair') {
  if (side === 'host') {
    if (scheme === 'single') return rank === 0 ? '主人' : `陪同${rank}`;
    return HOST_ROLES[rank] || `陪${rank + 1}`;
  }
  if (side === 'guest') return GUEST_ROLES[rank] || `宾${rank + 1}`;
  return '';
}
