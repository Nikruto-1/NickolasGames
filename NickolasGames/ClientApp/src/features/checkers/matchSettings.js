import { initialCheckers } from "./gameLogic.js";

// Keeps saved pre-feature settings compatible; never resets the selected AI level.
export const normalizeCheckersSettings = value => ({
  mode: value?.mode === "bot" ? "bot" : "friend",
  level: value?.level === "medium" ? "medium" : "easy",
  starter: ["white","black","random"].includes(value?.starter) ? value.starter : "white",
  humanSide: value?.humanSide === "black" ? "black" : "white"
});

export function selectFirstSide(starter, draw = Math.random) {
  if (starter === "black") return "black";
  if (starter !== "random") return "white";
  const number = Number(draw());
  return Number.isFinite(number) && number >= 0.5 ? "black" : "white";
}

export function createCheckersMatch(starter, draw = Math.random, matchId = null) {
  const turn = selectFirstSide(starter, draw);
  return { ...initialCheckers(), turn, startingSide: turn, ...(matchId ? {matchId} : {}) };
}
