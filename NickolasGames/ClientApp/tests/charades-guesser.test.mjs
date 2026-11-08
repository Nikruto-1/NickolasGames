import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charadesReducer as reduce, newCharadesState, restoreCharadesState, validCharadesState, CHARADES_ROLL_MS } from '../src/utils/charades.js';
import { validateCharadesStart } from '../src/utils/startValidation.js';
import { CHARADES_MODES } from '../src/locales/charades-modes.js';

const categories = { Test: Object.fromEntries(['easy', 'medium', 'hard'].map(level => [level, Array.from({ length: 12 }, (_, i) => `${level}-${i}`)])) };
const roll = (id, a, b) => ({ id, values: [a, b] });
function setup(target = 100) {
  let s = newCharadesState(categories);
  for (const id of ['a', 'b', 'c']) s = reduce(s, { type: 'add', player: { id, name: id.toUpperCase() } });
  return reduce(reduce(s, { type: 'target', value: target }), { type: 'turnMode', value: 'guesser' });
}
function start(state = setup()) {
  let s = reduce(state, { type: 'start' });
  s = reduce(s, { type: 'roll', now: 100, rolls: [roll('a', 2, 1), roll('b', 1, 1), roll('c', 6, 6)] });
  s = reduce(s, { type: 'rolled', now: 100 + CHARADES_ROLL_MS });
  return reduce(s, { type: 'confirmDice' });
}
function acting(state) {
  return reduce(reduce(state, { type: 'reveal' }), { type: 'select', level: 'hard', now: 10_000 });
}
function award(state, id, now = 10_500) {
  return reduce(reduce(state, { type: 'guess', now }), { type: 'award', id });
}

test('old games default to ordered mode without losing scores, words or turns', () => {
  const fresh = setup(); delete fresh.turnMode; delete fresh.draw;
  const old = reduce(fresh, { type: 'start' });
  assert.equal(old.phase, 'handoff'); assert.equal(old.activeId, 'a'); assert(validCharadesState(old));
  const restored = restoreCharadesState(JSON.parse(JSON.stringify(old)));
  assert.equal(restored.turnMode, 'ordered'); assert.deepEqual(restored.players, old.players); assert.deepEqual(restored.deck, old.deck);
  assert.equal(award(acting(restored), 'c').activeId, 'b');
});

test('guesser mode starts with dice; locks settings and requires explicit result confirmation', () => {
  const s = reduce(setup(), { type: 'start' });
  assert.equal(s.phase, 'dice'); assert.equal(s.deadline, null); assert(validCharadesState(s));
  assert.equal(reduce(s, { type: 'reveal' }), s);
  assert.equal(reduce(s, { type: 'confirmDice' }), s);
  assert.equal(reduce(s, { type: 'turnMode', value: 'ordered' }), s);
  assert.equal(reduce(s, { type: 'timing', timed: false }), s);
  const rolling = reduce(s, { type: 'roll', now: 100, rolls: [roll('a', 1, 1), roll('b', 6, 6), roll('c', 2, 2)] });
  assert.equal(rolling.phase, 'rolling'); assert(validCharadesState(rolling));
  assert.equal(reduce(rolling, { type: 'rolled', now: 1899 }), rolling);
  assert.equal(reduce(rolling, { type: 'roll', now: 150, rolls: [] }), rolling);
  const result = reduce(rolling, { type: 'rolled', now: 1900 });
  assert.equal(result.phase, 'diceResult'); assert.equal(result.activeId, 'b'); assert.equal(result.deadline, null); assert(validCharadesState(result));
  assert.equal(reduce(result, { type: 'rolled', now: 50_000 }), result);
  assert.equal(reduce(result, { type: 'reveal' }), result);
  assert.equal(reduce(result, { type: 'confirmDice' }).phase, 'handoff');
});

test('tied leaders alone reroll; a lower winning reroll beats nonparticipants old totals', () => {
  let s = reduce(setup(), { type: 'start' });
  s = reduce(reduce(s, { type: 'roll', now: 0, rolls: [roll('a', 6, 6), roll('b', 6, 6), roll('c', 5, 6)] }), { type: 'rolled', now: 1800 });
  assert.equal(s.phase, 'dice'); assert.deepEqual(s.draw.contenders, ['a', 'b']); assert(validCharadesState(s));
  assert.equal(reduce(s, { type: 'roll', now: 2000, rolls: [roll('a', 1, 1), roll('b', 1, 1), roll('c', 6, 6)] }), s);
  s = reduce(reduce(s, { type: 'roll', now: 2000, rolls: [roll('a', 1, 1), roll('b', 1, 1)] }), { type: 'rolled', now: 3800 });
  assert.equal(s.phase, 'dice'); assert(validCharadesState(s));
  s = reduce(reduce(s, { type: 'roll', now: 4000, rolls: [roll('a', 1, 1), roll('b', 1, 2)] }), { type: 'rolled', now: 5800 });
  assert.equal(s.activeId, 'b'); assert.equal(s.phase, 'diceResult'); assert(validCharadesState(s));
  assert.deepEqual(s.draw.results.find(item => item.id === 'c').values, [5, 6]);
});

test('dice reject invalid, missing, duplicated, out-of-range and foreign results', () => {
  const s = reduce(setup(), { type: 'start' });
  for (const rolls of [null, [], [roll('a', 1, 2)], [roll('a', 1, 2), roll('a', 3, 4), roll('c', 1, 1)],
    [roll('a', 0, 2), roll('b', 1, 1), roll('c', 1, 1)], [roll('a', 1, 7), roll('b', 1, 1), roll('c', 1, 1)],
    [roll('a', 1.5, 2), roll('b', 1, 1), roll('c', 1, 1)], [null, roll('b', 1, 1), roll('c', 1, 1)]]) {
    assert.equal(reduce(s, { type: 'roll', now: 10, rolls }), s);
  }
});

