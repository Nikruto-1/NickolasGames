// Add only genuine reviews after the author approves the quote, translations,
// and public display of their name and country. Do not store private contact details.
export const PLAYER_REVIEWS = [];
export const REVIEW_LANGS = ['uk', 'en', 'sv', 'de', 'es'];
const GAME_IDS = new Set(['whoami','crocodile','alias','truth','checkers','spy']);
export function visiblePlayerReviews(entries, lang) {
  const language = REVIEW_LANGS.includes(lang) ? lang : 'en';
  const seen = new Set();
  return entries.filter(entry => {
    if (!entry || entry.approved !== true || typeof entry.id !== 'string' || !entry.id.trim() ||
        seen.has(entry.id) || typeof entry.name !== 'string' || !entry.name.trim() ||
        !/^[A-Z]{2}$/.test(entry.country ?? '') || !GAME_IDS.has(entry.game) ||
        !REVIEW_LANGS.every(l => typeof entry.quotes?.[l] === 'string' && entry.quotes[l].trim())) return false;
    seen.add(entry.id);
    return true;
  }).map(({id,name,country,game,quotes}) => ({id,name,country,game,quote:quotes[language]}));
}
