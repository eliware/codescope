import { findingActionabilityPolicy } from "../../../../src/prompts/policy/evidence/finding-actionability.mjs";

test("filters covered concerns and avoids unsupported test or provider-shape findings", () => {
  expect(findingActionabilityPolicy).toContain("Fully covered concerns are invisible");
  expect(findingActionabilityPolicy).toContain("No issues found.");
  expect(findingActionabilityPolicy).toContain("Do not require integration tests");
  expect(findingActionabilityPolicy).toContain("provider-output shape as a CodeScope defect");
});
