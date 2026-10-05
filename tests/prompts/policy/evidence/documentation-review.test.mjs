import { documentationReviewPolicy } from "../../../../src/prompts/policy/evidence/documentation-review.mjs";

test("distinguishes materially misleading documentation from polish", () => {
  expect(documentationReviewPolicy).toContain("qualifying P1");
  expect(documentationReviewPolicy).toContain("remain P2/P3");
});

test("does not flag external-project claims based only on missing context", () => {
  expect(documentationReviewPolicy).toContain(
    "Claims about linked external projects are not findings just because the referenced project's code or authoritative docs are absent.",
  );
  expect(documentationReviewPolicy).toContain(
    "report them only when supplied evidence directly contradicts them or shows concrete impact in the reviewed repository.",
  );
  expect(documentationReviewPolicy).not.toContain("recommendation");
});
