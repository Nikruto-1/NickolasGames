export const POINTS_BY_DIFFICULTY = { easy: 1, medium: 2, hard: 3 };
export const DEFAULT_TARGET_SCORE = 30;
export const validTargetScore = score => Number.isInteger(score) && score >= 1 && score <= 1000;
export const findWinner = (players, targetScore) => validTargetScore(targetScore)
  ? players.find(player => player.points >= targetScore) || null : null;
export const nextPlayerId = (players, activeId) => {
  if (!players.length) return "";
  const index = players.findIndex(player => player.id === activeId);
  return players[(index + 1) % players.length].id;
};

export function recordPlayerAnswer(players, playerId, difficulty, outcome) {
  if (!POINTS_BY_DIFFICULTY[difficulty] || !["correct", "skip"].includes(outcome)) return players;
  return players.map(player => player.id !== playerId ? player : {
    ...player,
    points: player.points + (outcome === "correct" ? POINTS_BY_DIFFICULTY[difficulty] : 0),
    guessed: player.guessed + (outcome === "correct" ? 1 : 0),
    skipped: player.skipped + (outcome === "skip" ? 1 : 0),
  });
}

export function validPlayers(players) {
  return Array.isArray(players) && players.every(p => p && typeof p.id === "string" && p.id &&
    typeof p.name === "string" && p.name.trim() &&
    [p.points, p.guessed, p.skipped].every(n => Number.isSafeInteger(n) && n >= 0)) &&
    new Set(players.map(p => p.id)).size === players.length;
}
