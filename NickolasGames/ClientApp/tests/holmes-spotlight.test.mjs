import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('Holmes pendant is decorative, uses the supplied SVG design and is dark-theme-only',()=>{
 const floor=read('../src/components/HolmesFloor.jsx'),lamp=read('../src/components/SwingingLamp.jsx'),css=read('../src/components/SwingingLamp.css');
 assert.match(floor,/<SwingingLamp\/>/);
 assert.doesNotMatch(floor,/holmes-spotlight/);
 assert.match(floor,/import holmesLying from "\.\.\/assets\/holmes-lying-hero\.png"/);
 assert.match(lamp,/className="holmes-lamp" aria-hidden="true"/);
 assert.match(lamp,/M 5 80 C 8 50, 30 16, 75 16/);
 assert.match(lamp,/M 66 91 C 53 99, 53 121, 75 128/);
 assert.match(css,/\.holmes-lamp\{[^}]*pointer-events:none/);
 assert.match(css,/\.holmes-lamp-drop\{[^}]*visibility:hidden/);
 assert.match(css,/:root\[data-theme=dark\] \.holmes-lamp-drop\{[^}]*visibility:visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
