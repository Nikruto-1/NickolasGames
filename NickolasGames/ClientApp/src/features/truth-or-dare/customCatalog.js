import {TRUTH_DARE_CARDS,TRUTH_DARE_CATEGORIES} from './truthOrDare.uk.js';
import {normalizeLibrary} from '../../utils/customLibrary.js';
import {contentKey} from '../../utils/contentHistory.js';
export function truthCatalog(items=[],lang='uk'){
 const decks=(normalizeLibrary(items)||[]).filter(x=>x.game==='truth'&&x.lang===lang);
 const categories=decks.map(x=>({id:'custom:'+encodeURIComponent(x.id),name:'★ '+x.name,description:'',count:x.levels.truth.length+x.levels.dare.length}));
 const cards=decks.flatMap((x,i)=>['truth','dare'].flatMap(type=>x.levels[type].map(text=>({id:categories[i].id+':'+type+':'+encodeURIComponent(contentKey(text)),category:categories[i].id,type,text,challenge:null}))));
 return {categories:[...TRUTH_DARE_CATEGORIES,...categories],cards:[...TRUTH_DARE_CARDS,...cards]};
}
// Active custom decks carry a validated snapshot, independent of subsequent edits or language changes.
export function sessionCatalog(session){
 return truthCatalog(session?.customDecks||[],session?.customLang||'uk');
}
export function snapshotDecks(items,lang,categories){
 return (normalizeLibrary(items)||[]).filter(x=>x.game==='truth'&&x.lang===lang&&categories.includes('custom:'+encodeURIComponent(x.id)));
}
