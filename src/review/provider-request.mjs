export async function requestProviderResponse(client, request, combined, signal) {
  return client.responses.create(
    {
      ...request,
      input: request.input,
      tool_choice: request.tool_choice,
      parallel_tool_calls: combined,
    },
    { signal },
  );
}
