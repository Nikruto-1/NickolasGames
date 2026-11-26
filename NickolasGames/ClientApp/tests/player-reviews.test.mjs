import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYER_REVIEWS, REVIEW_LANGS, visiblePlayerReviews, visibleReviewParticipants} from '../src/components/playerReviews.js';
const sample = {id:'fixture',name:'Test fixture',country:'GB',game:'alias',approved:true,quotes:Object.fromEntries(REVIEW_LANGS.map(lang=>[lang,'fixture '+lang]))};
test('review feed excludes unapproved and incomplete entries',()=>{
 assert.deepEqual(visiblePlayerReviews([{...sample,approved:false},{...sample,quotes:{en:'fixture'}},{...sample,game:'invalid'},{...sample,country:'invalid'}],'en'),[]);
});
test('review feed returns unique approved localized entries',()=>{
 for(const lang of REVIEW_LANGS)assert.deepEqual(visiblePlayerReviews([sample,sample],lang),[{id:'fixture',name:'Test fixture',country:'GB',game:'alias',quote:'fixture '+lang}]);
 assert.equal(visiblePlayerReviews([sample],'unknown')[0].quote,'fixture en');
});
test('production review feed contains only complete approved entries',()=>{
 for(const lang of REVIEW_LANGS)assert.equal(visiblePlayerReviews(PLAYER_REVIEWS,lang).length,PLAYER_REVIEWS.length);
});

test('feedback participant roster has 16 unique cards across six countries in every locale',()=>{
 for(const lang of REVIEW_LANGS){const people=visibleReviewParticipants(lang);assert.equal(people.length,16);assert.equal(new Set(people.map(p=>p.id)).size,16);assert.equal(new Set(people.map(p=>p.country)).size,6);assert.ok(people.every(p=>p.name&&p.country&&!('quote' in p)));}
});
