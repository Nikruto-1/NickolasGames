import { useEffect, useMemo, useRef, useState } from "react";
import { readTruthDareSession, restoreTruthDareSession, createTruthDareSession, chooseTruthDare, advanceTruthDare, ALL_TRUTH_DARE_CATEGORIES } from "./session.js";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "./truthOrDare.uk.js";
import { getTruthDareLocale, localizeTruthDareCard, localizedCategory } from "./i18n.js";

import { useVersionedState, restoreGameSession } from "../../utils/gameSession.js";

export function useTruthOrDareGame({ lang }) {
  const [session, setSession, storageOk] = useVersionedState({
    game: "truth-or-dare", lang: "shared", restore: restoreTruthDareSession,
    initialize: () => readTruthDareSession(localStorage) || createTruthDareSession()
  });
  const { categories, queue, index, chosen, skipped } = session;
  const [draftCategories, setDraftCategories] = useState(() => [...categories]);
  const [settingsOpen, setSettingsOpen] = useState(() => !readTruthDareSession(localStorage) && !restoreGameSession(localStorage, "truth-or-dare", "shared", restoreTruthDareSession));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmationRef = useRef(null);
  const cardsById = useMemo(() => new Map(TRUTH_DARE_CARDS.map(card => [card.id, card])), []);
  const i18n = getTruthDareLocale(lang).ui;
  const current = localizeTruthDareCard(cardsById.get(queue[index]), lang);
  const activeCategory = TRUTH_DARE_CATEGORIES.find(c => c.id === current?.category);
  const translatedCategory = activeCategory ? localizedCategory(activeCategory, lang) : null;
  const available = TRUTH_DARE_CARDS.filter(c => draftCategories.includes(c.category)).length;
  const remainingTypes = new Set(queue.slice(index).map(id => cardsById.get(id)?.type));
  const all = draftCategories.length === TRUTH_DARE_CATEGORIES.length;
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

  const chooseType = type => setSession(current => chooseTruthDare(current, type));
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
    setSession(createTruthDareSession(draftCategories));
    setSettingsOpen(false);
  };
  const confirmCategories = () => {
    setSession(createTruthDareSession(draftCategories));
    setConfirmOpen(false);
    setSettingsOpen(false);
  };
  const reset = () => {
    setSession(createTruthDareSession(categories));
    setDraftCategories([...categories]);
  };
  return { session, setSession, categories, queue, index, chosen, skipped, draftCategories, setDraftCategories, settingsOpen, setSettingsOpen, confirmOpen, setConfirmOpen, confirmationRef, storageOk, cardsById, i18n, current, activeCategory, translatedCategory, available, remainingTypes, all, changed, completed, chooseType, advance, toggleCategory, closeSettings, toggleSettings, applyCategories, confirmCategories, reset };
}
