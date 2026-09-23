import path from 'node:path';
import { relativeResultPath, sortResultPaths } from '../../src/find/result-paths.mjs';

test('formats a portable relative result path', () => {
  expect(relativeResultPath(path.win32, 'C:\\repo', 'C:\\repo\\src', 'file.mjs')).toBe('src/file.mjs');
});

test('sorts result paths in place', () => {
  const results = ['b.mjs', 'a.mjs'];
  expect(sortResultPaths(results)).toEqual(['a.mjs', 'b.mjs']);
});
