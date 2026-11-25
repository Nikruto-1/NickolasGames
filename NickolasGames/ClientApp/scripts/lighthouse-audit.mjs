import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile,appendFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {GAMES,gamePath} from '../src/utils/siteRoutes.js';
const root=resolve(fileURLToPath(new URL('../../wwwroot/',import.meta.url)));
const output=resolve('lighthouse-reports');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  const file=(await stat(path)).isDirectory()?resolve(path,'index.html'):path;
  const data=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const rows=[];
const cli=process.env.LIGHTHOUSE_CLI;
if(!cli){server.close();throw Error('LIGHTHOUSE_CLI is required');}
try{
 for(const device of ['mobile','desktop']){
  for(const game of ['home',...GAMES]){
   const path=game==='home'?'/':gamePath('en',game);
   const response=await fetch(base+path);
   if(!response.ok)throw Error('Audit route '+path+' returned HTTP '+response.status);
   await response.arrayBuffer();
   const file=resolve(output,device+'-'+game+'.json');
   const args=[cli,base+path,'--output=json','--output-path='+file,'--quiet','--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'];
   if(device==='desktop')args.push('--preset=desktop');
   await new Promise((ok,fail)=>{
    const child=spawn(process.execPath,args,{stdio:'inherit'});
    child.on('error',fail);child.on('exit',code=>code===0?ok():fail(Error('Lighthouse exit '+code+' '+game)));
   });
   const report=JSON.parse(await readFile(file,'utf8'));
   if(report.runtimeError)throw Error(JSON.stringify(report.runtimeError));
   const score=k=>Math.round(report.categories[k].score*100);
   const metric=k=>report.audits[k]?.numericValue??null;
   const row={device,game,performance:score('performance'),accessibility:score('accessibility'),bestPractices:score('best-practices'),seo:score('seo'),lcp:metric('largest-contentful-paint'),cls:metric('cumulative-layout-shift'),tbt:metric('total-blocking-time'),speedIndex:metric('speed-index')};
   rows.push(row);console.log('LIGHTHOUSE_RESULT '+JSON.stringify(row));
   await writeFile(resolve(output,'summary.json'),JSON.stringify(rows,null,2));
  }
 }
}finally{await new Promise(r=>server.close(r));}
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Lighthouse baseline\n\n'+['| Device | Route | Performance | Accessibility | Best practices | SEO | LCP ms | CLS | TBT ms |','|---|---|---:|---:|---:|---:|---:|---:|---:|',...rows.map(r=>'| '+[r.device,r.game,r.performance,r.accessibility,r.bestPractices,r.seo,Math.round(r.lcp),r.cls,Math.round(r.tbt)].join(' | ')+' |')].join('\n')+'\n');
