import {LANGUAGE_PATHS,GAMES,contentPath} from './siteRoutes.js';
import {gameSearchCopy} from '../locales/gameSearchCopy.js';
import {pathLanguage} from '../app/routeParsing.js';
export {LANGUAGE_PATHS};
export const SITE_ORIGIN='https://games.nickolasspace.com';
const SEO={
 uk:{home:'Безкоштовні ігри для компанії',play:'Грати онлайн',extra:'Безкоштовна гра у браузері, без встановлення.',locale:'uk_UA'},
 en:{home:'Free party games with friends',play:'Play online',extra:'Play for free in your browser, no installation needed.',locale:'en_US'},
 sv:{home:'Gratis sällskapsspel med vänner',play:'Spela online',extra:'Spela gratis i webbläsaren utan installation.',locale:'sv_SE'},
 de:{home:'Kostenlose Gesellschaftsspiele mit Freunden',play:'Online spielen',extra:'Kostenlos im Browser spielen, ohne Installation.',locale:'de_DE'},
 es:{home:'Juegos gratis para jugar con amigos',play:'Jugar online',extra:'Juega gratis en el navegador, sin instalación.',locale:'es_ES'}
};
export function initialLanguage(){
 const fromPath=location.pathname==='/'?null:pathLanguage(location.pathname);
 if(fromPath)return fromPath;
 try{const saved=localStorage.getItem('nickolasgames-lang');return LANGUAGE_PATHS[saved]?saved:'en';}catch{return 'en';}
}
export function getPageMetadata(lang,games,privacyTitle,privacyIntro,game=null,privacy=false){
 const c=SEO[lang]||SEO.en;
 const selected=GAMES.includes(game)?games[game]:null;
 const search=selected?gameSearchCopy(lang,game):null;
 const title=privacy?privacyTitle+' | NickolasGames':selected?(search?.[0]||selected.n+' — '+c.play)+' | NickolasGames':c.home+' | NickolasGames';
 const description=privacy?privacyIntro:selected?(search?.[1]||selected.n+': '+selected.d+' '+c.extra):GAMES.map(key=>games[key].n).join(', ')+'. '+c.extra;
 const url=SITE_ORIGIN+contentPath(lang,game,privacy);
 const alternates=Object.fromEntries(Object.keys(LANGUAGE_PATHS).map(code=>[code,SITE_ORIGIN+contentPath(code,game,privacy)]));
 alternates['x-default']=alternates.en;
 return {title,description,url,locale:c.locale,alternates};
}
export function getStructuredData(lang,games,meta,game=null,privacy=false){
 const {title,description,url}=meta;
 const selected=GAMES.includes(game)?game:null;
 const application={'@type':'WebApplication',name:selected?games[selected].n:'NickolasGames',url,applicationCategory:'GameApplication',operatingSystem:'Web browser',isAccessibleForFree:true,inLanguage:lang,description};
 return privacy?{'@context':'https://schema.org','@type':'WebPage',name:title,url,description,inLanguage:lang}:selected?{'@context':'https://schema.org',...application}:{'@context':'https://schema.org','@graph':[application,{'@type':'ItemList',itemListElement:GAMES.map((key,index)=>({'@type':'ListItem',position:index+1,url:SITE_ORIGIN+contentPath(lang,key),name:games[key].n}))}]};
}
export function updateSiteMetadata(lang,games,privacyTitle,privacyIntro,game,privacy=location.pathname.endsWith('/privacy/')){
 const meta=getPageMetadata(lang,games,privacyTitle,privacyIntro,game,privacy);
 const structured=getStructuredData(lang,games,meta,game,privacy);
 let script=document.querySelector('script[data-site-schema]');
 if(!script){script=document.createElement('script');script.type='application/ld+json';script.dataset.siteSchema='';document.head.appendChild(script);}
 script.textContent=JSON.stringify(structured).replace(/</g,'\\u003c');
 document.title=meta.title;
 document.documentElement.lang=lang;
 for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])document.querySelector(selector)?.setAttribute('content',meta.description);
 for(const [selector,value] of [['meta[property="og:title"]',meta.title],['meta[name="twitter:title"]',meta.title],['meta[property="og:url"]',meta.url],['meta[property="og:locale"]',meta.locale]])document.querySelector(selector)?.setAttribute('content',value);
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',meta.url);
 for(const [code,url] of Object.entries(meta.alternates)){
  let link=document.querySelector('link[rel="alternate"][hreflang="'+code+'"]');
  if(!link){link=document.createElement('link');link.rel='alternate';link.hreflang=code;document.head.appendChild(link);}
  link.href=url;
 }
}
