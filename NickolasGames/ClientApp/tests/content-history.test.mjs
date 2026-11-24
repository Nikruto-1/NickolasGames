import test from 'node:test';
import assert from 'node:assert/strict';
import {readHistory,rememberContent,nextContent,freshContent} from '../src/utils/contentHistory.js';
import {createTruthDareSession,restoreTruthDareSession} from '../src/features/truth-or-dare/session.js';
function storage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};}
test('new games exclude previously revealed content even after reload',()=>{
 const db=storage(),pool=['Apple','Pear','Orange'];
 rememberContent('alias','en',['Apple'],db);
 assert.deepEqual(new Set(nextContent('alias','en',pool,1,db)),new Set(['Pear','Orange']));
 rememberContent('alias','en',['Pear'],db);
 assert.deepEqual(nextContent('alias','en',pool,1,db),['Orange']);
 assert.deepEqual(readHistory('alias','en',db),['apple','pear']);
});
test('category switches retain history outside the selected pool',()=>{
 const history=['apple','pear','train'];
 const result=freshContent(['Apple','Pear'],history,1,()=>0);
 assert.equal(result.values.length,2);assert.deepEqual(result.history,['train']);
 assert.notEqual(result.values[0],'Pear');
});
test('enough new words for all players, unseen words always first',()=>{
 const result=freshContent(['A','B','C'],['a','b'],2,()=>0);
 assert.equal(result.values[0],'C');assert.equal(result.values.length,3);
});
test('history is separated by game and language and handles storage errors',()=>{
 const db=storage();rememberContent('alias','en',['Apple'],db);
 assert.deepEqual(readHistory('alias','uk',db),[]);
 assert.deepEqual(readHistory('whoami','en',db),[]);
 const bad={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
 assert.equal(rememberContent('alias','en',['Apple'],bad),false);
 assert.equal(nextContent('alias','en',['Apple'],1,bad).length,1);
});
test('partial truth dare deck restores without exposing or losing a chosen card',()=>{
 const full=createTruthDareSession();
 const partial={...full,queue:full.queue.slice(10),historyCycle:true,chosen:true};
 assert.deepEqual(restoreTruthDareSession(partial),partial);
 assert.equal(restoreTruthDareSession({...partial,queue:[partial.queue[0],partial.queue[0]]}),null);
});

test('legacy history normalizes case, whitespace, apostrophes and Unicode',()=>{
 const db=storage();db.setItem('nickolasgames-content-history-v1-alias-uk',JSON.stringify(["  П’ЯТНИЦЯ ","пʼятниця","Cafe\u0301","",null,123]));
 assert.deepEqual(readHistory('alias','uk',db),["п'ятниця","café"]);
 assert.deepEqual(nextContent('alias','uk',["П'ятниця","Café","Субота"],1,db),["Субота"]);
});
test('single-card draws across repeated sessions exhaust every unique word before repeating',()=>{
 const db=storage(),pool=['A','B','C','D','E',' a '];let previous;
 for(let cycle=0;cycle<20;cycle++){
  const seen=new Set();
  for(let i=0;i<5;i++){
   const word=nextContent('alias','en',pool,1,db)[0];const key=word.trim().toLowerCase();
   assert.ok(!seen.has(key));if(i===0&&previous!==undefined)assert.notEqual(key,previous);
   seen.add(key);rememberContent('alias','en',[word],db);previous=key;
  }
  assert.equal(seen.size,5);
 }
});
