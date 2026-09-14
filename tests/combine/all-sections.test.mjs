import { collectAllSections, createReadCache } from '../../src/combine/all-sections.mjs';

test('caches identical content reads', async () => {
  let reads = 0;
  const read = createReadCache(async () => {
    reads += 1;
    return 'content';
  });
  await expect(read('file', 'utf8')).resolves.toBe('content');
  await expect(read('file', 'utf8')).resolves.toBe('content');
  expect(reads).toBe(1);
});

test('evicts failed cached reads so later consumers can retry', async () => {
  let reads = 0;
  const read = createReadCache(async () => {
    reads += 1;
    if (reads === 1) throw new Error('temporary');
    return 'content';
  });
  await expect(read('file', 'utf8')).rejects.toThrow('temporary');
  await expect(read('file', 'utf8')).resolves.toBe('content');
  expect(reads).toBe(2);
});

test('collects all ordered section inputs through injected collaborators', async () => {
  const result = await collectAllSections('repo', {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toHaveProperty('packageJson');
  expect(result.other).toContain('other files');
});

test('collects sections with default options', async () => {
  await expect(collectAllSections(process.cwd())).resolves.toHaveProperty('packageJson');
});
