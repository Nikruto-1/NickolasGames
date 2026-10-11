import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { preserveAssets } from '../scripts/preserve-assets.mjs';

test('deployment retains old hashed files without replacing the current build', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nickolasgames-assets-'));
  const repo = join(directory, 'repo');
  const output = join(directory, 'deployment', 'assets');
  const prefix = 'NickolasGames/wwwroot/assets';
  await mkdir(join(repo, prefix), { recursive: true });
  const git = args => execFileSync('git', args, { cwd: repo, stdio: 'pipe' });
  const commit = message => {
    git(['add', '.']);
    git(['-c', 'user.name=Asset test', '-c', 'user.email=asset-test@example.test', 'commit', '-m', message]);
  };
  try {
    git(['init']);
    await writeFile(join(repo, prefix, 'index-old.js'), 'old application');
    await writeFile(join(repo, prefix, 'index-old.css'), 'old styles');
    commit('old build');
    await rm(join(repo, prefix, 'index-old.js'));
    await rm(join(repo, prefix, 'index-old.css'));
    await writeFile(join(repo, prefix, 'index-new.js'), 'committed new application');
    commit('new build');
    await mkdir(output, { recursive: true });
    await writeFile(join(output, 'index-new.js'), 'current build');
    assert.equal(preserveAssets({ repo, output }), 2);
    assert.equal(await readFile(join(output, 'index-old.js'), 'utf8'), 'old application');
    assert.equal(await readFile(join(output, 'index-old.css'), 'utf8'), 'old styles');
    assert.equal(await readFile(join(output, 'index-new.js'), 'utf8'), 'current build');
    assert.equal(preserveAssets({ repo, output }), 0);
    const recentOnly = join(directory, 'recent', 'assets');
    preserveAssets({ repo, output: recentOnly, limit: 1 });
    assert.equal(await readFile(join(recentOnly, 'index-new.js'), 'utf8'), 'committed new application');
    await assert.rejects(readFile(join(recentOnly, 'index-old.js')), { code: 'ENOENT' });
  } finally {
    assert(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    await rm(directory, { recursive: true, force: true });
  }
});
