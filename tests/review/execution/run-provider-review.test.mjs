import { runProviderSession } from "../../../src/review/execution/run-provider-review.mjs";

test("preserves finding review reasoning and logs one request and response", async () => {
  const requests = [];
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  try {
    await runProviderSession({
      client: {
        responses: {
          create: async (request) => {
            requests.push(structuredClone(request));
            return {
              output: [
                {
                  type: "function_call",
                  name: "submit_review",
                  arguments: `result ${requests.length}`,
                },
              ],
            };
          },
        },
      },
      request: {
        model: "gpt-6-luna",
        reasoning: { effort: "high", mode: "standard", summary: "auto" },
        input: [{ role: "user", content: "review" }],
        tool_choice: { type: "function", name: "submit_review" },
      },
      debugRequest: true,
    });
  } finally {
    console.error = originalError;
  }
  expect(requests[0].reasoning).toEqual({ effort: "high", mode: "standard", summary: "auto" });
  expect(requests).toHaveLength(1);
  expect(debug.filter((line) => line.startsWith("---"))).toEqual([
    "--- REVIEW REQUEST ---",
    "--- REVIEW RESPONSE ---",
  ]);
});

test("reports usage for the single finding review response", async () => {
  let calls = 0;
  const session = await runProviderSession({
    client: {
      responses: {
        create: async () => {
          calls += 1;
          return {
            usage: { input_tokens: calls * 100, output_tokens: 10 },
            output: [
              { type: "function_call", name: "submit_review", arguments: `result ${calls}` },
            ],
          };
        },
      },
    },
    request: {
      model: "gpt-6-luna",
      input: [{ role: "user", content: "review" }],
      tool_choice: { type: "function", name: "submit_review" },
    },
    usage: true,
  });
  expect(calls).toBe(1);
  expect(session.output).toContain('"input_tokens":100');
  expect(session.output).not.toContain('"input_tokens":200');
});

test("keeps the single finding review response without phase labels", async () => {
  const result = '{"findings":{}}';
  const session = await runProviderSession({
    client: {
      responses: {
        create: async () => ({
          output: [{ type: "function_call", name: "submit_review", arguments: result }],
        }),
      },
    },
    request: { model: "gpt-6-luna", input: [], tool_choice: { name: "submit_review" } },
  });
  expect(session.output).toBe(result);
});

test("prints a supplied reasoning summary before the review result", async () => {
  const session = await runProviderSession({
    client: {
      responses: {
        create: async () => ({
          output: [
            { type: "reasoning", summary: [{ type: "summary_text", text: "Summary text." }] },
            { type: "function_call", name: "submit_review", arguments: '{"findings":{}}' },
          ],
        }),
      },
    },
    request: { model: "gpt-6-luna", input: [], tool_choice: { name: "submit_review" } },
  });
  expect(session.output).toBe('Reasoning summary:\nSummary text.\n\n{"findings":{}}');
});

test("adds request usage to single-request provider output", async () => {
  const session = await runProviderSession({
    client: {
      responses: {
        create: async () => ({ output_text: "ok", usage: { input_tokens: 1, output_tokens: 2 } }),
      },
    },
    request: { model: "gpt-6-luna", input: [], tools: [] },
    usage: true,
  });
  expect(session.output).toContain("ok\nRequest usage metadata:");
});
test("does not retry a failed finding review", async () => {
  let calls = 0;
  await expect(
    runProviderSession({
      client: {
        responses: {
          create: async () => {
            calls += 1;
            throw new Error("provider unavailable");
          },
        },
      },
      request: {
        model: "gpt-6-luna",
        input: [{ role: "user", content: "repository and review" }],
        tool_choice: { type: "function", name: "submit_review" },
      },
    }),
  ).rejects.toThrow("provider unavailable");
  expect(calls).toBe(1);
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

test("debugs the request and response for a single custom-prompt request", async () => {
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  try {
    await runProviderSession({
      client: { responses: { create: async () => ({ output_text: "answer" }) } },
      request: { model: "gpt-5.6-sol", input: [], tools: [] },
      plainText: "custom",
      debugRequest: true,
    });
  } finally {
    console.error = originalError;
  }
  expect(debug).toHaveLength(2);
  expect(debug[0]).toContain('"tools": []');
  expect(debug[1]).toContain("answer");
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
