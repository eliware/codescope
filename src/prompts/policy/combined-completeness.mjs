import { combinedEvidencePolicy } from "./combined-evidence-policy.mjs";

export function combinedCompletenessGuidance(releaseGate) {
  const issueScope = releaseGate
    ? "For release review, report only unresolved P0 or P1 blockers. Use the no-issues sentinel in every other category."
    : "For all review, report every proven P0-P3 issue. P2 and P3 do not block. This review supports the release gate. Report issues that the owner can fix before the next review.";
  return combinedEvidencePolicy.replace("{{ISSUE_SCOPE}}", issueScope);
}
