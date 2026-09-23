import path from 'node:path';
import { resolveJsonPath } from '../../../src/combine/json/paths.mjs';

test('rejects JSON paths outside the review root', () => {
  expect(() => resolveJsonPath('/repo', '../outside.json', path.posix)).toThrow(/escapes review root/);
  expect(() => resolveJsonPath('/repo', 'C:\\outside.json', path.win32)).toThrow(/escapes review root/);
});

test('uses the default path API for safe JSON paths', () => {
  expect(resolveJsonPath('/repo', 'nested/file.json')).toContain('repo');
});
