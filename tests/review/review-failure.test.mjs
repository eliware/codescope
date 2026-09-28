import { throwSessionFailure } from "../../src/review/review-failure.mjs";

test("writes partial-response fallback before throwing the provider failure", async () => {
  const writes = [];
  await expect(
    throwSessionFailure({
      cause: new Error("invalid response"),
      providerResponse: { output_text: "partial" },
      providerResponseReceived: true,
      write: async (value) => {
        writes.push(value);
        return { written: value.length };
      },
    }),
  ).rejects.toMatchObject({
    result: { issues: "not submitted", response: { output_text: "partial" } },
  });
  expect(JSON.parse(writes[0])).toMatchObject({ issues: "not submitted" });
});

test("still throws the original failure if fallback serialization is unsafe", async () => {
  const cause = {
    [Symbol.toPrimitive]: () => {
      throw new Error("hostile");
    },
  };
  await expect(
    throwSessionFailure({
      cause,
      providerResponseReceived: true,
      providerResponse: { output_text: "partial" },
      write: async (value) => ({ written: value.length }),
    }),
  ).rejects.toMatchObject({ message: "OpenAI request failed: failure details unavailable" });
});

test("attaches fallback-write failure to the provider error", async () => {
  const fallbackError = new Error("fallback write failed");
  await expect(
    throwSessionFailure({
      cause: Object.assign(new Error("request failed"), { code: "API" }),
      providerResponseReceived: false,
      write: async () => {
        throw fallbackError;
      },
    }),
  ).rejects.toMatchObject({ code: "API", fallbackError });
});
