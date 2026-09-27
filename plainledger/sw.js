// 素账 PlainLedger — Service Worker：缓存应用壳，离线可用（数据在 IndexedDB，不经过网络）
const CACHE = 'plainledger-v1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest', './icon.svg',
  './src/app.js', './src/csv.js', './src/rules.js', './src/split.js', './src/merge.js', './src/db.js', './src/charts.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const network = fetch(e.request).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
});
