export function responseText(response, request) {
  const name = request.tool_choice?.name;
  const call = (response?.output ?? []).find(
    (item) => item?.type === 'function_call' && (!name || item.name === name),
  );
  return typeof call?.arguments === 'string'
    ? call.arguments
    : typeof response?.output_text === 'string'
      ? response.output_text
      : '';
}
