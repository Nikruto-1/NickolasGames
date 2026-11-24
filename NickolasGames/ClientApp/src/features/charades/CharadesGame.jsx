import { CharadesSetup } from './CharadesSetup.jsx';
import { GameTabs } from '../../components/GameTabs.jsx';
import { TIMER_RESUME_COPY } from "../../locales/round.js";
import { ROUND_MESSAGES } from '../../locales/round.js';
import { CharadesDraw } from './CharadesDraw.jsx';
import './CharadesGame.css';
import { DIFFICULTIES } from '../../utils/difficulty.js';
import { POINTS_BY_DIFFICULTY } from '../../utils/playerScores.js';
import { hasCharadesCard } from './gameLogic.js';

import { useCharadesGame } from "./useCharadesGame.js";
import { GameRules } from "../../components/GameRules.jsx";
export function CharadesGame({ games, t, lang, onGame, startRequest=0 }) {

 const { needsAudio, restoreAudio, copy, rules, modeCopy, key, state, dispatch, name, setName, warning, setWarning, targetDraft, setTargetDraft, startAttempt, setStartAttempt, storageOk, clock, setClock, sound, armedDeadline, roundPanel, previousPhase, setup, guesserMode, drawing, ruleSections, order, actor, card, exhausted, readingTime, remaining, award, roundPending, expired, startErrors, startGame, add, newGame, selectWord, markGuessed } = useCharadesGame({ games, t, lang, startRequest });
  return <section className="s pv charades-game" id="preview">
    <div className="wrap pvg">
      <div>
        <div className="head" style={{ margin: 0 }}><h2>{guesserMode ? modeCopy.title : copy.title}</h2><p className="charades-description">{guesserMode ? modeCopy.description : rules.description}</p></div>
        <GameRules className="charades-rules" listClassName="charades-rule-sections" label={rules.label} sections={ruleSections} />
        <GameTabs active="crocodile" games={games} t={t} onChoose={onGame} showRandom />
        {!setup && <details className="charades-settings"><summary>{copy.players}</summary>
          <ul>{state.players.map(player=><li key={player.id}>{player.name}: {player.points} / {state.targetScore}</li>)}</ul>
          <button className="btn sm" onClick={newGame}>{copy.newGame}</button>
          <p className="players-note" role="status">{storageOk ? (state.timed ? copy.saved : copy.savedUntimed) : copy.failed}</p>
        </details>}
        {setup && <CharadesSetup {...{copy,modeCopy,state,dispatch,setup,order,add,startErrors,name,setName,setWarning,targetDraft,setTargetDraft,t,games,warning,startAttempt,lang,startGame,newGame,storageOk}}/>}
      </div>
      <div className="charades-round" ref={roundPanel}>
        {needsAudio && <button type="button" className="btn sm" onClick={restoreAudio}>{TIMER_RESUME_COPY[lang] || TIMER_RESUME_COPY.en}</button>}
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
