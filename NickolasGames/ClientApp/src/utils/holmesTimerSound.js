import holmesMeow from '../assets/audio/holmes-meow.mp3';
import holmesRecording from '../assets/audio/holmes-time-up-uk.mp3';
import { createTimerSound } from './timerSound.js';
export const HOLMES_TIME_UP='Холмс повідомляє, що час закінчився';
export const createHolmesTimerSound=()=>createTimerSound(undefined,undefined,{uk:holmesRecording,other:holmesMeow});
