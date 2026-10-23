const CACHE = 'viagem-estrelas-v4-3d-rodada2-2';
const FILES = ['./', 'index.html', 'manifest.json', 'aventura.html',
  'aventura/style.css', 'aventura/core.js', 'aventura/world.js', 'aventura/music.js', 'aventura/motion.js', 'aventura/app.js',
  'aventura/icon.svg', 'aventura.webmanifest', 'aventura/fonts/baloo-latin.woff2', 'aventura/vendor/three.module.js', 'aventura/vendor/three.core.js', 'aventura/vendor/RoundedBoxGeometry.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new URL(file, self.registration.scope).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('viagem-estrelas-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin || !event.request.url.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate' || ['script', 'style'].includes(event.request.destination)) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match(new URL('aventura.html', self.registration.scope).href) : Response.error()))));
  } else event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
