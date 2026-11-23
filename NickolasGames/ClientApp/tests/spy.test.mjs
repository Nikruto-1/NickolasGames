import test from 'node:test';
import assert from 'node:assert/strict';
import { SPY_LOCATIONS, locationsFor, categoryOf, locationPool, drawLocation } from '../src/features/spy/locations.js';
import { spyWinsVote, spyScores } from '../src/features/spy/rules.js';
const players=['a','b','c'].map(id=>({id}));
test('all five languages have unique nonempty locations',()=>{
 assert.ok(SPY_LOCATIONS.length>=200&&SPY_LOCATIONS.length<=300);
 for(const lang of ['uk','en','sv','de','es']){
 const list=locationsFor(lang);assert.equal(list.length,SPY_LOCATIONS.length);
 assert.ok(list.every(x=>typeof x==='string'&&x.trim()));
 assert.equal(new Set(list).size,list.length);
 }
});
test('correct accusation defeats spy',()=>assert.equal(spyWinsVote(players,['b','a','b'],1),false));
test('wrong accusation or tie benefits spy',()=>{
 assert.equal(spyWinsVote(players,['c','c','a'],1),true);
 assert.equal(spyWinsVote(players,['b','c','a'],1),true);
});
test('scores accumulate for winning side only',()=>{
 assert.deepEqual(spyScores(players,{a:2,b:1,c:0},1,false),{a:3,b:1,c:1});
 assert.deepEqual(spyScores(players,{a:2,b:1,c:0},1,true),{a:2,b:2,c:0});
});

test('categories partition all locations without gaps',()=>{
 const all=[1,2,3,4,5,6].flatMap(locationPool);
 assert.equal(all.length,SPY_LOCATIONS.length);
 assert.equal(new Set(all).size,all.length);
 for(const i of all)assert.ok(locationPool(categoryOf(i)).includes(i));
});
test('random draws never repeat until the pool is exhausted, even after reload',()=>{
 const pool=locationPool(0);
 let history=[];
 for(let i=0;i<pool.length;i++){
 const draw=drawLocation(pool,JSON.parse(JSON.stringify(history)),()=>0.42);
 assert.ok(!history.includes(draw.index));history=draw.history;
 }
 const last=history.at(-1);
 assert.notEqual(drawLocation(pool,history,()=>0).index,last);
});
test('category draw preserves history from other categories',()=>{
 const pool=locationPool(2),outside=locationPool(1)[0];
 const draw=drawLocation(pool,[outside,...pool],()=>0);
 assert.ok(draw.history.includes(outside));
 assert.ok(pool.includes(draw.index));
 assert.notEqual(draw.index,pool.at(-1));
});
