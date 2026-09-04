export function createAllPrompt(profilePrompt) {
  return profilePrompt(
    'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Report all actionable findings, including P0, P1, P2, and P3; P2 and P3 findings must be reported but must not affect the verdict. Review categories in this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Cross Platform, Tests, Documentation. Every issue item must include a complete copy-pasteable `// codescope ignore: ...` comment in ignore_example; never leave it blank. Use an empty array when a category has no findings. Do not emit placeholders or no-issue items. Do not duplicate findings across categories.',
  );
}
