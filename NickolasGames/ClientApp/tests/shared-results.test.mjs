import test from 'node:test';
import assert from 'node:assert/strict';
import {readResults,saveResult,removeResult,clearResults} from '../src/utils/sharedResults.js';
test('results are idempotent, update scores, remove and clear',()=>{const m=new Map(),db={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};const r={id:'a',game:'checkers',outcome:'finished',rows:[{name:'@white',score:1}]};assert.ok(saveResult(r,db));assert.ok(saveResult(r,db));assert.equal(readResults(db).length,1);assert.ok(saveResult({...r,rows:[{name:'@white',score:2}]},db));assert.equal(readResults(db)[0].rows[0].score,2);assert.ok(removeResult('checkers','a',db));assert.equal(readResults(db).length,0);saveResult(r,db);assert.ok(clearResults(db));assert.equal(readResults(db).length,0);});
