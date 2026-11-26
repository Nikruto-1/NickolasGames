import { useId, useState } from 'react';
import { PLAYER_REVIEWS, visiblePlayerReviews, visibleReviewParticipants } from './playerReviews.js';
import './PlayerReviews.css';

const COPY = {
 uk:{heading:'Відгуки гравців',pause:'Призупинити та гортати вручну',play:'Відновити автопрокрутку'},
 en:{heading:'Player reviews',pause:'Pause and scroll manually',play:'Resume automatic scrolling'},
 sv:{heading:'Spelarnas omdömen',pause:'Pausa och rulla manuellt',play:'Återuppta automatisk rullning'},
 de:{heading:'Spielerstimmen',pause:'Pausieren und manuell scrollen',play:'Automatisches Scrollen fortsetzen'},
 es:{heading:'Opiniones de jugadores',pause:'Pausar y desplazar manualmente',play:'Reanudar desplazamiento automático'}
};
const SUMMARY = {
  "uk": [
    "Спільні враження гравців",
    "За словами автора проєкту, гравці позитивно відгукувалися про ігри й сайт та розповідали, що грали разом у різних компаніях. Це узагальнення усних відгуків, а не дослівні цитати.",
    "Учасник спільних ігор"
  ],
  "en": [
    "Players’ shared impressions",
    "According to the project creator, players gave positive feedback about the games and website and said they played together in different groups. This is a summary of verbal feedback, not individual quotations.",
    "Group games participant"
  ],
  "sv": [
    "Spelarnas gemensamma intryck",
    "Enligt projektets skapare gav spelarna positiv respons på spelen och webbplatsen och berättade att de spelade tillsammans i olika sällskap. Detta är en sammanfattning av muntlig respons, inte individuella citat.",
    "Deltagare i sällskapsspel"
  ],
  "de": [
    "Gemeinsame Eindrücke der Spielenden",
    "Laut dem Projektentwickler äußerten sich die Spielenden positiv über die Spiele und die Website und berichteten, dass sie in verschiedenen Gruppen zusammen spielten. Dies ist eine Zusammenfassung mündlicher Rückmeldungen, keine wörtlichen Einzelzitate.",
    "Teilnahme an Gruppenspielen"
  ],
  "es": [
    "Impresiones compartidas de los jugadores",
    "Según el creador del proyecto, los jugadores valoraron positivamente los juegos y el sitio web y contaron que jugaron juntos en distintos grupos. Es un resumen de comentarios verbales, no citas individuales.",
    "Participante en juegos de grupo"
  ]
};
const flag = country => String.fromCodePoint(...[...country].map(c => c.charCodeAt(0) + 127397));
export function PlayerReviews({lang,t,entries=PLAYER_REVIEWS}) {
 const headingId = useId();
 const [manual,setManual] = useState(false);
 const reviews = visiblePlayerReviews(entries,lang);
 const participants = visibleReviewParticipants(lang);
 const cards = reviews.length ? reviews : participants;
 if (!cards.length) return null;
 const [summaryTitle,summaryText,participantLabel] = SUMMARY[lang] ?? SUMMARY.en;
 const copy = COPY[lang] ?? COPY.en;
 const animate = cards.length >= 4;
 const regions = new Intl.DisplayNames([COPY[lang] ? lang : 'en'],{type:'region'});
 const group = (clone=false) => <ul className={'review-group'+(clone?' review-clone':'')} aria-hidden={clone||undefined}>
  {cards.map(review => <li className="review-card" key={review.id}>
   {review.quote && <blockquote>{review.quote}</blockquote>}
   <div className="review-author"><strong>{review.name}</strong><span><span aria-hidden="true">{flag(review.country)}</span> {regions.of(review.country)}</span></div>
   <small>{review.quote ? t.games[review.game]?.n : participantLabel}</small>
  </li>)}
 </ul>;
 return <section className="s player-reviews" aria-labelledby={headingId}>
  <div className="wrap review-header"><h2 id={headingId}>{reviews.length ? copy.heading : summaryTitle}</h2>
   {animate && <button type="button" className="btn sm review-toggle" onClick={()=>setManual(v=>!v)}>{manual?copy.play:copy.pause}</button>}
  </div>
  {!reviews.length && <p className="wrap review-summary">{summaryText}</p>}
  <div className={'review-viewport'+(manual||!animate?' review-manual':'')} tabIndex={0} role="region" aria-labelledby={headingId}
    onPointerDown={event=>{if(event.pointerType==='touch')setManual(true);}} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))setManual(true);}}>
   <div className="review-track" style={{'--review-duration':Math.max(28,cards.length*6)+'s'}}>
    {group()}{animate&&group(true)}
   </div>
  </div>
 </section>;
}
