const PRICING_DETAIL_FIELDS = new Set(["cached_tokens", "cache_write_tokens"]);

export function readNumericUsage(value) {
  try {
    const usage = value?.usage;
    if (!usage || typeof usage !== "object") return undefined;
    const { input_tokens_details: details, ...topLevel } = usage;
    const entries = Object.entries(topLevel);
    const valid = entries.filter(([, item]) => Number.isInteger(item) && item >= 0);
    const detailEntries = details && typeof details === "object" ? Object.entries(details) : [];
    const validDetails = detailEntries.filter(
      ([key, item]) => PRICING_DETAIL_FIELDS.has(key) && Number.isInteger(item) && item >= 0,
    );
    const invalidDetails =
      details !== undefined &&
      details !== null &&
      (typeof details !== "object" || validDetails.length !== detailEntries.length);
    return Object.fromEntries([
      ...valid,
      ...(validDetails.length ? [["input_tokens_details", Object.fromEntries(validDetails)]] : []),
      ...(valid.length !== entries.length || invalidDetails ? [["invalid_fields", true]] : []),
    ]);
  } catch {
    return undefined;
  }
}
