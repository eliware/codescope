import { throwSessionFailure } from '../../src/review/session-failure.mjs';

test('preserves provider failures and fallback metadata', async () => {
  const writes = [];
  await expect(
    throwSessionFailure({
      cause: new Error('invalid response'),
      providerResponse: { output_text: 'partial' },
      providerResponseReceived: true,
      write: async (value) => {
        writes.push(value);
        return { written: value.length };
      },
    }),
  ).rejects.toMatchObject({ result: { issues: 'not submitted' } });
  expect(writes).toHaveLength(1);
});

test('wraps failures before a provider response without fallback output', async () => {
  await expect(
    throwSessionFailure({
      cause: new Error('request failed'),
      providerResponseReceived: false,
      write: async (value) => ({ written: value.length }),
    }),
  ).rejects.toThrow('request failed');
});
