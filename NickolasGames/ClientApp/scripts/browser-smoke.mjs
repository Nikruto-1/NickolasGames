// Build-level responsive smoke test. Run after 'npm run build' with Playwright installed.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = await import(process.env.NICKOLAS_PLAYWRIGHT_PATH || "playwright");

const root = resolve(fileURLToPath(new URL("../../wwwroot/", import.meta.url)));
const types = {".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".webp":"image/webp",".mp3":"audio/mpeg",".ico":"image/x-icon"};

const server = createServer(async (request,response)=>{
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
const browser=await chromium.launch({headless:true,executablePath:process.env.NICKOLAS_CHROME_PATH || undefined,args:["--no-sandbox"]});
const failures=[];
let checks=0;

async function check(page,label) {
  const result=await page.evaluate(()=>{
    const header=document.querySelector(".game-screen-header");
    const nav=document.querySelector(".game-screen-nav");
    const viewport=window.innerWidth;
    const box=header?.getBoundingClientRect();
    return {
      viewport,
      headerWidth:box?.width,
      headerLeft:box?.left,
      headerRight:box?.right,
      navDisplay:nav?getComputedStyle(nav).display:"",
      navPosition:nav?getComputedStyle(nav).position:"",
      documentWidth:document.documentElement.scrollWidth,
      articleWidths:[...document.querySelectorAll(".game-screen .wrap,.game-screen .pvg,.game-screen .td-card,.game-screen .alias-word-card")].map(node=>({
        width:node.clientWidth,scrollWidth:node.scrollWidth
      }))
    };
  });
  try {
    assert.ok(result.headerWidth>0,label+": game header not visible");
    assert.ok(result.headerLeft>=-2 && result.headerRight<=result.viewport+2,label+": header extends beyond screen "+JSON.stringify(result));
    assert.equal(result.navPosition,"static",label+": game tabs must not inherit absolute positioning");
    assert.equal(result.navDisplay,"flex",label+": game tabs not displayed");
    assert.ok(result.documentWidth<=result.viewport+3,label+": horizontal page overflow "+JSON.stringify(result));
    for(const item of result.articleWidths){
      assert.ok(item.scrollWidth<=item.width+6,label+": layout content overflows "+JSON.stringify(item));
    }
    checks++;
  }catch(error){failures.push(error.message);}
}

try {
  for(const width of [320,375,768,1024,1440]){
    const page=await browser.newPage({viewport:{width,height:850},serviceWorkers:"block"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    for(const game of ["whoami","crocodile","alias","truth"]){
      await page.goto(`${base}/uk/?game=${game}`,{waitUntil:"domcontentloaded"});
      await page.locator(".game-screen-nav").waitFor();
      await check(page,`${width}px ${game}`);
    }
    assert.deepEqual(errors,[],`${width}px runtime errors`);
    await page.close();
  }
  for(const lang of ["uk","en","sv","de","es"]){
    const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
    await page.goto(`${base}/${lang==="en"?"":lang+"/"}?game=truth`,{waitUntil:"domcontentloaded"});
    await page.locator(".game-screen-nav").waitFor();
    await check(page,`390px ${lang}`);
    if(lang==="uk"){
      await page.locator(".td-choice-truth").click();
      const text=await page.locator(".td-card-center h3").innerText();
      await page.reload();
      await page.locator(".td-card-center h3").waitFor();
      assert.equal(await page.locator(".td-card-center h3").innerText(),text,"Opened Truth card must survive reload");
      await page.locator(".game-back").click();
      await page.locator("#games").waitFor();
      assert.ok(!new URL(page.url()).searchParams.has("game"),"Back button must return to catalog");
      await page.goBack();
      await page.locator(".game-screen-nav").waitFor();
      assert.equal(new URL(page.url()).searchParams.get("game"),"truth","Browser Back restores game screen");
      checks+=3;
    }
    await page.close();
  }
  const zoom=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
  await zoom.goto(base+"/de/?game=truth",{waitUntil:"domcontentloaded"});
  await zoom.locator(".game-screen-nav").waitFor();
  await zoom.evaluate(()=>{document.body.style.zoom="200%";});
  await check(zoom,"German Truth or Dare at 200% zoom");
  await zoom.close();
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
else console.log(`Responsive browser smoke tests passed: ${checks} checks.`);
