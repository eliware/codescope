import { responseText } from "../../response/provider-text.mjs";
import { appendReviewFollowUp } from "../prepare-review-follow-up.mjs";
import { requestProviderResponse } from "../provider-request.mjs";

export async function runReviewFollowUp({ client, request, firstOutput, signal, debugRequest }) {
  appendReviewFollowUp(request, firstOutput);
  let providerResponse;
  try {
    providerResponse = await requestProviderResponse(client, request, signal, debugRequest);
    const output = responseText(providerResponse, request);
    if (debugRequest) console.error(JSON.stringify(providerResponse, null, 2));
    return { output, providerResponse };
  } catch (error) {
    if (debugRequest && providerResponse !== undefined)
      console.error(JSON.stringify(providerResponse, null, 2));
    if (signal?.reason?.code === "SIGINT" || signal?.reason?.code === "SIGTERM") throw error;
    return { output: firstOutput };
  }
}
