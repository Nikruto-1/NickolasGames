import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY } from '../src/locales/index.js';
import { PRIVACY_COPY } from '../src/locales/privacy.js';
import { LANGUAGE_PATHS, SITE_ORIGIN } from '../src/utils/siteMetadata.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../wwwroot');
const template = readFileSync(resolve(root, 'index.html'), 'utf8').replace(/\r\n?/g, '\n');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const image = SITE_ORIGIN + '/icons/holmes-512.png';
const alternates = Object.entries(LANGUAGE_PATHS).map(([lang,path]) => '<link rel="alternate" hreflang="'+lang+'" href="'+SITE_ORIGIN+path+'" />').join('\n');
const urls = [];
for (const [lang,path] of Object.entries(LANGUAGE_PATHS)) {
 for (const privacy of [false,true]) {
  const policy = PRIVACY_COPY[lang];
  const games = ['whoami','crocodile','alias','truth'].map(key=>COPY[lang].games[key]);
  const url = SITE_ORIGIN + path + (privacy ? 'privacy/' : '');
  const title = privacy ? policy.title + ' | NickolasGames' : 'NickolasGames | ' + games.map(game=>game.n).join(', ');
  const description = privacy ? policy.intro : games.map(game=>game.n+': '+game.d).join(' ').slice(0,240);
  let html = template.replace(/<html lang="[^"]*">/,'<html lang="'+lang+'">')
   .replace(/<title>.*?<\/title>/,'<title>'+escape(title)+'</title>')
   .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escape(description)+'" />')
   .replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+url+'" />')
   .replace(/<meta property="og:(title|description|url|locale)"[^>]*>/g,(_,key)=>'<meta property="og:'+key+'" content="'+escape({title,description,url,locale:{uk:'uk_UA',en:'en_US',sv:'sv_SE',de:'de_DE',es:'es_ES'}[lang]}[key])+'" />')
   .replace(/<meta name="twitter:(title|description|card)"[^>]*>/g,(_,key)=>'<meta name="twitter:'+key+'" content="'+escape({title,description,card:'summary'}[key])+'" />')
   .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
  const content = privacy
   ? '<p>'+escape(policy.intro)+'</p>'+policy.sections.map(([heading,text])=>'<section><h2>'+escape(heading)+'</h2><p>'+escape(text)+'</p></section>').join('')
   : '<p>'+escape(COPY[lang].heroText)+'</p>'+games.map(game=>'<section><h2>'+escape(game.n)+'</h2><p>'+escape(game.d)+'</p></section>').join('');
  html = html.replace(/<div class="seo-content">[\s\S]*?<\/div>/,'<div class="seo-content">'+content+'<p><a href="'+path+'privacy/">'+escape(policy.title)+'</a></p></div>');
  const structured = privacy ? { '@context':'https://schema.org','@type':'WebPage',name:title,url,description,inLanguage:lang } :
   { '@context':'https://schema.org','@type':'WebApplication',name:'NickolasGames',url,applicationCategory:'GameApplication',operatingSystem:'Web browser',isAccessibleForFree:true,inLanguage:lang,description };
  html = html.replace('</head>',(privacy ? '' : alternates+'\n<link rel="alternate" hreflang="x-default" href="'+SITE_ORIGIN+'/" />\n')+
   '<meta property="og:image" content="'+image+'" />\n<meta property="og:image:alt" content="NickolasGames" />\n<script type="application/ld+json">'+json(structured)+'</script>\n</head>');
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
   .map(match=>"'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
  const csp = "default-src 'self'; script-src 'self' "+hashes.join(' ')+"; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
  html = html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+escape(csp)+'" />');
  const destination = resolve(root, '.'+path+(privacy ? 'privacy/' : ''), 'index.html');
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
    <div class="actions"><a href="/uk/">До ігор</a><a href="/">English</a></div>
  </article></main>
</body>
</html>`;
writeFileSync(resolve(root,'404.html'), notFound);

console.log('Prepared '+urls.length+' localized game/privacy pages, 404 page, CSP and sitemap.');
