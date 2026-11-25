import {existsSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const script=fileURLToPath(new URL('./scripts/optimize-media.py',import.meta.url));
const logo=fileURLToPath(new URL('./src/assets/holmes-logo.generated.webp',import.meta.url));
const generated=fileURLToPath(new URL('./src/assets/holmes-lying-hero.generated.webp',import.meta.url));

// CI requires the optimized asset. Local builds without Python/Pillow keep the original.
export function optimizedMediaPlugin(){
 let ready=false;
 return {name:'nickolasgames-optimized-media',apply:'build',enforce:'pre',
  buildStart(){
   rmSync(generated,{force:true});rmSync(logo,{force:true});
   const python=process.env.NICKOLAS_PYTHON||'python3';
   const result=spawnSync(python,[script],{encoding:'utf8'});
   ready=result.status===0&&existsSync(generated)&&existsSync(logo);
   if(ready){console.log(result.stdout.trim());return;}
   rmSync(generated,{force:true});rmSync(logo,{force:true});
   const reason=result.stderr?.trim()||result.error?.message||'WebP generation failed';
   if(process.env.NICKOLAS_REQUIRE_MEDIA_OPTIMIZATION==='1')this.error(reason);
   else this.warn('Original hero PNG retained: '+reason);
  },
  resolveId(source){
   if(ready&&source==='../assets/holmes-lying-hero.png')return generated;
   if(ready&&source==='../assets/holmes-logo.webp')return logo;
   return null;
  }
 };
}
