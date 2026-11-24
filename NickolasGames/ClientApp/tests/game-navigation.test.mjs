import test from "node:test";
import assert from "node:assert/strict";
import { GAMES, gameFromSearch, pageForGame, gameFromLocation } from "../src/utils/gameNavigation.js";

test("game URLs work in all five supported languages", () => {
  for (const lang of ["uk","en","sv","de","es"]) {
    for (const game of GAMES) {
      const url = pageForGame(lang, game);
      const path = lang === "en" ? "/" : `/${lang}/`;
      assert.equal(url, path + "games/" + game + "/");
      assert.equal(gameFromLocation(new URL(url, "https://example.test").pathname), game);
      assert.equal(gameFromSearch("?game="+game),game);
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
  assert.equal(pageForGame("uk", "truth", "?utm_source=discord"), "/uk/games/truth/?utm_source=discord");
  assert.equal(pageForGame("sv", null, "?utm_source=discord&game=alias"), "/sv/?utm_source=discord");
});

test("language and privacy paths are recognized for browser history navigation", async () => {
  const { pathLanguage } = await import("../src/app/routeParsing.js");
  for (const lang of ["uk","en","sv","de","es"]) {
    assert.equal(pathLanguage(`/${lang}/`),lang);
    assert.equal(pathLanguage(`/${lang}/privacy/`),lang);
  }
  assert.equal(pathLanguage("/"),"en");
  assert.equal(pathLanguage("/random/"),null);
});
