import { combinedCompletenessGuidance } from "../../../src/prompts/policy/combined-completeness.mjs";

test("uses ordinary completeness and priority guidance by default", () => {
  const guidance = combinedCompletenessGuidance(false);
  expect(guidance).not.toContain("Call submit_unified_review");
  expect(guidance).toContain("report every distinct actionable P0-P3 finding");
  expect(guidance).toContain("steps start with Because");
  expect(guidance).not.toContain("{{FINDING_SCOPE}}");
});

test("uses release-gate guidance when requested", () => {
  expect(combinedCompletenessGuidance(true)).toContain("report only unresolved P0/P1 blockers");
});
