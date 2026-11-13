import { useCallback, useEffect, useState } from "react";
import { PrivacyPanel } from "./components/PrivacyPanel.jsx";
import { AliasGame } from "./components/AliasGame.jsx";
import { TruthOrDareGame } from "./components/TruthOrDareGame.jsx";
import { CharadesGame } from "./components/CharadesGame";
import { WhoAmIGame } from "./components/WhoAmIGame";
import { CardStackPreview } from "./components/CardStackPreview.jsx";
import { Hero, GamesGrid, HowItWorks, FinalCta } from "./components/HomeSections.jsx";
import { SiteNavigation } from "./components/SiteNavigation.jsx";
import { HolmesIntro } from "./components/HolmesIntro";
import { AppStatus } from "./components/AppStatus";
import { initialLanguage, updateSiteMetadata, LANGUAGE_PATHS } from "./utils/siteMetadata.js";
import { PRIVACY_COPY } from "./locales/privacy.js";
import { readValue, writeValue } from "./utils/progress";
import { scrollToSection } from "./utils/pageNavigation.js";
import { COPY } from "./locales";
import "./nickolasgames.css";
import "./product.css";

const PLAYABLE = ["whoami", "crocodile", "alias", "truth"];
const pickRandom = () => PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];

export default function NickolasGames() {
  const [showIntro, setShowIntro] = useState(false);
  const [startRequest,setStartRequest]=useState(0);
  const requestStart=()=>{setStartRequest(value=>value+1);document.querySelector("#preview")?.scrollIntoView({behavior:"instant",block:"start"});};
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const [lang, setLang] = useState(initialLanguage);
  const [game, setGame] = useState(() => { const g = readValue("nickolasgames-active-game"); return PLAYABLE.includes(g) ? g : "crocodile"; });
  useEffect(() => { writeValue("nickolasgames-active-game", game); }, [game]);
  const t = COPY[lang] || COPY.en;
  const choose = (k, scroll) => {
    setStartRequest(0);
    setGame(k === "random" ? pickRandom() : k);
    if (scroll) scrollToSection("#preview");
  };

  useEffect(() => {
    try { localStorage.setItem("nickolasgames-lang", lang); } catch {}
    document.documentElement.lang = lang;
    const privacy = location.pathname.endsWith("/privacy/");
    const nextPath = LANGUAGE_PATHS[lang] + (privacy ? "privacy/" : "");
    if (location.pathname !== nextPath) history.replaceState(null, "", nextPath + location.search);
    const update = () => updateSiteMetadata(lang, t.games, (PRIVACY_COPY[lang] || PRIVACY_COPY.en).title);
    update();
    addEventListener("popstate", update);
    return () => removeEventListener("popstate", update);
  }, [lang]);

  return (
    <>
      {showIntro && <HolmesIntro lang={lang} onComplete={finishIntro} />}
      <div inert={showIntro ? true : undefined}>
      <SiteNavigation lang={lang} setLang={setLang} label={t.language} />
      <AppStatus lang={lang} />
      <main id="main">
      <Hero t={t} onStart={requestStart} />
      <GamesGrid games={t.games} t={t} onPlay={(k) => choose(k, true)} />
      {game === "crocodile"
        ? <CharadesGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={(k) => choose(k, false)} />
        : game === "whoami" ? <WhoAmIGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={(k) => choose(k, false)} />
        : game === "alias" ? <AliasGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={(k) => choose(k, false)} />
        : game === "truth" ? <TruthOrDareGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} onGame={(k) => choose(k, false)} />
        : <CardStackPreview key={`${lang}-${game}`} game={game} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={(k) => choose(k, false)} />}
      <HowItWorks t={t} />
      <FinalCta t={t} onStart={requestStart} />
      </main>
      <footer><span>{t.footer}</span><PrivacyPanel lang={lang} /><button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
