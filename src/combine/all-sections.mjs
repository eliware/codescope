import { findAllFiles } from '../find/file-aliases.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectSourceSections } from './source-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { createReadCache } from './read-cache.mjs';

export async function collectAllSections(root, options = {}) {
  const inventory = await findAllFiles(root, options);
  const readFileContents = createReadCache(options.readFileContents);
  const sharedOptions = { ...options, readFileContents };
  const metadata = await collectMetadataSections(root, sharedOptions, inventory);
  const source = await collectSourceSections(root, sharedOptions, inventory);
  const other = await collectInventorySection(root, inventory, sharedOptions);
  return {
    ...metadata,
    ...source,
    other,
  };
}

