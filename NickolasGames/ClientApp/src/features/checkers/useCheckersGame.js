import { useEffect, useMemo, useRef, useState } from "react";
import { playCheckersVictory } from "./victorySound.js";
import { createCheckersMatch, normalizeCheckersSettings, selectFirstSide } from "./matchSettings.js";
import { chooseCheckersBotMove } from "../../../../../packages/game-core/checkers/bot.js";
import { emptyCheckersStandings,validateCheckersStandings,recordCheckersWin,revertCheckersWin,rankedCheckersSides } from "./standings.js";
import { useVersionedState } from "../../utils/gameSession.js";
import { initialCheckers, legalCheckersMoves,applyCheckersMove,validateCheckersState,squareIsDark,checkersFinished } from "./gameLogic.js";

export function useCheckersGame(t) {
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
  const botTurn=againstBot && game.turn===botSide && !checkersFinished(game) && !drawing;
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
  const [victoryOpen,setVictoryOpen]=useState(()=>checkersFinished(game));
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
    if(!checkersFinished(game) && checkersFinished(next)){
      if(next.winner) {
        setStandings(prev=>recordCheckersWin(prev,gameId,next.winner));
        playCheckersVictory();
      }
      setVictoryOpen(true);
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
    if(botTurn || drawing || checkersFinished(game) || !squareIsDark(index))return;
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
    if(game.moveNumber<=1 || checkersFinished(game))return true;
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
    if(game.winner && game.matchId && history[target].winner!==game.winner)
      setStandings(prev=>revertCheckersWin(prev,game.matchId));
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
  return {game,setGame,storageOk,modeSettings,setModeSettings,againstBot,humanSide,botSide,botTurn,drawing,drawResult,standings,
    selected,leaderboard,matchesPlayed,history,flipped,victoryOpen,closeVictory,moves,active,targets,mustCapture,
    count,handleCell,finishMove,startNewGame,changeFirst,changeHumanSide,reset,undo,changeMode,setFlipped,setVictoryOpen,indices};
}
