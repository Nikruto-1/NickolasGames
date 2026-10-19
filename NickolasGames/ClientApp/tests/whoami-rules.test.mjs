import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WHOAMI_RULES, WHOAMI_UI } from '../src/locales/whoami-ui.js';

test('Who Am I rules have a description and complete, readable sections in all five languages', () => {
  assert.deepEqual(Object.keys(WHOAMI_RULES).sort(), Object.keys(WHOAMI_UI).sort());
  for (const rules of Object.values(WHOAMI_RULES)) {
    assert(rules.label.trim()); assert(rules.description.trim());
    assert.equal(rules.sections.length, 4);
    assert.equal(new Set(rules.sections.map(section => section.title)).size, 4);
    for (const section of rules.sections) {
      assert(section.title.trim()); assert.equal(section.items.length, 2);
      assert(section.items.every(item => typeof item === 'string' && item.trim().length > 0));
    }
  }
});
