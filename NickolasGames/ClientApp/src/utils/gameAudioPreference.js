export const GAME_AUDIO_KEY='nickolasgames-audio-enabled';
export function gameAudioEnabled(storage){
 try{return (storage??globalThis.localStorage).getItem(GAME_AUDIO_KEY)!=='off';}catch{return true;}
}
export function setGameAudioEnabled(enabled,storage){
 try{(storage??globalThis.localStorage).setItem(GAME_AUDIO_KEY,enabled?'on':'off');if(!storage&&typeof window!=='undefined')window.dispatchEvent(new Event('nickolasgames-audio-change'));return true;}catch{return false;}
}
