const completenessTemplate = `Review the supplied repository for this release. Use the supplied code, tests, specifications, docs, file inventory, and Eliware Test conventions. Treat missing information as unknown. Do not invent files, behavior, test results, or outside facts.

Report an issue only when the supplied evidence supports every point:
1. Name the current behavior. Name the code or file that causes it.
2. Name the rule or supported use that it breaks. Check related code, tests, specifications, and docs. A test can disprove a claim when it checks the same behavior. A passing test does not prove behavior that it does not check.
3. State the effect in supported use. Give a code path that can cause this effect. A test run is not required when the supplied code proves the path.

Make the claim, cause, rule, and effect agree. If only part of a claim is true, report only that part. Do not report a claim that says the behavior is safe, correct, or already handled.

Do not report a theory without a code path. Do not report behavior that the docs allow or the tests prove correct. Do not report a preference, duplicate issue, or missing test alone. Do not suggest new features. Do not ask for evidence that this request cannot supply.

Review all supplied evidence before you form the result. Inspect every supplied implementation file and its related tests. Trace relevant behavior through its callers, callees, and data flow. Check every review category against the supplied code, tests, specifications, docs, and conventions.

Build a candidate list during the review. Check each candidate against the evidence rules above. Continue after the first valid finding. Report every independent issue that passes those rules. Do not stop when you have enough findings for a verdict. Combine only findings that describe the same defect and effect. Do not omit a supported issue because its category already has another finding. Do not lower the evidence standard to increase the finding count. Do not return a sample or add issues to fill a category.

Put shared Eliware Test issues in conventions. Put code defects in the matching category. {{FINDING_SCOPE}}

Use P0 for an active emergency, a usable secret in supplied evidence, or a supplied test failure. A redaction marker shows that usable secret data was present. Name its file. Ciphertext alone is not a usable secret. Use P1 only for a proven release blocker that cannot wait. Use P2 for a real issue that does not block release. Use P3 for low-risk polish. Only P0 and P1 block. Do not infer CI, release, registry, or other outside results. Do not report provider response content or format as a CodeScope defect. Do not report a known issue as new. Keep the block verdict for an unresolved P0 or P1 known issue.

Return the full review with submit_unified_review. Check each candidate before you call the tool. The tool call is the final result. Do not use it to describe rejected candidates. Each finding must state one defect, its evidence, and its effect. Do not include a doubt, counterexample, correction, or statement that no defect exists in a finding. Omit a claim that fails any rule above. Return every category in the schema. For an empty category, return one sentinel: severity "none", location "none", finding "No issues found." If no issues remain, use sentinels in all categories and set verdict to "pass". Set verdict to "block" only for unresolved P0 or P1 findings.`;

export function combinedCompletenessGuidance(releaseGate) {
  const findingScope = releaseGate
    ? "For release review, report only unresolved P0 or P1 blockers. Use the no-issues sentinel in every other category."
    : "For all review, report every proven P0-P3 issue. P2 and P3 do not block. This review supports the release gate. Report issues that the owner can fix before the next review.";
  return completenessTemplate.replace("{{FINDING_SCOPE}}", findingScope);
}
