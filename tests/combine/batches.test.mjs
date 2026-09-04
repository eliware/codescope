import { readBatches } from '../../src/combine/batches.mjs';

test('reads bounded batches and accounts for total size', async () => {
  const result = await readBatches(['a', 'b', 'c'], {
    batchSize: 2,
    maxChars: 10,
    read: async (value) => value,
  });
  expect(result).toEqual(['a', 'b', 'c']);
});

test('rejects a batch that exceeds the aggregate limit', async () => {
  await expect(
    readBatches(['long'], {
      batchSize: 1,
      maxChars: 2,
      read: async () => 'long',
    }),
  ).rejects.toThrow(/limit/);
});
