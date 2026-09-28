import { evidencePolicy } from "../../../src/prompts/policy/evidence.mjs";
import { sourceEvidencePolicy } from "../../../src/prompts/policy/evidence/source-evidence.mjs";
import { sourceInspectionPolicy } from "../../../src/prompts/policy/evidence/source-inspection.mjs";
import { documentationReviewPolicy } from "../../../src/prompts/policy/evidence/documentation-review.mjs";
import { workflowEvidencePolicy } from "../../../src/prompts/policy/evidence/workflow-evidence.mjs";
import { externalStateEvidencePolicy } from "../../../src/prompts/policy/evidence/external-state.mjs";
import { missingEvidencePolicy } from "../../../src/prompts/policy/evidence/missing-evidence.mjs";
import { jsonContextPolicy } from "../../../src/prompts/policy/evidence/json-context.mjs";
import { findingActionabilityPolicy } from "../../../src/prompts/policy/evidence/finding-actionability.mjs";
import { profileVerdictPolicy } from "../../../src/prompts/policy/evidence/profile-verdict.mjs";
import { findingReportingPolicy } from "../../../src/prompts/policy/evidence/finding-reporting.mjs";

test("assembles each topic policy once in its declared order", () => {
  expect(evidencePolicy).toBe(
    [
      sourceEvidencePolicy,
      sourceInspectionPolicy,
      documentationReviewPolicy,
      workflowEvidencePolicy,
      externalStateEvidencePolicy,
      missingEvidencePolicy,
      jsonContextPolicy,
      findingActionabilityPolicy,
      profileVerdictPolicy,
      findingReportingPolicy,
    ].join(" "),
  );
});
