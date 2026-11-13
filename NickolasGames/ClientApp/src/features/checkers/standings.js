// Local-only results for two-player checkers. No server or personal accounts.
export const emptyCheckersStandings = () => ({white:0,black:0,recent:[],recorded:[]});
export function validateCheckersStandings(value) {
  if (!value || !Number.isSafeInteger(value.white) || value.white<0 ||
      !Number.isSafeInteger(value.black) || value.black<0 ||
      !Array.isArray(value.recent) || !Array.isArray(value.recorded) ||
      value.recent.length>10 || value.recorded.length>200 ||
      value.recorded.some(id=>typeof id!=="string" || id.length>100) ||
      value.recent.some(r=>!r || typeof r.id!=="string" || !["white","black"].includes(r.side))) return null;
  return value;
}
export function recordCheckersWin(stats, id, side) {
  if (typeof id!=="string" || !id || !["white","black"].includes(side) ||
      stats.recorded.includes(id)) return stats;
  return {
    ...stats,
    [side]:stats[side]+1,
    recorded:[id,...stats.recorded].slice(0,200),
    recent:[{id,side},...stats.recent].slice(0,10)
  };
}
// Revert the last confirmed result when the player undoes a winning move.
export function revertCheckersWin(stats, id) {
  if (typeof id!=="string" || !stats.recorded.includes(id)) return stats;
  const result=stats.recent.find(item=>item.id===id);
  if (!result) return stats; // Never modify a score without a matching result.
  return {
    ...stats,
    [result.side]:Math.max(0,stats[result.side]-1),
    recorded:stats.recorded.filter(item=>item!==id),
    recent:stats.recent.filter(item=>item.id!==id)
  };
}
export function rankedCheckersSides(stats) {
  return ["white","black"].sort((a,b)=>stats[b]-stats[a] || (a==="white"?-1:1));
}
