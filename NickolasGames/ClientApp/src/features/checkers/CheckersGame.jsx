import { useMemo, useState } from "react";
import { useVersionedState } from "../../utils/gameSession.js";
import { initialCheckers, legalCheckersMoves, applyCheckersMove, validateCheckersState, squareIsDark } from "./gameLogic.js";
import "./CheckersGame.css";

const COPY = {
 uk:{white:"Білі котики",black:"Чорні котики",turn:"Хід",win:"Перемога!",wins:"перемогли",moves:"Доступні ходи",capture:"Взяття обов’язкове",continue:"Продовжуй бити цією шашкою",how:"Правила",rules:"Шашки 8×8: по 12 котиків. Білі починають. Звичайна шашка ходить по діагоналі вперед, але б’є в обидва боки. Бити обов’язково; якщо можливе наступне взяття, його потрібно виконати. Дамка ходить по діагоналі на будь-яку вільну відстань. Дійшовши до останнього ряду, котик стає дамкою. Перемагає той, у кого суперник залишився без шашок або можливих ходів.",undo:"Скасувати хід",reset:"Нова партія",resetAsk:"Почати нову партію? Поточний прогрес буде втрачено.",flip:"Повернути дошку",saved:"Не вдалося зберегти партію в браузері.",local:"2 гравці · один пристрій",select:"Натисни свого котика, потім підсвічену клітинку",king:"дамка",cat:"котик",empty:"Порожня клітинка",pending:"Обов’язковий хід",whiteWin:"Білі котики перемогли!",blackWin:"Чорні котики перемогли!"},
 en:{white:"White cats",black:"Black cats",turn:"Turn",win:"Victory!",wins:"win",moves:"Legal moves",capture:"Capture is mandatory",continue:"Keep capturing with this piece",how:"Rules",rules:"8×8 checkers with 12 cats per side. White goes first. Ordinary pieces move diagonally forward and capture in both directions. Captures and further jumps are mandatory. Kings move any distance diagonally. A piece becomes a king on reaching the far edge. You win by taking every opponent piece or leaving them without a legal move.",undo:"Undo move",reset:"New game",resetAsk:"Start a new game and lose the current progress?",flip:"Flip board",saved:"This game could not be saved in your browser.",local:"2 players · one device",select:"Tap your cat, then a highlighted square",king:"king",cat:"cat",empty:"Empty square",pending:"Mandatory move",whiteWin:"White cats win!",blackWin:"Black cats win!"},
 sv:{white:"Vita katter",black:"Svarta katter",turn:"Tur",win:"Seger!",wins:"vinner",moves:"Möjliga drag",capture:"Slag är obligatoriskt",continue:"Fortsätt slå med samma pjäs",how:"Regler",rules:"Damspel på 8×8 med 12 katter per spelare. Vit börjar. Vanliga pjäser går diagonalt framåt men slår åt båda håll. Slag och fortsatta slag är obligatoriska. Dam kan gå valfri sträcka diagonalt. En pjäs blir dam på sista raden. Du vinner när motståndaren saknar pjäser eller möjliga drag.",undo:"Ångra drag",reset:"Nytt parti",resetAsk:"Starta ett nytt parti och förlora framstegen?",flip:"Vänd brädet",saved:"Partiet kunde inte sparas i webbläsaren.",local:"2 spelare · en enhet",select:"Tryck på din katt och sedan på en markerad ruta",king:"dam",cat:"katt",empty:"Tom ruta",pending:"Obligatoriskt drag",whiteWin:"Vita katter vinner!",blackWin:"Svarta katter vinner!"},
 de:{white:"Weiße Katzen",black:"Schwarze Katzen",turn:"Am Zug",win:"Sieg!",wins:"gewinnen",moves:"Mögliche Züge",capture:"Schlagen ist Pflicht",continue:"Mit dieser Figur weiterschlagen",how:"Regeln",rules:"Dame auf 8×8 mit 12 Katzen pro Seite. Weiß beginnt. Normale Steine ziehen diagonal vorwärts, schlagen aber in beide Richtungen. Schlagen und weitere Sprünge sind Pflicht. Damen ziehen beliebig weit diagonal. Auf der letzten Reihe wird ein Stein zur Dame. Wer alle gegnerischen Steine schlägt oder den Gegner bewegungsunfähig macht, gewinnt.",undo:"Zug zurücknehmen",reset:"Neues Spiel",resetAsk:"Neues Spiel starten und den Fortschritt verlieren?",flip:"Brett drehen",saved:"Dieses Spiel konnte nicht im Browser gespeichert werden.",local:"2 Spieler · ein Gerät",select:"Wähle deine Katze und dann ein markiertes Feld",king:"Dame",cat:"Katze",empty:"Leeres Feld",pending:"Pflichtzug",whiteWin:"Weiße Katzen gewinnen!",blackWin:"Schwarze Katzen gewinnen!"},
 es:{white:"Gatos blancos",black:"Gatos negros",turn:"Turno",win:"¡Victoria!",wins:"ganan",moves:"Movimientos legales",capture:"Capturar es obligatorio",continue:"Sigue capturando con esta ficha",how:"Reglas",rules:"Damas 8×8 con 12 gatos por lado. Empiezan los blancos. Las fichas avanzan en diagonal, pero capturan en ambas direcciones. Capturar y continuar los saltos es obligatorio. Las damas se mueven cualquier distancia en diagonal. Una ficha se corona al llegar al extremo opuesto. Gana quien deje al rival sin fichas o sin movimientos.",undo:"Deshacer jugada",reset:"Nueva partida",resetAsk:"¿Empezar de nuevo y perder el progreso?",flip:"Girar tablero",saved:"No se pudo guardar la partida en el navegador.",local:"2 jugadores · un dispositivo",select:"Toca tu gato y luego una casilla resaltada",king:"dama",cat:"gato",empty:"Casilla vacía",pending:"Movimiento obligatorio",whiteWin:"¡Ganan los gatos blancos!",blackWin:"¡Ganan los gatos negros!"}
};

