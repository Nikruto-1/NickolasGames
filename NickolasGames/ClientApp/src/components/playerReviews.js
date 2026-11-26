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

// First names and countries supplied by the project owner for the feedback section.
// Collective verbal feedback is summarized separately; no attributed quotes are invented.
export const REVIEW_PARTICIPANTS = [
  [
    "de-andrii",
    "Андрій",
    "Andrii",
    "DE"
  ],
  [
    "ua-vlad-1",
    "Влад",
    "Vlad",
    "UA"
  ],
  [
    "pl-kate",
    "Кейт",
    "Kate",
    "PL"
  ],
  [
    "se-yara",
    "Яра",
    "Yara",
    "SE"
  ],
  [
    "gb-ruslan",
    "Руслан",
    "Ruslan",
    "GB"
  ],
  [
    "ua-elina",
    "Еліна",
    "Elina",
    "UA"
  ],
  [
    "ro-mykita",
    "Микита",
    "Mykyta",
    "RO"
  ],
  [
    "pl-artem",
    "Артем",
    "Artem",
    "PL"
  ],
  [
    "ua-vika",
    "Віка",
    "Vika",
    "UA"
  ],
  [
    "se-andrii",
    "Андрій",
    "Andrii",
    "SE"
  ],
  [
    "pl-zhenia",
    "Женя",
    "Zhenia",
    "PL"
  ],
  [
    "ua-vlad-2",
    "Влад",
    "Vlad",
    "UA"
  ],
  [
    "gb-alex",
    "Алекс",
    "Alex",
    "GB"
  ],
  [
    "pl-maryna",
    "Марина",
    "Maryna",
    "PL"
  ],
  [
    "ro-dasha",
    "Даша",
    "Dasha",
    "RO"
  ],
  [
    "ua-anastasiia",
    "Анастасія",
    "Anastasiia",
    "UA"
  ]
].map(([id,uk,latin,country])=>({id,uk,latin,country}));
export function visibleReviewParticipants(lang){
 return REVIEW_PARTICIPANTS.map(({id,uk,latin,country})=>({id,name:lang==='uk'?uk:latin,country}));
}
