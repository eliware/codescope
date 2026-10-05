import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("asks for a concise double-check of the prior review", () => {
  expect(createReviewFollowUpInstructions()).toBe(
    "Double-check the preceding review.\nFor each issue, classify it as real, partially real, or false-positive.\nOmit any false-positives.\nCorrect partially real issues.\nReturn only real issues.",
  );
});
