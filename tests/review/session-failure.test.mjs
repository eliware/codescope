import { throwSessionFailure } from '../../src/review/session-failure.mjs';
import { createSetupFailure } from '../../src/review/failure.mjs';

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

test('describes setup failures safely for ordinary and hostile causes', () => {
  expect(createSetupFailure(new Error('bad setup')).message).toBe('CodeScope setup failed: bad setup');
  const hostile = { [Symbol.toPrimitive]: () => { throw new Error('hostile'); } };
  expect(createSetupFailure(hostile).message).toBe('CodeScope setup failed: failure details unavailable');
});
