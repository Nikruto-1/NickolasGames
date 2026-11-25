import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYER_REVIEWS, REVIEW_LANGS, visiblePlayerReviews} from '../src/components/playerReviews.js';
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
