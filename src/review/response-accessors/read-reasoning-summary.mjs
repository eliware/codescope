export function readReasoningSummary(response) {
  try {
    if (!Array.isArray(response?.output)) return undefined;
    const text = response.output
      .flatMap((item) =>
        item?.type === "reasoning" && Array.isArray(item.summary) ? item.summary : [],
      )
      .filter((part) => part?.type === "summary_text" && typeof part.text === "string")
      .map((part) => part.text.trim())
      .filter(Boolean);
    return text.length ? text.join("\n\n") : undefined;
  } catch {
    return undefined;
  }
}
