import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { readProgress, writeValue } from '../src/utils/progress.js';

test('progress round-trip, corrupt data and unavailable storage', () => {
 const values = new Map();
 globalThis.localStorage = {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const state = {version:1,cat:'__all__',difficulty:'hard',queue:['A','B'],idx:1,score:{got:1,skipped:0},roundSeconds:60,left:23,playerNames:'A\nB',customWords:'C',customOnly:false,assignments:[{id:'1',name:'A',word:'B',usedWords:['B']}]};
 assert.equal(writeValue('game',state),true);
 assert.deepEqual(readProgress('game'),state);
 values.set('game','{broken'); assert.equal(readProgress('game'),null);
 values.set('game',JSON.stringify({...state,left:-1})); assert.equal(readProgress('game'),null);
 globalThis.localStorage = {getItem(){throw Error('denied')},setItem(){throw Error('full')}};
 assert.equal(readProgress('game'),null); assert.equal(writeValue('game',state),false);
});
for (const scope of ['https://example.test/','https://example.test/NickolasGames/']) {
 test(`built service worker installs and serves offline at ${scope}`,async()=>{
  const listeners={}; const entries=new Map(); let claimed=false;
  const cache={async addAll(urls){for(const url of urls){const relative=url.slice(scope.length); entries.set(url,await readFile(new URL('../../wwwroot/'+relative,import.meta.url)));}},async match(req){return entries.get(typeof req==='string'?req:req.url);}};
  const caches={open:async()=>cache,keys:async()=>['unrelated-cache','nickolasgames-old'],delete:async k=>{assert.equal(k,'nickolasgames-old');}};
  vm.runInNewContext(await readFile(new URL('../../wwwroot/sw.js',import.meta.url),'utf8'),{URL,caches,fetch:()=>{throw Error('offline');},self:{registration:{scope},location:{origin:'https://example.test'},clients:{claim:()=>{claimed=true}},addEventListener:(k,f)=>listeners[k]=f}});
  let work; listeners.install({waitUntil:p=>work=p}); await work;
  listeners.activate({waitUntil:p=>work=p}); await work; assert(claimed);
  listeners.fetch({request:{method:'GET',url:scope,mode:'navigate'},respondWith:p=>work=p});
  assert.match((await work).toString(),/<div id="root">/);
  for(const url of entries.keys()){
   listeners.fetch({request:{method:'GET',url,mode:'cors'},respondWith:p=>work=p});
   assert((await work).length>0);
  }
 });
}
