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
console.log('Prepared '+urls.length+' localized game/privacy pages with CSP and sitemap.');
