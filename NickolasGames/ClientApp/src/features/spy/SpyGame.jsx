import { useEffect, useRef, useState } from 'react';
import '../whoami/WhoAmIGame.css';
import './SpyGame.css';
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';

const words = {
 uk: ['Шпигун','Гравці','Ім’я','Додати','Почати','Покажи картку','Передай телефон','Ти — шпигун','Локація','Аеропорт','Лікарня','Школа','Ресторан','Кінотеатр','Обговорення','Розкрити ролі','Новий раунд','Видалити'],
 en: ['Spy','Players','Name','Add','Start','Reveal card','Pass the phone','You are the spy','Location','Airport','Hospital','School','Restaurant','Cinema','Discussion','Reveal roles','New round','Remove'],
 sv: ['Spion','Spelare','Namn','Lägg till','Starta','Visa kort','Lämna över telefonen','Du är spionen','Plats','Flygplats','Sjukhus','Skola','Restaurang','Biograf','Diskussion','Visa roller','Ny runda','Ta bort'],
 de: ['Spion','Spieler','Name','Hinzufügen','Starten','Karte zeigen','Handy weitergeben','Du bist der Spion','Ort','Flughafen','Krankenhaus','Schule','Restaurant','Kino','Diskussion','Rollen zeigen','Neue Runde','Entfernen'],
 es: ['Espía','Jugadores','Nombre','Añadir','Empezar','Mostrar carta','Pasa el teléfono','Eres el espía','Lugar','Aeropuerto','Hospital','Escuela','Restaurante','Cine','Debate','Mostrar roles','Nueva ronda','Eliminar']
};
const extra={
 uk:['Таймер','Без часу','Голосування','Обери підозрюваного','Підтвердити голос','Шпигун переміг','Мирні гравці перемогли','Вгадати локацію','Обери локацію','Бали','Нічия — шпигун переміг'],
 en:['Timer','No timer','Voting','Choose a suspect','Confirm vote','Spy wins','Civilians win','Guess location','Choose location','Points','Tie — spy wins'],
 sv:['Timer','Ingen timer','Omröstning','Välj misstänkt','Bekräfta röst','Spionen vinner','Spelarna vinner','Gissa plats','Välj plats','Poäng','Oavgjort — spionen vinner'],
 de:['Timer','Ohne Timer','Abstimmung','Verdächtigen wählen','Stimme bestätigen','Spion gewinnt','Spieler gewinnen','Ort erraten','Ort wählen','Punkte','Gleichstand — Spion gewinnt'],
 es:['Temporizador','Sin tiempo','Votación','Elige sospechoso','Confirmar voto','Gana el espía','Ganan los civiles','Adivinar lugar','Elige lugar','Puntos','Empate — gana el espía']
};
export const SPY_CATALOG = Object.fromEntries(Object.entries(words).map(([lang,w])=>[lang,{n:w[0],d:w[14],p:'3–20',t:'5–8 min'}]));
const storageKey='nickolasgames.spy.v1';
function restore(){
 try {
 const s=JSON.parse(localStorage.getItem(storageKey));
 if(!s||!Array.isArray(s.players)||s.players.length>20||!s.players.every(p=>typeof p.id==='string'&&typeof p.name==='string')||!Array.isArray(s.votes)||!s.scores||![0,3,5,8,10].includes(s.duration)||!['discussion','vote','guess'].includes(s.phase))return {};
 if(s.round&&(!Number.isInteger(s.round.spy)||s.round.spy<0||s.round.spy>=s.players.length||!Number.isInteger(s.round.location)||s.round.location<9||s.round.location>13||!Number.isInteger(s.step)||s.step<0||s.step>s.players.length||s.votes.length>s.players.length))return {};
 return s;
 }catch{return {};}
}
export function SpyGame({lang}) {
 const [saved]=useState(restore);
 const w=words[lang]||words.en;
 const [players,setPlayers]=useState(saved.players??[]);
 const [name,setName]=useState('');
 const [round,setRound]=useState(saved.round??null);
 const [step,setStep]=useState(saved.step??0);
 const [shown,setShown]=useState(false);
 const [finished,setFinished]=useState(saved.finished??false);
 const x=extra[lang]||extra.en;
 const [duration,setDuration]=useState(saved.duration??5);
 const [deadline,setDeadline]=useState(saved.deadline??null);
 const [clock,setClock]=useState(Date.now());
 const [phase,setPhase]=useState(saved.phase??'discussion');
 const [votes,setVotes]=useState(saved.votes??[]);
 const [choice,setChoice]=useState('');
 const [winner,setWinner]=useState(saved.winner??null);
 const [scores,setScores]=useState(saved.scores??{});
 useEffect(()=>{
 try{localStorage.setItem(storageKey,JSON.stringify({players,round,step,finished,duration,deadline,phase,votes,winner,scores}));}catch{}
 },[players,round,step,finished,duration,deadline,phase,votes,winner,scores]);
 const guard=useRef(false);
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
     sound.current.announce(HOLMES_TIME_UP,lang);setChoice('');setPhase('vote');
   }
 },[deadline,clock,phase,finished,lang]);
 function end(spyWins){
   if(guard.current)return;guard.current=true;
   setWinner(spyWins);setFinished(true);setDeadline(null);
   setScores(old=>Object.fromEntries(players.map((p,i)=>[p.id,(old[p.id]||0)+Number(spyWins?i===round.spy:i!==round.spy)])));
 }
 function vote(){
   if(!choice||guard.current)return;guard.current=true;
   const next=[...votes,choice];setVotes(next);setChoice('');
   if(next.length===players.length){
     const counts=players.map(p=>next.filter(v=>v===p.id).length);
     const max=Math.max(...counts);const leaders=counts.map((n,i)=>n===max?i:-1).filter(i=>i>=0);
     guard.current=false;end(leaders.length!==1||leaders[0]!==round.spy);
   }
 }
 useEffect(()=>{guard.current=false;},[step,shown,votes.length,phase,round]);
 const clean=name.trim();
 const duplicate=players.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase());
 function add(e){e.preventDefault();if(!clean||duplicate||players.length>=20)return;setPlayers(old=>old.length>=20||old.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase())?old:[...old,{id:crypto.randomUUID(),name:clean}]);setName('');}
 function start(){if(players.length<3||clean)return;setRound({spy:Math.floor(Math.random()*players.length),location:9+Math.floor(Math.random()*5)});setStep(0);setShown(false);setFinished(false);setDeadline(null);setPhase('discussion');setVotes([]);setChoice('');setWinner(null);}
 return <section className="s pv whoami-game spy-game"><div className="wrap">
 <div className="whoami-heading"><h2>{w[0]}</h2></div>
 {!round?<div className="whoami-setup"><div className="players-panel"><h3>{w[1]} · {players.length}</h3>
 <form onSubmit={add}><label className="players-label" htmlFor="spy-name">{w[2]}</label><div className="player-add"><input id="spy-name" maxLength={60} value={name} onChange={e=>setName(e.target.value)}/><button className="btn sm" disabled={!clean||duplicate||players.length>=20}>{w[3]} +</button></div></form>
 <ul className="player-score-list">{players.map(p=><li key={p.id}><span className="player-name">{p.name}</span><button className="player-remove" aria-label={w[17]+': '+p.name} onClick={()=>setPlayers(old=>old.filter(x=>x.id!==p.id))}>×</button></li>)}</ul></div>
 <div className="players-panel"><label className="players-label" htmlFor="spy-time">{x[0]}</label><select id="spy-time" className="charades-category" value={duration} onChange={e=>setDuration(Number(e.target.value))}>{[0,3,5,8,10].map(n=><option key={n} value={n}>{n?n+" min":x[1]}</option>)}</select></div><div className="whoami-start"><button className="btn pri" disabled={players.length<3||!!clean} onClick={start}>{w[4]} · {players.length}/3+</button></div></div>
 :<div className="players-panel">
 {step<players.length?<><h3>{players[step].name} · {step+1}/{players.length}</h3><div className="whoami-big-word">{shown?(step===round.spy?w[7]:w[8]+': '+w[round.location]):'•••'}</div>
 {!shown?<button className="btn pri" onClick={()=>setShown(true)}>{w[5]}</button>:<button className="btn pri" onClick={()=>{if(guard.current)return;guard.current=true;setShown(false);setStep(i=>i+1);if(step===players.length-1&&duration){sound.current.unlock(lang);const now=Date.now();setClock(now);setDeadline(now+duration*60000);}}}>{w[6]}</button>}</>
 :finished?<><h3>{winner?x[5]:x[6]}</h3><h3>{w[8]}: {w[round.location]}</h3><p>{w[0]}: {players[round.spy].name}</p><ul className="player-score-list">{players.map(p=><li key={p.id}>{p.name}: {scores[p.id]||0} {x[9]}</li>)}</ul><button className="btn pri" onClick={start}>{w[16]}</button><button className="btn" onClick={()=>{setRound(null);setScores({});}}>{w[1]}</button></>:phase==='vote'?<><h3>{x[2]} · {players[votes.length]?.name}</h3><label htmlFor="spy-vote">{x[3]}</label><select id="spy-vote" className="charades-category" value={choice} onChange={e=>setChoice(e.target.value)}><option value="">—</option>{players.filter((p,i)=>i!==votes.length).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="btn pri" disabled={!choice} onClick={vote}>{x[4]}</button></>:phase==='guess'?<><h3>{x[8]}</h3>{w.slice(9,14).map((location,i)=><button className="btn" key={location} onClick={()=>end(i+9===round.location)}>{location}</button>)}</>:<><h3>{w[14]}</h3>{deadline&&<div className="timer"><b>{Math.floor(Math.max(0,Math.ceil((deadline-clock)/1000))/60)}:{String(Math.max(0,Math.ceil((deadline-clock)/1000))%60).padStart(2,'0')}</b></div>}<button className="btn pri" onClick={()=>{setChoice('');setPhase('vote');}}>{x[2]}</button><button className="btn" onClick={()=>setPhase('guess')}>{x[7]}</button></>}
 </div>}</div></section>;
}
