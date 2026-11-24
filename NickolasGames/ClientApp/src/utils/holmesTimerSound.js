import { gameAudioEnabled } from './gameAudioPreference.js';
import holmesMeow from '../assets/audio/holmes-meow.mp3';
import holmesRecording from '../assets/audio/holmes-time-up-uk.mp3';
import { createTimerSound } from './timerSound.js';
export const HOLMES_TIME_UP='Холмс повідомляє, що час закінчився';
export const createHolmesTimerSound=()=>{
 const sound=createTimerSound(undefined,undefined,{uk:holmesRecording,other:holmesMeow});
 return {...sound,play:()=>{if(gameAudioEnabled())sound.play();},feedback:outcome=>{if(gameAudioEnabled())sound.feedback(outcome);},announce:(text,lang)=>{if(gameAudioEnabled())sound.announce(text,lang);}};
};
