import { uniqueWords } from './words.js';
import { DIFFICULTIES } from './difficulty.js';

export const ALIAS_ALL = '__all__';
export const ALIAS_SECONDS = 60;
const phases = ['setup', 'dice', 'rolling', 'ready', 'acting', 'last', 'summary', 'finished', 'exhausted'];
const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string');
export const validAliasTarget = value => Number.isSafeInteger(value) && value > 0;
const wordKey = word => word.normalize('NFC').replace(/[’ʼ]/g, "'").toLocaleLowerCase();
export const isAliasWord = word => typeof word === 'string' && /^\p{L}+(?:['’ʼ-]\p{L}+)*$/u.test(word.normalize('NFC'));

export function aliasCategories(...sources) {
  const result = {};
  for (const source of sources) for (const [category, levels] of Object.entries(source)) {
    result[category] ||= {};
    for (const level of DIFFICULTIES) result[category][level] = uniqueWords([...(result[category][level] || []), ...(levels[level] || [])]
      .filter(word => typeof word === 'string').map(word => word.trim()).filter(isAliasWord).map(word => word.normalize('NFC').replace(/[’ʼ]/g, "'")));
  }
  return Object.fromEntries(Object.entries(result).filter(([, levels]) => DIFFICULTIES.some(level => levels[level].length)));
}

export function aliasPool(categories, category = ALIAS_ALL, difficulty = 'all') {
  const selected = category === ALIAS_ALL ? Object.values(categories) : [categories[category] || {}];
  return uniqueWords(selected.flatMap(levels => (difficulty === 'all' ? DIFFICULTIES : [difficulty]).flatMap(level => levels[level] || []))).filter(isAliasWord);
}

export function shuffleAlias(words, random = Math.random) {
  const result = uniqueWords(words);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function newAliasState(names = ['Monsters', 'Penguins']) {
  return { schema: 1, phase: 'setup', teams: names.map((name, index) => ({ id: 'team-' + index, name, players: [], points: 0, turns: 0 })),
    category: ALIAS_ALL, difficulty: 'all', target: 60, deck: [], index: 0, activeIndex: 0,
    contenders: [], dice: [], pending: [], rollUntil: null, deadline: null, correct: 0, skipped: 0, result: null, winners: [] };
}

export function aliasSetupErrors(state, pool) {
  const errors = [];
  if (state.teams.length < 2) errors.push('needTeams');
  if (state.teams.some(team => !team.name.trim())) errors.push('needNames');
  if (new Set(state.teams.map(team => team.name.trim().toLocaleLowerCase())).size !== state.teams.length) errors.push('duplicateTeams');
  if (state.teams.some(team => team.players.length < 2 || team.players.some(player => !player.name.trim()))) errors.push('needPlayers');
  if (!validAliasTarget(state.target)) errors.push('invalidTarget');
  if (!pool.length) errors.push('noWords');
  return errors;
}

export function validAliasState(s) {
  const integer = Number.isSafeInteger;
  const stamp = value => value === null || (Number.isFinite(value) && value > 0);
  if (!s || s.schema !== 1 || !phases.includes(s.phase) || !Array.isArray(s.teams) ||
    !s.teams.every(team => team && typeof team.id === 'string' && team.id && typeof team.name === 'string' &&
      integer(team.points) && integer(team.turns) && team.turns >= 0 && Array.isArray(team.players) &&
      team.players.every(player => player && typeof player.id === 'string' && player.id && typeof player.name === 'string')) ||
    new Set(s.teams.map(team => team.id)).size !== s.teams.length ||
    new Set(s.teams.flatMap(team => team.players.map(player => player.id))).size !== s.teams.reduce((n, team) => n + team.players.length, 0) ||
    !strings(s.deck) || s.deck.some(word => !word.trim()) || uniqueWords(s.deck).length !== s.deck.length ||
    !integer(s.index) || s.index < 0 || s.index > s.deck.length || !integer(s.activeIndex) || s.activeIndex < 0 ||
    typeof s.category !== 'string' || !['all', ...DIFFICULTIES].includes(s.difficulty) || !validAliasTarget(s.target) ||
    !stamp(s.deadline) || !stamp(s.rollUntil) || !integer(s.correct) || s.correct < 0 || !integer(s.skipped) || s.skipped < 0) return false;
  const ids = new Set(s.teams.map(team => team.id));
  const validIds = list => strings(list) && new Set(list).size === list.length && list.every(id => ids.has(id));
  const validDice = list => Array.isArray(list) && new Set(list.map(roll => roll?.id)).size === list.length && list.every(roll =>
    roll && ids.has(roll.id) && Array.isArray(roll.values) && roll.values.length === 2 && roll.values.every(value => integer(value) && value >= 1 && value <= 6));
  if (!validIds(s.contenders) || !validIds(s.winners) || !validDice(s.dice) || !validDice(s.pending)) return false;
  if (s.phase !== 'setup' && (s.teams.length < 2 || s.activeIndex >= s.teams.length || s.teams.some(team => !team.name.trim() || team.players.length < 2 || team.players.some(player => !player.name.trim())))) return false;
  if (s.phase === 'rolling' && (s.rollUntil === null || s.pending.length !== s.contenders.length || !s.contenders.every(id => s.pending.some(roll => roll.id === id)))) return false;
  if (['acting', 'last'].includes(s.phase) && (s.index >= s.deck.length || s.deadline === null)) return false;
  if (['dice', 'rolling', 'ready', 'summary'].includes(s.phase) && s.index >= s.deck.length) return false;
  if (s.phase === 'finished' && !s.winners.length) return false;
  if (s.phase === 'exhausted' && s.index < s.deck.length) return false;
  if (['dice', 'rolling'].includes(s.phase) && !s.contenders.length) return false;
  if (s.result !== null && (!s.result || !ids.has(s.result.teamId) || !integer(s.result.correct) || !integer(s.result.skipped) ||
    s.result.correct < 0 || s.result.skipped < 0 || (s.result.lastTeamId !== null && !ids.has(s.result.lastTeamId)) ||
    (s.result.sharedPenalty !== undefined && typeof s.result.sharedPenalty !== 'boolean'))) return false;
  return true;
}

export const aliasWord = state => state.deck[state.index] || null;
export const aliasActor = state => {
  const team = state.teams[state.activeIndex];
  return team?.players[team.turns % team.players.length];
};

function finishTurn(state, lastTeamId = null, sharedPenalty = false) {
  const teamId = state.teams[state.activeIndex].id;
  const teams = state.teams.map(team => team.id === teamId ? { ...team, turns: team.turns + 1 } : team);
  const maximum = Math.max(...teams.map(team => team.points));
  const winners = maximum >= state.target ? teams.filter(team => team.points === maximum).map(team => team.id) : [];
  return { ...state, teams, deadline: null, winners,
    phase: winners.length ? 'finished' : state.index >= state.deck.length ? 'exhausted' : 'summary',
    result: { teamId, correct: state.correct, skipped: state.skipped, lastTeamId, sharedPenalty } };
}

export function aliasReducer(state, action) {
  switch (action.type) {
    case 'settings':
      if (state.phase !== 'setup') return state;
      return { ...state, ...Object.fromEntries(Object.entries(action.value).filter(([key]) => ['teams', 'category', 'difficulty', 'target'].includes(key))) };
    case 'start':
      if (state.phase !== 'setup' || !strings(action.deck) || aliasSetupErrors(state, uniqueWords(action.deck)).length) return state;
      return { ...state, phase: 'dice', deck: uniqueWords(action.deck), contenders: state.teams.map(team => team.id) };
    case 'roll': {
      if (state.phase !== 'dice' || !Number.isFinite(action.now) || !Array.isArray(action.rolls) ||
        action.rolls.length !== state.contenders.length || !state.contenders.every(id => action.rolls.filter(roll => roll.id === id &&
          Array.isArray(roll.values) && roll.values.length === 2 && roll.values.every(value => Number.isInteger(value) && value >= 1 && value <= 6)).length === 1)) return state;
      return { ...state, phase: 'rolling', pending: action.rolls, rollUntil: action.now + 1400 };
    }
    case 'rolled': {
      if (state.phase !== 'rolling' || !Number.isFinite(action.now) || action.now < state.rollUntil) return state;
      const total = roll => roll.values[0] + roll.values[1];
      const max = Math.max(...state.pending.map(total));
      const contenders = state.pending.filter(roll => total(roll) === max).map(roll => roll.id);
      const dice = [...state.dice.filter(roll => !state.contenders.includes(roll.id)), ...state.pending];
      return { ...state, dice, pending: [], rollUntil: null, contenders, phase: contenders.length === 1 ? 'ready' : 'dice',
        activeIndex: contenders.length === 1 ? state.teams.findIndex(team => team.id === contenders[0]) : state.activeIndex };
    }
    case 'begin':
      if (state.phase !== 'ready' || !aliasWord(state) || !Number.isFinite(action.now)) return state;
      return { ...state, phase: 'acting', deadline: action.now + ALIAS_SECONDS * 1000, correct: 0, skipped: 0, result: null };
    case 'expire':
      return state.phase === 'acting' && action.now >= state.deadline ? { ...state, phase: 'last' } : state;
    case 'answer': {
      if (state.phase !== 'acting' || action.index !== state.index || !['correct', 'skip'].includes(action.outcome) || !Number.isFinite(action.now)) return state;
      if (action.now >= state.deadline) return { ...state, phase: 'last' };
      const correct = action.outcome === 'correct';
      const next = { ...state, index: state.index + 1, correct: state.correct + Number(correct), skipped: state.skipped + Number(!correct),
        teams: state.teams.map((team, index) => index === state.activeIndex ? { ...team, points: team.points + (correct ? 1 : -1) } : team) };
      return next.index >= next.deck.length ? finishTurn(next) : next;
    }
    case 'last': {
      if (state.phase !== 'last' || action.index !== state.index || (action.teamId !== null && !state.teams.some(team => team.id === action.teamId))) return state;
      const activeId = state.teams[state.activeIndex].id;
      const next = { ...state, index: state.index + 1, correct: state.correct + Number(action.teamId === activeId), skipped: state.skipped + Number(action.teamId === null),
        teams: state.teams.map(team => ({ ...team, points: team.points + (action.teamId === null ? -1 : (team.id === action.teamId ? 1 : 0)) })) };
      return finishTurn(next, action.teamId, action.teamId === null);
    }
    case 'next':
      return state.phase === 'summary' ? { ...state, phase: 'ready', activeIndex: (state.activeIndex + 1) % state.teams.length, correct: 0, skipped: 0, result: null } : state;
    case 'new':
      return { ...newAliasState([]), teams: state.teams.map(team => ({ ...team, points: 0, turns: 0 })), category: state.category, difficulty: state.difficulty, target: state.target };
    default: return state;
  }
}

export function restoreAliasState(state, now = Date.now()) {
  if (!validAliasState(state)) return null;
  return aliasReducer(aliasReducer(state, { type: 'rolled', now }), { type: 'expire', now });
}

export function refreshAliasDeck(state, categories, random = Math.random) {
  const category = state.category === ALIAS_ALL || Object.hasOwn(categories, state.category) ? state.category : ALIAS_ALL;
  if (['setup', 'finished'].includes(state.phase)) return { ...state, category };
  // Keep history and an already revealed card; only replace future sentence cards.
  const keepCurrent = ['acting', 'last'].includes(state.phase);
  const prefix = state.deck.slice(0, state.index + Number(keepCurrent));
  const used = new Set(prefix.map(wordKey));
  const tail = [...state.deck.slice(prefix.length).filter(isAliasWord), ...shuffleAlias(aliasPool(categories, category, state.difficulty), random)]
    .filter(word => { const key = wordKey(word); if (used.has(key)) return false; used.add(key); return true; });
  const deck = [...prefix, ...tail];
  const phase = !keepCurrent && state.index >= deck.length ? 'exhausted'
    : state.phase === 'exhausted' && tail.length ? (state.result ? 'summary' : 'ready') : state.phase;
  return { ...state, category, deck, phase };
}
