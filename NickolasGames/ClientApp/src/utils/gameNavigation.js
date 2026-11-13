import { LANGUAGE_PATHS } from "./siteMetadata.js";

export const GAMES = Object.freeze(["whoami", "crocodile", "alias", "truth"]);

export function gameFromSearch(search = "") {
  const name = new URLSearchParams(search).get("game");
  return GAMES.includes(name) ? name : null;
}

export function pageForGame(lang, game, search = "") {
  const params = new URLSearchParams(search);
  if (GAMES.includes(game)) params.set("game", game);
  else params.delete("game");
  const query = params.toString();
  return (LANGUAGE_PATHS[lang] || LANGUAGE_PATHS.en) + (query ? "?" + query : "");
}
