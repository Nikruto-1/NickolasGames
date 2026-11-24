export const contentKey=value=>String(value).normalize('NFC').trim().toLowerCase().replace(/[’ʼ]/g,"'");
export function freshContent(values,history,minimum=1,random=Math.random){
 const unique=[...new Map(values.map(v=>[contentKey(v),v])).values()];
 const used=new Set(history);let fresh=unique.filter(v=>!used.has(contentKey(v)));
 if(fresh.length<Math.min(minimum,unique.length)){
   const available=new Set(unique.map(contentKey));
   const recent=history.filter(v=>available.has(v)).at(-1);
   const nextHistory=history.filter(v=>!available.has(v));
   const remainder=unique.filter(v=>used.has(contentKey(v)));
   const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;};
   shuffle(fresh);shuffle(remainder);
   if(!fresh.length&&remainder.length>1&&contentKey(remainder[0])===recent){[remainder[0],remainder[1]]=[remainder[1],remainder[0]];}
   return {values:[...fresh,...remainder],history:nextHistory};
 }
 for(let i=fresh.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[fresh[i],fresh[j]]=[fresh[j],fresh[i]];}
 return {values:fresh,history};
}
