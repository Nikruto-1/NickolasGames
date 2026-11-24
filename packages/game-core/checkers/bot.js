import { legalCheckersMoves, applyCheckersMove } from "./rules.js";

// Pure, reproducible checkers AI. The board engine remains the authority for legal moves.
// This helper returns exactly one legal step; the UI calls it again for forced capture chains.
export const BOT_LEVELS = Object.freeze(["easy", "medium", "hard"]);

function evaluate(state, side) {
  if (state.winner) return state.winner === side ? 100000 : -100000;
  if (state.draw) return 0;
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const piece = state.board[i];
    if (!piece || state.captured.includes(i)) continue;
    const value = piece.king ? 180 : 100;
    const row = Math.floor(i / 8);
    const advancement = piece.king ? 0 : (piece.side === "white" ? 7 - row : row) * 4;
    const center = (3.5 - Math.abs(3.5 - i % 8)) * 2;
    score += (piece.side === side ? 1 : -1) * (value + advancement + center);
  }
  return score;
}

// Penalize allowing a capturing reply; bonus for promotion, completing a chain,
// and creating positions from which the opponent has few choices.
function scoreMove(state, move, side) {
  const next = applyCheckersMove(state, move.from, move.to);
  let score = evaluate(next, side);
  if (move.capture !== null) score += 22;
  if (state.board[move.from]?.king === false && next.board[move.to]?.king) score += 24;
  const responses = legalCheckersMoves(next);
  if (next.turn !== state.turn && responses.some(m => m.capture !== null)) {
    score -= 36;
    // Estimate worst material loss from the opponent's immediate forced capture.
    let minScore = Infinity;
    for (const reply of responses) {
      const replyState = applyCheckersMove(next, reply.from, reply.to);
      minScore = Math.min(minScore, evaluate(replyState, side));
    }
    if (Number.isFinite(minScore)) score = (score * 0.35) + (minScore * 0.65);
  } else if (next.turn === state.turn && responses.length) {
    // A multi-capture sequence is not over. Favor useful continuation.
    score += 26 + responses.filter(m => m.capture !== null).length * 3;
  }
  return score;
}

// Iterative deepening: keep the last fully searched result, never a partial ranking.
// Depth counts completed turns, not individual jumps in a forced capture chain.
function hardMove(state,moves,unit){
 const side=state.turn;
 const budget={remaining:1800};
 const exhausted=Symbol("search budget");
 const search=(position,depth,alpha,beta)=>{
  if(--budget.remaining<0)throw exhausted;
  if(position.winner||position.draw||(depth<=0&&position.forcedFrom===null))return evaluate(position,side);
  const legal=legalCheckersMoves(position);
  if(!legal.length)return position.turn===side?-100000:100000;
  const maximizing=position.turn===side;
  let best=maximizing?-Infinity:Infinity;
  for(const move of legal){
   const next=applyCheckersMove(position,move.from,move.to);
   const score=search(next,depth-Number(next.turn!==position.turn),alpha,beta);
   if(maximizing){best=Math.max(best,score);alpha=Math.max(alpha,best);}
   else{best=Math.min(best,score);beta=Math.min(beta,best);}
   if(alpha>=beta)break;
  }
  return best;
 };
 let ranked=moves.map(move=>({move,value:scoreMove(state,move,side)})).sort((a,b)=>b.value-a.value);
 for(let depth=1;depth<=4;depth++){
  try{
   const nextRanking=ranked.map(({move})=>{
    const next=applyCheckersMove(state,move.from,move.to);
    return {move,value:search(next,depth-Number(next.turn!==state.turn),-Infinity,Infinity)};
   });
   ranked=nextRanking.sort((a,b)=>b.value-a.value);
  }catch(error){if(error!==exhausted)throw error;break;}
 }
 const best=ranked.filter(x=>x.value===ranked[0].value);
 return best[Math.min(best.length-1,Math.floor(Math.max(0,Number.isFinite(unit)?unit:0)*best.length))].move;
}

export function chooseCheckersBotMove(state, level = "easy", random = Math.random) {
  const moves = legalCheckersMoves(state);
  if (!moves.length) return null;
  const unit = Number(random());
  const index = Math.min(moves.length - 1, Math.max(0, Math.floor((Number.isFinite(unit) ? unit : 0) * moves.length)));
  if (moves.length === 1) return moves[0];
  if (level === "hard") return hardMove(state,moves,unit);
  if (level !== "medium") return moves[index];

  const ratings = moves.map(move => ({ move, value: scoreMove(state, move, state.turn) }));
  const highest = Math.max(...ratings.map(item => item.value));
  const best = ratings.filter(item => Math.abs(item.value - highest) < 0.00001);
  return best[Math.min(best.length - 1, Math.floor((Number.isFinite(unit) ? Math.max(0,unit) : 0) * best.length))].move;
}
