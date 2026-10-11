// Create/resume during the timer button gesture so mobile browsers allow the alarm.
export function createTimerSound(getContext = () => globalThis.AudioContext || globalThis.webkitAudioContext) {
 let context;
 const unlock = () => {
  try {
   const Context=getContext();if(!Context)return;
   context ||= new Context();
   Promise.resolve(context.resume()).catch(()=>{});
   const source=context.createBufferSource();source.buffer=context.createBuffer(1,1,context.sampleRate);source.connect(context.destination);source.start();
  } catch {}
 };
 const play = () => {
  if(!context || context.state!=='running')return;
  try {
   for(let i=0;i<3;i++) {
    const at=context.currentTime+i*.3;const oscillator=context.createOscillator();const gain=context.createGain();
    oscillator.type='sine';oscillator.frequency.value=880;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.22,at+.015);gain.gain.linearRampToValueAtTime(0,at+.18);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(at);oscillator.stop(at+.2);
   }
  } catch {}
 };
 return {unlock,play,dispose(){if(context){Promise.resolve(context.close()).catch(()=>{});context=null;}}};
}
