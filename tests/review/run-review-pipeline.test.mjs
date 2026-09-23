import { runReviewPipeline } from '../../src/review/run-review-pipeline.mjs';

const base = {
  readFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => 'OPENAI_API_TOKEN=token', close: async () => {},
  }),
  platform: 'linux', maxSourceChars: 10,
};
const prompt = { input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }], tools: [] };

test('propagates prepared evidence through request execution and output', async () => {
  const writes = [];
  let combineOptions;
  const result = await runReviewPipeline('repo', {
    ...base,
    combine: async (_cwd, options) => { combineOptions = options; return 'source'; },
    createClient: () => ({ responses: { create: async () => ({ output_text: 'result' }) } }),
    prompt,
    write: async (value) => { writes.push(value); return { written: value.length }; },
    register: () => ({ removeHandlers() {} }),
  });
  expect(result).toBe('result');
  expect(writes).toHaveLength(1);
  expect(combineOptions.platform).toBe('linux');
});

test('writes setup failure fallback when evidence collection fails', async () => {
  const writes = [];
  await expect(runReviewPipeline('repo', {
    ...base, combine: async () => { throw new Error('evidence failed'); }, createClient: () => ({}),
    write: async (value) => { writes.push(value); return { written: value.length }; },
  })).rejects.toThrow('CodeScope setup failed: evidence failed');
  expect(JSON.parse(writes[0])).toMatchObject({ issues: 'not submitted' });
});

test('routes request construction failures through the phase boundary', async () => {
  await expect(runReviewPipeline('repo', {
    ...base,
    combine: async () => 'source',
    createClient: () => ({}),
    prompt: { input: [{ role: 'developer', content: [{ type: 'input_text', text: 'invalid' }] }], tools: [] },
    write: async (value) => ({ written: value.length }),
  })).rejects.toThrow(/developer text/);
});

test('routes provider execution failures through the phase boundary', async () => {
  await expect(runReviewPipeline('repo', {
    ...base,
    combine: async () => 'source',
    createClient: () => ({ responses: { create: async () => { throw new Error('provider failed'); } } }),
    prompt,
    register: () => ({ removeHandlers() {} }),
    write: async (value) => ({ written: value.length }),
  })).rejects.toThrow(/provider failed/);
});

