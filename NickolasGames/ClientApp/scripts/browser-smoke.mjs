// Build-level responsive smoke test. Run after 'npm run build' with Playwright installed.
import assert from "node:assert/strict";
import { LANGUAGE_PATHS } from "../src/utils/siteRoutes.js";
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
      overflowNodes:[...document.querySelectorAll(".game-screen *")].filter(el=>{
        const rect=el.getBoundingClientRect();
        const style=getComputedStyle(el);
        return rect.right>viewport+2 && style.position!=="absolute" && style.position!=="fixed";
      }).slice(0,14).map(el=>({tag:el.tagName,cls:typeof el.className==="string"?el.className:"",text:(el.textContent||"").trim().slice(0,70),right:Math.round(el.getBoundingClientRect().right),scroll:el.scrollWidth,client:el.clientWidth})),
      articleWidths:[...document.querySelectorAll(".game-screen .wrap,.game-screen .pvg,.game-screen .td-card,.game-screen .alias-word-card")].map(node=>({
        width:node.clientWidth,scrollWidth:node.scrollWidth
      }))
    };
  });
  try {
    assert.ok(result.headerWidth>0,label+": game header not visible");
    assert.ok(result.headerLeft>=-2 && result.headerRight<=result.viewport+2,label+": header extends beyond screen "+JSON.stringify(result));
    assert.equal(result.navPosition,"static",label+": game tabs must not inherit absolute positioning");
    assert.equal(result.navDisplay,label.includes("checkers") ? "none" : "flex",label+": unexpected game tabs visibility");
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
    page.on("console",message=>{ if(message.type()==="error" && message.text().includes("NickolasGames UI error")) errors.push(message.text().slice(0,500)); });
    for(const game of ["whoami","crocodile","alias","truth","checkers","spy"]){
      await page.goto(`${base}/uk/?game=${game}`,{waitUntil:"domcontentloaded"});
      try {
        await page.locator(game === "checkers" ? ".ck-board" : game === "spy" ? ".spy-setup" : ".game-screen-nav").waitFor({ timeout: 12000 });
      } catch (error) {
        const message = await page.locator("main h1").first().textContent().catch(() => "(no heading)");
        throw new Error(`Game view failed: ${width}px ${game}; page errors: ${errors.join(" | ")}; heading: ${message}; ${error.message}`);
      }
      await check(page,`${width}px ${game}`);
      if(width===375 && game!=="checkers"){
        const tooSmall=await page.evaluate(()=>[...document.querySelectorAll(".game-screen .btn,.game-screen .chip,.game-screen .player-remove")].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden"&&el.getBoundingClientRect().height<43.5).map(el=>el.textContent.trim().slice(0,60)));
        assert.deepEqual(tooSmall,[],game+": visible controls should have at least 44px touch targets");
        checks++;
      }

      if (game === "checkers") {
        assert.equal(await page.locator(".ck-cell").count(),64,"Checkers board needs 64 squares");
        assert.equal(await page.locator(".ck-board .ck-piece").count(),24,"Checkers has 24 board pieces");
        await page.locator(".ck-cell[data-cell=\"40\"]").click();
        await page.locator(".ck-cell[data-cell=\"33\"]").click();
        assert.ok(await page.locator(".ck-cell[data-cell=\"33\"] .ck-white").count(),"White cat moves");
        await page.reload();
        await page.locator(".ck-cell[data-cell=\"33\"] .ck-white").waitFor();
        const leaderboard=page.locator(".ck-leaderboard");
        await leaderboard.waitFor();
        assert.equal(await leaderboard.locator(".ck-rank-item").count(),2,"Both teams appear in ranking");
        const geometry=await page.evaluate(()=>{
          const board=document.querySelector(".ck-board-frame").getBoundingClientRect();
          const title=document.querySelector(".game-screen-header").getBoundingClientRect();
          const ranking=document.querySelector(".ck-leaderboard").getBoundingClientRect();
          const controls=document.querySelector(".ck-sidebar").getBoundingClientRect();
          return { left:board.left,top:board.top,bottom:board.bottom,width:board.width,height:board.height,viewport:innerHeight,header: title.height,ranking:{left:ranking.left,right:ranking.right,top:ranking.top},controls:{left:controls.left,right:controls.right,top:controls.top} };
        });
        assert.ok(geometry.top>=0 && geometry.bottom<=geometry.viewport+2,
          `Checkers board must fit viewport at ${width}px: ${JSON.stringify(geometry)}`);
        assert.ok(Math.abs(geometry.width-geometry.height)<=2,"Board frame stays square");
        if(width>=1024){
          assert.ok(geometry.ranking.right<geometry.left && geometry.controls.left>geometry.left+geometry.width,`Desktop columns must be in scoreboard-board-controls order: ${JSON.stringify(geometry)}`);
        }
        if(width===375){
          await page.evaluate(()=>{
            const key="nickolasgames-session-checkers-shared";
            const envelope=JSON.parse(localStorage.getItem(key));
            envelope.state.winner="black";
            envelope.state.turn="white";
            localStorage.setItem(key,JSON.stringify(envelope));
          });
          await page.reload();
          await page.getByRole("dialog").waitFor();
          assert.ok(await page.getByRole("heading",{name:"Чорні котики перемогли!"}).count(),
            "Victory modal must name the winning cats");
          await page.getByRole("button",{name:"Зіграти ще раз"}).click();
          assert.equal(await page.getByRole("dialog").count(),0,"New game closes victory modal");
          assert.equal(await page.locator(".ck-board .ck-piece").count(),24,"New game restores all cats");
          checks+=3;
        }
        checks += 7;
      }
      if(width === 320 && ["whoami","crocodile","alias"].includes(game)){
        const storedGame=game==="crocodile"?"charades":game;
        await page.waitForFunction(name=>Boolean(localStorage.getItem(`nickolasgames-session-${name}-uk`)),
          storedGame,{timeout:12000});
        const legacyMigrated=await page.evaluate(game=>{
          const key=`nickolasgames-session-${game}-uk`;
          const legacy={alias:"nickolasgames-alias-teams-v1-uk",charades:"nickolasgames-charades-v2-uk",whoami:"nickolasgames-whoami-v2-uk"}[game];
          const snapshot=JSON.parse(localStorage.getItem(key) || "null");
          if(!snapshot || !legacy)return false;
          localStorage.setItem(legacy,JSON.stringify(snapshot.state));
          localStorage.removeItem(key);
          return true;
        }, game === "crocodile" ? "charades" : game);
        assert.ok(legacyMigrated,`Missing stored session for ${game}`);
        await page.reload();
        await page.locator(".game-screen-nav").waitFor();
        await page.waitForFunction(name=>Boolean(localStorage.getItem(`nickolasgames-session-${name}-uk`)),
          game === "crocodile" ? "charades" : game,{timeout:12000});
        const hasSession=await page.evaluate(game=>{
          const value=localStorage.getItem(`nickolasgames-session-${game}-uk`);
          return value && JSON.parse(value).schemaVersion === 1;
        }, game === "crocodile" ? "charades" : game);
        assert.ok(hasSession,`Legacy session migration failed for ${game}`);
        checks++;
      }
    }
    assert.deepEqual(errors,[],`${width}px runtime errors`);
    await page.close();
  }
  // Shared preferences must survive reload and leave an active Spy round unchanged.
  {
    const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:"block",reducedMotion:"reduce"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/?game=spy");
    const root=page.locator(".spy-game");
    await root.locator(".spy-setup").waitFor();
    for(const name of ["Анна","Богдан","Віра"]){
      await root.locator("#spy-name").fill(name);await root.locator("form button").click();
    }
    await root.getByRole("button",{name:"Без часу",exact:true}).click();
    await root.locator(".spy-start").click();
    await root.locator(".spy-secret.is-hidden").waitFor();
    const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state);
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared"))?.state.round);
    const before=await state();
    await page.locator(".theme-toggle").click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
    await page.locator(".game-audio-toggle").click();
    assert.equal(await page.locator(".game-audio-toggle").getAttribute("aria-pressed"),"false");
    assert.deepEqual(await state(),before);
    await page.reload();
    await root.locator(".spy-secret.is-hidden").waitFor();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
    assert.equal(await page.locator(".game-audio-toggle").getAttribute("aria-pressed"),"false");
    assert.deepEqual(await state(),before);
    for(const game of ["whoami","crocodile","alias","truth","checkers","spy"]){
      await page.goto(base+"/uk/?game="+game);
      await page.locator(game==="checkers"?".ck-board":game==="spy"?".spy-secret":".game-screen section.pv").waitFor();
      await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
      await check(page,"375px dark "+game);
      assert.equal(await page.locator(".game-audio-toggle").getAttribute("aria-pressed"),"false");
    }
    await page.locator(".theme-toggle").click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="light");
    await page.locator(".game-audio-toggle").click();
    assert.equal(await page.locator(".game-audio-toggle").getAttribute("aria-pressed"),"true");
    assert.deepEqual(await state(),before);
    assert.deepEqual(errors,[]);checks+=8;await page.close();
  }
  // The dark wordmark changes color without a background plate or changes to Holmes.
  {
    const page=await browser.newPage({viewport:{width:462,height:640},serviceWorkers:"block"});
    await page.goto(base+"/uk/");
    const logo=page.locator(".site-logo");
    await logo.waitFor();
    const style=()=>logo.evaluate(node=>{
      const image=node.querySelector("img"),mark=node.querySelector(".site-logo-wordmark");
      const a=getComputedStyle(node),b=getComputedStyle(image),c=getComputedStyle(mark);
      return {background:a.backgroundColor,width:node.offsetWidth,height:node.offsetHeight,
        imageClip:b.clipPath,imageFilter:b.filter,markDisplay:c.display,markColor:c.backgroundColor,
        markClip:c.clipPath,mask:c.maskImage};
    });
    const verifyDark=async()=>{
      const dark=await style();
      assert.equal(dark.background,"rgba(0, 0, 0, 0)");
      assert.equal(dark.markDisplay,"block");
      assert.equal(dark.markColor,"rgb(244, 233, 215)");
      assert.equal(dark.imageFilter,"none");
      assert.equal(dark.imageClip,"inset(0px 67.5% 0px 0px)");
      assert.equal(dark.markClip,"inset(0px 0px 0px 32.5%)");
      assert.ok(dark.mask.includes("holmes-logo"));
      return dark;
    };
    const original=await style();
    assert.equal(original.markDisplay,"none");
    assert.equal(original.imageClip,"none");
    await page.locator(".theme-toggle").click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
    const dark=await verifyDark();
    assert.equal(dark.width,original.width);assert.equal(dark.height,original.height);
    await page.reload();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
    await verifyDark();
    await page.goto(base+"/uk/games/spy/");
    await page.locator(".spy-setup").waitFor();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
    await verifyDark();
    await page.locator(".theme-toggle").click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==="light");
    const light=await style();
    assert.equal(light.markDisplay,"none");
    assert.equal(light.imageClip,"none");
    assert.equal(light.background,"rgba(0, 0, 0, 0)");
    checks+=6;
    await page.close();
  }
  // Spy: private handoff, reload, voting, scores, next round and timer expiry.
  {
    const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:"block"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/?game=spy");
    const root=page.locator(".spy-game");
    const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state);
    await root.locator(".spy-setup").waitFor();
    assert.equal(await root.locator(".spy-start").isDisabled(),true);
    for(const name of ["Анна","Богдан","Віра"]){
      await root.locator("#spy-name").fill(name);
      await root.locator("form button").click();
    }
    await root.getByRole("button",{name:"Без часу",exact:true}).click();
    await root.locator(".spy-start").click();
    await root.locator(".spy-secret.is-hidden").waitFor();
    await root.locator(".spy-wide").click();
    await root.locator(".spy-secret:not(.is-hidden)").waitFor();
    await page.reload();
    await root.locator(".spy-secret.is-hidden").waitFor();
    for(let i=0;i<3;i++){
      await root.locator(".spy-wide").click();
      await root.locator(".spy-secret:not(.is-hidden)").waitFor();
      await root.locator(".spy-wide").click();
    }
    await root.locator(".spy-discussion").waitFor();
    const s=await state();
    await root.getByRole("button",{name:"Голосування",exact:true}).click();
    for(let i=0;i<3;i++){
      const target=i===s.round.spy?(i+1)%3:s.round.spy;
      await root.locator(".spy-candidate").filter({hasText:s.players[target].name}).click();
      await root.locator(".spy-wide").click();
    }
    await root.locator(".spy-result").waitFor();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state.finished);
    assert.equal((await state()).winner,false);
    assert.equal(Object.values((await state()).scores).reduce((a,b)=>a+b,0),2);
    await page.reload();await root.locator(".spy-result").waitFor();
    await root.locator(".spy-wide").click();
    await root.locator(".spy-secret.is-hidden").waitFor();
    await page.waitForFunction(()=>!JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state.finished);
    await page.evaluate(()=>{const key="nickolasgames-session-spy-shared";const envelope=JSON.parse(localStorage.getItem(key));const s=envelope.state;s.step=s.players.length;s.duration=3;s.deadline=Date.now()-1000;localStorage.setItem(key,JSON.stringify(envelope));});
    await page.reload();await root.locator(".spy-candidates").waitFor();
    assert.deepEqual(errors,[],"Spy browser runtime errors");
    checks+=10;
    await page.close();
  }
  // Free Spy: discussion without votes, expiry stays in discussion, fresh deal and reveal.
  {
    const page=await browser.newPage({viewport:{width:320,height:780},serviceWorkers:"block"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/?game=spy");
    const root=page.locator(".spy-game");
    const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state);
    await root.locator(".spy-setup").waitFor();
    for(const name of ["Анна","Богдан","Віра"]){
      await root.locator("#spy-name").fill(name);await root.locator("form button").click();
    }
    await root.getByRole("button",{name:/Вільна гра/}).click();
    await root.getByRole("button",{name:"Без часу",exact:true}).click();
    await root.locator(".spy-start").click();
    async function deal(){
      for(let i=0;i<3;i++){
        await root.locator(".spy-secret.is-hidden").waitFor();
        await root.locator(".spy-wide").click();
        await root.locator(".spy-secret:not(.is-hidden)").waitFor();
        await root.locator(".spy-wide").click();
      }
      await root.locator(".spy-discussion").waitFor();
    }
    await deal();
    const first=await state();
    assert.equal(first.mode,"free");
    assert.equal(await root.locator(".spy-clock").innerText(),"∞");
    assert.equal(await root.getByRole("button",{name:"Голосування",exact:true}).count(),0);
    await check(page,"320px spy free discussion");
    await root.getByRole("button",{name:"Наступний раунд",exact:true}).click();
    await root.locator(".spy-secret.is-hidden").waitFor();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state.roundNumber===2);
    assert.notEqual((await state()).round.location,first.round.location);
    await deal();
    await page.evaluate(()=>{const key="nickolasgames-session-spy-shared";const envelope=JSON.parse(localStorage.getItem(key));const s=envelope.state;s.duration=3;s.deadline=Date.now()-1000;localStorage.setItem(key,JSON.stringify(envelope));});
    await page.reload();
    await root.getByText("Час вийшов — можете продовжити обговорення").waitFor();
    await root.getByRole("button",{name:"Показати шпигуна",exact:true}).click();
    await root.locator(".spy-result").waitFor();
    assert.equal(await root.locator(".spy-roster").count(),0);
    await root.locator(".spy-wide").click();
    await root.locator(".spy-secret.is-hidden").waitFor();
    assert.deepEqual(errors,[],"Free Spy browser runtime errors");
    checks+=8;await page.close();
  }
  // Both Spy guessing methods, correct and incorrect answers, and reload stability.
  for(const method of ["choices","typed"]){
    for(const correct of [true,false]){
      const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:"block"});
      const errors=[];page.on("pageerror",e=>errors.push(e.message));
      await page.goto(base+"/uk/?game=spy");
      const root=page.locator(".spy-game");
      await root.locator(".spy-setup").waitFor();
      for(const name of ["Анна","Богдан","Віра"]){
        await root.locator("#spy-name").fill(name);await root.locator("form button").click();
      }
      await root.getByRole("button",{name:method==="typed"?"Ввести назву":"4 варіанти",exact:true}).click();
      await root.getByRole("button",{name:"Без часу",exact:true}).click();
      await root.locator(".spy-start").click();
      let answer="";
      for(let i=0;i<3;i++){
        await root.locator(".spy-secret.is-hidden").waitFor();
        await root.locator(".spy-wide").click();
        await root.locator(".spy-secret:not(.is-hidden)").waitFor();
        if(await root.locator(".spy-secret.is-civilian").count())answer=await root.locator(".spy-secret h3").innerText();
        await root.locator(".spy-wide").click();
      }
      await root.locator(".spy-discussion").waitFor();
      assert.ok(answer);
      await root.getByRole("button",{name:"Вгадати локацію",exact:true}).click();
      const form=root.locator(".spy-guess-form");
      await form.waitFor();
      assert.equal(await form.locator('button[type="submit"]').isDisabled(),true);
      if(method==="choices"){
        const before=await form.locator(".spy-candidate").allTextContents();
        assert.equal(before.length,4);assert.equal(new Set(before).size,4);assert.ok(before.includes(answer));
        await page.reload();await form.waitFor();
        assert.deepEqual(await form.locator(".spy-candidate").allTextContents(),before);
        await form.getByRole("button",{name:correct?answer:before.find(v=>v!==answer),exact:true}).click();
      }else{
        assert.equal(await form.locator(".spy-candidate").count(),0);
        await form.locator("#spy-guess").fill(correct?"  "+answer.toUpperCase()+"! ":"неправильна відповідь 123");
      }
      await form.locator('button[type="submit"]').click();
      await root.locator(".spy-result").waitFor();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state.finished);
      const s=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state);
      assert.equal(s.guessResult,correct);assert.equal(s.winner,correct);
      await page.reload();await root.locator(".spy-result").waitFor();
      assert.equal(await form.count(),0);
      assert.deepEqual(errors,[]);checks+=8;await page.close();
    }
  }
  // Who Am I: enable the optional timer and verify the active phone layout.
  {
    const page=await browser.newPage({viewport:{width:320,height:700},serviceWorkers:"block"});
    await page.goto(base+"/uk/?game=whoami",{waitUntil:"domcontentloaded"});
    await page.locator("#whoami-name").fill("Timer player");
    await page.locator(".player-add button").first().click();
    await page.locator(".whoami-advanced").first().locator("summary").click();
    await page.locator(".whoami-advanced .only-custom").last().locator("input").check();
    await page.locator(".whoami-start .btn.pri").click();
    await page.locator(".whoami-timer").waitFor();
    await check(page,"320px whoami active timer");
    assert.equal(await page.locator(".whoami-time-readout").innerText(),"1:00");
    const controls=await page.locator(".whoami-timer-actions .btn").evaluateAll(buttons=>
      buttons.map(button=>({height:button.getBoundingClientRect().height,width:button.getBoundingClientRect().width})));
    assert.equal(controls.length,2);
    assert(controls.every(button=>button.height>=44 && button.width>0),"Timer controls must be touch-friendly");
    await page.locator(".whoami-timer-actions .btn").first().click();
    await page.waitForFunction(()=>{
      const time=document.querySelector(".whoami-time-readout")?.textContent;
      return Boolean(time && time!=="1:00");
    },null,{timeout:4000});
    await page.locator(".whoami-timer-actions .btn").first().click();
    await page.locator(".whoami-timer-actions .btn").last().click();
    assert.equal(await page.locator(".whoami-time-readout").innerText(),"1:00","Reset restores the full duration");
    checks+=4;
    await page.close();
  }
  // Verbal Spy: no answer list or field, result confirmed once.
  for(const correct of [true,false]){
    const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:"block"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/?game=spy");
    const root=page.locator(".spy-game");
    await root.locator(".spy-setup").waitFor();
    assert.equal(await root.getByRole("button",{name:"Усно (основний)",exact:true}).getAttribute("aria-pressed"),"true");
    for(const name of ["Анна","Богдан","Віра"]){
      await root.locator("#spy-name").fill(name);await root.locator("form button").click();
    }
    await root.getByRole("button",{name:"Без часу",exact:true}).click();
    await root.locator(".spy-start").click();
    for(let i=0;i<3;i++){
      await root.locator(".spy-secret.is-hidden").waitFor();
      await root.locator(".spy-wide").click();
      await root.locator(".spy-secret:not(.is-hidden)").waitFor();
      await root.locator(".spy-wide").click();
    }
    await root.locator(".spy-discussion").waitFor();
    await root.getByRole("button",{name:"Вгадати локацію",exact:true}).click();
    assert.equal(await root.locator(".spy-guess-form").count(),0);
    assert.equal(await root.locator(".spy-candidate").count(),0);
    const button=root.getByRole("button",{name:correct?"Вгадав":"Не вгадав",exact:true});
    await button.click();
    await root.locator(".spy-result").waitFor();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state.finished);
    const s=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-spy-shared")).state);
    assert.equal(s.guessResult,correct);
    assert.equal(s.winner,correct);
    assert.equal(Object.values(s.scores).reduce((a,b)=>a+b,0),correct?1:2);
    await page.reload();await root.locator(".spy-result").waitFor();
    assert.equal(await root.getByRole("button",{name:"Вгадав",exact:true}).count(),0);
    assert.deepEqual(errors,[]);checks+=7;await page.close();
  }
  // Truth or dare: revealed cards survive category changes and reload without repeats.
  {
    const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:"block"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/?game=truth");
    const root=page.locator(".td-root");
    await root.locator(".td-apply").click();
    await root.locator(".td-choice-truth").click();
    const key="nickolasgames-session-truth-or-dare-shared";
    await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k))?.state.chosen,key);
    const first=await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)).state;return s.queue[s.index];},key);
    await page.reload();
    await root.locator(".td-card.is-revealed").waitFor();
    assert.equal(await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)).state;return s.queue[s.index];},key),first);
    await root.locator(".td-primary").click();
    await root.locator(".td-settings-btn").click();
    await root.locator(".td-category").last().click();
    await root.locator(".td-apply").click();
    await root.locator(".td-confirm-actions .pri").click();
    await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k))?.state.historyCycle===true,key);
    const fresh=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).state,key);
    assert.ok(!fresh.queue.includes(first));
    await page.reload();
    await root.locator(".td-choice-truth").waitFor();
    assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).state.queue,key),fresh.queue);
    assert.deepEqual(errors,[]);checks+=4;await page.close();
  }
  // Complete real winning move: result dialog, ranking, undo, replay and safe restart.
  {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.locator(".ck-board").waitFor();
    await page.evaluate(()=>{
      const key="nickolasgames-session-checkers-shared";
      const stored=JSON.parse(localStorage.getItem(key));
      stored.state={...stored.state,board:Array(64).fill(null),turn:"white",moveNumber:1,forcedFrom:null,
        captured:[],winner:null,draw:false,drawReason:null,matchId:"smoke-undo-win",positionCounts:{}};
      stored.state.board[17]={side:"white",king:false};
      stored.state.board[10]={side:"black",king:false};
      localStorage.setItem(key,JSON.stringify(stored));
    });
    await page.reload();
    await page.locator('.ck-cell[data-cell="17"]').click();
    await page.locator('.ck-cell[data-cell="3"]').click();
    await page.getByRole("dialog").waitFor();
    const wins=async()=>page.evaluate(()=>{
      const raw=localStorage.getItem("nickolasgames-session-checkers-standings-shared");
      return raw?JSON.parse(raw).state.white:0;
    });
    assert.equal(await wins(),1);
    await page.getByRole("button",{name:"Переглянути дошку"}).click();
    await page.getByRole("button",{name:"Скасувати хід"}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-standings-shared")).state.white===0);
    assert.equal(await wins(),0,"Undo must reverse win");
    await page.locator('.ck-cell[data-cell="17"]').click();
    await page.locator('.ck-cell[data-cell="3"]').click();
    await page.getByRole("dialog").waitFor();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-standings-shared")).state.white===1);
    assert.equal(await wins(),1,"Winning again counts exactly once");
    await page.getByRole("button",{name:"Зіграти ще раз"}).click();
    assert.equal(await page.getByRole("dialog").count(),0);
    assert.equal(await page.locator(".ck-board .ck-piece").count(),24,"Restart restores standard setup");
    checks+=8;
    await page.close();
  }
  // Restored draws display a draw-specific dialog rather than falsely announcing a winner.
  {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.locator(".ck-board").waitFor();
    await page.evaluate(()=>{
      const key="nickolasgames-session-checkers-shared",snapshot=JSON.parse(localStorage.getItem(key));
      snapshot.state.draw=true;
      snapshot.state.drawReason="repetition";
      snapshot.state.winner=null;
      localStorage.setItem(key,JSON.stringify(snapshot));
    });
    await page.reload();
    await page.getByRole("dialog").waitFor();
    assert.equal(await page.getByRole("dialog").getByRole("heading",{name:"Нічия!",exact:true}).count(),1);
    assert.equal(await page.getByText("Позиція повторилася тричі.").count(),1);
    await page.getByRole("button",{name:"Зіграти ще раз"}).click();
    assert.equal(await page.getByRole("dialog").count(),0);
    checks+=3;
    await page.close();
  }
  // Durable checkers timeline and board orientation, even across a fresh page load.
  {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.locator(".ck-board").waitFor();
    const lazyModules=await page.evaluate(()=>performance.getEntriesByType("resource")
      .map(entry=>entry.name).filter(name=>name.includes("/assets/")&&name.endsWith(".js")));
    assert.equal(lazyModules.some(name=>/WhoAmIGame-|AliasGame-|CharadesGame-|TruthOrDareGame-/.test(name)),
      false,"Only active game JS should load at first visit");
    await page.locator('.ck-cell[data-cell="40"]').click();
    await page.locator('.ck-cell[data-cell="33"]').click();
    await page.getByRole("button",{name:"Повернути дошку"}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.flipped===true);
    await page.reload();
    await page.locator(".ck-board").waitFor();
    assert.equal(await page.locator(".ck-cell").first().getAttribute("data-cell"),"63");
    await page.getByRole("button",{name:"Скасувати хід"}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.moveNumber===1);
    const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state);
    assert.equal(restored.board[40].side,"white");
    assert.equal(restored.history.length,0);
    assert.equal(restored.flipped,true);
    await page.locator('.ck-cell[data-cell="40"]').click();
    await page.locator('.ck-cell[data-cell="33"]').click();
    page.once("dialog",dialog=>dialog.accept());
    await page.getByRole("button",{name:"Нова партія"}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.moveNumber===1);
    const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state);
    assert.equal(fresh.moveNumber,1);
    assert.deepEqual(fresh.history,[],"A new match must not reuse the old party history");
    assert.deepEqual(errors,[],"Persisted checkers timeline browser runtime errors");
    checks+=8;
    await page.close();
  }
  // Human vs. computer: browser-only opponent, two difficulties, and durable mode.
  for (const level of ["easy", "medium"]) {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.getByRole("button",{name:"Проти комп’ютера"}).click();
    const selector=page.locator(".ck-bot-difficulty select");
    await selector.selectOption(level);
    await page.locator(".ck-cell[data-cell=\"40\"]").click();
    await page.locator(".ck-cell[data-cell=\"33\"]").click();
    await page.waitForFunction(()=>{
      const raw=localStorage.getItem("nickolasgames-session-checkers-shared");
      const state=raw && JSON.parse(raw).state;
      return state?.turn==="white" && state?.moveNumber>=3;
    },null,{timeout:12000});
    const saved=await page.evaluate(()=>{
      const board=JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state;
      const config=JSON.parse(localStorage.getItem("nickolasgames-session-checkers-mode-shared")).state;
      return {board,config};
    });
    assert.equal(saved.config.mode,"bot");
    assert.equal(saved.config.level,level);
    assert.equal(saved.board.turn,"white");
    assert.equal(saved.board.board.filter(p=>p?.side==="black").length,12);
    await page.getByRole("button",{name:"Скасувати хід"}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.moveNumber===1);
    const undone=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state);
    assert.equal(undone.turn,"white");
    assert.equal(undone.moveNumber,1,"undo returns to player's previous complete turn");
    await page.reload();
    await page.getByRole("button",{name:"Проти комп’ютера"}).waitFor();
    assert.equal(await page.locator(".ck-bot-difficulty select").inputValue(),level);
    await page.close();
    assert.deepEqual(errors,[],`Bot ${level} runtime errors`);
    checks+=7;
  }
  // First move selection: black can begin, and flipping must not change turn.
  {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    const first=page.getByRole("group",{name:"Хто ходить першим?"});
    await first.getByRole("button",{name:"Чорні"}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.turn),"black");
    await page.locator('.ck-cell[data-cell="17"]').click();
    await page.locator('.ck-cell[data-cell="24"]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.turn==="white");
    await page.getByRole("button",{name:"Повернути дошку"}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state.turn),"white");
    page.once("dialog",dialog=>dialog.accept());
    await first.getByRole("button",{name:/Жереб/}).click();
    await page.waitForFunction(()=>document.querySelector(".ck-draw-outcome")?.textContent.includes("Першими ходять:"));
    const game=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-shared")).state);
    assert.ok(["white","black"].includes(game.turn));
    assert.equal(game.moveNumber,1);
    assert.equal(game.startingSide,game.turn);
    await page.reload();
    await page.locator(".ck-board").waitFor();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-mode-shared")).state);
    assert.equal(saved.starter,"random");
    assert.deepEqual(errors,[],"First-turn browser runtime errors");
    checks+=7;
    await page.close();
  }
  // When the human picks black, the white computer must play the opening turn.
  {
    const page=await browser.newPage({viewport:{width:1024,height:850},serviceWorkers:"block"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.getByRole("button",{name:"Проти комп’ютера"}).click();
    const myPieces=page.getByRole("group",{name:"Мої фігурки"});
    await myPieces.getByRole("button",{name:"Чорні"}).click();
    await page.waitForFunction(()=>{
      const raw=localStorage.getItem("nickolasgames-session-checkers-shared");
      const state=raw && JSON.parse(raw).state;
      return state?.turn==="black" && state?.moveNumber>=2;
    },null,{timeout:12000});
    assert.equal(await page.getByText("Ви (чорні)").count(),1);
    assert.equal(await page.getByText("Комп’ютер (білі)").count(),1);
    const settings=await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-checkers-mode-shared")).state);
    assert.equal(settings.humanSide,"black");
    await page.reload();
    await page.locator(".ck-board").waitFor();
    assert.equal(await page.getByRole("group",{name:"Мої фігурки"}).getByRole("button",{name:"Чорні"}).getAttribute("aria-pressed"),"true");
    assert.deepEqual(errors,[],"Black human browser runtime errors");
    checks+=6;
    await page.close();
  }
  // Screenshot-sized desktop: increase board size without clipping below the fold.
  for (const width of [1100, 1536]) {
    const page = await browser.newPage({viewport:{width,height:700},serviceWorkers:"block"});
    await page.goto(base+"/uk/?game=checkers",{waitUntil:"domcontentloaded"});
    await page.locator(".ck-board").waitFor();
    const rects = await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      return {board:rect(".ck-board-frame"),left:rect(".ck-leaderboard"),right:rect(".ck-sidebar"),viewport:innerHeight};
    });
    assert.ok(rects.board.width>=425,`Checkers board should be larger at ${width}x700: ${JSON.stringify(rects)}`);
    assert.ok(rects.board.top>=0 && rects.board.bottom<=rects.viewport+2,`Enlarged board must fit height: ${JSON.stringify(rects)}`);
    assert.ok(rects.left.right<rects.board.left && rects.right.left>rects.board.right,`Keep the 3 desktop columns: ${JSON.stringify(rects)}`);
    checks+=3;
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
      await page.evaluate(()=>{
        const key="nickolasgames-session-truth-or-dare-shared";
        const snapshot=JSON.parse(localStorage.getItem(key));
        localStorage.setItem("nickolasgames-truth-dare-v2",JSON.stringify(snapshot.state));
        localStorage.removeItem(key);
      });
      await page.reload();
      await page.locator(".td-card-center h3").waitFor();
      assert.equal(await page.locator(".td-card-center h3").innerText(),text,"Legacy Truth or Dare card must migrate unchanged");
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("nickolasgames-session-truth-or-dare-shared")).schemaVersion),1);
      checks += 2;
      await page.locator(".game-back").click();
      await page.locator("#games").waitFor();
      assert.ok(!new URL(page.url()).searchParams.has("game"),"Back button must return to catalog");
      await page.goBack();
      await page.locator(".game-screen-nav").waitFor();
      assert.ok(new URL(page.url()).pathname.endsWith("/games/truth/"),"Browser Back restores game screen");
      checks+=3;
    }
    await page.close();
  }
  // Player guides remain available after React replaces the static HTML.
  {
    const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
    await page.goto(base+"/uk/");
    await page.locator("main .player-guide h2").waitFor();
    assert.equal(await page.locator(".player-guide h2").innerText(),"Ігри для друзів на одному пристрої");
    await page.goto(base+"/uk/games/crocodile/");
    await page.locator(".game-screen .player-guide").waitFor();
    assert.equal(await page.locator(".player-guide h2").innerText(),"Як грати");
    assert.ok((await page.locator(".player-guide").innerText()).includes("машина часу"));
    checks+=3;await page.close();
  }
  // FAQ content and related links survive React rendering in every locale.
  {
    const {gameFaq}=await import('../src/locales/gameFaq.js');
    const {GAMES,gamePath}=await import('../src/utils/siteRoutes.js');
    const page=await browser.newPage({viewport:{width:320,height:844},serviceWorkers:"block"});
    for(const lang of ['en','uk','sv','de','es']){
      for(const game of GAMES){
        await page.goto(base+gamePath(lang,game));
        const section=page.locator('.game-screen .game-faq');
        await section.waitFor();
        const faq=gameFaq(lang,game);
        assert.equal(await section.locator('h2').first().innerText(),faq.heading);
        assert.equal(await section.locator('.related-games').evaluate(el=>getComputedStyle(el).position),'static');
        await page.locator('.theme-toggle').click();
        await page.locator('.theme-toggle').click();
        assert.deepEqual(await section.locator('summary').allTextContents(),faq.items.map(([q])=>q));
        const first=section.locator('details').first();
        await first.locator('summary').click();
        assert.equal(await first.locator('p').innerText(),faq.items[0][1]);
        assert.equal(await first.getAttribute('open'),'');
        assert.deepEqual(await section.locator('.related-games a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),faq.related.map(({key})=>gamePath(lang,key)));
        checks+=8;
      }
    }
    await page.goto(base+'/uk/games/crocodile/');
    await page.locator('.game-screen .related-games a[href="/uk/games/alias/"]').click();
    await page.locator('.game-screen[data-game="alias"] .game-faq').waitFor();
    assert.equal(new URL(page.url()).pathname,'/uk/games/alias/');
    checks++;await page.close();
  }
  // Navigation and structured data remain synchronized without reloads.
  {
    const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
    const schema=()=>page.locator('script[data-site-schema]').evaluate(el=>JSON.parse(el.textContent));
    const canonical=()=>page.locator('link[rel="canonical"]').getAttribute('href');
    await page.goto(base+'/uk/games/spy/');
    await page.locator('.game-screen-nav a[href="/uk/games/alias/"]').click();
    await page.waitForURL('**/uk/games/alias/');
    await page.waitForFunction(()=>JSON.parse(document.querySelector('script[data-site-schema]').textContent).url.endsWith('/uk/games/alias/'));
    assert.equal((await schema()).url,await canonical());
    await page.locator('.game-back').click();
    await page.locator('#games').waitFor();
    await page.waitForFunction(()=>JSON.parse(document.querySelector('script[data-site-schema]').textContent)['@graph']?.length===2);
    await page.locator('a.footer-command[href="/uk/privacy/"]').click();
    await page.locator('.privacy-dialog[open]').waitFor();
    const policyTab=page.locator('#privacy-policy-tab');
    const dataTab=page.locator('#privacy-data-tab');
    await policyTab.focus();
    assert.equal(await policyTab.getAttribute('tabindex'),'0');
    assert.equal(await dataTab.getAttribute('tabindex'),'-1');
    await policyTab.press('ArrowRight');
    await page.waitForFunction(()=>document.activeElement?.id==='privacy-data-tab');
    assert.equal(await dataTab.getAttribute('aria-selected'),'true');
    assert.equal(await policyTab.getAttribute('tabindex'),'-1');
    await dataTab.press('Home');
    await page.waitForFunction(()=>document.activeElement?.id==='privacy-policy-tab');
    assert.equal(await policyTab.getAttribute('aria-selected'),'true');
    checks+=5;
    await page.waitForFunction(()=>JSON.parse(document.querySelector('script[data-site-schema]').textContent)['@type']==='WebPage');
    assert.equal((await schema()).url,await canonical());
    await page.locator('.privacy-dialog .icon-button').click();
    await page.waitForURL('**/uk/');
    await page.waitForFunction(()=>JSON.parse(document.querySelector('script[data-site-schema]').textContent)['@graph']?.length===2);
    await page.goForward();
    await page.locator('.privacy-dialog[open]').waitFor();
    await page.goBack();
    await page.locator('.privacy-dialog[open]').waitFor({state:'hidden'});
    checks+=5;await page.close();
  }
  // Static SEO deep links, legacy query migration and language switching.
  {
    const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
    await page.goto(base+"/uk/?game=spy&utm_source=test");
    await page.locator('.game-screen[data-game="spy"]').waitFor();
    assert.equal(new URL(page.url()).pathname,"/uk/games/spy/");
    assert.equal(new URL(page.url()).searchParams.get("utm_source"),"test");
    await page.locator(".lang-btn").filter({hasText:"DE"}).click();
    await page.waitForURL("**/de/games/spy/?utm_source=test");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),"https://games.nickolasspace.com/de/games/spy/");
    await page.reload();
    await page.locator('.game-screen[data-game="spy"]').waitFor();
    await page.locator(".game-back").click();
    await page.locator("#games").waitFor();
    const link=page.locator('#games a[href="/de/games/alias/"]');
    await link.click();
    await page.locator('.game-screen[data-game="alias"]').waitFor();
    assert.equal(new URL(page.url()).pathname,"/de/games/alias/");
    checks+=5;
    await page.close();
  }
  // Local library and history: exercise real UI, persistence and deletion.
  {
    const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/uk/");
    const library=page.locator("#custom-library");
    await library.locator("summary").click();
    await library.locator("form input").fill("Тестовий набір");
    await library.locator("textarea").nth(0).fill("Тестова картка");
    await library.locator("form button[type=submit], form button:not([type])").click();
    await library.locator(".custom-library-list li").filter({hasText:"Тестовий набір"}).waitFor();
    await page.goto(base+"/uk/?game=whoami");
    await page.locator("#whoami-category").waitFor();
    assert.ok(await page.locator("#whoami-category option").allTextContents().then(x=>x.includes("★ Тестовий набір")));
    await page.evaluate(()=>localStorage.setItem("nickolasgames-results-v1",JSON.stringify([{id:"smoke",game:"checkers",at:Date.now(),outcome:"draw",rows:[{name:"@white",score:0},{name:"@black",score:0}]}])));
    await page.goto(base+"/uk/");
    const results=page.locator("#results-history");
    await results.locator("summary").click();
    await results.locator("select").selectOption("checkers");
    assert.equal(await results.locator("li").count(),1);
    await results.locator("li button").click();
    assert.equal(await results.locator("li").count(),0);
    await page.reload();
    await results.locator("summary").click();
    assert.equal(await results.locator("li").count(),0);
    assert.deepEqual(errors,[]);checks+=5;await page.close();
  }
  // Static production must not send player data or contact a backend/third party.
  {
    const context=await browser.newContext({serviceWorkers:"block"});
    const unexpected=[];
    const sentinel="NG_PRIVATE_SMOKE_7b43d";
    try {
      await context.route("**/*",async route=>{
        const request=route.request(),url=new URL(request.url());
        if(url.origin!==base || !["GET","HEAD"].includes(request.method()) ||
           /^\/(api|hubs)(\/|$)/.test(url.pathname) ||
           request.url().includes(sentinel) || (request.postData()||"").includes(sentinel)){
          unexpected.push({method:request.method(),origin:url.origin,path:url.pathname});
          await route.abort();
        }else await route.continue();
      });
      const page=await context.newPage();
      page.on("websocket",socket=>unexpected.push({websocket:new URL(socket.url()).origin}));
      await page.goto(base+"/uk/");
      const library=page.locator("#custom-library");
      await library.locator("summary").click();
      await library.locator("form input").fill(sentinel);
      await library.locator("textarea").nth(0).fill(sentinel);
      await library.locator("form button[type=submit], form button:not([type])").click();
      await library.locator(".custom-library-list li").filter({hasText:sentinel}).waitFor();
      for(const game of ["whoami","crocodile","alias","truth","checkers","spy"]){
        await page.goto(base+"/uk/games/"+game+"/");
        await page.locator(game==="checkers"?".ck-board":game==="spy"?".spy-setup":".game-faq").waitFor();
      }
      await page.goto(base+"/uk/privacy/");
      await page.locator(".privacy-dialog[open]").waitFor();
      await page.locator("#privacy-data-tab").click();
      assert.ok((await page.locator(".privacy-records").innerText()).includes(sentinel));
      assert.deepEqual(unexpected,[],"Unexpected network activity: "+JSON.stringify(unexpected));
      checks++;
    } finally {await context.close();}
  }
  // Real service worker: download once, then open each lazy game with networking disabled.
  {
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"allow"});
    const page=await context.newPage();
    try {
      await page.goto(base+"/uk/");
      const install=page.locator(".app-status-more");
      for(const width of [320,390,768]){
        await page.setViewportSize({width,height:844});
        const nav=await page.locator(".app-shell > nav").boundingBox();
        const status=await page.locator(".app-status").boundingBox();
        assert.ok(nav && status && status.y>=nav.y+nav.height-1,`Installation panel must not overlap navigation at ${width}px`);
        await install.click();
        assert.ok((await page.locator("#app-install-details").innerText()).includes("Safari"));
        await install.click();
        checks+=2;
      }
      await page.setViewportSize({width:390,height:844});
      await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller),null,{timeout:30000});
      const download=page.locator("#offline-download");
      const button=download.locator("button");
      await page.waitForFunction(()=>{
        const button=document.querySelector("#offline-download button");
        return button&&(!button.disabled||button.textContent==="Усі ресурси ігор збережено");
      },null,{timeout:30000});
      if(await button.isEnabled())await button.click();
      await page.waitForFunction(()=>{
        const section=document.querySelector("#offline-download");
        return section?.querySelector("button")?.textContent==="Усі ресурси ігор збережено"||section?.querySelector("[data-offline-error]");
      },null,{timeout:90000});
      const failure=await download.locator("[data-offline-error]").evaluateAll(nodes=>nodes.map(node=>({reason:node.dataset.offlineError,file:node.dataset.offlineFile})));
      assert.deepEqual(failure,[],"Offline download failed: "+JSON.stringify(failure));
      await download.getByRole("button",{name:"Усі ресурси ігор збережено",exact:true}).waitFor();
      await context.setOffline(true);
      for(const game of ["whoami","crocodile","alias","truth","checkers","spy"]){
        await page.goto(base+"/uk/games/"+game+"/");
        await page.locator(game==="checkers"?".ck-board":game==="spy"?".spy-setup":".game-screen-nav").waitFor({timeout:15000});
        await check(page,"390px offline "+game);
      }
      await page.goto(base+"/uk/?game=truth");
      await page.locator(".td-choice-truth").click();
      const card=await page.locator(".td-card-center h3").innerText();
      await page.reload();
      assert.equal(await page.locator(".td-card-center h3").innerText(),card,"Offline reload preserves opened card");
      checks+=3;
    } finally {await context.close();}
  }
  // Editorial player reviews: all five locales, mobile/desktop, motion and theme.
  {
    for(const lang of ['uk','en','sv','de','es']){
      const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
      try{
        const response=await page.goto(base+LANGUAGE_PATHS[lang]);
        assert.equal(response?.status(),200,`Review page ${lang} must exist`);
        await page.waitForFunction(expected=>document.documentElement.lang===expected,lang);
        const section=page.locator('.player-reviews');
        await section.waitFor();
        assert.equal(await section.locator('.review-group:not(.review-clone) .review-card').count(),17);
        assert.ok(await section.locator('.review-editorial').isVisible());
        assert.ok((await section.locator('.review-group:not(.review-clone) .review-card').nth(1).innerText()).includes('🇺🇦'));
        assert.equal(await section.locator('.review-group:not(.review-clone) .review-text').count(),17);
        assert.ok((await section.locator('.review-group:not(.review-clone) .review-text').allTextContents()).every(s=>s.trim().length>35));
        assert.equal(await section.locator('.review-clone').isVisible(),false);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3));
        assert.equal(await section.locator('.review-track').evaluate(el=>getComputedStyle(el).animationName),'none');
        checks+=8;
      }finally{await page.close();}
    }
    const page=await browser.newPage({viewport:{width:1280,height:850},serviceWorkers:'block',reducedMotion:'no-preference'});
    try{
      const response=await page.goto(base+LANGUAGE_PATHS.en);
      assert.equal(response?.status(),200,'English home must exist');
      const section=page.locator('.player-reviews');
      await section.waitFor();
      const track=section.locator('.review-track');
      assert.equal(await track.evaluate(el=>getComputedStyle(el).animationName),'review-slide');
      const viewport=section.locator('.review-viewport');
      await section.locator('.review-toggle').focus();
      await page.keyboard.press('Space');
      assert.equal(await track.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
      await page.keyboard.press('Space');
      assert.equal(await viewport.evaluate(el=>getComputedStyle(el).overflowX),'hidden');
      await viewport.scrollIntoViewIfNeeded();
      const bounds=await viewport.boundingBox();
      await page.mouse.move(bounds.x+200,bounds.y+50);
      await page.mouse.down();
      await viewport.evaluate(el=>{if(!el.classList.contains('review-dragging'))throw Error('drag did not begin');});
      const time=()=>track.evaluate(el=>el.getAnimations()[0].currentTime);
      const before=await time();
      await page.mouse.move(bounds.x+120,bounds.y+50,{steps:4});
      const after=await time();
      assert.ok(Math.abs(after-before)>100,'Drag must change animation position');
      await page.mouse.up();
      await page.mouse.move(1,1);
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('.review-track')).animationPlayState==='running');
      if(await page.evaluate(()=>document.documentElement.dataset.theme)!=='dark')await page.locator('.theme-toggle').click();
      await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
      assert.equal(await section.locator('.review-card').first().evaluate(el=>getComputedStyle(el).color),await page.evaluate(()=>{const probe=document.createElement('span');probe.style.color='var(--fg)';document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color;}));
      checks+=6;
    }finally{await page.close();}
    // Emulated touch: hold, swipe and release without a persistent manual state.
    const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',reducedMotion:'no-preference'});
    try{
      const page=await touch.newPage();
      await page.goto(base+LANGUAGE_PATHS.uk);
      const viewport=page.locator('.review-viewport');
      await viewport.waitFor();
      await viewport.scrollIntoViewIfNeeded();
      const bounds=await viewport.boundingBox();
      const client=await touch.newCDPSession(page);
      const x=Math.round(bounds.x+bounds.width*.65),y=Math.round(bounds.y+Math.min(50,bounds.height/2));
      const send=(type,touchPoints)=>client.send('Input.dispatchTouchEvent',{type,touchPoints});
      await send('touchStart',[{x,y}]);
      await page.waitForFunction(()=>document.querySelector('.review-viewport').classList.contains('review-dragging')&&getComputedStyle(document.querySelector('.review-track')).animationPlayState==='paused');
      const time=()=>page.locator('.review-track').evaluate(el=>el.getAnimations()[0].currentTime);
      const before=await time();
      await send('touchMove',[{x:x-85,y}]);
      await page.waitForFunction(initial=>Math.abs(document.querySelector('.review-track').getAnimations()[0].currentTime-initial)>100,before);
      await send('touchEnd',[]);
      await page.waitForFunction(()=>!document.querySelector('.review-viewport').classList.contains('review-dragging')&&getComputedStyle(document.querySelector('.review-track')).animationPlayState==='running');
      assert.equal(await viewport.evaluate(el=>getComputedStyle(el).overflowX),'hidden');
      checks+=3;
    }finally{await touch.close();}
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
