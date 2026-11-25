import {gameFaq} from '../locales/gameFaq.js';
import {gamePath} from '../utils/siteRoutes.js';
import './GameFaq.css';
export function GameFaq({lang,game,games,onChoose}){
 const {heading,relatedHeading,items,related}=gameFaq(lang,game);
 return <section className="game-faq wrap" aria-labelledby="game-faq-heading">
  <h2 id="game-faq-heading">{heading}</h2>
  {items.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
  <nav className="related-games" aria-labelledby="related-games-heading">
   <h2 id="related-games-heading">{relatedHeading}</h2>
   <ul>{related.map(({key,reason})=><li key={key}><a href={gamePath(lang,key)} onClick={event=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onChoose(key);}}>{games[key].n}</a><p>{reason}</p></li>)}</ul>
  </nav>
 </section>;
}
