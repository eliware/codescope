import { combinedCompletenessGuidance } from "../../../src/prompts/policy/combined-completeness.mjs";

test("uses ordinary completeness and priority guidance by default", () => {
  const guidance = combinedCompletenessGuidance(false);
  expect(guidance).not.toContain("Call submit_unified_review");
  expect(guidance).toContain("report every distinct actionable P0-P3 finding");
  expect(guidance).toContain("conventions category");
  expect(guidance).not.toContain("rationale");
  expect(guidance).not.toContain("{{FINDING_SCOPE}}");
  expect(guidance).toContain(
    "Report a finding only when the supplied evidence supports all of these",
  );
  expect(guidance).toContain("Current behavior:");
  expect(guidance).toContain("Contract:");
  expect(guidance).toContain("Concrete impact:");
  expect(guidance).toContain("A failing test or runtime reproduction is not required");
  expect(guidance).toContain("Do not include a finding that also says its own claim is harmless");
  expect(guidance).toContain("exactly one sentinel");
  expect(guidance).toContain("P2/P3 findings do not block");
  expect(guidance).toContain("release iteration gate");
});

test("uses release-gate guidance when requested", () => {
  const guidance = combinedCompletenessGuidance(true);
  expect(guidance).toContain("include only unresolved P0/P1 blockers");
  expect(guidance).toContain("use the no-issues sentinel in every other category");
});
