import { attachProviderFailureDetails } from "../../../src/review/failure/attach-provider-failure-details.mjs";
import { ResponsesError } from "@eliware/openai";

test("attaches provider error details", () => {
  const failure = new Error("request failed");

  expect(
    attachProviderFailureDetails(failure, {
      cause: { code: "API" },
    }),
  ).toMatchObject({ code: "API" });
});

test("omits absent provider metadata", () => {
  const failure = new Error("request failed");
  expect(attachProviderFailureDetails(failure, { cause: {} })).toBe(failure);
  expect(failure).not.toHaveProperty("code");
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

  expect(attachProviderFailureDetails(failure, { cause })).toMatchObject({
    code: "invalid_request",
    type: "invalid_request_error",
    status: 400,
    parameter: "model",
    requestId: "req_1",
  });
});
