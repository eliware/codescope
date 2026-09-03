import { EXIT_CODES, errorExitCode, main, parseArgs, VERSION } from '../src/cli.mjs';
import { findMjsFiles, findFiles } from '../src/find-mjs.mjs';
import { findMdFiles } from '../src/find-mjs.mjs';
import { combineMjsFiles, combineMdFiles, combineFiles } from '../src/combine-mjs.mjs';
import { combineAllFiles, combineSelectedFiles } from '../src/combine-all.mjs';
import { benchmarkExitCode } from '../src/benchmark-status.mjs';
import { runReview } from '../src/review.mjs';
import { profilePrompt } from '../src/prompt.mjs';
import path from 'node:path';
import { getProfile } from '../src/cli-profiles.mjs';
// codescope ignore: the shipped executable is a pure Node process-wiring barrel; focused main tests are the complete contract for exit propagation.
import { defaultEnvFile, loadEnv } from '../src/review-config.mjs';

test('benchmark status fails for provider failures and incomplete runs', () => {
  expect(benchmarkExitCode([{ code: 0 }, { code: 0 }], 2)).toBe(0);
  expect(benchmarkExitCode([{ code: 1 }, { code: 0 }], 2)).toBe(1);
  expect(benchmarkExitCode([{ code: 0, signal: 'SIGTERM' }], 1)).toBe(1);
  expect(benchmarkExitCode([{ code: 0 }], 2)).toBe(1);
});

// codescope ignore: npm lint and pack are independent npm-tooling gates; this focused suite tests CLI result handling without launching those external commands.

