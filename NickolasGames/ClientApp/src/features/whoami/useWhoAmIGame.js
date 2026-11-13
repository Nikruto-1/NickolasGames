import { validateWhoamiStart } from "../../utils/startValidation";
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createHolmesTimerSound } from '../../utils/holmesTimerSound.js';
import { WHOAMI_UI, WHOAMI_RULES } from './translations.js';
import { PLAYER_SETUP } from '../../locales/index.js';
import { readValue, readProgress, writeValue } from '../../utils/progress.js';
import { initialWhoami, restoreWhoamiCategory, validWhoami, WHOAMI_ALL, WHOAMI_DIFFICULTIES, whoamiPool, whoamiReducer } from './gameLogic.js';


import { useVersionedReducer } from "../../utils/gameSession.js";

export function useWhoAmIGame({ games, t, lang, startRequest = 0 }) {
 const copy=WHOAMI_UI[lang]||WHOAMI_UI.en;
 const rules=WHOAMI_RULES[lang]||WHOAMI_RULES.en;
 const pc=PLAYER_SETUP[lang]||PLAYER_SETUP.en;
 const key=`nickolasgames-whoami-v2-${lang}`;
 const [state,dispatch,storageOk]=useVersionedReducer({
   game:"whoami",lang,reducer:whoamiReducer,
   validate:value=>{
     if(!validWhoami(value))return null;
     const restored=restoreWhoamiCategory(value,games.whoami.c);
     return restored.phase==='setup'?{...restored,players:[]}:restored;
   },
   initialize:()=>{
     const saved=readValue(key);
     if(validWhoami(saved)){
       const restored=restoreWhoamiCategory(saved,games.whoami.c);
       return restored.phase==='setup'?{...restored,players:[]}:restored;
     }
     const migrated=restoreWhoamiCategory(initialWhoami(readProgress(`nickolasgames-progress-v1-${lang}-whoami`)),games.whoami.c);
     migrated.pool=whoamiPool(games.whoami.c,migrated.category,migrated.difficulty,migrated.customWords,migrated.customOnly);
     return migrated;
   }
 });
 const [name,setName]=useState('');const [warning,setWarning]=useState('');
 const [startAttempt,setStartAttempt]=useState(0);
 useEffect(()=>{if(startRequest>0)setStartAttempt(value=>value+1);},[startRequest]);
 const [activeId,setActiveId]=useState(null);const [held,setHeld]=useState(false);
 const [manual,setManual]=useState('');const [running,setRunning]=useState(false);
 const sound=useRef(null);if(!sound.current)sound.current=createHolmesTimerSound();
 const previousLeft=useRef(state.left);
 useEffect(()=>()=>sound.current.dispose(),[]);
 useEffect(()=>{if(running&&previousLeft.current>0&&state.left===0)sound.current.announce(copy.timeUp,lang);previousLeft.current=state.left;},[state.left,running,copy.timeUp,lang]);
 const dialog=useRef(null);const closeButton=useRef(null);
 const active=state.players.find(p=>p.id===activeId);
 const pool=useMemo(()=>whoamiPool(games.whoami.c,state.category,state.difficulty,state.customWords,state.customOnly),[games,state.category,state.difficulty,state.customWords,state.customOnly]);
 useEffect(()=>{
   if(!running||state.phase!=='game'||state.left<=0){setRunning(false);return;}
   const timer=setInterval(()=>dispatch({type:'tick'}),1000);return()=>clearInterval(timer);
 },[running,state.phase,state.left]);
 useEffect(()=>{
   const hide=()=>setHeld(false);const hidden=()=>{if(document.hidden){hide();setRunning(false);}};
   document.addEventListener('pointerup',hide);document.addEventListener('pointercancel',hide);
   document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',hide);
   return()=>{document.removeEventListener('pointerup',hide);document.removeEventListener('pointercancel',hide);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',hide);};
 },[]);
 useEffect(()=>{
   setHeld(false);setManual('');setWarning('');
   if(!activeId)return;
   const previous=document.activeElement;const overflow=document.body.style.overflow;
   document.body.style.overflow='hidden';closeButton.current?.focus();
   return()=>{document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};
 },[activeId]);
 const add=event=>{event.preventDefault();const clean=name.trim();if(!clean)return;
   if(state.players.some(p=>p.name.toLocaleLowerCase()===clean.toLocaleLowerCase())){setWarning(copy.duplicate);return;}
   dispatch({type:'add',id:crypto.randomUUID(),name:clean});setName('');setWarning('');};
 const startErrors=state.phase==='setup'&&startAttempt?validateWhoamiStart({players:state.players,pool,pendingName:name}):[];
 const deal=()=>{setStartAttempt(value=>value+1);if(validateWhoamiStart({players:state.players,pool,pendingName:name}).length)return;dispatch({type:'deal',pool});setWarning('');};
 const close=()=>{setHeld(false);setActiveId(null);};
 const restart=(changeSettings=false)=>{
   if(state.phase==='game'&&!window.confirm(copy.confirm))return;
   setStartAttempt(0);setRunning(false);close();dispatch({type:'setup',clearPlayers:changeSettings});setWarning('');
   if(!changeSettings&&pool.length>=state.players.length)dispatch({type:'deal',pool});
 };
 const answer=outcome=>{setHeld(false);dispatch({type:'answer',id:active.id,revision:active.revision,outcome});close();};
 const keyTrap=event=>{
   if(event.key==='Escape'){event.preventDefault();close();return;}
   if(event.key!=='Tab')return;
   const nodes=[...dialog.current.querySelectorAll('button,input,summary')].filter(el=>!el.disabled&&(!el.closest('details:not([open])')||el.tagName==='SUMMARY'));
   const first=nodes[0],last=nodes[nodes.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 };
 return { copy, rules, pc, key, state, dispatch, name, setName, warning, setWarning, startAttempt, setStartAttempt, activeId, setActiveId, held, setHeld, manual, setManual, running, setRunning, storageOk, sound, previousLeft, dialog, active, pool, add, startErrors, deal, close, restart, answer, keyTrap, closeButton };
}
