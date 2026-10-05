function formatReasoningSummary(reasoningSummary) {
  return `Detailed reasoning summary:\n${reasoningSummary ?? "(unavailable)"}`;
}

export function formatInitialReviewOutput(initialOutput, initialUsage, reasoningSummary) {
  const usage = initialUsage ? `\n${initialUsage}` : "";
  return `Running initial review...\n${initialOutput}${usage}\n${formatReasoningSummary(reasoningSummary)}`;
}

export function formatReviewOutput(initialOutput, finalOutput, usageMetadata, reasoningSummary) {
  const initial = formatInitialReviewOutput(
    initialOutput,
    usageMetadata?.initial,
    reasoningSummary,
  );
  const finalUsage = usageMetadata?.final ? `\n${usageMetadata.final}` : "";
  return `${initial}\nRunning final review...\n${finalOutput}${finalUsage}`;
}
