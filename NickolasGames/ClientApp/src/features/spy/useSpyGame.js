import { subscribeGameClock, remainingSeconds } from '../../utils/gameClock.js';
import { useEffect, useRef, useState } from 'react';
import { persistSpySession, restoreSpySession as restore } from './session.js';
import { spyWinsVote, spyScores } from './rules.js';
import { locationsFor, SPY_LOCATIONS, locationPool, drawLocation, guessOptions, matchesLocationGuess } from './locations.js';
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../../utils/holmesTimerSound.js';

import { words, extra, designCopy, setupCopy, optionCopy, modeCopy, guessCopy, manualCopy } from './translations.js';

export function useSpyGame({lang}) {
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
 setStorageOk(persistSpySession({players,round,step,finished,duration,deadline,phase,votes,winner,scores:Object.fromEntries(players.map(p=>[p.id,scores[p.id]||0])),roundLimit,roundNumber,category,hint,roles,locationHistory,mode,timeUp,guessMethod,guessResult}));
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
   return subscribeGameClock(setClock);
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
 const remaining=remainingSeconds(deadline,clock);
 function advanceCard(){
 if(guard.current||!shown||step>=players.length)return;guard.current=true;setShown(false);setStep(i=>i+1);
 if(step===players.length-1&&duration){sound.current.unlock(lang);const now=Date.now();setClock(now);armedDeadline.current=now+duration*60000;setAudioReady(true);setDeadline(armedDeadline.current);}
 }
 function reset(){if(!finished&&!window.confirm(d[15]))return;setRound(null);setStep(0);setShown(false);setFinished(false);setDeadline(null);setVotes([]);setChoice('');setScores({});setRoundNumber(0);setTimeUp(false);setGuessResult(null);setWinner(null);setPhase('discussion');}
 return {w,d,q,m,g,manual,o,x,storageOk,locations,players,setPlayers,name,setName,guessMethod,setGuessMethod,guessResult,mode,setMode,free,timeUp,round,step,shown,setShown,finished,duration,setDuration,roundLimit,setRoundLimit,roundNumber,category,setCategory,hint,setHint,roles,setRoles,deadline,setDeadline,phase,setPhase,votes,choice,setChoice,winner,setWinner,scores,guard,audioReady,setAudioReady,sound,armedDeadline,setFinished,clean,duplicate,stage,remaining,add,start,advanceCard,reset,vote,submitGuess,confirmManual};
}
