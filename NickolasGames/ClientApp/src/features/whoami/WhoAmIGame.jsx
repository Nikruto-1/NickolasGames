import { WhoAmISecretDialog } from './WhoAmISecretDialog.jsx';
import { WhoAmISetup } from './WhoAmISetup.jsx';
import { WhoAmITimer } from './WhoAmITimer.jsx';
import { GameTabs } from '../../components/GameTabs.jsx';
import './WhoAmIGame.css';

import { useWhoAmIGame } from "./useWhoAmIGame.js";
import { GameRules } from "../../components/GameRules.jsx";
export function WhoAmIGame({games,t,lang,onGame,startRequest=0}) {

 const { copy, rules, pc, key, state, dispatch, name, setName, warning, setWarning, startAttempt, setActiveId, held, setHeld, manual, setManual, running, setRunning, storageOk, sound, dialog, active, pool, add, startErrors, deal, close, restart, answer, keyTrap, closeButton } = useWhoAmIGame({ games, t, lang, startRequest });
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
   {active&&<WhoAmISecretDialog {...{active,dialog,keyTrap,closeButton,close,copy,held,setHeld,answer,pc,state,manual,setManual,setWarning,dispatch,warning}}/>}
 </section>;
}
