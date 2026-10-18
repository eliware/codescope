const EFFORTS = ["none", "low", "medium", "high", "xhigh", "max"];

export function validateEffort(effort) {
  if (effort && !EFFORTS.includes(effort))
    throw new Error(`Reasoning level must be one of: ${EFFORTS.join(", ")}`);
}
