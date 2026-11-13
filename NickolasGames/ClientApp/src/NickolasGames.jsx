import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { PrivacyPanel } from "./components/PrivacyPanel.jsx";





import { Hero, GamesGrid, HowItWorks, FinalCta } from "./components/HomeSections.jsx";
import { SiteNavigation } from "./components/SiteNavigation.jsx";

import { AppStatus } from "./components/AppStatus";
import { updateSiteMetadata } from "./utils/siteMetadata.js";
import { PRIVACY_COPY } from "./locales/privacy.js";
import { useGameRouting } from "./app/useGameRouting.js";
import { GameScreen } from "./components/GameScreen.jsx";
import { COPY } from "./locales";
import "./nickolasgames.css";
import "./product.css";

const AliasGame=lazy(()=>import("./features/alias/AliasGame.jsx").then(m=>({default:m.AliasGame})));

const TruthOrDareGame=lazy(()=>import("./features/truth-or-dare/TruthOrDareGame.jsx").then(m=>({default:m.TruthOrDareGame})));

const CharadesGame=lazy(()=>import("./features/charades/CharadesGame.jsx").then(m=>({default:m.CharadesGame})));

const WhoAmIGame=lazy(()=>import("./features/whoami/WhoAmIGame.jsx").then(m=>({default:m.WhoAmIGame})));

const CheckersGame=lazy(()=>import("./features/checkers/CheckersGame.jsx").then(m=>({default:m.CheckersGame})));

const HolmesIntro=lazy(()=>import("./components/HolmesIntro.jsx").then(m=>({default:m.HolmesIntro})));

const LOADING_GAME={uk:"Завантаження гри…",en:"Loading game…",sv:"Laddar spel…",de:"Spiel wird geladen…",es:"Cargando juego…"};

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
      {showIntro && <Suspense fallback={<div role="status" aria-live="polite">{LOADING_GAME[lang]||LOADING_GAME.en}</div>}><HolmesIntro lang={lang} onComplete={finishIntro}/></Suspense>}
      <div className={"app-shell" + (screenGame ? " is-playing" : "")} inert={showIntro ? true : undefined}>
      <SiteNavigation lang={lang} setLang={setLang} label={t.language} onHome={() => navigate(null)} />
      {screenGame !== "checkers" && <AppStatus lang={lang} />}
      <main id="main">
      {screenGame === null ? <>
        <Hero t={t} onStart={requestStart} />
        <GamesGrid games={t.games} t={t} onPlay={choose} />
        <HowItWorks t={t} />
        <FinalCta t={t} onStart={requestStart} />
      </> : <GameScreen game={screenGame} games={t.games} lang={lang}
        onBack={() => navigate(null)} onChoose={choose}>
        <Suspense fallback={<div role="status" className="game-loading" aria-live="polite" aria-busy="true">{LOADING_GAME[lang]||LOADING_GAME.en}</div>}>
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
        </Suspense>
      </GameScreen>}
      </main>
      <footer><span>{t.footer}</span><PrivacyPanel lang={lang} /><button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
