// Shared with the browser history tests.
export function pathLanguage(pathname){
 if(pathname==="/"||/^\/(?:games\/|privacy\/)/.test(pathname))return "en";
 const match=pathname.match(/^\/(uk|en|sv|de|es)(?:\/|$)/);
 return match?match[1]:null;
}
