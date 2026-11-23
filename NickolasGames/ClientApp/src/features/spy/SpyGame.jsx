import { useEffect, useRef, useState } from 'react';
import '../whoami/WhoAmIGame.css';
import './SpyGame.css';
import { SPY_STORAGE_KEY as storageKey, restoreSpySession as restore } from './session.js';
import { spyWinsVote, spyScores } from './rules.js';
import { locationsFor, SPY_LOCATIONS, categoryOf, locationPool, drawLocation, guessOptions, matchesLocationGuess } from './locations.js';
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
const optionCopy={"uk":["Підказка для шпигуна","Унікальна роль для кожного гравця","Підказка","Роль","Спостерігач","Новачок","Постійний відвідувач","Експерт","Гість","Організатор","Дослідник","Помічник","Працівник","Фотограф","Журналіст","Інспектор","Волонтер","Керівник","Консультант","Стажер","Мандрівник","Координатор","Репортер"],"en":["Hint for the spy","Unique role for each player","Hint","Role","Observer","Newcomer","Regular visitor","Expert","Guest","Organizer","Researcher","Assistant","Employee","Photographer","Journalist","Inspector","Volunteer","Manager","Consultant","Intern","Traveller","Coordinator","Reporter"],"sv":["Ledtråd för spionen","Unik roll för varje spelare","Ledtråd","Roll","Observatör","Nykomling","Stamgäst","Expert","Gäst","Organisatör","Forskare","Assistent","Anställd","Fotograf","Journalist","Inspektör","Volontär","Chef","Rådgivare","Praktikant","Resenär","Samordnare","Reporter"],"de":["Hinweis für den Spion","Einzigartige Rolle für jeden Spieler","Hinweis","Rolle","Beobachter","Neuling","Stammgast","Experte","Gast","Organisator","Forscher","Assistent","Mitarbeiter","Fotograf","Journalist","Inspektor","Freiwilliger","Leiter","Berater","Praktikant","Reisender","Koordinator","Reporter"],"es":["Pista para el espía","Rol único para cada jugador","Pista","Rol","Observador","Recién llegado","Visitante habitual","Experto","Invitado","Organizador","Investigador","Asistente","Empleado","Fotógrafo","Periodista","Inspector","Voluntario","Gerente","Consultor","Becario","Viajero","Coordinador","Reportero"]};

