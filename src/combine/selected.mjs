import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { findAllFiles } from '../find/files.mjs';
import { joinCombinedSections } from './combined-source.mjs';

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, ...options } = {},
) {
  const inventory = options.inventory ?? (await findAllFiles(root, options));
  const metadata = await collectMetadataSections(root, options, inventory);
  const parts = [
    metadata.packageJson,
    metadata.conventions,
    metadata.json,
    metadata.configs,
    await collectInventorySection(root, inventory, options),
  ];
  if (implementation) parts.push(await combineCodeFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineCodeFiles(root, { ...options, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, options));
  return joinCombinedSections(parts, options.maxChars);
}
