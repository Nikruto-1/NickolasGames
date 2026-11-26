import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../src/components/HolmesFloor.jsx',import.meta.url),'utf8');
const css = readFileSync(new URL('../src/components/HolmesFloor.css',import.meta.url),'utf8');
test('Holmes spotlight is decorative and restricted to dark theme',()=>{
 assert.match(source,/className="holmes-spotlight" aria-hidden="true"/);
 assert.match(css,/\.holmes-spotlight\{display:none;position:absolute;[^}]*pointer-events:none/);
 assert.match(css,/:root\[data-theme=dark\] \.holmes-spotlight\{display:block\}/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.holmes-spotlight-swing\{animation:none;transform:none\}\}/);
 assert.match(source,/import holmesLying from "\.\.\/assets\/holmes-lying-hero\.png"/);
});
