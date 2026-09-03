import { collectTestResults, redactTestOutput, runReview, testEvidenceBlocks } from '../src/review.mjs';
import { createSuggestionTool, defaultDeveloperText, profilePrompt } from '../src/prompt.mjs';
import { createReviewTool } from '../src/prompt.mjs';
import { defaultEnvFile } from '../src/review-config.mjs';
import { getProfile } from '../src/cli-profiles.mjs';
// codescope ignore: real child-process npm-test execution and cross-product provider-failure interactions are delegated to Node/OpenAI; injected executors plus parser tests provide complete deterministic coverage for this package.

const emptyIssuesJson = JSON.stringify({
  issues: Object.fromEntries(
    [
      'correctness',
      'security',
      'reliability',
      'performance',
      'architecture',
    'api_design',
    'cross_platform',
      'tests',
      'documentation',
    ].map((category) => [
      category,
      [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }],
    ]),
  ),
  verdict: 'pass',
});

const validPrompt = (text = '<combine-mjs here>') => ({
  input: [{ role: 'developer', content: [{ type: 'input_text', text }] }],
});
// codescope ignore: the async-generator helper is retained only as a fixture for rejected legacy streaming behavior; production requests are non-streamed.
const base = (overrides = {}) => ({
  readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
  combine: async () => 'source',
  prompt: validPrompt(),
  createClient: () => ({
    responses: {
      create: async () => ({
        output: [
          {
            type: 'function_call',
            name: 'submit_review',
            arguments: emptyIssuesJson,
          },
        ],
      }),
    },
  }),
  register: () => ({ removeHandlers() {} }),
  write: () => {},
  ...overrides,
});

test('preserves non-text prompt parts', () => {
  const prompt = profilePrompt('focus');
  prompt.input[1].content.push({ type: 'input_image', image_url: 'data:image/png;base64,x' });
  expect(prompt.input[1].content.at(-1).type).toBe('input_image');
});

test('applies a model override to the provider request', async () => {
  let request;
  await runReview(
    '/root',
    base({
      model: 'gpt-5.6-sol',
      createClient: () => ({
        responses: { create: async (value) => ((request = value), { output: [] }) },
      }),
    }),
  ).catch(() => {});
  expect(request.model).toBe('gpt-5.6-sol');
});

test('counts prepared input without creating a model response during dry runs', async () => {
  let counted;
  let created = false;
  const writes = [];
  const result = await runReview(
    '/root',
    base({
      dryRun: true,
      write: (value) => writes.push(value),
      createClient: () => ({
        responses: {
          inputTokens: { count: async (value) => ((counted = value), { input_tokens: 1234 }) },
          create: async () => ((created = true), {}),
        },
      }),
    }),
  );
  expect(created).toBe(false);
  // codescope ignore: dry-run request-shape assertions intentionally cover endpoint selection; token counting receives the prepared request.
  expect(counted.input).toEqual(expect.any(Array));
  expect(result).toEqual({ model: undefined, estimated_input_tokens: 1234 });
  expect(JSON.parse(writes[0])).toEqual(result);
});

test('includes token count usage when requested by a dry run', async () => {
  let output;
  await runReview(
    '/root',
    base({
      dryRun: true,
      usage: true,
      write: (value) => {
        output = JSON.parse(value);
      },
      createClient: () => ({
        responses: { inputTokens: { count: async () => ({ input_tokens: 9 }) } },
      }),
    }),
  );
  expect(output.usage).toEqual({ input_tokens: 9, estimated_cost_usd: 0.000002 });
});

