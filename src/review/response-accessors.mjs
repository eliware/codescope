export function readStringProperty(value, property) {
  try {
    return typeof value?.[property] === 'string' ? value[property] : undefined;
  } catch {
    return undefined;
  }
}

export function readNumericUsage(value) {
  try {
    if (!value?.usage || typeof value.usage !== 'object') return undefined;
    const entries = Object.entries(value.usage);
    const valid = entries.filter(([, item]) => Number.isInteger(item) && item >= 0);
    return Object.fromEntries([
      ...valid,
      ...(valid.length !== entries.length ? [['invalid_fields', true]] : []),
    ]);
  } catch {
    return undefined;
  }
}
