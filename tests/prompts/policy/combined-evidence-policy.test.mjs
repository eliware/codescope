import { combinedEvidencePolicy } from "../../../src/prompts/policy/combined-evidence-policy.mjs";

test("defines invariant evidence and issue guidance for combined reviews", () => {
  expect(combinedEvidencePolicy).toContain(
    "Report an issue only when the supplied evidence supports every point",
  );
  expect(combinedEvidencePolicy).toContain("Name the current behavior");
  expect(combinedEvidencePolicy).toContain("Name the rule or supported use that it breaks");
  expect(combinedEvidencePolicy).toContain("State the effect in supported use");
  expect(combinedEvidencePolicy).toContain("Do not report a theory without a code path");
  expect(combinedEvidencePolicy).toContain("Put shared Eliware Test issues in conventions");
  expect(combinedEvidencePolicy).toContain("one sentinel");
  expect(combinedEvidencePolicy).toContain("{{ISSUE_SCOPE}}");
  expect(combinedEvidencePolicy).not.toContain("rationale");
});
