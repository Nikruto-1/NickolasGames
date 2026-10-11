import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
// Cache each complete build for offline use; online navigation always checks the server.
export function offlinePlugin() {
 const buildId = Date.now().toString(36);
 return { name: 'nickolasgames-offline', apply: 'build',
  config() { return {define:{__APP_BUILD_ID__:JSON.stringify(buildId)}}; },
  generateBundle(_, bundle) {
  const files = [...new Set(['index.html', ...Object.keys(bundle)]), 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'manifest.webmanifest'];
  const version = createHash('sha256').update(readFileSync(new URL('./index.html', import.meta.url))).update(Object.values(bundle).map(f => f.code || f.source || '').join('')).digest('hex').slice(0,16);
  this.emitFile({type:'asset', fileName:'sw.js', source: `
const CACHE = 'nickolasgames-${version}';
const BUILD_ID = ${JSON.stringify(buildId)};
const URLS = ${JSON.stringify(files)}.map(p => new URL(p, self.registration.scope).href);
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
});`});
 }};
}
