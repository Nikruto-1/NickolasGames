import {contentKey} from './contentHistory.js';
export const LIBRARY_KEY='nickolasgames-custom-library-v1';
export const LIBRARY_GAMES=['whoami','crocodile','alias'];
export const LEVELS=['easy','medium','hard'];
export function normalizeLibrary(raw){
 if(!Array.isArray(raw)||raw.length>50)return null;
 const ids=new Set(),names=new Set(),result=[];
 for(const item of raw){
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.trim().length>60||!LIBRARY_GAMES.includes(item.game)||!['uk','en','sv','de','es'].includes(item.lang))return null;
  const name=item.name.trim(),key=item.game+'|'+item.lang+'|'+contentKey(name);
  if(names.has(key))return null;
  ids.add(item.id);names.add(key);
  const levels={},seen=new Set();
  for(const level of LEVELS){
   const words=item.levels?.[level];if(!Array.isArray(words)||words.length>200)return null;
   levels[level]=[];
   for(const value of words){
    if(typeof value!=='string'||!value.trim()||value.trim().length>180)return null;
    const text=value.trim(),k=contentKey(text);if(seen.has(k))continue;seen.add(k);levels[level].push(text);
   }
  }
  if(!seen.size||item.game==='crocodile'&&LEVELS.some(l=>!levels[l].length))return null;
  result.push({id:item.id,name,game:item.game,lang:item.lang,levels});
 }
 return result;
}
export function readLibrary(storage){try{return normalizeLibrary(JSON.parse((storage??globalThis.localStorage).getItem(LIBRARY_KEY)||'[]'))||[];}catch{return [];}}
export function saveLibrary(items,storage){const valid=normalizeLibrary(items);if(!valid)return false;try{(storage??globalThis.localStorage).setItem(LIBRARY_KEY,JSON.stringify(valid));return true;}catch{return false;}}
export function libraryCategories(items,game,lang,builtIn={}){
 const result={...builtIn};
 for(const item of items.filter(x=>x.game===game&&x.lang===lang)){
  let label='★ '+item.name;while(Object.hasOwn(result,label))label+=' ·';
  result[label]=item.levels;
 }
 return result;
}
export function gamesWithLibrary(games,items,lang){
 return {...games,...Object.fromEntries(LIBRARY_GAMES.map(game=>[game,{...games[game],c:libraryCategories(items,game,lang,games[game].c)}]))};
}
