import { useEffect, useMemo, useState } from "react";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "../data/truthOrDare.uk.js";
import "./TruthOrDareGame.css";

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
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [skipped, setSkipped] = useState(() => Number(saved?.skipped) || 0);
  const [settingsOpen, setSettingsOpen] = useState(() => !saved);
  const [startFlash, setStartFlash] = useState(false);
  const cardsById = useMemo(() => new Map(TRUTH_DARE_CARDS.map((card) => [card.id, card])), []);
  const current = cardsById.get(queue[index]);
  const activeCategory = TRUTH_DARE_CATEGORIES.find((c) => c.id === current?.category);
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
    setRevealed(true);
  };
  const reset = (newCategories = categories) => {
    const selected = newCategories.length ? newCategories : TRUTH_DARE_CATEGORIES.map((c) => c.id);
    setCategories(selected);
    setQueue(makeQueue(selected));
    setIndex(0);
    setSkipped(0);
    setRevealed(false);
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
    setRevealed(false);
    setChosen(false);
    setIndex((v) => v + 1);
  };
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ categories, queue, index, skipped })); } catch {}
  }, [categories, queue, index, skipped]);
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
          <button type="button" className="td-all" aria-pressed={all} onClick={() => reset(TRUTH_DARE_CATEGORIES.map((c) => c.id))}>Усі категорії <span>{all ? "✓" : "+"}</span></button>
          <div className="td-categories">
            {TRUTH_DARE_CATEGORIES.map((category, i) => <button type="button" key={category.id}
              className="td-category" aria-pressed={categories.includes(category.id)}
              onClick={() => toggleCategory(category.id)}>
              <span className="td-category-index">{String(i + 1).padStart(2, "0")}</span>
              <strong>{category.name}</strong><small>{category.description}</small>
              <span className="td-category-count">100 карток</span><span className="td-check" aria-hidden="true">{categories.includes(category.id) ? "✓" : "+"}</span>
            </button>)}
          </div>
          <p className="td-safe">Будь-яку картку можна пропустити. Не змушуйте нікого відповідати або виконувати завдання.</p>
          <button type="button" className="btn pri td-apply" onClick={start}>Готово · {available} карток</button>
        </div>
        <div className="td-play-area">
          <div className="td-play-header">
            <div className="td-stat"><b>{Math.min(index + 1, queue.length)}</b><span> / {queue.length} карток</span></div>
            <div className="td-progress"><span style={{width: (queue.length ? Math.min(index, queue.length) / queue.length * 100 : 0) + "%"}} /></div>
            <button type="button" className="td-inline-settings" onClick={() => setSettingsOpen((v) => !v)}>{categories.length} категорій · Налаштування ↗</button>
          </div>
          {!completed && !chosen && <div className="td-choice" role="group" aria-label="Обери правду або дію">
            <h3>Твій хід! Що обираєш?</h3>
            <div className="td-choice-buttons">
              <button type="button" className="td-choice-button td-choice-truth" onClick={() => chooseType("truth")} disabled={!remainingTypes.has("truth")}>
                <span className="td-choice-icon" aria-hidden="true">?</span><strong>Правда</strong><small>Відповідай на запитання</small>
              </button>
              <button type="button" className="td-choice-button td-choice-dare" onClick={() => chooseType("dare")} disabled={!remainingTypes.has("dare")}>
                <span className="td-choice-icon" aria-hidden="true">!</span><strong>Дія</strong><small>Виконай завдання</small>
              </button>
            </div>
          </div>}
          <div className={"td-card" + (revealed ? " is-revealed" : "") + (startFlash ? " is-ready" : "")} aria-live="polite">
            <div className="td-card-top"><span className="td-kind">{completed ? "Кінець колоди" : !chosen ? "ОБЕРИ ТИП" : current?.type === "truth" ? "ПРАВДА" : "ДІЯ"}</span><span className="td-card-no">№ {String(index + 1).padStart(3, "0")}</span></div>
            <div className="td-card-center">
              {completed ? <><div className="td-watermark">✓</div><h3>Ти пройшов усі картки!</h3><p>Можна зіграти ще раз — у новому порядку.</p></>
              : chosen && revealed ? <><div className="td-card-category">{activeCategory?.name}</div><h3>{current.text}</h3>{current.challenge && <div className="td-card-challenge"><strong>Додатковий виклик</strong><p>{current.challenge}</p></div>}</>
              : <><div className="td-watermark">?</div><h3>Правда чи дія?</h3><p>Обери один із двох варіантів вище — і отримаєш картку.</p></>}
            </div>
            <div className="td-card-bottom"><span>{chosen ? activeCategory?.name : "NickolasGames"}</span><span>HOLMES EDITION</span></div>
          </div>
          <div className="td-actions">
            {completed ? <button type="button" className="btn pri td-primary" onClick={() => reset()}>Перемішати та грати знову</button>
            : chosen ? <><button type="button" className="btn pri td-primary" onClick={() => advance(false)}>Наступний гравець →</button>
            <button type="button" className="btn td-secondary" onClick={() => advance(true)} aria-label="Пропустити поточну картку">Пропустити</button></> : <p className="td-choice-help">Натисни «Правда» або «Дія», щоб отримати картку.</p>}
          </div>
          <div className="td-footnote"><span>Без повторів до завершення колоди</span><span>Пропущено: {skipped}</span></div>
          {lang !== "uk" && <p className="td-language-note">Цей набір із 800 карток наразі доступний українською.</p>}
        </div>
      </div>
    </section>
  );
}
