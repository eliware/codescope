import { runReview } from '../../src/review/lifecycle.mjs';

const prompt = {
  input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
  tools: [
    {
      name: 'submit_review',
      parameters: { properties: { issues: { properties: { correctness: {} } } } },
    },
  ],
};
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
        verdict: 'pass',
      }),
    },
  ],
};
const base = (overrides = {}) => ({
  prompt,
  combine: async () => 'source',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  platform: 'linux',
  openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => 'OPENAI_API_TOKEN=test-token',
    close: async () => {},
  }),
  createClient: () => ({ responses: { create: async () => response } }),
  register: () => ({ removeHandlers() {} }),
  write: async (value) => ({ written: value.length }),
  ...overrides,
});

test('runs a normal review and writes the raw provider result unchanged', async () => {
  const writes = [];
  const result = await runReview(
    'C:/repo',
    base({
      write: async (value) => {
        writes.push(value);
        return { written: value.length };
      },
    }),
  );
  expect(result).toContain('"verdict":"pass"');
  expect(writes).toHaveLength(1);
  expect(writes[0]).toBe(result);
});

test('preserves Unicode provider output and counts JavaScript characters', async () => {
  const writes = [];
  const result = await runReview('C:/repo', base({
    plainText: 'summarize',
    createClient: () => ({ responses: { create: async () => ({ output_text: 'héllo 🌍' }) } }),
    write: async (value) => {
      writes.push(value);
      return { written: value.length };
    },
  }));
  expect(result).toBe('héllo 🌍');
  expect(writes).toEqual(['héllo 🌍']);
});

test('runs dry-run evidence without initializing the provider', async () => {
  const result = await runReview(
    'C:/repo',
    base({
      dryRun: true,
      createClient: () => ({
        responses: {
          create: async () => { throw new Error('dry-run must not create a review'); },
          inputTokens: { count: async () => ({ input_tokens: 1 }) },
        },
      }),
    }),
  );
  expect(result).toHaveProperty('estimated_input_tokens');
});

test('rejects invalid collaborators before provider work', async () => {
  await expect(runReview('C:/repo', base({ write: null }))).rejects.toThrow(/write/);
  await expect(runReview('C:/repo', base({ combine: null }))).rejects.toThrow(/combine/);
});

test('wraps signal registration failures', async () => {
  await expect(
    runReview(
      'C:/repo',
      base({
        register: () => {
          throw new Error('signal failure');
        },
      }),
    ),
  ).rejects.toThrow('signal failure');
});

test('rejects invalid prompt and token setup', async () => {
  await expect(runReview('C:/repo', base({ prompt: null }))).rejects.toThrow(/Prompt/);
  await expect(runReview('C:/repo', base({ openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => '',
    close: async () => {},
  }) }))).rejects.toThrow(
    /OPENAI_API_TOKEN/,
  );
});

test('writes a safe fallback when provider setup fails', async () => {
  const writes = [];
  await expect(
    runReview(
      'C:/repo',
      base({
        openEnvFile: async () => ({
          stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
          readFile: async () => '',
          close: async () => {},
        }),
        write: async (value) => {
          writes.push(value);
          return { written: value.length };
        },
      }),
    ),
  ).rejects.toMatchObject({ result: { issues: 'not submitted', suggestions: 'not submitted' } });
  expect(JSON.parse(writes[0])).toMatchObject({
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: 'Review setup failed',
  });
});

test('preserves setup fallback write failures as metadata', async () => {
  await expect(
    runReview(
      'C:/repo',
      base({
        write: async () => {
          throw new Error('fallback disk full');
        },
      }),
    ),
  ).rejects.toMatchObject({ fallbackError: { message: 'fallback disk full' } });
});
