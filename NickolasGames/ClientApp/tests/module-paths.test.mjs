import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const scanned = ['src', 'scripts', 'tests'];
const extensions = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const candidates = ['', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '/index.js', '/index.jsx'];
const pattern = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\bexport\s*[^;\n]*?\bfrom\s*)(['"])(\.[^'"]+)\1/g;

async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (extensions.has(extname(path))) result.push(path);
  }
  return result;
}

test('all local module imports resolve to existing files after refactors', async () => {
  const list = (await Promise.all(scanned.map(dir => files(resolve(root, dir))))).flat();
  const missing = [];
  for (const file of list) {
    const code = await readFile(file, 'utf8');
    for (const match of code.matchAll(pattern)) {
      // Computed imports concatenate a language suffix; a string fragment is not a complete path.
      if (/^\s*\+/.test(code.slice(match.index + match[0].length))) continue;
      const target = resolve(dirname(file), match[2]);
      if (!candidates.some(ext => existsSync(target + ext))) {
        missing.push(file.slice(root.length) + ' -> ' + match[2]);
      }
    }
  }
  assert.deepEqual(missing, [], 'Dangling relative imports found');
});
