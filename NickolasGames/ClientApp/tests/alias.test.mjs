import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COPY } from '../src/locales/index.js';
import { ALIAS_COPY } from '../src/locales/alias.js';
import { ALIAS_WORDS } from '../src/data/alias.js';
import { ALIAS_FORMATS, aliasActor, aliasCategories, aliasPool, aliasReducer as reduce, aliasSetupErrors, aliasWord, isAliasPhrase, isAliasWord, newAliasState, refreshAliasDeck, restoreAliasState, shuffleAlias, validAliasState } from '../src/utils/alias.js';

const NOW = 100_000;
function setup(count = 2, size = 300) {
  let state = newAliasState(Array.from({ length: count }, (_, index) => 'Team ' + index));
  state.teams = state.teams.map((team, index) => ({ ...team, players: [{ id: index + '-a', name: 'Alice ' + index }, { id: index + '-b', name: 'Bob ' + index }] }));
  return reduce(state, { type: 'start', deck: Array.from({ length: size }, (_, index) => 'Word ' + index) });
}
function ready(count = 2, size = 300, winningIndex = 0) {
  let state = setup(count, size);
  state = reduce(state, { type: 'roll', now: NOW, rolls: state.teams.map((team, index) => ({ id: team.id, values: index === winningIndex ? [6, 6] : [1, 2] })) });
  return reduce(state, { type: 'rolled', now: NOW + 1400 });
}
const acting = (size = 300) => reduce(ready(2, size), { type: 'begin', now: NOW });
const answer = (state, outcome = 'correct', now = NOW + 1) => reduce(state, { type: 'answer', index: state.index, outcome, now });

test('defaults are two teams, target 60; every team needs two players and pending settings validate', () => {
  const state = newAliasState(ALIAS_COPY.uk.teams);
  assert.deepEqual(state.teams.map(team => team.name), ['Монстрики', 'Пінгвіни']);
  assert.equal(state.target, 60);
  assert.equal(validAliasState(state), true);
  assert.deepEqual(aliasSetupErrors(state, ['word']), ['needPlayers']);
  assert.equal(reduce(state, { type: 'start', deck: ['word'] }), state);
  const configured = setup(20);
  assert.equal(configured.phase, 'dice');
  const original = newAliasState();
  original.teams[0].players = Array.from({ length: 100 }, (_, i) => ({ id: String(i), name: 'Player ' + i }));
  original.teams[1].players = [{ id: 'other-a', name: 'A' }, { id: 'other-b', name: 'B' }];
  assert.deepEqual(aliasSetupErrors(original, ['word']), []);
  assert(aliasSetupErrors({ ...original, target: 0 }, ['word']).includes('invalidTarget'));
  assert(aliasSetupErrors({ ...original, target: 2.5 }, ['word']).includes('invalidTarget'));
  assert(aliasSetupErrors({ ...original, teams: original.teams.slice(0, 1) }, ['word']).includes('needTeams'));
});

test('dice animate before showing results; a tied high score rerolls only the leaders', () => {
  let state = setup(3);
  const values = [[6, 6], [5, 6], [6, 6]];
  state = reduce(state, { type: 'roll', now: NOW, rolls: state.teams.map((team, index) => ({ id: team.id, values: values[index] })) });
  assert.equal(state.phase, 'rolling');
  assert.equal(reduce(state, { type: 'rolled', now: NOW + 1399 }), state);
  state = reduce(state, { type: 'rolled', now: NOW + 1400 });
  assert.equal(state.phase, 'dice');
  assert.deepEqual(state.contenders, ['team-0', 'team-2']);
  state = reduce(state, { type: 'roll', now: NOW + 2000, rolls: [{ id: 'team-0', values: [1, 1] }, { id: 'team-2', values: [2, 1] }] });
  state = restoreAliasState(state, NOW + 4000);
  assert.equal(state.phase, 'ready');
  assert.equal(state.activeIndex, 2);
  assert.equal(state.dice.length, 3);
  assert.equal(aliasActor(state).name, 'Alice 2');
  assert.equal(state.deadline, null);
});

test('invalid dice and repeated roll/reveal cannot change the starting team', () => {
  const state = setup();
  for (const rolls of [[], [{ id: 'team-0', values: [7, 1] }, { id: 'team-1', values: [1, 1] }], [{ id: 'team-0', values: [1, 1] }, { id: 'team-0', values: [1, 1] }]]) {
    assert.equal(reduce(state, { type: 'roll', now: NOW, rolls }), state);
  }
  const resolved = ready();
  assert.equal(reduce(resolved, { type: 'rolled', now: NOW + 3000 }), resolved);
  assert.equal(reduce(resolved, { type: 'roll', now: NOW, rolls: [] }), resolved);
});

