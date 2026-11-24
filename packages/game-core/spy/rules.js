export function spyWinsVote(players,votes,spy){
 const counts=players.map(p=>votes.filter(v=>v===p.id).length);
 const max=Math.max(...counts);
 const leaders=counts.map((n,i)=>n===max?i:-1).filter(i=>i>=0);
 return leaders.length!==1||leaders[0]!==spy;
}
export function spyScores(players,scores,spy,spyWins){
 return Object.fromEntries(players.map((p,i)=>[p.id,(scores[p.id]||0)+Number(spyWins?i===spy:i!==spy)]));
}
