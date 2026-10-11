import { DIFFICULTIES, wordsByDifficulty } from './difficulty.js';
import { DEFAULT_TARGET_SCORE, POINTS_BY_DIFFICULTY, nextPlayerId, validPlayers, validTargetScore } from './playerScores.js';

export const CHARADES_DURATION = 60_000;
export const ALL_CHARADES_CATEGORIES = '__all__';
const phases = ['setup', 'handoff', 'choosing', 'acting', 'confirming', 'finished', 'exhausted'];
export function createCharadesDeck(categories, category = ALL_CHARADES_CATEGORIES) {
  const pools = category === ALL_CHARADES_CATEGORIES ? Object.values(categories) : [categories[category]];
  return Object.fromEntries(DIFFICULTIES.map(level => {
    const words = [...new Set(pools.flatMap(pool => wordsByDifficulty(pool, level)))];
    // Fisher–Yates: shuffle once and persist the order, including unchosen words.
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return [level, words];
  }));
}
export const deckReady = deck => DIFFICULTIES.every(level => Array.isArray(deck?.[level]) && deck[level].length > 0);
export function currentCharadesCard(state) {
  return Object.fromEntries(DIFFICULTIES.map(level => [level, state.deck[level][state.cardIndex] || '']));
}
export const hasCharadesCard = state => DIFFICULTIES.every(level => Boolean(state.deck[level]?.[state.cardIndex]));
export const canCompleteRound = state =>
  Math.min(...DIFFICULTIES.map(level => state.deck[level]?.length || 0)) - state.cardIndex >= state.players.length;

export function charadesPoints(state, answeredAt) {
  const guesserPoints = POINTS_BY_DIFFICULTY[state.selected] || 0;
  if (!guesserPoints) return { guesserPoints: 0, presenterPoints: 0, bonus: 0 };
  if (state.timed === false) return { guesserPoints, presenterPoints: guesserPoints, bonus: 0 };
  if (!Number.isFinite(state.deadline) || answeredAt >= state.deadline) return { guesserPoints, presenterPoints: 0, bonus: 0 };
  const elapsed = Math.max(0, answeredAt - (state.deadline - CHARADES_DURATION));
  const bonus = elapsed <= 20_000 ? 2 : elapsed <= 40_000 ? 1 : 0;
  return { guesserPoints, presenterPoints: guesserPoints + bonus, bonus };
}

export function restoreCharadesState(state) {
  if (state.scoringVersion === 2) return { ...state, timed: state.timed ?? true };
  // Older games counted only successful turns. Preserve scores and align the current round.
  const completed = Math.min(...state.players.map(player => player.presented), Infinity);
  const activeIndex = state.players.findIndex(player => player.id === state.activeId);
  return { ...state, timed: state.timed ?? true, scoringVersion: 2,
    players: state.players.map((player, index) => ({ ...player,
      presented: (Number.isFinite(completed) ? completed : 0) + (index < activeIndex ? 1 : 0) })) };
}

function finishTurn(state, players, lastResult) {
  const roundComplete = players.every(player => player.presented === players[0].presented);
  const highest = Math.max(...players.map(player => player.points));
  const winners = roundComplete && highest >= state.targetScore
    ? players.filter(player => player.points === highest).map(player => player.id) : [];
  const next = { ...state, players, cardIndex: state.cardIndex + 1 };
  const exhausted = !hasCharadesCard(next) || (roundComplete && !canCompleteRound(next));
  return { ...next, winners, phase: winners.length ? 'finished' : exhausted ? 'exhausted' : 'handoff',
    activeId: winners.length ? state.activeId : nextPlayerId(players, state.activeId),
    selected: null, deadline: null, answeredAt: null, lastResult };
}

