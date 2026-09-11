import path from 'node:path';
import { resolveNpmCommand } from '../../src/review/npm-command.mjs';

test('resolves platform fallback commands', () => {
  expect(resolveNpmCommand('linux', null, 'missing/npm-cli.js').at(-1)).toEqual([
    'npm',
    ['test'],
    false,
  ]);
  expect(resolveNpmCommand('win32', null, 'missing/npm-cli.js').at(-1)).toEqual([
    'npm.cmd',
    ['test'],
    false,
  ]);
});

test('accepts an existing absolute npm cli path', () => {
  const candidate = path.resolve('node_modules/npm/bin/npm-cli.js');
  const commands = resolveNpmCommand('linux', candidate, candidate);
  expect(commands.at(-1)[1]).toEqual(['test']);
});
