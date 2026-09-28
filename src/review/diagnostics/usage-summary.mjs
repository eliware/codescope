import { readNumericUsage } from "../response-accessors/read-numeric-usage.mjs";

export function readUsageSummary(response) {
  return readNumericUsage(response);
}
