import { useCallback, useEffect, useState } from "react";
import { PrivacyPanel } from "./components/PrivacyPanel.jsx";
import { AliasGame } from "./features/alias/AliasGame.jsx";
import { TruthOrDareGame } from "./features/truth-or-dare/TruthOrDareGame.jsx";
import { CharadesGame } from "./features/charades/CharadesGame";
import { WhoAmIGame } from "./features/whoami/WhoAmIGame";
import { CheckersGame } from "./features/checkers/CheckersGame.jsx";
import { Hero, GamesGrid, HowItWorks, FinalCta } from "./components/HomeSections.jsx";
import { SiteNavigation } from "./components/SiteNavigation.jsx";
import { HolmesIntro } from "./components/HolmesIntro";
import { AppStatus } from "./components/AppStatus";
import { updateSiteMetadata } from "./utils/siteMetadata.js";
import { PRIVACY_COPY } from "./locales/privacy.js";
import { useGameRouting } from "./app/useGameRouting.js";
import { GameScreen } from "./components/GameScreen.jsx";
import { COPY } from "./locales";
import "./nickolasgames.css";
import "./product.css";

export default function NickolasGames() {
  const [showIntro, setShowIntro] = useState(false);
  const [startRequest,setStartRequest] = useState(0);
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const { screenGame, lang, setLang, game, navigate } = useGameRouting();
  const t = COPY[lang] || COPY.en;
  const choose = (requested) => { setStartRequest(0); navigate(requested); };
  const requestStart = () => choose(game);
  useEffect(() => {
    updateSiteMetadata(lang, t.games, (PRIVACY_COPY[lang] || PRIVACY_COPY.en).title);
  }, [lang, screenGame, t.games]);

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
          : screenGame === "checkers"
            ? <CheckersGame key={`${lang}-checkers`} lang={lang} />
          : screenGame === "truth"
            ? <TruthOrDareGame key={`${lang}-truth`} games={t.games} t={t} lang={lang} onGame={choose} />
          : null}
      </GameScreen>}
      </main>
      <footer><span>{t.footer}</span><PrivacyPanel lang={lang} /><button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
