import { CatPiece } from "./CatPiece.jsx";
export function CheckersLeaderboard({t,leaderboard,standings,matchesPlayed}){
  return (
<aside className="ck-leaderboard" aria-label={t.leaderboard}>
          <div className="ck-leaderboard-title">
            <p className="ck-eyebrow">NICKOLASGAMES</p>
            <h3>{t.leaderboard}</h3>
          </div>
          <div className="ck-rank-list">
            {leaderboard.map((side,i)=><div className="ck-rank-item" key={side}>
              <span className={"ck-rank-num"+(i===0?" ck-gold":"")}>{i+1}</span>
              <div className="ck-rank-cat"><CatPiece side={side} king={false}/></div>
              <div className="ck-rank-name"><strong>{side==="white"?t.white:t.black}</strong><small>{t.winsLabel}</small></div>
              <strong className="ck-rank-score">{standings[side]}</strong>
            </div>)}
          </div>
          <div className="ck-leaderboard-total"><span>{t.played}</span><strong>{matchesPlayed}</strong></div>
          <div className="ck-recent">
            <h4>{t.recentMatches}</h4>
            {standings.recent.length
              ? <ol>{standings.recent.slice(0,3).map((result,i)=><li key={result.id}>
                  <span className="ck-recent-num">{i+1}.</span>
                  <span>{result.side==="white"?t.white:t.black}</span>
                  <span aria-hidden="true">★</span>
                </li>)}</ol>
              : <p>{t.noResults}</p>}
          </div>
        </aside>
  );
}
