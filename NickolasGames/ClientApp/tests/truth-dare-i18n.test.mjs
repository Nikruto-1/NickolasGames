import test from "node:test";
import assert from "node:assert/strict";
import { TRUTH_DARE_CARDS, TRUTH_DARE_CATEGORIES, TRUTH_DARE_DEFINITIONS, buildTruthDareCards } from "../src/features/truth-or-dare/truthOrDare.uk.js";
import { getTruthDareLocale, localizedCategory, localizeTruthDareCard, baseTruthDareCardId } from "../src/features/truth-or-dare/i18n.js";

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
        for (const type of ["truth", "dare"]) for (let n = 1; n <= 10; n++) {
          assert.ok(pack.cardTextById[`${category.id}-${type}-${n}`], `${lang}: untranslated ${category.id}-${type}-${n}`);
        }
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

test("stable translation IDs survive unrelated order changes and preserve existing save IDs", () => {
  const stableIds = TRUTH_DARE_CARDS.map(c => c.id);
  const shuffled = [...TRUTH_DARE_CARDS].reverse();
  assert.deepEqual(shuffled.map(c => c.id).sort(), stableIds.sort());
  for(const lang of ["en","sv","de","es"]){
    const pack=getTruthDareLocale(lang);
    assert.equal(Object.keys(pack.cardTextById).length, 160);
    for(const card of shuffled){
      const base=baseTruthDareCardId(card.id);
      assert.equal(localizeTruthDareCard(card,lang).text,pack.cardTextById[base]);
    }
  }
});

test("reordering canonical Ukrainian base prompts cannot change their IDs or translations", () => {
  const reverse = TRUTH_DARE_DEFINITIONS.map(([id,name,desc,truths,dares]) =>
    [id,name,desc,[...truths].reverse(),[...dares].reverse()]).reverse();
  const reordered = buildTruthDareCards(reverse);
  const compare = cards => new Map(cards.map(c => [c.id, c.type+"|"+c.text+"|"+c.challenge]));
  assert.deepEqual([...compare(reordered)].sort(), [...compare(TRUTH_DARE_CARDS)].sort());
  for (const lang of ["en","sv","de","es"]) {
    for(const card of reordered) {
      assert.deepEqual(localizeTruthDareCard(card,lang),
        localizeTruthDareCard(TRUTH_DARE_CARDS.find(c=>c.id===card.id),lang));
    }
  }
});
