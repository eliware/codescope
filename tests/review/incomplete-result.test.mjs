import { createIncompleteResult } from '../../src/review/incomplete-result.mjs';

test('creates an incomplete result with an optional response summary', () => {
  expect(createIncompleteResult(new Error('failed'), { output: [] })).toMatchObject({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'failed',
  });
});
