import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("asks for a concise double-check of the prior review", () => {
  expect(createReviewFollowUpInstructions()).toBe(
    "Double-check the preceding review. Correct or remove inaccurate findings, retain valid findings, and return the complete final review using the required tool and schema. Do not add new findings.",
  );
});
