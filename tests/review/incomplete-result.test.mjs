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

test('preserves a serialized partial response', () => {
  expect(createIncompleteResult(new Error('invalid response'), { output: [] }).response).toMatchObject({
    response: '{"output":[]}',
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('formats non-error causes', () => {
  expect(createIncompleteResult('down')).toMatchObject({ error: 'down' });
});

test('preserves safe fields when the response cannot be serialized', () => {
  const response = { output_text: 'TOKEN=secret', usage: { input_tokens: 3, output_tokens: 2, ignored: 'value' } };
  response.self = response;
  expect(createIncompleteResult(new Error('invalid response'), response).response).toEqual({
    output_text: 'TOKEN=[REDACTED]',
    usage: { input_tokens: 3, output_tokens: 2, invalid_fields: true },
    response_error: 'Provider response could not be serialized',
  });
});

test('preserves string output from an unserializable response', () => {
  const response = { output_text: 'partial output' };
  response.self = response;
  expect(createIncompleteResult(new Error('invalid response'), response).response.output_text)
    .toBe('partial output');
});

test('handles unreadable response output safely', () => {
  const response = {};
  Object.defineProperty(response, 'output_text', { enumerable: true, get() { throw new Error('unreadable'); } });
  expect(createIncompleteResult(new Error('invalid response'), response).response.response_error)
    .toBe('Provider response could not be serialized');
});