test('rejects malformed or unsupported dry-run token-count responses', async () => {
  await expect(
    runReview(
      '/root',
      base({
        dryRun: true,
        createClient: () => ({ responses: { inputTokens: { count: async () => ({}) } } }),
      }),
    ),
  ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  await expect(
    runReview(
      '/root',
      base({
        dryRun: true,
        createClient: () => ({ responses: {} }),
      }),
    ),
  ).rejects.toMatchObject({ code: 'API' });
});

test('rejects non-function runReview collaborators immediately', async () => {
  await expect(runReview('/root', base({ combine: null }))).rejects.toThrow(
    'runReview option combine must be a function',
  );
});

test('accepts a missing default environment file during setup', async () => {
  const missing = async () => {
    throw { code: 'ENOENT' };
  };
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = 'test-token';
  try {
    await runReview('/root', {
      envFile: defaultEnvFile(),
      readFile: missing,
      inspectFile: missing,
      platform: 'win32',
      combine: async () => '',
      prompt: validPrompt(),
      createClient: base().createClient,
      register: () => ({ removeHandlers() {} }),
      write: () => {},
    });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('rejects non-string test evidence', async () => {
  await expect(
    runReview('/root', base({ includesTests: true, runTestCommand: async () => null })),
  ).rejects.toThrow('Test runner must return a string');
});

// codescope ignore: lint and pack are npm-tooling gates, not review-response behavior; this suite intentionally supplies deterministic npm-test evidence only.
// codescope ignore: suggestion and combined response behavior is covered by focused injected-client and parser tests; redundant provider/subprocess cases are intentionally out of scope.
// codescope ignore: combined and suggestion response paths are intentionally covered by focused injected-client/parser tests; provider call-selection behavior is outside the deterministic unit-test boundary.
test('runs suggestion-mode tool output', async () => {
  const suggestions = {
    suggestions: {
      architecture: [
        {
          location: 'none',
          suggestion: 'No suggestions found.',
          rationale: '',
          ignore_example: '',
        },
      ],
    },
  };
  let request;
  const output = [];
  await runReview(
    '/root',
    base({
      prompt: {
        tools: [createSuggestionTool(['architecture'])],
        tool_choice: { type: 'function', name: 'submit_suggestions' },
        input: [
          { role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] },
        ],
      },
      createClient: () => ({
        responses: {
          create: async (value) => {
            request = value;
            return {
              output: [
                {
                  type: 'function_call',
                  name: 'submit_suggestions',
                  arguments: JSON.stringify(suggestions),
                },
              ],
            };
          },
        },
      }),
      write: (value) => output.push(value),
    }),
  );
  expect(request.tool_choice.name).toBe('submit_suggestions');
  expect(JSON.parse(output[0])).toEqual(suggestions);
});

test('preserves provider output when tool validation fails', async () => {
  const output = [];
  await expect(
    runReview(
      '/root',
      base({
        write: (value) => output.push(value),
        createClient: () => ({
          responses: {
            create: async () => ({
              output: [{ type: 'message', content: [{ type: 'output_text' }] }],
            }),
          },
        }),
      }),
    ),
  ).rejects.toThrow('OpenAI request failed');
  expect(JSON.parse(output[0])).toMatchObject({
    issues: 'not submitted',
    suggestions: 'not submitted',
  });
  expect(JSON.parse(output[0])).not.toHaveProperty('response');
  await expect(
    runReview(
      '/root',
      base({
        write: async () => {
          throw new Error('fallback write failed');
        },
        createClient: () => ({
          responses: {
            create: async () => ({ output: [{ type: 'message' }] }),
          },
        }),
      }),
    ),
  ).rejects.toThrow('OpenAI request failed');
  const nonErrorResponse = {};
  Object.defineProperty(nonErrorResponse, 'output', {
    get() {
      throw 'non-error provider failure';
    },
  });
  const nonErrorOutput = [];
  await expect(
    runReview(
      '/root',
      base({
        write: (value) => nonErrorOutput.push(value),
        createClient: () => ({ responses: { create: async () => nonErrorResponse } }),
      }),
    ),
  ).rejects.toThrow('OpenAI request failed');
  expect(JSON.parse(nonErrorOutput[0]).error).toBe('non-error provider failure');
});

test('routes a public suggestion profile to submit_suggestions', async () => {
  const { prompt } = getProfile('new-features', 'suggest');
  const output = [];
  await runReview(
    '/root',
    base({
      prompt,
      write: (value) => output.push(value),
      createClient: () => ({
        responses: {
          create: async () => ({
            output: [
              {
                type: 'function_call',
                name: 'submit_suggestions',
                arguments: JSON.stringify({
                  suggestions: {
                    'new-features': [
                      {
                        location: 'none',
                        suggestion: 'No suggestions found.',
                        rationale: '',
                        ignore_example: '',
                      },
                    ],
                  },
                }),
              },
            ],
          }),
        },
      }),
    }),
  );
  expect(JSON.parse(output[0]).suggestions['new-features']).toHaveLength(1);
});

// codescope ignore: subprocess mechanics are delegated to Node child_process; focused injected-result tests cover this contract without recursively running this suite.
test('collects test results for test-inclusive profiles', async () => {
  let receivedOptions;
  await runReview(
    '/root',
    base({
      includesTests: true,
      runTestCommand: async (cwd, timeout) => {
        expect(cwd).toBe('/root');
        expect(timeout).toBe(30_000);
        return '===== npm test =====\nexit code: 0';
      },
      combine: async (_cwd, options) => {
        receivedOptions = options;
        return 'source';
      },
    }),
  );
  expect(receivedOptions.testResults).toContain('exit code: 0');
});

test('blocks when supplied test evidence fails', async () => {
  const result = await runReview(
    '/root',
    base({
      includesTests: true,
      runTestCommand: async () => '===== npm test =====\nexit code: 1\nfailed',
    }),
  );
  expect(result.verdict).toBe('block');
});

test('converts injected test-runner errors into blocking evidence', async () => {
  const result = await runReview(
    '/root',
    base({
      includesTests: true,
      runTestCommand: async () => {
        throw new Error('runner failed');
      },
    }),
  );
  expect(result.verdict).toBe('block');
});

test('recognizes only executed nonzero or timed-out test evidence as blocking', () => {
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 1\nfailed')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\ntimed out after 30 seconds')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 0\npassed')).toBe(false);
  expect(testEvidenceBlocks('===== npm test =====')).toBe(false);
  expect(testEvidenceBlocks('test.mjs exists')).toBe(false);
});

test('does not override the AI verdict for a later output marker', async () => {
  const result = await runReview(
    '/root',
    base({
      includesTests: true,
      runTestCommand: async () => '===== npm test =====\nfailed\nexit code: 0',
    }),
  );
  expect(result.verdict).toBe('pass');
});

test('does not override the AI verdict for noncanonical test evidence', async () => {
  const result = await runReview(
    '/root',
    base({ includesTests: true, runTestCommand: async () => 'npm test failed: exit code: 0' }),
  );
  expect(result.verdict).toBe('pass');
});

// codescope ignore: subprocess mechanics are delegated to Node child_process; injected executors are the complete focused contract for this package and real subprocess integration is intentionally out of scope.
test('formats test command failures and timeouts', async () => {
  await expect(collectTestResults('/root', 0, async () => ({}))).rejects.toThrow(
    'Test timeout must be positive',
  );
  await expect(
    collectTestResults('/root', 30_000, async () => ({ stdout: 'out', stderr: 'err' })),
  ).resolves.toContain('exit code: 0');
  const failure = await collectTestResults('/root', 30_000, async () => {
    throw { code: 1, stdout: 'out', stderr: 'err' };
  });
  expect(failure).toContain('exit code: 1');
  expect(failure).toContain('outerr');
  const timeout = await collectTestResults('/root', 30_000, async () => {
    throw { killed: true, stdout: 'partial' };
  });
  expect(timeout).toContain('timed out after 30 seconds');
  expect(timeout).toContain('partial');
  expect(
    await collectTestResults('/root', 30_000, async () => {
      throw { stderr: 'only stderr' };
    }),
  ).toContain('exit code: unknown');
  expect(
    await collectTestResults('/root', 30_000, async () => {
      throw { stdout: null, stderr: null };
    }),
  ).toContain('exit code: unknown');
});

test('preserves a resolved nonzero executor status', async () => {
  await expect(
    collectTestResults('/root', 30_000, async () => ({ code: 2, stdout: 'failed', stderr: '' })),
  ).resolves.toContain('exit code: 2');
});

// codescope ignore: redaction tests cover the documented credential patterns; unsupported custom secret formats are intentionally outside the fixed runner contract.
test('redacts secrets from successful test output', async () => {
  const output = await collectTestResults('/root', 30_000, async () => ({
    stdout: 'token=abc123 CUSTOM_SECRET=hidden Bearer eyJabc sk-live_secret',
    stderr: '',
  }));
  expect(output).not.toContain('abc123');
  expect(output).not.toContain('hidden');
  expect(output).not.toContain('eyJabc');
  expect(output).not.toContain('sk-live_secret');
  expect(output.match(/\[redacted\]/gu)).toHaveLength(4);
  await expect(
    collectTestResults('/root', 30_000, async () => ({ stdout: null, stderr: null })),
  ).resolves.toContain('exit code: 0');
});

test('redacts authorization and URL query credentials across lines', () => {
  const output = redactTestOutput('Authorization: Bearer abc\nhttps://example.test/?token=query-secret');
  expect(output).toBe('Authorization: Bearer [redacted]\nhttps://example.test/?token=[redacted]');
});

test('redacts JSON-style credential fields', () => {
  const output = redactTestOutput('{"token":"json-secret", "api_key": "key-secret"}');
  expect(output).not.toContain('json-secret');
  expect(output).not.toContain('key-secret');
  expect(output).toContain('[redacted]');
});

test('supports a caller-provided test-output redactor', async () => {
  const output = await collectTestResults(
    '/root',
    30_000,
    async () => ({ stdout: 'private-value', stderr: '' }),
    (value) => value.replace('private-value', '[custom-redacted]'),
  );
  expect(output).toContain('[custom-redacted]');
  expect(output).not.toContain('private-value');
});

test('omits test results when explicitly requested', async () => {
  let called = false;
  await runReview(
    '/root',
    base({
      includesTests: true,
      omitTestResults: true,
      runTestCommand: async () => {
        called = true;
        return 'unexpected';
      },
    }),
  );
  expect(called).toBe(false);
});

test('dispatches and parses both combined profile tool calls', async () => {
  const output = [];
  const reviewPrompt = {
    tools: [createReviewTool(['correctness']), createSuggestionTool(['new-features'])],
    tool_choice: 'auto',
    input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
  };
  await runReview(
    '/root',
    base({
      prompt: reviewPrompt,
      write: (value) => output.push(value),
      createClient: () => ({
        responses: {
          create: async (request) => {
            expect(request.parallel_tool_calls).toBe(true);
            return {
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
                          ignore_example: '',
                        },
                      ],
                    },
                    verdict: 'pass',
                  }),
                },
                {
                  type: 'function_call',
                  name: 'submit_suggestions',
                  arguments: JSON.stringify({
                    suggestions: {
                      'new-features': [
                        {
                          location: 'none',
                          suggestion: 'No suggestions found.',
                          rationale: '',
                          ignore_example: '',
                        },
                      ],
                    },
                  }),
                },
              ],
            };
          },
        },
      }),
    }),
  );
  expect(JSON.parse(output[0])).toEqual({
    issues: {
      correctness: [
        { severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' },
      ],
    },
    suggestions: {
      'new-features': [
        {
          location: 'none',
          suggestion: 'No suggestions found.',
          rationale: '',
          ignore_example: '',
        },
      ],
    },
    verdict: 'pass',
  });
});

