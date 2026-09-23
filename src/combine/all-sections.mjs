import { findFiles } from '../find/files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectSourceSections } from './source-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { createAllReadOptions } from './all-read-options.mjs';

export async function collectAllSections(root, options = {}) {
  const inventory = await findFiles(root, '', options);
  const sharedOptions = createAllReadOptions(options);
  const metadata = await collectMetadataSections(root, sharedOptions, inventory);
  const source = await collectSourceSections(root, sharedOptions, inventory);
  const other = await collectInventorySection(root, inventory, sharedOptions);
  return {
    ...metadata,
    ...source,
    other,
  };
}

