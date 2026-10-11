import { test } from "node:test";
import assert from "node:assert/strict";
import { recordPlayerAnswer, validPlayers, findWinner, validTargetScore, DEFAULT_TARGET_SCORE, nextPlayerId } from "../src/utils/playerScores.js";
import { readProgress, writeValue } from "../src/utils/progress.js";

const players = () => [
  { id: "a", name: "Mykola", points: 0, guessed: 0, skipped: 0 },
  { id: "b", name: "Anastasiia", points: 0, guessed: 0, skipped: 0 },
];

test("awards 1/2/3 to the selected player and zero for a skip", () => {
  let roster = players();
  for (const level of ["easy", "medium", "hard"]) roster = recordPlayerAnswer(roster, "a", level, "correct");
  roster = recordPlayerAnswer(roster, "b", "hard", "skip");
  assert.deepEqual(roster, [
    { id: "a", name: "Mykola", points: 6, guessed: 3, skipped: 0 },
    { id: "b", name: "Anastasiia", points: 0, guessed: 0, skipped: 1 },
  ]);
  roster = recordPlayerAnswer(roster, "b", "medium", "correct");
  assert.equal(roster[1].points, 2);
  assert.equal(roster[0].points, 6);
});

test("player scores restore alongside the active player; old saves stay readable", () => {
  const entries = new Map();
  globalThis.localStorage = { getItem: k => entries.get(k), setItem: (k, v) => entries.set(k, v) };
  const state = { version: 1, cat: "__all__", difficulty: "hard", queue: ["A"], idx: 0,
    score: { got: 0, skipped: 0 }, roundSeconds: 60, left: 32, playerNames: "",
    customWords: "", customOnly: false, assignments: [] };
  writeValue("save", state);
  assert.deepEqual(readProgress("save"), state);
  const updated = { ...state, players: recordPlayerAnswer(players(), "b", "hard", "correct"), activePlayerId: "b" };
  writeValue("save", updated);
  assert.deepEqual(readProgress("save"), updated);
  writeValue("save", { ...updated, activePlayerId: "deleted-player" });
  assert.equal(readProgress("save"), null);
  assert.equal(validPlayers([{ ...players()[0], points: -1 }]), false);
  assert.equal(validPlayers([players()[0], players()[0]]), false);
});

test("default and custom victory targets allow reaching or exceeding the goal", () => {
  assert.equal(DEFAULT_TARGET_SCORE, 30);
  const roster = players();
  roster[0].points = 29;
  assert.equal(findWinner(roster, 30), null);
  const winning = recordPlayerAnswer(roster, "a", "hard", "correct");
  assert.equal(findWinner(winning, 30).id, "a");
  assert.equal(findWinner(winning, 32).id, "a");
  assert.equal(findWinner(winning, 50), null);
  for (const invalid of [0, -1, 1.5, 1001, Infinity, "30"]) assert.equal(validTargetScore(invalid), false);
  assert.equal(validTargetScore(1), true);
  assert.equal(validTargetScore(1000), true);
});

test("turns follow roster order, wrap around and support a single player", () => {
  const roster = [...players(), { id: "c", name: "Sofia", points: 0, guessed: 0, skipped: 0 }];
  assert.equal(nextPlayerId(roster, "a"), "b");
  assert.equal(nextPlayerId(roster, "b"), "c");
  assert.equal(nextPlayerId(roster, "c"), "a");
  assert.equal(nextPlayerId([roster[0]], "a"), "a");
  assert.equal(nextPlayerId([], "a"), "");
});
