export const findingActionabilityPolicy = [
  "Fully covered concerns are invisible: never mention, summarize, paraphrase, relabel, count, or explain them.",
  'If no actionable findings remain, say exactly "No issues found."',
  "Do not require integration tests for delegated platform/runtime behavior when focused unit tests cover the application contract.",
  "Do not treat provider-output shape as a CodeScope defect, but continue reviewing CodeScope's own response construction, parsing, preservation, fallback, error mapping, tool-call, and verdict logic for concrete defects.",
].join(" ");
