export async function requestProviderResponse(client, request, signal, debugRequest = false) {
  if (
    Array.isArray(request.input) &&
    request.input.every(
      (message) => message && typeof message === "object" && Array.isArray(message.content),
    )
  ) {
    request.input = [
      {
        role: "user",
        content: request.input.flatMap((message) => message.content),
      },
    ];
  }
  if (debugRequest) console.error(JSON.stringify(request, null, 2));
  return client.responses.create(request, { signal });
}
