import { runProviderSession } from "../../../src/review/session/run-provider-session.mjs";

test("runs a provider session and preserves its response", async () => {
  await expect(
    runProviderSession({
      client: { responses: { create: async () => ({ output_text: "ok" }) } },
      request: { model: "gpt-5.6-sol", input: [] },
      signal: undefined,
    }),
  ).resolves.toMatchObject({ kind: "review", output: "ok" });
});

test("keeps custom prompt output raw with tools disabled", async () => {
  const output = '{"provider-defined":"text"}';
  let sentRequest;
  await expect(
    runProviderSession({
      client: {
        responses: {
          create: async (request) => {
            sentRequest = request;
            return { output_text: output };
          },
        },
      },
      request: { model: "gpt-5.6-sol", input: [], tools: [] },
      signal: undefined,
      plainText: "custom",
    }),
  ).resolves.toMatchObject({ kind: "prompt", output });
  expect(sentRequest.tools).toEqual([]);
});

test("attaches malformed responses to errors", async () => {
  const response = { output: [] };
  await expect(
    runProviderSession({
      client: { responses: { create: async () => response } },
      request: { model: "gpt-5.6-sol", input: [] },
      signal: undefined,
    }),
  ).rejects.toMatchObject({ providerResponse: response });
});