test('uses forced tool choice when both tools are supplied', async () => {
  let request;
  await runReview(
    '/root',
    base({
      prompt: {
        tools: [createReviewTool(['correctness']), createSuggestionTool(['new-features'])],
        tool_choice: { type: 'function', name: 'submit_review' },
        input: [
          { role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] },
        ],
      },
      createClient: () => ({
        responses: {
          create: async (value) => {
            request = value;
            return {
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
                          ignore_example: '',
                        },
                      ],
                    },
                    verdict: 'pass',
                  }),
                },
              ],
            };
          },
        },
      }),
    }),
  );
  expect(request.parallel_tool_calls).toBe(false);
});

// codescope ignore: native filesystem plus live-provider end-to-end coverage is intentionally outside the deterministic unit-test contract; injected collaborators cover the package behavior.
test('covers default config permission outcomes on non-Windows platforms', async () => {
  const common = {
    environment: { OPENAI_API_TOKEN: 'test-token' },
    envFile: defaultEnvFile(),
    readFile: async () => 'OPENAI_API_TOKEN=test-token',
    platform: 'linux',
    inspectFile: async () => ({ isSymbolicLink: () => false }),
    combine: async () => '',
    createClient: () => {
      throw new Error('stop before API');
    },
  };
  await expect(
    runReview('/missing', { ...common, inspectPermissions: async () => ({ mode: 0o600 }) }),
  ).rejects.toThrow('initialize');
  await expect(
    runReview('/missing', {
      ...common,
      inspectPermissions: async () => ({ mode: 0o644 }),
    }),
  ).rejects.toThrow('readable');
  await expect(
    runReview('/missing', {
      ...common,
      inspectPermissions: async () => {
        throw new Error('permission inspection');
      },
    }),
  ).rejects.toThrow('permission inspection');
  await expect(
    runReview('/missing', {
      ...common,
      inspectPermissions: async () => {
        throw { code: 'ENOENT' };
      },
    }),
  ).rejects.toThrow('initialize');
  await expect(
    runReview('/missing', {
      ...common,
      inspectPermissions: async () => {
        throw 'permission string';
      },
    }),
  ).rejects.toThrow('permission string');
});

