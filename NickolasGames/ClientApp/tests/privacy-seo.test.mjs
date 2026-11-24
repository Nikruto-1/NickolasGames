import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectGameData, clearGameData } from '../src/utils/privacy.js';
import { readFile } from 'node:fs/promises';
const storage = entries => ({
  values:new Map(entries), get length(){return this.values.size;},
  key(i){return [...this.values.keys()][i]??null;},
  getItem(key){return this.values.get(key)??null;},
  removeItem(key){this.values.delete(key);}
});
test('privacy export includes only this application and handles malformed saved values',()=>{
  const s=storage([['nickolasgames-lang','uk'],['nickolasgames-game','{"name":"<img src=x onerror=alert(1)>"}'],['other-app','private']]);
  assert.deepEqual(inspectGameData(s),{'nickolasgames-lang':'uk','nickolasgames-game':{name:'<img src=x onerror=alert(1)>'}});
  assert.equal(clearGameData(s),2);
  assert.deepEqual([...s.values],[['other-app','private']]);
});
test('localized SEO pages have real canonical/hreflang URLs and security policy',async()=>{
 for(const [lang,path]of Object.entries({en:'',uk:'uk/',sv:'sv/',de:'de/',es:'es/'})){
  const html=await readFile(new URL('../../wwwroot/'+path+'index.html',import.meta.url),'utf8');
  assert(html.includes('<html lang="'+lang+'">'));
  assert(html.includes('href="https://games.nickolasspace.com/'+path+'"'));
  assert(html.includes('Content-Security-Policy'));assert(html.includes('object-src &#39;none&#39;'));
  assert(html.includes('hreflang="uk"'));
  assert(!html.includes('fonts.googleapis.com'));
  assert(!html.includes('"aggregateRating"'));
  const privacy=await readFile(new URL('../../wwwroot/'+path+'privacy/index.html',import.meta.url),'utf8');
  assert(privacy.includes('kkosmacevskij@gmail.com'));
  assert(privacy.includes('localStorage'));
  assert(privacy.includes('GitHub Pages'));
 }
});
function luminance(hex){
 const rgb=hex.match(/\w\w/g).map(value=>parseInt(value,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
 return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
}
test('privacy palette and restored Holmes text/action colors meet normal-text AA contrast',()=>{
 for(const [fg,bg]of [['172436','ffffff'],['46556a','ffffff'],['ffffff','155dcc'],['176840','eaf6ee'],['b43e35','fff0ed'],['292724','eee4d1'],['292724','b78b4f']]){
  const values=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);
  assert((values[0]+0.05)/(values[1]+0.05)>=4.5);
 }
});

test('all 30 game pages are independently indexable, linked and localized',async()=>{
 const root=new URL('../../wwwroot/',import.meta.url);
 const {GAMES,gamePath}=await import('../src/utils/siteRoutes.js');
 const {COPY}=await import('../src/locales/index.js');
 const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');
 assert.equal((sitemap.match(/<loc>/g)||[]).length,40);
 for(const lang of ['en','uk','sv','de','es']){
  const home=await readFile(new URL(gamePath(lang,null).slice(1)+'index.html',root),'utf8');
  for(const game of GAMES){
   const path=gamePath(lang,game),url='https://games.nickolasspace.com'+path;
   const html=await readFile(new URL(path.slice(1)+'index.html',root),'utf8');
   assert.ok(home.includes('href="'+path+'"'));
   assert.ok(html.includes('<link rel="canonical" href="'+url+'"'));
   assert.ok(html.includes('<h1>'+COPY[lang].games[game].n.replaceAll('&','&amp;').replaceAll("'","&#39;")+'</h1>'));
   assert.ok(sitemap.includes('<loc>'+url+'</loc>'));
   for(const other of ['en','uk','sv','de','es'])assert.ok(html.includes('hreflang="'+other+'" href="https://games.nickolasspace.com'+gamePath(other,game)+'"'));
   assert.ok(html.includes('Content-Security-Policy'));
  }
 }
});
