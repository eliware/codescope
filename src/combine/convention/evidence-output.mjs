const HEADER = "===== Convention v8 JSON =====\n";

export function formatConventionEvidence(result) {
  if (result.status === "checkout-unavailable")
    return `${HEADER}Convention checkout not supplied.\n`;
  if (result.status === "applicability-unavailable")
    return `${HEADER}Convention applicability unavailable.\n`;
  if (result.status === "applicability-invalid")
    return `${HEADER}Convention applicability invalid: ${result.reason}.\n`;
  if (result.status === "index-unavailable")
    return `${HEADER}Convention directive index unavailable: ${result.reason}.\n`;
  if (result.status === "records-missing")
    return `${HEADER}Convention evidence incomplete; missing records: ${result.missing.join(", ")}.\n`;
  return `${HEADER}${result.sections.join("\n")}\n`;
}
