import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCharadesStart,validateWhoamiStart,validateCardStart} from '../src/utils/startValidation.js';
const state=(count=2,cards=3)=>({players:Array.from({length:count},(_,i)=>({id:String(i),name:`Player ${i}`})),cardIndex:0,deck:Object.fromEntries(['easy','medium','hard'].map(level=>[level,Array.from({length:cards},(_,i)=>`${level} ${i}`)]))});
test('charades lists missing setup requirements and accepts ready timed/untimed games',()=>{
 assert.deepEqual(validateCharadesStart({state:state(0),targetDraft:'30'}),['charadesPlayers']);
 assert.deepEqual(validateCharadesStart({state:state(1),targetDraft:'30'}),['charadesPlayers']);
 for(const timed of [true,false])assert.deepEqual(validateCharadesStart({state:{...state(),timed},targetDraft:'30'}),[]);
 assert.deepEqual(validateCharadesStart({state:state(0),targetDraft:'',pendingName:'Mykola'}),['pendingPlayer','charadesPlayers','invalidTarget']);
});
test('victory draft is validated before start rather than silently using an older target',()=>{
 for(const targetDraft of ['','0','-1','1.5','1001','abc','Infinity'])assert(validateCharadesStart({state:state(),targetDraft}).includes('invalidTarget'),targetDraft);
 for(const targetDraft of ['1','1000','42'])assert.deepEqual(validateCharadesStart({state:state(),targetDraft}),[]);
});
test('charades distinguishes missing tiers from not enough cards for a fair round',()=>{
 const missing=state();missing.deck.hard=[];
 assert.deepEqual(validateCharadesStart({state:missing,targetDraft:'30'}),['noLevels']);
 assert.deepEqual(validateCharadesStart({state:state(3,2),targetDraft:'30'}),['noRound']);
 assert.deepEqual(validateCharadesStart({state:state(3,3),targetDraft:'30'}),[]);
});
test('an entered but unadded player must be handled before either game starts',()=>{
 assert.deepEqual(validateCharadesStart({state:state(),targetDraft:'30',pendingName:' New player '}),['pendingPlayer']);
 assert.deepEqual(validateWhoamiStart({players:[{name:'A'}],pool:['one','two'],pendingName:' B '}),['pendingPlayer']);
 assert.deepEqual(validateWhoamiStart({players:[{name:'A'}],pool:['one'],pendingName:'   '}),[]);
});
test('Who Am I requires a player and one available distinct word per player',()=>{
 assert.deepEqual(validateWhoamiStart({players:[],pool:['one']}),['whoamiPlayers']);
 assert.deepEqual(validateWhoamiStart({players:[],pool:[]}),['whoamiPlayers','notEnough']);
 assert.deepEqual(validateWhoamiStart({players:[{name:'A'},{name:'B'}],pool:['one']}),['notEnough']);
 assert.deepEqual(validateWhoamiStart({players:[{name:'A'},{name:'B'}],pool:['one','two']}),[]);
});
test('card modes cannot start the timer with an empty or exhausted deck',()=>{
 for(const word of ['',undefined,'   '])assert.deepEqual(validateCardStart({word}),['noWords']);
 assert.deepEqual(validateCardStart({word:'ready card'}),[]);
});
