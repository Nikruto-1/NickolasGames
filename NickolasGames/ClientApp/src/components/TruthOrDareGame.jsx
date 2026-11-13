import { useEffect, useMemo, useState } from "react";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "../data/truthOrDare.uk.js";
import "./TruthOrDareGame.css";
import { getTruthDareLocale, localizeTruthDareCard, localizedCategory } from "../data/truthOrDare.i18n.js";

const STORAGE = "nickolasgames-truth-dare-v2";
const shuffle = (values) => {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const validCategories = new Set(TRUTH_DARE_CATEGORIES.map((c) => c.id));
const readSaved = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.queue)) return null;
    if (!data.categories.every((c) => validCategories.has(c))) return null;
    return data;
  } catch { return null; }
};
const makeQueue = (categories) => shuffle(TRUTH_DARE_CARDS
  .filter((c) => categories.includes(c.category))
  .map((c) => c.id));

export function TruthOrDareGame({ games, t, lang, onGame }) {
  const [saved] = useState(readSaved);
  const [categories, setCategories] = useState(() => saved?.categories?.length ? saved.categories : TRUTH_DARE_CATEGORIES.map((c) => c.id));
  const [queue, setQueue] = useState(() => saved?.queue?.length ? saved.queue : makeQueue(TRUTH_DARE_CATEGORIES.map((c) => c.id)));
  const [index, setIndex] = useState(() => Math.min(Math.max(0, Number(saved?.index) || 0), saved?.queue?.length || 800));
  const [chosen, setChosen] = useState(false);
  const [skipped, setSkipped] = useState(() => Number(saved?.skipped) || 0);
  const [settingsOpen, setSettingsOpen] = useState(() => !saved);
  const cardsById = useMemo(() => new Map(TRUTH_DARE_CARDS.map((card) => [card.id, card])), []);
  const i18n = getTruthDareLocale(lang).ui;
  const current = localizeTruthDareCard(cardsById.get(queue[index]), lang);
  const activeCategory = TRUTH_DARE_CATEGORIES.find((c) => c.id === current?.category);
  const translatedCategory = activeCategory ? localizedCategory(activeCategory,lang) : null;
  const available = TRUTH_DARE_CARDS.filter((c) => categories.includes(c.category)).length;
  const remainingTypes = new Set(queue.slice(index).map((id) => cardsById.get(id)?.type));
  const chooseType = (type) => {
    if (chosen || !remainingTypes.has(type)) return;
    const position = queue.findIndex((id, i) => i >= index && cardsById.get(id)?.type === type);
    if (position === -1) return;
    if (position !== index) setQueue((currentQueue) => {
      const next = [...currentQueue];
      [next[index], next[position]] = [next[position], next[index]];
      return next;
    });
    setChosen(true);
  };
  const reset = (newCategories = categories) => {
    const selected = newCategories.length ? newCategories : TRUTH_DARE_CATEGORIES.map((c) => c.id);
    setCategories(selected);
    setQueue(makeQueue(selected));
    setIndex(0);
    setSkipped(0);
    setChosen(false);
  };
  const toggleCategory = (id) => {
    const selected = categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id];
    if (!selected.length) return;
    reset(selected);
  };
  const advance = (skip = false) => {
    if (!current) return;
    if (!chosen) return;
    if (skip) setSkipped((v) => v + 1);
    setChosen(false);
    setIndex((v) => v + 1);
  };
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ categories, queue, index, skipped })); } catch {}
  }, [categories, queue, index, skipped]);
  const start = () => setSettingsOpen(false);
  const all = categories.length === TRUTH_DARE_CATEGORIES.length;
  const completed = index >= queue.length;
  return (
    <section className="s pv td-root" id="preview" aria-label={games.truth.n}>
      <div className="wrap">
        <div className="td-topline">
          <div>
            <span className="td-eyebrow">{i18n.eyebrow}</span>
            <h2>{i18n.title1} <span>{i18n.title2}</span> {i18n.title3}</h2>
            <p>{i18n.subtitle}</p>
          </div>
          <button type="button" className="td-settings-btn" onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen} aria-controls="td-settings">{settingsOpen ? i18n.close : i18n.settings} <span aria-hidden="true">{settingsOpen ? "−" : "⚙"}</span></button>
        </div>
        <div className="td-switcher" role="group" aria-label={t.gameLabel}>
          {["whoami", "crocodile", "alias", "truth"].map((key) => <button type="button" key={key} className="chip" aria-pressed={key === "truth"} onClick={() => onGame(key)}>{games[key].n}</button>)}
        </div>
        <div id="td-settings" className={"td-settings" + (settingsOpen ? " is-open" : "")}>
          <div className="td-section-head"><h3>{i18n.chooseCats}</h3><span>{categories.length} / 8 {i18n.active}</span></div>
          <button type="button" className="td-all" aria-pressed={all} onClick={() => reset(TRUTH_DARE_CATEGORIES.map((c) => c.id))}>{i18n.all} <span aria-hidden="true">{all ? "✓" : "+"}</span></button>
          <div className="td-categories">
            {TRUTH_DARE_CATEGORIES.map((original, i) => { const category = localizedCategory(original,lang); return <button type="button" key={category.id}
              className="td-category" aria-pressed={categories.includes(category.id)}
              onClick={() => toggleCategory(category.id)}>
              <span className="td-category-index">{String(i + 1).padStart(2, "0")}</span>
              <strong>{category.name}</strong><small>{category.description}</small>
              <span className="td-category-count">100 {i18n.cards}</span><span className="td-check" aria-hidden="true">{categories.includes(category.id) ? "✓" : "+"}</span>
            </button>; })}
          </div>
          <p className="td-safe">{i18n.safe}</p>
          <button type="button" className="btn pri td-apply" onClick={start}>{i18n.done} · {available} {i18n.cards}</button>
        </div>
        <div className="td-play-area">
          <div className="td-play-header">
            <div className="td-stat"><b>{Math.min(index + 1, queue.length)}</b><span> / {queue.length} {i18n.cards}</span></div>
            <div className="td-progress"><span style={{width: (queue.length ? Math.min(index, queue.length) / queue.length * 100 : 0) + "%"}} /></div>
            <button type="button" className="td-inline-settings" onClick={() => setSettingsOpen((v) => !v)}>{categories.length} {i18n.categories} · {i18n.preferences} ↗</button>
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
            {completed ? <button type="button" className="btn pri td-primary" onClick={() => reset()}>{i18n.again}</button>
            : chosen ? <><button type="button" className="btn pri td-primary" onClick={() => advance(false)}>{i18n.next} →</button>
            <button type="button" className="btn td-secondary" onClick={() => advance(true)} aria-label={i18n.skip}>{i18n.skip}</button></> : null}
          </div>
          <div className="td-footnote"><span>{i18n.noRepeats}</span><span>{i18n.skipped}: {skipped}</span></div>
        </div>
      </div>
    </section>
  );
}
