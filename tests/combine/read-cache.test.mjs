import { createReadCache } from '../../src/combine/read-cache.mjs';

test('caches identical content reads', async () => {
  let reads = 0;
  const read = createReadCache(async () => { reads += 1; return 'content'; });
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
