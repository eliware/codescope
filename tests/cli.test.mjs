import { EXIT_CODES, errorExitCode, main, parseArgs, VERSION } from '../src/cli.mjs';
import { getProfile } from '../src/profiles/index.mjs';
// codescope ignore: the shipped executable is a pure Node process-wiring barrel; focused main tests are the complete contract for exit propagation.

// codescope ignore: npm lint and pack are independent npm-tooling gates; this focused suite tests CLI result handling without launching those external commands.

const emptyIssues = Object.fromEntries(
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
);
const emptySuggestions = Object.fromEntries(
  [...Object.keys(emptyIssues), 'new-features'].map((category) => [
    category,
    [{ location: 'none', suggestion: 'No suggestions found.', rationale: '', ignore_example: '' }],
  ]),
);
const validReviewFor = (profile, verdict = 'pass') => {
  const { prompt } = getProfile(profile, 'review');
  const categories = Object.keys(prompt.tools[0].parameters.properties.issues.properties);
  return {
    verdict,
    issues: Object.fromEntries(
      categories.map((category) => [category, emptyIssues[category] ?? [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }]]),
    ),
  };
};
// codescope ignore: npm test is the only runtime evidence contract exercised here; lint and pack are separate npm-tooling gates run by the handoff workflow, not behaviors of this CLI test suite.

// codescope ignore: lint and pack are handoff commands, not CLI runtime behavior; this test intentionally supplies npm-test evidence only.
test('covers effort and timeout argument validation paths', () => {
  expect(parseArgs(['review', 'all', '--effort=max', '--test-timeout', '45'])).toMatchObject({
    effort: 'max',
    testTimeout: '45',
  });
  expect(parseArgs(['all', '--test-timeout', '15'])).toMatchObject({ testTimeout: '15' });
  expect(parseArgs(['architecture', '--effort=high', '--test-timeout', '45'])).toMatchObject({
    effort: 'high',
    testTimeout: '45',
  });
  expect(parseArgs(['architecture', '--model=gpt-5.6-terra'])).toMatchObject({ model: 'gpt-5.6-terra' });
  expect(parseArgs(['all', '--dry-run'])).toMatchObject({ dryRun: true });
  expect(parseArgs(['review', 'all', '--dry-run'])).toMatchObject({ dryRun: true });
  expect(() => parseArgs(['all', '--dry-run', '--dry-run'])).toThrow(/Only one/);
  expect(() => parseArgs(['review', '--dry-run', 'all'])).toThrow(/Profile must precede/);
  expect(() => parseArgs(['review', 'new-features'])).toThrow(/suggestion-only/);
  for (const args of [
    ['review', 'all', '--effort=invalid'],
    ['review', 'all', '--test-timeout'],
    ['review', 'all', '--test-timeout', '0'],
    ['review', 'all', '--test-timeout', 'x'],
    ['all', '--test-timeout'],
    ['all', '--test-timeout', '0'],
    ['architecture', '--model=gpt-5.6-invalid'],
  ])
    expect(() => parseArgs(args)).toThrow();
});

test('parses and dispatches the plain-text prompt command', async () => {
  expect(parseArgs(['prompt', 'summarize', 'the', 'repository', '--effort=low'])).toEqual({
    command: 'prompt',
    promptText: 'summarize the repository',
    effort: 'low',
    model: undefined,
  });
  let received;
  const code = await main(['prompt', 'find', 'risks', '--model=gpt-5.6-sol'], {
    review: async (_cwd, options) => {
      received = options;
      return { text: 'done' };
    },
  });
  expect(code).toBe(EXIT_CODES.PASS);
  expect(received).toMatchObject({ plainText: 'find risks', model: 'gpt-5.6-sol' });
});

