import { validateCharadesStart } from "../../utils/startValidation";
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ROUND_MESSAGES } from '../../locales/round.js';
import { CHARADES_COPY, CHARADES_TIME_COPY, CHARADES_RULES } from './translations.js';
import { CHARADES_MODES } from './modes.js';
import { DIFFICULTIES } from '../../utils/difficulty.js';
import { POINTS_BY_DIFFICULTY, validTargetScore } from '../../utils/playerScores.js';
import { readValue, writeValue } from '../../utils/progress.js';
import { ALL_CHARADES_CATEGORIES, charadesGuesserMode, charadesReducer, createCharadesDeck, currentCharadesCard, hasCharadesCard, deckReady, newCharadesState, validCharadesState, restoreCharadesState, charadesPoints, canCompleteRound } from './gameLogic.js';


import { useVersionedReducer } from "../../utils/gameSession.js";

export function useCharadesGame({ games, t, lang, startRequest = 0 }) {
  const copy = { ...(CHARADES_COPY[lang] || CHARADES_COPY.en), ...(CHARADES_TIME_COPY[lang] || CHARADES_TIME_COPY.en) };
  const rules = CHARADES_RULES[lang] || CHARADES_RULES.en;
  const modeCopy = CHARADES_MODES[lang] || CHARADES_MODES.en;
  const key = `nickolasgames-charades-v2-${lang}`;
  const [state, dispatch, storageOk] = useVersionedReducer({
    game: "charades", lang, reducer: charadesReducer,
    validate: value => validCharadesState(value) ? restoreCharadesState(value) : null,
    initialize: () => {
      const saved = readValue(key);
      return validCharadesState(saved) ? restoreCharadesState(saved) : newCharadesState(games.crocodile.c, readValue(`nickolasgames-progress-v1-${lang}-crocodile`));
    }
  });
  const [name, setName] = useState('');
  const [warning, setWarning] = useState('');
  const [targetDraft, setTargetDraft] = useState(String(state.targetScore));
  const [startAttempt,setStartAttempt]=useState(0);
  useEffect(()=>{if(startRequest>0)setStartAttempt(value=>value+1);},[startRequest]);
  const [clock, setClock] = useState(Date.now());
  const sound=useRef(null);if(!sound.current)sound.current=createHolmesTimerSound();
  const armedDeadline=useRef(null);
  const roundPanel = useRef(null);
  const previousPhase = useRef(state.phase);
  useEffect(()=>()=>sound.current.dispose(),[]);
  useEffect(()=>{
    if(state.phase==='acting'&&state.timed&&state.deadline===armedDeadline.current&&clock>=state.deadline){
      armedDeadline.current=null;sound.current.announce(HOLMES_TIME_UP,lang);
    }
  },[state.phase,state.timed,state.deadline,clock,lang]);
  const setup = state.phase === 'setup';
  const guesserMode = charadesGuesserMode(state);
  const drawing = ['dice', 'rolling', 'diceResult'].includes(state.phase);
  const ruleSections = guesserMode ? [...modeCopy.sections.slice(0, 2), ...rules.sections.slice(2, 4), modeCopy.sections[2]] : rules.sections;
  const order = guesserMode ? modeCopy.order : copy.order;
  const actor = state.players.find(p => p.id === state.activeId);
  const card = currentCharadesCard(state);
  const exhausted = !setup && state.phase !== 'finished' && (state.phase === 'exhausted' || !hasCharadesCard(state));
  const readingTime = state.phase === 'confirming' ? state.answeredAt : clock;
  const remaining = state.deadline === null ? 60 : Math.max(0, Math.ceil((state.deadline - readingTime) / 1000));
  const award = charadesPoints(state, readingTime);
  const roundPending = !guesserMode && !setup && !exhausted && state.phase !== 'finished' && state.players.some(player => player.points >= state.targetScore);
  const expired = state.deadline !== null && readingTime >= state.deadline;
  useEffect(() => {
    if ((state.phase === 'dice' && previousPhase.current === 'setup') ||
      (state.phase === 'handoff' && previousPhase.current === 'diceResult')) roundPanel.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    previousPhase.current = state.phase;
  }, [state.phase]);
  useEffect(() => {
    if (state.phase !== 'acting' || !state.timed) return;
    const refresh = () => setClock(Date.now());
    refresh();
    const timer = setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [state.phase, state.deadline, state.timed]);
  useEffect(() => { setTargetDraft(String(state.targetScore)); setWarning(''); }, [state.targetScore, setup]);
  useEffect(() => {
    if (state.phase !== 'rolling') return;
    const tick = () => { const now = Date.now(); setClock(now); dispatch({ type: 'rolled', now }); };
    tick();
    const timer = setInterval(tick, 90);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [state.phase, state.draw?.until]);

  const startErrors=setup&&startAttempt?validateCharadesStart({state,targetDraft,pendingName:name}):[];
  const startGame=()=>{
    setStartAttempt(value=>value+1);
    if(validateCharadesStart({state,targetDraft,pendingName:name}).length)return;
    dispatch({type:'target',value:Number(targetDraft)});
    dispatch({type:'start'});setWarning('');
  };
  const add = event => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || !setup) return;
    if (state.players.some(p => p.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) { setWarning(copy.duplicate); return; }
    dispatch({ type: 'add', player: { id: crypto.randomUUID(), name: clean } });
    setName(''); setWarning('');
  };
  const newGame = () => {
    if (!window.confirm(copy.confirm)) return;
    setStartAttempt(0);
    dispatch({ type: 'new', deck: createCharadesDeck(games.crocodile.c, state.category) });
  };
  const selectWord = level => {
    const now = Date.now(); setClock(now);
    if(state.timed){sound.current.unlock(lang);armedDeadline.current=now+60_000;}
    dispatch({ type: 'select', level, now });
  };
  const markGuessed = () => {
    const now = Date.now(); setClock(now);
    dispatch({ type: 'guess', now });
  };

 return { copy, rules, modeCopy, key, state, dispatch, name, setName, warning, setWarning, targetDraft, setTargetDraft, startAttempt, setStartAttempt, storageOk, clock, setClock, sound, armedDeadline, roundPanel, previousPhase, setup, guesserMode, drawing, ruleSections, order, actor, card, exhausted, readingTime, remaining, award, roundPending, expired, startErrors, startGame, add, newGame, selectWord, markGuessed };
}
