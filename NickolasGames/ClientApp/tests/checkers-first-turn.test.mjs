import test from "node:test";
import assert from "node:assert/strict";
import {normalizeCheckersSettings,selectFirstSide,createCheckersMatch} from "../src/features/checkers/matchSettings.js";
import {legalCheckersMoves,applyCheckersMove} from "../src/features/checkers/gameLogic.js";

test("legacy saved bot settings retain mode and difficulty",()=>{
  assert.deepEqual(normalizeCheckersSettings({mode:"bot",level:"medium"}),{
    mode:"bot",level:"medium",starter:"white",humanSide:"white"
  });
});
test("random draw selects both possible colors without reordering the pieces",()=>{
  assert.equal(selectFirstSide("random",()=>0),"white");
  assert.equal(selectFirstSide("random",()=>0.99),"black");
  assert.equal(selectFirstSide("black",()=>0),"black");
  assert.equal(selectFirstSide("white",()=>1),"white");
  const black=createCheckersMatch("random",()=>0.9,"test");
  assert.equal(black.turn,"black");
  assert.equal(black.startingSide,"black");
  assert.equal(black.matchId,"test");
  assert.equal(black.board.filter(x=>x?.side==="black").length,12);
  assert.equal(black.board.filter(x=>x?.side==="white").length,12);
  assert.equal(legalCheckersMoves(black).length,7);
});
test("black can legally make the first move when selected",()=>{
  const start=createCheckersMatch("black");
  const move=legalCheckersMoves(start)[0];
  const next=applyCheckersMove(start,move.from,move.to);
  assert.equal(next.turn,"white");
  assert.equal(next.moveNumber,2);
  assert.equal(start.turn,"black");
});
