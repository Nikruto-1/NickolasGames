import test from 'node:test';
import assert from 'node:assert/strict';
import { SPY_LOCATIONS, locationsFor } from '../src/features/spy/locations.js';
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
