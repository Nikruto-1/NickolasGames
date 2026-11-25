import test from 'node:test';
import assert from 'node:assert/strict';
import {readResults,saveResult,removeResult,dismissResult,clearResults} from '../src/utils/sharedResults.js';
test('results are idempotent, update scores, remove and clear',()=>{const m=new Map(),db={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};const r={id:'a',game:'checkers',outcome:'finished',rows:[{name:'@white',score:1}]};assert.ok(saveResult(r,db));assert.ok(saveResult(r,db));assert.equal(readResults(db).length,1);assert.ok(saveResult({...r,rows:[{name:'@white',score:2}]},db));assert.equal(readResults(db)[0].rows[0].score,2);assert.ok(removeResult('checkers','a',db));assert.equal(readResults(db).length,0);saveResult(r,db);assert.ok(clearResults(db));assert.equal(readResults(db).length,0);});

test('deleted history cannot reappear when a finished game restores, but undo may be replayed',()=>{
 const m=new Map(),db={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 const r={id:'a',game:'whoami',outcome:'summary',rows:[{name:'Player',score:1}]};
 assert.ok(saveResult(r,db));assert.ok(dismissResult(r.game,r.id,db));assert.ok(saveResult(r,db));assert.equal(readResults(db).length,0);
 const second={...r,id:'b'};assert.ok(saveResult(second,db));assert.ok(removeResult(second.game,second.id,db));assert.ok(saveResult(second,db));assert.equal(readResults(db).length,1);
 assert.ok(clearResults(db));assert.ok(saveResult(second,db));assert.equal(readResults(db).length,0);
});


test('history remains usable when accessing localStorage itself throws',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError');}});
 try{
  assert.deepEqual(readResults(),[]);
  assert.equal(saveResult({id:'a',game:'checkers',outcome:'finished',rows:[{name:'A',score:1}]}),false);
  assert.equal(removeResult('checkers','a'),false);
  assert.equal(dismissResult('checkers','a'),false);
  assert.equal(clearResults(),false);
 }finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
});
test('history safely handles corrupted entries and denied writes',()=>{
 const db={getItem:()=>'{bad json',setItem(){throw new Error('QuotaExceededError');},removeItem(){throw new Error('SecurityError');}};
 assert.deepEqual(readResults(db),[]);
 assert.equal(saveResult({id:'a',game:'spy',outcome:'finished',rows:[{name:'A',score:1}]},db),false);
 assert.equal(clearResults(db),false);
});
