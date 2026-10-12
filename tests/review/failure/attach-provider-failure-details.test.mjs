import { attachProviderFailureDetails } from "../../../src/review/failure/attach-provider-failure-details.mjs";
import { ResponsesError } from "@eliware/openai";

test("attaches provider code, fallback result, and fallback-write error", () => {
  const failure = new Error("request failed");
  const result = { issues: "not submitted" };
  const fallbackError = new Error("write failed");

  expect(
    attachProviderFailureDetails(failure, {
      cause: { code: "API" },
      result,
      fallbackError,
    }),
  ).toMatchObject({ code: "API", result, fallbackError });
});

test("omits absent provider and fallback-write metadata", () => {
  const failure = new Error("request failed");
  const result = {};
  expect(attachProviderFailureDetails(failure, { cause: {}, result })).toBe(failure);
  expect(failure.result).toBe(result);
  expect(failure).not.toHaveProperty("code");
  expect(failure).not.toHaveProperty("fallbackError");
});

test("copies normalized provider error details", () => {
  const failure = new Error("request failed");
  const cause = new ResponsesError("provider failed", {
    event: {
      type: "error",
      request_id: "req_1",
      error: {
        code: "invalid_request",
        type: "invalid_request_error",
        status: 400,
        param: "model",
      },
    },
  });

  expect(attachProviderFailureDetails(failure, { cause, result: {} })).toMatchObject({
    code: "invalid_request",
    type: "invalid_request_error",
    status: 400,
    parameter: "model",
    requestId: "req_1",
  });
});