function CatPiece({side,king}) {
  return <span className={"ck-piece ck-"+side+(king?" ck-king":"")} aria-hidden="true">
    <svg viewBox="0 0 80 80" focusable="false" className="ck-cat-svg">
      <path className="ck-ear" d="M15 31 L17 9 Q19 6 24 12 L33 22 Q40 19 47 22 L57 10 Q63 5 64 13 L66 33" />
      <ellipse className="ck-face" cx="40" cy="42" rx="28" ry="25"/>
      <path className="ck-cheek" d="M22 50 Q40 68 58 50"/>
      <path className="ck-eye" d="M24 37 Q31 31 36 37 M44 37 Q50 31 57 37"/>
      <path className="ck-nose" d="M36 46 L44 46 L40 51 Z"/>
      <path className="ck-mouth" d="M40 51 Q35 58 32 53 M40 51 Q45 58 48 53"/>
      <path className="ck-whisker" d="M10 47 L28 49 M12 55 L27 53 M52 49 L71 47 M53 53 L70 55"/>
      {king && <g className="ck-crown"><path d="M24 24 L20 8 L32 15 L40 4 L49 15 L61 8 L56 24 Z"/><path d="M24 27 H56"/></g>}
    </svg>
  </span>;
}

const coordinate = index => "ABCDEFGH"[index%8]+(8-Math.floor(index/8));

export function CheckersGame({lang="uk"}) {
  const t=COPY[lang]||COPY.en;
  const [game,setGame,storageOk] = useVersionedState({
    game:"checkers",lang:"shared",
    restore:s=>validateCheckersState(s)?s:null,initialize:initialCheckers
  });
  const [selected,setSelected]=useState(null);
  const [history,setHistory]=useState([]);
  const [flipped,setFlipped]=useState(false);
  const moves=useMemo(()=>legalCheckersMoves(game),[game]);
  const active=game.forcedFrom===null?selected:game.forcedFrom;
  const targets=moves.filter(m=>m.from===active).map(m=>m.to);
  const mustCapture=moves.some(m=>m.capture!==null);
  const count=side=>game.board.filter(p=>p?.side===side).length;
  const handleCell=index=>{
    if(game.winner || !squareIsDark(index))return;
    if(active!==null && targets.includes(index)){
      const next=applyCheckersMove(game,active,index);
      if(next!==game){setHistory(h=>[...h.slice(-79),game]);setGame(next);setSelected(next.forcedFrom);}
      return;
    }
    if(game.forcedFrom!==null)return;
    if(game.board[index]?.side===game.turn && moves.some(m=>m.from===index))setSelected(index);
    else setSelected(null);
  };
  const reset=()=>{
    if(!window.confirm(t.resetAsk))return;
    setGame(initialCheckers());setHistory([]);setSelected(null);
  };
  const undo=()=>{
    if(!history.length)return;
    setGame(history[history.length-1]);setHistory(h=>h.slice(0,-1));setSelected(null);
  };
  const indices=Array.from({length:64},(_,i)=>flipped?63-i:i);
  return <section className="ck-page s pv" aria-label={t.local}>
    <div className="wrap">
      <div className="ck-toolbar">
        <div className="ck-status">
          <p className="ck-eyebrow">{t.local}</p>
          <h2 aria-live="polite">{game.winner?(game.winner==="white"?t.whiteWin:t.blackWin):t.turn+": "+(game.turn==="white"?t.white:t.black)}</h2>
          <p className="ck-help" aria-live="polite">{game.forcedFrom!==null?t.continue:mustCapture?t.capture:t.select}</p>
        </div>
        <div className="ck-actions">
          <button type="button" className="ck-action" onClick={()=>setFlipped(v=>!v)}>{t.flip}</button>
          <button type="button" className="ck-action" onClick={undo} disabled={!history.length}>{t.undo}</button>
          <button type="button" className="ck-action ck-new" onClick={reset}>{t.reset}</button>
        </div>
      </div>
      <div className="ck-layout">
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
        <aside className="ck-sidebar">
          <div className={"ck-player "+(game.turn==="white"?"ck-current":"")}>
            <CatPiece side="white" king={false}/><div><strong>{t.white}</strong><small>{count("white")} / 12</small></div>
          </div>
          <div className={"ck-player "+(game.turn==="black"?"ck-current":"")}>
            <CatPiece side="black" king={false}/><div><strong>{t.black}</strong><small>{count("black")} / 12</small></div>
          </div>
          <div className="ck-rule-box">
            <h3>{t.how}</h3>
            <p>{t.rules}</p>
            <p className="ck-legend"><span className="ck-small-king">♛</span> {t.king} · {t.moves}: {moves.length}</p>
          </div>
          {!storageOk && <p role="alert" className="ck-save-error">{t.saved}</p>}
        </aside>
      </div>
    </div>
  </section>;
}
