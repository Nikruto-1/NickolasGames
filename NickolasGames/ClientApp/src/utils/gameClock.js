// A clock subscription refreshes immediately and after background-tab suspension.
// Rules continue to own deadlines and scoring; this module only supplies time.
/** @typedef {{interval?:number, immediate?:boolean, hiddenOnly?:boolean, now?:()=>number, scheduler?:Pick<typeof globalThis,'setInterval'|'clearInterval'>, visibility?:Pick<Document,'hidden'|'addEventListener'|'removeEventListener'>}} ClockOptions */
/** @param {(now:number)=>void} onTick @param {ClockOptions} [options] @returns {()=>void} */
export function subscribeGameClock(onTick,{interval=250,immediate=true,hiddenOnly=false,now=Date.now,scheduler=globalThis,visibility=globalThis.document}={}){
 const tick=()=>onTick(now());
 const onVisibility=()=>{if(!hiddenOnly||visibility?.hidden)tick();};
 if(immediate)tick();
 const id=scheduler.setInterval(tick,interval);
 visibility?.addEventListener('visibilitychange',onVisibility);
 return ()=>{scheduler.clearInterval(id);visibility?.removeEventListener('visibilitychange',onVisibility);};
}
/** @param {number|null|undefined} deadline @param {number} now @param {number} [fallback] @returns {number} */
export function remainingSeconds(deadline,now,fallback=0){
 return deadline==null?fallback:Math.max(0,Math.ceil((deadline-now)/1000));
}
