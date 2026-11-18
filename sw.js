// Service worker ringkas: simpan fail app supaya terbuka cepat.
// Kandungan Apps Script (data jualan) TIDAK disimpan — sentiasa diambil terus dari internet.
const CACHE = 'sawadee-v3';
const FAIL = ['./', './index.html', './vendor.html', './staf.html', './config.js', './app.js',
  './manifest-vendor.webmanifest', './manifest-staf.webmanifest',
  './vendor-192.png', './vendor-512.png', './staf-192.png', './staf-512.png', './favicon.png'];

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

// ===== Notifikasi pop-up (dihantar oleh Apps Script melalui Firebase Cloud Messaging) =====
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { data: { isi: e.data ? e.data.text() : '' } }; }
  const data = d.data || {}, n = d.notification || {};
  const tajuk = data.tajuk || n.title || 'Kiosk Akak Sawadee';
  const isi = data.isi || n.body || '';
  const jenis = data.jenis === 'staf' ? 'staf' : 'vendor';
  e.waitUntil(self.registration.showNotification(tajuk, {
    body: isi,
    tag: data.tag || 'sawadee',
    renotify: true,
    icon: new URL(jenis + '-192.png', self.location).href,
    data: { url: new URL(jenis + '.html', self.location).href }
  }));
});
// Tekan notifikasi → buka (atau bawa ke depan) app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(senarai => {
    for (const c of senarai) if (c.url.indexOf(url) === 0 && 'focus' in c) return c.focus();
    return clients.openWindow(url);
  }));
});
