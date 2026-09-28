import { sourceEvidencePolicy } from "./evidence/source-evidence.mjs";
import { sourceInspectionPolicy } from "./evidence/source-inspection.mjs";
import { documentationReviewPolicy } from "./evidence/documentation-review.mjs";
import { workflowEvidencePolicy } from "./evidence/workflow-evidence.mjs";
import { externalStateEvidencePolicy } from "./evidence/external-state.mjs";
import { missingEvidencePolicy } from "./evidence/missing-evidence.mjs";
import { jsonContextPolicy } from "./evidence/json-context.mjs";
import { findingActionabilityPolicy } from "./evidence/finding-actionability.mjs";
import { profileVerdictPolicy } from "./evidence/profile-verdict.mjs";
import { findingReportingPolicy } from "./evidence/finding-reporting.mjs";

export const evidencePolicy = [
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
].join(" ");
