import { workflowEvidencePolicy } from "../../../../src/prompts/policy/evidence/workflow-evidence.mjs";

test("limits workflow review to supplied configuration and actual run evidence", () => {
  expect(workflowEvidencePolicy).toContain("missing CI workflow evidence");
  expect(workflowEvidencePolicy).toContain("unless an actual CI result is supplied");
});
