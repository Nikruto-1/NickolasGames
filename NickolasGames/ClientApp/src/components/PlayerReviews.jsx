import { useId, useRef, useState } from 'react';
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
 const [paused,setPaused] = useState(false);
 const [dragging,setDragging] = useState(false);
 const drag = useRef(null);
 const trackRef = useRef(null);
 const reviews = visiblePlayerReviews(entries,lang);
 const cards = reviews;
 if (!cards.length) return null;
 const [editorial,design,offline,seafarer,pause,play] = DETAILS[lang] ?? DETAILS.en;
 const copy = COPY[lang] ?? COPY.en;
 const animate = cards.length >= 4;
 const duration = Math.max(28,cards.length*6)*1000;
 const canLoop = () => animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const shift = pixels => {
  const track = trackRef.current;
  const animation = track?.getAnimations().find(item=>item.animationName==='review-slide');
  const width = track?.firstElementChild?.getBoundingClientRect().width;
  if(!animation || !width || typeof animation.currentTime!=='number')return;
  const time = animation.currentTime - pixels*duration/width;
  animation.currentTime = ((time%duration)+duration)%duration;
 };
 const startDrag = event => {
  if(!canLoop() || !event.isPrimary || event.button!==0 || drag.current)return;
  drag.current = {id:event.pointerId,x:event.clientX};
  event.currentTarget.setPointerCapture(event.pointerId);
  setDragging(true);
 };
 const moveDrag = event => {
  const active=drag.current;
  if(!active || active.id!==event.pointerId)return;
  shift(event.clientX-active.x);
  active.x=event.clientX;
 };
 const endDrag = event => {
  if(drag.current?.id!==event.pointerId)return;
  drag.current=null;
  setDragging(false);
 };
 const onKey = event => {
  if(!canLoop() || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='Home'||event.key==='End'){
   const animation=trackRef.current?.getAnimations().find(item=>item.animationName==='review-slide');
   if(animation)animation.currentTime=event.key==='Home'?0:duration-1000;
  }else shift(event.key==='ArrowLeft'?160:-160);
 };
 const regions = new Intl.DisplayNames([COPY[lang] ? lang : 'en'],{type:'region'});
 const group = (clone=false) => <ul className={'review-group'+(clone?' review-clone':'')} aria-hidden={clone||undefined}>
  {cards.map(review => <li className="review-card" key={review.id}>
   <p className="review-text">{review.quote}</p>
   <div className="review-author"><strong>{review.name}</strong>{review.country && <span><span aria-hidden="true">{flag(review.country)}</span> {regions.of(review.country)}{review.id==='hennadii'?' · '+seafarer:''}</span>}</div>
   <small>{review.game==='design'?design:review.game==='offline'?offline:t.games[review.game]?.n}</small>
  </li>)}
 </ul>;
 return <section className="s player-reviews" aria-labelledby={headingId}>
  <div className="wrap review-header"><h2 id={headingId}>{copy.heading}</h2>
   {animate && <button type="button" className="btn sm review-toggle" aria-label={paused?copy.play:copy.pause} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?play:pause}</button>}
  </div>
  <p className="wrap review-editorial">{editorial}</p>
  <div className={'review-viewport'+(!animate?' review-static':'')+(paused?' review-paused':'')+(dragging?' review-dragging':'')} tabIndex={0} role="region" aria-labelledby={headingId}
    onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={onKey}>
   <div className="review-track" ref={trackRef} style={{'--review-duration':duration+'ms'}}>
    {group()}{animate&&group(true)}
   </div>
  </div>
 </section>;
}
