import { ArrowLeft, ArrowRight } from 'lucide-react';

export function AliasRound({state,copy,team,actor,remaining,last,drag,gesture,setDrag,stopGesture,word,dispatch,answer}) {
 return <>
            <div className="alias-turn-heading"><div><strong>{team.name}</strong><p>{copy.actor}: {actor?.name}</p></div><div className={'alias-timer' + (remaining <= 10 ? ' is-low' : '')} role="timer" aria-label={remaining + ' ' + copy.seconds}>{remaining}<small>{copy.seconds}</small></div></div>
            <div className={'alias-word-card' + (last ? ' is-last' : '')} style={{ transform: `translateX(${drag}px) rotate(${drag / 20}deg)` }}
              onPointerDown={event => { if (last || event.isPrimary === false || event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, index: state.index }; }}
              onPointerMove={event => { if (gesture.current?.pointerId === event.pointerId && !last) setDrag(Math.max(-100, Math.min(100, event.clientX - gesture.current.x))); }}
              onPointerUp={stopGesture} onPointerCancel={() => { gesture.current = null; setDrag(0); }} onLostPointerCapture={() => { gesture.current = null; setDrag(0); }}>
              {last && <span>{copy.last}</span>}<strong key={state.index}>{word}</strong>
            </div>
            {last ? <div className="alias-last-awards"><p>{copy.lastRule}</p>{state.teams.map(item => <button key={item.id} className="btn" onClick={() => dispatch({ type: 'last', teamId: item.id, index: state.index })}>{item.name} +1</button>)}<button className="btn alias-skip" onClick={() => dispatch({ type: 'last', teamId: null, index: state.index })}>{copy.nobody}</button></div>
              : <div className="alias-swipe-actions"><button className="btn alias-skip" onClick={() => answer('skip')}><ArrowLeft size={20} />{copy.skip} −1</button><button className="btn alias-correct" onClick={() => answer('correct')}>{copy.correct} +1<ArrowRight size={20} /></button></div>}
            <p className="alias-round-score">{copy.roundScore}: {state.correct - state.skipped}</p>
          </>;
}
