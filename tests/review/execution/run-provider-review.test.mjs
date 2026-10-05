import { runProviderSession } from "../../../src/review/execution/run-provider-review.mjs";

test("runs a provider session and preserves its response", async () => {
  await expect(
    runProviderSession({
      client: { responses: { create: async () => ({ output_text: "ok" }) } },
      request: { model: "gpt-5.6-sol", input: [] },
      signal: undefined,
    }),
  ).resolves.toMatchObject({ kind: "review", output: "ok" });
});

test("re-reviews findings and debugs only the final request and response", async () => {
  const firstOutput = '{"issues":{"security":[]}}';
  const finalOutput = '{"issues":{"security":[]},"verdict":"pass"}';
  const request = {
    model: "gpt-6-luna",
    input: [{ role: "user", content: [{ type: "input_text", text: "repository and review" }] }],
    tool_choice: { type: "function", name: "submit_review" },
  };
  const sentRequests = [];
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  try {
    const session = await runProviderSession({
      client: {
        responses: {
          create: async (sentRequest) => {
            sentRequests.push(sentRequest);
            return sentRequests.length === 1
              ? {
                  output: [
                    { type: "function_call", name: "submit_review", arguments: firstOutput },
                  ],
                }
              : {
                  output: [
                    { type: "function_call", name: "submit_review", arguments: finalOutput },
                  ],
                };
          },
        },
      },
      request,
      debugRequest: true,
    });
    expect(session.output).toBe(finalOutput);
  } finally {
    console.error = originalError;
  }
  expect(sentRequests).toEqual([request, request]);
  expect(sentRequests[0]).toBe(sentRequests[1]);
  expect(request.input.map(({ role }) => role)).toEqual(["user", "assistant", "user"]);
  expect(request.input[1].content).toBe(firstOutput);
  expect(debug).toHaveLength(2);
  expect(JSON.parse(debug[0]).input[1].content).toBe(firstOutput);
  expect(JSON.parse(debug[1]).output[0].arguments).toBe(finalOutput);
});

test("keeps the initial findings when the follow-up request fails", async () => {
  const firstOutput = '{"issues":{"security":[]}}';
  let calls = 0;
  const session = await runProviderSession({
    client: {
      responses: {
        create: async () => {
          calls += 1;
          if (calls === 1)
            return {
              output: [{ type: "function_call", name: "submit_review", arguments: firstOutput }],
            };
          throw new Error("follow-up unavailable");
        },
      },
    },
    request: {
      model: "gpt-6-luna",
      input: [{ role: "user", content: "repository and review" }],
      tool_choice: { type: "function", name: "submit_review" },
    },
  });
  expect(session.output).toBe(firstOutput);
  expect(session.providerResponse.output[0].arguments).toBe(firstOutput);
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
