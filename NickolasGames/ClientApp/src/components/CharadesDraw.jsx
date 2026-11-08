import { ArrowRight, Dice5, Trophy } from 'lucide-react';

const pips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

export function CharadesDraw({ state, copy, clock, dispatch }) {
  const draw = state.draw;
  const result = state.phase === 'diceResult';
  const roll = () => dispatch({ type: 'roll', now: Date.now(), rolls: draw.contenders.map(id => ({
    id, values: [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)],
  })) });
  return <div className="charades-draw">
    <header><h3>{result ? copy.results : copy.diceTitle}</h3><p>{copy.diceRule}</p></header>
    {state.phase === 'dice' && draw.results.length > 0 && <p className="charades-draw-tie" role="status">{copy.tie}</p>}
    <div className="charades-draw-players">
      {state.players.map((player, index) => {
        const participating = (state.phase === 'rolling' ? draw.contenders : draw.lastIds).includes(player.id);
        const settled = state.phase === 'rolling' && participating ? draw.pending.find(roll => roll.id === player.id) : draw.results.find(roll => roll.id === player.id);
        const rolling = state.phase === 'rolling' && participating && clock < draw.until - 300;
        const values = rolling ? [Math.floor(clock / 90 + index) % 6 + 1, Math.floor(clock / 130 + index) % 6 + 1] : settled?.values || [0, 0];
        const winner = result && state.activeId === player.id;
        return <article key={player.id} className={'charades-draw-player' + (rolling ? ' is-rolling' : '') + (winner ? ' is-winner' : '')} aria-label={player.name}>
          <h4>{player.name}</h4>
          <div className="charades-dice" aria-hidden="true">{values.map((value, die) => <span className="charades-die" key={die} data-value={value}>
            {pips[value].map(position => <i key={position} style={{ gridRow: Math.floor(position / 3) + 1, gridColumn: position % 3 + 1 }} />)}
          </span>)}</div>
          <output className="charades-draw-score">{rolling ? copy.rolling : settled ? values.join(' + ') + ' = ' + (values[0] + values[1]) : '—'}</output>
          {settled && !participating && <small>{copy.previous}</small>}
        </article>;
      })}
    </div>
    <footer>
      {result ? <>
        <div className="charades-draw-winner" role="status"><Trophy size={24} aria-hidden="true" /><div>{copy.first}<strong>{state.players.find(player => player.id === state.activeId)?.name}</strong></div></div>
        <button className="btn pri" onClick={() => dispatch({ type: 'confirmDice' })}>{copy.continue}<ArrowRight size={20} aria-hidden="true" /></button>
      </> : <button className="btn pri" disabled={state.phase === 'rolling'} onClick={roll}><Dice5 size={20} aria-hidden="true" />{state.phase === 'rolling' ? copy.rolling : copy.roll}</button>}
    </footer>
  </div>;
}
