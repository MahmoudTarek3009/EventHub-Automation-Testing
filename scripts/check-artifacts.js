#!/usr/bin/env node
// Blocks commits and pushes that contain run output or secrets.
//   node scripts/check-artifacts.js            checks everything tracked or staged
//   node scripts/check-artifacts.js --pushed   checks the commits being pushed (reads git pre-push stdin)
const { execFileSync } = require('node:child_process');

const ZERO_SHA = /^0+$/;

function git(...args) {
  const out = execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  return out.split(/\r?\n/).filter(Boolean);
}

// The folders stay tracked through .gitkeep only.
function reasonToBlock(filePath) {
  const parts = filePath.split('/');
  const name = parts[parts.length - 1];
  const folders = parts.slice(0, -1);
  if (name === '.gitkeep') return null;
  if (folders.includes('test-results') || folders.includes('playwright-report')) {
    return 'Playwright run output';
  }
  if (parts[0] === 'tests' && folders.includes('output')) return 'test output folder';
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') return 'environment file with secrets';
  return null;
}

function pushedFiles(stdin) {
  const files = new Set();
  for (const line of stdin.split(/\r?\n/).filter(Boolean)) {
    const [, localSha, , remoteSha] = line.split(' ');
    if (ZERO_SHA.test(localSha)) continue;
    const range = ZERO_SHA.test(remoteSha) ? [localSha, '--not', '--remotes'] : [`${remoteSha}..${localSha}`];
    let changed;
    try {
      changed = git('log', '--name-only', '--diff-filter=AMR', '--format=', ...range);
    } catch {
      changed = git('ls-tree', '-r', '--name-only', localSha);
    }
    changed.forEach((file) => files.add(file));
  }
  return [...files];
}

function readStdin() {
  try {
    return require('node:fs').readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const files = process.argv.includes('--pushed') ? pushedFiles(readStdin()) : git('ls-files');
const blocked = files
  .map((file) => ({ file, reason: reasonToBlock(file) }))
  .filter((item) => item.reason);

if (blocked.length > 0) {
  console.error('Blocked: these files must not be committed or pushed:');
  for (const { file, reason } of blocked) console.error(`  ${file}  (${reason})`);
  console.error('\nOnly .gitkeep may live in test-results/, playwright-report/ and tests/**/output/.');
  console.error('Fix: git rm --cached <file>   (and keep the path in .gitignore)');
  process.exit(1);
}
