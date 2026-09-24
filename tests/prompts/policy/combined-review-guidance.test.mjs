import { combinedReviewGuidance } from "../../../src/prompts/policy/combined-review-guidance.mjs";

test("requires exhaustive findings grounded in supplied evidence", () => {
  expect(combinedReviewGuidance).toContain("enumerate every distinct actionable issue");
  expect(combinedReviewGuidance).toContain("If there are 100 issues, report all 100");
  expect(combinedReviewGuidance).toContain("CodeScope cannot run commands");
  expect(combinedReviewGuidance).toContain("Never emit a P2/P3 item");
});
