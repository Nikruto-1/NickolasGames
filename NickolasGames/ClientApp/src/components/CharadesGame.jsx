import { StartFeedback } from "./StartFeedback";
import { validateCharadesStart } from "../utils/startValidation";
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../utils/holmesTimerSound.js';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ROUND_MESSAGES } from '../locales/round.js';
import { CHARADES_COPY, CHARADES_TIME_COPY, CHARADES_RULES } from '../locales/charades.js';
import './CharadesGame.css';
import { DIFFICULTIES } from '../utils/difficulty.js';
import { POINTS_BY_DIFFICULTY, validTargetScore } from '../utils/playerScores.js';
import { readValue, writeValue } from '../utils/progress.js';
import { ALL_CHARADES_CATEGORIES, charadesReducer, createCharadesDeck, currentCharadesCard, hasCharadesCard, deckReady, newCharadesState, validCharadesState, restoreCharadesState, charadesPoints, canCompleteRound } from '../utils/charades.js';

export function CharadesGame({ games, t, lang, onGame, startRequest=0 }) {
  const copy = { ...(CHARADES_COPY[lang] || CHARADES_COPY.en), ...(CHARADES_TIME_COPY[lang] || CHARADES_TIME_COPY.en) };
  const rules = CHARADES_RULES[lang] || CHARADES_RULES.en;
  const key = `nickolasgames-charades-v2-${lang}`;
  const [state, dispatch] = useReducer(charadesReducer, null, () => {
    const saved = readValue(key);
    return validCharadesState(saved) ? restoreCharadesState(saved) : newCharadesState(games.crocodile.c, readValue(`nickolasgames-progress-v1-${lang}-crocodile`));
  });
  const [name, setName] = useState('');
  const [warning, setWarning] = useState('');
  const [targetDraft, setTargetDraft] = useState(String(state.targetScore));
  const [startAttempt,setStartAttempt]=useState(0);
  useEffect(()=>{if(startRequest>0)setStartAttempt(value=>value+1);},[startRequest]);
  const [storageOk, setStorageOk] = useState(true);
  const [clock, setClock] = useState(Date.now());
  const sound=useRef(null);if(!sound.current)sound.current=createHolmesTimerSound();
  const armedDeadline=useRef(null);
  useEffect(()=>()=>sound.current.dispose(),[]);
  useEffect(()=>{
    if(state.phase==='acting'&&state.timed&&state.deadline===armedDeadline.current&&clock>=state.deadline){
      armedDeadline.current=null;sound.current.announce(HOLMES_TIME_UP,lang);
    }
  },[state.phase,state.timed,state.deadline,clock,lang]);
  const setup = state.phase === 'setup';
  const actor = state.players.find(p => p.id === state.activeId);
  const card = currentCharadesCard(state);
  const exhausted = !setup && state.phase !== 'finished' && (state.phase === 'exhausted' || !hasCharadesCard(state));
  const readingTime = state.phase === 'confirming' ? state.answeredAt : clock;
  const remaining = state.deadline === null ? 60 : Math.max(0, Math.ceil((state.deadline - readingTime) / 1000));
  const award = charadesPoints(state, readingTime);
  const roundPending = !setup && !exhausted && state.phase !== 'finished' && state.players.some(player => player.points >= state.targetScore);
  const expired = state.deadline !== null && readingTime >= state.deadline;
  useEffect(() => { setStorageOk(writeValue(key, state)); }, [key, state]);
  useEffect(() => {
    if (state.phase !== 'acting' || !state.timed) return;
    const refresh = () => setClock(Date.now());
    refresh();
    const timer = setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [state.phase, state.deadline, state.timed]);
  useEffect(() => { setTargetDraft(String(state.targetScore)); setWarning(''); }, [state.targetScore, setup]);

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

  return <section className="s pv charades-game" id="preview">
    <div className="wrap pvg">
      <div>
        <div className="head" style={{ margin: 0 }}><h2>{copy.title}</h2><p className="charades-description">{rules.description}</p></div>
        <details className="charades-rules">
          <summary>{rules.label}</summary>
          <ol className="charades-rule-sections">
            {rules.sections.map(section => <li key={section.title}>
              <h3>{section.title}</h3>
              <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>
            </li>)}
          </ol>
        </details>
        <div className="tabs" role="group" aria-label={t.gameLabel}>
          {['whoami', 'crocodile', 'alias', 'truth'].map(game => <button key={game} className="chip" aria-pressed={game === 'crocodile'} onClick={() => onGame(game)}>{games[game].n}</button>)}
          <button className="chip" onClick={() => onGame('random')}>{t.random}</button>
        </div>
        <div className="players-panel">
          <h3>{copy.players}</h3>
          <p>{copy.order}</p>
          <div className="difficulty" role="group" aria-label={copy.timeMode}>
            <span>{copy.timeMode}</span>
            <button className="chip" disabled={!setup} aria-pressed={state.timed} onClick={() => dispatch({ type: 'timing', timed: true })}>{copy.minute}</button>
            <button className="chip" disabled={!setup} aria-pressed={!state.timed} onClick={() => dispatch({ type: 'timing', timed: false })}>{copy.noTime}</button>
          </div>
          <form onSubmit={add}>
            <label className="players-label" htmlFor="score-player-name">{copy.name}</label>
            <div className="player-add">
              <input id="score-player-name" aria-invalid={startErrors.includes("charadesPlayers")||startErrors.includes("pendingPlayer")} aria-describedby={startErrors.length?"start-validation":undefined} maxLength={60} value={name} disabled={!setup} onChange={event => { setName(event.target.value); setWarning(''); }} />
              <button className="btn sm" disabled={!setup || !name.trim()}>{copy.add}</button>
            </div>
          </form>
          <ul className="player-score-list">
            {state.players.map(player => <li key={player.id}>
              <span className={`player-name${player.id === state.activeId ? ' is-active' : ''}`} aria-current={player.id === state.activeId ? 'true' : undefined}>{player.name}<small className="player-turns">{copy.turns}: {player.presented}</small></span>
              <span><b>{player.points}</b> / {state.targetScore}</span>
              {setup && <button className="player-remove" aria-label={`${copy.remove}: ${player.name}`} onClick={() => dispatch({ type: 'remove', id: player.id })}>×</button>}
            </li>)}
          </ul>
          <form onSubmit={event => {
            event.preventDefault();
            const value = Number(targetDraft);
            if (!validTargetScore(value)) { setWarning(copy.invalidTarget); return; }
            dispatch({ type: 'target', value }); setWarning('');
          }}>
            <label className="players-label" htmlFor="target-score">{copy.target}</label>
            <div className="player-add">
              <input id="target-score" aria-invalid={startErrors.includes("invalidTarget")} aria-describedby={startErrors.includes("invalidTarget")?"start-validation":undefined} type="number" min="1" max="1000" step="1" value={targetDraft} disabled={!setup} onChange={event => setTargetDraft(event.target.value)} />
              <button className="btn sm" disabled={!setup}>{copy.apply}</button>
            </div>
            {!setup && <p className="players-note">{copy.locked}</p>}
          </form>
          <label className="players-label" htmlFor="charades-category">{t.categoryLabel}</label>
          <select id="charades-category" className="charades-category" disabled={!setup} value={state.category} onChange={event => dispatch({ type: 'category', category: event.target.value, deck: createCharadesDeck(games.crocodile.c, event.target.value) })}>
            <option value={ALL_CHARADES_CATEGORIES}>{t.allCategories}</option>
            {Object.keys(games.crocodile.c).map(category => <option key={category} value={category}>{category}</option>)}
          </select>
          {!deckReady(state.deck) && <p role="status">{copy.noLevels}</p>}
          {setup && deckReady(state.deck) && state.players.length >= 2 && !canCompleteRound(state) && <p role="status">{copy.noRound}</p>}
          {warning && <p role="alert">{warning}</p>}
          <StartFeedback errors={startErrors} attempt={startAttempt} lang={lang} />
          <div className="players-actions">
            {setup && <button className="btn pri" onClick={startGame}>{copy.start}</button>}
            <button className="btn sm" onClick={newGame}>{copy.newGame}</button>
          </div>
          <p className="players-note" role="status">{storageOk ? (state.timed ? copy.saved : copy.savedUntimed) : copy.failed}</p>
        </div>
      </div>
      <div className="charades-round">
        {actor && <h3 className="current-player">{copy.active}: <b>{actor.name}</b></h3>}
        {roundPending && <p className="charades-result" role="status">{copy.roundPending}</p>}
        {state.lastResult && <div className="charades-result" role="status">
          {state.lastResult.presenter}: +{state.lastResult.presenterPoints}{state.lastResult.bonus > 0 && <span> ({copy.bonus}: +{state.lastResult.bonus})</span>} · {state.lastResult.guesser}: +{state.lastResult.guesserPoints}
        </div>}
        {state.phase === 'setup' && <div className="charades-card"><p>{copy.order}</p><p>{state.timed ? copy.choose : copy.chooseUntimed}</p></div>}
        {!exhausted && state.phase === 'handoff' && <div className="charades-card">
          <p>{copy.handoff}</p>
          <button className="btn pri" onClick={() => dispatch({ type: 'reveal' })}>{copy.reveal}</button>
        </div>}
        {!exhausted && state.phase === 'choosing' && <div className="charades-card">
          <p>{state.timed ? copy.choose : copy.chooseUntimed}</p>
          <div className="charades-choices">
            {DIFFICULTIES.map(level => <button key={level} className={`charades-option ${level}`} onClick={() => selectWord(level)}>
              <small>{t.difficulty[level]} · +{POINTS_BY_DIFFICULTY[level]}</small>
              <strong>{card[level]}</strong>
            </button>)}
          </div>
        </div>}
        {!exhausted && ['acting', 'confirming'].includes(state.phase) && <>
          {state.timed ? <div className="timer" role="timer" aria-label={copy.countdown}>
            <b>{remaining}</b><div className="tbar"><i style={{ transform: `scaleX(${remaining / 60})` }} /></div>
          </div> : <p className="players-note">{copy.noTime}</p>}
          {expired && <p className="charades-overtime" role="status">{copy.overtime}</p>}
          <div className="charades-card">
            <small>{t.difficulty[state.selected]} · +{POINTS_BY_DIFFICULTY[state.selected]}</small>
            <div className="charades-word">{card[state.selected]}</div>
            {state.phase === 'acting' && <div className="players-actions">
              <button className="btn pri" onClick={markGuessed}>{copy.guessed}</button>
              <button className="btn" onClick={() => dispatch({ type: 'skip' })}>{copy.skip}</button>
            </div>}
            {state.phase === 'confirming' && <div className="charades-guesser">
              <h3>{copy.whoGuessed}</h3>
              <p>{expired ? copy.late : (state.timed ? copy.timed : copy.equalPoints).replace('{points}', award.guesserPoints).replace('{actorPoints}', award.presenterPoints).replace('{bonus}', award.bonus)}</p>
              <p>{copy.awardHint}</p>
              <div className="players-actions">
                {state.players.filter(p => p.id !== state.activeId).map(player => <button className="btn pri" key={player.id} onClick={() => dispatch({ type: 'award', id: player.id })}>{player.name} +{POINTS_BY_DIFFICULTY[state.selected]}</button>)}
              </div>
              <button className="btn sm" onClick={() => dispatch({ type: 'cancelGuess' })}>{copy.cancel}</button>
            </div>}
          </div>
        </>}
        {exhausted && <div className="charades-card" role="status">
          <p>{hasCharadesCard(state) ? copy.fairExhausted : (ROUND_MESSAGES[lang] || ROUND_MESSAGES.en).exhausted}</p>
          <button className="btn pri" onClick={newGame}>{copy.newGame}</button>
        </div>}
        {state.phase === 'finished' && <div className="winner-banner" role="status">
          <h3>🏆 {copy.winner}: {state.winners.map(id => state.players.find(p => p.id === id).name).join(', ')}</h3>
          <p>{copy.finish}</p>
          <button className="btn pri" onClick={newGame}>{copy.newGame}</button>
        </div>}
      </div>
    </div>
  </section>;
}
