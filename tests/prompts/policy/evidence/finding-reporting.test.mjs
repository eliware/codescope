import { findingReportingPolicy } from "../../../../src/prompts/policy/evidence/finding-reporting.mjs";

test("requires concise wording without suppressing supported findings", () => {
  expect(findingReportingPolicy).toContain("must not reduce the number of findings");
  expect(findingReportingPolicy).toContain("Report every separate issue");
  expect(findingReportingPolicy).toContain("Do not return a sample");
});
