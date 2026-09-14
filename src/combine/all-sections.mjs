import { findAllFiles } from '../find/files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectSourceSections } from './source-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';

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

export function createReadCache(readFileContents) {
  if (!readFileContents) return undefined;
  const cache = new Map();
  return async (filePath, encoding) => {
    const key = `${filePath}\u0000${encoding ?? ''}`;
    if (cache.has(key)) return cache.get(key);
    const pending = Promise.resolve(readFileContents(filePath, encoding));
    cache.set(key, pending);
    try {
      return await pending;
    } catch (cause) {
      cache.delete(key);
      throw cause;
    }
  };
}
