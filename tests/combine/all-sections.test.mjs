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

test('collects all ordered section inputs through injected collaborators', async () => {
  const result = await collectAllSections('repo', {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
  });
  expect(result).toHaveProperty('packageJson');
  expect(result.other).toContain('other files');
});

test('collects sections with default options', async () => {
  await expect(collectAllSections(process.cwd())).resolves.toHaveProperty('packageJson');
});
