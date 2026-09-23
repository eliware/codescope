import { isCodeExtension, matchesFile, TEST_FILE_PATTERN } from '../../src/find/extensions.mjs';
import { findFiles, findMjsFiles } from '../../src/find/files.mjs';

const file = (name) => ({ name, isFile: () => true });

test('recognizes supported implementation extensions', () => {
  expect(isCodeExtension('.mjs')).toBe(true);
  expect(isCodeExtension('.ts')).toBe(true);
  expect(isCodeExtension(['.js', '.cjs', '.mjs', '.ts'])).toBe(true);
  expect(isCodeExtension(['.MJS'])).toBe(true);
  expect(isCodeExtension('.md')).toBe(false);
});

test('matches code and exact test extensions', () => {
  expect(matchesFile('app.MJS', '.mjs', false, false)).toBe(true);
  expect(matchesFile('app.mjs', '.MJS', false, false)).toBe(true);
  expect(matchesFile('app.MJS', ['.MJS'], false, false)).toBe(true);
  expect(matchesFile('app.md', '.mjs', false, false)).toBe(false);
  expect(matchesFile('README.md', '.md', false, false)).toBe(true);
  expect(matchesFile('app.test.ts', '.ts', false, true)).toBe(false);
  expect(matchesFile('app.test.mjs', ['.js', '.mjs', '.cjs', '.ts'], false, true)).toBe(false);
  expect(matchesFile('app.test.mjs', ['.js', '.mjs', '.cjs', '.ts'], true, false)).toBe(true);
  expect(matchesFile('app.test.ts', ['.js', '.mjs', '.cjs', '.ts'], true, false)).toBe(true);
  expect(matchesFile('app.ts', ['.js', '.cjs', '.mjs', '.ts'], true, false)).toBe(false);
  expect(TEST_FILE_PATTERN.test('app.test.cjs')).toBe(true);
});

test('matches uppercase extensions and test suffixes consistently', async () => {
  const entries = [file('APP.MJS'), file('APP.TEST.MJS')];
  const readDirectory = async () => entries;
  expect(await findMjsFiles('/root', { readDirectory })).toEqual(['APP.MJS', 'APP.TEST.MJS']);
  expect(await findMjsFiles('/root', { readDirectory, noTests: true })).toEqual(['APP.MJS']);
  expect(await findMjsFiles('/root', { readDirectory, testsOnly: true })).toEqual(['APP.TEST.MJS']);
});

test('classifies JavaScript test extensions separately from implementation', async () => {
  const entries = [file('app.js'), file('app.test.js'), file('app.cjs'), file('app.test.cjs')];
  const readDirectory = async () => entries;
  const codeExtensions = ['.js', '.cjs', '.mjs'];
  expect(await findFiles('/root', codeExtensions, { readDirectory })).toEqual([
    'app.cjs', 'app.js', 'app.test.cjs', 'app.test.js',
  ]);
  expect(await findFiles('/root', codeExtensions, { readDirectory, noTests: true })).toEqual([
    'app.cjs', 'app.js',
  ]);
  expect(await findFiles('/root', codeExtensions, { readDirectory, testsOnly: true })).toEqual([
    'app.test.cjs', 'app.test.js',
  ]);
});
