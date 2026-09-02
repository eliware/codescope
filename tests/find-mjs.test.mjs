import { findFiles, findMjsFiles, findMdFiles } from '../src/find-mjs.mjs';

const file = (name) => ({ name, isFile: () => true });
const directory = (name) => ({ name, isDirectory: () => true });

test('walks directories, ignores infrastructure, and sorts results', async () => {
  const tree = {
    '/root': [directory('z'), directory('.git'), directory('node_modules'), file('a.mjs'), file('guide.md')],
    '/root/z': [file('deep.mjs'), file('deep.test.mjs')],
  };
  const readDirectory = async (root) => tree[root] ?? [];
  expect(await findMjsFiles('/root', { readDirectory })).toEqual(['a.mjs', 'z/deep.mjs', 'z/deep.test.mjs']);
  expect(await findMjsFiles('/root', { readDirectory, noTests: true })).toEqual(['a.mjs', 'z/deep.mjs']);
  expect(await findMjsFiles('/root', { readDirectory, testsOnly: true })).toEqual(['z/deep.test.mjs']);
  expect(await findMdFiles('/root', { readDirectory })).toEqual(['guide.md']);
});

test('rejects invalid roots, entries, and directory results', async () => {
  await expect(findFiles(null, '.mjs', { readDirectory: async () => [] })).rejects.toThrow('path string');
  await expect(findFiles('C:\\root', '.mjs', { readDirectory: async () => [] })).rejects.toThrow('Windows-style');
  for (const entry of [{ name: '' }, { name: '.' }, { name: '..' }, { name: 'a/b' }, { name: 'a\\b' }])
    await expect(findFiles('/root', '.mjs', { readDirectory: async () => [entry] })).rejects.toThrow('Invalid directory entry name');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => null })).rejects.toThrow('non-array');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => { throw new Error('denied'); } })).rejects.toThrow('denied');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => { throw 'string failure'; } })).rejects.toThrow('string failure');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => [{ name: 'bad', isFile: () => { throw new Error('adapter'); } }] })).rejects.toThrow('adapter');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => [{ name: 'bad', isFile: () => { throw 'string adapter'; } }] })).rejects.toThrow('string adapter');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => [{ name: 'bad', isFile: () => true, isDirectory: () => true }] })).rejects.toThrow('Invalid directory entry');
  await expect(findFiles('/root', '.mjs', { readDirectory: async () => [{ name: 'bad', isFile: () => false, isDirectory: () => false }] })).rejects.toThrow('Invalid directory entry');
});

test('skips symlinks and nonmatching files', async () => {
  const entries = [
    { name: 'link.mjs', isSymbolicLink: () => true, isFile: () => true },
    file('a.js'), file('a.test.mjs'), file('readme.md'),
  ];
  expect(await findMjsFiles('/root', { readDirectory: async () => entries })).toEqual(['a.test.mjs']);
  expect(await findMjsFiles('/root', { readDirectory: async () => [{ name: 'NODE_MODULES', isDirectory: () => true }] })).toEqual([]);
});
