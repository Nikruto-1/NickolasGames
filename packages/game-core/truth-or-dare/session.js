import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "./cards.uk.js";

export const TRUTH_DARE_STORAGE = "nickolasgames-truth-dare-v2";
const validCategoryIds = new Set(TRUTH_DARE_CATEGORIES.map(c => c.id));
const cardById = new Map(TRUTH_DARE_CARDS.map(c => [c.id, c]));
export const ALL_TRUTH_DARE_CATEGORIES = TRUTH_DARE_CATEGORIES.map(c => c.id);

export function shuffleTruthDare(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createTruthDareQueue(categories, random = Math.random) {
  return shuffleTruthDare(TRUTH_DARE_CARDS.filter(card => categories.includes(card.category)).map(card => card.id), random);
}

export function restoreTruthDareSession(raw) {
  if (!raw || !Array.isArray(raw.categories) || !Array.isArray(raw.queue)) return null;
  const categories = raw.categories;
  if (!categories.length || new Set(categories).size !== categories.length ||
      !categories.every(c => validCategoryIds.has(c))) return null;
  const available = new Set(TRUTH_DARE_CARDS.filter(c => categories.includes(c.category)).map(c => c.id));
  if (raw.queue.length !== available.size || new Set(raw.queue).size !== available.size ||
      !raw.queue.every(id => available.has(id))) return null;
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index > raw.queue.length) return null;
  if (!Number.isInteger(raw.skipped) || raw.skipped < 0 || raw.skipped > raw.index) return null;
  // Existing v2 saves did not include chosen. Keep their progress and start the next choice.
  const chosen = raw.chosen === true && raw.index < raw.queue.length;
  return { categories: [...categories], queue: [...raw.queue], index: raw.index, skipped: raw.skipped, chosen };
}

export function createTruthDareSession(categories = ALL_TRUTH_DARE_CATEGORIES, random = Math.random) {
  return { categories: [...categories], queue: createTruthDareQueue(categories, random), index: 0, skipped: 0, chosen: false };
}

export function chooseTruthDare(session, type) {
  if (session.chosen || (type !== "truth" && type !== "dare")) return session;
  const position = session.queue.findIndex((id, i) => i >= session.index && cardById.get(id)?.type === type);
  if (position < 0) return session;
  const queue = [...session.queue];
  [queue[session.index], queue[position]] = [queue[position], queue[session.index]];
  return { ...session, queue, chosen: true };
}

export function advanceTruthDare(session, skip = false) {
  if (!session.chosen || session.index >= session.queue.length) return session;
  return { ...session, index: session.index + 1, skipped: session.skipped + Number(skip), chosen: false };
}

export function readTruthDareSession(storage) {
  try { return restoreTruthDareSession(JSON.parse(storage.getItem(TRUTH_DARE_STORAGE) || "null")); }
  catch { return null; }
}

export function saveTruthDareSession(storage, session) {
  try { storage.setItem(TRUTH_DARE_STORAGE, JSON.stringify(session)); return true; }
  catch { return false; }
}