test('dice animation and result survive reload without rerolling or opening a word', () => {
  let s = reduce(setup(), { type: 'start' });
  s = reduce(s, { type: 'roll', now: 100, rolls: [roll('a', 1, 1), roll('b', 1, 2), roll('c', 4, 5)] });
  const restored = restoreCharadesState(JSON.parse(JSON.stringify(s)));
  assert(validCharadesState(restored)); assert.deepEqual(restored.draw, s.draw);
  const result = reduce(restored, { type: 'rolled', now: 100_000 });
  assert.equal(result.phase, 'diceResult'); assert.equal(result.activeId, 'c');
  assert.deepEqual(restoreCharadesState(JSON.parse(JSON.stringify(result))), result);
  assert.equal(result.selected, null); assert.equal(result.deadline, null);
});

test('correct guesser rather than next roster player acts next, including after timeout', () => {
  let s = award(acting(start()), 'b');
  assert.equal(s.activeId, 'b'); assert.equal(s.lastResult.presenterPoints, 5); assert.equal(s.lastResult.guesserPoints, 3);
  assert.deepEqual(s.players.map(p => p.points), [0, 3, 5]);
  s = award(acting(s), 'a', 70_000);
  assert.equal(s.activeId, 'a'); assert.equal(s.lastResult.presenterPoints, 0); assert.equal(s.lastResult.guesserPoints, 3);
  assert(validCharadesState(s));
  assert.equal(reduce(s, { type: 'award', id: 'c' }), s);
});

test('skipping keeps the same actor, advances to a fresh card and gives no points or penalty', () => {
  let s = acting(start());
  const points = s.players.map(p => p.points);
  s = reduce(s, { type: 'skip' });
  assert.equal(s.activeId, 'c'); assert.equal(s.phase, 'handoff'); assert.equal(s.cardIndex, 1);
  assert.deepEqual(s.players.map(p => p.points), points); assert.equal(s.players[2].skipped, 1);
  assert.equal(s.players[2].presented, 1); assert(validCharadesState(s));
  assert.equal(reduce(s, { type: 'skip' }), s);
});

test('target is checked after awarding both players, not after equal turn counts', () => {
  const s = award(acting(start(setup(3))), 'a');
  assert.equal(s.phase, 'finished'); assert.deepEqual(s.winners, ['c']); assert(validCharadesState(s));
  assert.deepEqual(s.players.map(p => p.presented), [0, 0, 1]);
  assert.equal(reduce(s, { type: 'confirmDice' }), s);
  assert.equal(reduce(s, { type: 'skip' }), s);
});

test('untimed points and shared victories remain supported in guesser mode', () => {
  const state = reduce(setup(3), { type: 'timing', timed: false });
  const s = award(acting(start(state)), 'a', 1_000_000);
  assert.equal(s.phase, 'finished'); assert.deepEqual(s.winners, ['a', 'c']); assert(validCharadesState(s));
  assert.deepEqual(s.players.map(p => p.points), [3, 0, 3]);
});

test('guesser mode can use a short deck without a complete roster round; deck ends without repetition', () => {
  let s = setup(); s = { ...s, deck: Object.fromEntries(['easy', 'medium', 'hard'].map(level => [level, ['only-' + level]])) };
  assert.deepEqual(validateCharadesStart({ state: s, targetDraft: '100' }), []);
  s = reduce(acting(start(s)), { type: 'skip' });
  assert.equal(s.phase, 'exhausted'); assert.equal(s.cardIndex, 1); assert(validCharadesState(s));
  const fresh = reduce(s, { type: 'new', deck: setup().deck });
  assert.equal(fresh.turnMode, 'guesser'); assert.equal(fresh.draw, null); assert(validCharadesState(fresh));
  assert.equal(reduce(fresh, { type: 'start' }).phase, 'dice');
  const ordered = reduce(fresh, { type: 'turnMode', value: 'ordered' });
  assert.equal(reduce(ordered, { type: 'start' }).phase, 'handoff');
});

test('malformed mode and dice saves are rejected rather than crashing the screen', () => {
  const s = start(); assert(validCharadesState(s));
  for (const bad of [{ ...s, turnMode: 'bad' }, { ...s, draw: null }, { ...s, draw: {} },
    { ...s, draw: { ...s.draw, results: [null] } }, { ...s, draw: { ...s.draw, contenders: ['unknown'] } },
    { ...s, draw: { ...s.draw, until: 123 } }, { ...s, phase: 'rolling' }, { ...s, turnMode: 'ordered', phase: 'dice' }]) assert.equal(validCharadesState(bad), false);
});

test('new mode has complete controls and accurate rule sections in all five languages', () => {
  assert.deepEqual(Object.keys(CHARADES_MODES).sort(), ['de', 'en', 'es', 'sv', 'uk']);
  for (const copy of Object.values(CHARADES_MODES)) {
    for (const [key, value] of Object.entries(copy)) if (key !== 'sections') assert(value.trim());
    assert.equal(copy.sections.length, 3);
    for (const section of copy.sections) { assert(section.title.trim()); assert.equal(section.items.length, 2); assert(section.items.every(item => item.trim())); }
  }
});