test('60 seconds allow many words, +1 correct, -1 skipped; scores may be negative', () => {
  let state = acting();
  assert.equal(state.deadline, NOW + 60_000);
  state = answer(state, 'skip');
  assert.equal(state.teams[0].points, -1);
  for (let i = 0; i < 100; i++) state = answer(state, 'correct', NOW + 2 + i);
  assert.equal(state.teams[0].points, 99);
  assert.equal(state.correct, 100);
  assert.equal(state.skipped, 1);
  assert.equal(state.phase, 'acting');
  assert.equal(state.index, 101);
  assert.equal(new Set(state.deck).size, state.deck.length);
  assert.equal(validAliasState(state), true);
});

test('a duplicate swipe/button event cannot mark the next word', () => {
  const state = acting();
  const action = { type: 'answer', outcome: 'correct', index: state.index, now: NOW + 1000 };
  const next = reduce(state, action);
  assert.equal(reduce(next, action), next);
  assert.equal(reduce(next, { type: 'settings', value: { target: 1 } }), next);
});

for (const elapsed of [60_000, 60_001, 120_000]) test(`at ${elapsed}ms the current word remains for all teams, no timed credit`, () => {
  const state = acting();
  const last = answer(state, 'correct', NOW + elapsed);
  assert.equal(last.phase, 'last');
  assert.equal(last.index, 0);
  assert.equal(aliasWord(last), aliasWord(state));
  assert.equal(last.teams[0].points, 0);
});

test('59999ms scores normally; reload at the deadline enters the last-word phase', () => {
  const state = answer(acting(), 'correct', NOW + 59_999);
  assert.equal(state.teams[0].points, 1);
  const restored = restoreAliasState(JSON.parse(JSON.stringify(state)), NOW + 60_000);
  assert.equal(restored.phase, 'last');
  assert.equal(restored.index, 1);
  assert.equal(restored.teams[0].points, 1);
});

test('any team may steal the last word exactly once, including a third team', () => {
  let state = reduce(ready(3), { type: 'begin', now: NOW });
  state = reduce(state, { type: 'expire', now: NOW + 60_000 });
  const action = { type: 'last', index: 0, teamId: 'team-2' };
  const scored = reduce(state, action);
  assert.deepEqual(scored.teams.map(team => team.points), [0, 0, 1]);
  assert.equal(scored.result.lastTeamId, 'team-2');
  assert.equal(scored.phase, 'summary');
  assert.equal(reduce(scored, action), scored);
  const next = reduce(scored, { type: 'next' });
  assert.equal(next.activeIndex, 1);
  assert.equal(next.deadline, null);
  assert.equal(next.index, 1);
});

test('unanswered last word costs every team one point exactly once; invalid recipients are ignored', () => {
  const last = reduce(acting(), { type: 'expire', now: NOW + 60_000 });
  assert.equal(reduce(last, { type: 'last', index: 0, teamId: 'unknown' }), last);
  const action = { type: 'last', index: 0, teamId: null };
  const result = reduce(last, action);
  assert.deepEqual(result.teams.map(team => team.points), [-1, -1]);
  assert.equal(result.skipped, 1);
  assert.equal(result.result.sharedPenalty, true);
  assert.equal(reduce(result, action), result);
  assert.deepEqual(restoreAliasState(JSON.parse(JSON.stringify(result))).teams.map(team => team.points), [-1, -1]);
});

test('shared last-word penalty applies to three teams, negative balances and victory calculation', () => {
  let state = reduce(ready(3), { type: 'begin', now: NOW });
  state = { ...state, target: 1, teams: state.teams.map((team, i) => ({ ...team, points: [1, -4, 0][i] })) };
  state = reduce(state, { type: 'expire', now: NOW + 60_000 });
  state = reduce(state, { type: 'last', index: 0, teamId: null });
  assert.deepEqual(state.teams.map(team => team.points), [0, -5, -1]);
  assert.equal(state.phase, 'summary');
  assert.deepEqual(state.winners, []);
});

test('teams rotate from dice winner and a different teammate explains on the next circuit', () => {
  let state = ready(3, 300, 2);
  assert.equal(state.activeIndex, 2);
  for (const expected of [0, 1, 2]) {
    state = reduce(state, { type: 'begin', now: NOW });
    state = reduce(state, { type: 'expire', now: NOW + 60_000 });
    state = reduce(state, { type: 'last', index: state.index, teamId: state.teams[state.activeIndex].id });
    state = reduce(state, { type: 'next' });
    assert.equal(state.activeIndex, expected);
  }
  assert.equal(aliasActor(state).name, 'Bob 2');
});

