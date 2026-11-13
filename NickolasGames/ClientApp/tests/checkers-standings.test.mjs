import test from "node:test";
import assert from "node:assert/strict";
import { emptyCheckersStandings,validateCheckersStandings,recordCheckersWin,rankedCheckersSides } from "../src/features/checkers/standings.js";

test("checkers standings record wins once per game id",()=>{
  const initial=emptyCheckersStandings();
  const white=recordCheckersWin(initial,"game-1","white");
  const black=recordCheckersWin(white,"game-2","black");
  assert.equal(black.white,1);
  assert.equal(black.black,1);
  assert.equal(recordCheckersWin(black,"game-1","white"),black);
  assert.deepEqual(black.recent.map(r=>r.side),["black","white"]);
});
test("checkers ranking orders teams by wins",()=>{
  let s=emptyCheckersStandings();
  assert.deepEqual(rankedCheckersSides(s),["white","black"]);
  s=recordCheckersWin(s,"one","black");
  assert.deepEqual(rankedCheckersSides(s),["black","white"]);
});
test("invalid saved standings fall back safely",()=>{
  assert.equal(validateCheckersStandings({white:-1,black:0,recent:[],recorded:[]}),null);
  assert.equal(validateCheckersStandings({white:1,black:0,recent:[{side:"evil",id:"1"}],recorded:[]}),null);
  assert.deepEqual(validateCheckersStandings(emptyCheckersStandings()),emptyCheckersStandings());
});
