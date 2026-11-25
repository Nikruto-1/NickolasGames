import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,stat} from 'node:fs/promises';

test('production hero is optimized when required; original remains a safe local fallback',async()=>{
 const assets=new URL('../../wwwroot/assets/',import.meta.url);
 const names=await readdir(assets);
 const hero=names.find(name=>/^holmes-lying-hero(?:\.generated)?-[\w-]+\.(webp|png)$/.test(name));
 assert.ok(hero,'Hero asset must be emitted');
 const original=await stat(new URL('../src/assets/holmes-lying-hero.png',import.meta.url));
 const emitted=await stat(new URL(hero,assets));
 if(process.env.NICKOLAS_REQUIRE_MEDIA_OPTIMIZATION==='1')assert.ok(hero.endsWith('.webp'),'CI must use optimized WebP');
 if(hero.endsWith('.webp'))assert.ok(emitted.size<original.size,'Optimized image must be smaller');
});

test('navigation logo stays within its production media budget',async()=>{
 const assets=new URL('../../wwwroot/assets/',import.meta.url);
 const names=await readdir(assets);
 const generated=names.find(name=>/^holmes-logo\.generated-[\w-]+\.webp$/.test(name));
 const original=await stat(new URL('../src/assets/holmes-logo.webp',import.meta.url));
 if(process.env.NICKOLAS_REQUIRE_MEDIA_OPTIMIZATION==='1')assert.ok(generated,'CI must emit optimized logo');
 if(generated)assert.ok((await stat(new URL(generated,assets))).size<original.size,'Logo must be smaller');
});
