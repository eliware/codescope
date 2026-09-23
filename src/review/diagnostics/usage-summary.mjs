import { readNumericUsage } from '../response-accessors.mjs';

export function readUsageSummary(response) {
  return readNumericUsage(response);
}
