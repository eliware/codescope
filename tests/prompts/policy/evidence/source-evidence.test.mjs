import { sourceEvidencePolicy } from "../../../../src/prompts/policy/evidence/source-evidence.mjs";

test("defines source and inventory evidence limits", () => {
  expect(sourceEvidencePolicy).toContain("names-only file inventory");
  expect(sourceEvidencePolicy).toContain("never proves file contents");
});
