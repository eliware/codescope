import { createIncompleteResult } from '../../src/review/incomplete-result.mjs';

test('creates an incomplete result with an optional response summary', () => {
  expect(createIncompleteResult(new Error('failed'), { output: [] })).toMatchObject({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'failed',
  });
});

test('omits the response when none was received', () => {
  expect(createIncompleteResult(new Error('no response'))).toEqual({
    issues: 'not submitted', suggestions: 'not submitted', error: 'no response',
  });
});

test('formats non-error causes', () => {
  expect(createIncompleteResult('down')).toMatchObject({ error: 'down' });
});
