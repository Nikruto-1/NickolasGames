import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHARADES_RULES, CHARADES_COPY } from '../src/locales/charades.js';

test('Charades rules provide complete descriptions and sections in all five languages', () => {
  assert.deepEqual(Object.keys(CHARADES_RULES).sort(), Object.keys(CHARADES_COPY).sort());
  for (const rules of Object.values(CHARADES_RULES)) {
    assert(rules.label.trim()); assert(rules.description.trim());
    assert.equal(rules.sections.length, 5);
    assert.equal(new Set(rules.sections.map(section => section.title)).size, 5);
    for (const section of rules.sections) {
      assert(section.title.trim()); assert.equal(section.items.length, 2);
      assert(section.items.every(item => typeof item === 'string' && item.trim().length > 0));
    }
  }
});
