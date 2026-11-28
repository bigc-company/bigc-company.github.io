// bigC company 사장님 앱 · 서비스 워커 · 7판 · 4d1d7d8190 (_만들기.mjs 가 만든다)
// 첫 방문에 화면 파일을 폰에 담고, 그다음부터는 인터넷이 없어도 담아 둔 것으로 연다.
// 판이 바뀌면(이 파일이 바뀌면) 새 캐시를 담고 옛 캐시를 지운다.
// 홍보자료 폴더의 원본 이미지 · 영상은 미리 담지 않고, 처음 열거나 공유할 때 받아 MEDIA 캐시에 둔다(같은 판 동안).
const CACHE = 'bigc-app-v7-4d1d7d8190';
const MEDIA = 'bigc-app-media-4d1d7d8190';
const FILES = ["./","index.html","app.css","app.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","홍보자료/자료목록.json","홍보자료/방목록.json","홍보자료/미리보기.json","홍보자료/미리/A-식당.jpg","홍보자료/미리/A-식당-스토리.jpg","홍보자료/미리/A-식당-페북.jpg","홍보자료/미리/B-식당-영상.jpg","홍보자료/미리/B-식당-스토리.jpg","홍보자료/미리/B-식당-움짤.jpg","홍보자료/미리/B-식당-끝장면.jpg","홍보자료/미리/A-공장.jpg","홍보자료/미리/A-공장-스토리.jpg","홍보자료/미리/A-공장-페북.jpg","홍보자료/미리/B-공장-영상.jpg","홍보자료/미리/B-공장-스토리.jpg","홍보자료/미리/B-공장-움짤.jpg","홍보자료/미리/B-공장-끝장면.jpg","홍보자료/미리/A-골프.jpg","홍보자료/미리/A-골프-스토리.jpg","홍보자료/미리/A-골프-페북.jpg","홍보자료/미리/B-골프-영상.jpg","홍보자료/미리/B-골프-스토리.jpg","홍보자료/미리/B-골프-움짤.jpg","홍보자료/미리/B-골프-끝장면.jpg","홍보자료/미리/A-부동산.jpg","홍보자료/미리/A-부동산-스토리.jpg","홍보자료/미리/A-부동산-페북.jpg","홍보자료/미리/B-부동산-영상.jpg","홍보자료/미리/B-부동산-스토리.jpg","홍보자료/미리/B-부동산-움짤.jpg","홍보자료/미리/B-부동산-끝장면.jpg","홍보자료/미리/A-마트배달.jpg","홍보자료/미리/A-마트배달-스토리.jpg","홍보자료/미리/A-마트배달-페북.jpg","홍보자료/미리/B-마트배달-영상.jpg","홍보자료/미리/B-마트배달-스토리.jpg","홍보자료/미리/B-마트배달-움짤.jpg","홍보자료/미리/B-마트배달-끝장면.jpg","홍보자료/미리/A-마트재고.jpg","홍보자료/미리/B-마트주문-영상.jpg","홍보자료/미리/B-마트주문-움짤.jpg","홍보자료/미리/B-마트주문-끝장면.jpg","홍보자료/미리/C1-식당.jpg","홍보자료/미리/C2-식당.jpg","홍보자료/미리/C3-식당.jpg","홍보자료/미리/D-공장.jpg","홍보자료/미리/E-쇼룸.jpg","홍보자료/미리/F-마트정산.jpg","홍보자료/문구/글_새판/1130_1030_세부_R_말투판.txt","홍보자료/문구/글_새판/1130_1900_필리핀장터광고방_F화면_말투판.txt","홍보자료/문구/글_새판/1130_1800_24시장터_T_말투판.txt","홍보자료/문구/글_새판/1129_1000_호치민광고방_T_말투판.txt","홍보자료/문구/글_새판/1130_1100_필리핀장터광고방_H_말투판.txt","홍보자료/문구/글_새판/1129_1900_필리핀장터광고방_H화면_말투판.txt","홍보자료/문구/글_새판/1128판_필리핀장터광고방_1128판_말투판.txt","홍보자료/문구/글_새판/1129_1030_세부_M_말투판.txt","홍보자료/문구/글_새판/1128판_장터방_1128_1128판_말투판.txt"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('bigc-app-') && k !== CACHE && k !== MEDIA).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin || r.headers.has('range')) return;
  const promo = decodeURIComponent(new URL(r.url).pathname).includes('/홍보자료/');
  if (promo) {
    e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r).then((res) => {
      if (res.status === 200) { const c = res.clone(); caches.open(MEDIA).then((m) => m.put(r, c)); }
      return res;
    })));
    return;
  }
  if (r.mode === 'navigate') {
    e.respondWith(caches.match('index.html', { ignoreSearch: true }).then((hit) => hit || fetch(r)));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r)));
});
