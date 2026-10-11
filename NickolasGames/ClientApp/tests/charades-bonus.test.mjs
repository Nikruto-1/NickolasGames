import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charadesReducer as reduce, newCharadesState, restoreCharadesState, validCharadesState, hasCharadesCard } from '../src/utils/charades.js';

const categories = { Test: Object.fromEntries(['easy','medium','hard'].map(level => [level, Array.from({length:9},(_,i)=>level+'-'+i)])) };
function start(target = 100, timed = true) {
  let s = newCharadesState(categories);
  for (const id of ['a','b','c']) s = reduce(s,{type:'add',player:{id,name:id}});
  s = reduce(s,{type:'target',value:target});
  s = reduce(s,{type:'timing',timed});
  return reduce(s,{type:'start'});
}
function act(s, level = 'hard') {
  return reduce(reduce(s,{type:'reveal'}),{type:'select',level,now:1_000});
}
function answer(s, elapsed, id) {
  return reduce(reduce(s,{type:'guess',now:1_000+elapsed}),{type:'award',id});
}
for (const [elapsed,bonus,total] of [[0,2,5],[15_000,2,5],[20_000,2,5],[20_001,1,4],[40_000,1,4],[40_001,0,3],[59_999,0,3],[60_000,0,0],[90_000,0,0]]) {
  test('hard word at '+elapsed+'ms: actor '+total+', guesser 3',()=>{
    const s = answer(act(start()),elapsed,'b');
    assert.deepEqual(s.players.map(p=>p.points),[total,3,0]);
    assert.equal(s.lastResult.bonus,bonus);
    assert.equal(s.lastResult.presenterPoints,total);
    assert(validCharadesState(JSON.parse(JSON.stringify(s))));
  });
}
test('each difficulty adds speed points only to the actor',()=>{
  for (const [level,base] of [['easy',1],['medium',2],['hard',3]]) {
    const s=answer(act(start(),level),15_000,'b');
    assert.deepEqual(s.players.map(p=>p.points),[base+2,base,0]);
  }
});
test('confirmation delay and save/restore cannot change the speed bonus or credit twice',()=>{
  let s=reduce(act(start()),{type:'guess',now:16_000});
  s=restoreCharadesState(JSON.parse(JSON.stringify(s)));
  const result=reduce(s,{type:'award',id:'b',now:999_999});
  assert.equal(result.lastResult.bonus,2);
  assert.equal(result.players[0].points,5);
  assert.equal(reduce(result,{type:'award',id:'b'}),result);
  assert.equal(validCharadesState({...result,lastResult:{...result.lastResult,bonus:3}}),false);
});
test('untimed answers never earn a speed bonus',()=>{
  for (const elapsed of [15_000,90_000]) {
    const s=answer(act(start(100,false)),elapsed,'b');
    assert.deepEqual(s.players.map(p=>p.points),[3,3,0]);
    assert.equal(s.lastResult.bonus,0);
  }
});
test('everyone finishes the round; the highest score wins even if someone reached the target earlier',()=>{
  let s=answer(act(start(3),'easy'),15_000,'b');
  assert.deepEqual(s.players.map(p=>p.points),[3,1,0]);
  assert.equal(s.phase,'handoff'); assert.deepEqual(s.winners,[]);
  s=answer(act(s),15_000,'c');
  assert.deepEqual(s.players.map(p=>p.points),[3,6,3]);
  assert.equal(s.phase,'handoff');
  s=reduce(act(s),{type:'skip'});
  assert.equal(s.phase,'finished'); assert.deepEqual(s.winners,['b']);
  assert.deepEqual(s.players.map(p=>p.presented),[1,1,1]);
});
test('do not start a partial final round when cards run out',()=>{
  let s=start();
  s={...s,deck:Object.fromEntries(['easy','medium','hard'].map(level=>[level,s.deck[level].slice(0,4)]))};
  for(let i=0;i<3;i++) s=reduce(act(s),{type:'skip'});
  assert.equal(s.phase,'exhausted'); assert.equal(s.cardIndex,3);
  assert(hasCharadesCard(s));
  assert.deepEqual(s.players.map(p=>p.presented),[1,1,1]);
  assert(validCharadesState(s));
});
test('legacy saves retain points and align the current round for the new turn rule',()=>{
  const old={...start(),activeId:'b'};
  delete old.scoringVersion;
  old.players=old.players.map((p,i)=>({...p,points:10+i,presented:i===0?7:5}));
  assert(validCharadesState(old));
  const restored=restoreCharadesState(old);
  assert.equal(restored.scoringVersion,2);
  assert.deepEqual(restored.players.map(p=>p.points),[10,11,12]);
  assert.deepEqual(restored.players.map(p=>p.presented),[6,5,5]);
  assert(validCharadesState(restored));
});
