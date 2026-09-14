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

test('rejects invalid batch sizes before starting reads', async () => {
  await expect(readBatches(['a'], { batchSize: 0, maxChars: 10, read: async () => 'a' }))
    .rejects.toThrow(/positive integer/);
});

test('preserves source order while workers complete out of order', async () => {
  const result = await readBatches(['slow', 'fast'], {
    batchSize: 2,
    maxChars: 100,
    read: (value) => new Promise((resolve) => {
      setTimeout(() => resolve(value), value === 'slow' ? 10 : 0);
    }),
  });
  expect(result).toEqual(['slow', 'fast']);
});
