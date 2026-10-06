export const findingActionabilityPolicy = [
  "Do not emit fully covered concerns as findings.",
  "If no actionable findings remain, use empty arrays for review categories.",
  "Do not require integration tests for delegated platform/runtime behavior when focused unit tests cover the application contract.",
  "Do not treat provider-output shape as a CodeScope defect, but continue reviewing CodeScope's own response construction, parsing, preservation, fallback, error mapping, tool-call, and verdict logic for concrete defects.",
].join(" ");
