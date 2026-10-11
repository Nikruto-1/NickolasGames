import { useEffect, useState } from "react";
import { POINTS_BY_DIFFICULTY, validTargetScore } from "../utils/playerScores";

export const SCORE_COPY = {
  uk: { title: "Гравці та бали", name: "Ім’я гравця", add: "Додати гравця", empty: "Додай гравців і обери, хто зараз показує слово.", active: "Зараз показує", points: "Бали", correct: "Вгадано", next: "Наступний гравець", remove: "Видалити гравця", confirm: "Видалити гравця та його бали?", duplicate: "Гравець із таким ім’ям уже є.", scoring: "Легкий — 1 бал · Середній — 2 бали · Складний — 3 бали. Пропуск — 0 балів.", reset: "Нова гра очищає всі бали. Зміна рівня їх зберігає." },
  en: { title: "Players and points", name: "Player name", add: "Add player", empty: "Add players and select who is acting out the word.", active: "Acting now", points: "Points", correct: "Guessed", next: "Next player", remove: "Remove player", confirm: "Remove this player and their points?", duplicate: "A player with this name already exists.", scoring: "Easy — 1 point · Medium — 2 points · Hard — 3 points. Skip — 0 points.", reset: "New game clears all points. Changing difficulty keeps them." },
  sv: { title: "Spelare och poäng", name: "Spelarens namn", add: "Lägg till spelare", empty: "Lägg till spelare och välj vem som visar ordet.", active: "Visar nu", points: "Poäng", correct: "Gissat", next: "Nästa spelare", remove: "Ta bort spelare", confirm: "Ta bort spelaren och poängen?", duplicate: "En spelare med detta namn finns redan.", scoring: "Lätt — 1 poäng · Medel — 2 poäng · Svår — 3 poäng. Hoppa över — 0 poäng.", reset: "Nytt spel nollställer alla poäng. Byte av svårighetsgrad behåller dem." },
  de: { title: "Spieler und Punkte", name: "Spielername", add: "Spieler hinzufügen", empty: "Füge Spieler hinzu und wähle, wer das Wort darstellt.", active: "Stellt gerade dar", points: "Punkte", correct: "Erraten", next: "Nächster Spieler", remove: "Spieler entfernen", confirm: "Spieler und Punkte entfernen?", duplicate: "Ein Spieler mit diesem Namen existiert bereits.", scoring: "Leicht — 1 Punkt · Mittel — 2 Punkte · Schwer — 3 Punkte. Überspringen — 0 Punkte.", reset: "Ein neues Spiel löscht alle Punkte. Ein Schwierigkeitswechsel behält sie." },
  es: { title: "Jugadores y puntos", name: "Nombre del jugador", add: "Añadir jugador", empty: "Añade jugadores y elige quién representa la palabra.", active: "Representa ahora", points: "Puntos", correct: "Adivinada", next: "Siguiente jugador", remove: "Eliminar jugador", confirm: "¿Eliminar al jugador y sus puntos?", duplicate: "Ya existe un jugador con este nombre.", scoring: "Fácil — 1 punto · Medio — 2 puntos · Difícil — 3 puntos. Pasar — 0 puntos.", reset: "Una nueva partida borra todos los puntos. Cambiar la dificultad los conserva." },
};

const VICTORY_COPY = {
  uk: { target: "Бали для перемоги", apply: "Застосувати", targetHint: "Обери ціль перед початком гри. Перемагає той, хто першим набере цю кількість балів або більше.", locked: "Щоб змінити ціль, почни нову гру.", invalid: "Вкажи ціле число від 1 до 1000.", winner: "Переможець", finished: "Гру завершено! Натисни «Нова гра», щоб зіграти ще раз." },
  en: { target: "Points to win", apply: "Apply", targetHint: "Choose a target before playing. The first player to reach or exceed it wins.", locked: "Start a new game to change the target.", invalid: "Enter a whole number from 1 to 1000.", winner: "Winner", finished: "Game over! Press New game to play again." },
  sv: { target: "Poäng för att vinna", apply: "Spara", targetHint: "Välj ett mål innan spelet börjar. Den första spelaren som når eller överstiger målet vinner.", locked: "Starta ett nytt spel för att ändra målet.", invalid: "Ange ett heltal mellan 1 och 1000.", winner: "Vinnare", finished: "Spelet är slut! Tryck på Nytt spel för att spela igen." },
  de: { target: "Punkte zum Sieg", apply: "Übernehmen", targetHint: "Wähle ein Ziel vor Spielbeginn. Wer es zuerst erreicht oder übertrifft, gewinnt.", locked: "Starte ein neues Spiel, um das Ziel zu ändern.", invalid: "Gib eine ganze Zahl von 1 bis 1000 ein.", winner: "Gewinner", finished: "Spiel beendet! Drücke Neues Spiel, um erneut zu spielen." },
  es: { target: "Puntos para ganar", apply: "Aplicar", targetHint: "Elige una meta antes de jugar. Gana quien alcance o supere esa puntuación primero.", locked: "Inicia una nueva partida para cambiar la meta.", invalid: "Introduce un número entero entre 1 y 1000.", winner: "Ganador", finished: "¡Partida terminada! Pulsa Nueva partida para volver a jugar." },
};

