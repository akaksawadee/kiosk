// Service worker ringkas: simpan fail app supaya terbuka cepat.
// Kandungan Apps Script (data jualan) TIDAK disimpan — sentiasa diambil terus dari internet.
const CACHE = 'sawadee-v1';
const FAIL = ['./', './index.html', './config.js', './app.js',
  './vendor/', './vendor/index.html', './vendor/manifest.webmanifest',
  './staf/', './staf/index.html', './staf/manifest.webmanifest',
  './ikon/vendor-192.png', './ikon/vendor-512.png', './ikon/staf-192.png', './ikon/staf-512.png', './ikon/favicon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FAIL.map(f => c.add(f).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
// Utamakan internet (supaya perubahan config.js terus berkesan), guna simpanan bila offline.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const salin = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, salin));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
