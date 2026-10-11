import holmesLying from "../assets/holmes-lying-hd.png";
import "./HolmesFloor.css";

export function HolmesFloor({games}) {
 const symbols=["?","✦","A","♡"];
 return <div className="holmes-floor" aria-hidden="true">
  <div className="holmes-floor-ground"/>
  <div className="holmes-floor-cards">
   {Object.entries(games).slice(0,4).map(([key,game],i)=><div className={`holmes-floor-card holmes-floor-card-${i}`} key={key}><span>{symbols[i]}</span><strong>{game.n}</strong><small>NickolasGames</small></div>)}
  </div>
  <div className="holmes-resting"><img src={holmesLying} alt="" draggable="false"/></div>
  <svg className="holmes-yarn-thread" viewBox="0 0 600 400"><path d="M510 340c-70 30-60-30-110-4s-15 43-65 39-74-10-85 7" fill="none" stroke="#AC7865" strokeWidth="2.5" strokeLinecap="round"/></svg>
  <div className="holmes-yarn-motion"><svg className="holmes-yarn" viewBox="0 0 100 100">
   <defs><radialGradient id="holmes-yarn-color" cx="35%" cy="25%"><stop stopColor="#CBB89A"/><stop offset="1" stopColor="#AC7865"/></radialGradient><clipPath id="holmes-yarn-clip"><circle cx="50" cy="50" r="44"/></clipPath></defs>
   <circle cx="50" cy="50" r="44" fill="url(#holmes-yarn-color)"/>
   <g clipPath="url(#holmes-yarn-clip)" fill="none" stroke="#77736B" strokeWidth="2" opacity=".65">
    {[0,1,2,3,4,5,6].map(i=><path key={i} d={`M${-20+i*12} 10Q${70+i*5} 20 ${-10+i*13} 100`}/>)}
    {[0,1,2,3,4].map(i=><path key={i} d={`M0 ${15+i*14}Q50 ${-15+i*15} 105 ${45+i*12}`}/>)}
   </g>
   <path d="M21 25q20-18 45-7" fill="none" stroke="#EEE4D1" strokeWidth="4" strokeLinecap="round" opacity=".6"/>
  </svg></div>
 </div>;
}
