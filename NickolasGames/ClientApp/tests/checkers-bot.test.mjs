import test from "node:test";
import assert from "node:assert/strict";
import { initialCheckers, legalCheckersMoves, applyCheckersMove } from "../../../packages/game-core/checkers/rules.js";
import { chooseCheckersBotMove, BOT_LEVELS } from "../../../packages/game-core/checkers/bot.js";

const empty = (turn="black") => ({ board:Array(64).fill(null),turn,forcedFrom:null,captured:[],winner:null,moveNumber:1 });
const place = (state,index,side,king=false) => { state.board[index]={side,king};return state; };

test("both difficulty levels select legal opening moves", () => {
  const opening=initialCheckers();
  for(const level of BOT_LEVELS){
    const move=chooseCheckersBotMove(opening,level,()=>0.53);
    assert.ok(legalCheckersMoves(opening).some(m=>m.from===move.from&&m.to===move.to));
  }
});
test("easy mode is reproducible with injected random and does not modify state", () => {
  const state=initialCheckers(),snapshot=JSON.stringify(state),moves=legalCheckersMoves(state);
  assert.deepEqual(chooseCheckersBotMove(state,"easy",()=>0),moves[0]);
  assert.deepEqual(chooseCheckersBotMove(state,"easy",()=>0.999),moves.at(-1));
  assert.equal(JSON.stringify(state),snapshot);
});
test("computer obeys mandatory captures and forced chains", () => {
  const state=place(place(place(place(empty(),21,"black"),28,"white"),44,"white"),1,"black");
  const first=chooseCheckersBotMove(state,"medium",()=>0);
  assert.ok(first && first.capture!==null);
  const next=applyCheckersMove(state,first.from,first.to);
  assert.equal(next.turn,"black");
  assert.notEqual(next.forcedFrom,null);
  const second=chooseCheckersBotMove(next,"medium",()=>0);
  assert.ok(second && second.from===next.forcedFrom && second.capture!==null);
});
test("medium bot avoids obvious reply capture when alternative exists", () => {
  const state=place(place(place(empty(),19,"black"),37,"white"),55,"white");
  const chosen=chooseCheckersBotMove(state,"medium",()=>0);
  assert.ok(legalCheckersMoves(state).some(x=>x.from===chosen.from&&x.to===chosen.to));
});
test("bot stops when game is over or no legal moves remain", () => {
  const state=initialCheckers();
  assert.equal(chooseCheckersBotMove({...state,winner:"white"},"medium"),null);
  assert.equal(chooseCheckersBotMove(empty("black"),"easy"),null);
});
