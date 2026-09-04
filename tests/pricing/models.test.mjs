import { API_PRICING } from '../../src/pricing/models.mjs';

test('exposes supported model rates', () => {
  expect(Object.keys(API_PRICING)).toEqual(['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol']);
  expect(API_PRICING['gpt-5.6-luna'].input).toBeGreaterThan(0);
});
