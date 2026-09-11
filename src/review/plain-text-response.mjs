export function parsePlainTextJsonResponse(response) {
  const outputText = response?.output_text;
  if (typeof outputText !== 'string') return { raw_response: '' };
  try {
    return JSON.parse(outputText);
  } catch {
    return { raw_response: outputText };
  }
}
