import { runReview } from '../../src/review/lifecycle.mjs';

const prompt = {
  input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
  tools: [{ name: 'submit_review', parameters: { properties: { issues: { properties: { correctness: {} } } } } }],
};
const response = {
  output: [{ type: 'function_call', name: 'submit_review', arguments: JSON.stringify({
    issues: { correctness: [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }] },
    verdict: 'pass',
  }) }],
};
const base = (overrides = {}) => ({
  prompt,
  combine: async () => 'source',
  readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
  createClient: () => ({ responses: { create: async () => response } }),
  register: () => ({ removeHandlers() {} }),
  write: async () => {},
  ...overrides,
});

test('runs a normal review and writes the validated result', async () => {
  const writes = [];
  const result = await runReview('C:/repo', base({ write: async (value) => writes.push(value) }));
  expect(result.verdict).toBe('pass');
  expect(writes).toHaveLength(1);
});

test('runs dry-run evidence without initializing the provider', async () => {
  const result = await runReview('C:/repo', base({
    dryRun: true,
    createClient: () => ({ responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } }),
  }));
  expect(result).toHaveProperty('estimated_input_tokens');
});

test('collects successful test evidence before review', async () => {
  const result = await runReview('C:/repo', base({
    includesTests: true,
    runTestCommand: async () => '===== npm test =====\nexit code: 0\nTests passed',
  }));
  expect(result.verdict).toBe('pass');
});

test('preserves failing test evidence as a blocking result', async () => {
  const result = await runReview('C:/repo', base({
    includesTests: true,
    runTestCommand: async () => '===== npm test =====\nexit code: 1\nTests failed',
  }));
  expect(result.verdict).toBe('block');
});

test('rejects invalid collaborators before provider work', async () => {
  await expect(runReview('C:/repo', base({ write: null }))).rejects.toThrow(/write/);
  await expect(runReview('C:/repo', base({ combine: null }))).rejects.toThrow(/combine/);
});

test('wraps signal registration failures', async () => {
  await expect(runReview('C:/repo', base({ register: () => { throw new Error('signal failure'); } })))
    .rejects.toThrow('signal failure');
});

test('rejects invalid prompt and token setup', async () => {
  await expect(runReview('C:/repo', base({ prompt: null }))).rejects.toThrow(/Prompt/);
  await expect(runReview('C:/repo', base({ readEnvFile: async () => '' }))).rejects.toThrow(/OPENAI_API_TOKEN/);
});
