export function responseText(response, request) {
  const name = request.tool_choice?.name;
  const call = (response?.output ?? []).find(
    (item) => item?.type === 'function_call' && (!name || item.name === name),
  );
  if (call) return typeof call.arguments === 'string' ? call.arguments : JSON.stringify(call.arguments);
  return typeof response?.output_text === 'string' ? response.output_text : '';
}
