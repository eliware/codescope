export function createAllPrompt(profilePrompt) {
  return profilePrompt(
    `Completeness is the main goal.
Review all supplied code, tests, docs, conventions, and other evidence.
Find every distinct actionable issue. Do not give a sample.
Do not stop after the first issue in a category.
Let the evidence set the number of issues. Do not limit the count by schema minimums, token use, or short output.
If the evidence supports 100 issues, report all 100.
Report each issue on its own, even if many issues are in one file.
Check supplied package metadata, examples, specifications, environment docs, and related artifacts.
Report concrete P0, P1, P2, and P3 issues. P2 and P3 issues do not block the verdict.
For each issue, list its locations, cause, and current effect.
Do not report theories, unsupported risks, correct or intended behavior, duplicates, or issues that need no change.
Do not lower the evidence rules to increase the issue count.
Use each category in the tool schema. Return at least one item for each category.
If a category has no issue, return one sentinel: severity "none", locations ["none"], issues ["No issues found."]
Do not mix a sentinel with issues. Do not duplicate an issue across categories.`,
  );
}
