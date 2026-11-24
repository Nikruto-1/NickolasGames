import test from 'node:test';
import assert from 'node:assert/strict';
import {readTheme,saveTheme,THEME_KEY} from '../src/utils/themePreference.js';
test('theme defaults to light and persists valid selections',()=>{const m=new Map();const db={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};assert.equal(readTheme(db),'light');assert.equal(saveTheme('dark',db),true);assert.equal(readTheme(db),'dark');assert.equal(saveTheme('invalid',db),false);assert.equal(m.get(THEME_KEY),'dark');assert.equal(saveTheme('light',db),true);assert.equal(readTheme(db),'light');});
test('blocked storage is safe',()=>{const db={getItem(){throw Error()},setItem(){throw Error()}};assert.equal(readTheme(db),'light');assert.equal(saveTheme('dark',db),false);});
