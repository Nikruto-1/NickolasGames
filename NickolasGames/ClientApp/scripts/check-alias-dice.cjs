const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function main() {
  const { newAliasState, validAliasState } = await import(pathToFileURL(path.resolve(__dirname, '../src/utils/alias.js')));
  const { ALIAS_COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/alias.js')));
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
    for (const engine of ['chromium', 'webkit']) {
      const browser = await (engine === 'chromium' ? chromium.launch({ channel: process.env.QA_CHROMIUM_CHANNEL || 'msedge', headless: true }) : webkit.launch({ headless: true }));
      try {
        // Keep visual fixtures independent of offline-cache updates during rapid reloads.
        const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
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
          await page.evaluate(({ lang, state }) => localStorage.setItem(`nickolasgames-alias-teams-v1-${lang}`, JSON.stringify(state)), { lang, state });
          await page.reload();
          await page.locator('#preview .tabs').getByRole('button', { name: 'Alias', exact: true }).click();
          const game = page.locator('.alias-game');
          await game.locator('.alias-dice-result').waitFor();
          assert.equal(await game.locator('.alias-scores').count(), 0);
          assert.equal(await game.locator('.alias-dice-team.is-winner').count(), 1);
          assert.deepEqual(await game.locator('.alias-die').evaluateAll(dice => dice.map(die => ({ value: Number(die.dataset.value), pips: die.querySelectorAll('.alias-die-pip').length }))), state.dice.flatMap(roll => roll.values.map(value => ({ value, pips: value }))));
          assert.deepEqual(await game.locator('.alias-dice-score>strong').allTextContents(), state.dice.map(roll => String(roll.values[0] + roll.values[1])));
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          assert(await game.locator('.alias-dice-team').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth)));
          await game.locator('.alias-dice-stage').screenshot({ path: path.join(output, `dice-${lang}-${width}-${engine}.png`) });
          await game.getByRole('button', { name: ALIAS_COPY[lang].continueDice, exact: true }).click();
          await game.locator('.alias-ready').waitFor();
          assert.equal(await game.locator('.alias-scores').count(), 1);
        }
        const rolling = newAliasState(ALIAS_COPY.es.teams);
        rolling.teams.forEach((team, index) => { team.players = [{ id: `p-${index}-1`, name: 'Alice' }, { id: `p-${index}-2`, name: 'Bob' }]; });
        rolling.phase = 'rolling'; rolling.deck = ['Test']; rolling.rollUntil = Date.now() + 60_000;
        rolling.contenders = rolling.teams.map(team => team.id);
        rolling.pending = rolling.teams.map(team => ({ id: team.id, values: [3, 4] }));
        assert(validAliasState(rolling));
        await page.evaluate(state => localStorage.setItem('nickolasgames-alias-teams-v1-es', JSON.stringify(state)), rolling);
        await page.reload();
        const die = page.locator('.alias-dice-team.is-rolling .alias-die').first();
        await die.waitFor();
        assert.equal(await die.evaluate(el => getComputedStyle(el).animationName), 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        assert.equal(await die.evaluate(el => getComputedStyle(el).animationName), 'alias-dice-throw');
        await page.locator('.alias-dice-stage').screenshot({ path: path.join(output, `dice-rolling-${engine}.png`) });
        assert.deepEqual(errors, []);
        console.log(`${engine}: PASS dice faces 1-6, totals, winner, scoreboard timing, long names, 320/390/1440px, all languages, animation and reduced motion`);
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
