import { runProviderAndWrite } from '../../../src/review/session/run-provider-and-write.mjs';

test('runs a provider session and writes its result', async () => {
  const output = [];
  const result = await runProviderAndWrite({
    client: { responses: { create: async () => ({ output_text: 'ok' }) } },
    request: { input: [] },
    write: async (value) => {
      output.push(value);
      return { written: value.length };
    },
  });
  expect(result).toBeDefined();
  expect(output.length).toBe(1);
});
