import { sourceEvidencePolicy } from "../../../../src/prompts/policy/evidence/source-evidence.mjs";

test("defines source and inventory evidence limits", () => {
  expect(sourceEvidencePolicy).toContain("file-name list");
  expect(sourceEvidencePolicy).toContain("does not prove file contents");
});
