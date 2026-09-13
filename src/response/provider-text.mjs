export function responseText(response, request) {
  const name = request.tool_choice?.name;
  const call = (response?.output ?? []).find(
    (item) => item?.type === 'function_call' && (!name || item.name === name),
  );
  if (call) {
    if (typeof call.arguments !== 'string')
      throw new Error('Provider function-call arguments were not raw text');
    return call.arguments;
  }
  if (typeof response?.output_text === 'string' && response.output_text.length > 0)
    return response.output_text;
  throw new Error('Provider response did not contain usable output');
}
