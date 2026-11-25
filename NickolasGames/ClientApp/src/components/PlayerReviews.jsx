import { useId, useState } from 'react';
import { PLAYER_REVIEWS, visiblePlayerReviews } from './playerReviews.js';
import './PlayerReviews.css';

const COPY = {
 uk:{heading:'Відгуки гравців',pause:'Призупинити та гортати вручну',play:'Відновити автопрокрутку'},
 en:{heading:'Player reviews',pause:'Pause and scroll manually',play:'Resume automatic scrolling'},
 sv:{heading:'Spelarnas omdömen',pause:'Pausa och rulla manuellt',play:'Återuppta automatisk rullning'},
 de:{heading:'Spielerstimmen',pause:'Pausieren und manuell scrollen',play:'Automatisches Scrollen fortsetzen'},
 es:{heading:'Opiniones de jugadores',pause:'Pausar y desplazar manualmente',play:'Reanudar desplazamiento automático'}
};
const flag = country => String.fromCodePoint(...[...country].map(c => c.charCodeAt(0) + 127397));
export function PlayerReviews({lang,t,entries=PLAYER_REVIEWS}) {
 const headingId = useId();
 const [manual,setManual] = useState(false);
 const reviews = visiblePlayerReviews(entries,lang);
 if (!reviews.length) return null;
 const copy = COPY[lang] ?? COPY.en;
 const animate = reviews.length >= 4;
 const regions = new Intl.DisplayNames([COPY[lang] ? lang : 'en'],{type:'region'});
 const group = (clone=false) => <ul className={'review-group'+(clone?' review-clone':'')} aria-hidden={clone||undefined}>
  {reviews.map(review => <li className="review-card" key={review.id}>
   <blockquote>{review.quote}</blockquote>
   <div className="review-author"><strong>{review.name}</strong><span><span aria-hidden="true">{flag(review.country)}</span> {regions.of(review.country)}</span></div>
   <small>{t.games[review.game]?.n}</small>
  </li>)}
 </ul>;
 return <section className="s player-reviews" aria-labelledby={headingId}>
  <div className="wrap review-header"><h2 id={headingId}>{copy.heading}</h2>
   {animate && <button type="button" className="btn sm review-toggle" onClick={()=>setManual(v=>!v)}>{manual?copy.play:copy.pause}</button>}
  </div>
  <div className={'review-viewport'+(manual||!animate?' review-manual':'')} tabIndex={0} role="region" aria-labelledby={headingId}
    onPointerDown={event=>{if(event.pointerType==='touch')setManual(true);}} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))setManual(true);}}>
   <div className="review-track" style={{'--review-duration':Math.max(28,reviews.length*6)+'s'}}>
    {group()}{animate&&group(true)}
   </div>
  </div>
 </section>;
}
