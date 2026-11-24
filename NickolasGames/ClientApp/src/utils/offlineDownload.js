// Use the same cache as the active service worker, without a message-channel round trip.
export async function requestOffline(type,{
 storage=globalThis.caches,fetcher=globalThis.fetch,baseUrl=globalThis.document?.baseURI,
 buildId=typeof __APP_BUILD_ID__==='undefined'?null:__APP_BUILD_ID__
}={}){
 if(!storage||!fetcher||!baseUrl)return {ready:false,error:true,reason:'storage-unavailable'};
 let currentFile='offline-assets.json';
 try{
  const manifestUrl=new URL(currentFile,baseUrl);
  const response=await fetcher(manifestUrl,{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const manifest=await response.json();
  if(!/^nickolasgames-[a-f0-9]{16}$/.test(manifest.cache)||!Array.isArray(manifest.files)||!manifest.files.length||
    !manifest.files.every(path=>typeof path==='string'&&/^(?:assets\/[^/]+|icons\/[^/]+|index\.html|manifest\.webmanifest|offline-assets\.json)$/.test(path)))throw Error('invalid-manifest');
  if(buildId&&manifest.buildId!==buildId)throw Error('version-changed');
  const cache=await storage.open(manifest.cache);
  const missing=[];
  for(const path of manifest.files){
   currentFile=path;
   const url=new URL(path,baseUrl).href;
   if(!await cache.match(url))missing.push({path,url});
  }
  if(type==='OFFLINE_DOWNLOAD'){
   // Individual writes keep successfully downloaded assets even if one request fails.
   for(const {path,url} of missing){
    currentFile=path;
    const asset=await fetcher(url,{cache:'reload'});
    if(!asset.ok)throw Error('HTTP '+asset.status);
    await cache.put(url,asset);
   }
   for(const path of manifest.files){
    currentFile=path;
    if(!await cache.match(new URL(path,baseUrl).href))throw Error('cache-write-missing');
   }
  }
  return {ready:type==='OFFLINE_DOWNLOAD'||missing.length===0,total:manifest.files.length};
 }catch(error){return {ready:false,error:true,reason:String(error?.message||error),file:currentFile};}
}
