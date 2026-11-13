import { StartFeedback } from "../../components/StartFeedback";
import { validateCharadesStart } from "../../utils/startValidation";
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ROUND_MESSAGES } from '../../locales/round.js';
import { CHARADES_COPY, CHARADES_TIME_COPY, CHARADES_RULES } from './translations.js';
import { CHARADES_MODES } from './modes.js';
import { CharadesDraw } from './CharadesDraw.jsx';
import './CharadesGame.css';
import { DIFFICULTIES } from '../../utils/difficulty.js';
import { POINTS_BY_DIFFICULTY, validTargetScore } from '../../utils/playerScores.js';
import { readValue, writeValue } from '../../utils/progress.js';
import { ALL_CHARADES_CATEGORIES, charadesGuesserMode, charadesReducer, createCharadesDeck, currentCharadesCard, hasCharadesCard, deckReady, newCharadesState, validCharadesState, restoreCharadesState, charadesPoints, canCompleteRound } from './gameLogic.js';

import { useCharadesGame } from "./useCharadesGame.js";
import { GameRules } from "../../components/GameRules.jsx";
export function CharadesGame({ games, t, lang, onGame, startRequest=0 }) {

 const { copy, rules, modeCopy, key, state, dispatch, name, setName, warning, setWarning, targetDraft, setTargetDraft, startAttempt, setStartAttempt, storageOk, clock, setClock, sound, armedDeadline, roundPanel, previousPhase, setup, guesserMode, drawing, ruleSections, order, actor, card, exhausted, readingTime, remaining, award, roundPending, expired, startErrors, startGame, add, newGame, selectWord, markGuessed } = useCharadesGame({ games, t, lang, startRequest });
  return <section className="s pv charades-game" id="preview">
    <div className="wrap pvg">
      <div>
        <div className="head" style={{ margin: 0 }}><h2>{guesserMode ? modeCopy.title : copy.title}</h2><p className="charades-description">{guesserMode ? modeCopy.description : rules.description}</p></div>
        <GameRules className="charades-rules" listClassName="charades-rule-sections" label={rules.label} sections={ruleSections} />
        <div className="tabs" role="group" aria-label={t.gameLabel}>
          {['whoami', 'crocodile', 'alias', 'truth'].map(game => <button key={game} className="chip" aria-pressed={game === 'crocodile'} onClick={() => onGame(game)}>{games[game].n}</button>)}
          <button className="chip" onClick={() => onGame('random')}>{t.random}</button>
        </div>
        <div className="players-panel">
          <h3>{copy.players}</h3>
          <fieldset className="charades-mode"><legend>{modeCopy.label}</legend>
            <div>{['ordered', 'guesser'].map(mode => <button type="button" key={mode} className="chip" disabled={!setup} aria-pressed={(state.turnMode || 'ordered') === mode} onClick={() => dispatch({ type: 'turnMode', value: mode })}>{modeCopy[mode]}</button>)}</div>
          </fieldset>
          <p>{order}</p>
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
      <div className="charades-round" ref={roundPanel}>
        {drawing && <CharadesDraw state={state} copy={modeCopy} clock={clock} dispatch={dispatch} />}
        {actor && !drawing && <h3 className="current-player">{copy.active}: <b>{actor.name}</b></h3>}
        {roundPending && <p className="charades-result" role="status">{copy.roundPending}</p>}
        {state.lastResult && <div className="charades-result" role="status">
          {state.lastResult.presenter}: +{state.lastResult.presenterPoints}{state.lastResult.bonus > 0 && <span> ({copy.bonus}: +{state.lastResult.bonus})</span>} · {state.lastResult.guesser}: +{state.lastResult.guesserPoints}
        </div>}
        {state.phase === 'setup' && <div className="charades-card"><p>{order}</p><p>{state.timed ? copy.choose : copy.chooseUntimed}</p></div>}
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
              <p>{guesserMode ? modeCopy.awardHint : copy.awardHint}</p>
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
