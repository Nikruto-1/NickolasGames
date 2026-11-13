import test from "node:test";
import assert from "node:assert/strict";
import {initialCheckers,legalCheckersMoves,applyCheckersMove,validateCheckersState} from "../src/features/checkers/gameLogic.js";

const empty=(turn="white")=>({board:Array(64).fill(null),turn,forcedFrom:null,captured:[],winner:null,moveNumber:1});
const put=(s,index,side,king=false)=>{s.board[index]={side,king};return s;};

test("initial board contains 12 distinct pieces each and 7 white opening moves",()=>{
 const s=initialCheckers();
 assert.equal(s.board.filter(p=>p?.side==="white").length,12);
 assert.equal(s.board.filter(p=>p?.side==="black").length,12);
 assert.equal(s.board.filter(p=>p?.king).length,0);
 assert.equal(legalCheckersMoves(s).length,7);
 assert.equal(validateCheckersState(s),true);
});
test("white and black move diagonally forward and turns alternate",()=>{
 let s=initialCheckers();
 s=applyCheckersMove(s,40,33);
 assert.equal(s.turn,"black");
 assert.equal(s.board[40],null);
 assert.equal(s.board[33]?.side,"white");
 assert.equal(applyCheckersMove(s,33,26),s);
});
test("captures are mandatory across the entire board, even when backwards",()=>{
 const s=put(put(put(empty(),26,"white"),17,"black"),46,"white");
 const moves=legalCheckersMoves(s);
 assert.deepEqual(moves,[{from:26,to:8,capture:17}]);
 assert.equal(applyCheckersMove(s,46,37),s);
});
test("multi-capture locks the selected piece until all jumps end",()=>{
 const s=put(put(put(put(empty(),42,"white"),33,"black"),17,"black"),62,"white");
 let next=applyCheckersMove(s,42,24);
 assert.equal(next.forcedFrom,24);
 assert.deepEqual(next.captured,[33]);
 assert.equal(next.board[33]?.side,"black");
 assert.deepEqual(legalCheckersMoves(next),[{from:24,to:10,capture:17}]);
 next=applyCheckersMove(next,24,10);
 assert.equal(next.turn,"black");
 assert.equal(next.board[33],null);
 assert.equal(next.board[17],null);
 assert.equal(next.board[10]?.side,"white");
});
test("flying king can land on any empty square past a single enemy",()=>{
 const s=put(put(empty(),44,"white",true),26,"black");
 const moves=legalCheckersMoves(s);
 assert.deepEqual(moves.map(x=>x.to).sort((a,b)=>a-b),[8,17]);
});
test("promotion during a capture continues immediately as a flying king",()=>{
 const s=put(put(put(empty(),17,"white"),10,"black"),21,"black");
 let next=applyCheckersMove(s,17,3);
 assert.equal(next.board[3].king,true);
 assert.equal(next.forcedFrom,3);
 const options=legalCheckersMoves(next);
 assert.ok(options.some(m=>m.capture===21));
});
test("promotion on peaceful move creates a king",()=>{
 const s=put(put(empty(),9,"white"),62,"black");
 const next=applyCheckersMove(s,9,0);
 assert.equal(next.board[0].king,true);
});
test("winner when opponent has no pieces or legal moves",()=>{
 const s=put(put(empty(),17,"white"),10,"black");
 const next=applyCheckersMove(s,17,3);
 assert.equal(next.winner,"white");
});
test("corrupt saves are rejected",()=>{
 const s=initialCheckers();
 assert.equal(validateCheckersState({...s,board:s.board.slice(1)}),false);
 assert.equal(validateCheckersState({...s,board:s.board.map((p,i)=>i===0?{side:"white",king:false}:p)}),false);
 assert.equal(validateCheckersState({...s,turn:"purple"}),false);
});
