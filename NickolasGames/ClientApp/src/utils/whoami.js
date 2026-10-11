import { DIFFICULTIES, wordsByDifficulty } from './difficulty.js';
export const WHOAMI_ALL = '__all__';
export const WHOAMI_DIFFICULTIES = [...DIFFICULTIES, 'all'];
export function whoamiPool(categories, category, difficulty, customWords, customOnly) {
  const custom = customWords.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
  const builtIn = customOnly ? [] : (category === WHOAMI_ALL ? Object.values(categories) : [categories[category]])
    .flatMap(words => difficulty === 'all' ? DIFFICULTIES.flatMap(level => wordsByDifficulty(words, level)) : wordsByDifficulty(words, difficulty));
  const unique = [...new Map([...builtIn, ...custom].map(w => [w.toLocaleLowerCase(), w])).values()];
  for (let i = unique.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [unique[i], unique[j]] = [unique[j], unique[i]]; }
  return unique;
}
export function initialWhoami(legacy = null) {
  const assignments = Array.isArray(legacy?.assignments) ? legacy.assignments : [];
  const names = assignments.length ? assignments : (legacy?.playerNames || '').split(/[\n,]+/).map(name => ({ name: name.trim() })).filter(p => p.name);
  return { schema: 2, phase: assignments.length ? 'game' : 'setup', category: legacy?.cat || WHOAMI_ALL,
    difficulty: WHOAMI_DIFFICULTIES.includes(legacy?.difficulty) ? legacy.difficulty : 'medium', customWords: legacy?.customWords || '', customOnly: legacy?.customOnly || false,
    duration: legacy?.roundSeconds || 60, left: legacy?.left ?? 60, timerEnabled: false,
    players: names.map((p, i) => ({ id: p.id || `legacy-${i}`, name: p.name, word: p.word || '', usedWords: p.usedWords || [], guessed: 0, skipped: 0, revision: 0, lastOutcome: p.lastOutcome || null })), pool: [] };
}
export function validWhoami(s) {
  return s?.schema === 2 && ['setup','game','summary'].includes(s.phase) && typeof s.category === 'string' && WHOAMI_DIFFICULTIES.includes(s.difficulty) &&
    typeof s.customWords === 'string' && typeof s.customOnly === 'boolean' && typeof s.timerEnabled === 'boolean' &&
    Number.isInteger(s.duration) && s.duration >= 10 && s.duration <= 600 && Number.isInteger(s.left) && s.left >= 0 && s.left <= s.duration &&
    Array.isArray(s.pool) && s.pool.every(w => typeof w === 'string') && Array.isArray(s.players) && s.players.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && p.name.trim() && typeof p.word === 'string' &&
      Array.isArray(p.usedWords) && p.usedWords.every(w => typeof w === 'string') && [p.guessed,p.skipped,p.revision].every(n => Number.isSafeInteger(n) && n >= 0) && [null,'guessed','gaveUp','manual'].includes(p.lastOutcome)) &&
    new Set(s.players.map(p => p.id)).size === s.players.length && (s.phase === 'setup' || s.players.length > 0);
}
export function whoamiReducer(s,a) {
  switch(a.type) {
    case 'add':
      return s.phase === 'setup' && a.name.trim() && !s.players.some(p => p.name.toLocaleLowerCase() === a.name.trim().toLocaleLowerCase())
        ? {...s,players:[...s.players,{id:a.id,name:a.name.trim(),word:'',usedWords:[],guessed:0,skipped:0,revision:0,lastOutcome:null}]} : s;
    case 'remove': return s.phase === 'setup' ? {...s,players:s.players.filter(p=>p.id!==a.id)} : s;
    case 'config': return s.phase === 'setup' ? {...s,...a.values} : s;
    case 'deal':
      return s.phase === 'setup' && s.players.length && a.pool.length >= s.players.length ? {...s,phase:'game',pool:a.pool,left:s.duration,
        players:s.players.map((p,i)=>({...p,word:a.pool[i],usedWords:[a.pool[i]],guessed:0,skipped:0,revision:p.revision+1,lastOutcome:null}))} : s;
    case 'answer': {
      const target=s.players.find(p=>p.id===a.id);
      if(s.phase!=='game' || !target?.word || target.revision!==a.revision || !['guessed','gaveUp'].includes(a.outcome)) return s;
      const taken=new Set(s.players.filter(p=>p.id!==a.id).map(p=>p.word.toLocaleLowerCase()));
      const used=new Set(target.usedWords.map(w=>w.toLocaleLowerCase()));
      const next=s.pool.find(w=>!taken.has(w.toLocaleLowerCase())&&!used.has(w.toLocaleLowerCase())) || '';
      return {...s,players:s.players.map(p=>p.id===a.id?{...p,word:next,revision:p.revision+1,usedWords:next?[...p.usedWords,next]:p.usedWords,
        guessed:p.guessed+(a.outcome==='guessed'?1:0),skipped:p.skipped+(a.outcome==='gaveUp'?1:0),lastOutcome:a.outcome}:p)};
    }
    case 'manual': {
      const target=s.players.find(p=>p.id===a.id);const word=a.word.trim();
      if(s.phase!=='game'||!target||!word||s.players.some(p=>p.id!==a.id&&p.word.toLocaleLowerCase()===word.toLocaleLowerCase())||target.usedWords.some(w=>w.toLocaleLowerCase()===word.toLocaleLowerCase())) return s;
      return {...s,players:s.players.map(p=>p.id===a.id?{...p,word,usedWords:[...p.usedWords,word],revision:p.revision+1,lastOutcome:'manual'}:p)};
    }
    case 'tick': return s.phase==='game' && s.timerEnabled ? {...s,left:Math.max(0,s.left-1)}:s;
    case 'resetTimer': return {...s,left:s.duration};
    case 'finish': return s.phase==='game' ? {...s,phase:'summary'}:s;
    case 'resume': return s.phase==='summary' ? {...s,phase:'game'}:s;
    case 'setup': return {...s,phase:'setup',left:s.duration,players:s.players.map(p=>({...p,word:'',usedWords:[],guessed:0,skipped:0,lastOutcome:null,revision:p.revision+1}))};
    default:return s;
  }
}
