import { externalStateEvidencePolicy } from "../../../../src/prompts/policy/evidence/external-state.mjs";

test("excludes unsupplied external command and system state", () => {
  expect(externalStateEvidencePolicy).toContain("Do not infer npm pack");
  expect(externalStateEvidencePolicy).toContain("registry state");
});
