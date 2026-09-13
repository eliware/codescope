import { runReviewPipeline } from '../../src/review/run-review-pipeline.mjs';

test('coordinates preparation, context, request, execution, and cleanup', async () => {
  const writes = [];
  const result = await runReviewPipeline('repo', {
    envFile: 'ignored',
    readFile: async () => 'OPENAI_API_TOKEN=token',
    readEnvFile: async () => 'OPENAI_API_TOKEN=token',
    inspectFile: async () => ({}),
    inspectPermissions: async () => ({}),
    platform: 'win32',
    createClient: () => ({
      responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) },
    }),
    omitTestResults: false,
    redactOutput: (value) => value,
    combine: async () => 'source',
    readDirectory: async () => [],
    maxSourceChars: 10,
    prompt: {
      input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
      tools: [],
    },
    model: 'gpt-5.6-luna',
    write: async (value) => writes.push(value),
    dryRun: false,
    usage: false,
    plainText: 'review',
    register: () => ({ removeHandlers() {} }),
  });
  expect(result.verdict).toBe('pass');
  expect(writes).toHaveLength(1);
});
