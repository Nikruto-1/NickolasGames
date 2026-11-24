// A clock subscription refreshes immediately and after background-tab suspension.
// Rules continue to own deadlines and scoring; this module only supplies time.
export function subscribeGameClock(onTick,{interval=250,immediate=true,hiddenOnly=false,now=Date.now,scheduler=globalThis,visibility=globalThis.document}={}){
 const tick=()=>onTick(now());
 const onVisibility=()=>{if(!hiddenOnly||visibility?.hidden)tick();};
 if(immediate)tick();
 const id=scheduler.setInterval(tick,interval);
 visibility?.addEventListener('visibilitychange',onVisibility);
 return ()=>{scheduler.clearInterval(id);visibility?.removeEventListener('visibilitychange',onVisibility);};
}
export function remainingSeconds(deadline,now,fallback=0){
 return deadline==null?fallback:Math.max(0,Math.ceil((deadline-now)/1000));
}
