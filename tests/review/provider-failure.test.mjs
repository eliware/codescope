import { createProviderFailure } from '../../src/review/provider-failure.mjs';

test('preserves the provider failure cause', () => {
  const cause = new Error('failed');
  const result = createProviderFailure(cause);
  expect(result.message).toContain('failed');
  expect(result.cause).toBe(cause);
});

test('formats non-error provider causes', () => {
  expect(createProviderFailure('down').message).toContain('down');
});

test('preserves hostile provider failure causes safely', () => {
  const cause = { [Symbol.toPrimitive]: () => { throw new Error('hostile'); } };
  expect(createProviderFailure(cause).message).toContain('failure details unavailable');
});
