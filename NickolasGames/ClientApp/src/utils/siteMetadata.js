export const SITE_ORIGIN = 'https://games.nickolasspace.com';
export const LANGUAGE_PATHS = { en: '/', uk: '/uk/', sv: '/sv/', de: '/de/', es: '/es/' };
export function initialLanguage() {
  const fromPath = location.pathname.split('/').find(part => ['uk','en','sv','de','es'].includes(part));
  if (fromPath) return fromPath;
  try { const saved = localStorage.getItem('nickolasgames-lang'); return LANGUAGE_PATHS[saved] ? saved : 'en'; } catch { return 'en'; }
}
export function updateSiteMetadata(lang, games, privacyTitle) {
  const privacy = location.pathname.endsWith('/privacy/');
  const path = LANGUAGE_PATHS[lang] + (privacy ? 'privacy/' : '');
  const title = privacy ? privacyTitle + ' | NickolasGames' : 'NickolasGames | ' + ['whoami','crocodile','alias','truth'].map(key => games[key].n).join(', ');
  const description = privacy ? privacyTitle + " · NickolasGames" : ['whoami','crocodile','alias','truth'].map(key => games[key].n + ': ' + games[key].d).join(' ').slice(0,240);
  for (const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute('content',description);
  document.title = title;
  document.documentElement.lang = lang;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = SITE_ORIGIN + path;
  for (const [selector, value] of [['meta[property="og:title"]',title],['meta[name="twitter:title"]',title],['meta[property="og:url"]',SITE_ORIGIN + path],['meta[property="og:locale"]',{uk:'uk_UA',en:'en_US',sv:'sv_SE',de:'de_DE',es:'es_ES'}[lang]]]) {
    document.querySelector(selector)?.setAttribute('content',value);
  }
}
