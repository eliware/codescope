import { executeRequest } from '../../../src/review/pipeline/execute-request.mjs';

test('executes and returns the finalized session output', async () => {
  const output = await executeRequest({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request: { model: 'gpt-5.6-sol' }, controller: new AbortController(),
    options: { register: () => [], write: async (value) => ({ written: value.length }), dryRun: true, usage: false },
  });
  expect(output).toBeDefined();
});
