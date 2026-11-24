/** @typedef {{id:string}} SpyPlayer */
/** @param {SpyPlayer[]} players @param {string[]} votes @param {number} spy @returns {boolean} */
export function spyWinsVote(players,votes,spy){
 const counts=players.map(p=>votes.filter(v=>v===p.id).length);
 const max=Math.max(...counts);
 const leaders=counts.map((n,i)=>n===max?i:-1).filter(i=>i>=0);
 return leaders.length!==1||leaders[0]!==spy;
}
/** @param {SpyPlayer[]} players @param {Record<string,number>} scores @param {number} spy @param {boolean} spyWins @returns {Record<string,number>} */
export function spyScores(players,scores,spy,spyWins){
 return Object.fromEntries(players.map((p,i)=>[p.id,(scores[p.id]||0)+Number(spyWins?i===spy:i!==spy)]));
}

/** @param {SpyPlayer[]} players @param {string[]} history @param {()=>number} [random] */
export function drawRotatingSpy(players,history,random=Math.random){
 if(!players.length)throw new Error('No players');
 const ids=players.map(p=>p.id);
 let used=[...new Set(history.filter(id=>ids.includes(id)))];
 let available=ids.filter(id=>!used.includes(id));
 if(!available.length){
  const last=used.at(-1);used=[];
  available=ids.filter(id=>id!==last);
  if(!available.length)available=ids;
 }
 const unit=random();
 const id=available[Math.min(available.length-1,Math.max(0,Math.floor((Number.isFinite(unit)?unit:0)*available.length)))];
 return {spy:ids.indexOf(id),history:[...used,id]};
}
