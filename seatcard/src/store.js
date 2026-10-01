// 会议保存在本机：浏览器的 localStorage（桌面版里也是，数据在软件自己的目录里）。
// 每场会议一个键，另有一份目录方便列出；还可以整体导出、导入备份文件，换电脑时用。
const INDEX = 'seatcard.meetings';
const PREFIX = 'seatcard.meeting.';
const PREFS = 'seatcard.prefs';

export function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

export function createStore(storage) {
  const get = (k, fallback) => {
    try {
      const v = storage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  };
  const set = (k, v) => {
    try {
      storage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  };
  // 目录里带上人名，首页可以按人名搜到会议
  const summary = (m) => {
    const names = m.people.map((p) => p.name).filter(Boolean);
    return { id: m.id, title: m.title, type: m.type, date: m.date, count: names.length, names: names.slice(0, 120).join(' '), updatedAt: m.updatedAt };
  };
  return {
    list() {
      return get(INDEX, []).sort((a, b) => b.updatedAt - a.updatedAt);
    },
    load(id) {
      return get(PREFIX + id, null);
    },
    save(m) {
      m.updatedAt = Date.now();
      const ok = set(PREFIX + m.id, m);
      const idx = get(INDEX, []).filter((x) => x.id !== m.id);
      idx.push(summary(m));
      return set(INDEX, idx) && ok;
    },
    remove(id) {
      try { storage.removeItem(PREFIX + id); } catch (e) { /* 忽略 */ }
      set(INDEX, get(INDEX, []).filter((x) => x.id !== id));
    },
    prefs() {
      return get(PREFS, {});
    },
    savePrefs(p) {
      set(PREFS, { ...get(PREFS, {}), ...p });
    },
    exportAll() {
      const meetings = get(INDEX, []).map((x) => get(PREFIX + x.id, null)).filter(Boolean);
      return JSON.stringify({ app: 'seatcard', version: 1, exportedAt: new Date().toISOString(), meetings }, null, 1);
    },
    /** 导入备份：同一场会议（同 id）以修改时间新的为准。返回导入的场数。 */
    importAll(json) {
      const data = JSON.parse(json);
      if (!data || data.app !== 'seatcard' || !Array.isArray(data.meetings)) throw new Error('这不是座次桌签的备份文件');
      let n = 0;
      for (const m of data.meetings) {
        if (!m || !m.id || !Array.isArray(m.people)) continue;
        const cur = get(PREFIX + m.id, null);
        if (cur && cur.updatedAt >= m.updatedAt) continue;
        const stamp = m.updatedAt;
        set(PREFIX + m.id, m);
        const idx = get(INDEX, []).filter((x) => x.id !== m.id);
        idx.push({ ...summary(m), updatedAt: stamp });
        set(INDEX, idx);
        n++;
      }
      return n;
    },
  };
}
