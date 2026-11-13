export const DIFFICULTIES = ["easy", "medium", "hard"];

// Built-in categories explicitly classify words by meaning in every language.
export const wordsByDifficulty = (words, difficulty) =>
  words && !Array.isArray(words) && DIFFICULTIES.includes(difficulty) ? words[difficulty] || [] : [];