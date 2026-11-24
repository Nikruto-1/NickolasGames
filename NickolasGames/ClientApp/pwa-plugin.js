import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Shell-first PWA: install a small core, then cache game chunks and images on use.
export function offlinePlugin() {
  const buildId=Date.now().toString(36);
  return {name:'nickolasgames-offline',apply:'build',
    config(){return {define:{__APP_BUILD_ID__:JSON.stringify(buildId)}};},
    generateBundle(_,bundle) {
      const startupChunks=new Set();
      function includeChunk(name) {
        const chunk=bundle[name];
        if(startupChunks.has(name)||chunk?.type!=='chunk')return;
        startupChunks.add(name);
        chunk.imports.forEach(includeChunk);
      }
      for(const [name,item] of Object.entries(bundle))if(item.type==='chunk'&&item.isEntry)includeChunk(name);
      const files=[...new Set([
        'index.html',
        ...Object.entries(bundle).filter(([filename,item])=>
          filename.endsWith('.css') || startupChunks.has(filename)
        ).map(([filename])=>filename),
        'icons/holmes-192.png',
        'icons/holmes-512.png',
        'icons/holmes-apple-touch.png',
        'manifest.webmanifest'
      ])];
      const offlineFiles=[...new Set([...files,...Object.keys(bundle).filter(name=>name.startsWith('assets/'))])];
      const version=createHash('sha256')
        .update(readFileSync(new URL('./index.html',import.meta.url)))
        .update(Object.values(bundle).map(file=>file.code || file.source || '').join(''))
        .digest('hex').slice(0,16);
      this.emitFile({type:'asset',fileName:'sw.js',source:`
const CACHE='nickolasgames-${version}';
const BUILD_ID=${JSON.stringify(buildId)};
const CORE_URLS=${JSON.stringify(files)}.map(path=>new URL(path,self.registration.scope).href);
const OFFLINE_URLS=${JSON.stringify(offlineFiles)}.map(path=>new URL(path,self.registration.scope).href);
const isAsset=url=>url.pathname.startsWith(new URL('assets/',self.registration.scope).pathname)
  && /\\.(?:js|css|png|jpe?g|webp|svg|woff2?|mp3|ogg)$/i.test(url.pathname);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE)
    .then(cache=>cache.addAll(CORE_URLS.map(url=>new Request(url,{cache:'reload'}))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=(await caches.keys()).filter(key=>key.startsWith('nickolasgames-'));
    // Keep the previous shell so older open tabs can finish fetching their chunks.
    const keep=new Set([...keys.slice(-2),CACHE]);
    await Promise.all(keys.filter(key=>!keep.has(key)).map(key=>caches.delete(key)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window'});
    clients.forEach(client=>client.postMessage({type:'APP_VERSION',version:BUILD_ID}));
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='GET_VERSION')event.source?.postMessage({type:'APP_VERSION',version:BUILD_ID});
  if(!['OFFLINE_STATUS','OFFLINE_DOWNLOAD'].includes(event.data?.type)||!event.ports?.[0])return;
  const port=event.ports[0];
  event.waitUntil((async()=>{
    try{
      const cache=await caches.open(CACHE);
      const missing=[];
      for(const url of OFFLINE_URLS)if(!await cache.match(url))missing.push(url);
      if(event.data.type==='OFFLINE_DOWNLOAD'&&missing.length){
        // Small batches bound memory usage; retry only missing files.
        for(let i=0;i<missing.length;i+=8)await cache.addAll(missing.slice(i,i+8).map(url=>new Request(url,{cache:'reload'})));
      }
      port.postMessage({ready:event.data.type==='OFFLINE_DOWNLOAD'||missing.length===0,total:OFFLINE_URLS.length});
    }catch{port.postMessage({ready:false,error:true});}
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET' || url.origin!==self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response.ok)return response;
      }catch{}
      const cached=await (await caches.open(CACHE)).match(new URL('index.html',self.registration.scope).href);
      if(cached)return cached;
      return fetch(request,{cache:'no-store'});
    })());
  }else if(CORE_URLS.includes(url.href)||isAsset(url)){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(request);
      if(cached)return cached;
      if(isAsset(url) && typeof caches.keys==='function'){
        for(const key of (await caches.keys()).reverse()){
          if(key===CACHE||!key.startsWith('nickolasgames-'))continue;
          const previous=await (await caches.open(key)).match(request);
          if(previous)return previous;
        }
      }
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response.clone()).catch(()=>{});
      return response;
    })());
  }
});`});
    }
  };
}
