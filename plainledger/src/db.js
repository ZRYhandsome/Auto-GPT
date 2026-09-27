// 素账 PlainLedger — IndexedDB 存储（无可用 IndexedDB 时退化为内存 + localStorage 快照）

const DB_NAME = 'plainledger';
const DB_VERSION = 1;
export const STORES = ['transactions', 'members', 'rules', 'budgets', 'settlements', 'meta'];

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class IdbStore {
  constructor(db) { this.db = db; this.kind = 'indexeddb'; }
  async getAll(store) { return reqToPromise(this.db.transaction(store).objectStore(store).getAll()); }
  async put(store, obj) { return reqToPromise(this.db.transaction(store, 'readwrite').objectStore(store).put(obj)); }
  async bulkPut(store, objs) {
    if (!objs.length) return;
    const tx = this.db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    for (const o of objs) os.put(o);
    return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
  }
  async delete(store, key) { return reqToPromise(this.db.transaction(store, 'readwrite').objectStore(store).delete(key)); }
  async clear(store) { return reqToPromise(this.db.transaction(store, 'readwrite').objectStore(store).clear()); }
}

class MemoryStore {
  constructor() {
    this.kind = 'memory';
    this.data = Object.fromEntries(STORES.map((s) => [s, new Map()]));
    try {
      const snap = JSON.parse(localStorage.getItem('plainledger:snapshot') || 'null');
      if (snap) for (const s of STORES) for (const o of snap[s] || []) this.data[s].set(o.id ?? o.key, o);
    } catch (e) { /* ignore */ }
  }
  persist() {
    try {
      const snap = Object.fromEntries(STORES.map((s) => [s, [...this.data[s].values()]]));
      localStorage.setItem('plainledger:snapshot', JSON.stringify(snap));
    } catch (e) { /* storage may be unavailable */ }
  }
  async getAll(store) { return [...this.data[store].values()]; }
  async put(store, obj) { this.data[store].set(obj.id ?? obj.key, obj); this.persist(); }
  async bulkPut(store, objs) { for (const o of objs) this.data[store].set(o.id ?? o.key, o); this.persist(); }
  async delete(store, key) { this.data[store].delete(key); this.persist(); }
  async clear(store) { this.data[store].clear(); this.persist(); }
}

export async function openStore() {
  if (typeof indexedDB === 'undefined') return new MemoryStore();
  try {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        for (const s of STORES) {
          if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: s === 'meta' ? 'key' : 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('blocked'));
    });
    return new IdbStore(db);
  } catch (e) {
    return new MemoryStore();
  }
}

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (already) return true;
      return await navigator.storage.persist();
    }
  } catch (e) { /* ignore */ }
  return false;
}

export async function storageEstimate() {
  try {
    if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate();
  } catch (e) { /* ignore */ }
  return null;
}
