function safeRawResponse(value) {
  if (typeof value === 'string') return { raw_response: value };
  if (typeof value?.output_text === 'string') return { raw_response: value.output_text };
  try {
    return { raw_response: String(value) };
  } catch {
    return { raw_response: '[unavailable]' };
  }
}

export function bestEffortPrettyPrint(value) {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return JSON.stringify(safeRawResponse(value), null, 2);
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return JSON.stringify(safeRawResponse(value), null, 2);
  }
}