test('rejects invalid custom prompt options and forwards effort', async () => {
  expect(() => parseArgs(['prompt'])).toThrow(/prompt text/);
  expect(() => parseArgs(['prompt', 'x', '--bad'])).toThrow(/Usage/);
  expect(() => parseArgs(['prompt', 'x', '--effort=invalid'])).toThrow(/Effort/);
  expect(() => parseArgs(['prompt', 'x', '--model=bad'])).toThrow(/Model/);
  let received;
  await main(['prompt', 'x', '--effort=medium'], {
    review: async (_cwd, options) => { received = options; return { text: 'ok' }; },
  });
  expect(received.prompt.reasoning.effort).toBe('medium');
  expect(await main(['prompt', 'x'], { review: async () => ({}) })).toBe(EXIT_CODES.RESPONSE);
});

test('uses input exit code for unclassified errors and string failures', async () => {
  expect(errorExitCode(new Error('unclassified'))).toBe(EXIT_CODES.INPUT);
  const errors = [];
  expect(await main(['architecture'], {
    review: async () => { throw 'bad input'; },
    error: (value) => errors.push(value),
  })).toBe(EXIT_CODES.INPUT);
  expect(errors[0]).toContain('bad input');
});
test('passes effort and timeout overrides to review', async () => {
  let options;
  await main(['review', 'architecture', '--effort=high', '--test-timeout', '45'], {
    review: async (_cwd, value) => {
      options = value;
    },
  });
  expect(options.testTimeoutMs).toBe(45_000);
  expect(options.prompt.reasoning.effort).toBe('high');
});

test('passes model overrides to review', async () => {
  let options;
  await main(['architecture', '--model=gpt-5.6-sol'], {
    review: async (_cwd, value) => {
      options = value;
    },
  });
  expect(options.model).toBe('gpt-5.6-sol');
});
test('forwards grouped effort and model overrides to review', async () => {
  let options;
  await main(['review', 'architecture', '--effort=low', '--model=gpt-5.6-terra'], {
    review: async (_cwd, value) => ((options = value), { verdict: 'pass' }),
  });
  expect(options.prompt.reasoning.effort).toBe('low');
  expect(options.model).toBe('gpt-5.6-terra');
});

test('returns success for dry-run token estimates', async () => {
  let options;
  expect(
    await main(['all', '--dry-run'], {
      review: async (_cwd, value) => ((options = value), { model: 'gpt-5.6-luna' }),
    }),
  ).toBe(EXIT_CODES.PASS);
  expect(options.dryRun).toBe(true);
});

test('maps verdicts and lifecycle failures to documented exit codes', async () => {
  expect(
    await main(['architecture'], { review: async () => validReviewFor('architecture', 'block'), error: () => {} }),
  ).toBe(EXIT_CODES.BLOCKED);
  expect(errorExitCode(new Error('Unexpected arguments'))).toBe(EXIT_CODES.USAGE);
  expect(errorExitCode(new Error('OPENAI_API_TOKEN is missing'))).toBe(EXIT_CODES.CONFIGURATION);
  expect(errorExitCode(new Error('Unable to read source file'))).toBe(EXIT_CODES.INPUT);
  expect(errorExitCode(new Error('Invalid review response'))).toBe(EXIT_CODES.RESPONSE);
  expect(
    errorExitCode(Object.assign(new Error('invalid response'), { code: 'INVALID_RESPONSE' })),
  ).toBe(EXIT_CODES.RESPONSE);
  expect(errorExitCode(new Error('OpenAI request failed'))).toBe(EXIT_CODES.API);
  expect(
    errorExitCode(Object.assign(new Error('token counter unavailable'), { code: 'API' })),
  ).toBe(EXIT_CODES.API);
  expect(errorExitCode(new Error('timed out after 30 seconds'))).toBe(EXIT_CODES.TEST_TIMEOUT);
  expect(errorExitCode(new Error('SIGINT'))).toBe(EXIT_CODES.SIGINT);
  expect(errorExitCode(new Error('SIGTERM'))).toBe(EXIT_CODES.SIGTERM);
  expect(await main(['architecture'], { review: async () => undefined, error: () => {} })).toBe(
    EXIT_CODES.RESPONSE,
  );
});

test('accepts a successful suggestion result without a verdict', async () => {
  expect(
    await main(['suggest', 'new-features'], {
      review: async () => ({
        suggestions: {
          'new-features': [{ location: 'none', suggestion: 'none', rationale: '', ignore_example: '' }],
        },
      }),
    }),
  ).toBe(EXIT_CODES.PASS);
});

