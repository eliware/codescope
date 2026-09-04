function responseText(response, request) {
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

const verdictFrom = (value) =>
  /["']verdict["']\s*:\s*["']pass["']/iu.test(value) ? 'pass' : 'block';

export function toolCategories(tool) {
  const categories = Object.keys(
    tool?.parameters?.properties?.issues?.properties ??
      tool?.parameters?.properties?.suggestions?.properties ??
      tool?.parameters?.properties?.findings?.properties ??
      {},
  );
  return categories.length ? categories : undefined;
}

export function parseProviderResult(providerResponse, request) {
  const raw = responseText(providerResponse, request);
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : { raw_response: raw, verdict: 'block' };
  } catch {
    return { raw_response: raw, verdict: verdictFrom(raw) };
  }
}
