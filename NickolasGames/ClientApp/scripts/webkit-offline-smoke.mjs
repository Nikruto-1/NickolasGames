// Build-level responsive smoke test. Run after 'npm run build' with Playwright installed.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const { webkit } = await import(process.env.NICKOLAS_PLAYWRIGHT_PATH || "playwright");

const root = resolve(fileURLToPath(new URL("../../wwwroot/", import.meta.url)));
const types = {".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".webp":"image/webp",".mp3":"audio/mpeg",".ico":"image/x-icon"};

let networkDisabled=false;
let blockedRequests=0;
const server = createServer(async (request,response)=>{
  if(networkDisabled){blockedRequests++;request.socket.destroy();return;}
  try {
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
    const path=resolve(root,"."+pathname);
    if (path!==root && !path.startsWith(root+sep)) {response.writeHead(403).end();return;}
    const target=(await stat(path)).isDirectory()?resolve(path,"index.html"):path;
    const data=await readFile(target);
    response.writeHead(200,{"content-type":types[extname(target)]||"application/octet-stream","cache-control":"no-store"});
    response.end(data);
  } catch {
    response.writeHead(404,{"content-type":"text/plain; charset=utf-8"});
    response.end("Not found");
  }
});

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await webkit.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow',isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();
  await page.goto(base+'/uk/');
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller),null,{timeout:30000});
  const download=page.locator('#offline-download');
  const button=download.locator('button');
  await page.waitForFunction(()=>{const b=document.querySelector('#offline-download button');return b&&(!b.disabled||b.textContent==='Усі ресурси ігор збережено');},null,{timeout:30000});
  if(await button.isEnabled())await button.click();
  await download.getByRole('button',{name:'Усі ресурси ігор збережено',exact:true}).waitFor({timeout:90000});
  // Simulate a genuine unreachable origin without WebKit's network emulation,
  // which can reject navigation before the service worker receives it.
  networkDisabled=true;
  await page.reload();
  await download.getByRole('button',{name:'Усі ресурси ігор збережено',exact:true}).waitFor({timeout:30000});
  for(const game of ['whoami','crocodile','alias','truth','checkers','spy']){
   await page.goto(base+'/uk/games/'+game+'/');
   await page.locator(game==='checkers'?'.ck-board':game==='spy'?'.spy-setup':'.game-screen-nav').waitFor({timeout:30000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),game+' overflows mobile viewport');
  }
  await page.goto(base+'/uk/?game=truth');
  await page.locator('.td-choice-truth').click();
  const card=await page.locator('.td-card-center h3').innerText();
  await page.reload();
  await page.locator('.td-card-center h3').waitFor();
  assert.equal(await page.locator('.td-card-center h3').innerText(),card);
  assert.ok(blockedRequests>0,'The origin must have rejected real network requests');
 }finally{await context.close();}
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log('WebKit offline smoke passed for all six games.');
