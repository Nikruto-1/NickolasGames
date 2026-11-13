import { useEffect,useRef } from "react";
import { CatPiece } from "./CatPiece.jsx";
export function CheckersResultModal({t,game,victoryOpen,setVictoryOpen,startNewGame}){
  const closeVictory=useRef(null),previouslyFocused=useRef(null);
  useEffect(()=>{
    if(!victoryOpen)return;
    previouslyFocused.current=document.activeElement;
    closeVictory.current?.focus();
    const onKey=event=>{
      if(event.key==="Escape"){event.preventDefault();setVictoryOpen(false);}
      if(event.key==="Tab"){
        const elements=[...document.querySelectorAll(".ck-victory-dialog button")];
        if(!elements.length)return;
        const first=elements[0],last=elements[elements.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener("keydown",onKey);
    return ()=>{document.removeEventListener("keydown",onKey);if(previouslyFocused.current?.isConnected)previouslyFocused.current.focus();};
  },[victoryOpen,setVictoryOpen]);
  return (
{victoryOpen && (game.winner || game.draw) && <div className="ck-victory-backdrop">
        <div className="ck-victory-dialog" role="dialog" aria-modal="true" aria-labelledby="ck-victory-title" aria-describedby="ck-victory-desc">
          <div className="ck-victory-sparks" aria-hidden="true">✦ ✧ ✦</div>
          <div className="ck-victory-cat">{game.draw?<span aria-hidden="true">⚖</span>:<CatPiece side={game.winner} king={true}/>}</div>
          <p className="ck-victory-overline">NICKOLASGAMES</p>
          <h2 id="ck-victory-title">{game.draw?t.drawTitle:t.winnerTitle}</h2>
          <h3>{game.draw?t.drawDescription:game.winner==="white"?t.whiteWin:t.blackWin}</h3>
          <p id="ck-victory-desc">{game.draw?(game.drawReason==="repetition"?t.drawRepetition:t.drawQuiet):t.congrats}</p>
          <div className="ck-victory-actions">
            <button type="button" className="ck-victory-restart" ref={closeVictory} onClick={()=>startNewGame()}>{t.again}</button>
            <button type="button" className="ck-victory-close" onClick={()=>setVictoryOpen(false)}>{t.close}</button>
          </div>
        </div>
      </div>}
  );
}
