import holmesLogo from './assets/holmes-logo.webp';
import { createHolmesTimerSound, HOLMES_TIME_UP } from './utils/holmesTimerSound.js';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HolmesFloor } from "./components/HolmesFloor";
import "./nickolasgames.css";
import { HolmesIntro } from "./components/HolmesIntro";
import { readValue, writeValue, readProgress } from "./utils/progress";
import { AppStatus, PROGRESS_COPY } from "./components/AppStatus";
import { CharadesGame } from "./components/CharadesGame";
import { WhoAmIGame } from "./components/WhoAmIGame";
import { COPY, PLAYER_SETUP } from "./locales";
import { DIFFICULTIES, wordsByDifficulty } from "./utils/difficulty";
import { ROUND_MESSAGES } from "./locales/round";
import { uniqueWords } from "./utils/words";

const LANGS = [
  { code: "uk", short: "UA", label: "Українська" },
  { code: "en", short: "EN", label: "English" },
  { code: "sv", short: "SV", label: "Svenska" },
  { code: "de", short: "DE", label: "Deutsch" },
  { code: "es", short: "ES", label: "Español" },
];

const PLAYABLE = ["whoami", "crocodile", "alias", "truth"];
const ROUND_OPTIONS = [30, 60, 90, 120];
const ALL_CATEGORIES = "__all__";
const RM = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const go = (id) => document.querySelector(id)?.scrollIntoView({ behavior: RM ? "auto" : "smooth" });
const pickRandom = () => PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];

function Hero({ t }) {
  return (
    <header className="hero holmes-home">
      <div className="wrap">
        <div className="hero-copy"><h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
        <div className="cta-row">
          <button className="btn pri" onClick={() => go("#preview")}>{t.start}</button>
          <button className="btn" onClick={() => go("#games")}>{t.explore}</button>
        </div></div>
        <HolmesFloor games={t.games} />
      </div>
    </header>
  );
}

