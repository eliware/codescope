import { combinedCompletenessGuidance } from "../../../src/prompts/policy/combined-completeness.mjs";

test("uses ordinary completeness and priority guidance by default", () => {
  const guidance = combinedCompletenessGuidance(false);
  expect(guidance).not.toContain("Call submit_unified_review");
  expect(guidance).toContain("report every distinct actionable P0-P3 finding");
  expect(guidance).toContain("conventions category");
  expect(guidance).not.toContain("rationale");
  expect(guidance).not.toContain("{{FINDING_SCOPE}}");
  expect(guidance).toContain("severity, location, concise issue");
  expect(guidance).toContain("use an empty array");
  expect(guidance).toContain("passing tests do not by themselves disprove");
});

test("uses release-gate guidance when requested", () => {
  const guidance = combinedCompletenessGuidance(true);
  expect(guidance).toContain("report only unresolved P0/P1 blockers");
  expect(guidance).toContain("use an empty array in every other category");
});
