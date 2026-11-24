import {truthCatalog,sessionCatalog,snapshotDecks} from './customCatalog.js';
import {normalizeLibrary} from '../../utils/customLibrary.js';
export function restoreCustomTruthSession(raw){
 if(!raw)return null;
 if(raw.customDecks!==undefined){
  const valid=normalizeLibrary(raw.customDecks);
  if(!valid||!['uk','en','sv','de','es'].includes(raw.customLang)||valid.some(x=>x.game!=='truth'||x.lang!==raw.customLang))return null;
  const catalog=sessionCatalog({...raw,customDecks:valid});
  const restored=restoreTruthDareSession(raw,catalog.cards,new Set(catalog.categories.map(c=>c.id)));
  return restored?{...restored,customDecks:valid,customLang:raw.customLang}:null;
 }
 return restoreTruthDareSession(raw);
}
import { rememberContent, nextContent } from '../../utils/contentHistory.js';
import { useEffect, useMemo, useRef, useState } from "react";
import { readTruthDareSession, restoreTruthDareSession, createTruthDareSession, chooseTruthDare, advanceTruthDare, ALL_TRUTH_DARE_CATEGORIES } from "./session.js";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "./truthOrDare.uk.js";
import { getTruthDareLocale, localizeTruthDareCard, localizedCategory } from "./i18n.js";

import { useVersionedState, restoreGameSession, browserStorage } from "../../utils/gameSession.js";

export function useTruthOrDareGame({ lang, library=[] }) {
  const [session, setSession, storageOk] = useVersionedState({
    game: "truth-or-dare", lang: "shared", restore: restoreCustomTruthSession,
    initialize: () => readTruthDareSession(browserStorage()) || createTruthDareSession()
  });
  const { categories, queue, index, chosen, skipped } = session;
  useEffect(()=>{rememberContent('truth-or-dare','shared',queue.slice(0,index+Number(chosen)));},[queue,index,chosen]);
  const liveCatalog=useMemo(()=>truthCatalog(library,lang),[library,lang]);
  const activeCatalog=useMemo(()=>sessionCatalog(session),[session.customDecks,session.customLang]);
  const catalogCategories=useMemo(()=>[...new Map([...activeCatalog.categories,...liveCatalog.categories].map(c=>[c.id,c])).values()],[activeCatalog,liveCatalog]);
  const selectableIds=liveCatalog.categories.map(c=>c.id);
  const freshSession=categories=>{
    const selected=categories.filter(id=>selectableIds.includes(id));
    const valid=selected.length?selected:ALL_TRUTH_DARE_CATEGORIES;
    const customDecks=snapshotDecks(library,lang,valid);
    const catalog=truthCatalog(customDecks,lang);
    const next=createTruthDareSession(valid,Math.random,catalog.cards);
    const queue=nextContent('truth-or-dare','shared',next.queue);
    return {...next,queue,historyCycle:true,customDecks,customLang:lang};
  };
  const [draftCategories, setDraftCategories] = useState(() => [...categories]);
  const [settingsOpen, setSettingsOpen] = useState(() => !readTruthDareSession(browserStorage()) && !restoreGameSession(browserStorage(), "truth-or-dare", "shared", restoreCustomTruthSession));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmationRef = useRef(null);
  const cardsById = useMemo(() => new Map(activeCatalog.cards.map(card => [card.id, card])), [activeCatalog]);
  const i18n = getTruthDareLocale(lang).ui;
  const current = localizeTruthDareCard(cardsById.get(queue[index]), lang);
  const activeCategory = activeCatalog.categories.find(c => c.id === current?.category);
  const translatedCategory = activeCategory ? localizedCategory(activeCategory, lang) : null;
  const available = liveCatalog.cards.filter(c => draftCategories.includes(c.category)).length;
  const remainingTypes = new Set(queue.slice(index).map(id => cardsById.get(id)?.type));
  const all = selectableIds.every(id=>draftCategories.includes(id));
  const changed = draftCategories.length !== categories.length || draftCategories.some(id => !categories.includes(id));
  const completed = index >= queue.length;

  useEffect(() => {
    if (!confirmOpen) return;
    const previousFocus = document.activeElement;
    const buttons = [...confirmationRef.current.querySelectorAll("button")];
    buttons[0]?.focus();
    const handleKeyDown = event => {
      if (event.key === "Escape") { event.preventDefault(); setConfirmOpen(false); return; }
      if (event.key !== "Tab" || !buttons.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault(); buttons[buttons.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
        event.preventDefault(); buttons[0].focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [confirmOpen]);

  const chooseType = type => setSession(current => chooseTruthDare(current, type, cardsById));
  const advance = skip => setSession(current => advanceTruthDare(current, skip));
  const toggleCategory = id => setDraftCategories(current =>
    current.includes(id) ? (current.length === 1 ? current : current.filter(c => c !== id)) : [...current, id]
  );
  const closeSettings = () => {
    setDraftCategories([...categories]);
    setConfirmOpen(false);
    setSettingsOpen(false);
  };
  const toggleSettings = () => {
    if (settingsOpen) closeSettings();
    else { setDraftCategories([...categories]); setSettingsOpen(true); }
  };
  const applyCategories = () => {
    if (!changed) { setSettingsOpen(false); return; }
    if (index > 0 || chosen) { setConfirmOpen(true); return; }
    setSession(freshSession(draftCategories));
    setSettingsOpen(false);
  };
  const confirmCategories = () => {
    setSession(freshSession(draftCategories));
    setConfirmOpen(false);
    setSettingsOpen(false);
  };
  const reset = () => {
    setSession(freshSession(categories));
    setDraftCategories([...categories]);
  };
  return { catalogCategories, selectableIds, session, setSession, categories, queue, index, chosen, skipped, draftCategories, setDraftCategories, settingsOpen, setSettingsOpen, confirmOpen, setConfirmOpen, confirmationRef, storageOk, cardsById, i18n, current, activeCategory, translatedCategory, available, remainingTypes, all, changed, completed, chooseType, advance, toggleCategory, closeSettings, toggleSettings, applyCategories, confirmCategories, reset };
}
