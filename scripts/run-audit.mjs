import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const npmCli = path.join(
  path.dirname(process.execPath),
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js',
);
const result = spawnSync(
  process.execPath,
  [npmCli, 'audit', '--audit-level=high', '--ignore-scripts', '--omit=optional'],
  { stdio: 'inherit', windowsHide: true },
);
process.exitCode = result.status ?? 1;
