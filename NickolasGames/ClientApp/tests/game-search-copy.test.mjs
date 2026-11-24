import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GAME_SEARCH_COPY} from '../src/locales/gameSearchCopy.js';
import {GAMES,gamePath} from '../src/utils/siteRoutes.js';
import {getPageMetadata} from '../src/utils/siteMetadata.js';
import {COPY} from '../src/locales/index.js';
import {PRIVACY_COPY} from '../src/locales/privacy.js';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
test('all game pages have distinct localized titles, useful descriptions and social images',async()=>{
 const titles=new Set(),descriptions=new Set();
 for(const lang of ['uk','en','sv','de','es']){
  assert.deepEqual(Object.keys(GAME_SEARCH_COPY[lang]).sort(),[...GAMES].sort());
  for(const game of GAMES){
   const {title,description}=getPageMetadata(lang,COPY[lang].games,PRIVACY_COPY[lang].title,PRIVACY_COPY[lang].intro,game);
   assert.ok(title.length<=80,title);
   assert.ok(description.length>=90&&description.length<=160,description);
   assert.ok(!titles.has(title),title);titles.add(title);
   assert.ok(!descriptions.has(description),description);descriptions.add(description);
   const html=await readFile(new URL('../../wwwroot'+gamePath(lang,game)+'index.html',import.meta.url),'utf8');
   assert.ok(html.includes('<title>'+escape(title)+'</title>'));
   assert.ok(html.includes('<meta name="description" content="'+escape(description)+'"'));
   assert.ok(html.includes('<meta name="twitter:image" content="https://games.nickolasspace.com/icons/holmes-512.png"'));
  }
 }
 assert.equal(titles.size,30);
});
