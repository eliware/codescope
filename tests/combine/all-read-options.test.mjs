import { createAllReadOptions } from '../../src/combine/all-read-options.mjs';

test('creates shared all-context read options', async () => {
  const reads = [];
  const options = createAllReadOptions({
    readFileContents: async (file) => {
      reads.push(file);
      return 'content';
    },
  });
  await expect(options.readFileContents('file')).resolves.toBe('content');
  await expect(options.readFileContents('file')).resolves.toBe('content');
  expect(reads).toEqual(['file']);
});
