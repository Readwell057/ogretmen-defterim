const CACHE_NAME = 'ogretmen-defteri-v3';
const ASSETS = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(()=>{})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Önbellekten anında yanıt ver (internet olmasa da uygulama hemen açılsın),
// aynı anda arka planda internetten güncel sürümü çekip bir sonraki açılış için
// önbelleği tazele. Yani: çevrimdışıyken de çalışır, çevrimiçiyken kendini günceller.
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
