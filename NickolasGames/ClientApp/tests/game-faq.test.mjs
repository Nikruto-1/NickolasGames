import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gameFaq} from '../src/locales/gameFaq.js';
import {GAMES,gamePath} from '../src/utils/siteRoutes.js';
import {COPY} from '../src/locales/index.js';
const escape=value=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
test('all thirty localized game pages have unique FAQ and contextual links in static HTML',async()=>{
 for(const lang of ['en','uk','sv','de','es']){
  const questions=new Set();
  for(const game of GAMES){
   const faq=gameFaq(lang,game);
   assert.equal(faq.items.length,5);
   assert.ok(faq.related.length>=2);
   const html=await readFile(new URL('../../wwwroot'+gamePath(lang,game)+'index.html',import.meta.url),'utf8');
   assert.ok(html.includes('class="game-faq"'));
   assert.ok(html.includes(escape(faq.heading)));
   for(const [q,a] of faq.items){assert.ok(q&&a&&!questions.has(q));questions.add(q);assert.ok(html.includes('<summary>'+escape(q)+'</summary><p>'+escape(a)+'</p>'));}
   const keys=faq.related.map(x=>x.key);
   assert.equal(new Set(keys).size,keys.length);
   for(const {key,reason} of faq.related){assert.ok(GAMES.includes(key)&&key!==game&&reason);assert.ok(html.includes('<a href="'+gamePath(lang,key)+'">'+escape(COPY[lang].games[key].n)+'</a><p>'+escape(reason)+'</p>'));}
  }
  assert.equal(questions.size,30);
 }
 assert.equal(gameFaq('en',null).items.length,0);
});
