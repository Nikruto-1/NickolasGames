import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialWhoami,restoreWhoamiCategory,validWhoami,whoamiReducer as reduce,whoamiPool,WHOAMI_ALL} from '../src/utils/whoami.js';
function game(pool=['Cat','Dog','Fox','Bear']) {
 let s=initialWhoami();
 s=reduce(s,{type:'add',id:'a',name:'Anna'});s=reduce(s,{type:'add',id:'b',name:'Bohdan'});
 return reduce(s,{type:'deal',pool});
}
test('setup assigns distinct words and rejects duplicate names and insufficient words',()=>{
 let s=initialWhoami();s=reduce(s,{type:'add',id:'a',name:'Anna'});
 assert.equal(reduce(s,{type:'add',id:'b',name:' ANNA '}),s);
 assert.equal(reduce(s,{type:'deal',pool:[]}),s);
 const g=game();assert.equal(validWhoami(g),true);assert.notEqual(g.players[0].word,g.players[1].word);
 assert.equal(reduce(g,{type:'remove',id:'a'}),g);
});
test('answer counts once, replaces privately, and prevents personal repeats and active duplicates',()=>{
 let s=game();const answer={type:'answer',id:'a',revision:s.players[0].revision,outcome:'guessed'};
 s=reduce(s,answer);assert.equal(s.players[0].guessed,1);assert.equal(s.players[0].word,'Fox');assert.equal(reduce(s,answer),s);
 s=reduce(s,{...answer,revision:s.players[0].revision,outcome:'gaveUp'});assert.equal(s.players[0].skipped,1);assert.equal(s.players[0].word,'Bear');
 s=reduce(s,{...answer,revision:s.players[0].revision});assert.equal(s.players[0].word,'');
 assert.equal(reduce(s,{...answer,revision:s.players[0].revision}),s);
});
test('manual words reject duplicates and remain available after exhaustion',()=>{
 let s=game(['Cat','Dog']);s=reduce(s,{type:'answer',id:'a',revision:1,outcome:'guessed'});
 assert.equal(reduce(s,{type:'manual',id:'a',word:' dog '}),s);
 assert.equal(reduce(s,{type:'manual',id:'a',word:'CAT'}),s);
 s=reduce(s,{type:'manual',id:'a',word:'New word'});assert.equal(s.players[0].word,'New word');assert.equal(s.players[0].guessed,1);
});
test('summary preserves game; replay resets results while keeping roster/settings',()=>{
 let s=game();s=reduce(s,{type:'answer',id:'a',revision:1,outcome:'guessed'});s=reduce(s,{type:'finish'});
 assert.equal(s.phase,'summary');assert.equal(validWhoami(JSON.parse(JSON.stringify(s))),true);
 s=reduce(s,{type:'resume'});assert.equal(s.players[0].guessed,1);
 s=reduce(s,{type:'setup'});assert.equal(s.players.length,2);assert.equal(s.players[0].word,'');assert.equal(s.players[0].guessed,0);
});
test('optional timer stops at zero and invalid saves are rejected',()=>{
 let s=game();assert.equal(reduce(s,{type:'tick'}),s);s={...s,timerEnabled:true,left:1};s=reduce(s,{type:'tick'});assert.equal(s.left,0);assert.equal(reduce(s,{type:'tick'}).left,0);
 assert.equal(validWhoami({...s,left:-1}),false);assert.equal(validWhoami({...s,players:[...s.players,s.players[0]]}),false);
});
test('pool uses explicit difficulty and deduplicates custom entries',()=>{
 const c={Animals:{easy:['Cat'],medium:['Dolphin'],hard:['Platypus']}};
 assert.deepEqual(new Set(whoamiPool(c,WHOAMI_ALL,'medium','dolphin, Fox\nFOX',false)),new Set(['dolphin','FOX']));
 assert.deepEqual(whoamiPool(c,WHOAMI_ALL,'hard','Only',true),['Only']);
});
test('legacy cards migrate without losing assigned words',()=>{
 const s=initialWhoami({assignments:[{id:'a',name:'Anna',word:'Cat',usedWords:['Cat']}],roundSeconds:90,left:40});
 assert.equal(s.phase,'game');assert.equal(s.players[0].word,'Cat');assert.equal(s.left,40);assert.equal(validWhoami(s),true);
});

test('all levels combines every tier, respects category and custom-only, and persists',()=>{
 const c={A:{easy:['Easy'],medium:['Medium'],hard:['Hard']},B:{easy:['Other'],medium:['Medium'],hard:['Harder']}};
 assert.deepEqual(new Set(whoamiPool(c,'A','all','',false)),new Set(['Easy','Medium','Hard']));
 assert.deepEqual(new Set(whoamiPool(c,WHOAMI_ALL,'all','easy, Custom',false)),new Set(['easy','Medium','Hard','Other','Harder','Custom']));
 assert.deepEqual(whoamiPool(c,WHOAMI_ALL,'all','Custom',true),['Custom']);
 let s=reduce(initialWhoami(),{type:'config',values:{difficulty:'all'}});
 assert.equal(validWhoami(JSON.parse(JSON.stringify(s))),true);
 assert.equal(initialWhoami({difficulty:'all'}).difficulty,'all');
});

for (const [language, oldName, newName] of [
 ['uk', 'Люди', 'Професії'], ['en', 'People', 'Professions'], ['sv', 'Personer', 'Yrken'],
 ['de', 'Personen', 'Berufe'], ['es', 'Personas', 'Profesiones'],
 ["uk", "Герої, люди та тварини", "Персонажі"],
 ["en", "Heroes, people and animals", "Characters"],
 ["sv", "Hjältar, personer och djur", "Karaktärer"],
 ["de", "Helden, Menschen und Tiere", "Figuren"],
 ["es", "Héroes, personas y animales", "Personajes"],
]) {
 test(language + ': category migration from ' + oldName + ' preserves saved games and remains playable', async () => {
  const module = await import('../src/data/whoami.' + language + '.js');
  const categories = Object.values(module)[0];
  assert(Object.hasOwn(categories, newName));
  assert(!Object.hasOwn(categories, oldName));
  for (const phase of ['setup', 'game', 'summary']) {
   const saved = { ...game(), category: oldName, phase, timerEnabled: true, left: 27 };
   saved.players[0].guessed = 3;
   saved.players[0].usedWords.push('Previously guessed word');
   const restored = restoreWhoamiCategory(JSON.parse(JSON.stringify(saved)), categories);
   assert.equal(restored.category, newName);
   assert.deepEqual({ ...restored, category: oldName }, saved);
   assert(validWhoami(restored));
   const pool = whoamiPool(categories, restored.category, restored.difficulty, restored.customWords, restored.customOnly);
   assert(pool.length >= restored.players.length);
   const replay = reduce(reduce(restored, { type: 'setup' }), { type: 'deal', pool });
   assert.equal(replay.phase, 'game');
   assert(replay.players.every(player => categories[newName][restored.difficulty].includes(player.word)));
  }
  const legacy = initialWhoami({ cat: oldName, assignments: [{ id: 'a', name: 'Anna', word: 'Existing card', usedWords: ['Existing card'] }], roundSeconds: 90, left: 40 });
  const restoredLegacy = restoreWhoamiCategory(legacy, categories);
  assert.equal(restoredLegacy.category, newName);
  assert.deepEqual({ ...restoredLegacy, category: oldName }, legacy);
  assert.equal(restoreWhoamiCategory({ ...legacy, category: newName }, categories).category, newName);
 });
}
