import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLibrary,readLibrary,saveLibrary,libraryCategories} from '../src/utils/customLibrary.js';
const item={id:'1',name:'Friends',game:'whoami',lang:'en',levels:{easy:[' Cat ','cat'],medium:['Moon'],hard:[]}};
test('normalizes duplicate cards and keeps difficulty',()=>{const result=normalizeLibrary([item]);assert.deepEqual(result[0].levels,{easy:['Cat'],medium:['Moon'],hard:[]});});
test('library persists and only adds matching game/language categories',()=>{const map=new Map();const db={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};assert.equal(saveLibrary([item],db),true);const saved=readLibrary(db);assert.deepEqual(Object.keys(libraryCategories(saved,'whoami','en',{Original:{}})),['Original','★ Friends']);assert.deepEqual(libraryCategories(saved,'alias','en'),{});assert.deepEqual(libraryCategories(saved,'whoami','uk'),{});});
test('invalid import, duplicate IDs, empty decks and incomplete Crocodile levels rejected',()=>{for(const invalid of [null,[item,item],[{...item,game:'spy'}],[{...item,game:'crocodile'}],[{...item,levels:{easy:[],medium:[],hard:[]}}]])assert.equal(normalizeLibrary(invalid),null);});
