import { requestProviderResponse } from "../../../src/review/provider/request.mjs";

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

test("preserves non-text input content", async () => {
  const request = {
    input: [{ role: "user", content: [{ type: "input_image", image_url: "image" }] }],
  };
  let received;

  await requestProviderResponse(
    { responses: { create: async (sentRequest) => ((received = sentRequest), {}) } },
    request,
  );

  expect(received).toBe(request);
});

test("prints the complete request to stderr before sending when debugging is enabled", async () => {
  const request = {
    model: "gpt-6-luna",
    input: [
      { role: "developer", content: [{ type: "input_text", text: "review rules" }] },
      { role: "user", content: [{ type: "input_text", text: "repository and review task" }] },
    ],
  };
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

test("streams debug requests and captures reasoning deltas and request IDs", async () => {
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  const response = { id: "resp_1", output: [] };
  const client = {
    responses: {
      createWithEvents: async (request, handlers) => {
        expect(request.stream).toBe(true);
        expect(handlers.signal).toBe("signal");
        handlers.onEvent({
          type: "response.reasoning_summary_text.delta",
          delta: "Checked the request.",
          responseId: "resp_1",
          requestId: "req_1",
        });
        handlers.onEvent({
          type: "response.created",
          responseId: "resp_1",
          requestId: "req_1",
        });
        handlers.onCompleted(response);
      },
    },
  };
  try {
    await expect(
      requestProviderResponse(client, { model: "gpt-6-luna" }, "signal", true),
    ).resolves.toBe(response);
  } finally {
    console.error = originalError;
  }
  expect(debug[0]).toContain('"stream": true');
  expect(debug[1]).toBe("--- RESPONSE EVENTS ---");
  expect(debug[2]).toContain("Checked the request.");
  expect(debug[2]).toContain("req_1");
  expect(debug[2]).toContain("response.created");
});

test("rejects a debug event stream without a completed response", async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    await expect(
      requestProviderResponse(
        { responses: { createWithEvents: async () => {} } },
        {},
        undefined,
        true,
      ),
    ).rejects.toThrow("OpenAI event stream returned no completed response");
  } finally {
    console.error = originalError;
  }
});

test("preserves provider details from a failed debug event", async () => {
  const response = { id: "resp_2", status: "failed" };
  const client = {
    responses: {
      createWithEvents: async (_request, handlers) => {
        handlers.onEvent({
          type: "response.failed",
          response,
          requestId: "req_2",
          error: { code: "server_error", status: 500, type: "server_error" },
        });
      },
    },
  };
  const originalError = console.error;
  console.error = () => {};
  try {
    await expect(requestProviderResponse(client, {}, undefined, true)).rejects.toMatchObject({
      name: "ResponsesError",
      code: "server_error",
      status: 500,
      type: "server_error",
      requestId: "req_2",
      providerResponse: response,
    });
  } finally {
    console.error = originalError;
  }
});
