import { contentKey, freshContent } from '../../../../packages/game-core/shared/contentHistory.js';
export { contentKey, freshContent };
const key=(game,lang)=>'nickolasgames-content-history-v1-'+game+'-'+lang;
export function readHistory(game,lang,storage){
 try{const data=JSON.parse((storage??globalThis.localStorage).getItem(key(game,lang))||'[]');return Array.isArray(data)?[...new Set(data.filter(v=>typeof v==='string'&&v.trim()).map(contentKey))]:[];}catch{return [];}
}
export function writeHistory(game,lang,history,storage){
 try{(storage??globalThis.localStorage).setItem(key(game,lang),JSON.stringify([...new Set(history.filter(v=>typeof v==='string'&&v.trim()).map(contentKey))]));return true;}catch{return false;}
}
export function rememberContent(game,lang,values,storage){
 return writeHistory(game,lang,[...readHistory(game,lang,storage),...values.filter(v=>typeof v==='string'&&v.trim()).map(contentKey)],storage);
}
export function nextContent(game,lang,values,minimum=1,storage){
 const result=freshContent(values,readHistory(game,lang,storage),minimum);
 writeHistory(game,lang,result.history,storage);return result.values;
}
