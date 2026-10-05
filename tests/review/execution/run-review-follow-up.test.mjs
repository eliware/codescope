import { runReviewFollowUp } from "../../../src/review/execution/run-review-follow-up.mjs";

function request() {
  return {
    input: [{ role: "user", content: [{ type: "input_text", text: "repository" }] }],
    tool_choice: { type: "function", name: "submit_review" },
  };
}

test("returns the follow-up tool output and logs its request and response", async () => {
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  const followUpResponse = {
    output: [{ type: "function_call", name: "submit_review", arguments: "final" }],
  };
  const sent = request();
  try {
    const result = await runReviewFollowUp({
      client: { responses: { create: async () => followUpResponse } },
      request: sent,
      firstOutput: "initial",
      debugRequest: true,
    });
    expect(result).toEqual({ output: "final", providerResponse: followUpResponse });
  } finally {
    console.error = originalError;
  }
  expect(debug).toHaveLength(2);
  expect(debug[0]).toContain('"assistant"');
  expect(debug[1]).toContain("final");
});

test("falls back to initial output when the follow-up request fails", async () => {
  await expect(
    runReviewFollowUp({
      client: { responses: { create: async () => Promise.reject(new Error("server failed")) } },
      request: request(),
      firstOutput: "initial",
    }),
  ).resolves.toEqual({ output: "initial" });
});

test("falls back when the follow-up response lacks the required tool call", async () => {
  const debug = [];
  const originalError = console.error;
  console.error = (value) => debug.push(value);
  try {
    await expect(
      runReviewFollowUp({
        client: { responses: { create: async () => ({ output: [] }) } },
        request: request(),
        firstOutput: "initial",
        debugRequest: true,
      }),
    ).resolves.toEqual({ output: "initial" });
  } finally {
    console.error = originalError;
  }
  expect(debug).toHaveLength(2);
});

test.each(["SIGINT", "SIGTERM"])("preserves %s during a failed follow-up", async (code) => {
  const reason = Object.assign(new Error(`Received ${code}`), { code });
  await expect(
    runReviewFollowUp({
      client: { responses: { create: async () => Promise.reject(new Error("aborted")) } },
      request: request(),
      firstOutput: "initial",
      signal: { reason },
    }),
  ).rejects.toThrow("aborted");
});
