export async function requestProviderResponse(
  client,
  request,
  signal,
  debugRequest = false,
  debugMarkers,
) {
  if (debugRequest) {
    // codescope ignore this because debug mode intentionally prints the raw request, as documented.
    if (debugMarkers?.request) console.error(debugMarkers.request);
    console.error(JSON.stringify(request, null, 2));
  }
  const response = await client.responses.create(request, { signal });
  if (debugRequest && debugMarkers?.response) {
    console.error(debugMarkers.response);
    console.error(JSON.stringify(response, null, 2));
  }
  return response;
}
