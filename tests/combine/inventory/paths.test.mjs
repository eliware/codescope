import path from 'node:path';
import { resolveInventoryPath, selectInventoryFiles } from '../../../src/combine/inventory/paths.mjs';

test('filters included content and normalizes separators', () => {
  expect(selectInventoryFiles('repo', ['src\\a.mjs', 'package.json'], path.posix, (file) => file === 'package.json')).toEqual(['src/a.mjs']);
});

test('rejects absolute and escaping inventory paths', () => {
  expect(() => resolveInventoryPath('repo', '/outside', path.posix)).toThrow(/escapes/);
  expect(() => resolveInventoryPath('repo', '../outside', path.posix)).toThrow(/escapes/);
});
