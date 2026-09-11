import { reviewSessionResult } from '../../src/review/review-session-result.mjs';

test('adds usage through the review result boundary', () => {
  expect(
    reviewSessionResult({ usage: {} }, {}, 'model', false, '', () => ({ verdict: 'pass' })),
  ).toEqual({ verdict: 'pass' });
});

test('blocks a passing review when supplied test evidence failed', () => {
  expect(
    reviewSessionResult(
      { usage: {} },
      {},
      'model',
      false,
      '===== npm test =====\nstatus: fail',
      () => ({ verdict: 'pass' }),
    ),
  ).toEqual({ verdict: 'block' });
});
