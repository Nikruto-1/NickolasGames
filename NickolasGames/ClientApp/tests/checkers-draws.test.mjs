import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCheckersMove,initialCheckers,legalCheckersMoves,checkersPositionKey,
  KING_QUIET_PLY_LIMIT,validateCheckersState
} from "../../../packages/game-core/checkers/rules.js";
import {chooseCheckersBotMove} from "../../../packages/game-core/checkers/bot.js";

const setup=()=>({...initialCheckers(),board:Array(64).fill(null),positionCounts:{}});
const piece=(state,pos,side,king=true)=>{state.board[pos]={side,king};return state;};

test("threefold occurrence of the same position with the same player to move draws the game",()=>{
  let s=piece(piece(setup(),40,"white"),23,"black");
  s.positionCounts={[checkersPositionKey(s.board,s.turn)]:1};
  const cycle=[[40,33],[23,30],[33,40],[30,23]];
  for(const [from,to] of cycle){
    assert.ok(legalCheckersMoves(s).some(m=>m.from===from&&m.to===to));
    s=applyCheckersMove(s,from,to);
  }
  assert.equal(s.draw,false,"second occurrence should not end the game");
  for(const [from,to] of cycle)s=applyCheckersMove(s,from,to);
  assert.equal(s.draw,true);
  assert.equal(s.drawReason,"repetition");
  assert.equal(s.winner,null);
  assert.deepEqual(legalCheckersMoves(s),[]);
  assert.equal(chooseCheckersBotMove(s,"medium"),null);
  assert.equal(applyCheckersMove(s,40,33),s);
});

test("30 completed king-only half-moves without capture or man movement result in a draw",()=>{
  let s=piece(piece(setup(),40,"white"),23,"black");
  s.quietKingPlies=KING_QUIET_PLY_LIMIT-1;
  const next=applyCheckersMove(s,40,33);
  assert.equal(next.draw,true);
  assert.equal(next.drawReason,"kingQuietMoves");
  assert.equal(next.quietKingPlies,KING_QUIET_PLY_LIMIT);
});

test("ordinary-piece movement resets the no-progress clock",()=>{
  const s=piece(piece(setup(),40,"white",false),23,"black");
  s.quietKingPlies=KING_QUIET_PLY_LIMIT-1;
  const next=applyCheckersMove(s,40,33);
  assert.equal(next.quietKingPlies,0);
  assert.equal(next.draw,false);
});

test("a capture does not advance repetition counts before the forced chain ends",()=>{
  let s=piece(piece(piece(piece(setup(),42,"white",false),33,"black",false),17,"black",false),62,"white",false);
  const next=applyCheckersMove(s,42,24);
  assert.equal(next.forcedFrom,24);
  assert.equal(next.moveNumber,1);
  assert.deepEqual(next.positionCounts,{});
  assert.equal(next.draw,false);
  const done=applyCheckersMove(next,24,10);
  assert.equal(done.moveNumber,2);
  assert.equal(Object.values(done.positionCounts).reduce((a,b)=>a+b,0),1);
});

test("a captured king's victim still blocks lines within a multiple-capture turn",()=>{
  let s=piece(piece(piece(setup(),44,"white"),26,"black"),10,"black");
  let next=applyCheckersMove(s,44,17);
  assert.equal(next.forcedFrom,17);
  const steps=legalCheckersMoves(next);
  assert.ok(steps.length>0 && steps.every(m=>m.capture===10),"cannot jump previously captured piece at 26");
  assert.ok(steps.some(m=>m.to===3),"king may continue on another diagonal");
  next=applyCheckersMove(next,17,3);
  assert.equal(next.captured.length,0);
  assert.equal(next.board[26],null);
  assert.equal(next.board[10],null);
});

test("legacy saved games without draw fields remain restorable",()=>{
  const old=initialCheckers();
  delete old.draw; delete old.drawReason; delete old.positionCounts; delete old.quietKingPlies;
  assert.equal(validateCheckersState(old),true);
  const next=applyCheckersMove(old,40,33);
  assert.equal(next.draw,false);
  assert.equal(validateCheckersState(next),true);
});