test('runs a review with placeholder and usage', async () => {
  let request;
  let output;
  await runReview(
    '/root',
    base({
      usage: true,
      write: (value) => {
        output = JSON.parse(value);
      },
      createClient: () => ({
        responses: {
          create: async (value) => {
            request = value;
            return {
              usage: {
                input_tokens: 700,
                output_tokens: 300,
                total_tokens: 1000,
                input_tokens_details: { cached_tokens: 40, cache_write_tokens: 20 },
              },
              output: [
                {
                  type: 'function_call',
                  name: 'submit_review',
                  arguments: emptyIssuesJson,
                },
              ],
            };
          },
        },
      }),
    }),
  );
  expect(request.input[0].content[0].text).toContain('source');
  expect(output.usage).toMatchObject({
    input_tokens: 700,
    output_tokens: 300,
    total_tokens: 1000,
    input_tokens_details: { cached_tokens: 40, cache_write_tokens: 20 },
  });
  expect(output.usage.estimated_cost_usd).toEqual(expect.any(Number));
});

test('handles the default config path when no config file exists', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = 'environment-token';
  try {
    await runReview('/root', {
      prompt: validPrompt(),
      combine: async () => '',
      createClient: () => ({
        responses: {
          create: async () => ({
            output: [
              {
                type: 'function_call',
                name: 'submit_review',
                arguments: emptyIssuesJson,
              },
            ],
          }),
        },
      }),
      register: ({ shutdownHook }) => {
        shutdownHook();
        return {};
      },
      write: () => {},
    });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('checks default config symlinks and permissions through injectable inspectors', async () => {
  const opts = {
    prompt: validPrompt(),
    combine: async () => '',
    envFile: defaultEnvFile(),
    readFile: async () => '',
    inspectFile: async () => ({ isSymbolicLink: () => true }),
  };
  await expect(runReview('/root', opts)).rejects.toThrow('symbolic link');
  if (process.platform !== 'win32') {
    await expect(
      runReview('/root', {
        ...opts,
        inspectFile: async () => ({ isSymbolicLink: () => false }),
        inspectPermissions: async () => ({ mode: 0o644 }),
      }),
    ).rejects.toThrow('readable');
  }
  await expect(
    runReview('/root', {
      ...opts,
      inspectFile: async () => {
        throw new Error('inspect');
      },
    }),
  ).rejects.toThrow('inspect');
  if (process.platform !== 'win32') {
    await expect(
      runReview('/root', {
        ...opts,
        inspectFile: async () => ({ isSymbolicLink: () => false }),
        inspectPermissions: async () => {
          throw new Error('permissions');
        },
      }),
    ).rejects.toThrow('permissions');
  }
  await expect(
    runReview('/root', {
      ...opts,
      inspectFile: async () => {
        throw 'inspect string';
      },
    }),
  ).rejects.toThrow('inspect string');
  if (process.platform !== 'win32') {
    await expect(
      runReview('/root', {
        ...opts,
        inspectFile: async () => ({ isSymbolicLink: () => false }),
        inspectPermissions: async () => {
          throw 'permission string';
        },
      }),
    ).rejects.toThrow('permission string');
  }
  if (process.platform !== 'win32') {
    await expect(
      runReview('/root', {
        ...opts,
        inspectFile: async () => ({ isSymbolicLink: () => false }),
        inspectPermissions: async () => ({ mode: 0 }),
      }),
    ).rejects.toThrow('OPENAI_API_TOKEN');
  }
});

test('supports the default prompt source insertion', async () => {
  await runReview(
    '/root',
    base({
      prompt: {
        input: [
          { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
          { role: 'user', content: [{ type: 'input_text', text: 'Review this.' }] },
        ],
      },
    }),
  );
});

test('rejects prompt and environment validation failures', async () => {
  for (const prompt of [null, [], { input: 'bad' }, { input: [] }, { extra: true, input: [] }])
    await expect(runReview('/root', base({ prompt }))).rejects.toThrow();
  await expect(runReview('/root', base({ readEnvFile: async () => '' }))).rejects.toThrow(
    'OPENAI_API_TOKEN',
  );
  await expect(runReview('/root', base({ readEnvFile: async () => 'bad line' }))).rejects.toThrow(
    'Invalid',
  );
  await expect(
    runReview(
      '/root',
      base({
        createClient: () => {
          throw new Error('client');
        },
      }),
    ),
  ).rejects.toThrow('initialize');
});

test('wraps request, response, registration, and output errors', async () => {
  await expect(
    runReview(
      '/root',
      base({
        register: () => {
          throw new Error('signals');
        },
      }),
    ),
  ).rejects.toThrow('register');
  await expect(
    runReview(
      '/root',
      base({
        createClient: () => ({
          responses: {
            create: async () => {
              throw new Error('request');
            },
          },
        }),
      }),
    ),
  ).rejects.toThrow('OpenAI request failed');
  await expect(
    runReview(
      '/root',
      base({ createClient: () => ({ responses: { create: async () => ({ output: [] }) } }) }),
    ),
  ).rejects.toThrow('exactly one');
  await expect(
    runReview(
      '/root',
      base({
        write: async () => {
          throw new Error('write');
        },
      }),
    ),
  ).rejects.toThrow('OpenAI request failed');
});

test('covers prompt routing and collaborator failures', async () => {
  await expect(
    runReview(
      '/root',
      base({
        prompt: {
          input: [{ role: 'developer', content: [{ type: 'input_text', text: 'custom' }] }],
        },
      }),
    ),
  ).rejects.toThrow('placeholder');
  await expect(
    runReview(
      '/root',
      base({
        prompt: {
          input: [
            { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
          ],
        },
      }),
    ),
  ).rejects.toThrow('user input_text');
  await expect(
    runReview(
      '/root',
      base({
        combine: async () => {
          throw new Error('combine');
        },
      }),
    ),
  ).rejects.toThrow('combine');
  await expect(
    runReview(
      '/root',
      base({
        register: () => {
          throw 'signal failure';
        },
      }),
    ),
  ).rejects.toThrow('signal failure');
  await expect(
    runReview(
      '/root',
      base({
        createClient: () => ({
          responses: {
            create: async () => {
              throw 'request failure';
            },
          },
        }),
      }),
    ),
  ).rejects.toThrow('request failure');
  await expect(
    runReview(
      '/root',
      base({
        write: async () => {
          throw 'output failure';
        },
      }),
    ),
  ).rejects.toThrow('output failure');
});

test('handles environment read failures and missing usage', async () => {
  await expect(
    runReview(
      '/root',
      base({
        readEnvFile: async () => {
          throw new Error('env read');
        },
      }),
    ),
  ).rejects.toThrow('Unable to read');
  await expect(
    runReview(
      '/root',
      base({
        readEnvFile: async () => {
          throw 'env string';
        },
      }),
    ),
  ).rejects.toThrow('env string');
  await runReview(
    '/root',
    base({
      usage: true,
      createClient: () => ({
        responses: {
          create: async () => ({
            output: [
              {
                type: 'function_call',
                name: 'submit_review',
                arguments: emptyIssuesJson,
              },
            ],
          }),
        },
      }),
    }),
  );
});

test('cleans up when the signal registrar has no removal hook', async () => {
  await runReview('/root', base({ register: () => ({}) }));
  await runReview('/root', base({ register: () => null }));
});

test('validates runReview scalar options before doing provider work', async () => {
  await expect(runReview('', base())).rejects.toThrow('cwd must be');
  await expect(runReview('/root', base({ maxSourceChars: 0 }))).rejects.toThrow(
    'maxSourceChars must be positive',
  );
  await expect(runReview('/root', base({ maxSourceChars: NaN }))).rejects.toThrow(
    'maxSourceChars must be finite',
  );
  await expect(runReview('/root', base({ testTimeoutMs: 0 }))).rejects.toThrow(
    'testTimeoutMs must be positive',
  );
  await expect(runReview('/root', base({ usage: 'yes' }))).rejects.toThrow(
    'option usage must be a boolean',
  );
});

test('redacts common structured credentials', () => {
  const output = redactTestOutput(
    '-----BEGIN PRIVATE KEY-----secret-----END PRIVATE KEY----- AKIA1234567890ABCDEF eyJabcde.abcdef.ghijk',
  );
  expect(output).toContain('[redacted-private-key]');
  expect(output).toContain('[redacted-aws-key]');
  expect(output).toContain('[redacted-jwt]');
  expect(redactTestOutput()).toBe('');
});
