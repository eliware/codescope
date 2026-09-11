import { isValidReviewResult } from '../../src/response/review-validator.mjs';

test('validates a review category payload', () => {
  const prompt = {
    tools: [{ parameters: { properties: { issues: { properties: { security: {} } } } } }],
  };
  expect(
    isValidReviewResult(
      {
        issues: {
          security: [
            {
              severity: 'none',
              location: 'none',
              issue: 'No issues found.',
              ignore_example: '// codescope ignore: no issue is present.',
            },
          ],
        },
        verdict: 'pass',
      },
      prompt,
    ),
  ).toBe(true);
});

test('rejects empty review categories', () => {
  const prompt = {
    tools: [{ parameters: { properties: { issues: { properties: { security: {} } } } } }],
  };
  expect(isValidReviewResult({ issues: { security: [] }, verdict: 'pass' }, prompt)).toBe(false);
});
