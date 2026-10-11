export const uniqueWords = words =>
  [...new Map(words.map(word => [word.trim().toLocaleLowerCase(), word.trim()])).values()].filter(Boolean);