import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wordsByDifficulty } from '../src/utils/difficulty.js';
import { uniqueWords } from '../src/utils/words.js';
import { canCompleteRound, createCharadesDeck, deckReady } from '../src/utils/charades.js';

test('difficulty follows explicit content labels rather than word length', () => {
  const category = { easy: ['A very familiar long phrase'], medium: ['Astronaut'], hard: ['Quark'] };
  assert.deepEqual(wordsByDifficulty(category, 'easy'), category.easy);
  assert.deepEqual(wordsByDifficulty(category, 'hard'), category.hard);
  assert.deepEqual(wordsByDifficulty(category, 'unknown'), []);
});

test('custom cards deduplicate spaces and letter case without losing display text', () => {
  const words = uniqueWords([' Кіт ', 'кіт', '', 'Собака', 'СОБАКА', 'Дерево']);
  assert.equal(words.length, 3);
  assert.equal(new Set(words.map(word => word.toLocaleLowerCase())).size, 3);
});

for (const language of ['uk', 'en', 'sv', 'de', 'es']) {
  test(language + ': every Who Am I category has explicit levels and every word belongs to one level', async () => {
    const module = await import('../src/data/whoami.' + language + '.js');
    const categories = Object.values(module)[0];
    for (const category of Object.values(categories)) {
      assert(!Array.isArray(category));
      const words = ['easy', 'medium', 'hard'].flatMap(level => wordsByDifficulty(category, level));
      assert.equal(words.length, new Set(words).size);
    }
    for (const level of ['easy', 'medium', 'hard']) {
      assert(Object.values(categories).flatMap(category => wordsByDifficulty(category, level)).length > 0);
    }
  });
}

for (const language of ['uk', 'en', 'sv', 'de', 'es']) {
 test(language + ': every Crocodile category has explicit levels and no duplicated words', async () => {
  const module=await import('../src/data/crocodile.'+language+'.js');
  const categories=Object.values(module)[0];
  const all=[];
  for(const category of Object.values(categories)){
   assert(!Array.isArray(category));
   for(const level of ['easy','medium','hard']){assert(Array.isArray(category[level]));all.push(...wordsByDifficulty(category,level));}
  }
  assert(all.every(word => typeof word === 'string' && word.trim() === word && word.length > 0));
  const normalized = all.map(word => word.normalize('NFKC').replace(/[’ʼ]/g, "'").replace(/\s+/g, ' ').toLocaleLowerCase());
  assert.equal(all.length,new Set(normalized).size);
 });

 test(language + ': expanded Crocodile categories support complete rounds and matching translations', async () => {
  const { CROCODILE_UK } = await import('../src/data/crocodile.uk.js');
  const module = await import('../src/data/crocodile.' + language + '.js');
  const categories = Object.entries(Object.values(module)[0]);
  const reference = Object.values(CROCODILE_UK);
  const previousCounts = [8, 5, 5, 11, 10, 11, 10, 11, 10];
  assert.equal(categories.length, previousCounts.length);
  for (const [index, [name, words]] of categories.entries()) {
   const count = ['easy', 'medium', 'hard'].reduce((sum, level) => sum + words[level].length, 0);
   assert(count >= previousCounts[index] + 50, name + ': at least 50 additional tasks');
   for (const level of ['easy', 'medium', 'hard']) {
    assert.equal(words[level].length, reference[index][level].length, name + ': translated ' + level + ' pool');
   }
   const deck = createCharadesDeck(Object.values(module)[0], name);
   assert(deckReady(deck), name + ': all three difficulty choices');
   assert(canCompleteRound({ deck, cardIndex: 0, players: Array.from({ length: 12 }) }), name + ': full round for 12 players');
  }
 });
}
test('requested Ukrainian Crocodile levels are preserved and legacy words remain playable',async()=>{
 const {CROCODILE_UK:categories}=await import('../src/data/crocodile.uk.js');
 const at=level=>Object.values(categories).flatMap(category=>wordsByDifficulty(category,level));
 for(const [level,words] of Object.entries({easy:['Читати книгу'],medium:['Землетрус','Пилосос'],hard:['Капібара','Хамелеон','Качкодзьоб','Еволюція']})){
  for(const word of words){assert(at(level).includes(word),word);for(const other of ['easy','medium','hard'].filter(value=>value!==level))assert(!at(other).includes(word),word);}
 }
 const all=['easy','medium','hard'].flatMap(at);
 for(const word of ['Слон','Пінгвін','Восьминіг','Фламінго','Кенгуру','Кінорежисер','Піцайоло','Пілот','Бариста','Фокусник','Літак','Робот','Велосипед','Скейтборд','Ліфт'])assert(all.includes(word),word);
});
