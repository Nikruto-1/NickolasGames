const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const { CHARADES_RULES, CHARADES_COPY, CHARADES_TIME_COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/charades.js')));
  const { COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/index.js')));
  const { CHARADES_MODES } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/charades-modes.js')));
  const root = path.resolve(__dirname, '../../wwwroot');
  const output = process.env.QA_OUTPUT || path.join(os.tmpdir(), 'nickolasgames-charades-qa');
  await fs.mkdir(output, { recursive: true });
  const server = http.createServer(async (req, res) => {
    let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    try {
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      const data = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = process.env.QA_ORIGIN || `http://127.0.0.1:${server.address().port}`;
  try {
    for (const engine of (process.env.QA_ENGINE ? [process.env.QA_ENGINE] : ['chromium', 'webkit'])) {
      const browser = await (engine === 'webkit' ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'msedge', headless: true }));
      try {
        for (const [lang, width] of [['uk', 1440], ['uk', 390], ['uk', 320], ['en', 390], ['sv', 390], ['de', 390], ['es', 390]]) {
          const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
          try {
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            await page.goto(origin + (lang === 'en' ? '/' : `/${lang}/`));
            await page.locator('#preview .tabs').getByRole('button', { name: COPY[lang].games.crocodile.n, exact: true }).click();
            const game = page.locator('.charades-game'), rules = game.locator('.charades-rules');
            assert.equal(await game.locator('.charades-description').innerText(), CHARADES_RULES[lang].description);
            assert.equal(await rules.getAttribute('open'), null);
            await rules.locator('summary').click();
            assert.deepEqual(await rules.locator('h3').allTextContents(), CHARADES_RULES[lang].sections.map(section => section.title));
            assert.deepEqual(await rules.locator('ul li').allTextContents(), CHARADES_RULES[lang].sections.flatMap(section => section.items));
            assert(await rules.locator('ul li').evaluateAll(items => items.every(item => {
              const style = getComputedStyle(item);
              return parseFloat(style.fontSize) >= 16 && parseFloat(style.lineHeight) >= 25 && item.scrollWidth <= item.clientWidth;
            })));
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await game.screenshot({ path: path.join(output, `charades-rules-${lang}-${width}-${engine}.png`) });
            await rules.locator('summary').press('Space'); assert.equal(await rules.getAttribute('open'), null);
            if (lang === 'uk' && width === 390) {
              const copy = CHARADES_COPY.uk;
              for (const timed of [false, true]) {
                if (timed) {
                  page.once('dialog', dialog => dialog.accept());
                  await game.getByRole('button', { name: copy.newGame, exact: true }).first().click();
                } else {
                  for (const name of ['Микола', 'Оля']) {
                    await game.locator('#score-player-name').fill(name);
                    await game.getByRole('button', { name: copy.add, exact: true }).click();
                  }
                }
                await game.getByRole('button', { name: timed ? CHARADES_TIME_COPY.uk.minute : CHARADES_TIME_COPY.uk.noTime, exact: true }).click();
                await game.getByRole('button', { name: copy.start, exact: true }).click();
                await game.getByRole('button', { name: copy.reveal, exact: true }).click();
                await game.locator('.charades-option.easy').click();
                const snapshot = () => page.evaluate(() => JSON.parse(localStorage.getItem('nickolasgames-charades-v2-uk')));
                const before = await snapshot();
                assert.equal(before.phase, 'acting'); assert.equal(before.timed, timed);
                await rules.locator('summary').click(); assert.deepEqual(await snapshot(), before);
                await page.reload(); await game.locator('.charades-word').waitFor();
                assert.deepEqual(await snapshot(), before);
                await game.getByRole('button', { name: copy.guessed, exact: true }).click();
                await game.locator('.charades-guesser .players-actions button').click();
                const after = await snapshot();
                assert.equal(after.phase, 'handoff');
                assert.equal(after.lastResult.guesserPoints, 1);
                assert.equal(after.lastResult.presenterPoints, timed ? 3 : 1);
              }
            }
            const mode = CHARADES_MODES[lang], copy = CHARADES_COPY[lang];
            if (lang === 'uk' && width === 390) {
              page.once('dialog', dialog => dialog.accept());
              await game.getByRole('button', { name: copy.newGame, exact: true }).first().click();
            } else {
              for (const name of ['Микола', 'Оля']) {
                await game.locator('#score-player-name').fill(name);
                await game.getByRole('button', { name: copy.add, exact: true }).click();
              }
            }
            const longName = 'Анастасія-Марія з дуже довгим іменем';
            await game.locator('#score-player-name').fill(longName);
            await game.getByRole('button', { name: copy.add, exact: true }).click();
            await game.locator('#target-score').fill('6');
            await game.getByRole('button', { name: CHARADES_TIME_COPY[lang].noTime, exact: true }).click();
            await game.getByRole('button', { name: mode.guesser, exact: true }).click();
            assert.equal(await game.locator('.head h2').innerText(), mode.title);
            await rules.locator('summary').click();
            assert.deepEqual(await rules.locator('h3').allTextContents(), [...mode.sections.slice(0, 2), ...CHARADES_RULES[lang].sections.slice(2, 4), mode.sections[2]].map(section => section.title));
            await rules.locator('summary').click();
            await game.getByRole('button', { name: copy.start, exact: true }).click();
            const snapshot = () => page.evaluate(() => JSON.parse(localStorage.getItem('nickolasgames-charades-v2-' + document.documentElement.lang)));
            const draw = game.locator('.charades-draw');
            assert.equal((await snapshot()).phase, 'dice');
            assert.equal(await game.locator('.charades-word').count(), 0);
            await page.evaluate(() => { Math.random = () => .99; });
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await draw.getByRole('button', { name: mode.roll, exact: true }).click();
            await draw.locator('.is-rolling').first().waitFor();
            assert.notEqual(await draw.locator('.is-rolling .charades-die').first().evaluate(node => getComputedStyle(node).animationName), 'none');
            assert.equal(await draw.getByRole('button').isDisabled(), true);
            await draw.getByText(mode.tie, { exact: true }).waitFor();
            assert.equal((await snapshot()).draw.contenders.length, 3);
            await page.evaluate(() => { const values = [0, 0, .2, .2, .99, .99]; Math.random = () => values.shift() ?? .99; });
            await draw.getByRole('button', { name: mode.roll, exact: true }).click();
            await page.reload();
            await draw.getByRole('button', { name: mode.continue, exact: true }).waitFor();
            await page.waitForFunction(() => JSON.parse(localStorage.getItem('nickolasgames-charades-v2-' + document.documentElement.lang))?.phase === 'diceResult');
            const result = await snapshot();
            assert.equal(result.phase, 'diceResult'); assert.equal(result.activeId, result.players[2].id);
            assert.deepEqual(await draw.locator('.charades-draw-score').allTextContents(), ['1 + 1 = 2', '2 + 2 = 4', '6 + 6 = 12']);
            await page.waitForTimeout(400); assert.equal((await snapshot()).phase, 'diceResult');
            assert.equal(await game.locator('.charades-word').count(), 0);
            assert.equal(await game.locator('[role="timer"]').count(), 0);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await draw.locator('.charades-die').evaluateAll(dice => dice.every(die => die.getBoundingClientRect().width > 40 && die.childElementCount > 0)));
            await draw.screenshot({ path: path.join(output, `charades-dice-${lang}-${width}-${engine}.png`) });
            await draw.getByRole('button', { name: mode.continue, exact: true }).click();
            await game.getByRole('button', { name: copy.reveal, exact: true }).click();
            await game.locator('.charades-option.hard').click();
            const firstWord = await game.locator('.charades-word').innerText();
            await game.getByRole('button', { name: copy.skip, exact: true }).click();
            assert.equal((await snapshot()).activeId, result.activeId);
            await game.getByRole('button', { name: copy.reveal, exact: true }).click();
            await game.locator('.charades-option.hard').click();
            assert.notEqual(await game.locator('.charades-word').innerText(), firstWord);
            await game.getByRole('button', { name: copy.guessed, exact: true }).click();
            await game.locator('.charades-guesser').getByRole('button', { name: 'Оля +3', exact: true }).click();
            const after = await snapshot(); assert.equal(after.activeId, after.players[1].id); assert.equal(after.phase, 'handoff');
            assert.deepEqual(after.players.map(player => player.points), [0, 3, 3]);
            await page.reload(); await game.getByRole('button', { name: copy.reveal, exact: true }).waitFor();
            assert.deepEqual(await snapshot(), after);
            assert.equal(await game.locator('.charades-word').count(), 0);
            await game.getByRole('button', { name: copy.reveal, exact: true }).click();
            await game.locator('.charades-option.hard').click();
            await game.getByRole('button', { name: copy.guessed, exact: true }).click();
            await game.locator('.charades-guesser').getByRole('button', { name: 'Микола +3', exact: true }).click();
            assert.equal((await snapshot()).phase, 'finished');
            assert.deepEqual((await snapshot()).winners, [after.players[1].id]);
            assert.deepEqual(errors, []);
          } finally { await page.close(); }
        }
        console.log(`${engine}: PASS both Charades modes, five languages, 320/390/1440px, animated dice, tie reroll, saved draw, guesser handoff, skip, target and legacy saves`);
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
