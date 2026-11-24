import { ArrowRight } from 'lucide-react';

export function AliasSummary({state,copy,result,roundCorrect,roundSkipped,lastAnswer,dispatch}) {
 return <div className="alias-round-summary">
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
          </div>;
}
