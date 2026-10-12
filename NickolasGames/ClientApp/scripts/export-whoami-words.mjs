import { writeFile } from 'node:fs/promises';
import { WHOAMI_UK } from '../src/data/whoami.uk.js';
import { DIFFICULTIES } from '../src/utils/difficulty.js';

const labels = { easy: 'Легкий', medium: 'Середній', hard: 'Складний' };
const categories = Object.entries(WHOAMI_UK);
const totals = Object.fromEntries(DIFFICULTIES.map(level => [level,
  categories.reduce((count, [, words]) => count + words[level].length, 0)]));
const total = Object.values(totals).reduce((sum, count) => sum + count, 0);
const lines = [
  '# «Хто я?»: усі українські картки за категоріями та складністю',
  '',
  `Усього завдань: **${total}**. Легкі: **${totals.easy}**, середні: **${totals.medium}**, складні: **${totals.hard}**.`,
  '',
  '| Категорія | Легкий | Середній | Складний | Усього |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...categories.map(([name, words]) =>
    `| ${name} | ${words.easy.length} | ${words.medium.length} | ${words.hard.length} | ${DIFFICULTIES.reduce((sum, level) => sum + words[level].length, 0)} |`),
  '',
];

for (const [name, words] of categories) {
  lines.push(`## ${name}`, '');
  for (const level of DIFFICULTIES) {
    lines.push(`### ${labels[level]} (${words[level].length})`, '');
    lines.push(...(words[level].length ? words[level].map(word => `- ${word}`) : ['Слів цього рівня немає.']), '');
  }
}

const destination = new URL('../docs/whoami-words-uk.md', import.meta.url);
await writeFile(destination, lines.join('\n'), 'utf8');
console.log(`Exported ${total} Ukrainian Who Am I cards to ${destination.pathname}`);

