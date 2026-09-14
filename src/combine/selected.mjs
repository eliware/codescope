import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { findAllFiles } from '../find/files.mjs';
import { joinCombinedSections } from './combined-source.mjs';
import { validateCombineOptions } from './policies.mjs';

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
  const inventory = normalizedOptions.inventory ?? (await findAllFiles(root, normalizedOptions));
  const metadata = await collectMetadataSections(root, normalizedOptions, inventory);
  const parts = [
    metadata.packageJson,
    metadata.conventions,
    metadata.json,
    metadata.configs,
    await collectInventorySection(root, inventory, normalizedOptions),
  ];
  if (implementation)
    parts.push(await combineCodeFiles(root, { ...normalizedOptions, files: inventory, noTests: true }));
  if (tests)
    parts.push(await combineCodeFiles(root, { ...normalizedOptions, files: inventory, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, { ...normalizedOptions, files: inventory }));
  return joinCombinedSections(parts, normalizedOptions.maxChars);
}
