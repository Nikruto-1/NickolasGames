import test from 'node:test';
import assert from 'node:assert/strict';
import {gameAudioEnabled,setGameAudioEnabled,GAME_AUDIO_KEY} from '../src/utils/gameAudioPreference.js';
test('game sounds are enabled by default and preference survives reload',()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 assert.equal(gameAudioEnabled(storage),true);
 assert.equal(setGameAudioEnabled(false,storage),true);
 assert.equal(map.get(GAME_AUDIO_KEY),'off');
 assert.equal(gameAudioEnabled(storage),false);
 assert.equal(setGameAudioEnabled(true,storage),true);
 assert.equal(gameAudioEnabled(storage),true);
});
test('blocked storage does not crash games',()=>{
 const storage={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
 assert.equal(gameAudioEnabled(storage),true);
 assert.equal(setGameAudioEnabled(false,storage),false);
});
