import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as core from "../../../packages/game-core/index.js";
import * as browserAlias from "../src/features/alias/gameLogic.js";
import * as browserCharades from "../src/features/charades/gameLogic.js";
import * as browserWhoami from "../src/features/whoami/gameLogic.js";
import * as browserTruth from "../src/features/truth-or-dare/session.js";

test("shared game core exports all four platform-independent engines", () => {
  for (const game of ["alias", "charades", "whoami", "truthOrDare"]) {
    assert.ok(core[game], game);
    assert.ok(Object.keys(core[game]).length > 2, game);
  }
  assert.equal(browserAlias.aliasReducer, core.alias.aliasReducer);
  assert.equal(browserCharades.charadesReducer, core.charades.charadesReducer);
  assert.equal(browserWhoami.whoamiReducer, core.whoami.whoamiReducer);
  assert.equal(browserTruth.chooseTruthDare, core.truthOrDare.chooseTruthDare);
});

test("core files have no React imports or browser storage access", async () => {
  const sources = [
    "shared/difficulty.js", "shared/words.js", "shared/playerScores.js",
    "alias/rules.js", "charades/rules.js", "whoami/rules.js",
    "truth-or-dare/session.js", "truth-or-dare/cards.uk.js"
  ];
  for (const source of sources) {
    const file = fileURLToPath(new URL("../../../packages/game-core/" + source, import.meta.url));
    const code = await readFile(file, "utf8");
    assert.doesNotMatch(code, /\bfrom\s*["']react["']|\bwindow\.|\bdocument\.|\blocalStorage\b|\bsessionStorage\b/, source);
  }
});

test("truth or dare session can transition without an active browser", () => {
  let state = core.truthOrDare.createTruthDareSession(["friends"], () => 0.5);
  assert.equal(state.queue.length, 100);
  state = core.truthOrDare.chooseTruthDare(state, "truth");
  assert.equal(state.chosen, true);
  state = core.truthOrDare.advanceTruthDare(state);
  assert.equal(state.index, 1);
  assert.equal(state.chosen, false);
});
