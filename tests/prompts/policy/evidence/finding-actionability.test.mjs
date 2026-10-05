import { findingActionabilityPolicy } from "../../../../src/prompts/policy/evidence/finding-actionability.mjs";

test("filters covered concerns and avoids unsupported test or provider-shape findings", () => {
  expect(findingActionabilityPolicy).toContain("Do not emit fully covered concerns as findings");
  expect(findingActionabilityPolicy).toContain("re-review assessment ledger");
  expect(findingActionabilityPolicy).toContain("empty arrays for review categories");
  expect(findingActionabilityPolicy).toContain("Do not require integration tests");
  expect(findingActionabilityPolicy).toContain("provider-output shape as a CodeScope defect");
});
