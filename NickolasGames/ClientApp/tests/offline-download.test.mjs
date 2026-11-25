import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {finalizeOfflineBuild} from '../scripts/finalize-offline.mjs';
import {requestOffline} from '../src/utils/offlineDownload.js';
test('download manifest lists real built files and shares service worker cache',async()=>{
 const root=new URL('../../wwwroot/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('offline-assets.json',root),'utf8'));
 const sw=await readFile(new URL('sw.js',root),'utf8');
 assert.ok(sw.includes("const CACHE='"+manifest.cache+"'"));
 for(const file of manifest.files)assert.ok((await readFile(new URL(file,root))).length>0,file);
 assert.ok(manifest.files.some(x=>x.includes('CheckersGame-')&&x.endsWith('.js')));
 const assets=(await readdir(new URL('assets/',root))).map(name=>'assets/'+name).sort();
 assert.deepEqual(manifest.files.filter(x=>x.startsWith('assets/')).sort(),assets);
});
test('client download reports missing files, retries only missing assets and verifies saved cache',async()=>{
 const baseUrl='https://example.test/',cacheName='nickolasgames-0123456789abcdef';
 const manifest={cache:cacheName,buildId:'current',files:['index.html','assets/game.js']};
 const saved=new Map();let fail=true,requests=[];
 const cache={match:async url=>saved.get(url),put:async(url,response)=>saved.set(url,response)};
 const options={baseUrl,buildId:'current',storage:{open:async name=>{assert.equal(name,cacheName);return cache;}},fetcher:async url=>{
  const path=String(url).slice(baseUrl.length);
  if(path==='offline-assets.json')return {ok:true,json:async()=>manifest};
  requests.push(path);
  return path==='assets/game.js'&&fail?{ok:false,status:404}:{ok:true};
 }};
 assert.equal((await requestOffline('OFFLINE_STATUS',options)).ready,false);
 const first=await requestOffline('OFFLINE_DOWNLOAD',options);
 assert.equal(first.ready,false);assert.equal(first.file,'assets/game.js');assert.equal(first.reason,'HTTP 404');
 fail=false;requests=[];
 assert.equal((await requestOffline('OFFLINE_DOWNLOAD',options)).ready,true);
 assert.deepEqual(requests,['assets/game.js']);
 assert.equal((await requestOffline('OFFLINE_STATUS',options)).ready,true);
 assert.equal((await requestOffline('OFFLINE_DOWNLOAD',{...options,buildId:'old'})).reason,'version-changed');
});

test('finalizer discards provisional chunk names and preserves final entry dependencies',async()=>{
 const root=await mkdtemp(join(tmpdir(),'nickolas-offline-'));
 try{
  for(const dir of ['assets','icons','.vite'])await mkdir(join(root,dir));
  const content={
   'index.html':'<html>final</html>',
   'manifest.webmanifest':'{}',
   'icons/holmes-192.png':'icon','icons/holmes-512.png':'icon','icons/holmes-apple-touch.png':'icon',
   'assets/index-final.js':'entry','assets/runtime-final.js':'runtime','assets/WhoAmIGame-final.js':'lazy','assets/main-final.css':'css',
   '.vite/manifest.json':JSON.stringify({'index.html':{isEntry:true,file:'assets/index-final.js',imports:['runtime']},runtime:{file:'assets/runtime-final.js'}}),
   'offline-assets.json':JSON.stringify({cache:'old',buildId:'test',files:['assets/WhoAmIGame-stale.js']}),
   'sw.js':"const CACHE='old';\nconst CORE_URLS=[].map(path=>path);\nconst OFFLINE_URLS=['assets/WhoAmIGame-stale.js'].map(path=>path);"
  };
  for(const [path,value] of Object.entries(content))await writeFile(join(root,path),value);
  const result=finalizeOfflineBuild(root);
  assert.ok(result.core.includes('assets/runtime-final.js'));
  assert.ok(!result.core.includes('assets/WhoAmIGame-final.js'));
  assert.ok(result.files.includes('assets/WhoAmIGame-final.js'));
  assert.ok(!result.files.some(x=>x.includes('stale')));
  assert.ok(!(await readFile(join(root,'sw.js'),'utf8')).includes('stale'));
 }finally{await rm(root,{recursive:true,force:true});}
});

test('offline status uses only the cached manifest for the running build',async()=>{
 const baseUrl='https://example.test/', current='nickolasgames-0123456789abcdef', old='nickolasgames-1111111111111111';
 const manifestUrl=baseUrl+'offline-assets.json';
 const saved=new Map([[manifestUrl,{json:async()=>({cache:current,buildId:'current',files:['offline-assets.json','assets/game.js']})}],[baseUrl+'assets/game.js',{}]]);
 const older=new Map([[manifestUrl,{json:async()=>({cache:old,buildId:'old',files:['offline-assets.json']})}]]);
 const options={baseUrl,buildId:'current',fetcher:async()=>{throw Error('offline');},storage:{keys:async()=>[current,old],open:async name=>({match:async url=>(name===current?saved:older).get(url)})}};
 assert.equal((await requestOffline('OFFLINE_STATUS',options)).ready,true);
 saved.delete(baseUrl+'assets/game.js');
 assert.equal((await requestOffline('OFFLINE_STATUS',options)).ready,false);
 assert.equal((await requestOffline('OFFLINE_STATUS',{...options,buildId:'unknown'})).ready,false);
 assert.equal((await requestOffline('OFFLINE_DOWNLOAD',options)).ready,false);
});
