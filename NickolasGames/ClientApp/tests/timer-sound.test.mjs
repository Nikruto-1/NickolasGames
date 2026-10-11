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
