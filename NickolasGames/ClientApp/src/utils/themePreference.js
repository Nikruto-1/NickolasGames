export const THEME_KEY='nickolasgames-theme';
export function readTheme(storage){try{return (storage??globalThis.localStorage).getItem(THEME_KEY)==='dark'?'dark':'light';}catch{return 'light';}}
export function saveTheme(theme,storage){if(!['light','dark'].includes(theme))return false;try{(storage??globalThis.localStorage).setItem(THEME_KEY,theme);return true;}catch{return false;}}
