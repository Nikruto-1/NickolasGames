const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function main() {
  const { newAliasState, validAliasState, aliasCategories, aliasPool } = await import(pathToFileURL(path.resolve(__dirname, '../src/utils/alias.js')));
  const { ALIAS_COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/alias.js')));
  const { COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/index.js')));
  const { ALIAS_WORDS } = await import(pathToFileURL(path.resolve(__dirname, '../src/data/alias.js')));
  const root = path.resolve(__dirname, '../../wwwroot');
  const output = process.env.QA_OUTPUT || path.join(os.tmpdir(), 'nickolasgames-dice-qa');
  await fs.mkdir(output, { recursive: true });
  const server = http.createServer(async (req, res) => {
    let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    try {
      const data = await fs.readFile(file);
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = process.env.QA_ORIGIN || `http://127.0.0.1:${server.address().port}`;
  try {
    for (const engine of (process.env.QA_ENGINE ? [process.env.QA_ENGINE] : ['chromium', 'webkit'])) {
      const browser = await (engine === 'chromium' ? chromium.launch({ channel: process.env.QA_CHROMIUM_CHANNEL || 'msedge', headless: true }) : webkit.launch({ headless: true }));
      try {
        // Keep visual fixtures independent of offline-cache updates during rapid reloads.
        const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' });
        await page.addInitScript(() => {
          const pending = sessionStorage.getItem('alias-qa-seed');
          if (!pending) return;
          const { lang, state } = JSON.parse(pending);
          localStorage.setItem(`nickolasgames-alias-teams-v1-${lang}`, JSON.stringify(state));
          sessionStorage.removeItem('alias-qa-seed');
        });
        const seedGame = async (lang, state) => {
          await page.evaluate(value => sessionStorage.setItem('alias-qa-seed', JSON.stringify(value)), { lang, state });
          await page.reload();
        };
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('dialog', dialog => dialog.accept());
        for (const [lang, width, count] of [['uk', 1440, 2], ['uk', 390, 2], ['uk', 320, 3], ['en', 390, 2], ['sv', 390, 2], ['de', 390, 2], ['es', 390, 2]]) {
          await page.setViewportSize({ width, height: 900 });
          const state = newAliasState(count === 2 ? ALIAS_COPY[lang].teams : ['A'.repeat(80), 'Друзі за великим ігровим столом', 'Третя команда']);
          state.teams.forEach((team, index) => {
            team.players = [{ id: `p-${index}-1`, name: 'Alice' }, { id: `p-${index}-2`, name: 'Bob' }];
          });
          state.phase = 'diceResult'; state.deck = ['Test']; state.activeIndex = count - 1;
          state.contenders = [state.teams[count - 1].id];
          state.dice = state.teams.map((team, index) => ({ id: team.id, values: count === 2 ? (index ? [6, 6] : [2, 1]) : [index * 2 + 1, index * 2 + 2] }));
          state.lastRollTeamIds = state.teams.map(team => team.id);
          assert(validAliasState(state));
          const url = origin + (lang === 'en' ? '/' : `/${lang}/`);
          if (lang === 'en') await page.locator('nav .lang-btn').filter({ hasText: /^EN$/ }).click();
          await page.goto(url);
          await seedGame(lang, state);
          await page.locator('#preview .tabs').getByRole('button', { name: 'Alias', exact: true }).click();
          const game = page.locator('.alias-game');
          await game.locator('.alias-dice-result').waitFor();
          assert.equal(await game.locator('.alias-scores').count(), 0);
          assert.equal(await game.locator('.alias-dice-team.is-winner').count(), 1);
          assert.deepEqual(await game.locator('.alias-die').evaluateAll(dice => dice.map(die => ({ value: Number(die.dataset.value), pips: die.querySelectorAll('.alias-die-pip').length }))), state.dice.flatMap(roll => roll.values.map(value => ({ value, pips: value }))));
          assert.deepEqual(await game.locator('.alias-dice-score>strong').allTextContents(), state.dice.map(roll => String(roll.values[0] + roll.values[1])));
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          assert(await game.locator('.alias-dice-team').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth)));
          await game.locator('.alias-rules>summary').click();
          assert.deepEqual(await game.locator('.alias-rules-sections h3').allTextContents(), ALIAS_COPY[lang].rulesSections.map(section => section.title));
          assert.deepEqual(await game.locator('.alias-rules-sections ul li').allTextContents(), ALIAS_COPY[lang].rulesSections.flatMap(section => section.items));
          assert(await game.locator('.alias-rules-sections ul li').evaluateAll(items => items.every(item => {
            const style = getComputedStyle(item);
            return parseFloat(style.fontSize) >= 16 && parseFloat(style.lineHeight) >= 25 && item.scrollWidth <= item.clientWidth;
          })));
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          await game.locator('.head').screenshot({ path: path.join(output, `rules-${lang}-${width}-${engine}.png`) });
          await game.locator('.alias-rules>summary').press('Space');
          assert.equal(await game.locator('.alias-rules').getAttribute('open'), null);
          await game.locator('.alias-dice-stage').screenshot({ path: path.join(output, `dice-${lang}-${width}-${engine}.png`) });
          await game.getByRole('button', { name: ALIAS_COPY[lang].continueDice, exact: true }).click();
          await game.locator('.alias-ready').waitFor();
          assert.equal(await game.locator('.alias-scores').count(), 1);
          await game.getByRole('button', { name: ALIAS_COPY[lang].newGame, exact: true }).click();
          const picker = game.locator('.alias-category-picker');
          await picker.locator('summary').click();
          const allTopics = picker.locator('.is-all input');
          const topicBoxes = picker.locator('.alias-category-option:not(.is-all) input');
          const topicNames = await picker.locator('.alias-category-option:not(.is-all)>span').allTextContents();
          await allTopics.uncheck();
          await game.getByRole('button', { name: ALIAS_COPY[lang].start, exact: true }).click();
          assert((await game.getByRole('alert').innerText()).includes(ALIAS_COPY[lang].needCategories));
          await topicBoxes.nth(0).check(); await topicBoxes.nth(1).check();
          assert.equal(await allTopics.evaluate(el => el.indeterminate), true);
          await game.locator('.alias-format-all').click(); await game.locator('.alias-level-hard').click();
          const readState = () => page.evaluate(lang => JSON.parse(localStorage.getItem(`nickolasgames-alias-teams-v1-${lang}`)), lang);
          assert.deepEqual((await readState()).topics, topicNames.slice(0, 2));
          await page.reload();
          await picker.locator('summary').waitFor();
          assert((await picker.locator('summary').innerText()).includes(topicNames[0]));
          assert.deepEqual((await readState()).topics, topicNames.slice(0, 2));
          await picker.locator('summary').click();
          assert.equal(await picker.locator('.alias-category-option:not(.is-all) input:checked').count(), 2);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          await game.locator('.alias-settings').screenshot({ path: path.join(output, `topics-${lang}-${width}-${engine}.png`) });
          await allTopics.check();
          assert.equal((await readState()).category, '__all__');
          assert.equal(await picker.locator('.alias-category-option:not(.is-all) input:checked').count(), topicNames.length);
          await topicBoxes.nth(0).uncheck();
          assert.equal((await readState()).topics.length, topicNames.length - 1);
          await allTopics.check(); await allTopics.uncheck();
          await topicBoxes.nth(0).check(); await topicBoxes.nth(1).check();
          await game.locator('.alias-format-words').click();
          assert.deepEqual((await readState()).topics, topicNames.slice(0, 2));
          await game.locator('.alias-format-all').click();
          await game.getByRole('button', { name: ALIAS_COPY[lang].start, exact: true }).click();
          await game.locator('.alias-dice-stage').waitFor();
          const started = await readState();
          const bank = aliasCategories(COPY[lang].games.alias.c, COPY[lang].games.crocodile.c, ALIAS_WORDS[lang]);
          assert.deepEqual([...started.deck].sort(), aliasPool(bank, topicNames.slice(0, 2), 'hard', 'all').sort());
          assert.equal(new Set(started.deck).size, started.deck.length);
          await page.reload(); await game.locator('.alias-dice-stage').waitFor();
          assert.deepEqual((await readState()).deck, started.deck);
        }
        const rolling = newAliasState(ALIAS_COPY.es.teams);
        rolling.teams.forEach((team, index) => { team.players = [{ id: `p-${index}-1`, name: 'Alice' }, { id: `p-${index}-2`, name: 'Bob' }]; });
        rolling.phase = 'rolling'; rolling.deck = ['Test']; rolling.rollUntil = Date.now() + 60_000;
        rolling.contenders = rolling.teams.map(team => team.id);
        rolling.pending = rolling.teams.map(team => ({ id: team.id, values: [3, 4] }));
        assert(validAliasState(rolling));
        await seedGame('es', rolling);
        const die = page.locator('.alias-dice-team.is-rolling .alias-die').first();
        await die.waitFor();
        assert.equal(await die.evaluate(el => getComputedStyle(el).animationName), 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        assert.equal(await die.evaluate(el => getComputedStyle(el).animationName), 'alias-dice-throw');
        await page.locator('.alias-dice-stage').screenshot({ path: path.join(output, `dice-rolling-${engine}.png`) });
        for (const recipient of [null, 'team-0', 'team-1']) {
          const review = newAliasState(ALIAS_COPY.uk.teams);
          review.teams.forEach((team, index) => { team.players = [{ id: `p-${index}-1`, name: 'Alice' }, { id: `p-${index}-2`, name: 'Bob' }]; });
          review.phase = 'summary'; review.deck = ['Вихідні', 'Свобода', 'Метелик', 'Метафора', 'Книга']; review.index = 4;
          review.correct = 3 + Number(recipient === 'team-0'); review.skipped = Number(recipient === null);
          review.teams[0].turns = 1; review.teams[0].points = review.correct - review.skipped;
          review.teams[1].points = recipient === 'team-1' ? 1 : recipient === null ? -1 : 0;
          review.answers = review.deck.slice(0, review.index).map((word, index) => ({ index, word, outcome: index === 3 && recipient === null ? 'skip' : 'correct', teamId: index === 3 ? recipient : 'team-0', last: index === 3 }));
          review.result = { teamId: 'team-0', correct: review.correct, skipped: review.skipped, lastTeamId: recipient, sharedPenalty: recipient === null, answers: review.answers, historyComplete: true };
          assert(validAliasState(review));
          await page.goto(origin + '/uk/');
          await seedGame('uk', review);
          await page.locator('#preview .tabs').getByRole('button', { name: 'Alias', exact: true }).click();
          const summary = page.locator('.alias-round-summary');
          await summary.locator('.alias-review-details>summary').click();
          const outcome = recipient === null ? 'skip' : 'correct';
          const lastRow = summary.locator(`.alias-review-${outcome} li`).filter({ hasText: 'Метафора' });
          assert.equal(await lastRow.count(), 1);
          assert((await lastRow.locator('small').innerText()).includes(recipient === null ? ALIAS_COPY.uk.sharedPenaltyLabel : review.teams.find(team => team.id === recipient).name + ' +1'));
          assert.equal(await summary.locator('.alias-word-review li').count(), 4);
          assert.deepEqual(await summary.locator('.alias-result-metrics dd').allTextContents(), ['3', '0']);
          if (recipient === null) await summary.screenshot({ path: path.join(output, `summary-last-missed-${engine}.png`) });
          await page.reload();
          const restoredWord = page.locator(`.alias-review-${outcome} li>span`).filter({ hasText: /^Метафора$/ });
          await restoredWord.waitFor({ state: 'attached' });
          assert.equal(await restoredWord.count(), 1);
        }
        await page.addInitScript(() => {
          globalThis.__answerTones = [];
          const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
          if (!Context) return;
          const create = Context.prototype.createOscillator;
          Context.prototype.createOscillator = function (...args) {
            const node = create.apply(this, args), start = node.start;
            node.start = function (...times) {
              globalThis.__answerTones.push(Math.round(node.frequency.value * 100) / 100);
              return start.apply(this, times);
            };
            return node;
          };
        });
        const audioState = newAliasState(ALIAS_COPY.uk.teams);
        audioState.teams.forEach((team, index) => { team.players = [{ id: `a-${index}`, name: 'Alice' }, { id: `b-${index}`, name: 'Bob' }]; });
        audioState.phase = 'ready'; audioState.deck = ['Книга', 'Метафора', 'Вихідні', 'Свобода', 'Метелик', 'Кіт'];
        assert(validAliasState(audioState));
        await page.goto(origin + '/uk/');
        await seedGame('uk', audioState);
        const audioGame = page.locator('.alias-game');
        const hasAudio = await page.evaluate(() => Boolean(globalThis.AudioContext || globalThis.webkitAudioContext));
        const checkTones = async expected => {
          if (hasAudio) await page.waitForFunction(count => globalThis.__answerTones.length === count, expected.length);
          assert.deepEqual(await page.evaluate(() => globalThis.__answerTones), hasAudio ? expected : []);
        };
        const checkIndex = expected => page.waitForFunction(index => JSON.parse(localStorage.getItem('nickolasgames-alias-teams-v1-uk')).index === index, expected);
        await audioGame.getByRole('button', { name: ALIAS_COPY.uk.startRound, exact: true }).click();
        assert.deepEqual(await page.evaluate(() => globalThis.__answerTones), []);
        const swipe = async distance => {
          const card = audioGame.locator('.alias-word-card'); await card.scrollIntoViewIfNeeded();
          const box = await card.boundingBox();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2 + distance, box.y + box.height / 2, { steps: 8 }); await page.mouse.up();
        };
        const positive = [523.25, 659.25, 783.99], negative = [293.66, 220];
        await swipe(95); await checkIndex(1); await checkTones(positive);
        await swipe(-95); await checkIndex(2); await checkTones([...positive, ...negative]);
        await swipe(20); await checkIndex(2); await checkTones([...positive, ...negative]);
        await audioGame.locator('.alias-correct').click(); await checkIndex(3); await checkTones([...positive, ...negative, ...positive]);
        await audioGame.locator('.alias-swipe-actions .alias-skip').click(); await checkIndex(4); await checkTones([...positive, ...negative, ...positive, ...negative]);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nickolasgames-alias-teams-v1-uk')).teams[0].points), 0);
        await page.reload(); await audioGame.locator('.alias-turn-heading').waitFor();
        assert.deepEqual(await page.evaluate(() => globalThis.__answerTones), []);
        await audioGame.locator('.alias-correct').click(); await checkIndex(5); await checkTones(positive);
        await page.evaluate(() => { globalThis.__answerTones = []; });
        await page.clock.install(); await page.clock.fastForward(61_000);
        await audioGame.locator('.alias-last-awards').waitFor();
        await audioGame.getByRole('button', { name: ALIAS_COPY.uk.nobody, exact: true }).click();
        assert.equal(await page.evaluate(() => globalThis.__answerTones.filter(frequency => [523.25, 659.25, 783.99, 293.66, 220].includes(frequency)).length), 0);
        assert.deepEqual(errors, []);
        console.log(`${engine}: PASS dice, rules, topics, languages, final-card review, ${hasAudio ? 'real swipe/button audio' : 'graceful no-audio mode (Web Audio unavailable)'}, reload and timeout`);
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
