export async function requestProviderResponse(client, request, signal) {
  return client.responses.create(
    {
      ...request,
      input: request.input,
      tool_choice: request.tool_choice,
    },
    { signal },
  );
}