function GamesGrid({ games, t, onPlay }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="s" id="games">
      <div className="wrap">
        <div className="head"><h2>{t.gamesTitle}</h2><p>{t.gamesText}</p></div>
        <div ref={ref} className={"grid reveal-games" + (seen ? " in" : "")}>
          {Object.entries(games).map(([k, g]) => (
            <article className="gc" key={k}>
              <h3>{g.n}</h3><p>{g.d}</p>
              <div className="meta"><span>{g.p}</span><span>{g.t}</span></div>
              <button className="btn sm" onClick={() => onPlay(k)} aria-label={`${t.play} ${g.n}`}>{t.play}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const SCRAMBLE = "▓▒░#@$%&*+?";
function CardStackPreview({ game, games, t, lang, onGame }) {
  const storageKey = `nickolasgames-progress-v1-${lang}-${game}`;
  const [saved] = useState(() => readProgress(storageKey));
  const [storageOk, setStorageOk] = useState(true);
  const progressCopy = PROGRESS_COPY[lang] || PROGRESS_COPY.en;
  const roundCopy = ROUND_MESSAGES[lang] || ROUND_MESSAGES.en;
  const cats = useMemo(() => Object.keys(games[game].c), [game, games]);
  const [cat, setCat] = useState(() => saved?.cat ?? ALL_CATEGORIES);
  const [difficulty, setDifficulty] = useState(() => saved?.difficulty ?? "medium");
  const [queue, setQueue] = useState(() => saved?.queue ?? []);
  const [idx, setIdx] = useState(() => Math.min(saved?.idx ?? 0, saved?.queue?.length ?? 0));
  const [shown, setShown] = useState(false);
  const [text, setText] = useState("");
  const [enc, setEnc] = useState(false);
  const [exit, setExit] = useState(null);
  const [score, setScore] = useState(() => saved?.score ?? { got: 0, skipped: 0 });
  const [roundSeconds, setRoundSeconds] = useState(() => saved?.roundSeconds ?? 60);
  const [left, setLeft] = useState(() => saved?.left ?? 60);
  const [running, setRunning] = useState(false);
  const sound=useRef(null);if(!sound.current)sound.current=createHolmesTimerSound();
  const timerArmed=useRef(false);const previousLeft=useRef(left);
  useEffect(()=>()=>sound.current.dispose(),[]);
  useEffect(()=>{if(timerArmed.current&&previousLeft.current>0&&left===0){timerArmed.current=false;sound.current.announce(HOLMES_TIME_UP,lang);}previousLeft.current=left;},[left,lang]);
  const [playerNames, setPlayerNames] = useState(() => saved?.playerNames ?? "");
  const [customWords, setCustomWords] = useState(() => saved?.customWords ?? "");
  const [customOnly, setCustomOnly] = useState(() => saved?.customOnly ?? false);
  const [assignments, setAssignments] = useState(() => saved?.assignments ?? []);
  const [visibleCards, setVisibleCards] = useState({});
  const [pendingWords, setPendingWords] = useState({});
  const [dealWarning, setDealWarning] = useState("");
  const scr = useRef(0);
  const transition = useRef(0);
  const playerCopy = PLAYER_SETUP[lang] || PLAYER_SETUP.en;

  const parsedCustomWords = useMemo(() => uniqueWords(customWords.split(/[\n,]+/)), [customWords]);
  const getWordsForCategory = (category) => category === ALL_CATEGORIES
    ? cats.flatMap((name) => wordsByDifficulty(games[game].c[name] || [], difficulty))
    : wordsByDifficulty(games[game].c[category] || [], difficulty);
  const filteredWhoAmIWords = useMemo(() => Object.values(games.whoami.c).flatMap((words) => wordsByDifficulty(words, difficulty)), [games, difficulty]);
  const whoAmIWordPool = useMemo(() => customOnly ? parsedCustomWords : uniqueWords([...filteredWhoAmIWords, ...parsedCustomWords]), [customOnly, filteredWhoAmIWords, parsedCustomWords]);

  const configuration = JSON.stringify([game, lang, cat, difficulty, customWords, customOnly]);
  const previousConfiguration = useRef(saved ? configuration : null);
  const configurationChanged = previousConfiguration.current !== configuration;
  useEffect(() => {
    if (!configurationChanged) return;
    previousConfiguration.current = configuration;
    clearTimeout(transition.current); transition.current = 0;
    timerArmed.current=false;setRunning(false); setLeft(roundSeconds);
    clearInterval(scr.current);
    setQueue(shuffle(game === "whoami" ? (customOnly ? parsedCustomWords : uniqueWords([...getWordsForCategory(cat), ...parsedCustomWords])) : getWordsForCategory(cat)));
    setIdx(0); setShown(false); setExit(null); setEnc(false); setText(""); setScore({ got: 0, skipped: 0 }); setAssignments([]); setVisibleCards({}); setPendingWords({}); setDealWarning("");
  }, [game, cat, games, parsedCustomWords, customOnly, difficulty]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => { if (l <= 1) { setRunning(false); return 0; } return l - 1; }), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => () => { clearInterval(scr.current); clearTimeout(transition.current); }, []);

  useEffect(() => {
    if (configurationChanged) return;
    // Commit a pending card transition as one logical action, even during its animation.
    setStorageOk(writeValue(storageKey, { version: 1, cat, difficulty, queue,
      idx: idx + (exit ? 1 : 0), score, roundSeconds, left, playerNames, customWords, customOnly, assignments }));
  }, [storageKey, cat, difficulty, queue, idx, exit, score, roundSeconds, left, playerNames, customWords, customOnly, assignments]);
  useEffect(() => {
    const pause = () => { if (document.hidden) { setRunning(false); setVisibleCards({}); } };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  const newGame = () => {
    if (!window.confirm(progressCopy.confirm)) return;
    clearInterval(scr.current);
    clearTimeout(transition.current); transition.current = 0;
    setQueue(shuffle(queue)); setIdx(0); setScore({ got: 0, skipped: 0 });
    setAssignments([]); setVisibleCards({}); setPendingWords({});
    timerArmed.current=false;setRunning(false); setLeft(roundSeconds); setShown(false); setText(""); setExit(null); setEnc(false);
  };
  const word = queue[idx] || "";
  useEffect(() => { if (!word) setRunning(false); }, [word]);

  const reveal = () => {
    if (shown || exit || !word) return;
    setShown(true);
    if (!running && left === roundSeconds) {sound.current.unlock(lang);timerArmed.current=true;setRunning(true);}
    if (RM) { setText(word); return; }
    setEnc(true);
    let f = 0;
    const N = 22;
    scr.current = setInterval(() => {
      f++;
      const r = Math.floor((f / N) * word.length * 1.4);
      setText([...word].map((ch, i) => (ch === " " ? " " : i < r ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])).join(""));
      if (f >= N || r >= word.length) { clearInterval(scr.current); setEnc(false); setText(word); }
    }, 34);
  };

  const advance = (dir) => {
    if (exit || transition.current || !word) return;
    if (!shown && dir === "next") return reveal();
    clearInterval(scr.current);
    setExit(dir);
    setScore((s) => (dir === "skip" ? { ...s, skipped: s.skipped + 1 } : { ...s, got: s.got + 1 }));
    transition.current = setTimeout(() => { transition.current = 0; setIdx((i) => i + 1); setShown(false); setEnc(false); setExit(null); setText(""); }, RM ? 0 : 380);
  };

  const cardStyle = (i) => i === 0 && exit
    ? { transform: `translate(${exit === "skip" ? "-" : ""}130%,-20px) rotate(${exit === "skip" ? -12 : 12}deg)`, opacity: 0 }
    : { transform: `translateY(${i * 14}px) scale(${1 - i * 0.05})`, opacity: 1 - i * 0.25 };
  const changeRoundSeconds = (value) => {
    const seconds = Math.max(10, Math.min(600, Number(value) || 10));
    setRoundSeconds(seconds);
    setLeft(seconds);
    timerArmed.current=false;setRunning(false);
  };

  const toggleTimer = () => {
    if (running) {timerArmed.current=false;setRunning(false);}
    else {sound.current.unlock(lang);timerArmed.current=true;if (left === 0) setLeft(roundSeconds); setRunning(true);}
  };

  const allWhoAmIWords = whoAmIWordPool;
  const parsedNames = playerNames.split(/[\n,]+/).map((name) => name.trim()).filter(Boolean);
  const dealWhoAmICards = () => {
    if (!parsedNames.length) {
      setAssignments([]);
      setVisibleCards({});
      setDealWarning("");
      return;
    }
    const categories = games.whoami.c;
    const preferredWords = customOnly ? parsedCustomWords : [...getWordsForCategory(cat), ...parsedCustomWords];
    const fallbackWords = customOnly || cat === ALL_CATEGORIES ? [] : Object.entries(categories)
      .filter(([category]) => category !== cat)
      .flatMap(([, words]) => wordsByDifficulty(words, difficulty));
    const availableWords = uniqueWords([...shuffle(preferredWords), ...shuffle(fallbackWords)]);
    const dealt = parsedNames.slice(0, availableWords.length).map((name, i) => ({
      id: `${name}-${i}-${Date.now()}`,
      name,
      word: availableWords[i],
      usedWords: [availableWords[i]],
    }));
    setAssignments(dealt);
    setVisibleCards({});
    setPendingWords({});
    setDealWarning(parsedNames.length > availableWords.length ? playerCopy.notEnough : "");
  };

  const toggleAssignedCard = (id) => {
    setVisibleCards((current) => ({ ...current, [id]: !current[id] }));
  };

  const finishAssignedCard = (id, outcome) => {
    const target = assignments.find((item) => item.id === id);
    if (!target || !target.word) return;
    const activeWords = new Set(assignments.filter((item) => item.id !== id).map((item) => item.word.toLocaleLowerCase()));
    const usedByPlayer = new Set((target.usedWords || [target.word]).map((word) => word.toLocaleLowerCase()));
    const nextWord = shuffle(allWhoAmIWords).find((candidate) => !usedByPlayer.has(candidate.toLocaleLowerCase()) && !activeWords.has(candidate.toLocaleLowerCase()));
    if (!nextWord) {
      setAssignments((current) => current.map((item) => item.id === id ? { ...item, word: "", lastWord: item.word, lastOutcome: outcome, usedWords: [...new Set([...(item.usedWords || []), item.word])] } : item));
      setVisibleCards((current) => ({ ...current, [id]: false }));
      setDealWarning(playerCopy.noNewWord);
      return;
    }
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, word: nextWord, lastWord: item.word, lastOutcome: outcome, usedWords: [...new Set([...(item.usedWords || []), item.word, nextWord])] } : item));
    setVisibleCards((current) => ({ ...current, [id]: false }));
    setPendingWords((current) => ({ ...current, [id]: "" }));
    setDealWarning("");
  };

  const markAssignedGuessed = (id) => finishAssignedCard(id, "guessed");
  const markAssignedGivenUp = (id) => finishAssignedCard(id, "gaveUp");

  const updatePendingWord = (id, value) => {
    setPendingWords((current) => ({ ...current, [id]: value }));
  };

  const assignManualWord = (id) => {
    const word = (pendingWords[id] || "").trim();
    const target = assignments.find((item) => item.id === id);
    if (!word || !target) return;
    const activeWords = new Set(assignments.filter((item) => item.id !== id).map((item) => item.word.toLocaleLowerCase()));
    const usedByPlayer = new Set((target.usedWords || [target.word]).map((item) => item.toLocaleLowerCase()));
    const normalized = word.toLocaleLowerCase();
    if (activeWords.has(normalized) || usedByPlayer.has(normalized)) {
      setDealWarning(playerCopy.manualDuplicate);
      return;
    }
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, word, lastWord: item.word || item.lastWord, lastOutcome: "manual", usedWords: [...new Set([...(item.usedWords || []), item.word, word])] } : item));
    setVisibleCards((current) => ({ ...current, [id]: false }));
    setPendingWords((current) => ({ ...current, [id]: "" }));
    setDealWarning("");
  };

  return (
    <section className="s pv" id="preview">
      <div className="wrap pvg">
        <div>
          <div className="head" style={{ margin: 0 }}><h2>{t.previewTitle}</h2><p>{t.previewText}</p></div>
          <div className="tabs" role="group" aria-label={t.gameLabel}>
            {PLAYABLE.map((k) => <button key={k} className="chip" aria-pressed={k === game} onClick={() => onGame(k)}>{games[k].n}</button>)}
            <button className="chip" aria-pressed="false" onClick={() => onGame("random")}>{t.random}</button>
          </div>
          <div className="cats" role="group" aria-label={t.categoryLabel}>
            <button className="chip" aria-pressed={cat === ALL_CATEGORIES} onClick={() => setCat(ALL_CATEGORIES)}>{t.allCategories}</button>
            {cats.map((c) => <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="difficulty" role="group" aria-label={t.difficultyLabel}>
            <span>{t.difficultyLabel}</span>
            {DIFFICULTIES.map((level) => <button key={level} className="chip" aria-pressed={level === difficulty} onClick={() => setDifficulty(level)}>{t.difficulty[level]}</button>)}
          </div>
          <div className="players-note" role="status">{storageOk ? (saved ? progressCopy.restored : progressCopy.saved) : progressCopy.failed}</div>
          <button className="btn sm" disabled={!!exit} onClick={newGame}>{progressCopy.newGame}</button>

          <div className="timer">
            <b>{left}</b>
            <div className="tbar"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, left / roundSeconds))})` }} /></div>
            <button className="btn sm" onClick={toggleTimer}>{running ? roundCopy.pause : left !== roundSeconds ? progressCopy.resume : t.startTimer}</button>
            <button className="btn sm" onClick={() => { timerArmed.current=false;setRunning(false); setLeft(roundSeconds); }}>{t.reset}</button>
          </div>
          <div className="timer-options" aria-label={t.timerDuration}>
            <span>{t.timerDuration}</span>
            {ROUND_OPTIONS.map((seconds) => (
              <button key={seconds} className="chip" aria-pressed={seconds === roundSeconds} onClick={() => changeRoundSeconds(seconds)}>{seconds}{t.sec}</button>
            ))}
            <input type="number" min="10" max="600" step="5" value={roundSeconds} aria-label={t.timerDuration} onChange={(e) => changeRoundSeconds(e.target.value)} />
          </div>
          {game === "whoami" && (
            <div className="players-panel">
              <h3>{playerCopy.title}</h3>
              <p>{playerCopy.text}</p>
              <label className="players-label" htmlFor="player-names">{playerCopy.label}</label>
              <textarea id="player-names" value={playerNames} placeholder={playerCopy.placeholder} onChange={(e) => setPlayerNames(e.target.value)} />
              <label className="players-label" htmlFor="custom-words">{playerCopy.customLabel}</label>
              <textarea id="custom-words" className="custom-words" value={customWords} placeholder={playerCopy.customPlaceholder} onChange={(e) => setCustomWords(e.target.value)} />
              <div className="players-note">{playerCopy.customHint}</div>
              <label className="only-custom">
                <input type="checkbox" checked={customOnly} onChange={(e) => setCustomOnly(e.target.checked)} />
                <span>{playerCopy.onlyCustom}</span>
              </label>
              <div className="players-actions">
                <button className="btn pri sm" onClick={dealWhoAmICards}>{playerCopy.assign}</button>
                <button className="btn sm" onClick={() => setVisibleCards({})}>{playerCopy.hideAll}</button>
              </div>
              {!parsedNames.length && <div className="players-note">{playerCopy.empty}</div>}
              {dealWarning && <div className="players-note warn">{dealWarning}</div>}
            </div>
          )}
        </div>
        <div>
          <div className="deck" aria-live="polite">
            {!word && (
              <div className="card empty-card">
                <small>{games[game].n} · {cat === ALL_CATEGORIES ? t.allCategories : cat}</small>
                <div className="w hid">{queue.length ? roundCopy.exhausted : t.noWords}</div>
              </div>
            )}
            {word && [2, 1, 0].map((i) => {
              const k = idx + i;
              return (
                <div key={k} className="card" style={cardStyle(i)} onClick={i === 0 ? reveal : undefined}>
                  <small>{games[game].n} · {cat === ALL_CATEGORIES ? t.allCategories : cat}</small>
                  {i === 0 && shown ? <div className={"w" + (enc ? " enc" : "")}>{text}</div> : <div className="w hid">{t.tap}</div>}
                </div>
              );
            })}
          </div>
          <div className="ctrl">
            <button className="btn pri" onClick={reveal} disabled={!word}>{t.reveal}</button>
            <button className="btn" onClick={() => advance("next")} disabled={!word}>{t.next}</button>
            <button className="btn" onClick={() => advance("skip")} disabled={!word}>{t.skip}</button>
          </div>
          <div className="score">{t.guessed} {score.got} · {t.skipped} {score.skipped}</div>
          {game === "whoami" && assignments.length > 0 && (
            <div className="assigned-grid">
              {assignments.map((item) => {
                const isVisible = Boolean(visibleCards[item.id]);
                return (
                  <article className="assigned-card" key={item.id}>
                    <small>{playerCopy.forPlayer}</small>
                    <h3>{item.name}</h3>
                    <div role={item.word ? undefined : "status"} className={"assigned-word" + (isVisible ? " visible" : "")}>{item.word ? (isVisible ? item.word : playerCopy.hidden) : playerCopy.noNewWord}</div>
                    {item.lastWord && <div className="assigned-solved">{item.lastOutcome === "gaveUp" ? playerCopy.gaveUpWord : playerCopy.guessedWord}: <b>{item.lastWord}</b></div>}
                    <div className="assigned-actions">
                      <button className="btn sm" disabled={!item.word} onClick={() => toggleAssignedCard(item.id)}>{isVisible ? playerCopy.hide : playerCopy.show}</button>
                      <button className="btn pri sm" disabled={!item.word} onClick={() => markAssignedGuessed(item.id)}>{playerCopy.guessed}</button>
                      <button className="btn sm" disabled={!item.word} onClick={() => markAssignedGivenUp(item.id)}>{playerCopy.giveUp}</button>
                    </div>
                    <div className="manual-word">
                      <label htmlFor={`manual-${item.id}`}>{playerCopy.manualLabel}</label>
                      <div>
                        <input id={`manual-${item.id}`} value={pendingWords[item.id] || ""} placeholder={playerCopy.manualPlaceholder} onChange={(e) => updatePendingWord(item.id, e.target.value)} />
                        <button className="btn sm" onClick={() => assignManualWord(item.id)}>{playerCopy.manualAssign}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="head"><h2>{t.howTitle}</h2></div>
        <div className="steps">
          {t.steps.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ t }) {
  const items = RM ? t.testimonials : [...t.testimonials, ...t.testimonials];
  return (
    <section className="s" style={{ paddingTop: 20 }}>
      <div className="wrap"><div className="head"><h2>{t.testimonialsTitle}</h2></div></div>
      <div className="mq"><div className="mt">
        {items.map(([name, country, quote, game], i) => (
          <figure className="tc" style={{ margin: 0 }} key={`${name}-${i}`}>
            <q>{quote}</q>
            <div><b>{name}, {country}</b>{t.played} {game}</div>
          </figure>
        ))}
      </div></div>
    </section>
  );
}

function FinalCta({ t }) {
  return (
    <section className="fin">
      <div className="wrap">
        <h2>{t.finalTitle}</h2>
        <p>{t.finalText}</p>
        <button className="btn pri" onClick={() => go("#preview")}>{t.start}</button>
      </div>
    </section>
  );
}

function LanguageSwitcher({ lang, setLang, label }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {LANGS.map((item) => (
        <button key={item.code} className="lang-btn" aria-pressed={lang === item.code} title={item.label} onClick={() => setLang(item.code)}>
          {item.short}
        </button>
      ))}
    </div>
  );
}

export default function NickolasGames() {
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const [lang, setLang] = useState(() => { try { const l = localStorage.getItem("nickolasgames-lang"); return COPY[l] ? l : "en"; } catch { return "en"; } });
  const [game, setGame] = useState(() => { const g = readValue("nickolasgames-active-game"); return PLAYABLE.includes(g) ? g : "crocodile"; });
  useEffect(() => { writeValue("nickolasgames-active-game", game); }, [game]);
  const t = COPY[lang] || COPY.en;
  const choose = (k, scroll) => {
    setGame(k === "random" ? pickRandom() : k);
    if (scroll) go("#preview");
  };

  useEffect(() => {
    try { localStorage.setItem("nickolasgames-lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      {showIntro && <HolmesIntro lang={lang} onComplete={finishIntro} />}
      <div inert={showIntro ? true : undefined}>
      <nav><a className="site-logo" href="#" aria-label="NickolasGames"><img src={holmesLogo} alt="NickolasGames" width="1024" height="341" /></a><LanguageSwitcher lang={lang} setLang={setLang} label={t.language} /></nav>
      <AppStatus lang={lang} />
      <Hero t={t} />
      <GamesGrid games={t.games} t={t} onPlay={(k) => choose(k, true)} />
      {game === "crocodile"
        ? <CharadesGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} onGame={(k) => choose(k, false)} />
        : game === "whoami" ? <WhoAmIGame key={`${lang}-${game}`} games={t.games} t={t} lang={lang} onGame={(k) => choose(k, false)} />
        : <CardStackPreview key={`${lang}-${game}`} game={game} games={t.games} t={t} lang={lang} onGame={(k) => choose(k, false)} />}
      <HowItWorks t={t} />
      <Testimonials t={t} />
      <FinalCta t={t} />
      <footer>{t.footer}<button className="btn sm" onClick={() => setShowIntro(true)}>{({uk:"Холмс · 2D-вступ",en:"Holmes · 2D intro",sv:"Holmes · 2D-intro",de:"Holmes · 2D-Intro",es:"Holmes · Intro 2D"})[lang]}</button></footer>
      </div>
    </>
  );
}
