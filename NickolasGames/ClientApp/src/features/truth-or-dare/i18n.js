import en from "./truthOrDare.en.js";
import sv from "./truthOrDare.sv.js";
import de from "./truthOrDare.de.js";
import es from "./truthOrDare.es.js";

const uk = {
  labels: {
    friends: ["Друзі під прицілом", "Доброзичливі підколи й питання про компанію"],
    choices: ["Вибір без переможців", "Дилеми, в яких доведеться викручуватися"],
    confessions: ["Зізнання з родзинкою", "Курйозні звички, фейли й маленькі секрети"],
    memes: ["Крінж, меми і вайб", "Абсурд, самоіронія та інтернет-гумор"],
    acting: ["Театр одного героя", "Ролі, пародії та акторські виклики"],
    improv: ["Імпровізація на межі", "Миттєві реакції й вигадані історії"],
    team: ["Командний хаос", "Взаємодія, домовленості та дружні батли"],
    detective: ["Детектор підколів", "Підозри, версії, хитрі пояснення"]
  },
  ui: {
    eyebrow:"ГРА ДЛЯ КОМПАНІЇ",title1:"Правда",title2:"або",title3:"дія",
    subtitle:"Обирай, відповідай, виконуй. 800 карток для веселого вечора з друзями.",
    settings:"Категорії та правила",close:"Закрити налаштування",chooseCats:"Обери категорії",
    active:"активні",all:"Обрати всі категорії",cards:"карток",
    safe:"Грайте у своєму темпі. Будь-яке запитання чи завдання можна пропустити.",
    done:"Готово",categories:"категорій",preferences:"Налаштування",turn:"ТВІЙ ХІД",
    finished:"КОЛОДУ ЗАВЕРШЕНО",choiceTitle:"Правда чи дія?",choiceHint:"Обери, що хочеш отримати цього ходу.",
    truth:"Правда",truthHint:"Відповісти на запитання",dare:"Дія",dareHint:"Виконати завдання",
    challenge:"Додатковий виклик",next:"Наступний гравець",skip:"Пропустити",
    again:"Перемішати та грати знову",finishTitle:"Усі картки зіграно!",
    finishText:"Можна перемішати колоду й почати нову гру.",
    noRepeats:"Картки не повторюються",skipped:"Пропущено",comfort:"Грай так, як комфортно",
    cancel:"Скасувати",confirmTitle:"Почати нову партію?",confirmText:"Зміна категорій скине поточну колоду та прогрес. Хочеш продовжити?",confirmReset:"Змінити категорії",saveError:"Не вдалося зберегти партію на цьому пристрої. Перевір налаштування сховища браузера."
  }
};
const packs = { uk, en, sv, de, es };

export const getTruthDareLocale = (lang) => packs[lang] || packs.en;

export const localizedCategory = (category, lang) => {
  const translation = getTruthDareLocale(lang).labels[category.id];
  return { ...category, name: translation?.[0] || category.name, description: translation?.[1] || category.description };
};

// Existing 800 queue IDs are immutable and stored in saved sessions.
// Translation keys point to the canonical base card, not to array positions.
export const baseTruthDareCardId = (cardId) => typeof cardId === "string"
  ? cardId.replace(/-[1-5]$/, "")
  : null;

export const localizeTruthDareCard = (card, lang) => {
  if (!card || lang === "uk") return card;
  const pack = getTruthDareLocale(lang);
  const base = pack.cardTextById?.[baseTruthDareCardId(card.id)];
  const match = card.id.match(/-(truth|dare)-(\d+)-(\d+)$/);
  if (!match) return card;
  const [, type, , variant] = match;
  const challenge = pack.twists[type]?.[Number(variant) - 1] ?? null;
  return { ...card, text: base || card.text, challenge };
};
