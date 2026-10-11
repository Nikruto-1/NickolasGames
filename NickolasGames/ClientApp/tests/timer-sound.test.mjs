import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTimerSound} from '../src/utils/timerSound.js';
import {initialWhoami,whoamiReducer} from '../src/utils/whoami.js';
test('alarm unlocks on gesture, schedules three short tones, and releases audio',()=>{
 const calls=[];class Context {
  state='running';currentTime=10;sampleRate=44100;destination={};
  resume(){calls.push('resume');return Promise.resolve();}close(){calls.push('close');return Promise.resolve();}
  createBuffer(){return {};}createBufferSource(){return {connect(){},start(){calls.push('unlock');}};}
  createOscillator(){return {frequency:{},connect(){},disconnect(){},start(at){calls.push(at);},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}
 }
 const sound=createTimerSound(()=>Context);sound.play();assert.equal(calls.length,0);sound.unlock();sound.play();assert.deepEqual(calls,['resume','unlock',10,10.3,10.6]);sound.dispose();assert.equal(calls.at(-1),'close');
});
test('unavailable audio does not interrupt a game',()=>{const s=createTimerSound(()=>undefined);assert.doesNotThrow(()=>{s.unlock();s.play();s.dispose();});});
test('new setup starts empty while saved active cards migrate; changing settings clears roster',()=>{
 assert.equal(initialWhoami({playerNames:'Nickolas\nSofia\nDmytro'}).players.length,0);
 const active=initialWhoami({assignments:[{id:'a',name:'Anna',word:'Cat',usedWords:['Cat']}]});assert.equal(active.players.length,1);
 assert.equal(whoamiReducer(active,{type:'setup',clearPlayers:true}).players.length,0);
});
test('Holmes speaks the localized phrase using an available local voice',()=>{
 const calls=[];const local={lang:'uk-UA',localService:true};class Utterance {constructor(text){this.text=text;}}
 const synthesis={getVoices:()=>[{lang:'en-US',localService:true},{lang:'uk-UA',localService:false},local],speak:m=>calls.push(m),cancel(){}};
 const s=createTimerSound(()=>undefined,()=>({synthesis,Utterance}));s.unlock('uk');assert.equal(calls[0].volume,0);
 s.announce('Холмс повідомляє, що час закінчився','uk');assert.equal(calls[1].text,'Холмс повідомляє, що час закінчився');assert.equal(calls[1].lang,'uk');assert.equal(calls[1].voice,local);s.dispose();
});
test('voice failure falls back to the timer signal',()=>{
 let tones=0;class Context {state='running';currentTime=0;sampleRate=44100;destination={};resume(){}close(){}createBuffer(){return {};}createBufferSource(){return {connect(){},start(){}};}createOscillator(){return {frequency:{},connect(){},start(){tones++;},stop(){}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){}};}}
 let message;class Utterance {constructor(text){this.text=text;}}
 const s=createTimerSound(()=>Context,()=>({Utterance,synthesis:{getVoices:()=>[],speak:m=>{message=m;},cancel(){}}}));s.unlock();s.announce('Time is up','en');message.onerror();assert.equal(tones,3);s.dispose();
});
test('the provided recording plays instead of synthesized Ukrainian and stops on disposal',async()=>{
 const buffer={recording:true};const played=[];let speech=0,stopped=0;
 class Context {state='running';sampleRate=44100;destination={};resume(){}close(){}createBuffer(){return {};}createBufferSource(){return {connect(){},start(){played.push(this.buffer);},stop(){stopped++;},disconnect(){}};}}
 const s=createTimerSound(()=>Context,()=>({synthesis:{speak(){speech++;}},Utterance:class{}}),'voice.mp3',async()=>buffer);
 s.unlock('uk');await Promise.resolve();await Promise.resolve();s.announce('Time is up','uk');assert.equal(played.at(-1),buffer);assert.equal(speech,0);s.dispose();assert.equal(stopped,1);
});
test('every non-Ukrainian locale plays a meow without synthesized speech',async()=>{
 for(const language of ['en','sv','de','es']) {
  const loaded=[],played=[];let speech=0;
  class Context {state='running';sampleRate=44100;destination={};resume(){}close(){}createBuffer(){return {};}createBufferSource(){return {connect(){},start(){played.push(this.buffer);},stop(){},disconnect(){}};}}
  const meow={meow:true};const s=createTimerSound(()=>Context,()=>({synthesis:{speak(){speech++;}},Utterance:class{}}),{uk:'uk.mp3',other:'meow.mp3'},async(_,url)=>{loaded.push(url);return meow;});
  s.unlock(language);await Promise.resolve();await Promise.resolve();s.announce('Time is up',language);assert.deepEqual(loaded,['meow.mp3']);assert.equal(played.at(-1),meow);assert.equal(speech,0);s.dispose();
 }
});
