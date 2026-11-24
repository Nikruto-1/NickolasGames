import { useEffect, useRef, useState } from 'react';
import '../whoami/WhoAmIGame.css';
import './SpyGame.css';
import { SpyGuess } from './SpyGuess.jsx';
import { SPY_STORAGE_KEY as storageKey, restoreSpySession as restore } from './session.js';
import { spyWinsVote, spyScores } from './rules.js';
import { locationsFor, SPY_LOCATIONS, categoryOf, locationPool, drawLocation, guessOptions, matchesLocationGuess } from './locations.js';
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';

import { words, extra, designCopy, setupCopy, optionCopy, modeCopy, guessCopy, manualCopy } from './translations.js';
export { SPY_CATALOG } from './translations.js';

export function SpyGame({lang}) {
 const [saved]=useState(restore);
 const w=words[lang]||words.en;
 const d=designCopy[lang]||designCopy.en;
 const [storageOk,setStorageOk]=useState(true);
 const locations=locationsFor(lang);
 const q=setupCopy[lang]||setupCopy.en;
 const [players,setPlayers]=useState(saved.players??[]);
 const [name,setName]=useState('');
 const m=modeCopy[lang]||modeCopy.en;
 const g=guessCopy[lang]||guessCopy.en;
 const manual=manualCopy[lang]||manualCopy.en;
 const [guessMethod,setGuessMethod]=useState(['typed','choices'].includes(saved.guessMethod)?saved.guessMethod:'manual');
 const [guessResult,setGuessResult]=useState(typeof saved.guessResult==='boolean'?saved.guessResult:null);
 const [mode,setMode]=useState(saved.mode==='free'?'free':'classic');
 const free=mode==='free';
 const [timeUp,setTimeUp]=useState(saved.timeUp===true);
 const [round,setRound]=useState(()=>{
   if(!saved.round)return null;
   const r=saved.round,correct=r.location-9;
   const candidates=locationPool(saved.category||0);
   const options=Array.isArray(r.guessOptions)&&r.guessOptions.length===4&&new Set(r.guessOptions).size===4&&r.guessOptions.includes(correct)&&r.guessOptions.every(i=>candidates.includes(i))?r.guessOptions:guessOptions(correct,candidates);
   return {...r,guessOptions:options};
 });
 const [step,setStep]=useState(saved.step??0);
 const [shown,setShown]=useState(false);
 const [finished,setFinished]=useState(saved.finished??false);
 const x=extra[lang]||extra.en;
 const [duration,setDuration]=useState(saved.duration??5);
 const [roundLimit,setRoundLimit]=useState([1,3,5,10].includes(saved.roundLimit)?saved.roundLimit:5);
 const [roundNumber,setRoundNumber]=useState(saved.roundNumber||0);
 const o=optionCopy[lang]||optionCopy.en;
 const [category,setCategory]=useState([0,1,2,3,4,5,6].includes(saved.category)?saved.category:0);
 const [hint,setHint]=useState(saved.hint===true);
 const [roles,setRoles]=useState(saved.roles===true);
 const [locationHistory,setLocationHistory]=useState(()=>Array.isArray(saved.locationHistory)?saved.locationHistory.filter(i=>Number.isInteger(i)&&i>=0&&i<SPY_LOCATIONS.length):saved.round?[saved.round.location-9]:[]);
 const pool=locationPool(category);
 const [deadline,setDeadline]=useState(saved.deadline??null);
 const [clock,setClock]=useState(Date.now());
 const [phase,setPhase]=useState(saved.phase??'discussion');
 const [votes,setVotes]=useState(saved.votes??[]);
 const [choice,setChoice]=useState('');
 const [winner,setWinner]=useState(saved.winner??null);
 const [scores,setScores]=useState(saved.scores??{});
 useEffect(()=>{
 try{localStorage.setItem(storageKey,JSON.stringify({players,round,step,finished,duration,deadline,phase,votes,winner,scores,roundLimit,roundNumber,category,hint,roles,locationHistory,mode,timeUp,guessMethod,guessResult}));setStorageOk(true);}catch{setStorageOk(false);}
 },[players,round,step,finished,duration,deadline,phase,votes,winner,scores,roundLimit,roundNumber,category,hint,roles,locationHistory,mode,timeUp,guessMethod,guessResult]);
 const guard=useRef(false);
 const armedDeadline=useRef(null);
 const announcedDeadline=useRef(null);
 const [audioReady,setAudioReady]=useState(false);
 const sound=useRef(null);
 if(!sound.current)sound.current=createHolmesTimerSound();
 useEffect(()=>()=>sound.current.dispose(),[]);
 useEffect(()=>{
   if(!deadline||phase!=='discussion'||finished)return;
   const tick=()=>setClock(Date.now());tick();
   const id=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
   return()=>{clearInterval(id);document.removeEventListener('visibilitychange',tick);};
 },[deadline,phase,finished]);
 useEffect(()=>{
   if(deadline&&clock>=deadline&&phase==='discussion'&&!finished){
     if(announcedDeadline.current===deadline)return;
     announcedDeadline.current=deadline;
     if(armedDeadline.current===deadline)sound.current.announce(HOLMES_TIME_UP,lang);
     setChoice('');setDeadline(null);if(free)setTimeUp(true);else setPhase('vote');
   }
 },[deadline,clock,phase,finished,lang,free]);
 function end(spyWins){
   if(guard.current||finished||!round)return;guard.current=true;
   setWinner(spyWins);setFinished(true);setDeadline(null);
   if(!free)setScores(old=>spyScores(players,old,round.spy,spyWins));
 }
 function confirmManual(correct){
   if(guessMethod!=='manual'||phase!=='guess'||finished||guard.current)return;
   setGuessResult(correct);end(correct);
 }
 function submitGuess(e){
   e.preventDefault();if(guessMethod==='manual'||guard.current||finished||phase!=='guess'||!choice.trim())return;
   if(guessMethod==='choices'&&!round.guessOptions.includes(Number(choice)))return;
   const correct=guessMethod==='typed'?matchesLocationGuess(choice,round.location-9,lang):Number(choice)===round.location-9;
   setGuessResult(correct);end(correct);
 }
 function vote(){
   if(!choice||guard.current||finished||phase!=='vote'||votes.length>=players.length||!players.some((p,i)=>p.id===choice&&i!==votes.length))return;guard.current=true;
   const next=[...votes,choice];setVotes(next);setChoice('');
   if(next.length===players.length){
     guard.current=false;end(spyWinsVote(players,next,round.spy));
   }
 }
 useEffect(()=>{guard.current=false;},[step,shown,votes.length,phase,round,finished]);
 useEffect(()=>{const hide=()=>{if(document.hidden)setShown(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 const clean=name.trim();
 const duplicate=players.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase());
 function add(e){e.preventDefault();if(!clean||duplicate||players.length>=20)return;setPlayers(old=>old.length>=20||old.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase())?old:[...old,{id:crypto.randomUUID(),name:clean}]);setName('');}
 function start(skip=false){if(players.length<3||clean||guard.current||(round&&((!finished&&!(free&&skip===true))||(!free&&roundNumber>=roundLimit))))return;guard.current=true;setRoundNumber(n=>n+1);setTimeUp(false);setAudioReady(false);armedDeadline.current=null;announcedDeadline.current=null;const drawn=drawLocation(pool,locationHistory);setLocationHistory(drawn.history);const roleOrder=Array.from({length:19},(_,i)=>i);for(let i=roleOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[roleOrder[i],roleOrder[j]]=[roleOrder[j],roleOrder[i]];}const spy=Math.floor(Math.random()*players.length);setRound({spy,location:9+drawn.index,guessOptions:guessOptions(drawn.index,pool),first:Math.floor(Math.random()*players.length),roles:players.map((_,i)=>i===spy?null:roleOrder[i-(i>spy?1:0)])});setStep(0);setShown(false);setFinished(false);setDeadline(null);setPhase('discussion');setVotes([]);setChoice('');setGuessResult(null);setWinner(null);}
 const stage=!round?0:step<players.length?1:finished?4:phase==='discussion'?2:3;
 const remaining=deadline?Math.max(0,Math.ceil((deadline-clock)/1000)):0;
 function advanceCard(){
 if(guard.current||!shown||step>=players.length)return;guard.current=true;setShown(false);setStep(i=>i+1);
 if(step===players.length-1&&duration){sound.current.unlock(lang);const now=Date.now();setClock(now);armedDeadline.current=now+duration*60000;setAudioReady(true);setDeadline(armedDeadline.current);}
 }
 function reset(){if(!finished&&!window.confirm(d[15]))return;setRound(null);setStep(0);setShown(false);setFinished(false);setDeadline(null);setVotes([]);setChoice('');setScores({});setRoundNumber(0);setTimeUp(false);setGuessResult(null);setWinner(null);setPhase('discussion');}
 return <section className="s pv spy-game" id="preview"><div className="wrap spy-wrap">
 <header className="spy-heading"><div><span className="spy-kicker">HOLMES / {d[0]}</span><h2>{w[0]}</h2><p>{q[0]}</p></div>{round&&<button type="button" className="btn sm" onClick={reset}>{d[14]}</button>}</header>
 <details className="spy-rules"><summary>{d[2]}</summary><p>{free?m[4]:d[3]}</p></details>
 <ol className="spy-steps" aria-label={d[0]}>{[d[5],d[6],w[14],free?m[6]:x[2],d[13]].map((label,i)=><li key={i} aria-current={stage===i?'step':undefined} className={i<=stage?'is-active':''}><span>{i+1}</span><small>{label}</small></li>)}</ol>
 {!round?<div className="spy-setup">
 <div className="players-panel"><div className="spy-panel-head"><h3>{q[1]}</h3><span className="spy-count">{players.length}/20</span></div>
 <form onSubmit={add}><label className="players-label" htmlFor="spy-name">{w[2]}</label><div className="player-add"><input id="spy-name" maxLength={60} value={name} onChange={e=>setName(e.target.value)} aria-invalid={duplicate}/><button className="btn sm" disabled={!clean||duplicate||players.length>=20}>{w[3]} +</button></div></form>
 {duplicate&&<p role="alert">{d[20]}</p>}
 <ul className="spy-roster">{players.map((p,i)=><li key={p.id}><span className="spy-avatar">{i+1}</span><strong>{p.name}</strong><button type="button" className="player-remove" aria-label={w[17]+': '+p.name} onClick={()=>setPlayers(old=>old.filter(v=>v.id!==p.id))}>×</button></li>)}</ul>
 {players.length<3&&<p>{d[4]}</p>}</div>
 <div className="players-panel"><div className="spy-panel-head"><h3>{d[5]}</h3></div><label className="players-label">{m[0]}</label><div className="spy-mode-options" role="group" aria-label={m[0]}>{["classic","free"].map((value,i)=><button type="button" key={value} className="spy-candidate" aria-pressed={mode===value} onClick={()=>setMode(value)}><strong>{m[i+1]}</strong><small>{m[i+3]}</small></button>)}</div><label className="players-label">{q[2]}</label><div className="spy-options"><button className="chip" type="button" aria-pressed="true">1</button></div><label className="players-label">{q[3]}</label><div className="spy-options" role="group" aria-label={x[0]}>{[3,5,8,10,0].map(n=><button type="button" className="chip" aria-pressed={duration===n} key={n} onClick={()=>setDuration(n)}>{n?n+' min':x[1]}</button>)}</div><label className="players-label">{q[4]}</label><select id="spy-category" aria-label={q[4]} className="charades-category" value={category} onChange={e=>setCategory(Number(e.target.value))}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n?q[11+n]:q[5]} · {locationPool(n).length}</option>)}</select>{!free&&<><label className="players-label">{q[6]}</label><div className="spy-options" role="group" aria-label={q[6]}>{[1,3,5,10].map(n=><button type="button" className="chip" key={n} aria-pressed={roundLimit===n} onClick={()=>setRoundLimit(n)}>{n}</button>)}</div></>}<label className="players-label">{g[0]}</label><div className="spy-options" role="group" aria-label={g[0]}>{["manual","choices","typed"].map((value,i)=><button type="button" className="chip" key={value} aria-pressed={guessMethod===value} onClick={()=>setGuessMethod(value)} >{i===0?manual[0]:g[i]}</button>)}</div><label className="spy-toggle"><input type="checkbox" checked={roles} onChange={e=>setRoles(e.target.checked)}/>{o[1]}</label><label className="spy-toggle"><input type="checkbox" checked={hint} onChange={e=>setHint(e.target.checked)}/>{o[0]}</label></div>
 <div className="spy-summary">{[[q[7],Math.max(0,players.length-1)],[q[8],players.length?1:0],[q[9],free?m[8]:roundLimit]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="btn pri spy-start" disabled={players.length<3||!!clean} onClick={start}>{w[4]} →</button>
 </div>:<div className="spy-stage" key={stage}>
 {stage===1?<><div className="spy-panel-head"><h3>{players[step].name}</h3><span className="spy-count">{step+1}/{players.length}</span></div><div className={'spy-secret '+(shown?(step===round.spy?'is-spy':'is-civilian'):'is-hidden')}><span className="spy-kicker">{d[6]}</span><span className="spy-symbol" aria-hidden="true">{shown?(step===round.spy?'◈':'◎'):'?'}</span><h3>{shown?(step===round.spy?w[7]:locations[round.location-9]):d[7]}</h3><p>{shown?(step===round.spy?d[10]:d[9]):d[11]}</p>{shown&&step!==round.spy&&<small>{d[8]}{roles&&round.roles?.[step]!=null&&<span className="spy-role"> · {o[3]}: {o[4+round.roles[step]]}</span>}</small>}{shown&&step===round.spy&&hint&&<small>{o[2]}: {q[11+categoryOf(round.location-9)]}</small>}</div>
 {!shown?<button className="btn pri spy-wide" onClick={()=>setShown(true)}>{w[5]}</button>:<button className="btn pri spy-wide" onClick={advanceCard}>{w[6]} →</button>}</>
 :stage===4?<><div className="spy-result"><span className="spy-kicker">{q[9]} {roundNumber}{free?"":"/"+roundLimit} · {!free&&roundNumber>=roundLimit?q[10]:d[13]}</span><h3>{free&&guessResult===null?m[9]:winner?x[5]:x[6]}</h3>{guessResult!==null&&<p className="spy-guess-feedback" role="status">{g[guessResult?5:6]}</p>}<p>{w[8]}: <strong>{locations[round.location-9]}</strong></p><p>{w[0]}: <strong>{players[round.spy].name}</strong></p></div>{!free&&<ul className="spy-roster">{[...players].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0)).map((p,i)=><li key={p.id}><span className="spy-avatar">{i+1}</span><strong>{p.name}</strong><span>{scores[p.id]||0} {x[9]}</span></li>)}</ul>}<button className="btn pri spy-wide" onClick={!free&&roundNumber>=roundLimit?reset:start}>{free?m[7]:roundNumber>=roundLimit?q[11]:w[16]} →</button></>
 :phase==='vote'?<><div className="spy-panel-head"><h3>{players[votes.length]?.name}</h3><span className="spy-count">{votes.length+1}/{players.length}</span></div><p>{d[17]}</p><div className="spy-candidates" role="group" aria-label={x[3]}>{players.filter((p,i)=>i!==votes.length).map(p=><button type="button" key={p.id} className="spy-candidate" aria-pressed={choice===p.id} onClick={()=>setChoice(p.id)}>{p.name}</button>)}</div><button className="btn pri spy-wide" disabled={!choice} onClick={vote}>{x[4]} →</button></>
 :phase==='guess'?<SpyGuess {...{x,g,guessMethod,choice,setChoice,round,locations,submitGuess,manual,confirmManual}}/>
 :<><div className="spy-discussion"><span className="spy-kicker">{w[14]}</span><div className="spy-clock">{timeUp?'0:00':deadline?Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):'∞'}</div>{deadline&&<progress max={duration*60} value={remaining}/>}<p>{timeUp?m[5]:free?m[4]:d[12]}</p>{deadline&&!audioReady&&remaining>0&&<button type="button" className="btn sm" onClick={()=>{sound.current.unlock(lang);armedDeadline.current=deadline;setAudioReady(true);}}>{manual[4]}</button>}<p>{d[16]}: <strong>{players[round.first??0]?.name}</strong></p></div><div className="spy-actions">{free?<><button className="btn pri" onClick={()=>{if(guard.current)return;guard.current=true;setFinished(true);setWinner(false);setDeadline(null);}}>{m[6]}</button><button className="btn" onClick={()=>{setChoice('');setDeadline(null);setPhase('guess');}}>{x[7]}</button><button className="btn" onClick={()=>start(true)}>{m[7]}</button></>:<><button className="btn pri" onClick={()=>{setChoice('');setDeadline(null);setPhase('vote');}}>{x[2]}</button><button className="btn" onClick={()=>{setChoice('');setDeadline(null);setPhase('guess');}}>{x[7]}</button></>}</div></>}
 </div>}
 <p className="spy-save" role="status">{storageOk?d[18]:d[19]}</p>
 </div></section>;
}
