import { useState } from 'react';
import '../whoami/WhoAmIGame.css';

const words = {
 uk: ['Шпигун','Гравці','Ім’я','Додати','Почати','Покажи картку','Передай телефон','Ти — шпигун','Локація','Аеропорт','Лікарня','Школа','Ресторан','Кінотеатр','Обговорення','Розкрити ролі','Новий раунд','Видалити'],
 en: ['Spy','Players','Name','Add','Start','Reveal card','Pass the phone','You are the spy','Location','Airport','Hospital','School','Restaurant','Cinema','Discussion','Reveal roles','New round','Remove'],
 sv: ['Spion','Spelare','Namn','Lägg till','Starta','Visa kort','Lämna över telefonen','Du är spionen','Plats','Flygplats','Sjukhus','Skola','Restaurang','Biograf','Diskussion','Visa roller','Ny runda','Ta bort'],
 de: ['Spion','Spieler','Name','Hinzufügen','Starten','Karte zeigen','Handy weitergeben','Du bist der Spion','Ort','Flughafen','Krankenhaus','Schule','Restaurant','Kino','Diskussion','Rollen zeigen','Neue Runde','Entfernen'],
 es: ['Espía','Jugadores','Nombre','Añadir','Empezar','Mostrar carta','Pasa el teléfono','Eres el espía','Lugar','Aeropuerto','Hospital','Escuela','Restaurante','Cine','Debate','Mostrar roles','Nueva ronda','Eliminar']
};
export const SPY_CATALOG = Object.fromEntries(Object.entries(words).map(([lang,w])=>[lang,{n:w[0],d:w[14],p:'3–20',t:'5–8 min'}]));
export function SpyGame({lang}) {
 const w=words[lang]||words.en;
 const [players,setPlayers]=useState([]);
 const [name,setName]=useState('');
 const [round,setRound]=useState(null);
 const [step,setStep]=useState(0);
 const [shown,setShown]=useState(false);
 const [finished,setFinished]=useState(false);
 const clean=name.trim();
 const duplicate=players.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase());
 function add(e){e.preventDefault();if(!clean||duplicate||players.length>=20)return;setPlayers(old=>[...old,{id:crypto.randomUUID(),name:clean}]);setName('');}
 function start(){if(players.length<3||clean)return;setRound({spy:Math.floor(Math.random()*players.length),location:9+Math.floor(Math.random()*5)});setStep(0);setShown(false);setFinished(false);}
 return <section className="s pv whoami-game"><div className="wrap">
 <div className="whoami-heading"><h2>{w[0]}</h2></div>
 {!round?<div className="whoami-setup"><div className="players-panel"><h3>{w[1]} · {players.length}</h3>
 <form onSubmit={add}><label className="players-label" htmlFor="spy-name">{w[2]}</label><div className="player-add"><input id="spy-name" maxLength={60} value={name} onChange={e=>setName(e.target.value)}/><button className="btn sm" disabled={!clean||duplicate||players.length>=20}>{w[3]} +</button></div></form>
 <ul className="player-score-list">{players.map(p=><li key={p.id}><span className="player-name">{p.name}</span><button className="player-remove" aria-label={w[17]+': '+p.name} onClick={()=>setPlayers(old=>old.filter(x=>x.id!==p.id))}>×</button></li>)}</ul></div>
 <div className="whoami-start"><button className="btn pri" disabled={players.length<3||!!clean} onClick={start}>{w[4]} · {players.length}/3+</button></div></div>
 :<div className="players-panel">
 {step<players.length?<><h3>{players[step].name} · {step+1}/{players.length}</h3><div className="whoami-big-word">{shown?(step===round.spy?w[7]:w[8]+': '+w[round.location]):'•••'}</div>
 {!shown?<button className="btn pri" onClick={()=>setShown(true)}>{w[5]}</button>:<button className="btn pri" onClick={()=>{setShown(false);setStep(i=>i+1);}}>{w[6]}</button>}</>
 :finished?<><h3>{w[8]}: {w[round.location]}</h3><p>{w[0]}: {players[round.spy].name}</p><button className="btn pri" onClick={()=>setRound(null)}>{w[16]}</button></>:<><h3>{w[14]}</h3><button className="btn pri" onClick={()=>setFinished(true)}>{w[15]}</button></>}
 </div>}</div></section>;
}
