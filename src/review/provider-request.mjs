export async function requestProviderResponse(client, request, signal, debugRequest = false) {
  if (debugRequest) console.error(JSON.stringify(request, null, 2));
  return client.responses.create(request, { signal });
}
