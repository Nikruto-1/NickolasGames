import { SPY_LOCATIONS } from './locations.js';
export const SPY_STORAGE_KEY='nickolasgames.spy.v1';
export function validateSpySession(s){
 if(!s||!Array.isArray(s.players)||s.players.length>20||!s.players.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=60)||new Set(s.players.map(p=>p.id)).size!==s.players.length||new Set(s.players.map(p=>p.name.trim().toLowerCase())).size!==s.players.length||!Array.isArray(s.votes)||!s.scores||typeof s.scores!=='object'||Array.isArray(s.scores)||![0,3,5,8,10].includes(s.duration)||!['discussion','vote','guess'].includes(s.phase))return {};
 if(s.round){
 const r=s.round,n=s.players.length;
 if(n<3||!Number.isInteger(r.spy)||r.spy<0||r.spy>=n||!Number.isInteger(r.location)||r.location<9||r.location>=9+SPY_LOCATIONS.length||!Number.isInteger(s.step)||s.step<0||s.step>n||s.votes.length>n||s.votes.some((id,i)=>!s.players.some((p,j)=>p.id===id&&i!==j))||(!s.finished&&s.votes.length===n)|| (s.finished&&typeof s.winner!=='boolean') || (s.step<n&&(s.phase!=='discussion'||s.finished||s.votes.length)))return {};
 }
 const scores=Object.fromEntries(s.players.map(p=>[p.id,Number.isSafeInteger(s.scores[p.id])&&s.scores[p.id]>=0?s.scores[p.id]:0]));
 const roundLimit=[1,3,5,10].includes(s.roundLimit)?s.roundLimit:5;
 return {...s,scores,roundLimit,roundNumber:s.round?Math.min(roundLimit,Math.max(1,Number.isSafeInteger(s.roundNumber)?s.roundNumber:1)):0,deadline:s.round&&!s.finished&&s.step===s.players.length&&Number.isFinite(s.deadline)&&s.deadline>0?s.deadline:null,locationHistory:Array.isArray(s.locationHistory)?[...new Set(s.locationHistory.filter(i=>Number.isInteger(i)&&i>=0&&i<SPY_LOCATIONS.length))]:s.round?[s.round.location-9]:[]};
}
export function restoreSpySession(){try{return validateSpySession(JSON.parse(localStorage.getItem(SPY_STORAGE_KEY)));}catch{return {};}}
