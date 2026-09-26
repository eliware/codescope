import { runDryRun } from "../../src/review/dry-run.mjs";

test("coordinates request counting and optional usage projection", async () => {
  await expect(
    runDryRun({
      client: { responses: { inputTokens: { count: async () => ({ input_tokens: 42 }) } } },
      request: { model: "gpt-6-luna", input: [], store: false },
      signal: {},
      model: "gpt-6-luna",
      usage: true,
    }),
  ).resolves.toMatchObject({
    model: "gpt-6-luna",
    estimated_input_tokens: 42,
    usage: { input_tokens: 42 },
  });
});

test("coordinates a token count without usage projection", async () => {
  await expect(
    runDryRun({
      client: { responses: { inputTokens: { count: async () => ({ input_tokens: 0 }) } } },
      request: {},
      signal: new AbortController().signal,
      model: "gpt-6-luna",
      usage: false,
    }),
  ).resolves.toEqual({ model: "gpt-6-luna", estimated_input_tokens: 0 });
});
