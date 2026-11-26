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
const DETAILS = {
  "uk": [
    "Переказ усних відгуків",
    "Дизайн",
    "Офлайн · Мультимовність",
    "Моряк",
    "Пауза",
    "Продовжити"
  ],
  "en": [
    "Edited oral feedback",
    "Design",
    "Offline · Languages",
    "Seafarer",
    "Pause",
    "Resume"
  ],
  "sv": [
    "Bearbetade muntliga omdömen",
    "Design",
    "Offline · Språk",
    "Sjöman",
    "Pausa",
    "Fortsätt"
  ],
  "de": [
    "Redaktionell wiedergegebene mündliche Rückmeldungen",
    "Design",
    "Offline · Sprachen",
    "Seemann",
    "Pause",
    "Fortsetzen"
  ],
  "es": [
    "Comentarios verbales editados",
    "Diseño",
    "Sin conexión · Idiomas",
    "Marino",
    "Pausar",
    "Continuar"
  ]
};
const flag = country => String.fromCodePoint(...[...country].map(c => c.charCodeAt(0) + 127397));
export function PlayerReviews({lang,t,entries=PLAYER_REVIEWS}) {
 const headingId = useId();
 const [manual,setManual] = useState(false);
 const reviews = visiblePlayerReviews(entries,lang);
 const cards = reviews;
 if (!cards.length) return null;
 const [editorial,design,offline,seafarer,pause,play] = DETAILS[lang] ?? DETAILS.en;
 const copy = COPY[lang] ?? COPY.en;
 const animate = cards.length >= 4;
 const regions = new Intl.DisplayNames([COPY[lang] ? lang : 'en'],{type:'region'});
 const group = (clone=false) => <ul className={'review-group'+(clone?' review-clone':'')} aria-hidden={clone||undefined}>
  {cards.map(review => <li className="review-card" key={review.id}>
   <p className="review-text">{review.quote}</p>
   <div className="review-author"><strong>{review.name}</strong>{review.country ? <span><span aria-hidden="true">{flag(review.country)}</span> {regions.of(review.country)}</span> : <span>{seafarer}</span>}</div>
   <small>{review.game==='design'?design:review.game==='offline'?offline:t.games[review.game]?.n}</small>
  </li>)}
 </ul>;
 return <section className="s player-reviews" aria-labelledby={headingId}>
  <div className="wrap review-header"><h2 id={headingId}>{copy.heading}</h2>
   {animate && <button type="button" className="btn sm review-toggle" aria-label={manual?copy.play:copy.pause} onClick={()=>setManual(v=>!v)}>{manual?play:pause}</button>}
  </div>
  <p className="wrap review-editorial">{editorial}</p>
  <div className={'review-viewport'+(manual||!animate?' review-manual':'')} tabIndex={0} role="region" aria-labelledby={headingId}
    onPointerDown={event=>{if(event.pointerType==='touch')setManual(true);}} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))setManual(true);}}>
   <div className="review-track" style={{'--review-duration':Math.max(28,cards.length*6)+'s'}}>
    {group()}{animate&&group(true)}
   </div>
  </div>
 </section>;
}
