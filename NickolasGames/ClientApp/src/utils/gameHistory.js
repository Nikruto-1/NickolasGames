// Version-independent, bounded snapshot history stored with the game state.
// Keeping snapshots inside the same session envelope prevents mismatched restores.
export const MAX_GAME_HISTORY = 80;

export function withoutHistory(state) {
  if (!state || typeof state!=="object") return state;
  const {history: ignored, ...snapshot} = state;
  return snapshot;
}
export function normalizeGameHistory(value, validate) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_GAME_HISTORY).filter(entry =>
    entry && typeof entry==="object" && !Array.isArray(entry) &&
    !Object.hasOwn(entry,"history") && validate(entry));
}
export function restoreGameTimeline(state,validate,makeId=()=>null) {
  if (!validate(state)) return null;
  const id=typeof state.matchId==="string" && state.matchId.length>0 && state.matchId.length<=100
    ? state.matchId : makeId();
  return {...state,matchId:id,history:normalizeGameHistory(state.history,validate),flipped:Boolean(state.flipped)};
}
export function appendGameHistory(previous,next,validate) {
  const history=normalizeGameHistory(previous.history,validate);
  return {...next,history:[...history,withoutHistory(previous)].slice(-MAX_GAME_HISTORY),
    flipped:Boolean(previous.flipped)};
}
export function rewindGameHistory(current,match=(entry)=>true,validate=()=>true) {
  const history=normalizeGameHistory(current.history,validate);
  for(let index=history.length-1;index>=0;index--){
    if(!match(history[index]))continue;
    return {...history[index],matchId:history[index].matchId||current.matchId,
      flipped:Boolean(current.flipped),history:history.slice(0,index)};
  }
  return null;
}