test('custom target wins after the last word, including when the stealing team wins', () => {
  let state = acting();
  state = { ...state, target: 1 };
  state = reduce(state, { type: 'expire', now: NOW + 60_000 });
  state = reduce(state, { type: 'last', index: 0, teamId: 'team-1' });
  assert.equal(state.phase, 'finished');
  assert.deepEqual(state.winners, ['team-1']);
  assert.equal(reduce(state, { type: 'next' }), state);
  const reset = reduce(state, { type: 'new' });
  assert.equal(reset.phase, 'setup');
  assert.equal(reset.target, 1);
  assert.equal(reset.teams[0].players.length, 2);
  assert.deepEqual(reset.teams.map(team => team.points), [0, 0]);
  assert.equal(validAliasState(reset), true);
});

test('finite deck exhaustion is explicit, never silently repeats words', () => {
  const state = answer(acting(1));
  assert.equal(state.phase, 'exhausted');
  assert.equal(state.index, 1);
  assert.equal(aliasWord(state), null);
  assert.equal(validAliasState(state), true);
  assert.equal(answer(state), state);
  assert.deepEqual(shuffleAlias(['A', ' a ', 'B'], () => 0), ['B', 'a']);
});

test('saved active game round-trips and corrupt saves are rejected without touching legacy saves', () => {
  const state = answer(acting(), 'skip');
  assert.deepEqual(restoreAliasState(JSON.parse(JSON.stringify(state)), NOW + 2000), state);
  for (const broken of [{}, { ...state, index: -1 }, { ...state, teams: [] }, { ...state, deadline: null },
    { ...state, dice: [{ id: 'team-0', values: [0, 8] }] }, { ...state, deck: ['A', 'a'] }, { ...state, target: Infinity },
    { ...ready(), deck: [] }, { ...ready(), phase: 'finished', winners: [] },
    { ...state, result: { teamId: 'unknown', correct: 0, skipped: 0, lastTeamId: null } }]) assert.equal(restoreAliasState(broken), null);
});

for (const [lang, copy] of Object.entries(COPY)) test(`${lang}: single-word pools grow, all levels are substantial and original single words remain`, () => {
  const categories = aliasCategories(copy.games.alias.c, copy.games.crocodile.c, ALIAS_WORDS[lang]);
  for (const level of ['all', 'easy', 'medium', 'hard']) {
    const pool = aliasPool(categories, undefined, level);
    assert(pool.length >= 60, level + ' needs a useful word pool');
    assert.equal(new Set(pool.map(word => word.toLocaleLowerCase())).size, pool.length);
    assert(pool.every(isAliasWord));
  }
  const oldSingleWords = aliasPool(aliasCategories(copy.games.alias.c, copy.games.crocodile.c));
  assert(aliasPool(categories).length >= oldSingleWords.length + 100);
  const curated = Object.values(ALIAS_WORDS[lang]).flatMap(levels => Object.values(levels).flat());
  assert.equal(curated.length, 220);
  assert(curated.every(isAliasWord));
  assert.equal(new Set(curated).size, curated.length);
  for (const category of Object.values(copy.games.alias.c)) for (const words of Object.values(category)) for (const word of words.filter(isAliasWord)) assert(aliasPool(categories).includes(word));
  assert.deepEqual(Object.keys(ALIAS_COPY[lang]).sort(), Object.keys(ALIAS_COPY.en).sort());
  assert(Object.values(ALIAS_COPY[lang]).every(value => typeof value === 'object' ? Object.keys(value).length > 0 : value.length > 0));
  assert.deepEqual(Object.keys(ALIAS_COPY[lang].formats), ALIAS_FORMATS);
});

test('single-word filtering accepts real apostrophes, accents and compounds but rejects sentences', () => {
  for (const word of ['Об’єктивність', "Об'єктивність", 'Äpple', 'Piña', 'Північно-східний']) assert.equal(isAliasWord(word), true);
  for (const word of ['Складати намет після походу', 'Traffic jam', '11', '', 'Парасолька!']) assert.equal(isAliasWord(word), false);
  const categories = aliasCategories({ Sentences: { easy: ['A long sentence'], medium: [], hard: [] } });
  assert.deepEqual(aliasPool(categories), []);
  assert.deepEqual(aliasPool(categories, undefined, undefined, 'phrases'), ['A long sentence']);
});

test('updating an existing deck preserves scores, history, current word and deadline; future phrases are removed', () => {
  const original = { ...acting(), deck: ['Already used', 'Still explaining this phrase', 'Future long phrase', 'Compass'], index: 1 };
  original.teams[0].points = 7;
  const categories = { Words: { easy: ['Apple', 'Compass', 'Already used'], medium: [], hard: [] } };
  const updated = refreshAliasDeck(original, categories, () => 0);
  assert.equal(aliasWord(updated), 'Still explaining this phrase');
  assert.equal(updated.deadline, original.deadline);
  assert.equal(updated.teams[0].points, 7);
  assert.equal(updated.index, 1);
  assert.equal(updated.deck[0], 'Already used');
  assert.deepEqual(updated.deck.slice(2).sort(), ['Apple', 'Compass']);
  assert.equal(validAliasState(updated), true);
  assert.deepEqual(refreshAliasDeck(updated, categories, () => 0), updated);
});

