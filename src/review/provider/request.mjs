import { ResponsesError } from "@eliware/openai";

export async function requestProviderResponse(
  client,
  request,
  signal,
  debugRequest = false,
  debugMarkers,
) {
  const useEventStream = debugRequest && typeof client.responses.createWithEvents === "function";
  const sentRequest = useEventStream ? { ...request, stream: true } : request;
  if (debugRequest) {
    if (debugMarkers?.request) console.error(debugMarkers.request);
    console.error(JSON.stringify(sentRequest, null, 2));
  }

  let response;
  if (useEventStream) {
    const events = [];
    let streamFailure;
    await client.responses.createWithEvents(sentRequest, {
      signal,
      onEvent(event) {
        events.push({
          type: event.type,
          response_id: event.responseId,
          request_id: event.requestId,
          ...(event.type === "response.reasoning_summary_text.delta" ? { delta: event.delta } : {}),
        });
        if (event.type === "response.failed") {
          response = event.response;
          streamFailure = new ResponsesError("OpenAI response failed", { event });
          streamFailure.providerResponse = response;
        }
      },
      onCompleted(completedResponse) {
        response = completedResponse;
      },
    });
    console.error("--- RESPONSE EVENTS ---");
    console.error(JSON.stringify(events, null, 2));
    if (streamFailure) throw streamFailure;
    if (response === undefined)
      throw new Error("OpenAI event stream returned no completed response");
  } else {
    response = await client.responses.create(request, { signal });
  }

  if (debugRequest && debugMarkers?.response) {
    console.error(debugMarkers.response);
    console.error(JSON.stringify(response, null, 2));
  }
  return response;
}
