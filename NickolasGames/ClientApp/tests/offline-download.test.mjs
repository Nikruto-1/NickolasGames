import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {requestOffline} from '../src/utils/offlineDownload.js';
test('download manifest lists real built files and shares service worker cache',async()=>{
 const root=new URL('../../wwwroot/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('offline-assets.json',root),'utf8'));
 const sw=await readFile(new URL('sw.js',root),'utf8');
 assert.ok(sw.includes("const CACHE='"+manifest.cache+"'"));
 for(const file of manifest.files)assert.ok((await readFile(new URL(file,root))).length>0,file);
 assert.ok(manifest.files.some(x=>x.includes('CheckersGame-')&&x.endsWith('.js')));
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