const modeCopy={"uk":["Режим гри","Класичний","Вільна гра","Голосування та бали","Обговорюйте скільки хочете. Самі вирішуйте, хто шпигун, і починайте наступний раунд.","Час вийшов — можете продовжити обговорення","Показати шпигуна","Наступний раунд","Без обмежень","Шпигуна знайдено!"],"en":["Game mode","Classic","Free play","Voting and scores","Discuss for as long as you like. Decide who the spy is yourselves and start another round.","Time is up — you can keep discussing","Reveal the spy","Next round","Unlimited","Spy revealed!"],"sv":["Spelläge","Klassiskt","Fritt spel","Omröstning och poäng","Diskutera så länge ni vill. Avgör själva vem spionen är och börja nästa runda.","Tiden är ute — fortsätt gärna diskutera","Avslöja spionen","Nästa runda","Obegränsat","Spionen avslöjad!"],"de":["Spielmodus","Klassisch","Freies Spiel","Abstimmung und Punkte","Diskutiert so lange ihr wollt. Entscheidet selbst, wer der Spion ist, und beginnt die nächste Runde.","Zeit abgelaufen — ihr könnt weiter diskutieren","Spion aufdecken","Nächste Runde","Unbegrenzt","Spion aufgedeckt!"],"es":["Modo de juego","Clásico","Juego libre","Votación y puntos","Debatid cuanto queráis. Decidid quién es el espía y empezad otra ronda.","Se acabó el tiempo — podéis seguir debatiendo","Revelar espía","Siguiente ronda","Sin límite","¡Espía revelado!"]};
const guessCopy={"uk":["Спосіб вгадування локації","4 варіанти","Ввести назву","Введи назву локації","Підтвердити відповідь","Правильно! Шпигун вгадав локацію.","Неправильно. Шпигун не вгадав локацію.","Одна спроба"],"en":["Location guessing method","4 choices","Type the name","Enter the location name","Confirm answer","Correct! The spy guessed the location.","Incorrect. The spy did not guess the location.","One attempt"],"sv":["Sätt att gissa platsen","4 alternativ","Skriv namnet","Skriv platsens namn","Bekräfta svar","Rätt! Spionen gissade platsen.","Fel. Spionen gissade inte platsen.","Ett försök"],"de":["Ort erraten","4 Optionen","Name eingeben","Gib den Ortsnamen ein","Antwort bestätigen","Richtig! Der Spion hat den Ort erraten.","Falsch. Der Spion hat den Ort nicht erraten.","Ein Versuch"],"es":["Forma de adivinar el lugar","4 opciones","Escribir nombre","Escribe el nombre del lugar","Confirmar respuesta","¡Correcto! El espía adivinó el lugar.","Incorrecto. El espía no adivinó el lugar.","Un intento"]};
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
 const [guessMethod,setGuessMethod]=useState(saved.guessMethod==='typed'?'typed':'choices');
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
     sound.current.announce(HOLMES_TIME_UP,lang);setChoice('');if(free){setTimeUp(true);setDeadline(null);}else setPhase('vote');
   }
 },[deadline,clock,phase,finished,lang,free]);
 function end(spyWins){
   if(guard.current||finished||!round)return;guard.current=true;
   setWinner(spyWins);setFinished(true);setDeadline(null);
   if(!free)setScores(old=>spyScores(players,old,round.spy,spyWins));
 }
 function submitGuess(e){
   e.preventDefault();if(guard.current||finished||phase!=='guess'||!choice.trim())return;
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
 function start(skip=false){if(players.length<3||clean||guard.current||(round&&((!finished&&!(free&&skip===true))||(!free&&roundNumber>=roundLimit))))return;guard.current=true;setRoundNumber(n=>n+1);setTimeUp(false);const drawn=drawLocation(pool,locationHistory);setLocationHistory(drawn.history);const roleOrder=Array.from({length:19},(_,i)=>i);for(let i=roleOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[roleOrder[i],roleOrder[j]]=[roleOrder[j],roleOrder[i]];}const spy=Math.floor(Math.random()*players.length);setRound({spy,location:9+drawn.index,guessOptions:guessOptions(drawn.index,pool),first:Math.floor(Math.random()*players.length),roles:players.map((_,i)=>i===spy?null:roleOrder[i-(i>spy?1:0)])});setStep(0);setShown(false);setFinished(false);setDeadline(null);setPhase('discussion');setVotes([]);setChoice('');setGuessResult(null);setWinner(null);}
 const stage=!round?0:step<players.length?1:finished?4:phase==='discussion'?2:3;
 const remaining=deadline?Math.max(0,Math.ceil((deadline-clock)/1000)):0;
 function advanceCard(){
 if(guard.current)return;guard.current=true;setShown(false);setStep(i=>i+1);
 if(step===players.length-1&&duration){sound.current.unlock(lang);const now=Date.now();setClock(now);setDeadline(now+duration*60000);}
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
 <div className="players-panel"><div className="spy-panel-head"><h3>{d[5]}</h3></div><label className="players-label">{m[0]}</label><div className="spy-mode-options" role="group" aria-label={m[0]}>{["classic","free"].map((value,i)=><button type="button" key={value} className="spy-candidate" aria-pressed={mode===value} onClick={()=>setMode(value)}><strong>{m[i+1]}</strong><small>{m[i+3]}</small></button>)}</div><label className="players-label">{q[2]}</label><div className="spy-options"><button className="chip" type="button" aria-pressed="true">1</button></div><label className="players-label">{q[3]}</label><div className="spy-options" role="group" aria-label={x[0]}>{[3,5,8,10,0].map(n=><button type="button" className="chip" aria-pressed={duration===n} key={n} onClick={()=>setDuration(n)}>{n?n+' min':x[1]}</button>)}</div><label className="players-label">{q[4]}</label><select id="spy-category" aria-label={q[4]} className="charades-category" value={category} onChange={e=>setCategory(Number(e.target.value))}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n?q[11+n]:q[5]} · {locationPool(n).length}</option>)}</select>{!free&&<><label className="players-label">{q[6]}</label><div className="spy-options" role="group" aria-label={q[6]}>{[1,3,5,10].map(n=><button type="button" className="chip" key={n} aria-pressed={roundLimit===n} onClick={()=>setRoundLimit(n)}>{n}</button>)}</div></>}<label className="players-label">{g[0]}</label><div className="spy-options" role="group" aria-label={g[0]}>{["choices","typed"].map((value,i)=><button type="button" className="chip" key={value} aria-pressed={guessMethod===value} onClick={()=>setGuessMethod(value)}>{g[i+1]}</button>)}</div><label className="spy-toggle"><input type="checkbox" checked={roles} onChange={e=>setRoles(e.target.checked)}/>{o[1]}</label><label className="spy-toggle"><input type="checkbox" checked={hint} onChange={e=>setHint(e.target.checked)}/>{o[0]}</label></div>
 <div className="spy-summary">{[[q[7],Math.max(0,players.length-1)],[q[8],players.length?1:0],[q[9],free?m[8]:roundLimit]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="btn pri spy-start" disabled={players.length<3||!!clean} onClick={start}>{w[4]} →</button>
 </div>:<div className="spy-stage" key={stage}>
 {stage===1?<><div className="spy-panel-head"><h3>{players[step].name}</h3><span className="spy-count">{step+1}/{players.length}</span></div><div className={'spy-secret '+(shown?(step===round.spy?'is-spy':'is-civilian'):'is-hidden')}><span className="spy-kicker">{d[6]}</span><span className="spy-symbol" aria-hidden="true">{shown?(step===round.spy?'◈':'◎'):'?'}</span><h3>{shown?(step===round.spy?w[7]:locations[round.location-9]):d[7]}</h3><p>{shown?(step===round.spy?d[10]:d[9]):d[11]}</p>{shown&&step!==round.spy&&<small>{d[8]}{roles&&round.roles?.[step]!=null&&<span className="spy-role"> · {o[3]}: {o[4+round.roles[step]]}</span>}</small>}{shown&&step===round.spy&&hint&&<small>{o[2]}: {q[11+categoryOf(round.location-9)]}</small>}</div>
 {!shown?<button className="btn pri spy-wide" onClick={()=>setShown(true)}>{w[5]}</button>:<button className="btn pri spy-wide" onClick={advanceCard}>{w[6]} →</button>}</>
 :stage===4?<><div className="spy-result"><span className="spy-kicker">{q[9]} {roundNumber}{free?"":"/"+roundLimit} · {!free&&roundNumber>=roundLimit?q[10]:d[13]}</span><h3>{free&&guessResult===null?m[9]:winner?x[5]:x[6]}</h3>{guessResult!==null&&<p className="spy-guess-feedback" role="status">{g[guessResult?5:6]}</p>}<p>{w[8]}: <strong>{locations[round.location-9]}</strong></p><p>{w[0]}: <strong>{players[round.spy].name}</strong></p></div>{!free&&<ul className="spy-roster">{[...players].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0)).map((p,i)=><li key={p.id}><span className="spy-avatar">{i+1}</span><strong>{p.name}</strong><span>{scores[p.id]||0} {x[9]}</span></li>)}</ul>}<button className="btn pri spy-wide" onClick={!free&&roundNumber>=roundLimit?reset:start}>{free?m[7]:roundNumber>=roundLimit?q[11]:w[16]} →</button></>
 :phase==='vote'?<><div className="spy-panel-head"><h3>{players[votes.length]?.name}</h3><span className="spy-count">{votes.length+1}/{players.length}</span></div><p>{d[17]}</p><div className="spy-candidates" role="group" aria-label={x[3]}>{players.filter((p,i)=>i!==votes.length).map(p=><button type="button" key={p.id} className="spy-candidate" aria-pressed={choice===p.id} onClick={()=>setChoice(p.id)}>{p.name}</button>)}</div><button className="btn pri spy-wide" disabled={!choice} onClick={vote}>{x[4]} →</button></>
 :phase==='guess'?<><h3>{x[7]}</h3><p>{g[7]}</p><form className="spy-guess-form" onSubmit={submitGuess}>{guessMethod==='typed'?<><label className="players-label" htmlFor="spy-guess">{g[3]}</label><input id="spy-guess" className="spy-guess-input" value={choice} maxLength={120} autoComplete="off" onChange={e=>setChoice(e.target.value)} placeholder={g[3]}/></>:<div className="spy-candidates" role="group" aria-label={x[8]}>{round.guessOptions.map(i=><button type="button" key={i} className="spy-candidate" aria-pressed={choice===String(i)} onClick={()=>setChoice(String(i))}>{locations[i]}</button>)}</div>}<button className="btn pri spy-wide" disabled={!choice.trim()} type="submit">{g[4]}</button></form></>
 :<><div className="spy-discussion"><span className="spy-kicker">{w[14]}</span><div className="spy-clock">{timeUp?'0:00':deadline?Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):'∞'}</div>{deadline&&<progress max={duration*60} value={remaining}/>}<p>{timeUp?m[5]:free?m[4]:d[12]}</p><p>{d[16]}: <strong>{players[round.first??0]?.name}</strong></p></div><div className="spy-actions">{free?<><button className="btn pri" onClick={()=>{if(guard.current)return;guard.current=true;setFinished(true);setWinner(false);setDeadline(null);}}>{m[6]}</button><button className="btn" onClick={()=>{setChoice('');setPhase('guess');}}>{x[7]}</button><button className="btn" onClick={()=>start(true)}>{m[7]}</button></>:<><button className="btn pri" onClick={()=>{setChoice('');setPhase('vote');}}>{x[2]}</button><button className="btn" onClick={()=>{setChoice('');setPhase('guess');}}>{x[7]}</button></>}</div></>}
 </div>}
 <p className="spy-save" role="status">{storageOk?d[18]:d[19]}</p>
 </div></section>;
}
