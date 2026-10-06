import { formatUsageMetadata } from "./format-usage-metadata.mjs";

export function formatSingleRequestUsage(output, response, model) {
  return `${output}\n${formatUsageMetadata(response, model)}`;
}
