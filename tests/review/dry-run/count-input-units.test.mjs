import { countInputTokens } from "../../../src/review/dry-run/count-input-units.mjs";

test("counts a request without state and presentation-only fields", async () => {
  let call;
  const inputTokens = {
    _client: {
      post: async (...args) => {
        call = args;
        return { input_tokens: 42 };
      },
    },
    count(body, options) {
      return this._client.post("/responses/input_tokens", { body, ...options });
    },
  };
  const client = {
    responses: {
      inputTokens,
    },
  };
  const signal = {};
  await expect(
    countInputTokens(
      client,
      {
        model: "gpt-6-luna",
        input: [],
        tools: [],
        store: false,
        include: ["output_text"],
        prompt_cache_options: { retention: "24h" },
        service_tier: "priority",
      },
      signal,
    ),
  ).resolves.toBe(42);
  expect(call).toEqual([
    "/responses/input_tokens",
    { body: { model: "gpt-6-luna", input: [], tools: [] }, signal },
  ]);
});

test("rejects clients without input-token counting", async () => {
  await expect(countInputTokens({}, {}, {})).rejects.toMatchObject({ code: "API" });
});

test("rejects negative and unsafe token counts", async () => {
  const client = { responses: { inputTokens: { count: async () => ({ input_tokens: -1 }) } } };
  await expect(countInputTokens(client, {}, {})).rejects.toMatchObject({
    code: "INVALID_RESPONSE",
  });
  client.responses.inputTokens.count = async () => ({
    input_tokens: Number.MAX_SAFE_INTEGER + 1,
  });
  await expect(countInputTokens(client, {}, {})).rejects.toMatchObject({
    code: "INVALID_RESPONSE",
  });
});
