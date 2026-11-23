import { useEffect, useRef, useState } from 'react';
import '../whoami/WhoAmIGame.css';
import './SpyGame.css';
import { spyWinsVote, spyScores } from './rules.js';
import { locationsFor, SPY_LOCATIONS } from './locations.js';
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
const designCopy={"uk":["Секретна місія","Знайдіть шпигуна серед друзів.","Правила гри","Усі, крім шпигуна, знають спільну локацію. Ставте запитання, не називаючи її. Проголосуйте за підозрюваного; шпигун може спробувати вгадати місце. За перемогу — 1 бал.","Додайте щонайменше 3 гравців","Налаштування","Секретна картка","Тільки для тебе. Не показуй іншим.","Мирний гравець","Запам’ятай місце й не називай його.","Вивідай місце, не видаючи себе.","Передайте телефон наступному гравцю","Ставте запитання по черзі","Результати раунду","Завершити гру","Повернутися до налаштувань? Поточний раунд буде втрачено.","Першим запитує","Голосування таємне. Передайте телефон.","Гра збережена на цьому пристрої","Не вдалося зберегти гру","Ім’я вже використовується"],"en":["Secret mission","Find the spy among your friends.","How to play","Everyone except the spy knows the same location. Ask questions without naming it. Vote for a suspect; the spy can try guessing the place. Winners earn 1 point.","Add at least 3 players","Settings","Secret card","For your eyes only. Keep it secret.","Civilian","Remember the place and do not name it.","Discover the place without giving yourself away.","Pass the phone to the next player","Take turns asking questions","Round results","End game","Return to settings? The current round will be lost.","First to ask","Voting is secret. Pass the phone.","Game saved on this device","Could not save the game","Name already used"],"sv":["Hemligt uppdrag","Hitta spionen bland vännerna.","Spelregler","Alla utom spionen känner till samma plats. Ställ frågor utan att nämna platsen. Rösta på en misstänkt; spionen kan gissa platsen. Vinnarna får 1 poäng.","Lägg till minst 3 spelare","Inställningar","Hemligt kort","Bara för dig. Visa inte andra.","Civil spelare","Kom ihåg platsen utan att avslöja den.","Lista ut platsen utan att avslöja dig.","Lämna telefonen till nästa spelare","Turas om att ställa frågor","Rundans resultat","Avsluta spelet","Tillbaka till inställningarna? Rundan försvinner.","Frågar först","Omröstningen är hemlig. Lämna över telefonen.","Spelet sparas på enheten","Kunde inte spara spelet","Namnet används redan"],"de":["Geheime Mission","Finde den Spion unter Freunden.","Spielregeln","Alle außer dem Spion kennen denselben Ort. Stellt Fragen, ohne ihn zu nennen. Stimmt über einen Verdächtigen ab; der Spion kann den Ort erraten. Gewinner erhalten 1 Punkt.","Mindestens 3 Spieler hinzufügen","Einstellungen","Geheime Karte","Nur für dich. Zeige sie niemandem.","Mitspieler","Merke dir den Ort und verrate ihn nicht.","Finde den Ort heraus, ohne dich zu verraten.","Gib das Handy weiter","Stellt abwechselnd Fragen","Rundenergebnis","Spiel beenden","Zurück zu den Einstellungen? Die Runde geht verloren.","Beginnt mit einer Frage","Die Abstimmung ist geheim. Gib das Handy weiter.","Spiel auf diesem Gerät gespeichert","Spiel konnte nicht gespeichert werden","Name bereits vergeben"],"es":["Misión secreta","Encuentra al espía entre tus amigos.","Reglas","Todos salvo el espía conocen el mismo lugar. Haced preguntas sin nombrarlo. Votad por un sospechoso; el espía puede adivinar el lugar. Los ganadores reciben 1 punto.","Añade al menos 3 jugadores","Ajustes","Carta secreta","Solo para ti. No la enseñes.","Civil","Recuerda el lugar sin nombrarlo.","Descubre el lugar sin delatarte.","Pasa el teléfono al siguiente jugador","Haced preguntas por turnos","Resultados de la ronda","Terminar partida","¿Volver a ajustes? Se perderá la ronda actual.","Pregunta primero","El voto es secreto. Pasa el teléfono.","Partida guardada en este dispositivo","No se pudo guardar la partida","Nombre ya utilizado"]};
const setupCopy={"uk":["Серед вас хтось приховує правду","Кількість гравців","Кількість шпигунів","Тривалість раунду","Категорія локацій","Усі категорії","Кількість раундів","Мирні гравці","Шпигуни","Раунди","Гру завершено","Нова гра","Місто та послуги","Природа","Транспорт","Робота й навчання","Дозвілля","Фантастика"],"en":["Someone among you is hiding the truth","Number of players","Number of spies","Round duration","Location category","All categories","Number of rounds","Civilians","Spies","Rounds","Game finished","New game","City and services","Nature","Transport","Work and education","Leisure","Fantasy"],"sv":["Någon bland er döljer sanningen","Antal spelare","Antal spioner","Rundans längd","Platskategori","Alla kategorier","Antal rundor","Civila","Spioner","Rundor","Spelet är slut","Nytt spel","Stad och service","Natur","Transport","Arbete och utbildning","Fritid","Fantasi"],"de":["Jemand unter euch verbirgt die Wahrheit","Spieleranzahl","Anzahl der Spione","Rundendauer","Ortskategorie","Alle Kategorien","Anzahl der Runden","Mitspieler","Spione","Runden","Spiel beendet","Neues Spiel","Stadt und Dienste","Natur","Verkehr","Arbeit und Bildung","Freizeit","Fantasie"],"es":["Alguien entre vosotros oculta la verdad","Número de jugadores","Número de espías","Duración de la ronda","Categoría de lugares","Todas las categorías","Número de rondas","Civiles","Espías","Rondas","Partida terminada","Nueva partida","Ciudad y servicios","Naturaleza","Transporte","Trabajo y educación","Ocio","Fantasía"]};
const storageKey='nickolasgames.spy.v1';
function restore(){
 try {
 const s=JSON.parse(localStorage.getItem(storageKey));
 if(!s||!Array.isArray(s.players)||s.players.length>20||!s.players.every(p=>typeof p.id==='string'&&typeof p.name==='string')||!Array.isArray(s.votes)||!s.scores||![0,3,5,8,10].includes(s.duration)||!['discussion','vote','guess'].includes(s.phase))return {};
 if(s.round&&(!Number.isInteger(s.round.spy)||s.round.spy<0||s.round.spy>=s.players.length||!Number.isInteger(s.round.location)||s.round.location<9||s.round.location>=9+SPY_LOCATIONS.length||!Number.isInteger(s.step)||s.step<0||s.step>s.players.length||s.votes.length>s.players.length))return {};
 return s;
 }catch{return {};}
}
export function SpyGame({lang}) {
 const [saved]=useState(restore);
 const w=words[lang]||words.en;
 const d=designCopy[lang]||designCopy.en;
 const [storageOk,setStorageOk]=useState(true);
 const locations=locationsFor(lang);
 const q=setupCopy[lang]||setupCopy.en;
 const [players,setPlayers]=useState(saved.players??[]);
 const [name,setName]=useState('');
 const [round,setRound]=useState(saved.round??null);
 const [step,setStep]=useState(saved.step??0);
 const [shown,setShown]=useState(false);
 const [finished,setFinished]=useState(saved.finished??false);
 const x=extra[lang]||extra.en;
 const [duration,setDuration]=useState(saved.duration??5);
 const [roundLimit,setRoundLimit]=useState([1,3,5,10].includes(saved.roundLimit)?saved.roundLimit:5);
 const [roundNumber,setRoundNumber]=useState(saved.roundNumber||0);
 const [deadline,setDeadline]=useState(saved.deadline??null);
 const [clock,setClock]=useState(Date.now());
 const [phase,setPhase]=useState(saved.phase??'discussion');
 const [votes,setVotes]=useState(saved.votes??[]);
 const [choice,setChoice]=useState('');
 const [winner,setWinner]=useState(saved.winner??null);
 const [scores,setScores]=useState(saved.scores??{});
 useEffect(()=>{
 try{localStorage.setItem(storageKey,JSON.stringify({players,round,step,finished,duration,deadline,phase,votes,winner,scores,roundLimit,roundNumber}));;setStorageOk(true);}catch{setStorageOk(false);}
 },[players,round,step,finished,duration,deadline,phase,votes,winner,scores,roundLimit,roundNumber]);
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
   setScores(old=>spyScores(players,old,round.spy,spyWins));
 }
 function vote(){
   if(!choice||guard.current)return;guard.current=true;
   const next=[...votes,choice];setVotes(next);setChoice('');
   if(next.length===players.length){
     guard.current=false;end(spyWinsVote(players,next,round.spy));
   }
 }
 useEffect(()=>{guard.current=false;},[step,shown,votes.length,phase,round]);
 const clean=name.trim();
 const duplicate=players.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase());
 function add(e){e.preventDefault();if(!clean||duplicate||players.length>=20)return;setPlayers(old=>old.length>=20||old.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase())?old:[...old,{id:crypto.randomUUID(),name:clean}]);setName('');}
 function start(){if(players.length<3||clean||guard.current)return;guard.current=true;setRoundNumber(n=>n+1);setRound({spy:Math.floor(Math.random()*players.length),location:9+Math.floor(Math.random()*locations.length),first:Math.floor(Math.random()*players.length)});setStep(0);setShown(false);setFinished(false);setDeadline(null);setPhase('discussion');setVotes([]);setChoice('');setWinner(null);}
 const stage=!round?0:step<players.length?1:finished?4:phase==='discussion'?2:3;
 const remaining=deadline?Math.max(0,Math.ceil((deadline-clock)/1000)):0;
 function advanceCard(){
 if(guard.current)return;guard.current=true;setShown(false);setStep(i=>i+1);
 if(step===players.length-1&&duration){sound.current.unlock(lang);const now=Date.now();setClock(now);setDeadline(now+duration*60000);}
 }
 function reset(){if(!finished&&!window.confirm(d[15]))return;setRound(null);setStep(0);setShown(false);setFinished(false);setDeadline(null);setVotes([]);setChoice('');setScores({});setRoundNumber(0);setWinner(null);setPhase('discussion');}
 return <section className="s pv spy-game" id="preview"><div className="wrap spy-wrap">
 <header className="spy-heading"><div><span className="spy-kicker">HOLMES / {d[0]}</span><h2>{w[0]}</h2><p>{q[0]}</p></div>{round&&<button type="button" className="btn sm" onClick={reset}>{d[14]}</button>}</header>
 <details className="spy-rules"><summary>{d[2]}</summary><p>{d[3]}</p></details>
 <ol className="spy-steps" aria-label={d[0]}>{[d[5],d[6],w[14],x[2],d[13]].map((label,i)=><li key={i} aria-current={stage===i?'step':undefined} className={i<=stage?'is-active':''}><span>{i+1}</span><small>{label}</small></li>)}</ol>
 {!round?<div className="spy-setup">
 <div className="players-panel"><div className="spy-panel-head"><h3>{q[1]}</h3><span className="spy-count">{players.length}/20</span></div>
 <form onSubmit={add}><label className="players-label" htmlFor="spy-name">{w[2]}</label><div className="player-add"><input id="spy-name" maxLength={60} value={name} onChange={e=>setName(e.target.value)} aria-invalid={duplicate}/><button className="btn sm" disabled={!clean||duplicate||players.length>=20}>{w[3]} +</button></div></form>
 {duplicate&&<p role="alert">{d[20]}</p>}
 <ul className="spy-roster">{players.map((p,i)=><li key={p.id}><span className="spy-avatar">{i+1}</span><strong>{p.name}</strong><button type="button" className="player-remove" aria-label={w[17]+': '+p.name} onClick={()=>setPlayers(old=>old.filter(v=>v.id!==p.id))}>×</button></li>)}</ul>
 {players.length<3&&<p>{d[4]}</p>}</div>
 <div className="players-panel"><div className="spy-panel-head"><h3>{d[5]}</h3></div><label className="players-label">{q[2]}</label><div className="spy-options"><button className="chip" type="button" aria-pressed="true">1</button></div><label className="players-label">{q[3]}</label><div className="spy-options" role="group" aria-label={x[0]}>{[3,5,8,10,0].map(n=><button type="button" className="chip" aria-pressed={duration===n} key={n} onClick={()=>setDuration(n)}>{n?n+' min':x[1]}</button>)}</div><label className="players-label">{q[4]}</label><div className="spy-library">{q[5]} · {locations.length}</div><label className="players-label">{q[6]}</label><div className="spy-options" role="group" aria-label={q[6]}>{[1,3,5,10].map(n=><button type="button" className="chip" key={n} aria-pressed={roundLimit===n} onClick={()=>setRoundLimit(n)}>{n}</button>)}</div></div>
 <div className="spy-summary">{[[q[7],Math.max(0,players.length-1)],[q[8],players.length?1:0],[q[9],roundLimit]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="btn pri spy-start" disabled={players.length<3||!!clean} onClick={start}>{w[4]} →</button>
 </div>:<div className="spy-stage" key={stage}>
 {stage===1?<><div className="spy-panel-head"><h3>{players[step].name}</h3><span className="spy-count">{step+1}/{players.length}</span></div><div className={'spy-secret '+(shown?(step===round.spy?'is-spy':'is-civilian'):'is-hidden')}><span className="spy-kicker">{d[6]}</span><span className="spy-symbol" aria-hidden="true">{shown?(step===round.spy?'◈':'◎'):'?'}</span><h3>{shown?(step===round.spy?w[7]:locations[round.location-9]):d[7]}</h3><p>{shown?(step===round.spy?d[10]:d[9]):d[11]}</p>{shown&&step!==round.spy&&<small>{d[8]}</small>}</div>
 {!shown?<button className="btn pri spy-wide" onClick={()=>setShown(true)}>{w[5]}</button>:<button className="btn pri spy-wide" onClick={advanceCard}>{w[6]} →</button>}</>
 :stage===4?<><div className="spy-result"><span className="spy-kicker">{q[9]} {roundNumber}/{roundLimit} · {roundNumber>=roundLimit?q[10]:d[13]}</span><h3>{winner?x[5]:x[6]}</h3><p>{w[8]}: <strong>{locations[round.location-9]}</strong></p><p>{w[0]}: <strong>{players[round.spy].name}</strong></p></div><ul className="spy-roster">{[...players].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0)).map((p,i)=><li key={p.id}><span className="spy-avatar">{i+1}</span><strong>{p.name}</strong><span>{scores[p.id]||0} {x[9]}</span></li>)}</ul><button className="btn pri spy-wide" onClick={roundNumber>=roundLimit?reset:start}>{roundNumber>=roundLimit?q[11]:w[16]} →</button></>
 :phase==='vote'?<><div className="spy-panel-head"><h3>{players[votes.length]?.name}</h3><span className="spy-count">{votes.length+1}/{players.length}</span></div><p>{d[17]}</p><div className="spy-candidates" role="group" aria-label={x[3]}>{players.filter((p,i)=>i!==votes.length).map(p=><button type="button" key={p.id} className="spy-candidate" aria-pressed={choice===p.id} onClick={()=>setChoice(p.id)}>{p.name}</button>)}</div><button className="btn pri spy-wide" disabled={!choice} onClick={vote}>{x[4]} →</button></>
 :phase==='guess'?<><h3>{x[8]}</h3><select className="charades-category" aria-label={x[8]} value={choice} onChange={e=>setChoice(e.target.value)}><option value="">—</option>{locations.map((location,i)=>({location,i})).sort((a,b)=>a.location.localeCompare(b.location,lang)).map(({location,i})=><option key={i} value={i}>{location}</option>)}</select><button className="btn pri spy-wide" disabled={choice===''} onClick={()=>end(Number(choice)+9===round.location)}>{x[7]}</button></>
 :<><div className="spy-discussion"><span className="spy-kicker">{w[14]}</span><div className="spy-clock">{deadline?Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):'∞'}</div>{deadline&&<progress max={duration*60} value={remaining}/>}<p>{d[12]}</p><p>{d[16]}: <strong>{players[round.first??0]?.name}</strong></p></div><div className="spy-actions"><button className="btn pri" onClick={()=>{setChoice('');setPhase('vote');}}>{x[2]}</button><button className="btn" onClick={()=>{setChoice('');setPhase('guess');}}>{x[7]}</button></div></>}
 </div>}
 <p className="spy-save" role="status">{storageOk?d[18]:d[19]}</p>
 </div></section>;
}
