// Shared in-game navigation keeps the same games and accessibility behaviour
// across party modes. Checkers has its own dedicated game-screen navigation.
const PARTY_GAMES = ['whoami', 'crocodile', 'alias', 'truth'];

export function GameTabs({ active, games, t, onChoose, showRandom = false }) {
  return (
    <div className="tabs game-tabs" role="group" aria-label={t.gameLabel}>
      {PARTY_GAMES.map(game => (
        <button type="button" key={game} className="chip"
          aria-pressed={game === active} onClick={() => onChoose(game)}>
          {games[game].n}
        </button>
      ))}
      {showRandom && <button type="button" className="chip"
        onClick={() => onChoose('random')}>{t.random}</button>}
    </div>
  );
}
