import { readSourceFile } from '../../src/combine/read-file.mjs';

test('reads regular source content', async () => {
  await expect(readSourceFile('src/a.mjs', 'repo/src/a.mjs', {
    readFileContents: async () => 'export {}',
    validateSymlinks: true,
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).resolves.toBe('export {}');
});

test('rejects symlinks and non-files with contextual errors', async () => {
  const inspect = async () => ({ isSymbolicLink: () => true, isFile: () => false });
  await expect(readSourceFile('src/a.mjs', 'repo/src/a.mjs', { validateSymlinks: true, inspectFile: inspect })).rejects.toThrow('src/a.mjs: symlinked');
  await expect(readSourceFile('src/a.mjs', 'repo/src/a.mjs', { validateSymlinks: true, inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }) })).rejects.toThrow('regular file');
});

test('reports reader failures and invalid reader values', async () => {
  await expect(readSourceFile('src/a.mjs', 'repo/src/a.mjs', { readFileContents: async () => { throw new Error('denied'); } })).rejects.toThrow('src/a.mjs: denied');
  await expect(readSourceFile('src/a.mjs', 'repo/src/a.mjs', { readFileContents: async () => 42 })).rejects.toThrow('non-string');
});
