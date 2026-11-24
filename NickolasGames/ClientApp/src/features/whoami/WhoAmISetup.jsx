import { StartFeedback } from '../../components/StartFeedback';
import { WHOAMI_ALL, WHOAMI_DIFFICULTIES } from './gameLogic.js';
export function WhoAmISetup({copy,pc,state,dispatch,add,startErrors,name,setName,t,games,startAttempt,lang,deal,pool}){
 return <div className="whoami-setup">
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
     </div>;
}
