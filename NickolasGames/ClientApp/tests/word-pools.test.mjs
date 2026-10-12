import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wordsByDifficulty } from '../src/utils/difficulty.js';
import { uniqueWords } from '../src/utils/words.js';

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
  assert.equal(all.length,new Set(all).size);
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
