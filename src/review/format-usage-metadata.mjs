import { calculateUsageCostBreakdown } from "@eliware/openai";

export function formatUsageMetadata(response, model, label = "Request") {
  try {
    const usage = response?.usage;
    if (!usage || typeof usage !== "object") return `${label} usage metadata: unavailable`;
    const breakdown = calculateUsageCostBreakdown(model, usage);
    return `${label} usage metadata: ${JSON.stringify(breakdown)}`;
  } catch {
    return `${label} usage metadata: unavailable`;
  }
}
