import { GAMES,gamePath,gameFromLocation } from "./siteRoutes.js";
export {GAMES,gameFromLocation};
export function gameFromSearch(search=""){
 return gameFromLocation("",search);
}
export function pageForGame(lang,game,search=""){
 const params=new URLSearchParams(search);
 params.delete("game");
 const query=params.toString();
 return gamePath(lang,game)+(query?"?"+query:"");
}
