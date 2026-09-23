import { isAbsolutePortablePath, resolveConfigPath, selectConfigFiles } from '../../../src/combine/config/paths.mjs';

test('selects GitHub and Knit configuration entries', () => {
  expect(selectConfigFiles(['README.md', '.github/workflow.yml', '.knit/check.mjs'])).toEqual([
    '.github/workflow.yml', '.knit/check.mjs',
  ]);
});

test('rejects absolute and escaping configuration paths', () => {
  expect(isAbsolutePortablePath('C:/outside')).toBe(true);
  expect(isAbsolutePortablePath('/outside')).toBe(true);
  expect(isAbsolutePortablePath('//server/share')).toBe(true);
  expect(isAbsolutePortablePath('relative/path')).toBe(false);
  expect(isAbsolutePortablePath('\\\\server\\share')).toBe(true);
  expect(() => resolveConfigPath('repo', '../outside', 'posix')).toThrow(/escapes/);
  expect(resolveConfigPath('repo', '.github/ci.yml', 'posix')).toContain('repo');
  expect(resolveConfigPath('C:\\repo', '.github\\ci.yml', 'win32')).toContain('repo');
  expect(resolveConfigPath('repo', '.github/ci.yml')).toContain('repo');
});

test('ignores unrelated inventory entries', () => {
  expect(selectConfigFiles(['.github', '.knit', 'src/app.mjs'])).toEqual([]);
});
