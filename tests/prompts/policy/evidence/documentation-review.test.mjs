import { documentationReviewPolicy } from "../../../../src/prompts/policy/evidence/documentation-review.mjs";

test("distinguishes materially misleading documentation from polish", () => {
  expect(documentationReviewPolicy).toContain("Use P1 and block the verdict");
  expect(documentationReviewPolicy).toContain("Use P2 or P3 for small errors");
});

test("does not flag external-project claims based only on missing context", () => {
  expect(documentationReviewPolicy).toContain(
    "Do not report a claim about an external project just because its code or official docs are not supplied.",
  );
  expect(documentationReviewPolicy).toContain(
    "Report it only when supplied evidence disproves it or shows a concrete effect in this repository.",
  );
  expect(documentationReviewPolicy).not.toContain("recommendation");
});
