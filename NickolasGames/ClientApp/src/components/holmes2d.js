import holmesAtlas from "../assets/holmes-pet.png";
import holmesPortrait from "../assets/holmes-closeup-hd.png";

export function createHolmesScene(container,{reduced=false,loop=false,onPhase,onFinish,onFailure}) {
 const stage=document.createElement("div");stage.className="holmes-pet-stage";
 const portrait=document.createElement("img");portrait.className="holmes-hd-portrait";
 portrait.src=holmesPortrait;portrait.alt="";
 const pet=document.createElement("div");pet.className="holmes-original-pet";
 pet.style.backgroundImage=`url(${holmesAtlas})`;
 const ball=document.createElement("div");ball.className="holmes-toy-ball";
 stage.append(ball,portrait,pet);container.append(stage);
 const overlay=container.closest(".holmes-intro");
 let frameId,start=null,previousPhase=-1,disposed=false;
 const smooth=v=>{const p=Math.min(1,Math.max(0,v));return p*p*(3-2*p);};
 const draw=now=>{
  if(disposed)return;start??=now;
  const elapsed=(now-start)/1000,t=reduced?0:elapsed%6;
  const phase=t<2.6?0:t<3.6?1:t<4.8?2:3;
  if(phase!==previousPhase){onPhase(phase);previousPhase=phase;}
  const swatting=t>=2.6;
  let frame=0;
  if(t>=2.6&&t<3.1)frame=1;
  else if(t>=3.1&&t<3.5)frame=3;
  else if(t>=3.5&&t<3.8)frame=1;
  pet.style.backgroundPosition=`${frame/7*100}% ${swatting?30:0}%`;
  pet.style.left="50%";pet.style.transform="translate(-50%,0)";
  const blend=smooth((t-2.3)/.35);
  pet.style.opacity=blend;portrait.style.opacity=1-blend;
  const approach=smooth((t-2.1)/1.2),hit=smooth((t-3.4)/1.4);
  ball.style.left=`${67-22*approach+5*hit}%`;
  ball.style.transform=`translate(-50%,${-90*approach-100*hit}px) rotate(${t*100}deg) scale(${1+hit*55})`;
  ball.style.zIndex=hit>0?4:0;
  stage.style.transform="none";
  const opening=reduced?0:smooth((t-4.8)/1.2);
  if(overlay){overlay.style.clipPath=opening>0?`circle(${150*(1-opening)}% at 50% 45%)`:"none";overlay.dataset.opening=opening>0?"true":"false";}
  stage.dataset.camera="wide";stage.dataset.pose=swatting?"swatting":"playing";
  if((reduced&&elapsed>=1.5)||(!loop&&elapsed>=6)){onFinish();return;}
  frameId=requestAnimationFrame(draw);
 };
 portrait.decode().then(()=>{if(!disposed)frameId=requestAnimationFrame(draw);}).catch(()=>{if(!disposed)onFailure?.();});
 return ()=>{disposed=true;cancelAnimationFrame(frameId);stage.remove();if(overlay){overlay.style.clipPath="";delete overlay.dataset.opening;}};
}
