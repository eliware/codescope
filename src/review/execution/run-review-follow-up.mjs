import { responseText } from "../../response/provider-text.mjs";
import { appendReviewFollowUp } from "../prepare-review-follow-up.mjs";
import { requestProviderResponse } from "../provider-request.mjs";

const reReviewDebugMarkers = {
  request: "--- RE-REVIEW REQUEST ---",
  response: "--- RE-REVIEW RESPONSE ---",
};

export async function runReviewFollowUp({ client, request, firstOutput, signal, debugRequest }) {
  appendReviewFollowUp(request, firstOutput);
  let providerResponse;
  try {
    providerResponse = await requestProviderResponse(
      client,
      request,
      signal,
      debugRequest,
      reReviewDebugMarkers,
    );
    const output = responseText(providerResponse, request);
    return { output, providerResponse, reviewed: true };
  } catch (error) {
    if (signal?.reason?.code === "SIGINT" || signal?.reason?.code === "SIGTERM") throw error;
    return { output: firstOutput, reviewed: false };
  }
}
