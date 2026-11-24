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

import { validateSpySession } from '../src/features/spy/session.js';
const snapshot={players:[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],round:{spy:1,location:9},step:3,duration:5,phase:'discussion',votes:[],scores:{a:2,b:0,c:1},finished:false,deadline:12345};
test('restore older active game, migrate round number and location history',()=>{
 const s=validateSpySession(snapshot);
 assert.equal(s.roundNumber,1);assert.equal(s.deadline,12345);assert.deepEqual(s.locationHistory,[0]);
});
test('reject malformed rounds, invalid votes and duplicate players',()=>{
 assert.deepEqual(validateSpySession({...snapshot,round:{spy:3,location:9}}),{});
 assert.deepEqual(validateSpySession({...snapshot,votes:['a']}),{});
 assert.deepEqual(validateSpySession({...snapshot,players:[snapshot.players[0],snapshot.players[0],snapshot.players[2]]}),{});
});
test('restore completed game without restarting timer',()=>{
 const s=validateSpySession({...snapshot,finished:true,winner:true,roundLimit:1,roundNumber:1});
 assert.equal(s.deadline,null);assert.equal(s.roundNumber,1);assert.equal(s.winner,true);
});

import { guessOptions, matchesLocationGuess } from '../src/features/spy/locations.js';
test('four guesses contain the answer exactly once, with three distinct distractors from the selected pool',()=>{
 for(const category of [0,1,2,3,4,5,6]){
 const pool=locationPool(category);
 for(const correct of pool){
 const options=guessOptions(correct,pool,()=>0.38);
 assert.equal(options.length,4);
 assert.equal(new Set(options).size,4);
 assert.ok(options.includes(correct));
 assert.ok(options.every(i=>pool.includes(i)));
 }
 }
});
test('the correct option does not occupy a fixed position',()=>{
 const pool=locationPool(0);
 assert.notEqual(guessOptions(pool[0],pool,()=>0).indexOf(pool[0]),guessOptions(pool[0],pool,()=>0.999).indexOf(pool[0]));
});
test('typed guesses tolerate casing, whitespace and punctuation but reject wrong or empty answers',()=>{
 for(const lang of ['uk','en','sv','de','es']){
 const name=locationsFor(lang)[0];
 assert.equal(matchesLocationGuess('  '+name.toUpperCase()+' ! ',0,lang),true);
 assert.equal(matchesLocationGuess(locationsFor(lang)[1],0,lang),false);
 assert.equal(matchesLocationGuess('',0,lang),false);
 }
});

test('legacy sessions default to verbal guessing and retain explicit alternatives',()=>{
 assert.equal(validateSpySession(snapshot).guessMethod,'manual');
 for(const guessMethod of ['choices','typed','manual'])assert.equal(validateSpySession({...snapshot,guessMethod}).guessMethod,guessMethod);
});
test('restore invalid category safely and clear deadline outside timed discussion',()=>{
 assert.equal(validateSpySession({...snapshot,category:99}).category,0);
 assert.equal(validateSpySession({...snapshot,category:2}).category,0);
 assert.equal(validateSpySession({...snapshot,phase:'guess'}).deadline,null);
 assert.equal(validateSpySession({...snapshot,duration:0}).deadline,null);
});

import {drawRotatingSpy} from '../src/features/spy/rules.js';
test('rotation gives every player a turn before repeating, including across reloads',()=>{
 let history=[],last;
 for(let cycle=0;cycle<10;cycle++){
  const seen=new Set();
  for(let i=0;i<players.length;i++){
   const next=drawRotatingSpy(players,JSON.parse(JSON.stringify(history)),()=>0);
   assert.ok(!seen.has(next.spy));if(i===0&&last!==undefined)assert.notEqual(next.spy,last);
   seen.add(next.spy);history=next.history;last=next.spy;
  }
 }
});
test('rotation restores valid player history and old modes stay compatible',()=>{
 const restored=validateSpySession({...snapshot,mode:'rotation',spyHistory:['a','a','unknown','b']});
 assert.equal(restored.mode,'rotation');assert.deepEqual(restored.spyHistory,['a','b']);
 assert.equal(validateSpySession(snapshot).mode,'classic');
});
