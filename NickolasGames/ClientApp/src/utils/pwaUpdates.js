let available = false;
const subscribers = new Set();
export const hasAppUpdate = () => available;
export function subscribeAppUpdate(listener) {
 subscribers.add(listener);
 return () => subscribers.delete(listener);
}

export async function startOfflineUpdates({serviceWorker,windowTarget,documentTarget,scriptUrl,buildId}) {
 const askVersion = () => serviceWorker.controller?.postMessage({type:"GET_VERSION"});
 serviceWorker.addEventListener("message", event => {
  if(event.data?.type === "APP_VERSION" && event.data.version !== buildId && !available) {
   available = true;
   subscribers.forEach(listener => listener(true));
  }
 });
 serviceWorker.addEventListener("controllerchange", askVersion);
 const registration = await serviceWorker.register(scriptUrl, {updateViaCache:"none"});
 let lastCheck = 0;
 const check = () => {
  if(documentTarget.visibilityState === "hidden") return;
  askVersion();
  if(Date.now()-lastCheck < 60000) return;
  lastCheck = Date.now();
  registration.update().catch(() => {});
 };
 windowTarget.addEventListener("online", () => {lastCheck=0;check();});
 windowTarget.addEventListener("focus", check);
 windowTarget.addEventListener("pageshow", check);
 documentTarget.addEventListener("visibilitychange", check);
 check();
 return registration;
}
