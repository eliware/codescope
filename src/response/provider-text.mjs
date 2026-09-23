export function responseText(response, request) {
  try {
    return readResponseText(response, request);
  } catch (cause) {
    if (cause?.code === 'INVALID_RESPONSE') throw cause;
    const error = new Error(
      cause instanceof Error ? cause.message : 'Provider response was invalid',
      { cause },
    );
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
}

function readResponseText(response, request) {
  const name = request.tool_choice?.name;
  const output = response?.output;
  if (output !== undefined && !Array.isArray(output))
    throw new Error('Provider response output was not an array');
  const calls = (output ?? []).filter((item) => item?.type === 'function_call');
  const matchingCalls = name ? calls.filter((item) => item.name === name) : calls;
  if (name && matchingCalls.length === 0)
    throw new Error(`Provider response did not contain required function call: ${name}`);
  if (matchingCalls.length > 1)
    throw new Error('Provider response contained multiple matching function calls');
  const call = matchingCalls[0];
  if (call) {
    if (typeof call.arguments !== 'string')
      throw new Error('Provider function-call arguments were not raw text');
    return call.arguments;
  }
  if (typeof response?.output_text === 'string')
    return response.output_text;
  throw new Error('Provider response did not contain usable output');
}
