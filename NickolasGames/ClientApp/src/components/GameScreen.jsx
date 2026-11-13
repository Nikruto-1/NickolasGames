import "./GameScreen.css";

const COPY = {
  uk: { back: "До всіх ігор", label: "Обери гру", intro: "Грай у своєму темпі — налаштування й прогрес зберігаються на цьому пристрої." },
  en: { back: "All games", label: "Choose a game", intro: "Play at your own pace. Your settings and progress stay on this device." },
  sv: { back: "Alla spel", label: "Välj ett spel", intro: "Spela i er egen takt. Inställningar och framsteg sparas på den här enheten." },
  de: { back: "Alle Spiele", label: "Spiel auswählen", intro: "Spielt in eurem Tempo. Einstellungen und Fortschritt bleiben auf diesem Gerät." },
  es: { back: "Todos los juegos", label: "Elige un juego", intro: "Jugad a vuestro ritmo. Los ajustes y el progreso se guardan en este dispositivo." }
};

const GAME_KEYS = ["whoami", "crocodile", "alias", "truth", "checkers"];

export function GameScreen({ game, games, lang, onBack, onChoose, children }) {
  const copy = COPY[lang] || COPY.en;
  return (
    <div className="game-screen" data-game={game}>
      <header className="game-screen-header">
        <div className="wrap">
          <button type="button" className="game-back" onClick={onBack}>
            <span aria-hidden="true">←</span> {copy.back}
          </button>
          <div className="game-screen-heading">
            <div>
              <p className="game-screen-kicker">NICKOLASGAMES</p>
              <h1>{games[game].n}</h1>
              <p>{copy.intro}</p>
            </div>
          </div>
          <nav className="game-screen-nav" aria-label={copy.label}>
            {GAME_KEYS.map(key => (
              <button key={key} type="button" aria-current={key === game ? "page" : undefined}
                className={"game-screen-tab" + (key === game ? " is-active" : "")}
                onClick={() => onChoose(key)}>{games[key].n}</button>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
