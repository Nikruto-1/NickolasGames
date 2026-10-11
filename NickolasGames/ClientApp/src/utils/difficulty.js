export const DIFFICULTIES = ["easy", "medium", "hard"];

export const wordDifficultyScore = (word) => {
  const clean = String(word).replace(/[€$#@&*+?.,!()\-]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  return clean.length + Math.max(0, words - 1) * 5;
};
export const wordsByDifficulty = (words, difficulty) => {
  if (words && !Array.isArray(words)) return words[difficulty] || [];
  if (!Array.isArray(words) || words.length < 3) return words || [];
  const sorted = [...words].sort((a, b) => wordDifficultyScore(a) - wordDifficultyScore(b));
  const third = Math.ceil(sorted.length / 3);
  if (difficulty === "easy") return sorted.slice(0, third);
  if (difficulty === "hard") return sorted.slice(third * 2);
  return sorted.slice(third, Math.max(third + 1, third * 2));
};
