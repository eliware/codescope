export function readStringProperty(value, property) {
  try {
    const propertyValue = value?.[property];
    return typeof propertyValue === "string" ? propertyValue : undefined;
  } catch {
    return undefined;
  }
}
