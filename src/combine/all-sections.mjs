import { findFiles } from "../find/files.mjs";
import { collectMetadataSections } from "./metadata-sections.mjs";
import { collectSourceSections } from "./source-sections.mjs";
import { collectInventorySection } from "./inventory-section.mjs";
import { createAllReadOptions } from "./all-read-options.mjs";
import { remainingCharBudget } from "./remaining-char-budget.mjs";

export async function collectAllSections(root, options = {}) {
  const inventory = await findFiles(root, "", options);
  const sharedOptions = createAllReadOptions(options);
  const metadata = await collectMetadataSections(root, sharedOptions, inventory);
  const source = await collectSourceSections(
    root,
    sharedOptions,
    inventory,
    Object.values(metadata),
  );
  const other = await collectInventorySection(root, inventory, {
    ...sharedOptions,
    maxChars: remainingCharBudget(
      [...Object.values(metadata), ...Object.values(source)],
      options.maxChars,
    ),
  });
  return {
    ...metadata,
    ...source,
    other,
  };
}
