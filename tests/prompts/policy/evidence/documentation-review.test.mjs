import { documentationReviewPolicy } from "../../../../src/prompts/policy/evidence/documentation-review.mjs";

test("distinguishes materially misleading documentation from polish", () => {
  expect(documentationReviewPolicy).toContain("qualifying P1");
  expect(documentationReviewPolicy).toContain("remain P2/P3");
});
