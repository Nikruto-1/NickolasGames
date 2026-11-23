import { UI_COPY as ukCopy, PLAYER_COPY as ukPlayerCopy } from "./uk.js";
import { UI_COPY as enCopy, PLAYER_COPY as enPlayerCopy } from "./en.js";
import { UI_COPY as svCopy, PLAYER_COPY as svPlayerCopy } from "./sv.js";
import { UI_COPY as deCopy, PLAYER_COPY as dePlayerCopy } from "./de.js";
import { UI_COPY as esCopy, PLAYER_COPY as esPlayerCopy } from "./es.js";

const spy = {uk:{n:"Шпигун",d:"Знайди шпигуна серед друзів",p:"3–20",t:"5–8 хв"},en:{n:"Spy",d:"Find the spy among your friends",p:"3–20",t:"5–8 min"},sv:{n:"Spion",d:"Hitta spionen bland vännerna",p:"3–20",t:"5–8 min"},de:{n:"Spion",d:"Finde den Spion unter Freunden",p:"3–20",t:"5–8 Min."},es:{n:"Espía",d:"Encuentra al espía entre tus amigos",p:"3–20",t:"5–8 min"}};
export const COPY = Object.fromEntries(Object.entries({ uk: ukCopy, en: enCopy, sv: svCopy, de: deCopy, es: esCopy }).map(([lang,copy])=>[lang,{...copy,games:{...copy.games,spy:spy[lang]}}]));
export const PLAYER_SETUP = { uk: ukPlayerCopy, en: enPlayerCopy, sv: svPlayerCopy, de: dePlayerCopy, es: esPlayerCopy };
