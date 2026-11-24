import { Check, Trophy, ArrowRight, Dice5 } from 'lucide-react';
import { AliasDie } from './AliasDie.jsx';

export function AliasDiceStage({state,copy,clock,team,dispatch,roll}) {
 return <div className="alias-dice-stage">
            <header className="alias-dice-heading"><h3>{state.phase === 'diceResult' ? copy.diceResults : copy.diceTitle}</h3><p>{copy.diceRule}</p></header>
            {state.phase === 'dice' && state.dice.length > 0 && <p className="alias-dice-tie" role="status">{copy.tie}</p>}
            <div className="alias-dice-teams">{state.teams.map((item, index) => {
              const previous = state.dice.find(result => result.id === item.id);
              const participating = state.phase === 'rolling' ? state.contenders.includes(item.id) : (state.lastRollTeamIds || state.dice.map(roll => roll.id)).includes(item.id);
              const rolling = state.phase === 'rolling' && participating && clock < state.rollUntil - 300;
              const settled = state.phase === 'rolling' && participating ? state.pending.find(roll => roll.id === item.id) : previous;
              const values = rolling ? [Math.floor(clock / 90 + index) % 6 + 1, Math.floor(clock / 130 + index) % 6 + 1] : settled?.values || [1, 1];
              const winner = state.phase === 'diceResult' && index === state.activeIndex;
              return <div className={'alias-dice-team' + (rolling ? ' is-rolling' : '') + (winner ? ' is-winner' : '')} key={item.id} role="group" aria-label={item.name}>
                <div className="alias-dice-team-heading"><h4>{item.name}</h4>{winner && <Check size={22} aria-hidden="true" />}</div>
                <div className="alias-dice-pair" aria-hidden="true">{values.map((value, die) => <AliasDie key={die} value={rolling || settled ? value : 0} />)}</div>
                <div className="alias-dice-score"><strong aria-hidden="true">{rolling ? '…' : settled ? values[0] + values[1] : '—'}</strong><output>{rolling ? copy.rolling : settled ? values[0] + ' + ' + values[1] + ' = ' + values.reduce((a, b) => a + b, 0) : '—'}</output></div>
                {previous && !participating && <small className="alias-previous-roll">{copy.previousRoll}</small>}
              </div>;
            })}</div>
            {state.phase === 'diceResult' ? <div className="alias-dice-footer">
              <div className="alias-dice-result" role="status"><Trophy size={26} aria-hidden="true" /><div><span>{copy.first}</span><strong>{team.name}</strong></div></div>
              <button className="btn pri alias-main-action" onClick={() => dispatch({ type: 'confirmDice' })}>{copy.continueDice}<ArrowRight size={20} /></button>
            </div> : <div className="alias-dice-footer alias-dice-roll-action"><button className="btn pri alias-main-action" disabled={state.phase === 'rolling'} onClick={roll}><Dice5 size={20} /> {state.phase === 'rolling' ? copy.rolling : copy.roll}</button></div>}
          </div>;
}
