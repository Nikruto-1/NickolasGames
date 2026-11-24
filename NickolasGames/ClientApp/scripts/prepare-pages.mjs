import { finalizeOfflineBuild } from './finalize-offline.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY } from '../src/locales/index.js';
import { PRIVACY_COPY } from '../src/locales/privacy.js';
import { LANGUAGE_PATHS, SITE_ORIGIN, getPageMetadata } from '../src/utils/siteMetadata.js';
import { GAMES, contentPath, gamePath } from '../src/utils/siteRoutes.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../wwwroot');
const template = readFileSync(resolve(root, 'index.html'), 'utf8').replace(/\r\n?/g, '\n');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const image = SITE_ORIGIN + '/icons/holmes-512.png';
const urls = [];
for (const [lang,path] of Object.entries(LANGUAGE_PATHS)) {
 for (const page of [null,...GAMES,'privacy']) {
  const privacy=page==='privacy';
  const game=privacy?null:page;
  const policy=PRIVACY_COPY[lang];
  const games=COPY[lang].games;
  const {url,title,description,locale,alternates}=getPageMetadata(lang,games,policy.title,policy.intro,game,privacy);
  const pagePath=contentPath(lang,game,privacy);
  const alternateLinks=Object.entries(alternates).map(([code,href])=>'<link rel="alternate" hreflang="'+code+'" href="'+href+'" />').join('\n');
  let html = template.replace(/<html lang="[^"]*">/,'<html lang="'+lang+'">')
   .replace(/<title>.*?<\/title>/,'<title>'+escape(title)+'</title>')
   .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escape(description)+'" />')
   .replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+url+'" />')
   .replace(/<meta property="og:(title|description|url|locale)"[^>]*>/g,(_,key)=>'<meta property="og:'+key+'" content="'+escape({title,description,url,locale}[key])+'" />')
   .replace(/<meta name="twitter:(title|description|card)"[^>]*>/g,(_,key)=>'<meta name="twitter:'+key+'" content="'+escape({title,description,card:'summary'}[key])+'" />')
   .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
  const listing=GAMES.map(key=>'<section><h2><a href="'+gamePath(lang,key)+'">'+escape(games[key].n)+'</a></h2><p>'+escape(games[key].d)+'</p></section>').join('');
  const content=privacy
   ? '<p>'+escape(policy.intro)+'</p>'+policy.sections.map(([heading,text])=>'<section><h2>'+escape(heading)+'</h2><p>'+escape(text)+'</p></section>').join('')
   : game?'<p>'+escape(description)+'</p><p>'+escape(games[game].p)+' · '+escape(games[game].t)+'</p>'+listing
   : '<p>'+escape(COPY[lang].heroText)+'</p>'+listing;
  html=html.replace('<h1>NickolasGames</h1>','<h1>'+escape(privacy?policy.title:game?games[game].n:title.split(' | ')[0])+'</h1>');
  html=html.replace(/<div class="seo-content">[\s\S]*?<\/div>/,'<div class="seo-content">'+content+'<p><a href="'+path+'">NickolasGames</a> · <a href="'+path+'privacy/">'+escape(policy.title)+'</a></p></div>');
  const application={'@type':'WebApplication',name:game?games[game].n:'NickolasGames',url,applicationCategory:'GameApplication',operatingSystem:'Web browser',isAccessibleForFree:true,inLanguage:lang,description};
  const structured=privacy?{'@context':'https://schema.org','@type':'WebPage',name:title,url,description,inLanguage:lang}:game?{'@context':'https://schema.org',...application}:{'@context':'https://schema.org','@graph':[application,{'@type':'ItemList',itemListElement:GAMES.map((key,index)=>({'@type':'ListItem',position:index+1,url:SITE_ORIGIN+gamePath(lang,key),name:games[key].n}))}]};
  html=html.replace('</head>',alternateLinks+'\n<meta property="og:image" content="'+image+'" />\n<meta property="og:image:alt" content="NickolasGames" />\n<script type="application/ld+json">'+json(structured)+'</script>\n</head>');
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
   .map(match=>"'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
  const csp = "default-src 'self'; script-src 'self' "+hashes.join(' ')+"; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
  html = html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+escape(csp)+'" />');
  const destination = resolve(root, '.'+pagePath, 'index.html');
  mkdirSync(dirname(destination),{recursive:true});
  writeFileSync(destination,html);
  urls.push(url);
 }
}
writeFileSync(resolve(root,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n');
writeFileSync(resolve(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+url+'</loc></url>').join('')+'</urlset>\n');

const notFound = `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,follow" />
  <meta name="theme-color" content="#f5efe3" />
  <link rel="icon" href="/icons/holmes-192.png" />
  <title>404 — Сторінку не знайдено | NickolasGames</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:#f5efe3;color:#292724;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
    main{min-height:100svh;display:grid;place-items:center;padding:24px}
    article{width:min(100%,640px);padding:clamp(26px,6vw,54px);border:1px solid #d9cdbb;background:#fcf9f3;border-radius:16px}
    .brand{font-weight:800;letter-spacing:-.025em}
    .code{margin:42px 0 12px;color:#805d31;font-size:13px;font-weight:800;letter-spacing:.1em}
    h1{margin:0;font-size:clamp(34px,7vw,54px);line-height:1.12;letter-spacing:-.045em}
    p{font-size:17px;line-height:1.6;max-width:49ch;color:#685f53}
    .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:29px}
    a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #c6ae8a;border-radius:10px;min-height:48px;padding:12px 18px;color:#292724;font-weight:700}
    a:first-child{background:#b78b4f;border-color:#b78b4f}
    a:hover{border-color:#6f4f2c}
    a:focus-visible{outline:3px solid #805d31;outline-offset:3px}
    @media(max-width:420px){.actions a{flex:1 1 100%}}
  </style>
</head>
<body>
  <main><article>
    <span class="brand">NickolasGames</span>
    <p class="code">ПОМИЛКА 404</p>
    <h1>Холмс не знайшов цю сторінку</h1>
    <p>Схоже, посилання неправильне або сторінку перемістили. Повернися до ігор — там на тебе вже чекає наступний раунд.</p>
    <div class="actions"><a id="notfound-home" href="/uk/">До ігор</a><a id="notfound-lang" href="/">English</a></div>
  </article></main>
  <script>
    (function () {
      var messages = {
        uk:{code:"ПОМИЛКА 404",title:"Холмс не знайшов цю сторінку",text:"Схоже, посилання неправильне або сторінку перемістили. Повернися до ігор — там на тебе вже чекає наступний раунд.",home:"До ігор"},
        en:{code:"ERROR 404",title:"Holmes couldn't find this page",text:"This link may be broken or the page may have moved. Head back to the games and start another round.",home:"Back to games"},
        sv:{code:"FEL 404",title:"Holmes hittade inte sidan",text:"Länken kan vara fel eller sidan kan ha flyttats. Gå tillbaka till spelen och starta en ny omgång.",home:"Till spelen"},
        de:{code:"FEHLER 404",title:"Holmes konnte diese Seite nicht finden",text:"Der Link ist möglicherweise falsch oder die Seite wurde verschoben. Zurück zu den Spielen!",home:"Zu den Spielen"},
        es:{code:"ERROR 404",title:"Holmes no encuentra esta página",text:"Puede que el enlace no funcione o que la página se haya movido. Vuelve a los juegos para otra ronda.",home:"Volver a los juegos"}
      };
      var prefix = location.pathname.split("/")[1];
      var match = Object.prototype.hasOwnProperty.call(messages, prefix);
      var lang = match ? prefix : "en";
      if (!match) {try {var saved=localStorage.getItem("nickolasgames-lang");if(messages[saved])lang=saved;}catch(e){}}
      var t = messages[lang] || messages.en;
      document.documentElement.lang = lang;
      document.title = "404 — " + t.title + " | NickolasGames";
      document.querySelector(".code").textContent = t.code;
      document.querySelector("h1").textContent = t.title;
      document.querySelector("article > p:not(.code)").textContent = t.text;
      var home = lang === "en" ? "/" : "/" + lang + "/";
      document.getElementById("notfound-home").textContent = t.home;
      document.getElementById("notfound-home").href = home;
      document.getElementById("notfound-lang").textContent = "NickolasGames";
      document.getElementById("notfound-lang").href = home;
    })();
  </script>
</body>
</html>`;
writeFileSync(resolve(root,'404.html'), notFound);

console.log('Prepared '+urls.length+' localized game/privacy pages, 404 page, CSP and sitemap.');

// Use only final hashed filenames, after Vite and all localized pages are written.
finalizeOfflineBuild(root);
