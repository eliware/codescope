import { runReviewSession } from '../../src/review/run-session.mjs';

test('runs a plain-text provider session and writes the result', async () => {
  const writes = [];
  const result = await runReviewSession({
    client: { responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) } },
    request: { model: 'gpt-5.6-luna' },
    signal: new AbortController().signal,
    write: async (value) => writes.push(value),
    dryRun: false,
    usage: false,
    plainText: 'review',
  });
  expect(result.verdict).toBe('pass');
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
    write: async () => {},
    dryRun: false,
    usage: false,
  });
  expect(result.verdict).toBe('pass');
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
    write: async () => {},
    dryRun: false,
    usage: false,
  });
  expect(result).toEqual({ raw_response: '{', verdict: 'block' });
});

test('does not override an existing blocked verdict for failed test evidence', async () => {
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
    write: async () => {},
    dryRun: false,
    usage: false,
    testResults: '===== npm test =====\nexit code: 1',
  });
  expect(result.verdict).toBe('block');
});

test('returns plain JSON without usage when usage output is disabled', async () => {
  await expect(
    runReviewSession({
      client: { responses: { create: async () => ({ output_text: '{"ok":true}' }) } },
      request: reviewRequest,
      signal: new AbortController().signal,
      write: async () => {},
      dryRun: false,
      usage: false,
      plainText: 'summarize',
    }),
  ).resolves.toEqual({ ok: true });
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

test('includes provider usage for custom prompts when available or null otherwise', async () => {
  const request = { model: 'gpt-5.6-luna' };
  const base = {
    client: { responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) } },
    request,
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    plainText: 'review',
    usage: true,
  };
  await expect(runReviewSession(base)).resolves.toMatchObject({ usage: null });
  await expect(
    runReviewSession({
      ...base,
      client: {
        responses: {
          create: async () => ({ output_text: '{"verdict":"pass"}', usage: { input_tokens: 1 } }),
        },
      },
    }),
  ).resolves.toMatchObject({ usage: { input_tokens: 1 } });
});

test('runs dry-run sessions', async () => {
  const writes = [];
  const result = await runReviewSession({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request: { model: 'gpt-5.6-luna', input: [], tools: [] },
    signal: new AbortController().signal,
    write: async (value) => writes.push(value),
    dryRun: true,
    usage: false,
  });
  expect(result).toMatchObject({ estimated_input_tokens: 1 });
  expect(writes).toHaveLength(1);
});

test('blocks a passing review when supplied test evidence failed', async () => {
  const result = await runReviewSession({
    client: {
      responses: {
        create: async () => ({ output_text: '{"verdict":"pass"}' }),
      },
    },
    request: { model: 'gpt-5.6-luna' },
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    usage: false,
    testResults: '===== npm test =====\nexit code: 1',
  });
  expect(result.verdict).toBe('block');
});

test('preserves provider failure codes and writes incomplete output', async () => {
  const writes = [];
  const failure = Object.assign(new Error('provider down'), { code: 'API' });
  await expect(
    runReviewSession({
      client: {
        responses: {
          create: async () =>
            failure &&
            (() => {
              throw failure;
            })(),
        },
      },
      request: { model: 'gpt-5.6-luna' },
      signal: new AbortController().signal,
      write: async (value) => writes.push(value),
      dryRun: false,
      usage: false,
    }),
  ).rejects.toMatchObject({ code: 'API' });
  expect(writes).toHaveLength(0);
});

test('writes fallback output when response handling fails after receipt', async () => {
  const writes = [];
  let attempts = 0;
  await expect(
    runReviewSession({
      client: {
        responses: {
          create: async () => ({
            output: [
              { type: 'function_call', name: 'submit_review', arguments: '{"verdict":"pass"}' },
            ],
          }),
        },
      },
      request: { model: 'gpt-5.6-luna', tools: [] },
      signal: new AbortController().signal,
      write: async (value) => {
        attempts += 1;
        if (attempts === 1) throw new Error('output failed');
        writes.push(value);
      },
      dryRun: false,
      usage: false,
    }),
  ).rejects.toThrow(/output failed/);
  expect(writes).toHaveLength(1);
});
