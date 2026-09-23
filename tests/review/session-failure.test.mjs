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
test('writes fallback output before a provider response', async () => {
  const writes = [];
  await expect(
    throwSessionFailure({
      cause: new Error('request failed'),
      providerResponseReceived: false,
      write: async (value) => {
        writes.push(value);
        return { written: value.length };
      },
    }),
  ).rejects.toThrow('request failed');
  expect(writes).toHaveLength(1);
});
test('preserves a minimal fallback when failure details are hostile', async () => {
  const cause = { [Symbol.toPrimitive]: () => { throw new Error('hostile'); } };
  await expect(
    throwSessionFailure({
      cause,
      providerResponseReceived: true,
      providerResponse: { output_text: 'partial' },
      write: async (value) => ({ written: value.length }),
    }),
  ).rejects.toMatchObject({ message: 'OpenAI request failed: failure details unavailable' });
});
test('preserves provider error codes and fallback write failures', async () => {
  const fallbackError = new Error('fallback write failed');
  await expect(
    throwSessionFailure({
      cause: Object.assign(new Error('request failed'), { code: 'API' }),
      providerResponseReceived: false,
      write: async () => { throw fallbackError; },
    }),
  ).rejects.toMatchObject({ code: 'API', fallbackError });
});