test('deck update never repeats a used word with a different apostrophe; finished games stay finished', () => {
  const original = { ...ready(), deck: ['Об’єктивність', 'Future phrase'], index: 1 };
  const categories = { Words: { easy: ["Об'єктивність", 'Apple'], medium: [], hard: [] } };
  const updated = refreshAliasDeck(original, categories, () => 0);
  assert.deepEqual(updated.deck, ['Об’єктивність', 'Apple']);
  assert.equal(validAliasState(updated), true);
  const finished = { ...original, phase: 'finished', winners: ['team-0'] };
  assert.deepEqual(refreshAliasDeck(finished, categories).deck, finished.deck);
});

test('exhausted saved games can use the new words without losing scores or replaying old words', () => {
  let exhausted = answer(acting(1));
  const categories = { Words: { easy: ['Apple'], medium: [], hard: [] } };
  exhausted = refreshAliasDeck(exhausted, categories, () => 0);
  assert.equal(exhausted.phase, 'summary');
  assert.equal(exhausted.teams[0].points, 1);
  assert.equal(exhausted.index, 1);
  assert.equal(aliasWord(exhausted), 'Apple');
  assert.equal(validAliasState(exhausted), true);
});

for (const [lang, copy] of Object.entries(COPY)) test(`${lang}: phrases and mixed mode restore every original card and respect difficulty/category`, () => {
  const categories = aliasCategories(copy.games.alias.c, copy.games.crocodile.c, ALIAS_WORDS[lang]);
  const words = aliasPool(categories);
  const phrases = aliasPool(categories, undefined, undefined, 'phrases');
  const all = aliasPool(categories, undefined, undefined, 'all');
  assert(words.length > 300);
  assert(phrases.length > 200);
  assert(phrases.every(isAliasPhrase));
  assert.equal(all.length, new Set([...words, ...phrases]).size);
  const originals = Object.values(aliasCategories(copy.games.alias.c, copy.games.crocodile.c)).flatMap(levels => Object.values(levels).flat());
  for (const word of originals) assert(all.includes(word));
  for (const level of ['easy', 'medium', 'hard']) {
    const filtered = aliasPool(categories, undefined, level, 'phrases');
    assert(filtered.length > 0);
    assert(filtered.every(word => Object.values(categories).some(levels => levels[level].includes(word))));
  }
  const name = Object.keys(categories).find(key => aliasPool(categories, key, 'all', 'phrases').length);
  assert(aliasPool(categories, name, 'all', 'phrases').every(word => Object.values(categories[name]).flat().includes(word)));
});

test('format defaults to words for old saves; selected format persists and is locked during play', () => {
  const legacy = newAliasState(); delete legacy.format;
  assert.equal(validAliasState(legacy), true);
  assert.equal(refreshAliasDeck(legacy, {}).format, 'words');
  assert.equal(restoreAliasState({ ...legacy, format: 'invalid' }), null);
  const configured = reduce(newAliasState(), { type: 'settings', value: { format: 'all' } });
  assert.equal(configured.format, 'all');
  assert.equal(restoreAliasState(JSON.parse(JSON.stringify(configured))).format, 'all');
  assert.equal(reduce(configured, { type: 'new' }).format, 'all');
  const playing = { ...acting(), format: 'phrases' };
  assert.equal(reduce(playing, { type: 'settings', value: { format: 'words' } }), playing);
});

test('mixed and phrase decks retain matching cards, used history and current word on reload', () => {
  const categories = { Words: { easy: ['Apple', 'A long phrase', 'An idiom'], medium: [], hard: [] } };
  const original = { ...acting(), deck: ['Apple', 'Current word', 'A long phrase'], index: 1, format: 'all' };
  const mixed = refreshAliasDeck(original, categories, () => 0);
  assert.equal(aliasWord(mixed), 'Current word');
  assert(mixed.deck.includes('A long phrase'));
  assert.equal(mixed.deck.filter(word => word === 'Apple').length, 1);
  assert.equal(mixed.deadline, original.deadline);
  const phrases = refreshAliasDeck({ ...original, format: 'phrases' }, categories, () => 0);
  assert(phrases.deck.slice(2).every(isAliasPhrase));
  assert.equal(validAliasState(phrases), true);
  assert.deepEqual(refreshAliasDeck(phrases, categories, () => 0), phrases);
});
