import { requestProviderResponse } from "../provider-request.mjs";
import { responseText } from "../../response/provider-text.mjs";
import { createSessionResult } from "../review-result.mjs";
import { formatInitialReviewOutput, formatReviewOutput } from "../format-review-output.mjs";
import { formatFindingReviewUsage, formatSingleRequestUsage } from "../usage-reporting.mjs";
import { readReasoningSummary } from "../response-accessors/read-reasoning-summary.mjs";
import { runReviewFollowUp } from "./run-review-follow-up.mjs";

const findingReviewTools = new Set(["submit_review", "submit_unified_review"]);

export async function runProviderSession({
  client,
  request,
  signal,
  usage,
  plainText,
  debugRequest,
}) {
  const hasFollowUp = plainText === undefined && findingReviewTools.has(request.tool_choice?.name);
  if (hasFollowUp) request.reasoning = { ...request.reasoning, summary: null };
  const providerResponse = await requestProviderResponse(
    client,
    request,
    signal,
    debugRequest && !hasFollowUp,
  );
  if (debugRequest && !hasFollowUp) console.error(JSON.stringify(providerResponse, null, 2));
  let output;
  try {
    output = responseText(providerResponse, request);
  } catch (cause) {
    cause.providerResponse = providerResponse;
    throw cause;
  }
  let finalResponse = providerResponse;
  if (hasFollowUp) {
    const initialOutput = output;
    const followUp = await runReviewFollowUp({
      client,
      request,
      firstOutput: output,
      signal,
      debugRequest,
    });
    const reasoningSummary = readReasoningSummary(followUp.providerResponse);
    if (usage) {
      output = formatFindingReviewUsage({
        initialOutput,
        finalOutput: followUp.output,
        initialResponse: providerResponse,
        finalResponse: followUp.providerResponse,
        model: request.model,
        reviewed: followUp.reviewed,
        reasoningSummary,
      });
    } else {
      output = followUp.reviewed
        ? formatReviewOutput(initialOutput, followUp.output, undefined, reasoningSummary)
        : formatInitialReviewOutput(initialOutput, undefined, reasoningSummary);
    }
    finalResponse = followUp.providerResponse ?? providerResponse;
  } else if (usage) {
    output = formatSingleRequestUsage(output, providerResponse, request.model);
  }
  return createSessionResult(plainText === undefined ? "review" : "prompt", output, finalResponse);
}
