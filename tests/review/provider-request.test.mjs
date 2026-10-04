import { requestProviderResponse } from "../../src/review/provider-request.mjs";

test("passes the prepared request to Responses", async () => {
  let received;
  const response = { output: [] };
  const client = {
    responses: {
      create: async (...args) => {
        received = args;
        return response;
      },
    },
  };
  await expect(
    requestProviderResponse(
      client,
      {
        model: "gpt-5.6-luna",
        input: ["input"],
        tool_choice: "auto",
        tools: ["tool"],
        reasoning: { effort: "low" },
        usage: { include: true },
        store: false,
        include: ["item"],
        service_tier: "default",
        prompt_cache_options: { retention: "24h" },
      },
      "signal",
    ),
  ).resolves.toBe(response);
  expect(received[0]).toMatchObject({
    model: "gpt-5.6-luna",
    input: ["input"],
    tool_choice: "auto",
    tools: ["tool"],
    reasoning: { effort: "low" },
    usage: { include: true },
    store: false,
    include: ["item"],
    service_tier: "default",
    prompt_cache_options: { retention: "24h" },
  });
  expect(received[1]).toEqual({ signal: "signal" });
});

test("prints the complete request to stderr before sending when debugging is enabled", async () => {
  const request = { model: "gpt-6-luna", input: [{ role: "user", content: "evidence" }] };
  const events = [];
  const originalError = console.error;
  console.error = (value) => events.push(["debug", value]);
  try {
    await requestProviderResponse(
      {
        responses: {
          create: async (sentRequest) => {
            events.push(["request", sentRequest]);
            return { output: [] };
          },
        },
      },
      request,
      undefined,
      true,
    );
  } finally {
    console.error = originalError;
  }
  expect(events).toEqual([
    ["debug", JSON.stringify(request, null, 2)],
    ["request", request],
  ]);
});
