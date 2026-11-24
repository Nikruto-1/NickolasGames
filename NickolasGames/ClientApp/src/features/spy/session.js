import { browserStorage, restoreGameSession, persistGameSession } from '../../utils/gameSession.js';
import { SPY_LOCATIONS, locationPool } from './locations.js';
export const SPY_STORAGE_KEY='nickolasgames.spy.v1';
export function validateSpySession(s){
 if(!s||!Array.isArray(s.players)||s.players.length>20||!s.players.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=60)||new Set(s.players.map(p=>p.id)).size!==s.players.length||new Set(s.players.map(p=>p.name.trim().toLowerCase())).size!==s.players.length||!Array.isArray(s.votes)||!s.scores||typeof s.scores!=='object'||Array.isArray(s.scores)||![0,3,5,8,10].includes(s.duration)||!['discussion','vote','guess'].includes(s.phase))return {};
 if(s.round){
 const r=s.round,n=s.players.length;
 if(n<3||!Number.isInteger(r.spy)||r.spy<0||r.spy>=n||!Number.isInteger(r.location)||r.location<9||r.location>=9+SPY_LOCATIONS.length||!Number.isInteger(s.step)||s.step<0||s.step>n||s.votes.length>n||s.votes.some((id,i)=>!s.players.some((p,j)=>p.id===id&&i!==j))||(!s.finished&&s.votes.length===n)|| (s.finished&&typeof s.winner!=='boolean') || (s.step<n&&(s.phase!=='discussion'||s.finished||s.votes.length)))return {};
 }
 const category=[0,1,2,3,4,5,6].includes(s.category)?s.category:0;
 const safeCategory=s.round&&!locationPool(category).includes(s.round.location-9)?0:category;
 const round=s.round?{...s.round,first:Number.isInteger(s.round.first)&&s.round.first>=0&&s.round.first<s.players.length?s.round.first:0}:null;
 const scores=Object.fromEntries(s.players.map(p=>[p.id,Number.isSafeInteger(s.scores[p.id])&&s.scores[p.id]>=0?s.scores[p.id]:0]));
 const roundLimit=[1,3,5,10].includes(s.roundLimit)?s.roundLimit:5;
 return {...s,round,category:safeCategory,mode:s.mode==='free'?'free':'classic',guessMethod:['choices','typed'].includes(s.guessMethod)?s.guessMethod:'manual',guessResult:typeof s.guessResult==='boolean'?s.guessResult:null,timeUp:s.timeUp===true,finished:s.finished===true,scores,roundLimit,roundNumber:s.round?Math.min(s.mode==='free'?Number.MAX_SAFE_INTEGER:roundLimit,Math.max(1,Number.isSafeInteger(s.roundNumber)?s.roundNumber:1)):0,deadline:s.round&&!s.finished&&s.phase==='discussion'&&s.duration>0&&s.step===s.players.length&&Number.isFinite(s.deadline)&&s.deadline>0?s.deadline:null,locationHistory:Array.isArray(s.locationHistory)?[...new Set(s.locationHistory.filter(i=>Number.isInteger(i)&&i>=0&&i<SPY_LOCATIONS.length))]:s.round?[s.round.location-9]:[]};
}
const validSnapshot=value=>{const s=validateSpySession(value);return Array.isArray(s.players)?s:null;};
export function restoreSpySession(storage=browserStorage()){
 const current=restoreGameSession(storage,'spy','shared',validSnapshot);
 if(current)return current;
 try{return validSnapshot(JSON.parse(storage.getItem(SPY_STORAGE_KEY)))??{};}catch{return {};}
}
export function persistSpySession(state,storage=browserStorage()){
 return persistGameSession(storage,'spy','shared',state);
}

