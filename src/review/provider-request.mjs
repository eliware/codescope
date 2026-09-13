export async function requestProviderResponse(client, request, signal) {
  return client.responses.create(
    request,
    { signal },
  );
}
