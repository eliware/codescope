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
    reasoning: { effort: "none", summary: null },
    input: [
      { role: "developer", content: [{ type: "input_text", text: "conventions" }] },
      { role: "user", content: [{ type: "input_text", text: "repository and review" }] },
    ],
    tool_choice: { type: "function", name: "submit_review" },
  };
  const sentRequests = [];
  const requestSnapshots = [];
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  try {
    const session = await runProviderSession({
      client: {
        responses: {
          create: async (sentRequest) => {
            sentRequests.push(sentRequest);
            requestSnapshots.push(structuredClone(sentRequest));
            return sentRequests.length === 1
              ? {
                  output: [
                    {
                      type: "reasoning",
                      summary: [{ type: "summary_text", text: "The claims need separate checks." }],
                    },
                    { type: "function_call", name: "submit_review", arguments: firstOutput },
                  ],
                }
              : {
                  output: [
                    {
                      type: "reasoning",
                      summary: [{ type: "summary_text", text: "Final claims checked." }],
                    },
                    { type: "function_call", name: "submit_review", arguments: finalOutput },
                  ],
                };
          },
        },
      },
      request,
      debugRequest: true,
    });
    expect(session.output).toBe(
      `Running initial review...\n${firstOutput}\nDetailed reasoning summary:\nFinal claims checked.\nRunning final review...\n${finalOutput}`,
    );
  } finally {
    console.error = originalError;
  }
  expect(sentRequests[0]).toBe(sentRequests[1]);
  expect(
    request.input
      .filter(({ role }) => role)
      .map(({ role }) => role)
      .join(","),
  ).toBe("developer,user,assistant,user");
  expect(request.input[2]).toEqual({ role: "assistant", content: firstOutput });
  expect(request.input[3].type).toBe("configuration_update");
  expect(request.input[3].reasoning.effort).toBe("medium");
  expect(request.input[4].content[0].text).toContain("Independently check every finding");
  expect(requestSnapshots[0].input).toEqual(requestSnapshots[1].input.slice(0, 2));
  expect(requestSnapshots[0].reasoning).toEqual({ effort: "none", summary: null });
  expect(requestSnapshots[1].reasoning).toEqual({ effort: "none", summary: "detailed" });
  expect(debug).toHaveLength(2);
  expect(JSON.parse(debug[0]).input).toHaveLength(5);
  expect(JSON.parse(debug[1]).output[1].arguments).toBe(finalOutput);
});
test("passes both responses to usage output for finding reviews", async () => {
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
  expect(session.output).toContain('"input_tokens":100');
  expect(session.output).toContain('"input_tokens":200');
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
  expect(session.output).toBe(
    `Running initial review...\n${firstOutput}\nDetailed reasoning summary:\n(unavailable)`,
  );
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
