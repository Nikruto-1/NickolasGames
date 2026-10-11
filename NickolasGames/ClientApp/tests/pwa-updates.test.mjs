import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startOfflineUpdates,subscribeAppUpdate,hasAppUpdate} from '../src/utils/pwaUpdates.js';
class Events {
 listeners=new Map();
 addEventListener(type,fn){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);}
 emit(type,event={}){for(const fn of this.listeners.get(type)||[])fn(event);}
}
test('updates bypass browser script cache, check on returning online and notify without reloading a game',async()=>{
 const worker=new Events(),win=new Events(),doc=new Events();doc.visibilityState='visible';
 let updates=0,versionRequests=0,notice=false;
 const registration={update:async()=>{updates++;}};
 worker.controller={postMessage:message=>{assert.equal(message.type,'GET_VERSION');versionRequests++;}};
 worker.register=async(url,options)=>{assert.equal(url,'./sw.js');assert.equal(options.updateViaCache,'none');return registration;};
 const unsubscribe=subscribeAppUpdate(value=>{notice=value;});
 await startOfflineUpdates({serviceWorker:worker,windowTarget:win,documentTarget:doc,scriptUrl:'./sw.js',buildId:'current'});
 assert.equal(updates,1);assert(versionRequests>0);
 win.emit('focus');assert.equal(updates,1);
 doc.visibilityState='hidden';doc.emit('visibilitychange');assert.equal(updates,1);
 doc.visibilityState='visible';win.emit('online');assert.equal(updates,2);
 worker.emit('controllerchange');assert(versionRequests>=3);
 worker.emit('message',{data:{type:'APP_VERSION',version:'current'}});assert.equal(notice,false);
 worker.emit('message',{data:{type:'APP_VERSION',version:'next'}});assert.equal(notice,true);assert.equal(hasAppUpdate(),true);
 unsubscribe();
});
