import { useEffect, useMemo, useRef, useState } from "react";
import { readTruthDareSession, saveTruthDareSession, createTruthDareSession, chooseTruthDare, advanceTruthDare, ALL_TRUTH_DARE_CATEGORIES } from "./session.js";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "./truthOrDare.uk.js";
import "./TruthOrDareGame.css";
import { getTruthDareLocale, localizeTruthDareCard, localizedCategory } from "./i18n.js";

export function TruthOrDareGame({ games, t, lang, onGame }) {
  const [session, setSession] = useState(() => readTruthDareSession(localStorage) || createTruthDareSession());
  const { categories, queue, index, chosen, skipped } = session;
  const [draftCategories, setDraftCategories] = useState(() => [...categories]);
  const [settingsOpen, setSettingsOpen] = useState(() => !readTruthDareSession(localStorage));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmationRef = useRef(null);
  const [storageOk, setStorageOk] = useState(true);
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
    setStorageOk(saveTruthDareSession(localStorage, session));
  }, [session]);

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
  return (
    <section className="s pv td-root" id="preview" aria-label={games.truth.n}>
      <div className="wrap">
        <div className="td-topline">
          <div>
            <span className="td-eyebrow">{i18n.eyebrow}</span>
            <h2>{i18n.title1} <span>{i18n.title2}</span> {i18n.title3}</h2>
            <p>{i18n.subtitle}</p>
          </div>
          <button type="button" className="td-settings-btn" onClick={toggleSettings}
            aria-expanded={settingsOpen} aria-controls="td-settings">{settingsOpen ? i18n.close : i18n.settings} <span aria-hidden="true">{settingsOpen ? "−" : "⚙"}</span></button>
        </div>
        <div className="td-switcher" role="group" aria-label={t.gameLabel}>
          {["whoami", "crocodile", "alias", "truth"].map((key) => <button type="button" key={key} className="chip" aria-pressed={key === "truth"} onClick={() => onGame(key)}>{games[key].n}</button>)}
        </div>
        <div id="td-settings" className={"td-settings" + (settingsOpen ? " is-open" : "")}>
          <div className="td-section-head"><h3>{i18n.chooseCats}</h3><span>{draftCategories.length} / 8 {i18n.active}</span></div>
          <button type="button" className="td-all" aria-pressed={all} onClick={() => setDraftCategories([...ALL_TRUTH_DARE_CATEGORIES])}>{i18n.all} <span aria-hidden="true">{all ? "✓" : "+"}</span></button>
          <div className="td-categories">
            {TRUTH_DARE_CATEGORIES.map((original, i) => { const category = localizedCategory(original,lang); return <button type="button" key={category.id}
              className="td-category" aria-pressed={draftCategories.includes(category.id)}
              onClick={() => toggleCategory(category.id)}>
              <span className="td-category-index">{String(i + 1).padStart(2, "0")}</span>
              <strong>{category.name}</strong><small>{category.description}</small>
              <span className="td-category-count">100 {i18n.cards}</span><span className="td-check" aria-hidden="true">{draftCategories.includes(category.id) ? "✓" : "+"}</span>
            </button>; })}
          </div>
          <p className="td-safe">{i18n.safe}</p>
          <button type="button" className="btn pri td-apply" onClick={applyCategories}>{i18n.done} · {available} {i18n.cards}</button>
          <button type="button" className="btn td-cancel" onClick={closeSettings}>{i18n.cancel || "Cancel"}</button>
        </div>
        {confirmOpen && <div className="td-confirm-backdrop">
          <div ref={confirmationRef} className="td-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="td-confirm-title" aria-describedby="td-confirm-text">
            <h3 id="td-confirm-title">{i18n.confirmTitle}</h3>
            <p id="td-confirm-text">{i18n.confirmText}</p>
            <div className="td-confirm-actions">
              <button type="button" className="btn" onClick={() => setConfirmOpen(false)}>{i18n.cancel}</button>
              <button type="button" className="btn pri" onClick={confirmCategories}>{i18n.confirmReset}</button>
            </div>
          </div>
        </div>}
        {!storageOk && <p className="td-save-warning" role="alert">{i18n.saveError}</p>}
        <div className="td-play-area">
          <div className="td-play-header">
            <div className="td-stat"><b>{Math.min(index + 1, queue.length)}</b><span> / {queue.length} {i18n.cards}</span></div>
            <div className="td-progress"><span style={{width: (queue.length ? Math.min(index, queue.length) / queue.length * 100 : 0) + "%"}} /></div>
            <button type="button" className="td-inline-settings" onClick={toggleSettings}>{categories.length} {i18n.categories} · {i18n.preferences} ↗</button>
          </div>
          <div className={"td-card" + (chosen ? " is-revealed" : "")} aria-live="polite">
            <div className="td-card-top">
              <span className="td-kind">{completed ? i18n.finished : !chosen ? i18n.turn : current?.type === "truth" ? i18n.truth.toLocaleUpperCase() : i18n.dare.toLocaleUpperCase()}</span>
              <span className="td-card-no">{String(Math.min(index + 1, queue.length)).padStart(3, "0")} / {queue.length}</span>
            </div>
            <div className="td-card-center">
              {completed ? <>
                <h3>{i18n.finishTitle}</h3>
                <p>{i18n.finishText}</p>
              </> : !chosen ? <>
                <span className="td-card-kicker">{i18n.turn}</span>
                <h3>{i18n.choiceTitle}</h3>
                <p>{i18n.choiceHint}</p>
                <div className="td-choice-buttons" role="group" aria-label={i18n.choiceTitle}>
                  <button type="button" className="td-choice-button td-choice-truth" onClick={() => chooseType("truth")} disabled={!remainingTypes.has("truth")}>
                    <strong>{i18n.truth}</strong><small>{i18n.truthHint}</small>
                  </button>
                  <button type="button" className="td-choice-button td-choice-dare" onClick={() => chooseType("dare")} disabled={!remainingTypes.has("dare")}>
                    <strong>{i18n.dare}</strong><small>{i18n.dareHint}</small>
                  </button>
                </div>
              </> : <>
                <div className="td-card-category">{translatedCategory?.name}</div>
                <h3>{current.text}</h3>
                {current.challenge && <div className="td-card-challenge"><strong>{i18n.challenge}</strong><p>{current.challenge}</p></div>}
              </>}
            </div>
            <div className="td-card-bottom">
              <span>{chosen ? translatedCategory?.name : "NickolasGames"}</span>
              <span>{i18n.comfort}</span>
            </div>
          </div>
          <div className="td-actions">
            {completed ? <button type="button" className="btn pri td-primary" onClick={reset}>{i18n.again}</button>
            : chosen ? <><button type="button" className="btn pri td-primary" onClick={() => advance(false)}>{i18n.next} →</button>
            <button type="button" className="btn td-secondary" onClick={() => advance(true)} aria-label={i18n.skip}>{i18n.skip}</button></> : null}
          </div>
          <div className="td-footnote"><span>{i18n.noRepeats}</span><span>{i18n.skipped}: {skipped}</span></div>
        </div>
      </div>
    </section>
  );
}
