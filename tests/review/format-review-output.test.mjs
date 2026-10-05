import {
  formatInitialReviewOutput,
  formatReviewOutput,
} from "../../src/review/format-review-output.mjs";

test("places the detailed reasoning summary between initial and final results", () => {
  expect(formatReviewOutput("initial findings", "final findings", undefined, "summary text")).toBe(
    "Running initial review...\ninitial findings\nDetailed reasoning summary:\nsummary text\nRunning final review...\nfinal findings",
  );
});

test("labels the summary unavailable when the provider omitted it", () => {
  expect(formatInitialReviewOutput("initial findings")).toBe(
    "Running initial review...\ninitial findings\nDetailed reasoning summary:\n(unavailable)",
  );
});
