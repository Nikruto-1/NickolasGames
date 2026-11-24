import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedWholeSeconds } from '../src/utils/timerMath.js';

test('whole seconds are measured from absolute time, not interval counts', () => {
  assert.equal(elapsedWholeSeconds(10_000, 10_999), 0);
  assert.equal(elapsedWholeSeconds(10_000, 11_000), 1);
  assert.equal(elapsedWholeSeconds(10_000, 14_750), 4);
  assert.equal(elapsedWholeSeconds(10_000, 71_000), 61);
});

test('elapsed time ignores invalid or backwards clocks', () => {
  assert.equal(elapsedWholeSeconds(10_000, 9_000), 0);
  assert.equal(elapsedWholeSeconds(10_000, 10_000), 0);
  assert.equal(elapsedWholeSeconds(NaN, 10_000), 0);
  assert.equal(elapsedWholeSeconds(10_000, Infinity), 0);
});
