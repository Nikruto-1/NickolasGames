import {OfflineDownload} from './components/OfflineDownload.jsx';
import { ResultsHistory } from './components/ResultsHistory.jsx';
import { CustomLibrary } from './components/CustomLibrary.jsx';
import { readLibrary,saveLibrary,gamesWithLibrary } from './utils/customLibrary.js';
import './styles/custom-library.css';
import { readTheme, saveTheme } from './utils/themePreference.js';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
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

const SpyGame=lazy(()=>import("./features/spy/SpyGame.jsx").then(m=>({default:m.SpyGame})));
const AliasGame=lazy(()=>import("./features/alias/AliasGame.jsx").then(m=>({default:m.AliasGame})));

const TruthOrDareGame=lazy(()=>import("./features/truth-or-dare/TruthOrDareGame.jsx").then(m=>({default:m.TruthOrDareGame})));

const CharadesGame=lazy(()=>import("./features/charades/CharadesGame.jsx").then(m=>({default:m.CharadesGame})));

const WhoAmIGame=lazy(()=>import("./features/whoami/WhoAmIGame.jsx").then(m=>({default:m.WhoAmIGame})));

const CheckersGame=lazy(()=>import("./features/checkers/CheckersGame.jsx").then(m=>({default:m.CheckersGame})));

const HolmesIntro=lazy(()=>import("./components/HolmesIntro.jsx").then(m=>({default:m.HolmesIntro})));

const LOADING_GAME={uk:"Завантаження гри…",en:"Loading game…",sv:"Laddar spel…",de:"Spiel wird geladen…",es:"Cargando juego…"};

export default function NickolasGames() {
  const [theme,setTheme]=useState(readTheme);
  useEffect(()=>{document.documentElement.dataset.theme=theme;saveTheme(theme);},[theme]);
  const [showIntro, setShowIntro] = useState(false);
  const [startRequest,setStartRequest] = useState(0);
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const { screenGame, lang, setLang, game, navigate } = useGameRouting();
  const t = COPY[lang] || COPY.en;
  const [library,setLibrary]=useState(readLibrary);
  const libraryGames=useMemo(()=>gamesWithLibrary(t.games,library,lang),[t.games,library,lang]);
  const updateLibrary=items=>{if(!saveLibrary(items))return false;setLibrary(items);return true;};
  const choose = (requested) => { setStartRequest(0); navigate(requested); };
  const requestStart = () => choose(game);
  useEffect(() => {
    updateSiteMetadata(lang, t.games, (PRIVACY_COPY[lang] || PRIVACY_COPY.en).title);
  }, [lang, screenGame, t.games]);

  return (
    <>
      {showIntro && <Suspense fallback={<div role="status" aria-live="polite">{LOADING_GAME[lang]||LOADING_GAME.en}</div>}><HolmesIntro lang={lang} onComplete={finishIntro}/></Suspense>}
      <div className={"app-shell" + (screenGame ? " is-playing" : "")} inert={showIntro ? true : undefined}>
      <SiteNavigation theme={theme} onTheme={()=>setTheme(v=>v==="dark"?"light":"dark")} lang={lang} setLang={setLang} label={t.language} onHome={() => navigate(null)} />
      {screenGame !== "checkers" && <AppStatus lang={lang} />}
      <main id="main">
      {screenGame === null ? <>
        <Hero t={t} onStart={requestStart} />
        <GamesGrid games={t.games} t={t} onPlay={choose} />
        <CustomLibrary key={lang} items={library} onSave={updateLibrary} lang={lang} t={t} />
        <ResultsHistory key={lang} lang={lang} t={t}/>
        <OfflineDownload lang={lang}/>
        <HowItWorks t={t} />
        <FinalCta t={t} onStart={requestStart} />
      </> : <GameScreen game={screenGame} games={t.games} lang={lang}
        onBack={() => navigate(null)} onChoose={choose}>
        <Suspense fallback={<div role="status" className="game-loading" aria-live="polite" aria-busy="true">{LOADING_GAME[lang]||LOADING_GAME.en}</div>}>
        {screenGame === "crocodile"
          ? <CharadesGame key={`${lang}-crocodile`} games={libraryGames} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "whoami"
            ? <WhoAmIGame key={`${lang}-whoami`} games={libraryGames} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "alias"
            ? <AliasGame key={`${lang}-alias`} games={libraryGames} t={t} lang={lang} startRequest={startRequest} onGame={choose} />
          : screenGame === "checkers"
            ? <CheckersGame key={`${lang}-checkers`} lang={lang} />
          : screenGame === "spy"
            ? <SpyGame key={`${lang}-spy`} lang={lang} />
          : screenGame === "truth"
            ? <TruthOrDareGame library={library} key={`${lang}-truth`} games={libraryGames} t={t} lang={lang} onGame={choose} />
          : null}
        </Suspense>
      </GameScreen>}
      </main>
      <footer><span>{t.footer}</span><PrivacyPanel lang={lang} /><button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
