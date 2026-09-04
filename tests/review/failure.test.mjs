import { createIncompleteResult, createProviderFailure } from '../../src/review/failure.mjs';

test('creates a provider failure with the original cause', () => {
  const cause = new Error('invalid response');
  const failure = createProviderFailure(cause);
  expect(failure.message).toBe('OpenAI request failed: invalid response');
  expect(failure.cause).toBe(cause);
});

test('creates an explicit incomplete result for partial provider output', () => {
  expect(createIncompleteResult(new Error('invalid response'))).toEqual({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'invalid response',
  });
});
