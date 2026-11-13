import { useEffect, useMemo, useRef, useState } from "react";
import { playCheckersVictory } from "./victorySound.js";
import { createCheckersMatch, normalizeCheckersSettings, selectFirstSide } from "./matchSettings.js";
import { chooseCheckersBotMove } from "../../../../../packages/game-core/checkers/bot.js";
import { emptyCheckersStandings, validateCheckersStandings, recordCheckersWin, rankedCheckersSides } from "./standings.js";
import { useVersionedState } from "../../utils/gameSession.js";
import { initialCheckers, legalCheckersMoves, applyCheckersMove, validateCheckersState, squareIsDark } from "./gameLogic.js";
import "./CheckersGame.css";

const COPY = {
 uk:{white:"Білі котики",black:"Чорні котики",turn:"Хід",win:"Перемога!",wins:"перемогли",moves:"Доступні ходи",capture:"Взяття обов’язкове",continue:"Продовжуй бити цією шашкою",how:"Правила",rules:"Шашки 8×8: по 12 котиків. Перший хід обирається перед партією. Звичайна шашка ходить по діагоналі вперед, але б’є в обидва боки. Бити обов’язково; якщо можливе наступне взяття, його потрібно виконати. Дамка ходить по діагоналі на будь-яку вільну відстань. Дійшовши до останнього ряду, котик стає дамкою. Перемагає той, у кого суперник залишився без шашок або можливих ходів.",undo:"Скасувати хід",reset:"Нова партія",resetAsk:"Почати нову партію? Поточний прогрес буде втрачено.",flip:"Повернути дошку",saved:"Не вдалося зберегти партію в браузері.",winnerTitle:"Перемога!",congrats:"Вітаємо! Чудова партія — перемога за вами!",again:"Зіграти ще раз",close:"Переглянути дошку",leaderboard:"Рейтинг",winsLabel:"Перемоги",recentMatches:"Останні партії",played:"Партій зіграно",noResults:"Поки немає результатів",rankLabel:"Місце",mode:"Режим гри",vsFriend:"Проти друга",vsBot:"Проти комп’ютера",difficulty:"Складність бота",easy:"Легкий",medium:"Середній",botThinking:"Котик обдумує хід…",botBlack:"Комп’ютер (чорні)",humanWhite:"Ви (білі)",modeConfirm:"Почати нову партію для зміни режиму?",firstTurn:"Хто ходить першим?",firstWhite:"Білі",firstBlack:"Чорні",draw:"🎲 Жереб",drawRunning:"Кидаємо кубик…",drawResult:"Першими ходять:",myColor:"Мої фігурки",botWhite:"Комп’ютер (білі)",humanBlack:"Ви (чорні)",local:"2 гравці · один пристрій",select:"Натисни свого котика, потім підсвічену клітинку",king:"дамка",cat:"котик",empty:"Порожня клітинка",pending:"Обов’язковий хід",whiteWin:"Білі котики перемогли!",blackWin:"Чорні котики перемогли!"},
 en:{white:"White cats",black:"Black cats",turn:"Turn",win:"Victory!",wins:"win",moves:"Legal moves",capture:"Capture is mandatory",continue:"Keep capturing with this piece",how:"Rules",rules:"8×8 checkers with 12 cats per side. Choose the first move before the game. Ordinary pieces move diagonally forward and capture in both directions. Captures and further jumps are mandatory. Kings move any distance diagonally. A piece becomes a king on reaching the far edge. You win by taking every opponent piece or leaving them without a legal move.",undo:"Undo move",reset:"New game",resetAsk:"Start a new game and lose the current progress?",flip:"Flip board",saved:"This game could not be saved in your browser.",winnerTitle:"Victory!",congrats:"Congratulations! What a game — the win is yours!",again:"Play again",close:"View the board",leaderboard:"Leaderboard",winsLabel:"Wins",recentMatches:"Recent matches",played:"Games played",noResults:"No results yet",rankLabel:"Rank",mode:"Game mode",vsFriend:"Play with a friend",vsBot:"Play against computer",difficulty:"Computer difficulty",easy:"Easy",medium:"Medium",botThinking:"The cat is thinking…",botBlack:"Computer (black)",humanWhite:"You (white)",modeConfirm:"Start a new game to change mode?",firstTurn:"Who moves first?",firstWhite:"White",firstBlack:"Black",draw:"🎲 Draw",drawRunning:"Rolling…",drawResult:"First move:",myColor:"My pieces",botWhite:"Computer (white)",humanBlack:"You (black)",local:"2 players · one device",select:"Tap your cat, then a highlighted square",king:"king",cat:"cat",empty:"Empty square",pending:"Mandatory move",whiteWin:"White cats win!",blackWin:"Black cats win!"},
 sv:{white:"Vita katter",black:"Svarta katter",turn:"Tur",win:"Seger!",wins:"vinner",moves:"Möjliga drag",capture:"Slag är obligatoriskt",continue:"Fortsätt slå med samma pjäs",how:"Regler",rules:"Damspel på 8×8 med 12 katter per spelare. Välj vem som börjar före partiet. Vanliga pjäser går diagonalt framåt men slår åt båda håll. Slag och fortsatta slag är obligatoriska. Dam kan gå valfri sträcka diagonalt. En pjäs blir dam på sista raden. Du vinner när motståndaren saknar pjäser eller möjliga drag.",undo:"Ångra drag",reset:"Nytt parti",resetAsk:"Starta ett nytt parti och förlora framstegen?",flip:"Vänd brädet",saved:"Partiet kunde inte sparas i webbläsaren.",winnerTitle:"Seger!",congrats:"Grattis! Vilket parti — ni vann!",again:"Spela igen",close:"Visa brädet",leaderboard:"Topplista",winsLabel:"Vinster",recentMatches:"Senaste partier",played:"Spelade partier",noResults:"Inga resultat ännu",rankLabel:"Placering",mode:"Spelläge",vsFriend:"Spela mot en vän",vsBot:"Spela mot datorn",difficulty:"Datorns svårighetsgrad",easy:"Lätt",medium:"Medel",botThinking:"Katten tänker…",botBlack:"Datorn (svart)",humanWhite:"Du (vit)",modeConfirm:"Starta ett nytt parti för att byta läge?",firstTurn:"Vem börjar?",firstWhite:"Vita",firstBlack:"Svarta",draw:"🎲 Lotta",drawRunning:"Lottar…",drawResult:"Först spelar:",myColor:"Mina pjäser",botWhite:"Dator (vit)",humanBlack:"Du (svart)",local:"2 spelare · en enhet",select:"Tryck på din katt och sedan på en markerad ruta",king:"dam",cat:"katt",empty:"Tom ruta",pending:"Obligatoriskt drag",whiteWin:"Vita katter vinner!",blackWin:"Svarta katter vinner!"},
 de:{white:"Weiße Katzen",black:"Schwarze Katzen",turn:"Am Zug",win:"Sieg!",wins:"gewinnen",moves:"Mögliche Züge",capture:"Schlagen ist Pflicht",continue:"Mit dieser Figur weiterschlagen",how:"Regeln",rules:"Dame auf 8×8 mit 12 Katzen pro Seite. Der erste Zug wird vor dem Spiel ausgewählt. Normale Steine ziehen diagonal vorwärts, schlagen aber in beide Richtungen. Schlagen und weitere Sprünge sind Pflicht. Damen ziehen beliebig weit diagonal. Auf der letzten Reihe wird ein Stein zur Dame. Wer alle gegnerischen Steine schlägt oder den Gegner bewegungsunfähig macht, gewinnt.",undo:"Zug zurücknehmen",reset:"Neues Spiel",resetAsk:"Neues Spiel starten und den Fortschritt verlieren?",flip:"Brett drehen",saved:"Dieses Spiel konnte nicht im Browser gespeichert werden.",winnerTitle:"Sieg!",congrats:"Glückwunsch! Tolles Spiel — ihr habt gewonnen!",again:"Noch mal spielen",close:"Brett ansehen",leaderboard:"Rangliste",winsLabel:"Siege",recentMatches:"Letzte Partien",played:"Gespielte Partien",noResults:"Noch keine Ergebnisse",rankLabel:"Platz",mode:"Spielmodus",vsFriend:"Gegen einen Freund",vsBot:"Gegen Computer",difficulty:"Computerschwierigkeit",easy:"Leicht",medium:"Mittel",botThinking:"Die Katze überlegt…",botBlack:"Computer (schwarz)",humanWhite:"Du (weiß)",modeConfirm:"Neues Spiel starten, um den Modus zu wechseln?",firstTurn:"Wer beginnt?",firstWhite:"Weiß",firstBlack:"Schwarz",draw:"🎲 Losen",drawRunning:"Würfeln…",drawResult:"Zuerst spielt:",myColor:"Meine Steine",botWhite:"Computer (weiß)",humanBlack:"Du (schwarz)",local:"2 Spieler · ein Gerät",select:"Wähle deine Katze und dann ein markiertes Feld",king:"Dame",cat:"Katze",empty:"Leeres Feld",pending:"Pflichtzug",whiteWin:"Weiße Katzen gewinnen!",blackWin:"Schwarze Katzen gewinnen!"},
 es:{white:"Gatos blancos",black:"Gatos negros",turn:"Turno",win:"¡Victoria!",wins:"ganan",moves:"Movimientos legales",capture:"Capturar es obligatorio",continue:"Sigue capturando con esta ficha",how:"Reglas",rules:"Damas 8×8 con 12 gatos por lado. El primer turno se elige antes de jugar. Las fichas avanzan en diagonal, pero capturan en ambas direcciones. Capturar y continuar los saltos es obligatorio. Las damas se mueven cualquier distancia en diagonal. Una ficha se corona al llegar al extremo opuesto. Gana quien deje al rival sin fichas o sin movimientos.",undo:"Deshacer jugada",reset:"Nueva partida",resetAsk:"¿Empezar de nuevo y perder el progreso?",flip:"Girar tablero",saved:"No se pudo guardar la partida en el navegador.",winnerTitle:"¡Victoria!",congrats:"¡Felicidades! ¡Qué partida! ¡Habéis ganado!",again:"Jugar otra vez",close:"Ver el tablero",leaderboard:"Clasificación",winsLabel:"Victorias",recentMatches:"Últimas partidas",played:"Partidas jugadas",noResults:"Aún no hay resultados",rankLabel:"Puesto",mode:"Modo de juego",vsFriend:"Contra un amigo",vsBot:"Contra el ordenador",difficulty:"Dificultad del ordenador",easy:"Fácil",medium:"Medio",botThinking:"El gato está pensando…",botBlack:"Ordenador (negras)",humanWhite:"Tú (blancas)",modeConfirm:"¿Iniciar una nueva partida para cambiar el modo?",firstTurn:"¿Quién empieza?",firstWhite:"Blancas",firstBlack:"Negras",draw:"🎲 Sorteo",drawRunning:"Sorteando…",drawResult:"Empiezan:",myColor:"Mis fichas",botWhite:"Ordenador (blancas)",humanBlack:"Tú (negras)",local:"2 jugadores · un dispositivo",select:"Toca tu gato y luego una casilla resaltada",king:"dama",cat:"gato",empty:"Casilla vacía",pending:"Movimiento obligatorio",whiteWin:"¡Ganan los gatos blancos!",blackWin:"¡Ganan los gatos negros!"}
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
  const [modeSettings,setModeSettings] = useVersionedState({
    game:"checkers-mode",lang:"shared",
    restore:value=>value && ["friend","bot"].includes(value.mode) && ["easy","medium"].includes(value.level) ? normalizeCheckersSettings(value) : null,
    initialize:()=>normalizeCheckersSettings(null)
  });
  const againstBot=modeSettings.mode==="bot";
  const humanSide=modeSettings.humanSide;
  const botSide=humanSide==="white"?"black":"white";
  const botTimer=useRef(null);
  const drawTimer=useRef(null);
  const [drawing,setDrawing]=useState(false);
  const [drawResult,setDrawResult]=useState(null);
  const botTurn=againstBot && game.turn===botSide && !game.winner && !drawing;
  useEffect(()=>()=>{if(drawTimer.current!==null)window.clearTimeout(drawTimer.current);},[]);
  const [selected,setSelected]=useState(null);
  const [standings,setStandings] = useVersionedState({
    game:"checkers-standings",lang:"shared",
    restore:validateCheckersStandings,initialize:emptyCheckersStandings
  });
  const roundId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return String(Date.now())+"-"+String(Math.random());
  };
  const leaderboard = rankedCheckersSides(standings);
  const matchesPlayed = standings.white + standings.black;
  const [history,setHistory]=useState([]);
  const [flipped,setFlipped]=useState(false);
  const [victoryOpen,setVictoryOpen]=useState(()=>Boolean(game.winner));
  const closeVictory=useRef(null);
  const previouslyFocused=useRef(null);
  useEffect(()=>{
    if(!victoryOpen) return;
    previouslyFocused.current=document.activeElement;
    closeVictory.current?.focus();
    const onKey=event=>{
      if(event.key==="Escape"){event.preventDefault();setVictoryOpen(false);}
      if(event.key==="Tab"){
        const elements=[...document.querySelectorAll(".ck-victory-dialog button")];
        if(elements.length===0)return;
        const first=elements[0],last=elements[elements.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener("keydown",onKey);
    return ()=>{document.removeEventListener("keydown",onKey);if(previouslyFocused.current?.isConnected)previouslyFocused.current.focus();};
  },[victoryOpen]);
  const moves=useMemo(()=>legalCheckersMoves(game),[game]);
  const active=game.forcedFrom===null?selected:game.forcedFrom;
  const targets=moves.filter(m=>m.from===active).map(m=>m.to);
  const mustCapture=moves.some(m=>m.capture!==null);
  const count=side=>game.board.filter(p=>p?.side===side).length;
  const finishMove=(from,to)=>{
    const next=applyCheckersMove(game,from,to);
    if(next===game)return;
    const gameId=game.matchId || roundId();
    setHistory(h=>[...h.slice(-79),game]);
    setGame({...next,matchId:gameId,startingSide:game.startingSide || "white"});
    setSelected(next.forcedFrom);
    if(!game.winner && next.winner){
      setStandings(prev=>recordCheckersWin(prev,gameId,next.winner));
      setVictoryOpen(true);
      playCheckersVictory();
    }
  };
  useEffect(()=>{
    if(!botTurn)return;
    // The engine returns one legal step. A forced capture chain triggers the next effect.
    botTimer.current=window.setTimeout(()=>{
      botTimer.current=null;
      const move=chooseCheckersBotMove(game,modeSettings.level);
      if(move)finishMove(move.from,move.to);
    },550);
    return ()=>{
      if(botTimer.current!==null){window.clearTimeout(botTimer.current);botTimer.current=null;}
    };
  },[botTurn,game,modeSettings.level]);
  const handleCell=index=>{
    if(botTurn || drawing || game.winner || !squareIsDark(index))return;
    if(active!==null && targets.includes(index)){
      finishMove(active,index);
      return;
    }
    if(game.forcedFrom!==null)return;
    if(game.board[index]?.side===game.turn && moves.some(m=>m.from===index))setSelected(index);
    else setSelected(null);
  };
  const startNewGame=(settings=modeSettings, chosen=null)=>{
    const next=chosen ? {...createCheckersMatch(chosen,Math.random,roundId())} : createCheckersMatch(settings.starter,Math.random,roundId());
    setGame(next);
    setHistory([]);
    setSelected(null);
    setVictoryOpen(false);
    setDrawResult(chosen || null);
  };
  const canRestart=()=>{
    if(game.moveNumber<=1 || game.winner)return true;
    return window.confirm(t.modeConfirm);
  };
  const changeFirst=side=>{
    if(drawing || !canRestart())return;
    if(side==="random"){
      const winner=selectFirstSide("random");
      setDrawing(true);
      drawTimer.current=window.setTimeout(()=>{
        drawTimer.current=null;
        setModeSettings(prev=>({...prev,starter:"random"}));
        startNewGame({...modeSettings,starter:"random"},winner);
        setDrawing(false);
      },800);
      return;
    }
    setModeSettings(prev=>({...prev,starter:side}));
    startNewGame({...modeSettings,starter:side},side);
  };
  const changeHumanSide=side=>{
    if(side===humanSide || drawing || !canRestart())return;
    const next={...modeSettings,humanSide:side};
    setModeSettings(next);
    setFlipped(side==="black");
    startNewGame(next);
  };
  const reset=()=>{
    if(!window.confirm(t.resetAsk))return;
    startNewGame();
  };
  const undo=()=>{
    if(!history.length)return;
    let target=history.length-1;
    if(againstBot){
      // Take back both the human and computer turn (including capture sequences).
      while(target>=0 && (history[target].turn!==humanSide || history[target].forcedFrom!==null))
        target--;
      if(target<0)return;
    }
    setGame(history[target]);
    setHistory(h=>h.slice(0,target));
    setSelected(null);
    setVictoryOpen(false);
  };
  const changeMode=mode=>{
    if(mode===modeSettings.mode || drawing || !canRestart())return;
    const next={...modeSettings,mode};
    setModeSettings(next);
    startNewGame(next);
  };
  const indices=Array.from({length:64},(_,i)=>flipped?63-i:i);
  return <section className="ck-page s pv" aria-label={t.local}>
    <div className="wrap">
      <div className="ck-layout">
        <aside className="ck-leaderboard" aria-label={t.leaderboard}>
          <div className="ck-leaderboard-title">
            <p className="ck-eyebrow">NICKOLASGAMES</p>
            <h3>{t.leaderboard}</h3>
          </div>
          <div className="ck-rank-list">
            {leaderboard.map((side,i)=><div className="ck-rank-item" key={side}>
              <span className={"ck-rank-num"+(i===0?" ck-gold":"")}>{i+1}</span>
              <div className="ck-rank-cat"><CatPiece side={side} king={false}/></div>
              <div className="ck-rank-name"><strong>{side==="white"?t.white:t.black}</strong><small>{t.winsLabel}</small></div>
              <strong className="ck-rank-score">{standings[side]}</strong>
            </div>)}
          </div>
          <div className="ck-leaderboard-total"><span>{t.played}</span><strong>{matchesPlayed}</strong></div>
          <div className="ck-recent">
            <h4>{t.recentMatches}</h4>
            {standings.recent.length
              ? <ol>{standings.recent.slice(0,3).map((result,i)=><li key={result.id}>
                  <span className="ck-recent-num">{i+1}.</span>
                  <span>{result.side==="white"?t.white:t.black}</span>
                  <span aria-hidden="true">★</span>
                </li>)}</ol>
              : <p>{t.noResults}</p>}
          </div>
        </aside>
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
            <h2 aria-live="polite">{game.winner?(game.winner==="white"?t.whiteWin:t.blackWin):t.turn+": "+(game.turn==="white"?t.white:t.black)}</h2>
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
      </div>
      {victoryOpen && game.winner && <div className="ck-victory-backdrop">
        <div className="ck-victory-dialog" role="dialog" aria-modal="true" aria-labelledby="ck-victory-title" aria-describedby="ck-victory-desc">
          <div className="ck-victory-sparks" aria-hidden="true">✦ ✧ ✦</div>
          <div className="ck-victory-cat"><CatPiece side={game.winner} king={true}/></div>
          <p className="ck-victory-overline">NICKOLASGAMES</p>
          <h2 id="ck-victory-title">{t.winnerTitle}</h2>
          <h3>{game.winner==="white"?t.whiteWin:t.blackWin}</h3>
          <p id="ck-victory-desc">{t.congrats}</p>
          <div className="ck-victory-actions">
            <button type="button" className="ck-victory-restart" ref={closeVictory} onClick={startNewGame}>{t.again}</button>
            <button type="button" className="ck-victory-close" onClick={()=>setVictoryOpen(false)}>{t.close}</button>
          </div>
        </div>
      </div>}
    </div>
  </section>;
}
