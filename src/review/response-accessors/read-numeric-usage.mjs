export function readNumericUsage(value) {
  try {
    const usage = value?.usage;
    if (!usage || typeof usage !== "object") return undefined;
    const entries = Object.entries(usage);
    const valid = entries.filter(([, item]) => Number.isInteger(item) && item >= 0);
    return Object.fromEntries([
      ...valid,
      ...(valid.length !== entries.length ? [["invalid_fields", true]] : []),
    ]);
  } catch {
    return undefined;
  }
}
