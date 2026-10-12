
const CACHE = 'nickolasgames-b8357828aa0eb016';
const BUILD_ID = "mv51bjqg";
const URLS = ["index.html","assets/index-D1YYDryM.js","assets/holmes2d-D3AQjJE_.js","assets/holmes-favicon-B9sUNuDe.png","assets/holmes-logo-CWbdQEEP.webp","assets/holmes-lying-hd-DRZtvmqM.png","assets/holmes-meow-DSDk068_.mp3","assets/holmes-pet-CrRfbT2E.png","assets/holmes-throw-hd-B7Vac-Jf.png","assets/holmes-time-up-uk-B-Td4S7t.mp3","assets/index-v46fpz-R.css","icons/holmes-192.png","icons/holmes-512.png","icons/holmes-apple-touch.png","manifest.webmanifest"].map(p => new URL(p, self.registration.scope).href);
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS.map(url => new Request(url, {cache:"reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('nickolasgames-') && k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())
  .then(() => self.clients.matchAll({type:'window'}))
  .then(clients => clients.forEach(client => client.postMessage({type:'APP_VERSION',version:BUILD_ID}))));
});
self.addEventListener('message', event => {
 if(event.data?.type === 'GET_VERSION') event.source?.postMessage({type:'APP_VERSION',version:BUILD_ID});
});
self.addEventListener('fetch', event => {
 const req = event.request;
 const url = new URL(req.url);
 if(req.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
 if(req.mode === 'navigate') {
  event.respondWith((async () => {
   try {
    const response = await fetch(req, {cache:'no-store'});
    if(response.ok) return response;
   } catch {}
   const cached = await (await caches.open(CACHE)).match(new URL('index.html', self.registration.scope).href);
   if(cached) return cached;
   return fetch(req, {cache:'no-store'});
  })());
 } else if(URLS.includes(url.href)) {
  event.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req)));
 }
});