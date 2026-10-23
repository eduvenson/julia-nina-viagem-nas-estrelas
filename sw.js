const CACHE = 'viagem-estrelas-v4-3d-rodada3-2';
const FILES = ['./', 'index.html', 'manifest.json', 'aventura.html',
  'aventura/style.css', 'aventura/core.js', 'aventura/world.js', 'aventura/music.js', 'aventura/score.js', 'aventura/motion.js', 'aventura/app.js',
  'aventura/audio/adventure.mp3', 'aventura/audio/battle.mp3', 'aventura/audio/calm.mp3', 'aventura/audio/chase.mp3', 'aventura/audio/birthday.mp3',
  'aventura/icon.svg', 'aventura.webmanifest', 'aventura/fonts/baloo-latin.woff2', 'aventura/vendor/three.module.js', 'aventura/vendor/three.core.js', 'aventura/vendor/RoundedBoxGeometry.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new URL(file, self.registration.scope).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('viagem-estrelas-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin || !event.request.url.startsWith(self.registration.scope)) return;
  if (event.request.headers.has('range') && new URL(event.request.url).pathname.endsWith('.mp3')) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (!cached) return fetch(event.request);
      const bytes = await cached.arrayBuffer(), range = /^bytes=(\d*)-(\d*)$/.exec(event.request.headers.get('range') || '');
      if (!range || !range[1] && !range[2]) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
      const start = range[1] ? Number(range[1]) : Math.max(0, bytes.byteLength - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(bytes.byteLength - 1, Number(range[2])) : bytes.byteLength - 1;
      if (start > end || start >= bytes.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
      return new Response(bytes.slice(start, end + 1), { status: 206, headers: { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`, 'Content-Length': String(end - start + 1) } });
    })());
    return;
  }
  if (event.request.mode === 'navigate' || ['script', 'style'].includes(event.request.destination)) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match(new URL('aventura.html', self.registration.scope).href) : Response.error()))));
  } else event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
