import { describeOtherFiles } from "./other-files.mjs";
import { formatInventorySection } from "./inventory/format-section.mjs";

export async function collectInventorySection(root, inventory, options) {
  const { entries, totalEntries } = await describeOtherFiles(root, inventory, options);
  return formatInventorySection(entries, options.maxChars, totalEntries);
}
