// Pembalut app: buka Web App Apps Script dalam skrin penuh.
// JENIS ditetapkan dalam setiap halaman: 'vendor' atau 'staf'.
(function () {
  var muat = document.getElementById('muat');
  var mesej = document.getElementById('mesej');
  var app = document.getElementById('app');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js', { scope: './' }).catch(function () {});
  }

  function tunjuk(html) {
    muat.style.display = 'flex';
    mesej.innerHTML = html;
  }

  var sah = typeof APP_URL === 'string' &&
    /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[^/]+\/exec/.test(APP_URL.trim());
  if (!sah) {
    tunjuk('<b>Link app belum ditetapkan.</b><br>Admin perlu tampal link Web App Apps Script dalam fail <code>config.js</code>.');
    return;
  }

  var url = APP_URL.trim().split('?')[0];
  if (JENIS === 'vendor') url += '?vendor=1';

  function bukaApp() {
    if (!navigator.onLine) {
      tunjuk('📶 <b>Tiada sambungan internet.</b><br>App akan dibuka semula secara automatik bila internet kembali.');
      return;
    }
    mesej.textContent = 'Memuatkan…';
    app.src = url;
  }
  app.addEventListener('load', function () {
    if (app.src) setTimeout(function () { muat.style.display = 'none'; }, 300);
  });
  window.addEventListener('online', function () { if (!app.src || muat.style.display !== 'none') bukaApp(); });
  bukaApp();

})();
