import { findingActionabilityPolicy } from "../../../../src/prompts/policy/evidence/finding-actionability.mjs";

test("filters covered concerns and avoids unsupported test or provider-shape findings", () => {
  expect(findingActionabilityPolicy).toContain(
    "Do not report a concern that the supplied evidence already handles",
  );
  expect(findingActionabilityPolicy).toContain("Use one no-issues sentinel");
  expect(findingActionabilityPolicy).toContain("Do not require an integration test");
  expect(findingActionabilityPolicy).toContain("API response format as a CodeScope defect");
});
