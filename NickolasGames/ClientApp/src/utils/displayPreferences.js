export const DISPLAY_KEY='nickolasgames-display-v1';
export const DEFAULT_DISPLAY=Object.freeze({motion:'system',largeText:false});
export function normalizeDisplay(value){return {motion:['system','reduced'].includes(value?.motion)?value.motion:'system',largeText:value?.largeText===true};}
export function readDisplay(storage){try{return normalizeDisplay(JSON.parse((storage??globalThis.localStorage).getItem(DISPLAY_KEY)||'null'));}catch{return normalizeDisplay(null);}}
export function saveDisplay(value,storage){try{(storage??globalThis.localStorage).setItem(DISPLAY_KEY,JSON.stringify(normalizeDisplay(value)));return true;}catch{return false;}}
export function applyDisplay(value,root=document.documentElement){const next=normalizeDisplay(value);root.dataset.gameMotion=next.motion;root.dataset.gameLargeText=String(next.largeText);}
