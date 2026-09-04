import { executeReviewSession } from '../../src/review/session.mjs';

test('executes a dry-run session and writes its result', async () => {
  const output = [];
  const result = await executeReviewSession({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request: { model: 'gpt-5.6-luna', input: [], tools: [], store: false, include: [] },
    signal: new AbortController().signal,
    write: async (value) => output.push(value),
    dryRun: true,
    usage: false,
    testResults: undefined,
  });
  expect(result).toEqual({ estimated_input_tokens: 1, model: 'gpt-5.6-luna' });
  expect(output).toHaveLength(1);
});

const reviewRequest = {
  model: 'gpt-5.6-luna',
  input: [],
  tools: [
    {
      name: 'submit_review',
      parameters: { properties: { issues: { properties: { correctness: {} } } } },
    },
  ],
  tool_choice: { name: 'submit_review' },
};
const reviewResponse = {
  output: [
    {
      type: 'function_call',
      name: 'submit_review',
      arguments: JSON.stringify({
        issues: {
          correctness: [
            {
              severity: 'P3',
              location: 'none',
              issue: 'No issues found.',
              ignore_example: '// codescope ignore: no issue is present.',
            },
          ],
        },
        verdict: 'pass',
      }),
    },
  ],
};

test('executes a normal provider session and writes the parsed result', async () => {
  const output = [];
  const result = await executeReviewSession({
    client: { responses: { create: async () => reviewResponse } },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async (value) => output.push(value),
    dryRun: false,
    usage: false,
    testResults: undefined,
  });
  expect(result.verdict).toBe('pass');
  expect(output).toHaveLength(1);
});

test('writes a fallback when provider output cannot be parsed', async () => {
  const output = [];
  const result = await executeReviewSession({
    client: {
      responses: {
        create: async () => ({
          output: [{ type: 'function_call', name: 'submit_review', arguments: '{' }],
        }),
      },
    },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async (value) => output.push(value),
    dryRun: false,
    usage: false,
    testResults: undefined,
  });
  expect(result).toEqual({ raw_response: '{', verdict: 'block' });
  expect(output).toHaveLength(1);
});

test('handles custom structured JSON output and usage', async () => {
  const output = [];
  const result = await executeReviewSession({
    client: {
      responses: {
        create: async () => ({ output_text: '{"ok":true}', usage: { input_tokens: 2 } }),
      },
    },
    request: { ...reviewRequest, tools: [] },
    signal: new AbortController().signal,
    write: async (value) => output.push(value),
    dryRun: false,
    usage: true,
    plainText: 'summarize',
    testResults: undefined,
  });
  expect(result).toMatchObject({ ok: true, usage: { input_tokens: 2 } });
});

test('preserves typed provider failures', async () => {
  const failure = Object.assign(new Error('provider down'), { code: 'API' });
  await expect(
    executeReviewSession({
      client: {
        responses: {
          create: async () => {
            throw failure;
          },
        },
      },
      request: reviewRequest,
      signal: new AbortController().signal,
      write: async () => {},
      dryRun: false,
      usage: false,
      testResults: undefined,
    }),
  ).rejects.toMatchObject({ code: 'API' });
});

test('handles combined tools and blocks on failed test evidence', async () => {
  const combinedRequest = {
    ...reviewRequest,
    tools: [
      reviewRequest.tools[0],
      {
        name: 'submit_suggestions',
        parameters: { properties: { suggestions: { properties: { correctness: {} } } } },
      },
    ],
    tool_choice: 'auto',
  };
  const response = {
    output: [
      ...reviewResponse.output,
      {
        type: 'function_call',
        name: 'submit_suggestions',
        arguments: JSON.stringify({
          suggestions: {
            correctness: [
              {
                location: 'none',
                suggestion: 'No suggestions found.',
                rationale: '',
                ignore_example: '// codescope ignore: no suggestion is present.',
              },
            ],
          },
        }),
      },
    ],
  };
  const result = await executeReviewSession({
    client: { responses: { create: async () => response } },
    request: combinedRequest,
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    usage: true,
    testResults: '===== npm test =====\nexit code: 1',
  });
  expect(result.verdict).toBe('block');
});

test('handles optional tool entries and absent custom usage', async () => {
  const result = await executeReviewSession({
    client: { responses: { create: async () => ({ output_text: '{"ok":true}' }) } },
    request: { ...reviewRequest, tools: [null], tool_choice: undefined },
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    usage: true,
    plainText: 'summarize',
    testResults: undefined,
  });
  expect(result.usage).toBeNull();
});

test('handles requests without tools and without usage output', async () => {
  const result = await executeReviewSession({
    client: { responses: { create: async () => ({ output_text: '{"ok":true}' }) } },
    request: { ...reviewRequest, tools: undefined, tool_choice: undefined },
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    usage: false,
    plainText: 'summarize',
    testResults: undefined,
  });
  expect(result).toEqual({ ok: true });
});

test('returns a non-blocking result when failed evidence follows a block verdict', async () => {
  const response = {
    output: [
      {
        type: 'function_call',
        name: 'submit_review',
        arguments: JSON.stringify({
          issues: {
            correctness: [
              {
                severity: 'P3',
                location: 'none',
                issue: 'No issues found.',
                ignore_example: '// codescope ignore: no issue is present.',
              },
            ],
          },
          verdict: 'block',
        }),
      },
    ],
  };
  const result = await executeReviewSession({
    client: { responses: { create: async () => response } },
    request: reviewRequest,
    signal: new AbortController().signal,
    write: async () => {},
    dryRun: false,
    usage: false,
    testResults: '===== npm test =====\nexit code: 1',
  });
  expect(result.verdict).toBe('block');
});

test('preserves an untyped output failure without adding a provider code', async () => {
  await expect(
    executeReviewSession({
      client: { responses: { create: async () => reviewResponse } },
      request: reviewRequest,
      signal: new AbortController().signal,
      write: async () => {
        throw new Error('output failed');
      },
      dryRun: false,
      usage: false,
      testResults: undefined,
    }),
  ).rejects.toThrow('OpenAI request failed: Unable to write review output: output failed');
});
