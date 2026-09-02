import { findFiles, findMjsFiles, findMdFiles } from '../src/find-mjs.mjs';
import path from 'node:path';

const file = (name) => ({ name, isFile: () => true });
const directory = (name) => ({ name, isDirectory: () => true });

test('walks directories, ignores infrastructure, and sorts results', async () => {
  const root = path.resolve('fixture-root');
  const tree = {
    [root]: [
      directory('z'),
      directory('.git'),
      directory('node_modules'),
      file('a.mjs'),
      file('guide.md'),
    ],
    [path.join(root, 'z')]: [file('deep.mjs'), file('deep.test.mjs')],
  };
  const readDirectory = async (root) => tree[root] ?? [];
  expect(await findMjsFiles(root, { readDirectory })).toEqual([
    'a.mjs',
    'z/deep.mjs',
    'z/deep.test.mjs',
  ]);
  expect(await findMjsFiles(root, { readDirectory, noTests: true })).toEqual([
    'a.mjs',
    'z/deep.mjs',
  ]);
  expect(await findMjsFiles(root, { readDirectory, testsOnly: true })).toEqual(['z/deep.test.mjs']);
  expect(await findMdFiles(root, { readDirectory })).toEqual(['guide.md']);
});
// codescope ignore: injected reader root symlink rejection is directly covered here; adapter-owned entry metadata is intentionally not revalidated by the scanner.
test('rejects a symlinked scan root', async () => {
  await expect(
    findFiles('fixture-root', '.mjs', {
      readDirectory: async () => [],
      inspectRoot: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow('symlinked scan roots');
});

test('rejects invalid roots, entries, and directory results', async () => {
  await expect(findFiles(null, '.mjs', { readDirectory: async () => [] })).rejects.toThrow(
    'path string',
  );
  if (process.platform !== 'win32')
    await expect(findFiles('C:\\root', '.mjs', { readDirectory: async () => [] })).rejects.toThrow(
      'Windows-style',
    );
  await expect(
    findFiles('C:\\root', '.mjs', { platform: 'linux', readDirectory: async () => [] }),
  ).rejects.toThrow('Windows-style');
  await expect(
    findFiles('C:\\root', '.mjs', { platform: 'win32', readDirectory: async () => [] }),
  ).resolves.toEqual([]);
  for (const entry of [
    { name: '' },
    { name: '.' },
    { name: '..' },
    { name: 'a/b' },
    { name: 'a\\b' },
  ])
    await expect(
      findFiles('/root', '.mjs', { readDirectory: async () => [entry] }),
    ).rejects.toThrow('Invalid directory entry name');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => null })).rejects.toThrow(
    'non-array',
  );
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => {
        throw new Error('denied');
      },
    }),
  ).rejects.toThrow('denied');
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => {
        throw 'string failure';
      },
    }),
  ).rejects.toThrow('string failure');
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => [
        {
          name: 'bad',
          isFile: () => {
            throw new Error('adapter');
          },
        },
      ],
    }),
  ).rejects.toThrow('adapter');
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => [
        {
          name: 'bad',
          isFile: () => {
            throw 'string adapter';
          },
        },
      ],
    }),
  ).rejects.toThrow('string adapter');
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => [{ name: 'bad', isFile: () => true, isDirectory: () => true }],
    }),
  ).rejects.toThrow('Invalid directory entry');
  await expect(
    findFiles('/root', '.mjs', {
      readDirectory: async () => [{ name: 'bad', isFile: () => false, isDirectory: () => false }],
    }),
  ).rejects.toThrow('Invalid directory entry');
});

test('skips symlinks and nonmatching files', async () => {
  const entries = [
    { name: 'link.mjs', isSymbolicLink: () => true, isFile: () => true },
    file('a.js'),
    file('a.test.mjs'),
    file('readme.md'),
  ];
  expect(await findMjsFiles('/root', { readDirectory: async () => entries })).toEqual([
    'a.test.mjs',
  ]);
  expect(
    await findMjsFiles('/root', {
      readDirectory: async () => [{ name: 'NODE_MODULES', isDirectory: () => true }],
    }),
  ).toEqual([]);
});

test('rejects contradictory test filters', async () => {
  await expect(findFiles('/root', '.mjs', { noTests: true, testsOnly: true })).rejects.toThrow(
    'cannot both be enabled',
  );
});

test('matches uppercase extensions and test suffixes consistently', async () => {
  const entries = [file('APP.MJS'), file('APP.TEST.MJS')];
  const readDirectory = async () => entries;
  expect(await findMjsFiles('/root', { readDirectory })).toEqual(['APP.MJS', 'APP.TEST.MJS']);
  expect(await findMjsFiles('/root', { readDirectory, noTests: true })).toEqual(['APP.MJS']);
  expect(await findMjsFiles('/root', { readDirectory, testsOnly: true })).toEqual(['APP.TEST.MJS']);
});
