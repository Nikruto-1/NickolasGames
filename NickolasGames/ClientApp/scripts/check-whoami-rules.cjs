const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const { WHOAMI_RULES, WHOAMI_UI } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/whoami-ui.js')));
  const { COPY } = await import(pathToFileURL(path.resolve(__dirname, '../src/locales/index.js')));
  const root = path.resolve(__dirname, '../../wwwroot');
  const output = process.env.QA_OUTPUT || path.join(os.tmpdir(), 'nickolasgames-whoami-qa');
  await fs.mkdir(output, { recursive: true });
  const server = http.createServer(async (req, res) => {
    let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    try {
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      const data = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data);
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
            await page.locator('#preview .tabs').getByRole('button', { name: COPY[lang].games.whoami.n, exact: true }).click();
            const game = page.locator('.whoami-game'), rules = game.locator('.whoami-rules');
            assert.equal(await game.locator('.whoami-description').innerText(), WHOAMI_RULES[lang].description);
            assert.equal(await rules.getAttribute('open'), null);
            await rules.locator('summary').click();
            assert.deepEqual(await rules.locator('h3').allTextContents(), WHOAMI_RULES[lang].sections.map(section => section.title));
            assert.deepEqual(await rules.locator('ul li').allTextContents(), WHOAMI_RULES[lang].sections.flatMap(section => section.items));
            assert(await rules.locator('ul li').evaluateAll(items => items.every(item => {
              const style = getComputedStyle(item);
              return parseFloat(style.fontSize) >= 16 && parseFloat(style.lineHeight) >= 25 && item.scrollWidth <= item.clientWidth;
            })));
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await game.screenshot({ path: path.join(output, `whoami-rules-${lang}-${width}-${engine}.png`) });
            await rules.locator('summary').press('Space'); assert.equal(await rules.getAttribute('open'), null);
            if (lang === 'uk' && width === 390) {
              for (const name of ['Микола', 'Оля']) {
                await game.locator('#whoami-name').fill(name);
                await game.locator('.players-panel form').first().locator('button').click();
              }
              await game.getByRole('button', { name: WHOAMI_UI.uk.start, exact: true }).click();
              await game.locator('.whoami-tile').first().waitFor();
              const snapshot = () => page.evaluate(() => JSON.parse(localStorage.getItem('nickolasgames-whoami-v2-uk')));
              const before = await snapshot();
              await rules.locator('summary').click(); assert.deepEqual(await snapshot(), before);
              await game.locator('.whoami-tile').first().click();
              const dialog = page.locator('.whoami-overlay');
              assert.equal(await dialog.locator('.whoami-big-word').innerText(), WHOAMI_UI.uk.hidden);
              await dialog.getByRole('button', { name: WHOAMI_UI.uk.hold, exact: true }).press('Space');
              assert.equal(await dialog.locator('.whoami-big-word').innerText(), WHOAMI_UI.uk.hidden);
              await dialog.locator('header button').click();
              assert.deepEqual(await snapshot(), before);
              await page.reload(); await game.locator('.whoami-tile').first().waitFor();
              assert.deepEqual((await snapshot()).players, before.players);
              assert.equal(await page.locator('.whoami-overlay').count(), 0);
              assert((await game.locator('.whoami-status').allTextContents()).every(text => text === WHOAMI_UI.uk.hidden));
            }
            assert.deepEqual(errors, []);
          } finally { await page.close(); }
        }
        console.log(`${engine}: PASS Who Am I description/rules, five languages, 320/390/1440px, keyboard, privacy and saved game`);
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
