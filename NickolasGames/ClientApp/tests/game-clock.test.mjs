import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribeGameClock,remainingSeconds} from '../src/utils/gameClock.js';
test('clock refreshes immediately, on visibility and cleans up',()=>{
 let now=1000,callback,listener,cleared=false,removed=false;
 const values=[];
 const scheduler={setInterval(fn,ms){assert.equal(ms,250);callback=fn;return 7;},clearInterval(id){assert.equal(id,7);cleared=true;}};
 const visibility={hidden:false,addEventListener(name,fn){assert.equal(name,'visibilitychange');listener=fn;},removeEventListener(name,fn){assert.equal(fn,listener);removed=true;}};
 const stop=subscribeGameClock(n=>values.push(n),{now:()=>now,scheduler,visibility});
 now=1250;callback();now=8000;listener();
 assert.deepEqual(values,[1000,1250,8000]);stop();assert.ok(cleared&&removed);
});
test('paused countdown only flushes when hidden and does not tick on subscription',()=>{
 let listener;const values=[];const visibility={hidden:false,addEventListener(_,fn){listener=fn;},removeEventListener(){}};
 const stop=subscribeGameClock(n=>values.push(n),{immediate:false,hiddenOnly:true,now:()=>5000,scheduler:{setInterval(){return 1},clearInterval(){}},visibility});
 listener();assert.deepEqual(values,[]);visibility.hidden=true;listener();assert.deepEqual(values,[5000]);stop();
});
test('remaining time respects deadline, rounding and untimed fallback',()=>{
 assert.equal(remainingSeconds(61000,1000),60);
 assert.equal(remainingSeconds(61000,60999),1);
 assert.equal(remainingSeconds(61000,62000),0);
 assert.equal(remainingSeconds(null,1000,60),60);
});

test('queued ticks after disposal cannot update a former game session',()=>{
 let callback,listener,cleared=0,removed=0;
 const values=[];
 const stop=subscribeGameClock(n=>values.push(n),{now:()=>1000,scheduler:{setInterval(fn){callback=fn;return 7;},clearInterval(){cleared++;}},visibility:{hidden:false,addEventListener(_,fn){listener=fn;},removeEventListener(){removed++;}}});
 stop();callback();listener();stop();
 assert.deepEqual(values,[1000]);assert.equal(cleared,1);assert.equal(removed,1);
});
