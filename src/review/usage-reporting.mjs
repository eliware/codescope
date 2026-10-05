import { formatInitialReviewOutput, formatReviewOutput } from "./format-review-output.mjs";
import { formatUsageMetadata } from "./format-usage-metadata.mjs";

export function formatSingleRequestUsage(output, response, model) {
  return `${output}\n${formatUsageMetadata(response, model)}`;
}

export function formatFindingReviewUsage({
  initialOutput,
  finalOutput,
  initialResponse,
  finalResponse,
  model,
  reviewed,
  reasoningSummary,
}) {
  const initialUsage = formatUsageMetadata(initialResponse, model, "Initial review");
  if (!reviewed) {
    return formatInitialReviewOutput(
      initialOutput,
      `${initialUsage}\nFollow-up usage metadata: unavailable (request failed)`,
      reasoningSummary,
    );
  }
  const finalUsage = formatUsageMetadata(finalResponse, model, "Final review");
  return formatReviewOutput(
    initialOutput,
    finalOutput,
    {
      initial: initialUsage,
      final: finalUsage,
    },
    reasoningSummary,
  );
}
