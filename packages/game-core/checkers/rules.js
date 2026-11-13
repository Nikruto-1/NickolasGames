// 8x8 Russian-style checkers: mandatory capture, backward captures,
// flying kings and immediate crowning during a capture chain.
export const SIDES = ["white", "black"];
export const squareIsDark = (index) => (Math.floor(index / 8) + index % 8) % 2 === 1;
const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
const inside = (r,c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const indexAt = (r,c) => r * 8 + c;
const point = (index) => [Math.floor(index / 8),index % 8];
const enemy = (side) => side === "white" ? "black" : "white";

export function initialCheckers() {
  const board = Array(64).fill(null);
  for (let i=0;i<64;i++) {
    const row = Math.floor(i/8);
    if (!squareIsDark(i)) continue;
    if (row < 3) board[i] = {side:"black",king:false};
    if (row > 4) board[i] = {side:"white",king:false};
  }
  return {board,turn:"white",forcedFrom:null,captured:[],winner:null,moveNumber:1};
}

function captureSteps(board,from,pending = []) {
  const piece = board[from];
  if (!piece) return [];
  const [r,c]=point(from),result=[];
  for (const [dr,dc] of directions) {
    if (piece.king) {
      let row=r+dr,col=c+dc,over=null;
      while (inside(row,col)) {
        const pos=indexAt(row,col),item=board[pos];
        if (item) {
          if (item.side === piece.side || pending.includes(pos) || over !== null) break;
          over=pos;
        } else if(over !== null) {
          result.push({from,to:pos,capture:over});
        }
        row+=dr;col+=dc;
      }
    } else {
      const middleR=r+dr,middleC=c+dc,endR=r+dr*2,endC=c+dc*2;
      if (!inside(endR,endC)) continue;
      const middle=indexAt(middleR,middleC),to=indexAt(endR,endC);
      if (board[middle] && board[middle].side !== piece.side && !pending.includes(middle) && !board[to])
        result.push({from,to,capture:middle});
    }
  }
  return result;
}

function peacefulSteps(board,from) {
  const piece=board[from];
  if (!piece) return [];
  const [r,c]=point(from),result=[];
  for (const [dr,dc] of directions) {
    if (!piece.king && (piece.side === "white" ? dr !== -1 : dr !== 1)) continue;
    let row=r+dr,col=c+dc;
    while (inside(row,col) && !board[indexAt(row,col)]) {
      result.push({from,to:indexAt(row,col),capture:null});
      if (!piece.king) break;
      row+=dr;col+=dc;
    }
  }
  return result;
}

export function legalCheckersMoves(state) {
  if (!state || state.winner) return [];
  const {board,turn,forcedFrom,captured}=state;
  if (forcedFrom !== null) return captureSteps(board,forcedFrom,captured);
  const captures=[],quiet=[];
  for (let i=0;i<64;i++) if (board[i]?.side === turn) {
    captures.push(...captureSteps(board,i));
    quiet.push(...peacefulSteps(board,i));
  }
  return captures.length ? captures : quiet;
}

export function applyCheckersMove(state,from,to) {
  const move=legalCheckersMoves(state).find(m=>m.from===from && m.to===to);
  if (!move) return state;
  const board=state.board.slice();
  const moving=board[from];
  board[from]=null;
  const row=Math.floor(to/8);
  const crown=!moving.king && (moving.side==="white" ? row===0 : row===7);
  board[to]={side:moving.side,king:moving.king||crown};
  const captured=move.capture===null ? [] : [...state.captured,move.capture];

  // Captured pieces block the path until the multi-jump is complete.
  if (move.capture !== null && captureSteps(board,to,captured).length)
    return {...state,board,forcedFrom:to,captured};

  for (const p of captured) board[p]=null;
  const turn=enemy(state.turn);
  const next={board,turn,forcedFrom:null,captured:[],winner:null,moveNumber:state.moveNumber+1};
  if (!board.some(piece=>piece?.side===turn) || legalCheckersMoves(next).length===0)
    next.winner=state.turn;
  return next;
}

export function validateCheckersState(s) {
  if (!s || !Array.isArray(s.board) || s.board.length!==64 || !SIDES.includes(s.turn) ||
      !Number.isSafeInteger(s.moveNumber) || s.moveNumber < 1 ||
      ![null,...SIDES].includes(s.winner) ||
      !(s.forcedFrom === null || (Number.isInteger(s.forcedFrom) && s.forcedFrom >= 0 && s.forcedFrom < 64)) ||
      !Array.isArray(s.captured) || s.captured.some(n=>!Number.isInteger(n)||n<0||n>=64) ||
      new Set(s.captured).size!==s.captured.length) return false;
  if (s.board.some((piece,i)=>piece &&
      (!squareIsDark(i) || !SIDES.includes(piece.side) || typeof piece.king!=="boolean"))) return false;
  if (s.forcedFrom !== null && (s.board[s.forcedFrom]?.side!==s.turn || !s.captured.length)) return false;
  return true;
}
