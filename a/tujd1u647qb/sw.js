// bigC company 사장님 앱 · 서비스 워커 · 6판 · cc82a8caac (_만들기.mjs 가 만든다)
// 첫 방문에 화면 파일을 폰에 담고, 그다음부터는 인터넷이 없어도 담아 둔 것으로 연다.
// 판이 바뀌면(이 파일이 바뀌면) 새 캐시를 담고 옛 캐시를 지운다.
const CACHE = 'bigc-app-v6-cc82a8caac';
const FILES = ["./","index.html","app.css","app.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('bigc-app-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(caches.match('index.html', { ignoreSearch: true }).then((hit) => hit || fetch(r)));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r)));
});
