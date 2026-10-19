import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Dice5, Pencil, Plus, RotateCcw, Trophy, Trash2, UserPlus } from 'lucide-react';
import { ALIAS_COPY } from '../locales/alias.js';
import { ALIAS_WORDS } from '../data/alias.js';
import { DIFFICULTIES } from '../utils/difficulty.js';
import { readValue, writeValue } from '../utils/progress.js';
import { createHolmesTimerSound, HOLMES_TIME_UP } from '../utils/holmesTimerSound.js';
import { ALIAS_ALL, ALIAS_FORMATS, aliasActor, aliasCategories, aliasPool, aliasReducer, aliasSetupErrors, aliasWord, newAliasState, refreshAliasDeck, restoreAliasState, shuffleAlias, validAliasTarget } from '../utils/alias.js';
import './AliasGame.css';

const dicePips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

function AliasDie({ value }) {
  return <span className="alias-die" data-value={value}>{dicePips[value].map(position => <i className="alias-die-pip" key={position} style={{ gridRow: Math.floor(position / 3) + 1, gridColumn: position % 3 + 1 }} />)}</span>;
}

export function AliasGame({ games, t, lang, onGame, startRequest = 0 }) {
  const copy = ALIAS_COPY[lang] || ALIAS_COPY.en;
  const key = `nickolasgames-alias-teams-v1-${lang}`;
  const categories = useMemo(() => aliasCategories(games.alias.c, games.crocodile.c, ALIAS_WORDS[lang] || ALIAS_WORDS.en), [games, lang]);
  const [state, dispatch] = useReducer(aliasReducer, null, () => refreshAliasDeck(restoreAliasState(readValue(key)) || newAliasState(copy.teams), categories));
  const pool = useMemo(() => aliasPool(categories, state.category, state.difficulty, state.format), [categories, state.category, state.difficulty, state.format]);
  const availableCategories = useMemo(() => Object.keys(categories).filter(name => aliasPool(categories, name, 'all', state.format).length), [categories, state.format]);
  const [drafts, setDrafts] = useState({});
  const [editingTeam, setEditingTeam] = useState(null);
  const [target, setTarget] = useState(String(state.target));
  const [attempt, setAttempt] = useState(0);
  const [storageOk, setStorageOk] = useState(true);
  const [clock, setClock] = useState(Date.now());
  const [drag, setDrag] = useState(0);
  const gesture = useRef(null);
  const feedback = useRef(null);
  const readyPanel = useRef(null);
  const previousPhase = useRef(state.phase);
  const sound = useRef(null);
  const armed = useRef(null);
  if (!sound.current) sound.current = createHolmesTimerSound();
  const setup = state.phase === 'setup';
  const drawing = ['dice', 'rolling', 'diceResult'].includes(state.phase);
  const team = state.teams[state.activeIndex];
  const actor = aliasActor(state);
  const word = aliasWord(state);
  const remaining = state.deadline === null ? 60 : Math.max(0, Math.ceil((state.deadline - clock) / 1000));
  const expired = state.phase === 'acting' && remaining === 0;
  const last = state.phase === 'last' || expired;
  const playing = state.phase === 'acting' || state.phase === 'last';
  const errors = aliasSetupErrors({ ...state, target: Number(target) }, pool);
  const result = state.result;
  const lastAnswer = result?.answers?.find(entry => entry.last);
  const roundCorrect = result ? result.correct - Number(Boolean(result.lastTeamId && result.lastTeamId === result.teamId)) : 0;
  const roundSkipped = result ? result.skipped - Number(Boolean(result.sharedPenalty)) : 0;
  if (Object.values(drafts).some(value => value.trim())) errors.push('pending');

  useEffect(() => { setStorageOk(writeValue(key, state)); }, [key, state]);
  useEffect(() => {
    if (state.phase === 'ready' && ['summary', 'diceResult'].includes(previousPhase.current)) readyPanel.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    previousPhase.current = state.phase;
  }, [state.phase]);
  useEffect(() => () => sound.current.dispose(), []);
  useEffect(() => {
    if (!['acting', 'rolling'].includes(state.phase)) return;
    const tick = () => {
      const now = Date.now(); setClock(now);
      dispatch({ type: state.phase === 'rolling' ? 'rolled' : 'expire', now });
    };
    tick();
    const timer = setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [state.phase, state.deadline, state.rollUntil]);
  useEffect(() => {
    if (state.phase === 'last' && armed.current !== null) {
      armed.current = null; sound.current.announce(HOLMES_TIME_UP, lang);
    }
    setDrag(0); gesture.current = null;
  }, [state.phase, state.index, lang]);
  useEffect(() => { if (startRequest > 0 && setup) setAttempt(value => value + 1); }, [startRequest, setup]);
  useEffect(() => { if (setup && attempt && errors.length) feedback.current?.focus({ preventScroll: true }); }, [attempt, setup]);

  const settings = value => dispatch({ type: 'settings', value });
  const updateTeam = (id, update) => settings({ teams: state.teams.map(item => item.id === id ? { ...item, ...update } : item) });
  const addPlayer = (event, id) => {
    event.preventDefault();
    const name = (drafts[id] || '').trim();
    const selected = state.teams.find(item => item.id === id);
    if (!name || !setup) return;
    updateTeam(id, { players: [...selected.players, { id: crypto.randomUUID(), name }] });
    setDrafts(value => ({ ...value, [id]: '' }));
  };
  const start = () => {
    setAttempt(value => value + 1);
    if (errors.length) return;
    settings({ target: Number(target), teams: state.teams.map(item => ({ ...item, name: item.name.trim() })) });
    dispatch({ type: 'start', deck: shuffleAlias(pool) });
  };
  const roll = () => dispatch({ type: 'roll', now: Date.now(), rolls: state.contenders.map(id => ({ id, values: [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)] })) });
  const begin = () => {
    const now = Date.now(); setClock(now); sound.current.unlock(lang); armed.current = now + 60_000;
    dispatch({ type: 'begin', now });
  };
  const answer = (outcome, index = state.index) => dispatch({ type: 'answer', outcome, index, now: Date.now() });
  const reset = () => {
    if (!window.confirm(copy.confirm)) return;
    armed.current = null; setAttempt(0); setDrafts({}); dispatch({ type: 'new' });
  };
  const stopGesture = event => {
    const current = gesture.current;
    gesture.current = null; setDrag(0);
    if (!current || event.pointerId !== current.pointerId || last) return;
    const x = event.clientX - current.x, y = event.clientY - current.y;
    if (Math.abs(x) >= 70 && Math.abs(x) > Math.abs(y) * 1.3) answer(x > 0 ? 'correct' : 'skip', current.index);
  };

  return <section className="s pv alias-game" id="preview">
    <div className="wrap">
      <div className="head"><h2>{copy.title}</h2><details className="alias-rules"><summary>{copy.rules}</summary><p>{copy.rulesText}</p></details></div>
      <div className="tabs" role="group" aria-label={t.gameLabel}>
        {['whoami', 'crocodile', 'alias', 'truth'].map(game => <button key={game} className="chip" aria-pressed={game === 'alias'} onClick={() => onGame(game)}>{games[game].n}</button>)}
        <button className="chip" onClick={() => onGame('random')}>{t.random}</button>
      </div>
      {!storageOk && <p className="alias-warning" role="status">{copy.storage}</p>}
      <div className={'alias-layout' + (setup || drawing ? ' is-setup' : '')}>
        <div>
          {setup && <>
            <div className="alias-team-editors">
              {state.teams.map((item, index) => <article className="alias-team-editor" key={item.id}>
                <div className="alias-editor-heading">
                  {editingTeam === item.id ? <input autoFocus id={'alias-team-' + item.id} aria-label={copy.teamName + ' ' + (index + 1)} value={item.name} maxLength={80} onChange={event => updateTeam(item.id, { name: event.target.value })} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); setEditingTeam(null); event.currentTarget.nextElementSibling?.focus(); } }} /> : <h3>{item.name.trim() || copy.teamName}</h3>}
                  <button type="button" className="alias-icon" title={editingTeam === item.id ? copy.saveTeam : copy.editTeam} aria-label={(editingTeam === item.id ? copy.saveTeam : copy.editTeam) + ': ' + item.name} onClick={() => setEditingTeam(current => current === item.id ? null : item.id)}>{editingTeam === item.id ? <Check size={18} /> : <Pencil size={18} />}</button>
                  <button type="button" className="alias-icon" disabled={state.teams.length <= 2} title={copy.removeTeam} aria-label={copy.removeTeam + ': ' + item.name} onClick={() => { settings({ teams: state.teams.filter(team => team.id !== item.id) }); setDrafts(value => ({ ...value, [item.id]: '' })); }}><Trash2 size={18} /></button>
                </div>
                <ul className="alias-player-list">{item.players.map(player => <li key={player.id}><span>{player.name}</span><button type="button" className="alias-icon" title={copy.removePlayer} aria-label={copy.removePlayer + ': ' + player.name} onClick={() => updateTeam(item.id, { players: item.players.filter(p => p.id !== player.id) })}><Trash2 size={16} /></button></li>)}</ul>
                <form onSubmit={event => addPlayer(event, item.id)} className="alias-player-form">
                  <label htmlFor={'alias-player-' + item.id}>{copy.player}</label>
                  <div><input id={'alias-player-' + item.id} value={drafts[item.id] || ''} maxLength={80} autoComplete="off" onChange={event => setDrafts(value => ({ ...value, [item.id]: event.target.value }))} /><button className="alias-icon" disabled={!(drafts[item.id] || '').trim()} title={copy.addPlayer} aria-label={copy.addPlayer + ': ' + item.name}><UserPlus size={20} /></button></div>
                </form>
              </article>)}
            </div>
            <button className="btn alias-command" onClick={() => settings({ teams: [...state.teams, { id: crypto.randomUUID(), name: copy.team + ' ' + (state.teams.length + 1), players: [], points: 0, turns: 0 }] })}><Plus size={18} />{copy.addTeam}</button>
            <div className="alias-settings">
              <fieldset><legend>{copy.formatLabel}</legend><div className="alias-levels alias-formats">{ALIAS_FORMATS.map(format => <button key={format} type="button" className={'chip alias-format-' + format} aria-pressed={state.format === format} onClick={() => settings({ format, category: ALIAS_ALL })}>{copy.formats[format]}</button>)}</div></fieldset>
              <label htmlFor="alias-category">{t.categoryLabel}<select id="alias-category" value={state.category} onChange={event => settings({ category: event.target.value })}><option value={ALIAS_ALL}>{t.allCategories}</option>{availableCategories.map(name => <option key={name}>{name}</option>)}</select></label>
              <fieldset><legend>{t.difficultyLabel}</legend><div className="alias-levels">{['all', ...DIFFICULTIES].map(level => <button key={level} type="button" className={'chip alias-level-' + level} aria-pressed={state.difficulty === level} onClick={() => settings({ difficulty: level })}>{level === 'all' ? copy.allLevels : t.difficulty[level]}</button>)}</div></fieldset>
              <label htmlFor="alias-target">{copy.target}<input id="alias-target" type="number" inputMode="numeric" min="1" step="1" value={target} onChange={event => { setTarget(event.target.value); if (validAliasTarget(Number(event.target.value))) settings({ target: Number(event.target.value) }); }} /></label>
            </div>
            {attempt > 0 && errors.length > 0 && <div ref={feedback} className="setup-validation" role="alert" tabIndex={-1}><ul>{errors.map(error => <li key={error}>{copy[error]}</li>)}</ul></div>}
            <button className="btn pri alias-main-action" onClick={start}>{copy.start}</button>
          </>}
          {drawing && <div className="alias-dice-stage">
            <header className="alias-dice-heading"><h3>{state.phase === 'diceResult' ? copy.diceResults : copy.diceTitle}</h3><p>{copy.diceRule}</p></header>
            {state.phase === 'dice' && state.dice.length > 0 && <p className="alias-dice-tie" role="status">{copy.tie}</p>}
            <div className="alias-dice-teams">{state.teams.map((item, index) => {
              const previous = state.dice.find(result => result.id === item.id);
              const participating = state.phase === 'rolling' ? state.contenders.includes(item.id) : (state.lastRollTeamIds || state.dice.map(roll => roll.id)).includes(item.id);
              const rolling = state.phase === 'rolling' && participating && clock < state.rollUntil - 300;
              const settled = state.phase === 'rolling' && participating ? state.pending.find(roll => roll.id === item.id) : previous;
              const values = rolling ? [Math.floor(clock / 90 + index) % 6 + 1, Math.floor(clock / 130 + index) % 6 + 1] : settled?.values || [1, 1];
              const winner = state.phase === 'diceResult' && index === state.activeIndex;
              return <div className={'alias-dice-team' + (rolling ? ' is-rolling' : '') + (winner ? ' is-winner' : '')} key={item.id} role="group" aria-label={item.name}>
                <div className="alias-dice-team-heading"><h4>{item.name}</h4>{winner && <Check size={22} aria-hidden="true" />}</div>
                <div className="alias-dice-pair" aria-hidden="true">{values.map((value, die) => <AliasDie key={die} value={rolling || settled ? value : 0} />)}</div>
                <div className="alias-dice-score"><strong aria-hidden="true">{rolling ? '…' : settled ? values[0] + values[1] : '—'}</strong><output>{rolling ? copy.rolling : settled ? values[0] + ' + ' + values[1] + ' = ' + values.reduce((a, b) => a + b, 0) : '—'}</output></div>
                {previous && !participating && <small className="alias-previous-roll">{copy.previousRoll}</small>}
              </div>;
            })}</div>
            {state.phase === 'diceResult' ? <div className="alias-dice-footer">
              <div className="alias-dice-result" role="status"><Trophy size={26} aria-hidden="true" /><div><span>{copy.first}</span><strong>{team.name}</strong></div></div>
              <button className="btn pri alias-main-action" onClick={() => dispatch({ type: 'confirmDice' })}>{copy.continueDice}<ArrowRight size={20} /></button>
            </div> : <div className="alias-dice-footer alias-dice-roll-action"><button className="btn pri alias-main-action" disabled={state.phase === 'rolling'} onClick={roll}><Dice5 size={20} /> {state.phase === 'rolling' ? copy.rolling : copy.roll}</button></div>}
          </div>}
          {state.phase === 'ready' && <div ref={readyPanel} className="alias-ready" role="status">
            <p>{state.dice.length && state.teams.every(item => item.turns === 0) ? copy.first : copy.turn}</p><h3>{team.name}</h3><p>{copy.actor}: <strong>{actor?.name}</strong></p>
            <div className="alias-word-card alias-hidden-card"><strong>{copy.ready}</strong></div>
            <button className="btn pri alias-main-action" onClick={begin}>{copy.startRound}</button>
          </div>}
          {playing && <>
            <div className="alias-turn-heading"><div><strong>{team.name}</strong><p>{copy.actor}: {actor?.name}</p></div><div className={'alias-timer' + (remaining <= 10 ? ' is-low' : '')} role="timer" aria-label={remaining + ' ' + copy.seconds}>{remaining}<small>{copy.seconds}</small></div></div>
            <div className={'alias-word-card' + (last ? ' is-last' : '')} style={{ transform: `translateX(${drag}px) rotate(${drag / 20}deg)` }}
              onPointerDown={event => { if (last || event.isPrimary === false || event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, index: state.index }; }}
              onPointerMove={event => { if (gesture.current?.pointerId === event.pointerId && !last) setDrag(Math.max(-100, Math.min(100, event.clientX - gesture.current.x))); }}
              onPointerUp={stopGesture} onPointerCancel={() => { gesture.current = null; setDrag(0); }} onLostPointerCapture={() => { gesture.current = null; setDrag(0); }}>
              {last && <span>{copy.last}</span>}<strong key={state.index}>{word}</strong>
            </div>
            {last ? <div className="alias-last-awards"><p>{copy.lastRule}</p>{state.teams.map(item => <button key={item.id} className="btn" onClick={() => dispatch({ type: 'last', teamId: item.id, index: state.index })}>{item.name} +1</button>)}<button className="btn alias-skip" onClick={() => dispatch({ type: 'last', teamId: null, index: state.index })}>{copy.nobody}</button></div>
              : <div className="alias-swipe-actions"><button className="btn alias-skip" onClick={() => answer('skip')}><ArrowLeft size={20} />{copy.skip} −1</button><button className="btn alias-correct" onClick={() => answer('correct')}>{copy.correct} +1<ArrowRight size={20} /></button></div>}
            <p className="alias-round-score">{copy.roundScore}: {state.correct - state.skipped}</p>
          </>}
          {['summary', 'finished', 'exhausted'].includes(state.phase) && <div className="alias-round-summary">
            <h3 role="status">{state.phase === 'finished' ? copy.wins : state.phase === 'exhausted' ? copy.exhausted : copy.roundDone}</h3>
            {state.winners.length > 0 && <p className="alias-winners">{state.teams.filter(item => state.winners.includes(item.id)).map(item => item.name).join(' · ')}</p>}
            {result && <>
              <div className="alias-result-headline"><div><p className="alias-result-team">{state.teams.find(item => item.id === result.teamId)?.name}</p><span>{copy.roundScore}</span></div><strong className={'alias-result-points' + (result.correct - result.skipped < 0 ? ' is-negative' : '')}>{result.correct - result.skipped > 0 ? '+' : ''}{result.correct - result.skipped}</strong></div>
              <dl className="alias-result-metrics"><div><dt>{copy.timedCorrect}</dt><dd>{roundCorrect}</dd></div><div><dt>{copy.timedSkipped}</dt><dd>{roundSkipped}</dd></div></dl>
              {(lastAnswer || result.lastTeamId || result.sharedPenalty) && <section className={'alias-last-result' + (result.sharedPenalty ? ' is-missed' : '')} aria-label={copy.last}>
                <h4>{copy.last}</h4>{lastAnswer && <strong>{lastAnswer.word}</strong>}
                <p>{result.sharedPenalty ? copy.noAward : <>{copy.awarded}: <b>{state.teams.find(item => item.id === result.lastTeamId)?.name}</b> +1</>}</p>
              </section>}
            </>}
            {state.phase === 'exhausted' && <p>{copy.exhaustedRule}</p>}
            {state.phase === 'summary' && <button className="btn pri alias-main-action" onClick={() => dispatch({ type: 'next' })}>{copy.next}<ArrowRight size={20} /></button>}
            {state.result && <>
              {(state.result.answers === undefined || state.result.historyComplete === false) && <p className="alias-history-note">{copy.historyPartial}</p>}
              {state.result.answers !== undefined && <details className="alias-review-details" key={state.teams.find(item => item.id === state.result.teamId)?.turns + ':' + state.result.teamId}>
                <summary>{copy.reviewWords}</summary><div className="alias-word-review">{['correct', 'skip'].map(outcome => {
                const entries = state.result.answers.filter(entry => entry.outcome === outcome);
                return <section className={'alias-review-' + outcome} key={outcome}>
                  <h4>{outcome === 'correct' ? copy.guessedCards : copy.missedCards}</h4>
                  {entries.length ? <ul>{entries.map(entry => <li key={entry.index}><span>{entry.word}</span>{entry.last && <small>{copy.last} · {entry.teamId === null ? copy.sharedPenaltyLabel : state.teams.find(item => item.id === entry.teamId)?.name + ' +1'}</small>}</li>)}</ul> : <p>{copy.noCards}</p>}
                </section>;
              })}</div></details>}
            </>}
          </div>}
          {!setup && <button className="btn sm alias-reset" onClick={reset}><RotateCcw size={16} />{copy.newGame}</button>}
        </div>
        {!setup && !drawing && <aside className="alias-scores" aria-label={copy.points}>
          <h3>{copy.points}</h3><p>{copy.target}: {state.target}</p>
          <table><thead><tr><th scope="col">{copy.team}</th><th scope="col">{copy.points}</th></tr></thead><tbody>{state.teams.map((item, index) => <tr key={item.id} aria-current={!setup && index === state.activeIndex ? 'true' : undefined}><th scope="row"><span>{item.name}</span><small>{item.players.map(player => player.name).join(', ')}</small></th><td>{item.points}</td></tr>)}</tbody></table>
        </aside>}
      </div>
    </div>
  </section>;
}