const emptyIssues = Object.fromEntries(
  [
    'correctness',
    'security',
    'reliability',
    'performance',
    'architecture',
    'api_design',
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
const opts = (x = {}) => ({
  envFile: path.join('test-home', '.codescope'),
  readFile: async () => '',
  readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
  readDirectory: async () => [],
  ...x,
});

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
test('preserves non-text user content while extending prompts', () => {
  const prompt = profilePrompt('test focus');
  prompt.input[1].content.push({ type: 'input_image', image_url: 'data:image/png;base64,x' });
  expect(prompt.input[1].content[1]).toEqual({
    type: 'input_image',
    image_url: 'data:image/png;base64,x',
  });
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
    await main(['architecture'], { review: async () => ({ verdict: 'block' }), error: () => {} }),
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

test('builds suggestion prompts for focused profiles', () => {
  expect(getProfile('architecture', 'suggest').prompt.tools[0].name).toBe('submit_suggestions');
  expect(getProfile('security', 'suggest').prompt.tools[0].name).toBe('submit_suggestions');
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
  expect(output.join('\n')).toMatch(/quick start/);
});

test('grouped help displays help without invoking review', async () => {
  let called = false;
  const output = [];
  expect(
    await main(['review', 'all', '--help'], {
      output: (value) => output.push(value),
      review: async () => {
        called = true;
        return { verdict: 'pass' };
      },
    }),
  ).toBe(0);
  expect(called).toBe(false);
  expect(output.join('\n')).toMatch(/quick start/);
});
test('finds nested files and ignores configured directories', async () => {
  const tree = {
    '/root': [
      { name: '.git', isDirectory: () => true },
      { name: 'node_modules', isDirectory: () => true },
      { name: 'a.mjs', isFile: () => true },
      { name: 'lib', isDirectory: () => true },
    ],
    '/root/lib': [{ name: 'b.mjs', isFile: () => true }],
  };
  expect(
    await findMjsFiles('/root', {
      readDirectory: async (d) =>
        Object.entries(tree).find(([key]) => d.replaceAll('\\', '/').endsWith(key))?.[1],
    }),
  ).toEqual(['a.mjs', 'lib/b.mjs']);
  await expect(
    findMjsFiles('/root', { readDirectory: async () => [{ name: 'bad' }] }),
  ).rejects.toThrow(/Invalid directory entry/);
  await expect(
    findMjsFiles('/root', {
      readDirectory: async () => {
        throw new Error('denied');
      },
    }),
  ).rejects.toThrow(/Unable to scan/);
  await expect(findMjsFiles('/root', { readDirectory: async () => null })).rejects.toThrow(
    /non-array/,
  );
});
test('contextualizes directory entry failures', async () => {
  await expect(
    findMjsFiles('/root', {
      readDirectory: async () => [
        {
          name: 'bad',
          isDirectory: () => {
            throw new Error('adapter');
          },
        },
      ],
    }),
  ).rejects.toThrow(/Unable to scan/);
});
test('requires path strings and skips symlinks', async () => {
  await expect(findMjsFiles(null, { readDirectory: async () => [] })).rejects.toThrow(
    /path string/,
  );
  expect(await findMjsFiles('relative', { readDirectory: async () => [] })).toEqual([]);
  await expect(
    findMjsFiles('/root', {
      readDirectory: async () => [{ name: 'bad', isDirectory: () => true, isFile: () => true }],
    }),
  ).rejects.toThrow(/Invalid directory entry/);
  expect(
    await findMjsFiles('/root', {
      readDirectory: async () => [
        { name: 'link.mjs', isSymbolicLink: () => true, isFile: () => true },
        { name: 'link-dir', isSymbolicLink: () => true, isDirectory: () => true },
      ],
    }),
  ).toEqual([]);
});
test('combines files and reports read errors', async () => {
  const files = { '/root/a.mjs': 'a\n', '/root/nested/b.mjs': 'b' };
  const rd = async (d) =>
    d.replaceAll('\\', '/').endsWith('/root')
      ? [
          { name: 'a.mjs', isFile: () => true },
          { name: 'nested', isDirectory: () => true },
        ]
      : [{ name: 'b.mjs', isFile: () => true }];
  const result = await combineMjsFiles('/root', {
    readDirectory: rd,
    readFileContents: async (f) =>
      Object.entries(files).find(([k]) => f.replaceAll('\\', '/').endsWith(k))?.[1] ??
      (f.endsWith('a.mjs') ? 'a\n' : 'b'),
  });
  expect(result).toBe('===== a.mjs =====\n1 a\n\n===== nested/b.mjs =====\n1 b\n');
  await expect(
    combineMjsFiles('/root', {
      readDirectory: async () => [{ name: 'x.mjs', isFile: () => true }],
      readFileContents: async () => {
        throw new Error('denied');
      },
    }),
  ).rejects.toThrow(/Unable to read x.mjs/);
  await expect(
    combineMjsFiles('/root', {
      readDirectory: async () => [{ name: 'x.mjs', isFile: () => true }],
      readFileContents: async () => null,
    }),
  ).rejects.toThrow(/non-string/);
});
test('combines selected implementation, tests, and docs', async () => {
  const rd = async () => [
    { name: 'app.mjs', isFile: () => true },
    { name: 'app.test.mjs', isFile: () => true },
    { name: 'guide.md', isFile: () => true },
  ];
  const read = async (f) => (f.endsWith('.md') ? 'docs' : 'code');
  expect(
    await combineSelectedFiles('/root', {
      implementation: true,
      tests: true,
      docs: true,
      readDirectory: rd,
      readFileContents: read,
    }),
  ).toContain('guide.md');
  expect(
    await combineSelectedFiles('/root', { tests: true, readDirectory: rd, readFileContents: read }),
  ).toContain('app.test.mjs');
  expect(
    await combineSelectedFiles('/root', { readDirectory: rd, readFileContents: read }),
  ).toContain('===== package.json =====');
});
test('validates package metadata while combining all file groups', async () => {
  await expect(
    combineAllFiles('/root', {
      readDirectory: async () => [],
      readFileContents: async () => null,
    }),
  ).rejects.toThrow(/non-string/);
  await expect(
    combineAllFiles('/root', {
      readDirectory: async () => [],
      readFileContents: async () => {
        throw 'package read failure';
      },
    }),
  ).rejects.toThrow(/package read failure/);
  await expect(
    combineAllFiles('/root', {
      validateSymlinks: true,
      readDirectory: async () => [],
      readFileContents: async () => '{}',
    }),
  ).rejects.toThrow(/package.json/);
  await expect(
    combineAllFiles('/root', {
      validateSymlinks: true,
      inspectFile: async () => ({ isSymbolicLink: () => true }),
      readDirectory: async () => [],
      readFileContents: async () => '{}',
    }),
  ).rejects.toThrow(/symlinked package/);
});
test('places supplied test results in the selected-file sequence', async () => {
  const result = await combineSelectedFiles('/root', {
    tests: true,
    docs: true,
    testResults: '===== npm test =====\nexit code: 0',
    readDirectory: async () => [{ name: 'guide.md', isFile: () => true }],
    readFileContents: async (file) => (file.endsWith('.md') ? 'docs' : '{}'),
  });
  expect(result.indexOf('exit code: 0')).toBeLessThan(result.indexOf('guide.md'));
});
test('uses the native package reader when no reader is injected', async () => {
  const result = await combineAllFiles(process.cwd(), { readDirectory: async () => [] });
  expect(result).toContain('===== package.json =====');
});
test('finds and combines markdown files', async () => {
  const options = {
    readDirectory: async () => [{ name: 'guide.md', isFile: () => true }],
    readFileContents: async () => '# Guide',
  };
  expect(await findMdFiles('/root', options)).toEqual(['guide.md']);
  expect(await combineMdFiles('/root', options)).toContain('===== guide.md =====');
});
test('combines code and markdown for all analysis', async () => {
  const options = {
    readDirectory: async (d) =>
      d.endsWith('root')
        ? [
            { name: 'app.mjs', isFile: () => true },
            { name: 'guide.md', isFile: () => true },
          ]
        : [],
    readFileContents: async (f) => (f.endsWith('.mjs') ? 'code' : 'docs'),
  };
  const result = await combineAllFiles('/root', options);
  expect(result).toContain('===== app.mjs =====');
  expect(result).toContain('===== guide.md =====');
  await expect(combineAllFiles('/root', { ...options, maxChars: 30 })).rejects.toThrow(
    /character limit/,
  );
});
test('orders all content and inventories only excluded files with sizes', async () => {
  const files = ['package.json', 'guide.md', 'app.mjs', 'app.test.mjs', 'config.json', 'image.bin'];
  const result = await combineAllFiles('/root', {
    readDirectory: async (directory) => {
      if (directory.endsWith('root'))
        return files.map((name) => ({ name, isFile: () => true }))
          .concat(['.github', '.knit'].map((name) => ({ name, isDirectory: () => true })));
      if (directory.endsWith('.github')) return [
        { name: 'ci.yml', isFile: () => true },
        { name: 'binary.yml', isFile: () => true },
      ];
      if (directory.endsWith('.knit')) return [{ name: 'config.yml', isFile: () => true }];
      return [];
    },
    readFileContents: async (file) => {
      const name = file.split(/[\\/]/u).pop();
      if (name === 'image.bin') return Buffer.from([0, 1, 2]);
      if (name === 'package.json') return '{}';
      if (name === 'config.json') return 'a\nb';
      if (name === 'ci.yml' || name === 'config.yml') return 'name: check';
      if (name === 'binary.yml') return Buffer.from([0, 1, 2]);
      return name.endsWith('.md') ? '# docs' : 'code';
    },
  });
  expect(result.indexOf('===== package.json =====')).toBeLessThan(result.indexOf('===== guide.md ====='));
  expect(result.indexOf('===== repository configuration =====')).toBeLessThan(result.indexOf('===== guide.md ====='));
  expect(result).toContain('===== .github/ci.yml =====');
  expect(result).toContain('===== .knit/config.yml =====');
  expect(result).not.toContain('===== .github/binary.yml =====');
  expect(result.indexOf('===== guide.md =====')).toBeLessThan(result.indexOf('===== app.mjs ====='));
  expect(result.indexOf('===== app.mjs =====')).toBeLessThan(result.indexOf('===== app.test.mjs ====='));
  expect(result.indexOf('===== app.test.mjs =====')).toBeLessThan(result.indexOf('===== other files'));
  expect(result).toContain('config.json | text | 2 lines | 3 bytes');
  expect(result).toContain('image.bin | binary | 3 bytes');
  expect(result).not.toContain('guide.md | text');
});
test('truncates oversized repository configuration files', async () => {
  const longConfig = Array.from({ length: 201 }, (_, index) => `line-${index + 1}`).join('\n');
  const result = await combineAllFiles('/root', {
    readDirectory: async (directory) => directory.endsWith('root')
      ? [{ name: '.github', isDirectory: () => true }]
      : [{ name: 'large.yml', isFile: () => true }],
    readFileContents: async (file) => file.endsWith('package.json') ? '{}' : longConfig,
  });
  expect(result).toMatch(/\s+200 line-200/);
  expect(result).toContain('[truncated after 200 lines; remaining config omitted]');
  expect(result).not.toContain('line-201');
});
test('excludes test.mjs files when requested', async () => {
  const directory = async () => [
    { name: 'app.mjs', isFile: () => true },
    { name: 'app.test.mjs', isFile: () => true },
  ];
  expect(await findMjsFiles('/root', { readDirectory: directory, noTests: true })).toEqual([
    'app.mjs',
  ]);
});
test('formats empty source sections', async () => {
  await expect(
    combineMjsFiles('/root', {
      readDirectory: async () => [{ name: 'empty.mjs', isFile: () => true }],
      readFileContents: async () => '',
    }),
  ).resolves.toBe('===== empty.mjs =====\n1 [empty file]\n');
});
test('validates bounded file-read concurrency', async () => {
  await expect(
    combineMjsFiles('/root', { concurrency: 0, readDirectory: async () => [] }),
  ).rejects.toThrow(/concurrency/);
  await expect(
    combineMjsFiles('/root', { maxChars: Number.NaN, readDirectory: async () => [] }),
  ).rejects.toThrow(/maxChars/);
  await expect(
    combineMjsFiles('/root', { concurrency: 1.5, readDirectory: async () => [] }),
  ).rejects.toThrow(/concurrency/);
  for (const maxChars of [0, -1, '10', 1.5])
    await expect(
      combineMjsFiles('/root', { maxChars, readDirectory: async () => [] }),
    ).rejects.toThrow(/maxChars/);
});
test('validates real files and contextualizes non-Error read failures', async () => {
  await expect(
    combineMjsFiles(process.cwd(), {
      readDirectory: async (directory) =>
        directory.endsWith('bin')
          ? [{ name: 'codescope.mjs', isFile: () => true }]
          : [{ name: 'bin', isDirectory: () => true }],
      readFileContents: async () => {
        throw 'read failed';
      },
    }),
  ).rejects.toThrow(/read failed/);
});
test('covers profile aggregate limits and extension matching', async () => {
  const files = [{ name: 'APP.MJS', isFile: () => true }];
  const options = { readDirectory: async () => files, readFileContents: async () => 'code' };
  expect(await findFiles('/root', '.mjs', options)).toEqual(['APP.MJS']);
  await expect(
    combineSelectedFiles('/root', {
      implementation: true,
      docs: true,
      maxChars: 50,
      readDirectory: async () => [
        { name: 'app.mjs', isFile: () => true },
        { name: 'guide.md', isFile: () => true },
      ],
      readFileContents: async () => 'content',
    }),
  ).rejects.toThrow(/character limit/);
});
test('rejects Windows roots on non-Windows hosts', async () => {
  const options = { readDirectory: async () => [], readFileContents: async () => '' };
  if (process.platform !== 'win32') {
    await expect(findFiles('C:\\root', '.mjs', options)).rejects.toThrow(/Windows-style/);
    await expect(combineFiles('C:\\root', '.mjs', options)).rejects.toThrow(/Windows-style/);
  }
});
test('runs CLI commands', async () => {
  const output = [];
  const errors = [];
  expect(await main([], { output: (v) => output.push(v) })).toBe(0);
  expect(
    await main(['architecture'], {
      review: async (_c, { write }) => {
        write('reviewed');
        return { verdict: 'pass' };
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
  ])
    expect(
      await main([profile], {
        review: async (_cwd, received) => {
          const { write } = received;
          write(profile);
          return profile === 'all'
            ? { verdict: 'pass', issues: emptyIssues, suggestions: emptySuggestions }
            : profile === 'new-features'
            ? { suggestions: { 'new-features': [{ location: 'none', suggestion: 'none', rationale: '', ignore_example: '' }] } }
            : { verdict: 'pass' };
        },
        write: (v) => output.push(v),
      }),
    ).toBe(0);
  expect(output).toHaveLength(17);
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
test('builds every profile strategy', async () => {
  for (const profile of [
    'refactor',
    'architecture',
    'new-features',
    'security',
    'performance',
    'reliability',
    'api-design',
    'dependencies',
    'observability',
    'accessibility',
    'quick-wins',
    'prioritize',
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'all',
  ]) {
    const { combine } = getProfile(profile);
    await expect(
      combine('/root', { readDirectory: async () => [], readFileContents: async () => '{}' }),
    ).resolves.toContain('===== package.json =====');
  }
  expect(() => getProfile('missing')).toThrow(/Unknown analysis profile/);
  expect(() => getProfile('architecture', 'suggestion')).toThrow('Unknown profile mode');
});

test('applies review source selection to suggestion profiles', async () => {
  const options = {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false }),
  };
  await expect(getProfile('architecture', 'suggest').combine('/root', options)).resolves.toContain(
    'package.json',
  );
});
test('all prompt reports every priority while blocking only material findings', () => {
  const all = getProfile('all').prompt.input[1].content[0].text;
  expect(all).toMatch(/Report all actionable findings, including P0, P1, P2, and P3/);
  expect(all).toMatch(/P2 and P3 findings must be reported but must not affect the verdict/);
  expect(all).toMatch(/validation-integrity/);
  expect(all).toMatch(/passing test command does not downgrade/);
  expect(all).toMatch(/apply the global pass\/block criteria/);
});
test('scopes review and suggestion tools by profile', () => {
  const all = getProfile('all', 'review').prompt;
  expect(all.tools.map((tool) => tool.name)).toEqual(['submit_review', 'submit_suggestions']);
  expect(all.parallel_tool_calls).toBe(true);
  expect(
    getProfile('security', 'review').prompt.tools[0].parameters.properties.issues.required,
  ).toEqual(['security']);
  expect(
    getProfile('architecture', 'review').prompt.tools[0].parameters.properties.issues.required,
  ).toEqual(['architecture']);
  expect(
    getProfile('new-features', 'suggest').prompt.tools[0].parameters.properties.suggestions
      .required,
  ).toEqual(['new-features']);
  expect(
    getProfile('security', 'suggest').prompt.tools[0].parameters.properties.suggestions.required,
  ).toEqual(['security', 'new-features']);
  expect(
    getProfile('all', 'suggest').prompt.tools[0].parameters.properties.suggestions.required,
  ).toContain('new-features');
});
test('global prompt defines shared priorities from supplied evidence', () => {
  const text = getProfile('architecture').prompt.input[1].content[0].text;
  expect(text).toMatch(/Use P0 for an active or imminent severe incident, or any supplied test/);
  expect(text).toMatch(/Use P1 only when every condition below is true/);
  expect(text).toMatch(/Eliware release-contract rules/);
  expect(text).toMatch(/Required source\/test structure is P1 only/);
  expect(text).toMatch(/Use P2 for a real, actionable issue that should be addressed/);
  expect(text).toMatch(/Use P3 for low-risk improvements/);
  expect(text).toMatch(/Do not infer CI, npm pack, npm audit, Git status, deployment-readiness, rollback/);
});
test('rejects oversized files before formatting', async () => {
  await expect(
    combineMjsFiles('/root', {
      maxChars: 2,
      readDirectory: async () => [{ name: 'large.mjs', isFile: () => true }],
      readFileContents: async () => 'large',
    }),
  ).rejects.toThrow(/character limit/);
  await expect(
    combineMjsFiles('/root', {
      maxChars: 20,
      readDirectory: async () => [{ name: 'x.mjs', isFile: () => true }],
      readFileContents: async () => 'a',
    }),
  ).rejects.toThrow(/character limit/);
  await expect(
    combineMjsFiles('/root', {
      maxChars: 35,
      readDirectory: async () => [
        { name: 'a.mjs', isFile: () => true },
        { name: 'b.mjs', isFile: () => true },
      ],
      readFileContents: async () => 'a',
    }),
  ).rejects.toThrow(/character limit/);
});
test('isolates review configuration helpers', () => {
  expect(defaultEnvFile()).toMatch(/\.codescope$/u);
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=first\nOPENAI_API_TOKEN=second', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('first');
  loadEnv('OPENAI_API_TOKEN=third', { OPENAI_API_TOKEN: 'existing' });
});

test('pretty prints the complete non-streamed tool result', async () => {
  const output = [];
  await runReview(
    '/root',
    opts({
      write: (v) => output.push(v),
      createClient: () => ({
        responses: {
          create: async (request) => {
            expect(request.stream).toBeUndefined();
            expect(request.tool_choice).toEqual({ type: 'function', name: 'submit_review' });
            return {
              output: [
                {
                  type: 'function_call',
                  name: 'submit_review',
                  arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
                },
              ],
            };
          },
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(output).toEqual([
    `${JSON.stringify({ issues: emptyIssues, verdict: 'pass' }, null, 2)}\n`,
  ]);
});
test('adds usage to the structured output only when requested', async () => {
  const output = [];
  await runReview(
    '/root',
    opts({
      usage: true,
      write: (v) => output.push(v),
      createClient: () => ({
        responses: {
          create: async () => ({
            usage: { total_tokens: 7 },
            output: [
              {
                type: 'function_call',
                name: 'submit_review',
                arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
              },
            ],
          }),
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(JSON.parse(output[0])).toEqual({
    issues: emptyIssues,
    verdict: 'pass',
    usage: { total_tokens: 7, estimated_cost_usd: 0 },
  });
});
test('reports unavailable usage in the structured output', async () => {
  const output = [];
  await runReview(
    '/root',
    opts({
      usage: true,
      write: (v) => output.push(v),
      createClient: () => ({
        responses: {
          create: async () => ({
            output: [
              {
                type: 'function_call',
                name: 'submit_review',
                arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
              },
            ],
          }),
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(JSON.parse(output[0])).toEqual({ issues: emptyIssues, verdict: 'pass', usage: null });
});
test('enforces the combined-source limit', async () => {
  await expect(
    runReview(
      '/root',
      opts({
        maxSourceChars: 1,
        readDirectory: async () => [{ name: 'x.mjs', isFile: () => true }],
        readFile: async (f) => (f.endsWith('x.mjs') ? 'too long' : ''),
      }),
    ),
  ).rejects.toThrow(/character limit/);
  await expect(runReview('/root', opts({ maxSourceChars: 0 }))).rejects.toThrow(/positive/);
});
test('replaces the optional custom prompt placeholder', async () => {
  let request;
  await runReview(
    '/root',
    opts({
      prompt: {
        input: [
          { role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] },
        ],
      },
      readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
      readDirectory: async () => [{ name: 'x.mjs', isFile: () => true }],
      readFile: async (f) => (f.endsWith('x.mjs') ? 'source' : ''),
      createClient: () => ({
        responses: {
          create: async (value) => {
            request = value;
            return {
              output: [
                {
                  type: 'function_call',
                  name: 'submit_review',
                  arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
                },
              ],
            };
          },
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(request.input[0].content[0].text).toContain('source');
});

test('parses dotenv quoting and invokes shutdown cleanup', async () => {
  const output = [];
  let shutdown;
  await runReview(
    '/root',
    opts({
      readEnvFile: async () =>
        'OPENAI_API_TOKEN="test\\n-token"\nSINGLE=\'value\'\nPLAIN=value # comment',
      write: (v) => output.push(v),
      createClient: () => ({
        responses: {
          create: async () => ({
            output: [
              {
                type: 'function_call',
                name: 'submit_review',
                arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
              },
            ],
          }),
        },
      }),
      register: (args) => {
        shutdown = args.shutdownHook;
        return { removeHandlers: () => {} };
      },
    }),
  );
  shutdown();
  expect(JSON.parse(output[0])).toEqual({ issues: emptyIssues, verdict: 'pass' });
});
test('validates prompt shapes', async () => {
  await expect(runReview('/root', opts({ prompt: { input: [] } }))).rejects.toThrow(
    /exactly one developer/,
  );
  await expect(runReview('/root', opts({ prompt: { input: 'bad' } }))).rejects.toThrow(
    /input as an array/,
  );
  await expect(
    runReview('/root', opts({ prompt: { input: [{ role: 'developer', content: 'bad' }] } })),
  ).rejects.toThrow(/invalid shapes/);
  await expect(
    runReview(
      '/root',
      opts({
        prompt: {
          input: [
            {
              role: 'developer',
              content: [
                { type: 'input_text', text: 'one' },
                { type: 'input_text', text: 'two' },
              ],
            },
          ],
        },
      }),
    ),
  ).rejects.toThrow(/input_text/);
  await expect(runReview('/root', opts({ prompt: { extra: true, input: [] } }))).rejects.toThrow(
    /unsupported/,
  );
});
test('rejects custom prompts without a source placeholder', async () => {
  await expect(
    runReview(
      '/root',
      opts({
        prompt: {
          input: [{ role: 'developer', content: [{ type: 'input_text', text: 'custom' }] }],
        },
      }),
    ),
  ).rejects.toThrow(/placeholder/);
});
test('rejects invalid top-level and input fields', async () => {
  await expect(runReview('/root', opts({ prompt: null }))).rejects.toThrow(/top-level/);
  await expect(runReview('/root', opts({ prompt: { input: [{}, {}] } }))).rejects.toThrow(
    /invalid shapes/,
  );
  await expect(runReview('/root', opts({ prompt: { model: 1, input: [] } }))).rejects.toThrow(
    /invalid Responses/,
  );
  await expect(runReview('/root', opts({ prompt: { tools: 'bad', input: [] } }))).rejects.toThrow(
    /invalid Responses/,
  );
  await expect(runReview('/root', opts({ prompt: { input: [null] } }))).rejects.toThrow(
    /input entries/,
  );
});
test('reports malformed dotenv and client setup', async () => {
  await expect(runReview('/root', opts({ readEnvFile: async () => 'not valid' }))).rejects.toThrow(
    /Invalid .env/,
  );
  await expect(
    runReview('/root', opts({ readEnvFile: async () => 'OPENAI_API_TOKEN="unterminated' })),
  ).rejects.toThrow(/quoted/);
  await expect(
    runReview(
      '/root',
      opts({
        readEnvFile: async () => 'OPENAI_API_TOKEN=first\nOPENAI_API_TOKEN=second',
        createClient: () => {
          throw new Error('bad client');
        },
      }),
    ),
  ).rejects.toThrow(/initialize/);
});

test('handles missing token and non-Error CLI failures', async () => {
  await expect(runReview('/root', opts({ readEnvFile: async () => '' }))).rejects.toThrow(
    /OPENAI_API_TOKEN/,
  );
  const errors = [];
  expect(
    await main(['architecture'], {
      review: async () => {
        throw 'bad input';
      },
      error: (v) => errors.push(v),
    }),
  ).toBe(EXIT_CODES.INPUT);
  expect(errors[0]).toContain('bad input');
});
