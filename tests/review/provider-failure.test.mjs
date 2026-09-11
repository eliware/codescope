import { createProviderFailure } from '../../src/review/provider-failure.mjs';

test('preserves the provider failure cause', () => {
  const cause = new Error('failed');
  const result = createProviderFailure(cause);
  expect(result.message).toContain('failed');
  expect(result.cause).toBe(cause);
});
