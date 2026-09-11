export function parseJsonResult(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : { raw_response: raw, verdict: 'block' };
  } catch {
    return { raw_response: raw, verdict: 'block' };
  }
}
