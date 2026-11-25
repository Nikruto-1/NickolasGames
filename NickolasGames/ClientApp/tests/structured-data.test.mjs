import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getPageMetadata,getStructuredData} from '../src/utils/siteMetadata.js';
import {GAMES,LANGUAGE_PATHS,contentPath} from '../src/utils/siteRoutes.js';
import {COPY} from '../src/locales/index.js';
import {PRIVACY_COPY} from '../src/locales/privacy.js';
test('all 40 static pages use shared route-specific structured data',async()=>{
 for(const lang of Object.keys(LANGUAGE_PATHS)){
  const games=COPY[lang].games,policy=PRIVACY_COPY[lang];
  for(const page of [null,...GAMES,'privacy']){
   const privacy=page==='privacy',game=privacy?null:page;
   const meta=getPageMetadata(lang,games,policy.title,policy.intro,game,privacy);
   const expected=getStructuredData(lang,games,meta,game,privacy);
   const html=await readFile(new URL('../../wwwroot'+contentPath(lang,game,privacy)+'index.html',import.meta.url),'utf8');
   const matches=[...html.matchAll(/<script type="application\/ld\+json" data-site-schema>([\s\S]*?)<\/script>/g)];
   assert.equal(matches.length,1);
   assert.deepEqual(JSON.parse(matches[0][1]),expected);
  }
 }
});
