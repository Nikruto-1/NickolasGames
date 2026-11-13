import { squareIsDark } from "./gameLogic.js";
import { CatPiece } from "./CatPiece.jsx";
const coordinate=index=>"ABCDEFGH"[index%8]+(8-Math.floor(index/8));
export function CheckersBoard({t,game,indices,active,targets,moves,handleCell}){
  return (
<div className="ck-board-frame">
          <div className="ck-board" role="group" aria-label={t.local}>
            {indices.map(index=>{
              const piece=game.board[index],dark=squareIsDark(index);
              const possible=targets.includes(index);
              const selectable=moves.some(m=>m.from===index);
              const label=coordinate(index)+": "+(piece?(piece.side==="white"?t.white:t.black)+" "+(piece.king?t.king:t.cat):t.empty);
              return <button type="button" key={index} disabled={!dark}
                className={"ck-cell "+(dark?"ck-dark":"ck-light")+(active===index?" ck-selected":"")+(possible?" ck-target":"")+(selectable?" ck-movable":"")}
                onClick={()=>handleCell(index)} aria-label={label} aria-pressed={active===index} data-cell={index}>
                {piece && <CatPiece side={piece.side} king={piece.king}/>}
                {possible && <span className="ck-hint" aria-hidden="true"/>}
              </button>;
            })}
          </div>
        </div>
  );
}
