// Pembalut app: buka Web App Apps Script dalam skrin penuh + urus notifikasi telefon.
// JENIS ditetapkan dalam setiap halaman: 'vendor' atau 'staf'.
(function () {
  var muat = document.getElementById('muat');
  var mesej = document.getElementById('mesej');
  var app = document.getElementById('app');
  var daftarSW = null;

  if ('serviceWorker' in navigator) {
    daftarSW = navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () { return null; });
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

  mulaIntro();

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

  /* ======================= INTRO (trailer pembuka) ======================= */
  function mulaIntro() {
    var lalai = {
      aktif: true, saat: 5, sekaliSehari: false,
      vendor: [
        'Rezeki yang halal, walau sedikit, tetap membawa berkat.',
        'Setiap bungkusan yang anda hantar membawa senyuman kepada pelanggan.',
        'Usaha hari ini, rezeki hari esok. Teruskan!',
        'Masakan dari hati, sampai ke hati.',
        'Sedikit demi sedikit, lama-lama jadi bukit.',
        'Terima kasih kerana bersama Kiosk Akak Sawadee!'
      ],
      staf: [
        'Senyuman anda ialah hidangan pertama pelanggan.',
        'Kira dengan teliti, rekod dengan jujur.',
        'Kerja berpasukan menjadikan kiosk kita lebih baik.',
        'Pelanggan gembira, rezeki pun bertambah.',
        'Terima kasih atas usaha anda hari ini!'
      ]
    };
    // Keutamaan: tetapan dari app admin (disimpan di telefon) → config.js → lalai
    var simpanan = null;
    try { simpanan = JSON.parse(localStorage.getItem('intro_tetapan') || 'null'); } catch (e) {}
    var c = simpanan || ((typeof INTRO === 'object' && INTRO) ? INTRO : {});
    var mula = Date.now(), elUcapan = null, tamatFn = null;
    // ambil tetapan terbaru dari app admin di belakang tabir (untuk kali ini jika sempat, atau kali seterusnya)
    try {
      fetch(APP_URL.trim().split('?')[0] + '?intro=1').then(function (r) { return r.json(); }).then(function (t) {
        if (!t || !t.vendor) return;
        try { localStorage.setItem('intro_tetapan', JSON.stringify(t)); } catch (e) {}
        if (Date.now() - mula > 900) return;              // ucapan sudah dipaparkan — guna mulai kali seterusnya
        if (!t.aktif && tamatFn) { tamatFn(); return; }
        var l = t[JENIS] || [];
        if (l.length && elUcapan) elUcapan.textContent = l[(nPilih || 0) % l.length];
      }).catch(function () {});
    } catch (e) {}
    var nPilih = 0;
    var aktif = c.aktif !== undefined ? c.aktif : lalai.aktif;
    var saat = Math.min(15, Math.max(2, Number(c.saat) || lalai.saat));
    var senarai = (c[JENIS] && c[JENIS].length ? c[JENIS] : lalai[JENIS]) || lalai.vendor;
    if (!aktif) return;
    var hari = new Date().toDateString();
    try {
      if ((c.sekaliSehari !== undefined ? c.sekaliSehari : lalai.sekaliSehari) && localStorage.getItem('intro_hari') === hari) return;
      localStorage.setItem('intro_hari', hari);
    } catch (e) {}

    // pilih ucapan berbeza setiap kali dibuka
    var n = 0;
    try { n = (Number(localStorage.getItem('intro_no')) || 0) + 1; localStorage.setItem('intro_no', String(n)); } catch (e) { n = Math.floor(Math.random() * 99); }
    nPilih = n;
    var ucapan = senarai[n % senarai.length];
    var j = new Date().getHours(), d = new Date().getDay();
    var sapa = j < 12 ? 'Selamat pagi' : j < 15 ? 'Selamat tengah hari' : j < 19 ? 'Selamat petang' : 'Selamat malam';
    var hariKhas = d === 5 ? 'Salam Jumaat yang penuh barakah 🌙' : '';
    var warna = JENIS === 'vendor' ? ['#f0506e', '#b51d3c'] : ['#3d5aa8', '#1f2f5c'];

    var gaya = document.createElement('style');
    gaya.textContent =
      '#intro{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:30px 28px;text-align:center;' +
      'color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:radial-gradient(circle at 30% 20%,' + warna[0] + ',' + warna[1] + ');transition:opacity .5s}' +
      '#intro.hilang{opacity:0;pointer-events:none}' +
      '#intro img{width:120px;height:120px;border-radius:28px;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:intro-logo .9s cubic-bezier(.2,1.4,.4,1) both}' +
      '#intro .sapa{font-size:15px;opacity:0;animation:intro-naik .6s .5s forwards;letter-spacing:.3px}' +
      '#intro .khas{font-size:13px;opacity:0;animation:intro-naik .6s .7s forwards;background:rgba(255,255,255,.18);padding:4px 12px;border-radius:20px}' +
      '#intro .ucapan{font-size:21px;font-weight:700;line-height:1.4;max-width:340px;opacity:0;animation:intro-naik .8s 1s forwards;text-shadow:0 2px 8px rgba(0,0,0,.2)}' +
      '#intro .ucapan:before,#intro .ucapan:after{content:"\u201C";font-size:34px;opacity:.5;line-height:0;vertical-align:-12px;margin-right:4px}' +
      '#intro .ucapan:after{content:"\u201D";margin:0 0 0 4px}' +
      '#intro .kedai{font-size:12px;opacity:.75;letter-spacing:2px;text-transform:uppercase;margin-top:6px;opacity:0;animation:intro-naik .6s 1.4s forwards}' +
      '#intro .bar{position:absolute;left:28px;right:28px;bottom:calc(34px + env(safe-area-inset-bottom,0px));height:4px;border-radius:4px;background:rgba(255,255,255,.25);overflow:hidden}' +
      '#intro .bar i{display:block;height:100%;width:100%;background:#ffd54f;transform-origin:left;animation:intro-bar ' + saat + 's linear forwards}' +
      '#intro button{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;border:0;border-radius:20px;padding:8px 14px;font-size:14px;font-weight:700;' +
      'background:rgba(255,255,255,.2);color:#fff}' +
      '@keyframes intro-logo{from{transform:scale(.3) rotate(-12deg);opacity:0}to{transform:none;opacity:1}}' +
      '@keyframes intro-naik{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}' +
      '@keyframes intro-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}' +
      '@media (prefers-reduced-motion:reduce){#intro *{animation-duration:.01s!important;animation-delay:0s!important}}';
    document.head.appendChild(gaya);

    var el = document.createElement('div');
    el.id = 'intro';
    el.innerHTML = '<button type="button">Langkau ›</button>' +
      '<img src="' + JENIS + '-512.png" alt="">' +
      '<div class="sapa">' + sapa + '! 👋</div>' +
      (hariKhas ? '<div class="khas">' + hariKhas + '</div>' : '') +
      '<div class="ucapan"></div>' +
      '<div class="kedai">Kiosk Akak Sawadee</div>' +
      '<div class="bar"><i></i></div>';
    elUcapan = el.querySelector('.ucapan');
    elUcapan.textContent = ucapan;
    document.body.appendChild(el);

    var siap = false;
    function tamat() {
      if (siap) return; siap = true;
      el.classList.add('hilang');
      setTimeout(function () { el.remove(); gaya.remove(); }, 600);
    }
    tamatFn = tamat;
    el.querySelector('button').onclick = tamat;
    setTimeout(tamat, saat * 1000);
  }

  /* ======================= NOTIFIKASI ======================= */
  var adaFirebase = typeof FIREBASE === 'object' && FIREBASE && FIREBASE.apiKey && FIREBASE.messagingSenderId &&
    typeof VAPID_KEY === 'string' && VAPID_KEY.length > 20;
  var iOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  var dipasang = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var sumber = null;          // tetingkap app Apps Script (untuk balas mesej)
  var messaging = null;

  function balas(data) {
    if (!sumber) return;
    data.sawadee = data.sawadee || 'status';
    try { sumber.postMessage(data, '*'); } catch (e) {}
  }
  function keadaan() {
    if (!adaFirebase) return 'tiada-firebase';
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window))
      return iOS && !dipasang ? 'perlu-pasang' : 'tidak-disokong';
    return Notification.permission;   // 'default' | 'granted' | 'denied'
  }
  function muatSkrip(src) {
    return new Promise(function (ok, gagal) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = gagal; document.head.appendChild(s);
    });
  }
  function sediaFirebase() {
    if (messaging) return Promise.resolve(messaging);
    var v = 'https://www.gstatic.com/firebasejs/10.12.2/';
    return muatSkrip(v + 'firebase-app-compat.js').then(function () { return muatSkrip(v + 'firebase-messaging-compat.js'); })
      .then(function () {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE);
        messaging = firebase.messaging();
        return messaging;
      });
  }
  function ambilToken() {
    return Promise.all([sediaFirebase(), daftarSW]).then(function (x) {
      return navigator.serviceWorker.ready.then(function (reg) {
        return x[0].getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      });
    }).then(function (token) {
      if (!token) throw new Error('Tiada token');
      balas({ sawadee: 'token', token: token, peranti: (iOS ? 'iPhone' : /Android/.test(navigator.userAgent) ? 'Android' : 'Komputer') + '#' + idPeranti() });
      sembunyiBar();
      return token;
    });
  }
  /** ID rawak tetap bagi telefon ini — supaya token lama telefon yang sama dibuang (elak notifikasi berganda) */
  function idPeranti() {
    try {
      var id = localStorage.getItem('id_peranti');
      if (!id) { id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); localStorage.setItem('id_peranti', id); }
      return id;
    } catch (e) { return ''; }
  }
  function hidupkan() {
    var bt = document.getElementById('notif-ya');
    if (bt) { bt.disabled = true; bt.textContent = 'Sebentar…'; }
    Notification.requestPermission().then(function (k) {
      if (k === 'granted') return ambilToken();
      sembunyiBar();
      balas({ keadaan: keadaan() });
    }).catch(function (e) {
      if (bt) { bt.disabled = false; bt.textContent = 'Hidupkan'; }
      balas({ keadaan: 'ralat', ralat: String(e && e.message || e) });
    });
  }

  /* Bar kecil di bawah skrin — butang dalam halaman ini sendiri supaya telefon benarkan permintaan */
  function tunjukBar(teks, butang) {
    var b = document.getElementById('notif-bar');
    if (!b) {
      b = document.createElement('div'); b.id = 'notif-bar';
      b.style.cssText = 'position:fixed;left:10px;right:10px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:5;background:#fff;color:#222;' +
        'border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.25);padding:12px 14px;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:10px;align-items:center';
      document.body.appendChild(b);
    }
    b.innerHTML = '<div style="flex:1">' + teks + '</div>' + (butang ? '<button id="notif-ya" style="border:0;border-radius:12px;padding:10px 14px;font-weight:700;' +
      'background:' + (JENIS === 'vendor' ? '#d6304f' : '#28407a') + ';color:#fff">Hidupkan</button>' : '') +
      '<button id="notif-tidak" style="border:0;background:none;color:#888;font-size:13px">' + (butang ? 'Nanti' : 'Tutup') + '</button>';
    if (butang) document.getElementById('notif-ya').onclick = hidupkan;
    document.getElementById('notif-tidak').onclick = function () {
      try { localStorage.setItem('notif_nanti', String(Date.now())); } catch (e) {}
      sembunyiBar();
    };
  }
  function sembunyiBar() { var b = document.getElementById('notif-bar'); if (b) b.remove(); }
  function baruTangguh() {
    try { return Date.now() - Number(localStorage.getItem('notif_nanti') || 0) < 3 * 864e5; } catch (e) { return false; }
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || !d.sawadee) return;
    if (d.sawadee === 'sedia') {                     // app vendor sudah log masuk
      sumber = e.source;
      var k = keadaan();
      balas({ keadaan: k });
      if (k === 'granted') ambilToken().catch(function (x) { balas({ keadaan: 'ralat', ralat: String(x && x.message || x) }); });
      else if (k === 'default' && !baruTangguh()) tunjukBar('🔔 <b>Hidupkan notifikasi?</b><br><span style="color:#666;font-size:13px">' + (JENIS === 'vendor'
        ? 'Dapat makluman bila baki dikemas kini, reject atau jumlah hantaran tak sama.'
        : 'Dapat makluman bila kiosk ditutup, ada reject, jumlah terima tak sama atau permohonan vendor.') + '</span>', true);
    } else if (d.sawadee === 'minta') {              // vendor tekan butang dalam app
      sumber = e.source;
      var k2 = keadaan();
      if (k2 === 'default') tunjukBar('🔔 Tekan <b>Hidupkan</b>, kemudian pilih <b>Benarkan / Allow</b>.', true);
      else if (k2 === 'granted') ambilToken().catch(function () {});
      else if (k2 === 'perlu-pasang') tunjukBar('📲 Di iPhone, notifikasi hanya berfungsi selepas app <b>ditambah ke Skrin Utama</b> (Safari → Kongsi → Tambah ke Skrin Utama) dan dibuka dari ikon.', false);
      else if (k2 === 'denied') tunjukBar(iOS ? '🔕 Notifikasi disekat. Buka <b>Tetapan iPhone → Pemberitahuan → Sawadee ' + (JENIS === 'vendor' ? 'Vendor' : 'Staf') + '</b> dan hidupkan <b>Benarkan Pemberitahuan</b>.'
        : '🔕 Notifikasi telah disekat untuk app ini. Buka <b>Tetapan telefon → Apl → Sawadee → Pemberitahuan</b> dan hidupkan.', false);
      else if (k2 === 'tidak-disokong') tunjukBar(iOS ? '📵 iPhone ini perlu dikemas kini ke <b>iOS 16.4 ke atas</b> untuk notifikasi (Tetapan → Umum → Kemas Kini Perisian).'
        : '📵 Pelayar ini tidak menyokong notifikasi. Sila buka link dengan <b>Google Chrome</b> dan pasang semula app.', false);
      else balas({ keadaan: k2 });
    } else if (d.sawadee === 'keluar') {              // vendor log keluar: berhenti terima di telefon ini
      if (messaging) messaging.deleteToken().catch(function () {});
    }
  });
})();
