export function readReasoningSummary(response) {
  if (!Array.isArray(response?.output)) return undefined;
  const parts = [];
  for (const item of response.output) {
    if (item?.type !== "reasoning" || !Array.isArray(item.summary)) continue;
    for (const part of item.summary) {
      if (part?.type === "summary_text" && typeof part.text === "string" && part.text.trim()) {
        parts.push(part.text);
      }
    }
  }
  return parts.length ? parts.join("\n") : undefined;
}
