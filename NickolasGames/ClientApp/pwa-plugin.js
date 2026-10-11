import { createHash } from 'node:crypto';
// Generated from build output so every hashed application asset is available offline.
export function offlinePlugin() {
 return { name: 'nickolasgames-offline', apply: 'build', generateBundle(_, bundle) {
  const files = [...new Set(['index.html', ...Object.keys(bundle)]), 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'manifest.webmanifest'];
  const version = createHash('sha256').update(Object.values(bundle).map(f => f.code || f.source || '').join('')).digest('hex').slice(0,16);
  this.emitFile({type:'asset', fileName:'sw.js', source: `
const CACHE = 'nickolasgames-${version}';
const URLS = ${JSON.stringify(files)}.map(p => new URL(p, self.registration.scope).href);
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS))); });
// Wait for all old tabs to close before activating an update; never interrupt a game.
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('nickolasgames-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
 const req = event.request;
 const url = new URL(req.url);
 if(req.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
 if(req.mode === 'navigate') {
  event.respondWith(caches.open(CACHE).then(async c => (await c.match(new URL('index.html', self.registration.scope).href)) || fetch(req)));
 } else if(URLS.includes(url.href)) {
  event.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req)));
 }
});`});
 }};
}
