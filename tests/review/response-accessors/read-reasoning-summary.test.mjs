import { readReasoningSummary } from "../../../src/review/response-accessors/read-reasoning-summary.mjs";

test("returns only supplied reasoning summary text", () => {
  expect(
    readReasoningSummary({
      output: [
        { type: "reasoning", summary: [{ type: "summary_text", text: "First check." }] },
        { type: "reasoning", content: [{ type: "reasoning_text", text: "private" }] },
        { type: "reasoning", summary: [{ type: "summary_text", text: "Second check." }] },
      ],
    }),
  ).toBe("First check.\n\nSecond check.");
});

test("returns undefined when no usable summary is present", () => {
  expect(readReasoningSummary({})).toBeUndefined();
  expect(readReasoningSummary({ output: [{ type: "message" }] })).toBeUndefined();
  expect(
    readReasoningSummary({
      output: [{ type: "reasoning", summary: [{ type: "reasoning_text", text: "hidden" }] }],
    }),
  ).toBeUndefined();
  expect(readReasoningSummary({ output: "invalid" })).toBeUndefined();
});

test("handles unreadable reasoning output without failing review output", () => {
  const response = Object.defineProperty({}, "output", {
    get: () => {
      throw new Error("output unavailable");
    },
  });
  expect(readReasoningSummary(response)).toBeUndefined();
});
