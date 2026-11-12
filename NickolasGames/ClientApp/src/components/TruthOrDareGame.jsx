import { useEffect, useMemo, useState } from "react";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "../data/truthOrDare.uk.js";
import "./TruthOrDareGame.css";

const STORAGE = "nickolasgames-truth-dare-v1";
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
    if (!["both", "truth", "dare"].includes(data.mode)) return null;
    return data;
  } catch { return null; }
};
const makeQueue = (categories, mode) => shuffle(TRUTH_DARE_CARDS
  .filter((c) => categories.includes(c.category) && (mode === "both" || c.type === mode))
  .map((c) => c.id));

export function TruthOrDareGame({ games, t, lang, onGame }) {
  const [saved] = useState(readSaved);
  const [categories, setCategories] = useState(() => saved?.categories?.length ? saved.categories : TRUTH_DARE_CATEGORIES.map((c) => c.id));
  const [mode, setMode] = useState(() => saved?.mode || "both");
  const [queue, setQueue] = useState(() => saved?.queue?.length ? saved.queue : makeQueue(TRUTH_DARE_CATEGORIES.map((c) => c.id), "both"));
  const [index, setIndex] = useState(() => Math.min(Math.max(0, Number(saved?.index) || 0), saved?.queue?.length || 800));
  const [revealed, setRevealed] = useState(false);
  const [skipped, setSkipped] = useState(() => Number(saved?.skipped) || 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [startFlash, setStartFlash] = useState(false);
  const cardsById = useMemo(() => new Map(TRUTH_DARE_CARDS.map((card) => [card.id, card])), []);
  const current = cardsById.get(queue[index]);
  const activeCategory = TRUTH_DARE_CATEGORIES.find((c) => c.id === current?.category);
  const available = TRUTH_DARE_CARDS.filter((c) => categories.includes(c.category) && (mode === "both" || c.type === mode)).length;
  const reset = (newCategories = categories, newMode = mode) => {
    const selected = newCategories.length ? newCategories : TRUTH_DARE_CATEGORIES.map((c) => c.id);
    setCategories(selected);
    setMode(newMode);
    setQueue(makeQueue(selected, newMode));
    setIndex(0);
    setSkipped(0);
    setRevealed(false);
  };
  const toggleCategory = (id) => {
    const selected = categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id];
    if (!selected.length) return;
    reset(selected, mode);
  };
  const selectMode = (value) => reset(categories, value);
  const advance = (skip = false) => {
    if (!current) return;
    if (!revealed) { setRevealed(true); return; }
    if (skip) setSkipped((v) => v + 1);
    setRevealed(false);
    setIndex((v) => v + 1);
  };
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ categories, mode, queue, index, skipped })); } catch {}
  }, [categories, mode, queue, index, skipped]);
  useEffect(() => {
    const show = () => setRevealed(false);
    document.addEventListener("visibilitychange", show);
    return () => document.removeEventListener("visibilitychange", show);
  }, []);
  const start = () => { setSettingsOpen(false); setStartFlash(true); setTimeout(() => setStartFlash(false), 400); };
  const all = categories.length === TRUTH_DARE_CATEGORIES.length;
  const completed = index >= queue.length;
  return (
    <section className="s pv td-root" id="preview" aria-label="Правда або дія">
      <div className="wrap">
        <div className="td-topline">
          <div>
            <span className="td-eyebrow">NICKOLASGAMES / PARTY MODE</span>
            <h2>Правда <span>або</span> дія</h2>
            <p>Вісім настроїв гри. Вісімсот приводів посміятися. Без 18+ і банальних запитань.</p>
          </div>
          <button type="button" className="td-settings-btn" onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen} aria-controls="td-settings">{settingsOpen ? "Закрити налаштування" : "Категорії та правила"} <span aria-hidden="true">{settingsOpen ? "−" : "⚙"}</span></button>
        </div>
        <div className="td-switcher" role="group" aria-label={t.gameLabel}>
          {["whoami", "crocodile", "alias", "truth"].map((key) => <button type="button" key={key} className="chip" aria-pressed={key === "truth"} onClick={() => onGame(key)}>{games[key].n}</button>)}
        </div>
        <div id="td-settings" className={"td-settings" + (settingsOpen ? " is-open" : "")}>
          <div className="td-section-head"><h3>Обери категорії</h3><span>{categories.length} з 8 активні</span></div>
          <button type="button" className="td-all" aria-pressed={all} onClick={() => reset(TRUTH_DARE_CATEGORIES.map((c) => c.id), mode)}>Усі категорії <span>{all ? "✓" : "+"}</span></button>
          <div className="td-categories">
            {TRUTH_DARE_CATEGORIES.map((category, i) => <button type="button" key={category.id}
              className="td-category" aria-pressed={categories.includes(category.id)}
              onClick={() => toggleCategory(category.id)}>
              <span className="td-category-index">{String(i + 1).padStart(2, "0")}</span>
              <strong>{category.name}</strong><small>{category.description}</small>
              <span className="td-category-count">100 карток</span><span className="td-check" aria-hidden="true">{categories.includes(category.id) ? "✓" : "+"}</span>
            </button>)}
          </div>
          <div className="td-section-head td-mode-title"><h3>Що граємо?</h3><span>Можна змінювати в будь-який момент</span></div>
          <div className="td-modes" role="group" aria-label="Тип карток">
            {[["both","Правда + дія"],["truth","Лише правда"],["dare","Лише дія"]].map(([value,label]) =>
              <button type="button" key={value} aria-pressed={mode === value} onClick={() => selectMode(value)}>{label}</button>)}
          </div>
          <p className="td-safe">Будь-яку картку можна пропустити. Не змушуйте нікого відповідати або виконувати завдання.</p>
          <button type="button" className="btn pri td-apply" onClick={start}>Готово · {available} карток</button>
        </div>
        <div className="td-play-area">
          <div className="td-play-header">
            <div className="td-stat"><b>{Math.min(index + 1, queue.length)}</b><span> / {queue.length} карток</span></div>
            <div className="td-progress"><span style={{width: (queue.length ? Math.min(index, queue.length) / queue.length * 100 : 0) + "%"}} /></div>
            <button type="button" className="td-inline-settings" onClick={() => setSettingsOpen((v) => !v)}>{categories.length} категорій · {mode === "both" ? "Мікс" : mode === "truth" ? "Правда" : "Дія"} ↗</button>
          </div>
          <div className={"td-card" + (revealed ? " is-revealed" : "") + (startFlash ? " is-ready" : "")} aria-live="polite">
            <div className="td-card-top"><span className="td-kind">{completed ? "Кінець колоди" : current?.type === "truth" ? "ПРАВДА" : "ДІЯ"}</span><span className="td-card-no">№ {String(index + 1).padStart(3, "0")}</span></div>
            <div className="td-card-center">
              {completed ? <><div className="td-watermark">✓</div><h3>Ти пройшов усі картки!</h3><p>Можна зіграти ще раз — у новому порядку.</p></>
              : revealed ? <><div className="td-card-category">{activeCategory?.name}</div><h3>{current.text}</h3></>
              : <><div className="td-watermark">?</div><h3>Готовий до несподіванки?</h3><p>Відкрий картку та передай хід наступному гравцеві.</p></>}
            </div>
            <div className="td-card-bottom"><span>{activeCategory?.name || "NickolasGames"}</span><span>HOLMES EDITION</span></div>
          </div>
          <div className="td-actions">
            {completed ? <button type="button" className="btn pri td-primary" onClick={() => reset()}>Перемішати та грати знову</button>
            : <><button type="button" className="btn pri td-primary" onClick={() => revealed ? advance(false) : setRevealed(true)}>{revealed ? "Наступна картка →" : "Відкрити картку →"}</button>
            <button type="button" className="btn td-secondary" onClick={() => { setRevealed(true); advance(true); }} aria-label="Пропустити поточну картку">Пропустити</button></>}
          </div>
          <div className="td-footnote"><span>Без повторів до завершення колоди</span><span>Пропущено: {skipped}</span></div>
          {lang !== "uk" && <p className="td-language-note">Цей набір із 800 карток наразі доступний українською.</p>}
        </div>
      </div>
    </section>
  );
}
