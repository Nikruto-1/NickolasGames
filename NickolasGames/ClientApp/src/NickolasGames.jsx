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
import { gameFromSearch, pageForGame } from "./utils/gameNavigation.js";
import { GameScreen } from "./components/GameScreen.jsx";
import { COPY } from "./locales";
import "./nickolasgames.css";
import "./product.css";

const PLAYABLE = ["whoami", "crocodile", "alias", "truth"];
const pickRandom = () => PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];

export default function NickolasGames() {
  const [showIntro, setShowIntro] = useState(false);
  const [startRequest,setStartRequest] = useState(0);
  const [screenGame, setScreenGame] = useState(() => gameFromSearch(location.search));
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const [lang, setLang] = useState(initialLanguage);
  const [game, setGame] = useState(() => { const route = gameFromSearch(location.search); const saved = readValue("nickolasgames-active-game"); return route || (PLAYABLE.includes(saved) ? saved : "crocodile"); });
  useEffect(() => { writeValue("nickolasgames-active-game", game); }, [game]);
  const t = COPY[lang] || COPY.en;
  const navigate = (k) => {
    const selected = k === "random" ? pickRandom() : (PLAYABLE.includes(k) ? k : null);
    if (selected) setGame(selected);
    setScreenGame(selected);
    setStartRequest(0);
    history.pushState(null, "", pageForGame(lang, selected, location.search));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const requestStart = () => navigate(game);
  const choose = (k) => navigate(k);

  useEffect(() => {
    try { localStorage.setItem("nickolasgames-lang", lang); } catch {}
    document.documentElement.lang = lang;
    const privacy = location.pathname.endsWith("/privacy/");
    const nextPath = LANGUAGE_PATHS[lang] + (privacy ? "privacy/" : "");
    if (location.pathname !== nextPath) history.replaceState(null, "", nextPath + location.search);
    const update = () => updateSiteMetadata(lang, t.games, (PRIVACY_COPY[lang] || PRIVACY_COPY.en).title);
    update();
    return undefined;
  }, [lang]);

  useEffect(() => {
    const onHistory = () => {
      const route = gameFromSearch(location.search);
      setScreenGame(route);
      if (route) setGame(route);
      const pathLang = location.pathname === "/" ? "en" : location.pathname.split("/").find(part => Object.hasOwn(LANGUAGE_PATHS, part));
      if (pathLang && pathLang !== lang) setLang(pathLang);
    };
    addEventListener("popstate", onHistory);
    return () => removeEventListener("popstate", onHistory);
  }, [lang]);

  return (
    <>
      {showIntro && <HolmesIntro lang={lang} onComplete={finishIntro} />}
      <div className={"app-shell" + (screenGame ? " is-playing" : "")} inert={showIntro ? true : undefined}>
      <SiteNavigation lang={lang} setLang={setLang} label={t.language} onHome={() => navigate(null)} />
      <AppStatus lang={lang} />
      <main id="main">
      {screenGame === null ? <>
        <Hero t={t} onStart={requestStart} />
        <GamesGrid games={t.games} t={t} onPlay={choose} />
        <HowItWorks t={t} />
        <FinalCta t={t} onStart={requestStart} />
      </> : <GameScreen game={screenGame} games={t.games} lang={lang}
        onBack={() => navigate(null)} onChoose={choose}>
        {screenGame === "crocodile"
          ? <CharadesGame key={`${lang}-crocodile`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "whoami"
            ? <WhoAmIGame key={`${lang}-whoami`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "alias"
            ? <AliasGame key={`${lang}-alias`} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "truth"
            ? <TruthOrDareGame key={`${lang}-truth`} games={t.games} t={t} lang={lang} onGame={choose} />
          : <CardStackPreview key={`${lang}-${screenGame}`} game={screenGame} games={t.games} t={t} lang={lang} startRequest={startRequest} onGame={choose} />}
      </GameScreen>}
      </main>
      <footer><span>{t.footer}</span><PrivacyPanel lang={lang} /><button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
