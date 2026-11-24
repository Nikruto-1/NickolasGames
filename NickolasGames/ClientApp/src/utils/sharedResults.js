export const RESULTS_KEY='nickolasgames-results-v1';
export const RESULT_GAMES=['whoami','crocodile','alias','spy','checkers','truth'];
export const resultId=()=>globalThis.crypto.randomUUID();
export function readResults(storage=globalThis.localStorage){
 try{const raw=JSON.parse(storage.getItem(RESULTS_KEY)||'[]');return Array.isArray(raw)?raw.filter(r=>r&&typeof r.id==='string'&&RESULT_GAMES.includes(r.game)&&Number.isFinite(r.at)&&Array.isArray(r.rows)&&r.rows.every(x=>x&&typeof x.name==='string'&&Number.isFinite(x.score))&&['finished','draw','exhausted','summary'].includes(r.outcome)).slice(0,200):[];}catch{return [];}
}
export function saveResult(record,storage=globalThis.localStorage){
 try{if(!record.id||!RESULT_GAMES.includes(record.game))return false;const old=readResults(storage);const prior=old.find(r=>r.id===record.id&&r.game===record.game);const value={...record,at:prior?.at??Date.now()};if(prior&&JSON.stringify(prior)===JSON.stringify(value))return true;storage.setItem(RESULTS_KEY,JSON.stringify([value,...old.filter(r=>r.id!==record.id||r.game!==record.game)].slice(0,200)));return true;}catch{return false;}
}
export function removeResult(game,id,storage=globalThis.localStorage){try{storage.setItem(RESULTS_KEY,JSON.stringify(readResults(storage).filter(r=>r.game!==game||r.id!==id)));return true;}catch{return false;}}
export function clearResults(storage=globalThis.localStorage){try{storage.removeItem(RESULTS_KEY);return true;}catch{return false;}}
