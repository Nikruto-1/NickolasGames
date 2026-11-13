import test from "node:test";
import assert from "node:assert/strict";
import {
 ALL_TRUTH_DARE_CATEGORIES, TRUTH_DARE_STORAGE, createTruthDareSession,
 chooseTruthDare, advanceTruthDare, readTruthDareSession, saveTruthDareSession,
 restoreTruthDareSession
} from "../src/features/truth-or-dare/session.js";
import { TRUTH_DARE_CARDS } from "../src/features/truth-or-dare/truthOrDare.uk.js";

function storage() {
 const values=new Map();
 return {
  getItem: key => values.get(key) ?? null,
  setItem: (key,value) => values.set(key,value),
  values
 };
}

test("selected question survives reload without losing card or progress",()=>{
 const db=storage();
 let state=createTruthDareSession(ALL_TRUTH_DARE_CATEGORIES,()=>0.5);
 state=chooseTruthDare(state,"truth");
 assert.equal(state.chosen,true);
 const id=state.queue[state.index];
 assert.equal(saveTruthDareSession(db,state),true);
 let restored=readTruthDareSession(db);
 assert.equal(restored.chosen,true);
 assert.equal(restored.queue[restored.index],id);
 assert.equal(TRUTH_DARE_CARDS.find(c=>c.id===id).type,"truth");
 restored=advanceTruthDare(restored,false);
 assert.equal(restored.index,1);
 assert.equal(restored.chosen,false);
 assert.equal(saveTruthDareSession(db,restored),true);
 assert.equal(readTruthDareSession(db).index,1);
});

test("skipped cards and selected categories round-trip",()=>{
 const db=storage();
 const categories=[ALL_TRUTH_DARE_CATEGORIES[0]];
 let state=chooseTruthDare(createTruthDareSession(categories),"dare");
 state=advanceTruthDare(state,true);
 assert.equal(state.skipped,1);
 assert.equal(state.queue.length,100);
 saveTruthDareSession(db,state);
 const restored=readTruthDareSession(db);
 assert.deepEqual(restored.categories,categories);
 assert.equal(restored.index,1);
 assert.equal(restored.skipped,1);
 assert.ok(restored.queue.every(id=>id.startsWith(categories[0]+"-")));
});

test("v2 legacy saves restore with a fresh choice, without erasing progress",()=>{
 const previous=createTruthDareSession();
 const legacy={categories:previous.categories,queue:previous.queue,index:3,skipped:2};
 const restored=restoreTruthDareSession(legacy);
 assert.equal(restored.index,3);
 assert.equal(restored.skipped,2);
 assert.equal(restored.chosen,false);
});

test("corrupted, malicious and inconsistent saves are rejected",()=>{
 const good=createTruthDareSession();
 for(const bad of [
  {...good,queue:[...good.queue,good.queue[0]]},
  {...good,queue:good.queue.slice(1)},
  {...good,queue:good.queue.map((id,i)=>i===0?"unknown":id)},
  {...good,index:-1},
  {...good,index:good.queue.length+1},
  {...good,skipped:-1},
  {...good,skipped:1},
  {...good,categories:[]},
  {...good,categories:[good.categories[0],good.categories[0]]},
  {...good,categories:["not-a-category"]}
 ]) assert.equal(restoreTruthDareSession(bad),null);
 const db=storage();
 db.values.set(TRUTH_DARE_STORAGE,"{not-json");
 assert.equal(readTruthDareSession(db),null);
});

test("storage errors do not crash or silently claim successful saving",()=>{
 const broken={getItem(){throw Error("denied")},setItem(){throw Error("quota")}};
 assert.equal(readTruthDareSession(broken),null);
 assert.equal(saveTruthDareSession(broken,createTruthDareSession()),false);
});

test("truth/dare selections never repeat a card within a deck",()=>{
 let state=createTruthDareSession([ALL_TRUTH_DARE_CATEGORIES[0]]);
 const played=new Set();
 for(let i=0;i<state.queue.length;i++){
  const desired=i%2===0?"truth":"dare";
  state=chooseTruthDare(state,desired);
  if(!state.chosen)state=chooseTruthDare(state,desired==="truth"?"dare":"truth");
  assert.equal(state.chosen,true);
  const card=state.queue[state.index];
  assert.equal(played.has(card),false);
  played.add(card);
  state=advanceTruthDare(state,i%3===0);
 }
 assert.equal(played.size,100);
 assert.equal(state.index,100);
 assert.equal(state.chosen,false);
});
