import { findFiles, findMjsFiles, findMdFiles, findAllFiles } from '../../src/find/files.mjs';
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
      directory('coverage'),
      directory('.nyc_output'),
      file('a.mjs'),
      file('guide.md'),
      directory('src'),
    ],
    [path.join(root, 'z')]: [file('deep.mjs'), file('deep.test.mjs')],
    [path.join(root, 'src')]: [directory('coverage')],
    [path.join(root, 'src', 'coverage')]: [file('legitimate.mjs')],
  };
  const readDirectory = async (root) => tree[root] ?? [];
  expect(await findMjsFiles(root, { readDirectory })).toEqual([
    'a.mjs',
    'src/coverage/legitimate.mjs',
    'z/deep.mjs',
    'z/deep.test.mjs',
  ]);
  expect(await findMjsFiles(root, { readDirectory, noTests: true })).toEqual([
    'a.mjs',
    'src/coverage/legitimate.mjs',
    'z/deep.mjs',
  ]);
  expect(await findMjsFiles(root, { readDirectory, testsOnly: true })).toEqual(['z/deep.test.mjs']);
  expect(await findMdFiles(root, { readDirectory })).toEqual(['guide.md']);
});

test('uses explicit POSIX path semantics when requested', async () => {
  await expect(findFiles('/virtual-root', '.mjs', {
    platform: 'linux',
    readDirectory: async () => [],
  })).resolves.toEqual([]);
});

test('keeps duplicate discovered paths deterministically ordered', async () => {
  await expect(findFiles('/virtual-root', '.mjs', {
    readDirectory: async () => [file('same.mjs'), file('same.mjs')],
  })).resolves.toEqual(['same.mjs', 'same.mjs']);
});

test('finds files with default options', async () => {
  await expect(findFiles(process.cwd(), '.mjs')).resolves.toContain('src/cli/main.mjs');
});
test('rejects a symlinked scan root', async () => {
  await expect(
    findFiles('fixture-root', '.mjs', {
      readDirectory: async () => [],
       inspectRoot: async () => ({ isSymbolicLink: () => true, isDirectory: () => true }),
    }),
  ).rejects.toThrow('symlinked scan roots');
});

test('inspects the scan root even with an injected directory reader', async () => {
  const inspected = [];
  const inspectRoot = async (root) => {
    inspected.push(root);
    return { isSymbolicLink: () => false, isDirectory: () => true };
  };
  await findFiles('/virtual-root', '.mjs', { readDirectory: async () => [], inspectRoot });
  expect(inspected).toEqual([path.resolve('/virtual-root')]);
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

test('findAllFiles exposes the unrestricted extension strategy', async () => {
  await expect(
    findAllFiles('/root', {
      readDirectory: async () => [],
      inspectRoot: async () => ({ isSymbolicLink: () => false, isDirectory: () => true }),
    }),
  ).resolves.toEqual([]);
});
