import { CatPiece } from "./CatPiece.jsx";
export function CheckersControls({t,game,modeSettings,againstBot,drawing,drawResult,humanSide,botTurn,mustCapture,moves,
  changeMode,changeFirst,changeHumanSide,setModeSettings,setFlipped,undo,reset,history,storageOk,count,flipped}){
  return (
<aside className="ck-sidebar">
            <div className="ck-opponent-panel" aria-label={t.mode}>
              <span className="ck-opponent-label">{t.mode}</span>
              <div className="ck-opponent-choices" role="group" aria-label={t.mode}>
                <button type="button" aria-pressed={!againstBot} className={!againstBot?"is-active":""} disabled={drawing} onClick={()=>changeMode("friend")}>{t.vsFriend}</button>
                <button type="button" aria-pressed={againstBot} className={againstBot?"is-active":""} disabled={drawing} onClick={()=>changeMode("bot")}>{t.vsBot}</button>
              </div>
              <div className="ck-start-choice">
                <span className="ck-opponent-label">{t.firstTurn}</span>
                <div className="ck-start-buttons" role="group" aria-label={t.firstTurn}>
                  <button type="button" disabled={drawing} aria-pressed={modeSettings.starter==="white"} className={modeSettings.starter==="white"?"is-active":""} onClick={()=>changeFirst("white")}>{t.firstWhite}</button>
                  <button type="button" disabled={drawing} aria-pressed={modeSettings.starter==="black"} className={modeSettings.starter==="black"?"is-active":""} onClick={()=>changeFirst("black")}>{t.firstBlack}</button>
                  <button type="button" disabled={drawing} aria-pressed={modeSettings.starter==="random"} className={modeSettings.starter==="random"?"is-active":""} onClick={()=>changeFirst("random")}>{drawing?t.drawRunning:t.draw}</button>
                </div>
                {(drawing || drawResult) && <p className={"ck-draw-outcome"+(drawing?" is-rolling":"")} aria-live="polite">{drawing?t.drawRunning:`${t.drawResult} ${drawResult==="white"?t.firstWhite:t.firstBlack}`}</p>}
              </div>
              {againstBot && <div className="ck-color-choice">
                <span className="ck-opponent-label">{t.myColor}</span>
                <div className="ck-start-buttons ck-human-colors" role="group" aria-label={t.myColor}>
                  <button type="button" disabled={drawing} aria-pressed={humanSide==="white"} className={humanSide==="white"?"is-active":""} onClick={()=>changeHumanSide("white")}>{t.firstWhite}</button>
                  <button type="button" disabled={drawing} aria-pressed={humanSide==="black"} className={humanSide==="black"?"is-active":""} onClick={()=>changeHumanSide("black")}>{t.firstBlack}</button>
                </div>
              </div>}
              {againstBot && <label className="ck-bot-difficulty">
                <span>{t.difficulty}</span>
                <select value={modeSettings.level} disabled={drawing} onChange={event=>setModeSettings(current=>({...current,level:event.target.value}))}>
                  <option value="easy">{t.easy}</option>
                  <option value="medium">{t.medium}</option>
                </select>
              </label>}
            </div>
            <div className="ck-toolbar">
          <div className="ck-status">
            <p className="ck-eyebrow">{t.local}</p>
            <h2 aria-live="polite">{game.draw?t.drawTitle:game.winner?(game.winner==="white"?t.whiteWin:t.blackWin):t.turn+": "+(game.turn==="white"?t.white:t.black)}</h2>
            <p className="ck-help" aria-live="polite">{botTurn?t.botThinking:game.forcedFrom!==null?t.continue:mustCapture?t.capture:t.select}</p>
              </div>
          <div className="ck-actions">
            <button type="button" className="ck-action" onClick={()=>setFlipped(v=>!v)}>{t.flip}</button>
            <button type="button" className="ck-action" onClick={undo} disabled={drawing || !history.length || (againstBot && !history.some(h=>h.turn===humanSide && h.forcedFrom===null))}>{t.undo}</button>
            <button type="button" className="ck-action ck-new" onClick={reset} disabled={drawing}>{t.reset}</button>
          </div>
        </div>
          <div className={"ck-player "+(game.turn==="white"?"ck-current":"")}>
            <CatPiece side="white" king={false}/><div><strong>{againstBot?(humanSide==="white"?t.humanWhite:t.botWhite):t.white}</strong><small>{count("white")} / 12</small></div>
          </div>
          <div className={"ck-player "+(game.turn==="black"?"ck-current":"")}>
            <CatPiece side="black" king={false}/><div><strong>{againstBot?(humanSide==="black"?t.humanBlack:t.botBlack):t.black}</strong><small>{count("black")} / 12</small></div>
          </div>
          <div className="ck-rule-box">
            <h3>{t.how}</h3>
            <p>{t.rules}</p>
            <p className="ck-legend"><span className="ck-small-king">♛</span> {t.king} · {t.moves}: {moves.length}</p>
          </div>
          {!storageOk && <p role="alert" className="ck-save-error">{t.saved}</p>}
        </aside>
  );
}
