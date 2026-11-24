import { WhoAmISetup } from './WhoAmISetup.jsx';
import { whoamiReducer } from './gameLogic.js';
import { WhoAmITimer } from './WhoAmITimer.jsx';
import { GameTabs } from '../../components/GameTabs.jsx';
import './WhoAmIGame.css';

import { useWhoAmIGame } from "./useWhoAmIGame.js";
import { GameRules } from "../../components/GameRules.jsx";
export function WhoAmIGame({games,t,lang,onGame,startRequest=0}) {

 const { copy, rules, pc, key, state, dispatch, name, setName, warning, setWarning, startAttempt, setStartAttempt, activeId, setActiveId, held, setHeld, manual, setManual, running, setRunning, storageOk, sound, previousLeft, dialog, active, pool, add, startErrors, deal, close, restart, answer, keyTrap, closeButton } = useWhoAmIGame({ games, t, lang, startRequest });
 return <section className="s pv whoami-game" id="preview">
   <div className="wrap" inert={active?true:undefined}>
     <div className="whoami-heading"><div><h2>{copy.title}</h2><p className={state.phase==='setup'?'whoami-description':undefined}>{state.phase==='setup'?rules.description:state.phase==='summary'?copy.summary:copy.savedGame}</p></div>
       {state.phase==='game'&&<button className="btn sm" onClick={()=>{setRunning(false);dispatch({type:'finish'});}}>{copy.finish}</button>}
     </div>
     <GameRules className="whoami-rules" listClassName="whoami-rule-sections" label={rules.label} sections={rules.sections} />
     <GameTabs active="whoami" games={games} t={t} onChoose={onGame} />
     {state.phase==='setup' && <WhoAmISetup {...{copy,pc,state,dispatch,add,startErrors,name,setName,t,games,startAttempt,lang,deal,pool}}/>}
     {state.phase==='game'&&<>
       <p className="whoami-privacy">{copy.privacy}</p>
       {state.timerEnabled&&<WhoAmITimer remaining={state.left} duration={state.duration} running={running} copy={copy} t={t} onToggle={()=>{if(!running)sound.current.unlock(lang);setRunning(value=>!value);}} onReset={()=>{setRunning(false);dispatch({type:'resetTimer'});}}/>}
       <div className="whoami-tiles">{state.players.map((player,index)=><button className="whoami-tile" key={player.id} onClick={()=>setActiveId(player.id)} aria-label={`${copy.open}: ${player.name}`}>
         <span className="whoami-avatar">{index+1}</span><strong>{player.name}</strong><span className="whoami-status">{!player.word?copy.empty:player.lastOutcome==='guessed'?pc.guessed:player.lastOutcome==='gaveUp'?pc.giveUp:copy.hidden}</span>
         <span className="whoami-tile-count">{t.guessed}: {player.guessed} · {t.skipped}: {player.skipped}</span><span className="whoami-open">{copy.open} →</span>
       </button>)}</div>
     </>}
     {state.phase==='summary'&&<div className="players-panel whoami-summary"><h3>{copy.total}: {state.players.reduce((sum,p)=>sum+p.guessed,0)}</h3>
       <table><thead><tr><th>{copy.name}</th><th>{t.guessed}</th><th>{t.skipped}</th></tr></thead><tbody>{[...state.players].sort((a,b)=>b.guessed-a.guessed).map(p=><tr key={p.id}><td>{p.name}</td><td>{p.guessed}</td><td>{p.skipped}</td></tr>)}</tbody></table>
       <div className="players-actions"><button className="btn pri" onClick={()=>restart()}>{copy.again}</button><button className="btn" onClick={()=>restart(true)}>{copy.settings}</button><button className="btn" onClick={()=>dispatch({type:'resume'})}>{copy.resume}</button></div>
     </div>}
     {warning&&!active&&<p role="alert">{warning}</p>}<p className="players-note" role="status">{storageOk?copy.saved:copy.failed}</p>
   </div>
   {active&&<div className="whoami-overlay" role="dialog" aria-modal="true" aria-labelledby="whoami-dialog-title" ref={dialog} onKeyDown={keyTrap}>
     <header className="whoami-dialog-head"><h2 id="whoami-dialog-title">{active.name}</h2><button ref={closeButton} className="btn sm" onClick={close}>{copy.close} ×</button></header>
     <p className="whoami-privacy">{copy.privacy}</p>
     <div className={`whoami-big-word${held?' is-shown':''}`} aria-live="polite">{active.word?(held?active.word:copy.hidden):copy.empty}</div>
     <button className="btn pri whoami-hold" disabled={!active.word} onPointerDown={event=>{if(event.button!==0&&event.pointerType!=='touch')return;setHeld(true);event.currentTarget.setPointerCapture?.(event.pointerId);}} onPointerUp={()=>setHeld(false)} onPointerCancel={()=>setHeld(false)} onPointerLeave={()=>setHeld(false)} onBlur={()=>setHeld(false)} onKeyDown={event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();setHeld(true);}}} onKeyUp={event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();setHeld(false);}}}>{copy.hold}</button>
     <div className="whoami-card-actions"><button className="btn pri" disabled={!active.word} onClick={()=>answer('guessed')}>{pc.guessed}</button><button className="btn" disabled={!active.word} onClick={()=>answer('gaveUp')}>{pc.giveUp}</button></div>
     <details className="whoami-advanced"><summary>{copy.manual}</summary><form onSubmit={event=>{event.preventDefault();setHeld(false);const next=whoamiReducer(state,{type:'manual',id:active.id,word:manual});if(next===state){setWarning(pc.manualDuplicate);return;}dispatch({type:'manual',id:active.id,word:manual});close();}}><label className="players-label" htmlFor="whoami-manual">{pc.manualLabel}</label><div className="player-add"><input id="whoami-manual" value={manual} placeholder={pc.manualPlaceholder} onChange={event=>setManual(event.target.value)}/><button className="btn sm" disabled={!manual.trim()}>{pc.manualAssign}</button></div></form>{warning&&<p role="alert">{warning}</p>}</details>
   </div>}
 </section>;
}
