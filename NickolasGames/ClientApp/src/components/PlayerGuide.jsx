import {gameGuide} from '../locales/gameGuides.js';
import './PlayerGuide.css';
export function PlayerGuide({lang,game=null}){
 const guide=gameGuide(lang,game);
 return <section className="player-guide wrap" aria-labelledby="player-guide-heading">
  <h2 id="player-guide-heading">{guide.heading}</h2>
  <p>{guide.paragraphs[0]}</p>
  {game&&<h3>{guide.examples}</h3>}
  {guide.paragraphs.slice(1).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
 </section>;
}
