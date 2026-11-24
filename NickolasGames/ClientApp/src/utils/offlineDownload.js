export async function requestOffline(type,serviceWorker=globalThis.navigator?.serviceWorker,Channel=globalThis.MessageChannel){
 if(!serviceWorker||!Channel)return {ready:false,error:true};
 const worker=serviceWorker.controller;
 if(!worker)return {ready:false,error:true};
 return new Promise(resolve=>{
  const channel=new Channel();
  const finish=value=>{clearTimeout(timeout);channel.port1.close();resolve(value);};
  const timeout=setTimeout(()=>finish({ready:false,error:true}),120000);
  channel.port1.onmessage=e=>finish(e.data);
  try{worker.postMessage({type},[channel.port2]);}catch{finish({ready:false,error:true});}
 });
}