export function newCharadesState(categories, legacy = null) {
  const oldPlayers = validPlayers(legacy?.players) ? legacy.players : [];
  return { schema: 2, scoringVersion: 2, phase: 'setup', players: oldPlayers.map(p => ({ ...p, points: 0, guessed: 0, skipped: 0, presented: 0 })),
    activeId: oldPlayers[0]?.id || '', targetScore: validTargetScore(legacy?.targetScore) ? legacy.targetScore : DEFAULT_TARGET_SCORE,
    timed: true, category: ALL_CHARADES_CATEGORIES, deck: createCharadesDeck(categories), cardIndex: 0, selected: null, deadline: null,
    answeredAt: null, winners: [], lastResult: null };
}
export function validCharadesState(s) {
  if (!s || s.schema !== 2 || (s.scoringVersion !== undefined && s.scoringVersion !== 2) || !phases.includes(s.phase) || !validPlayers(s.players) ||
    !s.players.every(p => Number.isSafeInteger(p.presented) && p.presented >= 0) ||
    !validTargetScore(s.targetScore) || (s.timed !== undefined && typeof s.timed !== 'boolean') || typeof s.category !== 'string' || !s.deck ||
    !DIFFICULTIES.every(level => Array.isArray(s.deck[level]) && s.deck[level].every(w => typeof w === 'string' && w)) ||
    !Number.isSafeInteger(s.cardIndex) || s.cardIndex < 0 ||
    !(s.selected === null || DIFFICULTIES.includes(s.selected)) ||
    !(s.deadline === null || Number.isFinite(s.deadline)) || !(s.answeredAt === null || Number.isFinite(s.answeredAt)) ||
    !Array.isArray(s.winners) || !s.winners.every(id => s.players.some(p => p.id === id)) ||
    (s.players.length ? !s.players.some(p => p.id === s.activeId) : s.activeId !== '')) return false;
  if (s.phase !== 'setup' && (s.players.length < 2 || !deckReady(s.deck))) return false;
  if (['acting', 'confirming'].includes(s.phase) && (!s.selected || (s.timed !== false && !Number.isFinite(s.deadline)))) return false;
  if (s.timed === false && s.deadline !== null) return false;
  if (s.phase === 'confirming' && !Number.isFinite(s.answeredAt)) return false;
  if (s.phase === 'finished' && (!s.winners.length || !s.winners.every(id => s.players.find(p => p.id === id).points >= s.targetScore))) return false;
  if (s.lastResult !== null && (!s.lastResult || typeof s.lastResult.presenter !== 'string' || typeof s.lastResult.guesser !== 'string' ||
    ![0, 1, 2, 3, 4, 5].includes(s.lastResult.presenterPoints) || ![1, 2, 3].includes(s.lastResult.guesserPoints) || (s.lastResult.bonus !== undefined && ![0, 1, 2].includes(s.lastResult.bonus)))) return false;
  return true;
}
export function charadesReducer(state, action) {
  switch (action.type) {
    case 'add': {
      if (state.phase !== 'setup' || !action.player?.id || !action.player.name?.trim() ||
        state.players.some(p => p.id === action.player.id || p.name.toLocaleLowerCase() === action.player.name.trim().toLocaleLowerCase())) return state;
      const player = { id: action.player.id, name: action.player.name.trim(), points: 0, guessed: 0, skipped: 0, presented: 0 };
      return { ...state, players: [...state.players, player], activeId: state.activeId || player.id };
    }
    case 'remove': {
      if (state.phase !== 'setup') return state;
      const players = state.players.filter(p => p.id !== action.id);
      return { ...state, players, activeId: players[0]?.id || '' };
    }
    case 'target':
      return state.phase === 'setup' && validTargetScore(action.value) ? { ...state, targetScore: action.value } : state;
    case 'timing':
      return state.phase === 'setup' && typeof action.timed === 'boolean' ? { ...state, timed: action.timed } : state;
    case 'category':
      return state.phase === 'setup' ? { ...state, category: action.category, deck: action.deck, cardIndex: 0 } : state;
    case 'start':
      return state.phase === 'setup' && state.players.length >= 2 && deckReady(state.deck) && canCompleteRound(state)
        ? { ...state, phase: 'handoff', activeId: state.players[0].id } : state;
    case 'reveal':
      return state.phase === 'handoff' && hasCharadesCard(state) ? { ...state, phase: 'choosing' } : state;
    case 'select':
      return state.phase === 'choosing' && hasCharadesCard(state) && DIFFICULTIES.includes(action.level) && Number.isFinite(action.now)
        ? { ...state, phase: 'acting', selected: action.level, deadline: state.timed === false ? null : action.now + CHARADES_DURATION, answeredAt: null, lastResult: null } : state;
    case 'guess':
      return state.phase === 'acting' && Number.isFinite(action.now)
        ? { ...state, phase: 'confirming', answeredAt: action.now } : state;
    case 'cancelGuess':
      return state.phase === 'confirming' ? { ...state, phase: 'acting', answeredAt: null } : state;
    case 'award': {
      const presenter = state.players.find(p => p.id === state.activeId);
      const guesser = state.players.find(p => p.id === action.id);
      if (state.phase !== 'confirming' || !guesser || guesser.id === presenter.id) return state;
      const { guesserPoints, presenterPoints, bonus } = charadesPoints(state, state.answeredAt);
      const players = state.players.map(p => p.id === presenter.id ? { ...p, points: p.points + presenterPoints, presented: p.presented + 1 }
        : p.id === guesser.id ? { ...p, points: p.points + guesserPoints, guessed: p.guessed + 1 } : p);
      return finishTurn(state, players, { presenter: presenter.name, presenterPoints, guesser: guesser.name, guesserPoints, bonus });
    }
    case 'skip': {
      if (state.phase !== 'acting') return state;
      const players = state.players.map(p => p.id === state.activeId ? { ...p, skipped: p.skipped + 1, presented: p.presented + 1 } : p);
      return finishTurn(state, players, null);
    }

    case 'new':
      return { ...state, scoringVersion: 2, phase: 'setup', players: state.players.map(p => ({ ...p, points: 0, guessed: 0, skipped: 0, presented: 0 })),
        activeId: state.players[0]?.id || '', deck: action.deck, cardIndex: 0, selected: null, deadline: null, answeredAt: null, winners: [], lastResult: null };
    default: return state;
  }
}
