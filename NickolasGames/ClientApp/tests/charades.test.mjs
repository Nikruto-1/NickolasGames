import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charadesReducer as reduce, newCharadesState, validCharadesState, currentCharadesCard, createCharadesDeck, deckReady } from '../src/utils/charades.js';

const categories = { Test: { easy: ['easy-1','easy-2'], medium: ['medium-1','medium-2'], hard: ['hard-1','hard-2'] } };
function setup(targetScore = 30) {
  let s = newCharadesState(categories);
  for (const [id,name] of [['a','Mykola'],['b','Anastasiia'],['c','Sofia']]) s = reduce(s,{type:'add',player:{id,name}});
  return reduce(s,{type:'target',value:targetScore});
}
function acting(level = 'hard', state = setup()) {
  let s = state.phase === 'setup' ? reduce(state,{type:'start'}) : state;
  s = reduce(s,{type:'reveal'});
  return reduce(s,{type:'select',level,now:1_000});
}
function award(s,now = 60_999,id = 'b') {
  return reduce(reduce(s,{type:'guess',now}),{type:'award',id});
}

test('a card contains one word per tier; selecting a word starts exactly one minute',()=>{
  const s = acting('medium');
  const card = currentCharadesCard(s);
  assert(card.easy.startsWith('easy-'));assert(card.medium.startsWith('medium-'));assert(card.hard.startsWith('hard-'));
  assert.equal(s.selected,'medium');assert.equal(s.deadline,61_000);
  assert.equal(reduce(s,{type:'select',level:'hard',now:2_000}),s);
  assert(validCharadesState(s));
});
for(const [level,points] of [['easy',1],['medium',2],['hard',3]]){
  test(`timely ${level}: actor gets 2 and a different guesser gets ${points}`,()=>{
    const s = award(acting(level));
    assert.deepEqual(s.players.map(p=>p.points),[2,points,0]);
    assert.equal(s.activeId,'b');assert.equal(s.phase,'handoff');assert.equal(s.cardIndex,1);
    assert(validCharadesState(s));
    assert.equal(reduce(s,{type:'award',id:'c'}),s); // cannot credit the same card twice
  });
}
for(const now of [61_000,90_000]){
  test(`at/after the minute (${now}): actor gets zero but guesser still gets word points`,()=>{
    const s=award(acting('hard'),now,'c');
    assert.deepEqual(s.players.map(p=>p.points),[0,0,3]);assert.equal(s.activeId,'b');
  });
}
test('confirmation delay does not change the moment the word was guessed; actor cannot guess own word',()=>{
  const s=reduce(acting('easy'),{type:'guess',now:60_999});
  assert.equal(reduce(s,{type:'award',id:'a'}),s);
  const next=reduce(s,{type:'award',id:'b',now:100_000});
  assert.deepEqual(next.players.map(p=>p.points),[2,1,0]);
  const cancelled=reduce(s,{type:'cancelGuess'});assert.equal(cancelled.deadline,61_000);
  assert.deepEqual(award(cancelled,61_500).players.map(p=>p.points),[0,1,0]);
});
test('players take turns in order; skipping keeps the actor and scores zero',()=>{
  let s=award(acting('easy'));
  s=award(acting('medium',s),2_000,'a');assert.equal(s.activeId,'c');
  s=award(acting('hard',s),2_000,'b');assert.equal(s.activeId,'a');
  const skipped=reduce(acting('hard',s),{type:'skip'});
  assert.equal(skipped.activeId,'a');assert.deepEqual(skipped.players.map(p=>p.points),s.players.map(p=>p.points));
  assert.equal(skipped.cardIndex,s.cardIndex+1);
});
test('roster and target lock when the game starts; both participants may win together',()=>{
  let s=acting('hard',setup(2));
  assert.equal(reduce(s,{type:'remove',id:'b'}),s);
  assert.equal(reduce(s,{type:'target',value:100}),s);
  s=award(s);
  assert.equal(s.phase,'finished');assert.deepEqual(s.winners,['a','b']);assert.equal(s.activeId,'a');
  assert(validCharadesState(JSON.parse(JSON.stringify(s))));
  assert.equal(reduce(s,{type:'guess',now:2_000}),s);
  const fresh=reduce(s,{type:'new',deck:createCharadesDeck(categories)});
  assert.equal(fresh.phase,'setup');assert.equal(fresh.targetScore,2);assert.equal(fresh.activeId,'a');
  assert.deepEqual(fresh.players.map(p=>p.points),[0,0,0]);assert(validCharadesState(fresh));
});
test('legacy players migrate with reset scores; corrupt saves are rejected',()=>{
  const s=newCharadesState(categories,{players:[{id:'a',name:'A',points:10,guessed:2,skipped:1}],targetScore:50});
  assert.equal(s.players[0].points,0);assert.equal(s.targetScore,50);assert(validCharadesState(s));
  assert.equal(validCharadesState({...s,phase:'acting',selected:null,deadline:null}),false);
  assert.equal(validCharadesState({...s,targetScore:-1}),false);
  assert.equal(reduce(s,{type:'start'}),s);
});
test('all five languages provide complete three-tier cards in all-category mode',async()=>{
  for(const lang of ['uk','en','sv','de','es']){
    const mod=await import(`../src/data/crocodile.${lang}.js`);
    assert(deckReady(createCharadesDeck(mod[`CROCODILE_${lang.toUpperCase()}`])));
  }
});
