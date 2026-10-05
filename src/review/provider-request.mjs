export async function requestProviderResponse(client, request, signal, debugRequest = false) {
  if (
    Array.isArray(request.input) &&
    request.input.every(
      (message) => message && typeof message === "object" && Array.isArray(message.content),
    )
  ) {
    const content = request.input.flatMap((message) => message.content);
    if (content.every((part) => part.type === "input_text" && typeof part.text === "string")) {
      request.input = [
        {
          role: "user",
          content: [{ type: "input_text", text: content.map(({ text }) => text).join("\n\n") }],
        },
      ];
    }
  }
  if (debugRequest) console.error(JSON.stringify(request, null, 2));
  return client.responses.create(request, { signal });
}
