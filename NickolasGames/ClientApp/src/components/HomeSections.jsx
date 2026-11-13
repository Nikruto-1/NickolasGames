import { useEffect, useRef, useState } from "react";
import { HolmesFloor } from "./HolmesFloor";
import { reducedMotion, scrollToSection } from "../utils/pageNavigation.js";

export function Hero({ t, onStart }) {
  return (
    <header className="hero holmes-home">
      <div className="wrap">
        <div className="hero-copy"><h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
        <div className="cta-row">
          <button className="btn pri" onClick={onStart}>{t.start}</button>
          <button className="btn" onClick={() => scrollToSection("#games")}>{t.explore}</button>
        </div></div>
        <HolmesFloor games={t.games} />
      </div>
    </header>
  );
}

export function GamesGrid({ games, t, onPlay }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="s" id="games">
      <div className="wrap">
        <div className="head"><h2>{t.gamesTitle}</h2><p>{t.gamesText}</p></div>
        <div ref={ref} className={"grid reveal-games" + (seen ? " in" : "")}>
          {Object.entries(games).map(([k, g]) => (
            <article className="gc" key={k}>
              <h3>{g.n}</h3><p>{g.d}</p>
              <div className="meta"><span>{g.p}</span><span>{g.t}</span></div>
              <button className="btn sm" onClick={() => onPlay(k)} aria-label={`${t.play} ${g.n}`}>{t.play}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ t }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="head"><h2>{t.howTitle}</h2></div>
        <div className="steps">
          {t.steps.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ t }) {
  const items = reducedMotion ? t.testimonials : [...t.testimonials, ...t.testimonials];
  return (
    <section className="s" style={{ paddingTop: 20 }}>
      <div className="wrap"><div className="head"><h2>{t.testimonialsTitle}</h2></div></div>
      <div className="mq"><div className="mt">
        {items.map(([name, country, quote, game], i) => (
          <figure className="tc" style={{ margin: 0 }} key={`${name}-${i}`}>
            <q>{quote}</q>
            <div><b>{name}, {country}</b>{t.played} {game}</div>
          </figure>
        ))}
      </div></div>
    </section>
  );
}

export function FinalCta({ t, onStart }) {
  return (
    <section className="fin">
      <div className="wrap">
        <h2>{t.finalTitle}</h2>
        <p>{t.finalText}</p>
        <button className="btn pri" onClick={onStart}>{t.start}</button>
      </div>
    </section>
  );
}

