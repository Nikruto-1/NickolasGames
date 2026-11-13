// Pure route parsing is shared by the React router and Node tests.
export function pathLanguage(pathname) {
  if (pathname === "/") return "en";
  const match = pathname.match(/^\/(uk|en|sv|de|es)\//);
  return match ? match[1] : null;
}
