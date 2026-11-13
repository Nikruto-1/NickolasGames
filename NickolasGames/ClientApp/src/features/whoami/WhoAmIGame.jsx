import { StartFeedback } from "../../components/StartFeedback";
import { validateWhoamiStart } from "../../utils/startValidation";
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createHolmesTimerSound } from '../../utils/holmesTimerSound.js';
import { WHOAMI_UI, WHOAMI_RULES } from './translations.js';
import { PLAYER_SETUP } from '../../locales/index.js';
import { readValue, readProgress, writeValue } from '../../utils/progress.js';
import { initialWhoami, restoreWhoamiCategory, validWhoami, WHOAMI_ALL, WHOAMI_DIFFICULTIES, whoamiPool, whoamiReducer } from './gameLogic.js';
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
     <div className="tabs" role="group" aria-label={t.gameLabel}>{['whoami','crocodile','alias','truth'].map(game=><button className="chip" key={game} aria-pressed={game==='whoami'} onClick={()=>onGame(game)}>{games[game].n}</button>)}</div>
     {state.phase==='setup'&&<div className="whoami-setup">
       <div className="players-panel">
         <h3>{copy.players}</h3>
         <form onSubmit={add}><label className="players-label" htmlFor="whoami-name">{copy.name}</label><div className="player-add"><input id="whoami-name" aria-invalid={startErrors.includes("whoamiPlayers")||startErrors.includes("pendingPlayer")} aria-describedby={startErrors.length?"start-validation":undefined} placeholder={copy.placeholder} maxLength={60} value={name} onChange={event=>setName(event.target.value)}/><button className="btn sm" disabled={!name.trim()}>{copy.add} +</button></div></form>
         <ul className="player-score-list">{state.players.map(player=><li key={player.id}><span className="player-name">{player.name}</span><button className="player-remove" aria-label={`${copy.remove}: ${player.name}`} onClick={()=>dispatch({type:'remove',id:player.id})}>×</button></li>)}</ul>
       </div>
       <div className="players-panel">
         <label className="players-label" htmlFor="whoami-category">{t.categoryLabel}</label>
         <select id="whoami-category" className="charades-category" value={state.category} onChange={event=>dispatch({type:'config',values:{category:event.target.value}})}><option value={WHOAMI_ALL}>{t.allCategories}</option>{Object.keys(games.whoami.c).map(cat=><option key={cat}>{cat}</option>)}</select>
         <div className="difficulty" role="group" aria-label={t.difficultyLabel}><span>{t.difficultyLabel}</span>{WHOAMI_DIFFICULTIES.map(level=><button className="chip" key={level} aria-pressed={state.difficulty===level} onClick={()=>dispatch({type:'config',values:{difficulty:level}})}>{level==='all'?copy.allLevels:t.difficulty[level]}</button>)}</div>
         <details className="whoami-advanced"><summary>{copy.advanced}</summary>
           <label className="players-label" htmlFor="whoami-custom">{pc.customLabel}</label><textarea id="whoami-custom" value={state.customWords} placeholder={pc.customPlaceholder} onChange={event=>dispatch({type:'config',values:{customWords:event.target.value}})}/>
           <p className="players-note">{pc.customHint}</p><label className="only-custom"><input type="checkbox" checked={state.customOnly} onChange={event=>dispatch({type:'config',values:{customOnly:event.target.checked}})}/>{pc.onlyCustom}</label>
           <label className="only-custom"><input type="checkbox" checked={state.timerEnabled} onChange={event=>dispatch({type:'config',values:{timerEnabled:event.target.checked}})}/>{copy.timer}</label>
           {state.timerEnabled&&<><label className="players-label" htmlFor="whoami-duration">{t.timerDuration}</label><input id="whoami-duration" className="whoami-input" type="number" min="10" max="600" value={state.duration} onChange={event=>{const duration=Math.max(10,Math.min(600,Math.trunc(Number(event.target.value)||10)));dispatch({type:'config',values:{duration,left:duration}});}}/></>}
         </details>
       </div>
       <div className="whoami-start"><StartFeedback errors={startErrors} attempt={startAttempt} lang={lang} /><button className="btn pri" onClick={deal}>{copy.start}</button>{pool.length<state.players.length&&<p role="status">{pc.notEnough}</p>}</div>
     </div>}
     {state.phase==='game'&&<>
       <p className="whoami-privacy">{copy.privacy}</p>
       {state.timerEnabled&&<div className="timer"><b>{state.left}</b><div className="tbar"><i style={{transform:`scaleX(${state.left/state.duration})`}}/></div><button className="btn sm" disabled={!state.left} onClick={()=>{if(!running)sound.current.unlock(lang);setRunning(value=>!value);}}>{running?copy.pause:t.startTimer}</button><button className="btn sm" onClick={()=>{setRunning(false);dispatch({type:'resetTimer'});}}>{t.reset}</button></div>}
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
