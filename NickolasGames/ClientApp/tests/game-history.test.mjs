import test from "node:test";
import assert from "node:assert/strict";
import {initialCheckers,applyCheckersMove,validateCheckersState} from "../src/features/checkers/gameLogic.js";
import {MAX_GAME_HISTORY,appendGameHistory,restoreGameTimeline,rewindGameHistory} from "../src/utils/gameHistory.js";
import {gameSessionKey,persistGameSession,restoreGameSession} from "../src/utils/gameSession.js";

const valid=s=>validateCheckersState(s);
const initialize=()=>({...initialCheckers(),matchId:"match-one",flipped:false,history:[]});
test("checkers undo history persists atomically inside its current state envelope",()=>{
  const storage=new Map();
  const adapter={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  let game=initialize();
  const first=applyCheckersMove(game,40,33);
  game=appendGameHistory(game,{...first,matchId:game.matchId},valid);
  assert.equal(game.moveNumber,2);
  assert.equal(game.history.length,1);
  assert.equal(persistGameSession(adapter,"checkers","shared",game),true);
  const restored=restoreGameSession(adapter,"checkers","shared",s=>restoreGameTimeline(s,valid));
  assert.equal(restored.history.length,1);
  const undone=rewindGameHistory(restored,()=>true,valid);
  assert.equal(undone.moveNumber,1);
  assert.equal(undone.board[40]?.side,"white");
  assert.equal(undone.history.length,0);
  assert.equal(undone.matchId,"match-one");
  assert.equal(storage.has(gameSessionKey("checkers","shared")),true);
});
test("bot can undo both turns after a reload, retaining its saved board orientation",()=>{
  let s=initialize();
  s=appendGameHistory(s,applyCheckersMove(s,40,33),valid);
  s=appendGameHistory(s,applyCheckersMove(s,17,24),valid);
  s.flipped=true;
  const persisted=JSON.parse(JSON.stringify(s));
  const restored=restoreGameTimeline(persisted,valid);
  const rewind=rewindGameHistory(restored,h=>h.turn==="white"&&h.forcedFrom===null,valid);
  assert.equal(rewind.moveNumber,1);
  assert.equal(rewind.flipped,true);
  assert.equal(rewind.history.length,0);
});
test("legacy sessions and corrupt history migrate without discarding valid boards",()=>{
  const legacy=initialCheckers();
  const migrated=restoreGameTimeline(legacy,valid,()=>"legacy-session");
  assert.equal(migrated.matchId,"legacy-session");
  assert.deepEqual(migrated.history,[]);
  assert.equal(migrated.flipped,false);
  const corrupted=restoreGameTimeline({...legacy,history:[{garbage:1},null,{...legacy,history:[]}]},valid);
  assert.deepEqual(corrupted.history,[]);
  assert.equal(restoreGameTimeline({...legacy,board:[]},valid),null);
});
test("timeline history remains bounded without nested copies",()=>{
  let state=initialize();
  for(let i=0;i<110;i++) state=appendGameHistory(state,{...state,moveNumber:state.moveNumber+1},valid);
  assert.equal(state.history.length,MAX_GAME_HISTORY);
  assert.equal(state.history.every(entry=>!Object.hasOwn(entry,"history")),true);
  const rewind=rewindGameHistory(state,()=>true,valid);
  assert.equal(rewind.history.length,MAX_GAME_HISTORY-1);
});
