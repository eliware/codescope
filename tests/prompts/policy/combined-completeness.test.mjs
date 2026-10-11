import { combinedCompletenessGuidance } from "../../../src/prompts/policy/combined-completeness.mjs";

test("uses ordinary completeness and priority guidance by default", () => {
  const guidance = combinedCompletenessGuidance(false);
  expect(guidance).not.toContain("Call submit_unified_review");
  expect(guidance).toContain("report every proven P0-P3 issue");
  expect(guidance).not.toContain("{{ISSUE_SCOPE}}");
  expect(guidance).toContain("P2 and P3 do not block");
  expect(guidance).toContain("supports the release gate");
});

test("uses release-gate guidance when requested", () => {
  const guidance = combinedCompletenessGuidance(true);
  expect(guidance).toContain("report only unresolved P0 or P1 blockers");
  expect(guidance).toContain("Use the no-issues sentinel in every other category");
});
