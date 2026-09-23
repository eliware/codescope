import { writeProviderResult } from '../../../src/review/output/write-provider-output.mjs';

test('writes provider output through the writer contract', async () => {
  await expect(writeProviderResult(async (value) => ({ written: value.length }), 'ok')).resolves.toBeUndefined();
});

test('formats non-Error writer failures', async () => {
  await expect(writeProviderResult(async () => { throw 'disk full'; }, 'ok', 'suggestion'))
    .rejects.toMatchObject({ message: 'Unable to write suggestion output: disk full' });
});

test('serializes structured provider output', async () => {
  const writes = [];
  await expect(writeProviderResult(async (value) => {
    writes.push(value);
    return { written: value.length };
  }, { verdict: 'pass' })).resolves.toBeUndefined();
  expect(writes).toEqual(['{"verdict":"pass"}']);
});

test('preserves Error details when wrapping writer failures', async () => {
  await expect(writeProviderResult(async () => { throw new Error('disk full'); }, 'ok'))
    .rejects.toMatchObject({ message: 'Unable to write review output: disk full' });
});
