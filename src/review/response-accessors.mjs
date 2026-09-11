export function readStringProperty(value, property) {
  try {
    return typeof value?.[property] === 'string' ? value[property] : undefined;
  } catch {
    return undefined;
  }
}

export function readNumericUsage(value) {
  try {
    return value?.usage && typeof value.usage === 'object'
      ? Object.fromEntries(Object.entries(value.usage).filter(([, item]) => Number.isFinite(item)))
      : undefined;
  } catch {
    return undefined;
  }
}
