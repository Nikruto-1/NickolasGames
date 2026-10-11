import { useEffect, useRef, useState } from "react";
import holmesAtlas from "../assets/holmes-pet.png";
import "./HolmesIntro.css";
const COPY = {
 uk:{skip:"Пропустити",label:"Ласкаво просимо до NickolasGames",welcome:"Ласкаво просимо до NickolasGames!",subtitle:"Я Холмс. Збирай друзів — будемо грати."},
 en:{skip:"Skip",label:"Welcome to NickolasGames",welcome:"Welcome to NickolasGames!",subtitle:"I'm Holmes. Gather your friends — let's play."},
 sv:{skip:"Hoppa över",label:"Välkommen till NickolasGames",welcome:"Välkommen till NickolasGames!",subtitle:"Jag är Holmes. Samla dina vänner — nu spelar vi."},
 de:{skip:"Überspringen",label:"Willkommen bei NickolasGames",welcome:"Willkommen bei NickolasGames!",subtitle:"Ich bin Holmes. Hol deine Freunde — wir spielen!"},
 es:{skip:"Saltar",label:"Bienvenido a NickolasGames",welcome:"¡Bienvenido a NickolasGames!",subtitle:"Soy Holmes. Reúne a tus amigos — ¡vamos a jugar!"}
};
export function HolmesIntro({lang,onComplete,loop=false}) {
 const canvasRef=useRef(null), skipRef=useRef(null), loopRef=useRef(null);
 const [loopEnabled,setLoopEnabled]=useState(loop);
 const [phase,setPhase]=useState(0), [fallback,setFallback]=useState(false);
 const copy=COPY[lang]||COPY.en;
 useEffect(()=>{
  const focused=document.activeElement, previousOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  window.scrollTo({top:0,left:0,behavior:"instant"});
  skipRef.current?.focus({preventScroll:true});
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let fallbackTimer;
  let dispose=()=>{}, cancelled=false;
  const fail=()=>{if(!cancelled){setFallback(true);setPhase(3);fallbackTimer=setTimeout(onComplete,1500);}};
  import("./holmes2d").then(({createHolmesScene})=>{if(!cancelled)dispose=createHolmesScene(canvasRef.current,{reduced,loop:loopEnabled,onPhase:setPhase,onFinish:onComplete,onFailure:fail});}).catch(fail);
  const keyboard=event=>{if(event.key==="Escape")onComplete();if(event.key==="Tab"){event.preventDefault();(document.activeElement===skipRef.current?loopRef.current:skipRef.current)?.focus();}};
  document.addEventListener("keydown",keyboard);
  return ()=>{cancelled=true;dispose();clearTimeout(fallbackTimer);document.removeEventListener("keydown",keyboard);document.body.style.overflow=previousOverflow;if(focused instanceof HTMLElement&&focused!==document.body&&focused.isConnected)focused.focus({preventScroll:true});};
 },[onComplete,loopEnabled]);
 return <div className={`holmes-intro holmes-2d holmes-phase-${phase}`} role="dialog" aria-modal="true" aria-label={copy.label}>
  <div ref={canvasRef} className="holmes-2d-canvas" aria-hidden="true"/>
  {fallback&&<div className="holmes-2d-fallback" style={{backgroundImage:`url(${holmesAtlas})`}} aria-hidden="true"/>}
  <div className="holmes-intro-bar"><span>NickolasGames <span className="holmes-bar-dot">✦</span></span><div className="holmes-intro-controls"><button ref={loopRef} aria-pressed={loopEnabled} onClick={()=>setLoopEnabled(v=>!v)}>{({uk:"Повтор",en:"Loop",sv:"Upprepa",de:"Schleife",es:"Repetir"})[lang]||"Loop"} ↻</button><button ref={skipRef} onClick={onComplete}>{copy.skip} ↗</button></div></div>
  <div className="holmes-2d-copy"><h2>{copy.welcome}</h2><p>{copy.subtitle}</p></div>
 </div>;
}
