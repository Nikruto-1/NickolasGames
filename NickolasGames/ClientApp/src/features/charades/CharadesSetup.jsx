import { StartFeedback } from '../../components/StartFeedback';
import { validTargetScore } from '../../utils/playerScores.js';
import { ALL_CHARADES_CATEGORIES, createCharadesDeck, deckReady, canCompleteRound } from './gameLogic.js';
export function CharadesSetup({copy,modeCopy,state,dispatch,setup,order,add,startErrors,name,setName,setWarning,targetDraft,setTargetDraft,t,games,warning,startAttempt,lang,startGame,newGame,storageOk}){
 return <div className="players-panel">
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
        </div>;
}
