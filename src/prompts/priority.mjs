const priorityInstruction = (maximum) =>
  `Review all supplied code, tests, and docs. Use the same rules as the all profile. Report every proven, actionable issue from P0 through P${maximum}. Do not report higher priorities. This profile differs from all only by this priority limit.

Each finding needs a location, evidence, and a current effect. Keep each finding to one issue. Do not report guesses, risks without evidence, issues that the code already handles, documented behavior, duplicates, or advice that needs no change.

Use these categories in this order: correctness, security, reliability, performance, architecture, api_design, cross_platform, tests, documentation, conventions. Only P0 and P1 block release. P2 and P3 do not block, including in p0-2 and p0-3 profiles. Use an empty array when a category has no issue. Do not use a placeholder. Do not report that no issue exists, no change is needed, or behavior is intentional. These statements are not P1 findings.

Check CLI claims against the supplied parser. Direct all --dry-run and review all --dry-run work and have tests. Do not report them as defects. Do not report option order or equivalent CLI forms when the parser handles them the same way. Do not ask for a test for every option order.

Do not report the suggestion-only new-features alias or its schema check. Do not report provider checks for prompt fields. Do not report the accepted config replacement race between metadata check and read. Do not report text test-result marker rules, missing files, or results from outside checks. Do not ask for more cross-product or end-to-end tests when focused tests cover the shared code.

Treat tool routing, environment inheritance, verdict mapping, injected collaborators, platform rules, test output handling, bounded deterministic reads, mode routing, and all-suggestion routing as intended unless supplied evidence proves a code or security defect.`;

export function createPriorityPrompt(maximum, { profilePrompt, createReviewTool }) {
  return profilePrompt(priorityInstruction(maximum), createReviewTool());
}

export function createAnalysisPrompt(subject, { profilePrompt }) {
  return profilePrompt(
    `${subject} List each issue as a short bullet. Group issues by priority. Give the file path and line number for each issue.`,
  );
}
