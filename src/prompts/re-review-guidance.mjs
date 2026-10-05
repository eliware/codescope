export function createReviewFollowUpInstructions(findingField) {
  return `Re-review only the findings in the immediately preceding assistant message against the repository evidence and review instructions already supplied. Use the same tool and schema as the initial review. Do not add findings that were not in the initial result.

For each initial finding:
- If it is valid and accurate, repeat it verbatim.
- If the underlying issue is real but the finding is partly inaccurate, correct only what is needed to state the real actionable issue accurately.
- If it is unsupported, already correct or intentional, contradicted by supplied code, tests, specifications, or documentation, or has no practical change to recommend, omit it entirely. Never preserve a finding while also explaining that it is not an issue.

Return every category required by the tool schema. If no findings remain in a category, return exactly one sentinel for that category: severity "none", location "none", ${findingField} "No issues found.", blank recommendation and ignore_example, and empty rationale. Never mix a sentinel with findings. Recompute the verdict using the original review instructions and only the findings that remain.`;
}
