// Offline copy of the calculator. prepare-publish.mjs stamps the version in,
// so each release starts a fresh cache and drops the old one.
const VERSION = '0.17.1';
const CACHE = 'fx-calc-' + VERSION;
const CORE = [
  // Relative to this file, so the same worker serves a site root or a sub-path.
  './', 'index.html', 'fx-50FH-II.html', 'fx-3650P-II.html',
  'dist/fx-50FH-II.html', 'dist/fx-3650P-II.html', 'library.html',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('fx-calc-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Pages: network first, so a new release shows up as soon as there is a
// connection; the cached copy only when the network fails or stalls.
// Everything else (icons, manifest): cache first.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const page = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (page) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const net = await Promise.race([
          fetch(req),
          new Promise((_, no) => setTimeout(() => no(new Error('slow')), 4000)),
        ]);
        if (net && net.ok) cache.put(req, net.clone());
        return net;
      } catch {
        return (await cache.match(req, { ignoreSearch: true }))
          || (await cache.match('./', { ignoreSearch: true }))
          || Response.error();
      }
    })());
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
    return res;
  })));
});
