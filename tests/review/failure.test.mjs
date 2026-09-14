import { createIncompleteResult, createProviderFailure } from '../../src/review/failure.mjs';
import { runReviewSession } from '../../src/review/run-session.mjs';

test('review-session exposes fallback output on write failure', async () => {
  await expect(
    runReviewSession({
      client: {
        responses: {
          create: async () => ({
            output: [{ type: 'function_call', name: 'submit_review', arguments: '{}' }],
          }),
        },
      },
      request: { model: 'gpt-5.6-luna' },
      signal: new AbortController().signal,
      write: async () => {
        throw new Error('output failed');
      },
      dryRun: false,
      usage: false,
    }),
  ).rejects.toMatchObject({ result: { issues: 'not submitted', suggestions: 'not submitted' } });
});

test('rejects an empty provider response before writing fallback output', async () => {
  await expect(
    runReviewSession({
      client: { responses: { create: async () => ({ output: [] }) } },
      request: { model: 'gpt-5.6-luna' },
      signal: new AbortController().signal,
      write: async () => {
        throw new Error('disk full');
      },
      dryRun: false,
      usage: false,
    }),
  ).rejects.toThrow('OpenAI request failed: Provider response did not contain usable output');
});

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
    response: {
      response: '{"output":[]}',
      response_error: 'Provider response was not accepted by the response contract',
    },
  });
});

test('omits provider response when none was received', () => {
  expect(createIncompleteResult(new Error('no response'))).toEqual({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'no response',
  });
});

test('redacts serializable provider response summaries', () => {
  const result = createIncompleteResult(new Error('invalid response'), {
    output_text: 'TOKEN=secret',
    usage: { input_tokens: 1 },
  });
  expect(result.response).toEqual({
    output_text: 'TOKEN=[REDACTED]',
    usage: { input_tokens: 1 },
    response: '{"output_text":"TOKEN=[REDACTED],"usage":{"input_tokens":1}}',
    response_error: 'Provider response was not accepted by the response contract',
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

  expect(result.response).not.toHaveProperty('output_text');
  expect(result.response.response_error).toBe('Provider response could not be serialized');
});

test('preserves string output text from an unserializable response', () => {
  const response = { output_text: 'partial output' };
  response.self = response;

  const result = createIncompleteResult(new Error('invalid response'), response);

  expect(result.response.output_text).toBe('partial output');
});

test('redacts output and preserves numeric usage from an unserializable response', () => {
  const response = {
    output_text: 'TOKEN=secret',
    usage: { input_tokens: 3, output_tokens: 2, ignored: 'value' },
  };
  response.self = response;

  const result = createIncompleteResult(new Error('invalid response'), response);

  expect(result.response).toEqual({
    output_text: 'TOKEN=[REDACTED]',
    usage: { input_tokens: 3, output_tokens: 2, invalid_fields: true },
    response_error: 'Provider response could not be serialized',
  });
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
