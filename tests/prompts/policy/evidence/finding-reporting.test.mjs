import { findingReportingPolicy } from "../../../../src/prompts/policy/evidence/finding-reporting.mjs";

test("requires concise wording without suppressing supported findings", () => {
  expect(findingReportingPolicy).toContain("must never reduce the number");
  expect(findingReportingPolicy).toContain("Report every distinct actionable issue");
  expect(findingReportingPolicy).toContain("never return a representative sample");
});
