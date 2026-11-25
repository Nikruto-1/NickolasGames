import { useCallback, useEffect, useRef, useState } from "react";
import { initialLanguage, LANGUAGE_PATHS } from "../utils/siteMetadata.js";
import { GAMES, gameFromLocation, pageForGame } from "../utils/gameNavigation.js";
import { readValue, writeValue } from "../utils/progress.js";
import { pathLanguage } from "./routeParsing.js";

export function useGameRouting() {
  const [lang, setLang] = useState(initialLanguage);
  const [privacy,setPrivacy]=useState(()=>/\/privacy\/?$/.test(location.pathname));
  const [screenGame, setScreenGame] = useState(() => gameFromLocation(location.pathname, location.search));
  const [game, setGame] = useState(() => {
    const routed = gameFromLocation(location.pathname, location.search);
    const saved = readValue("nickolasgames-active-game");
    return routed || (GAMES.includes(saved) ? saved : "crocodile");
  });
  const ready = useRef(false);
  useEffect(() => { writeValue("nickolasgames-active-game", game); }, [game]);

  useEffect(() => {
    try { localStorage.setItem("nickolasgames-lang", lang); } catch {}
    document.documentElement.lang = lang;
    const privacy = /\/privacy\/?$/.test(location.pathname);
    const nextPath = privacy ? LANGUAGE_PATHS[lang] + "privacy/" + location.search : pageForGame(lang, gameFromLocation(location.pathname, location.search), location.search);
    if (!ready.current) {
      ready.current = true;
      // The bare root may redirect to a previously chosen language.
      // A localized URL is authoritative when it explicitly specifies one.
      const fromPath = location.pathname === "/" ? null : pathLanguage(location.pathname);
      if (fromPath && fromPath !== lang) { setLang(fromPath); return; }
    }
    if (location.pathname + location.search !== nextPath) history.replaceState(null, "", nextPath);
  }, [lang]);

  useEffect(() => {
    const onHistory = () => {
      const route = gameFromLocation(location.pathname, location.search);
      setScreenGame(route);
      setPrivacy(/\/privacy\/?$/.test(location.pathname));
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
    setPrivacy(false);
    history.pushState(null, "", pageForGame(lang, selected, location.search));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [lang]);

  const openPrivacy=useCallback(()=>{
    if(/\/privacy\/?$/.test(location.pathname))return;
    const query=new URLSearchParams(location.search);query.delete('game');
    history.pushState({nickolasPrivacy:true},'',LANGUAGE_PATHS[lang]+'privacy/'+(query.size?'?'+query.toString():''));
    setScreenGame(null);setPrivacy(true);
  },[lang]);
  const closePrivacy=useCallback(()=>{
    if(history.state?.nickolasPrivacy){history.back();return;}
    history.replaceState(null,'',LANGUAGE_PATHS[lang]+location.search);
    setPrivacy(false);setScreenGame(null);
  },[lang]);
  return { lang, setLang, screenGame, game, navigate,privacy,openPrivacy,closePrivacy };
}
