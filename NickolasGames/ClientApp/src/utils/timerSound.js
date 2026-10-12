// Create/resume during the timer button gesture so mobile browsers allow the alarm.
export function createTimerSound(getContext = () => globalThis.AudioContext || globalThis.webkitAudioContext, getSpeech = () => ({synthesis:globalThis.speechSynthesis,Utterance:globalThis.SpeechSynthesisUtterance}), recordingUrl=null, loadRecording=async (ctx,url)=>{
 const response=await fetch(url);if(!response.ok)throw new Error('Audio unavailable');return ctx.decodeAudioData(await response.arrayBuffer());
}) {
 let context;let pending=null;let disposed=false;const recordings=new Map();const loads=new Map();let source=null;
 const recordingFor=language=>typeof recordingUrl==='string'?(language==='uk'?recordingUrl:null):recordingUrl?.[language==='uk'?'uk':'other'];
 const unlock = (language='uk') => {
  disposed=false;
  // Prime speech in the same user gesture as starting the timer (including Safari).
  try {const {synthesis,Utterance}=getSpeech();if(synthesis&&Utterance&&!recordingFor(language)){const silent=new Utterance('.');silent.volume=0;silent.lang=language;synthesis.speak(silent);}} catch {}
  try {
   const Context=getContext();if(!Context)return;
   context ||= new Context();
   const url=recordingFor(language);if(url&&!loads.has(url)){loads.set(url,loadRecording(context,url).then(buffer=>{if(!disposed)recordings.set(url,buffer);}).catch(()=>{}));}
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
 const announce = (text,language) => {
  const url=recordingFor(language);const recording=recordings.get(url);
  if(recording&&context?.state==='running') {
   try {source=context.createBufferSource();source.buffer=recording;source.connect(context.destination);source.start();return;}catch {}
  }
  if(url&&language!=='uk'){play();return;}
  try {
   const {synthesis,Utterance}=getSpeech();
   if(!synthesis||!Utterance){play();return;}
   const message=new Utterance(text);message.lang=language;message.rate=.95;
   const voices=synthesis.getVoices();
   const matching=voices.filter(voice=>voice.lang.toLowerCase().split('-')[0]===language.split('-')[0]);
   const voice=matching.find(voice=>voice.localService)||matching[0];if(voice)message.voice=voice;
   pending=message;
   message.onend=()=>{if(pending===message)pending=null;};
   message.onerror=()=>{if(pending===message){pending=null;if(!disposed)play();}};
   synthesis.speak(message);
  } catch {pending=null;play();}
 };
 return {unlock,play,announce,dispose(){disposed=true;if(source){try{source.stop();source.disconnect();}catch{}source=null;}recordings.clear();loads.clear();if(pending){pending.onend=null;pending.onerror=null;try{getSpeech().synthesis.cancel();}catch{}pending=null;}if(context){Promise.resolve(context.close()).catch(()=>{});context=null;}}};
}
