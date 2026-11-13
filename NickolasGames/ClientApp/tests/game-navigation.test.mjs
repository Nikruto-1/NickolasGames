import test from "node:test";
import assert from "node:assert/strict";
import { GAMES, gameFromSearch, pageForGame } from "../src/utils/gameNavigation.js";

test("game URLs work in all five supported languages", () => {
  for (const lang of ["uk","en","sv","de","es"]) {
    for (const game of GAMES) {
      const url = pageForGame(lang, game);
      const path = lang === "en" ? "/" : `/${lang}/`;
      assert.equal(url, path + "?game=" + game);
      assert.equal(gameFromSearch(new URL(url, "https://example.test").search), game);
      assert.equal(pageForGame(lang, null, "?game=" + game), path);
    }
  }
});

test("unknown game values fall back to catalog, not a broken screen", () => {
  assert.equal(gameFromSearch("?game=unknown"), null);
  assert.equal(gameFromSearch("?game=%3Cscript%3E"), null);
  assert.equal(gameFromSearch("?game="), null);
  assert.equal(gameFromSearch(""), null);
});

test("navigation retains unrelated query parameters and removes only game", () => {
  assert.equal(pageForGame("uk", "truth", "?utm_source=discord"), "/uk/?utm_source=discord&game=truth");
  assert.equal(pageForGame("sv", null, "?utm_source=discord&game=alias"), "/sv/?utm_source=discord");
});
