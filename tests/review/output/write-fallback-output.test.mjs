import { writeFallbackResult } from '../../../src/review/output/write-fallback-output.mjs';

test('returns fallback write failures without throwing', async () => {
  await expect(writeFallbackResult(async () => { throw new Error('disk full'); }, {})).resolves.toMatchObject({
    message: 'disk full',
  });
});

test('writes raw string fallback output successfully', async () => {
  const writes = [];
  await expect(writeFallbackResult(async (value) => {
    writes.push(value);
    return { written: value.length };
  }, 'raw response')).resolves.toBeUndefined();
  expect(writes).toEqual(['raw response']);
});
