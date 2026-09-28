import { attachProviderFailureDetails } from "../../../src/review/failure/attach-provider-failure-details.mjs";

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
