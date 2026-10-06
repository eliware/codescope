const completenessTemplate = `Review the supplied repository as a release candidate. Use the supplied code, tests, specifications, documentation, inventory, and applicable Eliware Test conventions. Treat missing information as unknown; do not invent files, behavior, test results, or external state.

Report a finding only when the supplied evidence supports all of these:
1. Current behavior: identify the supplied code or artifact that causes the defect or contradicts the applicable requirement.
2. Contract: check relevant specifications, documentation, conventions, and tests. An existing test that directly exercises the claimed behavior may disprove the finding. Passing tests do not disprove behavior they do not cover.
3. Concrete impact: explain what fails or is materially affected in supported usage, or describe a reachable code path that causes that impact. A failing test or runtime reproduction is not required when the supplied evidence establishes the causal path.

The claim, cited cause, contract, and impact must agree. If only part of a claim is supported, report only that narrower defect and remove unsupported details. Do not include a finding that also says its own claim is harmless, already handled, or correct.

Omit hypothetical risks without a supported causal path, behavior explicitly outside the documented contract, behavior that supplied tests establish is correct under the applicable contract, documented intentional behavior, duplicate observations, preferences without a demonstrated defect, and missing tests unless a specific consequential contract gap remains. Do not propose new features. Do not require evidence that CodeScope cannot obtain from the supplied request.

Report every distinct finding that meets this standard; do not stop after one finding in a category, return a sample, or invent findings to fill categories. Report shared Eliware Test requirement violations in the conventions category; place implementation defects in their relevant categories. {{FINDING_SCOPE}}

Use P0 for an active emergency, a usable secret in supplied evidence, or a supplied test failure. Treat a redaction marker as evidence of a usable secret; identify its path. Ciphertext alone is not a usable secret. Use P1 only for a proven required-scope release blocker that cannot reasonably wait. Use P2 for actionable non-blockers and P3 for polish. Only unresolved P0/P1 findings block. Do not infer CI, release, registry, or other external results. Do not treat provider response content or shape as a CodeScope defect. Do not list known issues as new findings, but let unresolved P0/P1 known issues block.

Return the complete review using submit_unified_review. Each finding must contain severity, location, and one concise description of the defect with its supplied evidence and concrete impact. Keep each finding to one independently checkable defect. Return every category required by the schema. When a category has no findings, return exactly one sentinel with severity "none", location "none", and finding "No issues found." Set verdict to block only for unresolved P0/P1 findings.`;

export function combinedCompletenessGuidance(releaseGate) {
  const findingScope = releaseGate
    ? "For release review, include only unresolved P0/P1 blockers; use the no-issues sentinel in every other category."
    : "For all review, report every distinct actionable P0-P3 finding; P2/P3 findings do not block. This comprehensive all review is the release iteration gate: report actionable non-blocking findings too, so owners can resolve them before the next run.";
  return completenessTemplate.replace("{{FINDING_SCOPE}}", findingScope);
}
