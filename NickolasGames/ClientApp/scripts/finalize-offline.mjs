import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';

const unique=items=>[...new Set(items)].sort();
export function finalizeOfflineBuild(root){
 const read=path=>readFileSync(resolve(root,path));
 const walk=(dir)=>readdirSync(resolve(root,dir),{withFileTypes:true}).flatMap(entry=>{
  const path=join(dir,entry.name).replaceAll('\\','/');
  return entry.isDirectory()?walk(path):entry.isFile()?[path]:[];
 });
 const manifest=JSON.parse(read('.vite/manifest.json'));
 const preliminary=JSON.parse(read('offline-assets.json'));
 const assets=unique(walk('assets'));
 const actual=new Set(assets);
 const startup=new Set();
 const visited=new Set();
 function include(key){
  if(visited.has(key))return;
  visited.add(key);
  const chunk=manifest[key];
  if(!chunk)throw Error('Missing Vite import: '+key);
  if(!actual.has(chunk.file))throw Error('Missing emitted entry: '+chunk.file);
  startup.add(chunk.file);
  for(const child of chunk.imports||[])include(child);
  for(const css of chunk.css||[])startup.add(css);
 }
 const entries=Object.keys(manifest).filter(key=>manifest[key].isEntry);
 if(!entries.length)throw Error('No final Vite entry');
 entries.forEach(include);
 const core=unique(['index.html','manifest.webmanifest','offline-assets.json',
  'icons/holmes-192.png','icons/holmes-512.png','icons/holmes-apple-touch.png',
  ...startup,...assets.filter(path=>path.endsWith('.css'))]);
 const files=unique([...core,...assets]);
 const hash=createHash('sha256');
 hash.update(preliminary.buildId);
 for(const path of files){
  if(path==='offline-assets.json')continue;
  if(!statSync(resolve(root,path)).isFile())throw Error('Missing offline file: '+path);
  hash.update(path);hash.update(read(path));
 }
 const cache='nickolasgames-'+hash.digest('hex').slice(0,16);
 const manifestJson={cache,buildId:preliminary.buildId,files};
 let sw=read('sw.js').toString('utf8');
 const replacements=[
  [/^const CACHE='[^']+';/m,"const CACHE='"+cache+"';"],
  [/^const CORE_URLS=.*?\.map\(path=>/m,'const CORE_URLS='+JSON.stringify(core)+'.map(path=>'],
  [/^const OFFLINE_URLS=.*?\.map\(path=>/m,'const OFFLINE_URLS='+JSON.stringify(files)+'.map(path=>']
 ];
 for(const [pattern,value] of replacements){
  if(!pattern.test(sw))throw Error('Missing service worker marker: '+pattern);
  sw=sw.replace(pattern,()=>value);
 }
 writeFileSync(resolve(root,'offline-assets.json'),JSON.stringify(manifestJson));
 writeFileSync(resolve(root,'sw.js'),sw);
 console.log('Final offline inventory: '+core.length+' startup files, '+files.length+' total files.');
 return {core,files,cache};
}
