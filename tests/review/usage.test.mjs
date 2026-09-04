import { withReviewUsage } from '../../src/review/usage.mjs';

test('leaves results unchanged when usage is disabled', () => {
  const result = { verdict: 'pass' };
  expect(withReviewUsage(result, { usage: { input_tokens: 1 } }, 'gpt-5.6-luna', false)).toBe(
    result,
  );
});

test('adds provider usage and calculated cost when enabled', () => {
  expect(
    withReviewUsage(
      { verdict: 'pass' },
      { usage: { input_tokens: 10, output_tokens: 2 } },
      'gpt-5.6-luna',
      true,
    ),
  ).toMatchObject({
    verdict: 'pass',
    usage: { input_tokens: 10, output_tokens: 2, estimated_cost_usd: expect.any(Number) },
  });
  expect(withReviewUsage({}, {}, 'gpt-5.6-luna', true).usage).toBeNull();
});
