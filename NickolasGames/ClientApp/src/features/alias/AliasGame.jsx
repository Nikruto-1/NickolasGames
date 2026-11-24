import { AliasSetup } from './AliasSetup.jsx';
import { AliasDiceStage } from './AliasDiceStage.jsx';
import { AliasRound } from './AliasRound.jsx';
import { AliasSummary } from './AliasSummary.jsx';
import { GameTabs } from '../../components/GameTabs.jsx';
import { TIMER_RESUME_COPY } from "../../locales/round.js";
import { RotateCcw } from 'lucide-react';
import './AliasGame.css';
import { useAliasGame } from "./useAliasGame.js";
import { AliasScoreboard } from "./AliasScoreboard.jsx";

export function AliasGame({ games, t, lang, onGame, startRequest = 0 }) {

 const { needsAudio, restoreAudio, copy, key, state, dispatch, categorySelection, availableCategories, selectedCategories, categorySummary, drafts, setDrafts, editingTeam, setEditingTeam, target, setTarget, attempt, storageOk, clock, drag, setDrag, gesture, feedback, readyPanel, setup, drawing, team, actor, word, remaining, last, playing, errors, result, lastAnswer, roundCorrect, roundSkipped, settings, selectCategories, updateTeam, addPlayer, start, roll, begin, answer, reset, stopGesture } = useAliasGame({ games, t, lang, startRequest });
  return <section className="s pv alias-game" id="preview">
    <div className="wrap">
      <div className="head"><h2>{copy.title}</h2><details className="alias-rules"><summary>{copy.rules}</summary><ol className="alias-rules-sections">{copy.rulesSections.map(section => <li key={section.title}><h3>{section.title}</h3><ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul></li>)}</ol></details></div>
      <GameTabs active="alias" games={games} t={t} onChoose={onGame} showRandom />
      {!storageOk && <p className="alias-warning" role="status">{copy.storage}</p>}
      <div className={'alias-layout' + (setup || drawing ? ' is-setup' : '')}>

        <div>
          {needsAudio && <button type="button" className="btn sm" onClick={restoreAudio}>{TIMER_RESUME_COPY[lang] || TIMER_RESUME_COPY.en}</button>}
          {setup && <AliasSetup {...{state,copy,t,editingTeam,setEditingTeam,updateTeam,settings,setDrafts,drafts,addPlayer,categorySummary,categorySelection,selectedCategories,availableCategories,selectCategories,target,setTarget,attempt,errors,feedback,start}}/>}
          {drawing && <AliasDiceStage {...{state,copy,clock,team,dispatch,roll}}/>}
          {state.phase === 'ready' && <div ref={readyPanel} className="alias-ready" role="status">
            <p>{state.dice.length && state.teams.every(item => item.turns === 0) ? copy.first : copy.turn}</p><h3>{team.name}</h3><p>{copy.actor}: <strong>{actor?.name}</strong></p>
            <div className="alias-word-card alias-hidden-card"><strong>{copy.ready}</strong></div>
            <button className="btn pri alias-main-action" onClick={begin}>{copy.startRound}</button>
          </div>}
          {playing && <AliasRound {...{state,copy,team,actor,remaining,last,drag,gesture,setDrag,stopGesture,word,dispatch,answer}}/>}
          {['summary', 'finished', 'exhausted'].includes(state.phase) && <AliasSummary {...{state,copy,result,roundCorrect,roundSkipped,lastAnswer,dispatch}}/>}
          {!setup && <button className="btn sm alias-reset" onClick={reset}><RotateCcw size={16} />{copy.newGame}</button>}
        </div>
        {!setup && !drawing && <AliasScoreboard state={state} copy={copy} />}
      </div>
    </div>
  </section>;
}
