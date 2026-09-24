import { combinedCompletenessGuidance } from "../../../src/prompts/policy/combined-completeness.mjs";

test("uses ordinary completeness and priority guidance by default", () => {
  const guidance = combinedCompletenessGuidance(false);
  expect(guidance).toContain("call exactly one submit_unified_review tool");
  expect(guidance).toContain("P2 and P3 findings must be reported but must not block.");
  expect(guidance).toContain("rationale is an ordered array");
  expect(guidance).not.toContain("{{RELEASE_GATE_RULE}}");
});

test("uses release-gate guidance when requested", () => {
  expect(combinedCompletenessGuidance(true)).toContain(
    "report only unresolved P0 and qualifying P1 blockers",
  );
});