export function PlayerScores({ players, activeId, difficulty, lang, disabled, targetScore, targetLocked, winner, onTarget, onAdd, onSelect, onRemove }) {
  const t = { ...(SCORE_COPY[lang] || SCORE_COPY.en), ...(VICTORY_COPY[lang] || VICTORY_COPY.en) };
  const [name, setName] = useState("");
  const [warning, setWarning] = useState("");
  const [targetDraft, setTargetDraft] = useState(String(targetScore));
  const [targetWarning, setTargetWarning] = useState("");
  useEffect(() => { setTargetDraft(String(targetScore)); setTargetWarning(""); }, [targetScore, targetLocked]);
  const active = players.find(p => p.id === activeId);
  const next = players[(players.findIndex(p => p.id === activeId) + 1) % players.length];
  const submit = event => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || disabled) return;
    if (players.some(p => p.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) { setWarning(t.duplicate); return; }
    onAdd(clean); setName(""); setWarning("");
  };
  return <div className="players-panel player-scores">
    <h3>{t.title}</h3>
    <p>{t.scoring}</p>
    <form onSubmit={event => {
      event.preventDefault();
      if (targetLocked || disabled) return;
      const value = Number(targetDraft);
      if (!validTargetScore(value)) { setTargetWarning(t.invalid); return; }
      onTarget(value); setTargetWarning("");
    }}>
      <label className="players-label" htmlFor="target-score">{t.target}</label>
      <div className="player-add">
        <input id="target-score" type="number" min="1" max="1000" step="1" value={targetDraft} disabled={targetLocked || disabled}
          onChange={event => { setTargetDraft(event.target.value); setTargetWarning(""); }} />
        <button className="btn sm" disabled={targetLocked || disabled}>{t.apply}</button>
      </div>
      <p className="players-note">{targetLocked ? t.locked : t.targetHint}</p>
      {targetWarning && <p role="alert">{targetWarning}</p>}
    </form>
    {winner && <div className="winner-banner" role="status">
      <h4>🏆 {t.winner}: {winner.name}</h4>
      <p><b>{winner.points}</b> / {targetScore} · {t.points}</p>
      <p>{t.finished}</p>
    </div>}
    <form onSubmit={submit}>
      <label className="players-label" htmlFor="score-player-name">{t.name}</label>
      <div className="player-add">
        <input id="score-player-name" maxLength={60} value={name} onChange={e => { setName(e.target.value); setWarning(""); }} disabled={disabled} />
        <button className="btn sm" disabled={disabled || !name.trim()}>{t.add}</button>
      </div>
    </form>
    {warning && <p role="alert">{warning}</p>}
    {!players.length && <p>{t.empty}</p>}
    {players.length > 0 && <>
      <p className="current-player">{t.active}: <b>{active?.name}</b> · +{POINTS_BY_DIFFICULTY[difficulty]}</p>
      <ul className="player-score-list">
        {players.map(player => <li key={player.id}>
          <button className="chip" aria-pressed={player.id === activeId} disabled={disabled} onClick={() => onSelect(player.id)}>{player.name}</button>
          <span><b>{player.points}</b> / {targetScore} {t.points}</span>
          <button className="player-remove" aria-label={`${t.remove}: ${player.name}`} disabled={disabled} onClick={() => { if (!player.points || window.confirm(t.confirm)) onRemove(player.id); }}>×</button>
        </li>)}
      </ul>
      {players.length > 1 && <button className="btn sm" disabled={disabled} onClick={() => onSelect(next.id)}>{t.next}</button>}
    </>}
    <div className="players-note">{t.reset}</div>
  </div>;
}
