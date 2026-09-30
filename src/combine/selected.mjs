import { collectMetadataSections } from "./metadata-sections.mjs";
import { collectInventorySection } from "./inventory-section.mjs";
import { findFiles } from "../find/files.mjs";
import { joinCombinedSections } from "./combined-source.mjs";
import { validateCombineOptions } from "./policies.mjs";
import { createSectionBudget } from "./section-budget.mjs";
import { readSelectedSections } from "./selected/read-sections.mjs";

const DEFAULT_SELECTED_OPTIONS = {
  concurrency: 16,
  maxChars: Number.POSITIVE_INFINITY,
  platform: process.platform,
};

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, ...options } = {},
) {
  const normalizedOptions = { ...DEFAULT_SELECTED_OPTIONS, ...options };
  validateCombineOptions(root, normalizedOptions);
  const inventory = normalizedOptions.inventory ?? (await findFiles(root, "", normalizedOptions));
  const metadata = await collectMetadataSections(root, normalizedOptions, inventory);
  const parts = [
    metadata.packageJson,
    metadata.testSpecs,
    metadata.json,
    metadata.yaml,
    metadata.configs,
    // codescope ignore: A-19.3 requires the inventory for every profile before selected evidence.
    await collectInventorySection(root, inventory, normalizedOptions),
  ];
  const budget = createSectionBudget(
    joinCombinedSections(parts, normalizedOptions.maxChars).length,
    normalizedOptions.maxChars,
  );
  parts.push(
    ...(await readSelectedSections({
      root,
      selection: { implementation, tests, docs },
      options: normalizedOptions,
      inventory,
      budget,
    })),
  );
  return joinCombinedSections(parts, normalizedOptions.maxChars);
}
