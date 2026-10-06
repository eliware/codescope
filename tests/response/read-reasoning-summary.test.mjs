import { readReasoningSummary } from "../../src/response/read-reasoning-summary.mjs";

test("reads text from reasoning summary parts", () => {
  const response = {
    output: [
      {
        type: "reasoning",
        summary: [
          { type: "summary_text", text: "Check the code." },
          { type: "summary_text", text: "Compare the contract." },
        ],
      },
      { type: "function_call", arguments: "{}" },
    ],
  };
  expect(readReasoningSummary(response)).toBe("Check the code.\nCompare the contract.");
});

test("returns undefined when no reasoning summary text exists", () => {
  expect(readReasoningSummary(undefined)).toBeUndefined();
  expect(readReasoningSummary({})).toBeUndefined();
  expect(readReasoningSummary({ output: [{ type: "reasoning", summary: [] }] })).toBeUndefined();
  expect(
    readReasoningSummary({
      output: [
        {
          type: "reasoning",
          summary: [
            { type: "other", text: "skip" },
            { type: "summary_text", text: 3 },
            { type: "summary_text", text: "  " },
          ],
        },
      ],
    }),
  ).toBeUndefined();
  expect(
    readReasoningSummary({ output: [{ type: "reasoning_text", text: "private" }] }),
  ).toBeUndefined();
  expect(readReasoningSummary({ output: [] })).toBeUndefined();
});
