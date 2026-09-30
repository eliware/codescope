const HEADER = "===== Eliware Test specifications =====\n";

export function formatTestSpecEvidence(result) {
  if (result.status === "checkout-unavailable")
    return `${HEADER}Adjacent eliware/test checkout not supplied.\n`;
  if (result.status === "applicability-unavailable") {
    const reason = result.reason ? `: ${result.reason}` : "";
    return `${HEADER}Test-spec applicability unavailable${reason}.\n`;
  }
  if (result.status === "applicability-invalid")
    return `${HEADER}Test-spec applicability invalid: ${result.reason}.\n`;
  if (result.status === "records-missing")
    return `${HEADER}Test specification evidence incomplete; missing records: ${result.missing.join(", ")}.\n`;
  return `${HEADER}${result.sections.join("\n")}\n`;
}
