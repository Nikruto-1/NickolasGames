import { useCheckersGame } from "./useCheckersGame.js";
import { CHECKERS_COPY } from "./copy.js";
import { CheckersBoard } from "./CheckersBoard.jsx";
import { CheckersControls } from "./CheckersControls.jsx";
import { CheckersLeaderboard } from "./CheckersLeaderboard.jsx";
import { CheckersResultModal } from "./CheckersResultModal.jsx";
import "./CheckersGame.css";

export function CheckersGame({lang="uk"}){
  const t=CHECKERS_COPY[lang]||CHECKERS_COPY.en;
  const controller=useCheckersGame(t);
  return <section className="ck-page s pv" aria-label={t.local}>
    <div className="wrap">
      <div className="ck-layout">
        <CheckersLeaderboard t={t} {...controller}/>
        <CheckersBoard t={t} {...controller}/>
        <CheckersControls t={t} {...controller}/>
      </div>
      <CheckersResultModal t={t} {...controller}/>
    </div>
  </section>;
}
