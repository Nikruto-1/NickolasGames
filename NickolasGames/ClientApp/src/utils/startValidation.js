import {validTargetScore} from './playerScores.js';
import {deckReady,canCompleteRound} from './charades.js';
export function validateCharadesStart({state,targetDraft,pendingName=''}) {
 const errors=[];
 if(pendingName.trim())errors.push('pendingPlayer');
 if(state.players.length<2)errors.push('charadesPlayers');
 if(!validTargetScore(Number(targetDraft)))errors.push('invalidTarget');
 if(!deckReady(state.deck))errors.push('noLevels');
 else if(!canCompleteRound(state))errors.push('noRound');
 return errors;
}
export function validateWhoamiStart({players,pool,pendingName=''}) {
 const errors=[];
 if(pendingName.trim())errors.push('pendingPlayer');
 if(!players.length)errors.push('whoamiPlayers');
 if(!pool.length||pool.length<players.length)errors.push('notEnough');
 return errors;
}
export function validateCardStart({word}) {
 return typeof word==='string'&&word.trim()?[]:['noWords'];
}
