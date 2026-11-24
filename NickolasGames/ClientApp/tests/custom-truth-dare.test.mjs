import test from 'node:test';
import assert from 'node:assert/strict';
import {truthCatalog,snapshotDecks,sessionCatalog} from '../src/features/truth-or-dare/customCatalog.js';
import {createTruthDareSession,chooseTruthDare,restoreTruthDareSession} from '../src/features/truth-or-dare/session.js';
const deck={id:'test',name:'Friends',game:'truth',lang:'en',levels:{truth:['Question?'],dare:['Dance!']}};
test('custom cards retain text, type and stable identity in snapshot',()=>{
 const id='custom:test',snap=snapshotDecks([deck],'en',[id]),catalog=truthCatalog(snap,'en');
 assert.equal(catalog.categories.at(-1).count,2);
 const state={...createTruthDareSession([id],()=>0,catalog.cards),customDecks:snap,customLang:'en'};
 const lookup=new Map(sessionCatalog(state).cards.map(c=>[c.id,c]));
 const chosen=chooseTruthDare(state,'dare',lookup);
 assert.equal(lookup.get(chosen.queue[0]).text,'Dance!');
 assert.ok(restoreTruthDareSession(chosen,catalog.cards,new Set([id])));
 assert.equal(truthCatalog([deck],'uk').categories.some(c=>c.id===id),false);
});
