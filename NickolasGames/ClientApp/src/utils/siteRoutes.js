export const LANGUAGE_PATHS = Object.freeze({en:'/',uk:'/uk/',sv:'/sv/',de:'/de/',es:'/es/'});
export const GAMES = Object.freeze(['whoami','crocodile','alias','truth','checkers','spy']);
export function gamePath(lang,game){
 const root=LANGUAGE_PATHS[lang]||LANGUAGE_PATHS.en;
 return GAMES.includes(game)?root+'games/'+game+'/':root;
}
export function gameFromLocation(pathname='',search=''){
 const match=pathname.match(/^\/(?:uk\/|en\/|sv\/|de\/|es\/)?games\/([^/]+)\/?$/);
 if(match)return GAMES.includes(match[1])?match[1]:null;
 const game=new URLSearchParams(search).get('game');
 return GAMES.includes(game)?game:null;
}
export function contentPath(lang,game,privacy=false){
 return privacy?(LANGUAGE_PATHS[lang]||'/')+'privacy/':gamePath(lang,game);
}
