import { findAllFiles } from '../find/files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectSourceSections } from './source-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';

export async function collectAllSections(root, options = {}) {
  const inventory = await findAllFiles(root, options);
  const metadata = await collectMetadataSections(root, options, inventory);
  const source = await collectSourceSections(root, options, inventory);
  const other = await collectInventorySection(root, inventory, options);
  return {
    ...metadata,
    ...source,
    other,
  };
}
