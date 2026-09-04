import { createIncompleteResult, createProviderFailure } from '../../src/review/failure.mjs';

test('creates a provider failure with the original cause', () => {
  const cause = new Error('invalid response');
  const failure = createProviderFailure(cause);
  expect(failure.message).toBe('OpenAI request failed: invalid response');
  expect(failure.cause).toBe(cause);
});

test('creates an explicit incomplete result for partial provider output', () => {
  expect(createIncompleteResult(new Error('invalid response'), { output: [] })).toEqual({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'invalid response',
    response: { output: [] },
  });
});

test('omits provider response when none was received', () => {
  expect(createIncompleteResult(new Error('no response'))).toEqual({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'no response',
  });
});

test('formats non-error provider causes', () => {
  expect(createProviderFailure('down').message).toContain('down');
  expect(createIncompleteResult('down')).toMatchObject({ error: 'down' });
});

test('preserves a safe summary for an unserializable provider response', () => {
  const response = { output_text: 42 };
  response.self = response;

  const result = createIncompleteResult(new Error('invalid response'), response);

  expect(result.response).toHaveProperty('output_text', undefined);
  expect(result.response.response_error).toBe('Provider response could not be serialized');
});

test('preserves string output text from an unserializable response', () => {
  const response = { output_text: 'partial output' };
  response.self = response;

  const result = createIncompleteResult(new Error('invalid response'), response);

  expect(result.response.output_text).toBe('partial output');
});

test('handles a provider response whose output text cannot be read', () => {
  const response = {};
  Object.defineProperty(response, 'output_text', {
    enumerable: true,
    get() {
      throw new Error('unreadable');
    },
  });

  const result = createIncompleteResult(new Error('invalid response'), response);

  expect(result.response.response_error).toBe('Provider response could not be serialized');
});
