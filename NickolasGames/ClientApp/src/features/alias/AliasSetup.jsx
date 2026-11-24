import { Check, ChevronDown, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { DIFFICULTIES } from '../../utils/difficulty.js';
import { ALIAS_ALL, ALIAS_FORMATS, validAliasTarget } from './gameLogic.js';

export function AliasSetup({state,copy,t,editingTeam,setEditingTeam,updateTeam,settings,setDrafts,drafts,addPlayer,categorySummary,categorySelection,selectedCategories,availableCategories,selectCategories,target,setTarget,attempt,errors,feedback,start}) {
 return <>
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
              <fieldset><legend>{copy.formatLabel}</legend><div className="alias-levels alias-formats">{ALIAS_FORMATS.map(format => <button key={format} type="button" className={'chip alias-format-' + format} aria-pressed={state.format === format} onClick={() => settings({ format })}>{copy.formats[format]}</button>)}</div></fieldset>
              <fieldset><legend>{t.difficultyLabel}</legend><div className="alias-levels">{['all', ...DIFFICULTIES].map(level => <button key={level} type="button" className={'chip alias-level-' + level} aria-pressed={state.difficulty === level} onClick={() => settings({ difficulty: level })}>{level === 'all' ? copy.allLevels : t.difficulty[level]}</button>)}</div></fieldset>
              <fieldset className="alias-category-field"><legend>{copy.categoriesLabel}</legend><details className="alias-category-picker"><summary><span>{categorySummary}</span><ChevronDown size={18} aria-hidden="true" /></summary><div className="alias-category-options">
                <label className="alias-category-option is-all"><input type="checkbox" checked={categorySelection === ALIAS_ALL} ref={node => { if (node) node.indeterminate = categorySelection !== ALIAS_ALL && selectedCategories.length > 0; }} onChange={event => settings({ category: event.target.checked ? ALIAS_ALL : [] })} /><span>{t.allCategories}</span></label>
                {availableCategories.map(name => <label className="alias-category-option" key={name}><input type="checkbox" checked={selectedCategories.includes(name)} onChange={event => selectCategories(event.target.checked ? [...selectedCategories, name] : selectedCategories.filter(category => category !== name))} /><span>{name}</span></label>)}
              </div></details></fieldset>
              <label htmlFor="alias-target">{copy.target}<input id="alias-target" type="number" inputMode="numeric" min="1" step="1" value={target} onChange={event => { setTarget(event.target.value); if (validAliasTarget(Number(event.target.value))) settings({ target: Number(event.target.value) }); }} /></label>
            </div>
            {attempt > 0 && errors.length > 0 && <div ref={feedback} className="setup-validation" role="alert" tabIndex={-1}><ul>{errors.map(error => <li key={error}>{copy[error]}</li>)}</ul></div>}
            <button className="btn pri alias-main-action" onClick={start}>{copy.start}</button>
          </>;
}
