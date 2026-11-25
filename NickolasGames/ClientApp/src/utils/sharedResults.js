function resolveStorage(storage){return storage===undefined?globalThis.localStorage:storage;}
export const RESULTS_KEY='nickolasgames-results-v1';
export const DISMISSED_RESULTS_KEY='nickolasgames-results-dismissed-v1';
const identity=(game,id)=>JSON.stringify([game,id]);
function readDismissed(storage){try{const value=JSON.parse(storage.getItem(DISMISSED_RESULTS_KEY)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];}catch{return [];}}
function dismiss(records,storage){const ids=[...new Set([...records.map(r=>identity(r.game,r.id)),...readDismissed(storage)])].slice(0,1000);storage.setItem(DISMISSED_RESULTS_KEY,JSON.stringify(ids));}
export const RESULT_GAMES=['whoami','crocodile','alias','spy','checkers','truth'];
export const resultId=()=>globalThis.crypto.randomUUID();
export function readResults(storage){
 try{storage=resolveStorage(storage);const raw=JSON.parse(storage.getItem(RESULTS_KEY)||'[]');return Array.isArray(raw)?raw.filter(r=>r&&typeof r.id==='string'&&RESULT_GAMES.includes(r.game)&&Number.isFinite(r.at)&&Array.isArray(r.rows)&&r.rows.every(x=>x&&typeof x.name==='string'&&Number.isFinite(x.score))&&['finished','draw','exhausted','summary'].includes(r.outcome)).slice(0,200):[];}catch{return [];}
}
export function saveResult(record,storage){
 try{storage=resolveStorage(storage);if(!record.id||!RESULT_GAMES.includes(record.game))return false;if(readDismissed(storage).includes(identity(record.game,record.id)))return true;const old=readResults(storage);const prior=old.find(r=>r.id===record.id&&r.game===record.game);const value={...record,at:prior?.at??Date.now()};if(prior&&JSON.stringify(prior)===JSON.stringify(value))return true;storage.setItem(RESULTS_KEY,JSON.stringify([value,...old.filter(r=>r.id!==record.id||r.game!==record.game)].slice(0,200)));return true;}catch{return false;}
}
export function removeResult(game,id,storage){try{storage=resolveStorage(storage);storage.setItem(RESULTS_KEY,JSON.stringify(readResults(storage).filter(r=>r.game!==game||r.id!==id)));return true;}catch{return false;}}
export function dismissResult(game,id,storage){try{storage=resolveStorage(storage);dismiss([{game,id}],storage);return removeResult(game,id,storage);}catch{return false;}}
export function clearResults(storage){try{storage=resolveStorage(storage);dismiss(readResults(storage),storage);storage.removeItem(RESULTS_KEY);return true;}catch{return false;}}
