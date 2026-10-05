import { requestProviderResponse } from "../provider-request.mjs";
import { responseText } from "../../response/provider-text.mjs";
import { createSessionResult } from "../review-result.mjs";
import { runReviewFollowUp } from "./run-review-follow-up.mjs";

const findingReviewTools = new Set(["submit_review", "submit_unified_review"]);

export async function runProviderSession({ client, request, signal, plainText, debugRequest }) {
  const hasFollowUp = plainText === undefined && findingReviewTools.has(request.tool_choice?.name);
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
    const followUp = await runReviewFollowUp({
      client,
      request,
      firstOutput: output,
      signal,
      debugRequest,
    });
    output = followUp.output;
    finalResponse = followUp.providerResponse ?? providerResponse;
  }
  return createSessionResult(plainText === undefined ? "review" : "prompt", output, finalResponse);
}
