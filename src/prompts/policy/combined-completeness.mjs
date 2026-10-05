const completenessTemplate = `Review the supplied repository context for distinct, actionable findings in every category. The Eliware Test convention files named in the supplied repository context are the applicable shared rules. Treat missing information as unknown; do not invent files, behavior, test results, or external state. {{FINDING_SCOPE}}

Use P0 for an active emergency, a usable secret in supplied evidence, or a supplied test failure. Treat a redaction marker as evidence of a usable secret; identify its path. Ciphertext alone is not a usable secret. Use P1 only for a proven required-scope release blocker that cannot reasonably wait. Use P2 for actionable non-blockers and P3 for polish. Only unresolved P0/P1 findings block. Assume tests pass unless supplied output proves a test ran and failed. Do not infer CI, release, registry, or other external results. Do not treat provider response content or shape as a CodeScope defect. Do not list known issues as new findings, but let unresolved P0/P1 known issues block.

Report shared Eliware Test requirement violations in the conventions category. Keep implementation defects in their relevant functional categories. Return every category required by the schema. Use exactly one sentinel when a category has no finding: severity none, location none, finding No issues found.`;

export function combinedCompletenessGuidance(releaseGate) {
  const findingScope = releaseGate
    ? "For release review, report only unresolved P0/P1 blockers; use a sentinel in every other category."
    : "For all review, report every distinct actionable P0-P3 finding; P2/P3 findings do not block.";
  return completenessTemplate.replace("{{FINDING_SCOPE}}", findingScope);
}