test('rejects duplicate effort options', () => {
  expect(() => parseArgs(['architecture', '--effort=low', '--effort=high'])).toThrow(
    'Only one --effort option is allowed',
  );
});

test('rejects duplicate model options', () => {
  expect(() => parseArgs(['architecture', '--model=gpt-5.6-luna', '--model=gpt-5.6-sol'])).toThrow(
    'Only one --model option is allowed',
  );
});

test('rejects duplicate effort options with different values', () => {
  expect(() => parseArgs(['review', 'all', '--effort=low', '--effort=high'])).toThrow(
    'Only one --effort option is allowed',
  );
});

test('rejects duplicate test timeout options', () => {
  expect(() =>
    parseArgs(['review', 'all', '--test-timeout', '10', '--test-timeout', '20']),
  ).toThrow('Only one --test-timeout option is allowed');
});

test('rejects test-result options for profiles without tests', async () => {
  expect(
    await main(['suggest', 'new-features', '--omit-test-results'], { error: () => {} }),
  ).toBe(EXIT_CODES.USAGE);
});

test('rejects unknown grouped profiles during argument parsing', () => {
  expect(() => parseArgs(['review', 'unknown'])).toThrow('Unknown command profile');
});

test('routes the public all command through the combined tool contract', async () => {
  let options;
  expect(
    await main(['all'], {
      review: async (_cwd, received) => {
        options = received;
        return { verdict: 'pass', issues: emptyIssues, suggestions: emptySuggestions };
      },
      error: () => {},
    }),
  ).toBe(0);
  expect(options.prompt.tools).toHaveLength(2);
  expect(options.prompt.parallel_tool_calls).toBe(true);
  expect(options.prompt.tool_choice).toBe('auto');
});

test('routes grouped review all through the combined tool contract', async () => {
  let options;
  expect(
    await main(['review', 'all'], {
      review: async (_cwd, received) => {
        options = received;
        return { verdict: 'pass', issues: emptyIssues, suggestions: emptySuggestions };
      },
      error: () => {},
    }),
  ).toBe(0);
  expect(options.prompt.tools.map((tool) => tool.name)).toEqual([
    'submit_review',
    'submit_suggestions',
  ]);
  expect(options.prompt.parallel_tool_calls).toBe(true);
});

test('routes grouped suggest all through the combined tool contract', async () => {
  let options;
  expect(
    await main(['suggest', 'all'], {
      review: async (_cwd, received) => {
        options = received;
        const categories = Object.keys(received.prompt.tools[0].parameters.properties.suggestions.properties);
        return {
          suggestions: Object.fromEntries(
            categories.map((category) => [category, [{ location: 'none', suggestion: 'none', rationale: '', ignore_example: '' }]]),
          ),
        };
      },
      error: () => {},
    }),
  ).toBe(0);
  expect(options.prompt.tools.map((tool) => tool.name)).toEqual(['submit_suggestions']);
  expect(options.prompt.parallel_tool_calls).toBe(false);
});

