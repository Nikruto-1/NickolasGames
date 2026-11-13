import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ALIAS_COPY } from './translations.js';
import { ALIAS_WORDS } from './words.js';
import { DIFFICULTIES } from '../../utils/difficulty.js';
import { readValue, writeValue } from '../../utils/progress.js';
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';
import { ALIAS_ALL, ALIAS_FORMATS, aliasActor, aliasCategories, aliasCategorySelection, aliasPool, aliasReducer, aliasSetupErrors, aliasWord, newAliasState, refreshAliasDeck, restoreAliasState, shuffleAlias, validAliasState, validAliasTarget } from './gameLogic.js';

import { useVersionedReducer } from "../../utils/gameSession.js";

export function useAliasGame({ games, t, lang, startRequest = 0 }) {
  const copy = ALIAS_COPY[lang] || ALIAS_COPY.en;
  const key = `nickolasgames-alias-teams-v1-${lang}`;
  const categories = useMemo(() => aliasCategories(games.alias.c, games.crocodile.c, ALIAS_WORDS[lang] || ALIAS_WORDS.en), [games, lang]);
  const [state, dispatch, storageOk] = useVersionedReducer({
    game: "alias", lang, reducer: aliasReducer,
    validate: value => validAliasState(value) ? refreshAliasDeck(restoreAliasState(value), categories) : null,
    initialize: () => refreshAliasDeck(restoreAliasState(readValue(key)) || newAliasState(copy.teams), categories)
  });
  const categorySelection = aliasCategorySelection(state);
  const pool = useMemo(() => aliasPool(categories, categorySelection, state.difficulty, state.format), [categories, categorySelection, state.difficulty, state.format]);
  const availableCategories = useMemo(() => Object.keys(categories), [categories]);
  const selectedCategories = categorySelection === ALIAS_ALL ? availableCategories : Array.isArray(categorySelection) ? categorySelection : [categorySelection];
  const categorySummary = categorySelection === ALIAS_ALL ? t.allCategories : !selectedCategories.length ? copy.chooseCategories : selectedCategories.length <= 2 ? selectedCategories.join(' · ') : copy.selectedCategories + ': ' + selectedCategories.length;
  const [drafts, setDrafts] = useState({});
  const [editingTeam, setEditingTeam] = useState(null);
  const [target, setTarget] = useState(String(state.target));
  const [attempt, setAttempt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const [drag, setDrag] = useState(0);
  const gesture = useRef(null);
  const feedback = useRef(null);
  const readyPanel = useRef(null);
  const previousPhase = useRef(state.phase);
  const sound = useRef(null);
  const armed = useRef(null);
  const previousAnswers = useRef(state.answers?.length || 0);
  if (!sound.current) sound.current = createHolmesTimerSound();
  const setup = state.phase === 'setup';
  const drawing = ['dice', 'rolling', 'diceResult'].includes(state.phase);
  const team = state.teams[state.activeIndex];
  const actor = aliasActor(state);
  const word = aliasWord(state);
  const remaining = state.deadline === null ? 60 : Math.max(0, Math.ceil((state.deadline - clock) / 1000));
  const expired = state.phase === 'acting' && remaining === 0;
  const last = state.phase === 'last' || expired;
  const playing = state.phase === 'acting' || state.phase === 'last';
  const errors = aliasSetupErrors({ ...state, target: Number(target) }, pool);
  const result = state.result;
  const lastAnswer = result?.answers?.find(entry => entry.last);
  const roundCorrect = result ? result.correct - Number(Boolean(result.lastTeamId && result.lastTeamId === result.teamId)) : 0;
  const roundSkipped = result ? result.skipped - Number(Boolean(result.sharedPenalty)) : 0;
  if (Object.values(drafts).some(value => value.trim())) errors.push('pending');

  useEffect(() => {
    if (state.phase === 'ready' && ['summary', 'diceResult'].includes(previousPhase.current)) readyPanel.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    previousPhase.current = state.phase;
  }, [state.phase]);
  useEffect(() => () => sound.current.dispose(), []);
  useEffect(() => {
    const count = state.answers?.length || 0;
    const entry = state.answers?.[count - 1];
    if (count > previousAnswers.current && entry && !entry.last) sound.current.feedback(entry.outcome);
    previousAnswers.current = count;
  }, [state.answers]);
  useEffect(() => {
    if (!['acting', 'rolling'].includes(state.phase)) return;
    const tick = () => {
      const now = Date.now(); setClock(now);
      dispatch({ type: state.phase === 'rolling' ? 'rolled' : 'expire', now });
    };
    tick();
    const timer = setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [state.phase, state.deadline, state.rollUntil]);
  useEffect(() => {
    if (state.phase === 'last' && armed.current !== null) {
      armed.current = null; sound.current.announce(HOLMES_TIME_UP, lang);
    }
    setDrag(0); gesture.current = null;
  }, [state.phase, state.index, lang]);
  useEffect(() => { if (startRequest > 0 && setup) setAttempt(value => value + 1); }, [startRequest, setup]);
  useEffect(() => { if (setup && attempt && errors.length) feedback.current?.focus({ preventScroll: true }); }, [attempt, setup]);

  const settings = value => dispatch({ type: 'settings', value });
  const selectCategories = names => settings({ category: names.length === availableCategories.length ? ALIAS_ALL : names });
  const updateTeam = (id, update) => settings({ teams: state.teams.map(item => item.id === id ? { ...item, ...update } : item) });
  const addPlayer = (event, id) => {
    event.preventDefault();
    const name = (drafts[id] || '').trim();
    const selected = state.teams.find(item => item.id === id);
    if (!name || !setup) return;
    updateTeam(id, { players: [...selected.players, { id: crypto.randomUUID(), name }] });
    setDrafts(value => ({ ...value, [id]: '' }));
  };
  const start = () => {
    setAttempt(value => value + 1);
    if (errors.length) return;
    settings({ target: Number(target), teams: state.teams.map(item => ({ ...item, name: item.name.trim() })) });
    dispatch({ type: 'start', deck: shuffleAlias(pool) });
  };
  const roll = () => dispatch({ type: 'roll', now: Date.now(), rolls: state.contenders.map(id => ({ id, values: [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)] })) });
  const begin = () => {
    const now = Date.now(); setClock(now); sound.current.unlock(lang); armed.current = now + 60_000;
    dispatch({ type: 'begin', now });
  };
  const answer = (outcome, index = state.index) => {
    const now = Date.now();
    if (state.phase === 'acting' && index === state.index && now < state.deadline) sound.current.unlock(lang);
    dispatch({ type: 'answer', outcome, index, now });
  };
  const reset = () => {
    if (!window.confirm(copy.confirm)) return;
    armed.current = null; setAttempt(0); setDrafts({}); dispatch({ type: 'new' });
  };
  const stopGesture = event => {
    const current = gesture.current;
    gesture.current = null; setDrag(0);
    if (!current || event.pointerId !== current.pointerId || last) return;
    const x = event.clientX - current.x, y = event.clientY - current.y;
    if (Math.abs(x) >= 70 && Math.abs(x) > Math.abs(y) * 1.3) answer(x > 0 ? 'correct' : 'skip', current.index);
  };

 return { copy, key, categories, state, dispatch, categorySelection, pool, availableCategories, selectedCategories, categorySummary, drafts, setDrafts, editingTeam, setEditingTeam, target, setTarget, attempt, setAttempt, storageOk, clock, setClock, drag, setDrag, gesture, feedback, readyPanel, previousPhase, sound, armed, previousAnswers, setup, drawing, team, actor, word, remaining, expired, last, playing, errors, result, lastAnswer, roundCorrect, roundSkipped, settings, selectCategories, updateTeam, addPlayer, start, roll, begin, answer, reset, stopGesture };
}
