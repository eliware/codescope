import { runReviewSession } from '../../src/review/run-session.mjs';

test('runs a plain-text provider session and writes the result', async () => {
  const writes = [];
  const result = await runReviewSession({
    client: { responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) } },
    request: { model: 'gpt-5.6-luna' },
    signal: new AbortController().signal,
    write: async (value) => {
      writes.push(value);
      return { written: value.length };
    },
    dryRun: false,
    usage: false,
    plainText: 'review',
  });
  expect(result.output).toBe('{"verdict":"pass"}');
  expect(writes[0]).toBe('{"verdict":"pass"}');
  expect(writes).toHaveLength(1);
});

const reviewRequest = { model: 'gpt-5.6-luna', tools: [], tool_choice: undefined };

test('parses a normal review tool response', async () => {
  const result = await runReviewSession({
    client: {
      responses: {
        create: async () => ({
          output: [
            {
              type: 'function_call',
              name: 'submit_review',
              arguments: '{"verdict":"pass","issues":{}}',
            },
          ],
        }),
      },
    },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async (value) => {
      expect(JSON.parse(value)).toEqual({ verdict: 'pass', issues: {} });
      return { written: value.length };
    },
    dryRun: false,
    usage: false,
  });
  expect(result.output).toBe('{"verdict":"pass","issues":{}}');
});

test('preserves malformed tool arguments as a blocked raw response', async () => {
  const result = await runReviewSession({
    client: {
      responses: {
        create: async () => ({
          output: [{ type: 'function_call', name: 'submit_review', arguments: '{' }],
        }),
      },
    },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async (value) => ({ written: value.length }),
    dryRun: false,
    usage: false,
  });
  expect(result.output).toBe('{');
});

test('preserves an existing blocked verdict', async () => {
  const result = await runReviewSession({
    client: {
      responses: {
        create: async () => ({
          output: [
            {
              type: 'function_call',
              name: 'submit_review',
              arguments: '{"verdict":"block","issues":{}}',
            },
          ],
        }),
      },
    },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async (value) => ({ written: value.length }),
    dryRun: false,
    usage: false,
  });
  expect(result.output).toBe('{"verdict":"block","issues":{}}');
});

test('returns plain JSON without usage when usage output is disabled', async () => {
  await expect(
    runReviewSession({
      client: { responses: { create: async () => ({ output_text: '{"ok":true}' }) } },
      request: reviewRequest,
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: false,
      usage: false,
      plainText: 'summarize',
    }),
  ).resolves.toMatchObject({ kind: 'prompt', output: '{"ok":true}' });
});

test('preserves an untyped output write failure', async () => {
  await expect(
    runReviewSession({
      client: {
        responses: {
          create: async () => ({ output_text: '{"verdict":"pass"}' }),
        },
      },
      request: reviewRequest,
      signal: new AbortController().signal,
      write: async () => {
        throw new Error('output failed');
      },
      dryRun: false,
      usage: false,
      plainText: 'summarize',
    }),
  ).rejects.toThrow(/output failed/);
});

test('preserves a received response when response selection fails', async () => {
  const response = { output: [{ type: 'function_call', name: 'other', arguments: '{}' }] };
  await expect(
    runReviewSession({
      client: { responses: { create: async () => response } },
      request: { model: 'gpt-5.6-luna', tool_choice: { name: 'review' } },
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: false,
      usage: false,
    }),
  ).rejects.toMatchObject({ result: { response: { response_error: expect.any(String) } } });
});

test('includes usage without test execution evidence', async () => {
  const base = {
    client: {
      responses: {
        create: async () => ({ output_text: '{"verdict":"pass"}', usage: { input_tokens: 1 } }),
      },
    },
    request: { model: 'gpt-5.6-luna' },
    signal: new AbortController().signal,
    write: async (value) => ({ written: value.length }),
    dryRun: false,
    plainText: 'review',
    usage: true,
  };
  await expect(runReviewSession(base)).resolves.toMatchObject({
    kind: 'prompt',
    output: '{"verdict":"pass"}',
  });
  await expect(
    runReviewSession({
      ...base,
      client: { responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) } },
    }),
  ).resolves.toMatchObject({ kind: 'prompt', output: '{"verdict":"pass"}' });
  await expect(
    runReviewSession({
      ...base,
      client: { responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) } },
      usage: false,
    }),
  ).resolves.toMatchObject({ kind: 'prompt', output: '{"verdict":"pass"}' });
});

test('runs dry-run and preserves provider failures', async () => {
  await expect(
    runReviewSession({
      client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
      request: { model: 'gpt-5.6-luna', input: [], tools: [] },
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: true,
      usage: false,
    }),
  ).resolves.toMatchObject({ output: { estimated_input_tokens: 1 } });
  const failure = Object.assign(new Error('provider down'), { code: 'API' });
  await expect(
    runReviewSession({
      client: {
        responses: {
          create: async () => {
            throw failure;
          },
        },
      },
      request: { model: 'gpt-5.6-luna' },
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: false,
      usage: false,
    }),
  ).rejects.toMatchObject({ code: 'API' });
});