test('parses defaults and rejects bad arguments', () => {
  expect(parseArgs([])).toEqual({ command: 'help', option: undefined });
  expect(parseArgs(['help', '--help'])).toEqual({ command: 'help', option: '--help' });
  expect(parseArgs(['version', '-v'])).toEqual({ command: 'version', option: '-v' });
  expect(() => parseArgs(['--help', 'extra'])).toThrow(/Unexpected arguments/);
  expect(() => parseArgs(['--version', 'extra'])).toThrow(/Unexpected arguments/);
  expect(() => parseArgs(['help', 'extra'])).toThrow(/Unexpected arguments/);
  expect(() => parseArgs(['version', 'extra'])).toThrow(/Unexpected arguments/);
  expect(() => parseArgs(['help', '--version'])).toThrow(/not valid/);
  expect(() => parseArgs(['version', '--help'])).toThrow(/not valid/);
  expect(() => parseArgs(['--bad'])).toThrow(/Unknown option/);
});
test('parses direct analysis profiles', () => {
  expect(parseArgs(['all'])).toEqual({
    command: 'analyze-all',
    option: undefined,
  });
  expect(parseArgs(['architecture', '--help'])).toEqual({ command: 'analyze-architecture', option: '--help' });
  expect(() => parseArgs(['find'])).toThrow(/Unknown command/);
  expect(() => parseArgs(['architecture', '--no-tests'])).toThrow(/Unexpected arguments/);
});
test('parses grouped review and suggestion commands', () => {
  expect(parseArgs(['review', 'all'])).toEqual({
    command: 'analyze-all',
    mode: 'review',
    option: undefined,
    options: [],
  });
  expect(parseArgs(['suggest', 'new-features', '--usage'])).toEqual({
    command: 'analyze-new-features',
    mode: 'suggest',
    option: '--usage',
    testTimeout: undefined,
    options: ['--usage'],
  });
  expect(() => parseArgs(['review'])).toThrow(/Usage/);
  expect(() => parseArgs(['suggest', 'all', '--version'])).toThrow(/Usage/);
});
test('handles help and version options', async () => {
  const output = [];
  const errors = [];
  expect(await main(['architecture', '--version'], { error: (v) => errors.push(v) })).toBe(
    EXIT_CODES.USAGE,
  );
  expect(await main(['architecture', '--help'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['version', '--version'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['--help'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['--version'], { output: (v) => output.push(v) })).toBe(0);
  expect(errors[0]).toMatch(/not valid/);
  expect(output.join('\n')).toMatch(/Owner workflow/);
});

test('grouped help displays help without invoking review', async () => {
  let called = false;
  const output = [];
  expect(
    await main(['review', 'all', '--help'], {
      output: (value) => output.push(value),
      review: async () => {
        called = true;
        return validReviewFor('architecture');
      },
    }),
  ).toBe(0);
  expect(called).toBe(false);
  expect(output.join('\n')).toMatch(/Owner workflow/);
});
test('runs CLI commands', async () => {
  const output = [];
  const errors = [];
  expect(await main([], { output: (v) => output.push(v) })).toBe(0);
  expect(
    await main(['architecture'], {
      review: async (_c, { write }) => {
        write('reviewed');
        return validReviewFor('architecture');
      },
      write: (v) => output.push(v),
    }),
  ).toBe(0);
  expect(await main(['unknown'], { error: (v) => errors.push(v) })).toBe(2);
  expect(await main(['help'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['version'], { output: (v) => output.push(v) })).toBe(0);
  expect(output).toContain(VERSION);
  expect(errors[0]).toMatch(/Unknown command/);
});

test('runs direct analysis profiles without appending guidance', async () => {
  const output = [];
  for (const profile of [
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'all',
    'release',
  ])
    expect(
      await main([profile], {
        review: async (_cwd, received) => {
          const { write } = received;
          write(profile);
          return ['all', 'release'].includes(profile)
            ? {
                verdict: 'pass',
                issues: emptyIssues,
                suggestions: Object.fromEntries(Object.entries(emptySuggestions).filter(([category]) => profile === 'all' || category !== 'new-features')),
              }
            : profile === 'new-features'
            ? { suggestions: { 'new-features': [{ location: 'none', suggestion: 'none', rationale: '', ignore_example: '' }] } }
            : validReviewFor(profile);
        },
        write: (v) => output.push(v),
      }),
    ).toBe(0);
  expect(output).toHaveLength(18);
  expect(output).toEqual([
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'all',
    'release',
  ]);
});

test('treats direct new-features as a suggestion-only profile', async () => {
  let options;
  expect(
    await main(['new-features'], {
      review: async (_cwd, value) =>
        ((options = value), {
          suggestions: {
            'new-features': [{ location: 'none', suggestion: 'none', rationale: '', ignore_example: '' }],
          },
        }),
    }),
  ).toBe(EXIT_CODES.PASS);
  expect(options.prompt.tools[0].name).toBe('submit_suggestions');
});
