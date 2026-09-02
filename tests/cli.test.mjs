import { main, parseArgs, VERSION } from '../src/cli.mjs';
import { findMjsFiles, findFiles } from '../src/find-mjs.mjs';
import { findMdFiles } from '../src/find-mjs.mjs';
import { combineMjsFiles, combineMdFiles, combineFiles } from '../src/combine-mjs.mjs';
import { combineAllFiles, combineSelectedFiles } from '../src/combine-all.mjs';
import { runReview } from '../src/review.mjs';
import { prompt as defaultPrompt } from '../src/prompt.mjs';
import path from 'node:path';
import { getProfile } from '../src/cli-profiles.mjs';
import { defaultEnvFile, loadEnv } from '../src/review-config.mjs';

const valid = () => structuredClone(defaultPrompt);
const opts = (x = {}) => ({
  envFile: path.join('test-home', '.codescope'),
  readFile: async () => '',
  readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
  readDirectory: async () => [],
  ...x,
});
const client = (events) => ({
  responses: {
    create: async () =>
      (async function* () {
        yield* events;
      })(),
  },
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
  expect(parseArgs(['code-tests-docs'])).toEqual({
    command: 'analyze-code-tests-docs',
    option: undefined,
  });
  expect(parseArgs(['docs', '--help'])).toEqual({ command: 'analyze-docs', option: '--help' });
  expect(() => parseArgs(['find'])).toThrow(/Unknown command/);
  expect(() => parseArgs(['code', '--no-tests'])).toThrow(/Unexpected arguments/);
});
test('handles help and version options', async () => {
  const output = [];
  const errors = [];
  expect(await main(['code', '--version'], { error: (v) => errors.push(v) })).toBe(2);
  expect(await main(['code', '--help'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['version', '--version'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['--help'], { output: (v) => output.push(v) })).toBe(0);
  expect(await main(['--version'], { output: (v) => output.push(v) })).toBe(0);
  expect(errors[0]).toMatch(/not valid/);
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
    d.replaceAll('\\', '/') === '/root'
      ? [
          { name: 'a.mjs', isFile: () => true },
          { name: 'nested', isDirectory: () => true },
        ]
      : [{ name: 'b.mjs', isFile: () => true }];
  const result = await combineMjsFiles('/root', {
    readDirectory: rd,
    readFileContents: async (f) =>
      Object.entries(files).find(([k]) => f.replaceAll('\\', '/').endsWith(k))?.[1],
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
  expect(await combineSelectedFiles('/root', { readDirectory: rd, readFileContents: read })).toBe(
    '',
  );
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
  expect(await findFiles('/root', '.mjs', options)).toEqual([]);
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
    await main(['code'], {
      review: async (_c, { write }) => write('reviewed'),
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
    'code',
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'tests',
    'code-tests',
    'tests-docs',
    'docs',
    'code-docs',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'code-tests-docs',
    'all',
    'release',
  ])
    expect(
      await main([profile], {
        review: async (_cwd, { write }) => write(profile),
        write: (v) => output.push(v),
      }),
    ).toBe(0);
  expect(output).toHaveLength(25);
  expect(output).toEqual([
    'code',
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'tests',
    'code-tests',
    'tests-docs',
    'docs',
    'code-docs',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'code-tests-docs',
    'all',
    'release',
  ]);
});
test('builds every profile strategy', async () => {
  for (const profile of [
    'code',
    'code-docs',
    'code-tests',
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
    'release',
    'quick-wins',
    'prioritize',
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'code-tests-docs',
    'all',
    'tests',
    'tests-docs',
    'docs',
  ]) {
    const { combine } = getProfile(profile);
    await expect(combine('/root', { readDirectory: async () => [] })).resolves.toBe('');
  }
  expect(() => getProfile('missing')).toThrow(/Unknown analysis profile/);
});
test('release prompt inventories evidenced P0/P1 blockers before its verdict', () => {
  const release = getProfile('release').prompt.input[1].content[0].text;
  expect(release).toMatch(/every concrete P0 or P1 release blocker/);
  expect(release).toMatch(/Ignore P2 and P3 findings completely/);
  expect(release).toMatch(/Absence of validation results is not a blocker/);
  expect(release).toMatch(/Build an internal inventory of ALL distinct P0\/P1 blockers/);
  expect(release).toMatch(/inventory of ALL distinct P0\/P1 blockers before calling submit_review/);
  expect(release).toMatch(/the verdict is last/);
  expect(release).toMatch(/do not stop after the first blocker/);
  expect(release).toMatch(/Call submit_review exactly once/);
});
test('global prompt defines shared priorities from supplied evidence', () => {
  const text = getProfile('code').prompt.input[1].content[0].text;
  expect(text).toMatch(/P0 = Active outage, data-loss risk, critical security incident/);
  expect(text).toMatch(
    /P1 = Release-blocking failure: required tests or contract validation evident in the supplied files/,
  );
  expect(text).toMatch(/P2 = Important follow-up that does not block the release/);
  expect(text).toMatch(/P3 = Polish, cleanup, optimization, or convenience work/);
  expect(text).toMatch(/Do not infer CI, packaging, deployment-readiness, rollback/);
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
                  arguments: JSON.stringify({ issues: [], verdict: 'pass' }),
                },
              ],
            };
          },
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(output).toEqual(['{\n  "issues": [],\n  "verdict": "pass"\n}\n']);
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
                arguments: JSON.stringify({ issues: [], verdict: 'pass' }),
              },
            ],
          }),
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(JSON.parse(output[0])).toEqual({
    issues: [],
    verdict: 'pass',
    usage: { total_tokens: 7 },
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
                arguments: JSON.stringify({ issues: [], verdict: 'pass' }),
              },
            ],
          }),
        },
      }),
      register: () => ({ removeHandlers: () => {} }),
    }),
  );
  expect(JSON.parse(output[0])).toEqual({ issues: [], verdict: 'pass', usage: null });
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
                  arguments: JSON.stringify({ issues: [], verdict: 'pass' }),
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
                arguments: JSON.stringify({ issues: [], verdict: 'pass' }),
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
  expect(JSON.parse(output[0])).toEqual({ issues: [], verdict: 'pass' });
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
    await main(['code'], {
      review: async () => {
        throw 'bad input';
      },
      error: (v) => errors.push(v),
    }),
  ).toBe(2);
  expect(errors[0]).toContain('bad input');
});
