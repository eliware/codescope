export function createAllPrompt(profilePrompt) {
  return profilePrompt(
    'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Report all actionable findings, including P0, P1, P2, and P3; P2 and P3 findings must be reported but must not affect the verdict. Review categories in this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Cross Platform, Tests, Documentation. Every category must contain at least one item. When a category has no actionable findings, return exactly one sentinel with severity `none`, location `none`, issue `No issues found.`, and blank ignore_example. Leave recommendation/rationale blank where present. Every real issue item must include a complete copy-pasteable `// codescope ignore: ...` comment in ignore_example. Do not duplicate findings across categories.',
  );
}
