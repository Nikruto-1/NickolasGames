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
    for(const game of ["whoami","crocodile","alias","truth","checkers"]){
      await page.goto(`${base}/uk/?game=${game}`,{waitUntil:"domcontentloaded"});
      try {
        await page.locator(game === "checkers" ? ".ck-board" : ".game-screen-nav").waitFor({ timeout: 12000 });
      } catch (error) {
        const message = await page.locator("main h1").first().textContent().catch(() => "(no heading)");
        throw new Error(`Game view failed: ${width}px ${game}; page errors: ${errors.join(" | ")}; heading: ${message}; ${error.message}`);
      }
      await check(page,`${width}px ${game}`);
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
