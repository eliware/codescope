import { runReviewPipeline } from '../../src/review/run-review-pipeline.mjs';

test('coordinates preparation, context, request, execution, and cleanup', async () => {
  const writes = [];
  let combineOptions;
  const result = await runReviewPipeline('repo', {
    envFile: 'ignored',
    readFile: async () => 'OPENAI_API_TOKEN=token',
    readEnvFile: async () => 'OPENAI_API_TOKEN=token',
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    inspectPermissions: async () => ({}),
    platform: 'win32',
    validatePermissions: false,
    createClient: () => ({
      responses: { create: async () => ({ output_text: '{"verdict":"pass"}' }) },
    }),
    omitTestResults: false,
    redactOutput: (value) => value,
    combine: async (_cwd, options) => {
      combineOptions = options;
      return 'source';
    },
    readDirectory: async () => [],
    maxSourceChars: 10,
    prompt: {
      input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
      tools: [],
    },
    model: 'gpt-5.6-luna',
    write: async (value) => {
      writes.push(value);
    },
    dryRun: false,
    usage: false,
    plainText: 'review',
    register: () => ({ removeHandlers() {} }),
  });
  expect(result).toBe('{"verdict":"pass"}');
  expect(writes).toHaveLength(1);
  expect(combineOptions.platform).toBe('win32');
});

test('collects evidence before initializing the provider', async () => {
  let initialized = false;
  await expect(
    runReviewPipeline('repo', {
      combine: async () => {
        throw new Error('evidence failed');
      },
      readFile: async () => '',
      maxSourceChars: 10,
      platform: 'linux',
      createClient: () => {
        initialized = true;
        return {};
      },
    }),
  ).rejects.toThrow('evidence failed');
  expect(initialized).toBe(false);
});
