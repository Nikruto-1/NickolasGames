import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultRepo = resolve(project, '../..');
const prefix = 'NickolasGames/wwwroot/assets/';

export function preserveAssets({ repo = defaultRepo, output = resolve(repo, prefix), limit = 20 } = {}) {
  const git = args => execFileSync('git', args, { cwd: repo });
  const commits = git(['log', '-n', String(limit), '--format=%H', '--', prefix])
    .toString().trim().split(/\s+/).filter(Boolean);
  let retained = 0;
  for (const commit of commits) {
    const paths = git(['ls-tree', '-r', '--name-only', '-z', commit, '--', prefix])
      .toString().split('\0').filter(Boolean);
    for (const path of paths) {
      if (!path.startsWith(prefix)) continue;
      const destination = resolve(output, path.slice(prefix.length));
      if (existsSync(destination)) continue;
      // Hashed files are immutable: never replace an asset from the current build.
      mkdirSync(dirname(destination), { recursive: true });
      // Stream binary blobs to disk: HD images exceed execFileSync's stdout buffer.
      const temporary = destination + '.restoring';
      const descriptor = openSync(temporary, 'w');
      try {
        try {
          execFileSync('git', ['show', commit + ':' + path], {
            cwd: repo, stdio: ['ignore', descriptor, 'pipe']
          });
        } finally { closeSync(descriptor); }
        renameSync(temporary, destination);
      } catch (error) {
        if (existsSync(temporary)) unlinkSync(temporary);
        throw error;
      }
      retained++;
    }
  }
  return retained;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Retained ' + preserveAssets() + ' previous application assets for cached pages.');
}
