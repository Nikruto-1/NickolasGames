import { useCallback, useEffect, useRef, useState } from "react";
import { initialLanguage, LANGUAGE_PATHS } from "../utils/siteMetadata.js";
import { GAMES, gameFromSearch, pageForGame } from "../utils/gameNavigation.js";
import { readValue, writeValue } from "../utils/progress.js";
import { pathLanguage } from "./routeParsing.js";

export function useGameRouting() {
  const [lang, setLang] = useState(initialLanguage);
  const [screenGame, setScreenGame] = useState(() => gameFromSearch(location.search));
  const [game, setGame] = useState(() => {
    const routed = gameFromSearch(location.search);
    const saved = readValue("nickolasgames-active-game");
    return routed || (GAMES.includes(saved) ? saved : "crocodile");
  });
  const ready = useRef(false);
  useEffect(() => { writeValue("nickolasgames-active-game", game); }, [game]);

  useEffect(() => {
    try { localStorage.setItem("nickolasgames-lang", lang); } catch {}
    document.documentElement.lang = lang;
    const privacy = location.pathname.endsWith("/privacy/");
    const nextPath = LANGUAGE_PATHS[lang] + (privacy ? "privacy/" : "");
    if (!ready.current) {
      ready.current = true;
      const fromPath = pathLanguage(location.pathname);
      if (fromPath && fromPath !== lang) { setLang(fromPath); return; }
    }
    if (location.pathname !== nextPath) history.replaceState(null, "", nextPath + location.search);
  }, [lang]);

  useEffect(() => {
    const onHistory = () => {
      const route = gameFromSearch(location.search);
      setScreenGame(route);
      if (route) setGame(route);
      const nextLang = pathLanguage(location.pathname);
      if (nextLang) setLang(nextLang);
    };
    addEventListener("popstate", onHistory);
    return () => removeEventListener("popstate", onHistory);
  }, []);

  const navigate = useCallback((requested) => {
    const selected = requested === "random"
      ? GAMES[Math.floor(Math.random() * GAMES.length)]
      : (GAMES.includes(requested) ? requested : null);
    if (selected) setGame(selected);
    setScreenGame(selected);
    history.pushState(null, "", pageForGame(lang, selected, location.search));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [lang]);

  return { lang, setLang, screenGame, game, navigate };
}
