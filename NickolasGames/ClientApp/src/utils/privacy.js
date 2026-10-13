export const GAME_DATA_PREFIX = 'nickolasgames-';
export function inspectGameData(storage = localStorage) {
  const entries = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(GAME_DATA_PREFIX)) continue;
    const raw = storage.getItem(key);
    try { entries[key] = JSON.parse(raw); } catch { entries[key] = raw; }
  }
  return entries;
}
export function clearGameData(storage = localStorage) {
  const keys = Object.keys(inspectGameData(storage));
  for (const key of keys) storage.removeItem(key);
  return keys.length;
}
