import { validPlayers, validTargetScore } from "./playerScores.js";

export function readValue(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function writeValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export function readProgress(key) {
  const s = readValue(key);
  const strings = a => Array.isArray(a) && a.every(x => typeof x === "string");
  if (!s || s.version !== 1 || !strings(s.queue) || !Number.isInteger(s.idx) || s.idx < 0 ||
      !["easy", "medium", "hard"].includes(s.difficulty) || typeof s.cat !== "string" ||
      !Number.isFinite(s.left) || !Number.isFinite(s.roundSeconds) || s.roundSeconds < 10 || s.roundSeconds > 600 || s.left < 0 || s.left > s.roundSeconds ||
      !s.score || ![s.score.got, s.score.skipped].every(n => Number.isInteger(n) && n >= 0) ||
      typeof s.playerNames !== "string" || typeof s.customWords !== "string" || typeof s.customOnly !== "boolean" ||
      !Array.isArray(s.assignments) || !s.assignments.every(a => a && typeof a.id === "string" && typeof a.name === "string" && typeof a.word === "string" && strings(a.usedWords))) return null;
  // Older saves have no individual scores. Keep their existing game progress.
  if (s.players !== undefined && !validPlayers(s.players)) return null;
  if (s.targetScore !== undefined && !validTargetScore(s.targetScore)) return null;
  if (s.activePlayerId !== undefined && (typeof s.activePlayerId !== "string" ||
    (s.activePlayerId && !s.players?.some(p => p.id === s.activePlayerId)))) return null;
  return s;
}
