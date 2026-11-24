import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gameGuide} from '../src/locales/gameGuides.js';
import {GAMES,gamePath} from '../src/utils/siteRoutes.js';
const escape=value=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
test('35 home and game pages contain the same useful localized guides before JavaScript',async()=>{
 const unique=new Set();
 for(const lang of ['uk','en','sv','de','es']){
  for(const game of [null,...GAMES]){
   const guide=gameGuide(lang,game);
   assert.ok(guide.paragraphs.length>=2);
   assert.ok(guide.paragraphs.join(' ').split(/\s+/).length>=65);
   assert.ok(!unique.has(guide.paragraphs[0]));unique.add(guide.paragraphs[0]);
   const html=await readFile(new URL('../../wwwroot'+gamePath(lang,game)+'index.html',import.meta.url),'utf8');
   assert.ok(html.includes('<section class="player-guide">'));
   for(const paragraph of guide.paragraphs)assert.ok(html.includes(escape(paragraph)));
  }
 }
 assert.equal(unique.size,35);
});
