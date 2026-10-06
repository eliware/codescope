import { requestProviderResponse } from "../provider-request.mjs";
import { responseText } from "../../response/provider-text.mjs";
import { readReasoningSummary } from "../../response/read-reasoning-summary.mjs";
import { createSessionResult } from "../review-result.mjs";
import { formatSingleRequestUsage } from "../usage-reporting.mjs";

const findingReviewTools = new Set(["submit_review", "submit_unified_review"]);
const findingReviewDebugMarkers = {
  request: "--- REVIEW REQUEST ---",
  response: "--- REVIEW RESPONSE ---",
};

export async function runProviderSession({
  client,
  request,
  signal,
  usage,
  plainText,
  debugRequest,
}) {
  const isFindingReview =
    plainText === undefined && findingReviewTools.has(request.tool_choice?.name);
  const providerResponse = await requestProviderResponse(
    client,
    request,
    signal,
    debugRequest,
    debugRequest && isFindingReview ? findingReviewDebugMarkers : undefined,
  );
  if (debugRequest && !isFindingReview) console.error(JSON.stringify(providerResponse, null, 2));

  let output;
  try {
    output = responseText(providerResponse, request);
  } catch (cause) {
    cause.providerResponse = providerResponse;
    throw cause;
  }
  const reasoningSummary = readReasoningSummary(providerResponse);
  if (reasoningSummary) {
    output = `Reasoning summary:\n${reasoningSummary}\n\n${output}`;
  }
  if (usage) output = formatSingleRequestUsage(output, providerResponse, request.model);
  return createSessionResult(
    plainText === undefined ? "review" : "prompt",
    output,
    providerResponse,
  );
}
