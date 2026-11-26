import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('Holmes pendant is decorative, uses the supplied SVG design and is dark-theme-only',()=>{
 const floor=read('../src/components/HolmesFloor.jsx'),hero=read('../src/components/HomeSections.jsx'),lamp=read('../src/components/SwingingLamp.jsx'),css=read('../src/components/SwingingLamp.css');
 assert.match(hero,/<header className="hero holmes-home">\s*<SwingingLamp\/>/);
 assert.doesNotMatch(floor,/<SwingingLamp/);
 assert.match(css,/\.hero\.holmes-home \.hero-copy\{position:relative;z-index:2\}/);
 assert.match(lamp,/className="holmes-lamp-light"[^>]*preserveAspectRatio="none"/);
 assert.doesNotMatch(floor,/holmes-spotlight/);
 assert.match(floor,/import holmesLying from "\.\.\/assets\/holmes-lying-hero\.png"/);
 assert.match(lamp,/className="holmes-lamp" aria-hidden="true"/);
 assert.match(lamp,/M 5 80 C 8 50, 30 16, 75 16/);
 assert.match(lamp,/M 66 91 C 53 99, 53 121, 75 128/);
 assert.match(css,/\.holmes-lamp\{[^}]*pointer-events:none/);
 assert.match(css,/\.holmes-lamp-drop\{[^}]*visibility:hidden/);
 assert.match(css,/:root\[data-theme=dark\] \.holmes-lamp-drop\{[^}]*visibility:visible/);
 assert.match(css,/--lamp-shade:clamp\(92px,30vw,132px\);--lamp-beam:200%/);
 assert.match(lamp,/points="140,0 180,0 320,420 0,420"/);
 assert.match(lamp,/className="holmes-lamp-pool"/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('dark hero subtitle stays readable without a background panel',()=>{
 const css=read('../src/components/SwingingLamp.css');
 assert.match(css,/:root\[data-theme=dark\] \.hero\.holmes-home \.hero-copy>p\{color:var\(--fg\);text-shadow:/);
 assert.match(css,/\.hero-copy>p::selection\{background:#dfb578;color:#25221f;text-shadow:none\}/);
});
