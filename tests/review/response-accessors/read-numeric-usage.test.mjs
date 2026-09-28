import { readNumericUsage } from "../../../src/review/response-accessors/read-numeric-usage.mjs";

test("preserves valid usage counters and marks malformed fields", () => {
  expect(readNumericUsage({ usage: { input_tokens: 2, output_tokens: -1, note: "bad" } })).toEqual({
    input_tokens: 2,
    invalid_fields: true,
  });
});

test("preserves non-negative integer counters above the safe-integer range", () => {
  const largeCount = Number.MAX_SAFE_INTEGER + 1;
  expect(readNumericUsage({ usage: { input_tokens: largeCount } })).toEqual({
    input_tokens: largeCount,
  });
});

test("reads a stateful usage getter only once", () => {
  let reads = 0;
  const response = {
    get usage() {
      reads += 1;
      if (reads > 1) throw new Error("read twice");
      return { input_tokens: 3 };
    },
  };
  expect(readNumericUsage(response)).toEqual({ input_tokens: 3 });
  expect(reads).toBe(1);
});

test("returns absent for missing, invalid, or unreadable usage", () => {
  expect(readNumericUsage({})).toBeUndefined();
  expect(readNumericUsage(null)).toBeUndefined();
  expect(readNumericUsage({ usage: "invalid" })).toBeUndefined();
  const response = Object.defineProperty({}, "usage", {
    get: () => {
      throw new Error("bad");
    },
  });
  expect(readNumericUsage(response)).toBeUndefined();
});
