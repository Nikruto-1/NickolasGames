import test from "node:test";
import assert from "node:assert/strict";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES } from "../src/features/truth-or-dare/truthOrDare.uk.js";
import { getTruthDareLocale, localizedCategory, localizeTruthDareCard } from "../src/features/truth-or-dare/i18n.js";

test("all 800 truth/dare IDs are unique", () => {
  assert.equal(TRUTH_DARE_CARDS.length, 800);
  assert.equal(new Set(TRUTH_DARE_CARDS.map((c) => c.id)).size, 800);
  assert.equal(TRUTH_DARE_CATEGORIES.length, 8);
});

for (const lang of ["uk", "en", "sv", "de", "es"]) {
  test(`all Truth or Dare cards and categories are localized in ${lang}`, () => {
    const pack = getTruthDareLocale(lang);
    for (const category of TRUTH_DARE_CATEGORIES) {
      const translated = localizedCategory(category, lang);
      assert.ok(translated.name && translated.description, `${lang}: missing ${category.id}`);
      if (lang !== "uk") {
        assert.equal(pack.prompts[category.id][0].length, 10);
        assert.equal(pack.prompts[category.id][1].length, 10);
      }
    }
    for (const card of TRUTH_DARE_CARDS) {
      const result = localizeTruthDareCard(card, lang);
      assert.ok(result.text?.trim(), `${lang}: no text for ${card.id}`);
      assert.equal(result.id, card.id);
      if (lang !== "uk") {
        const match = card.id.match(/-(\d+)-(\d+)$/);
        assert.ok(match, card.id);
        const variant = Number(match[2]);
        assert.equal(Boolean(result.challenge), variant !== 1, `${lang}: challenge mismatch for ${card.id}`);
        assert.equal(/[А-Яа-яЇїІіЄєҐґ]/.test(result.text + (result.challenge || "")), false, `${lang}: Ukrainian text leaked into ${card.id}`);
      }
    }
    for (const key of ["eyebrow","title1","title2","title3","subtitle","settings","close","chooseCats","active","all","cards","safe","done","categories","preferences","turn","finished","choiceTitle","choiceHint","truth","truthHint","dare","dareHint","challenge","next","skip","again","finishTitle","finishText","noRepeats","skipped","comfort"]) {
      assert.ok(pack.ui[key], `${lang}: untranslated UI key ${key}`);
    }
  });
}
