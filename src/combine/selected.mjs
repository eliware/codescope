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
  let usedChars = joinCombinedSections(parts, normalizedOptions.maxChars).length;
  const withRemainingBudget = async (options) => {
    const remaining = Number.isFinite(normalizedOptions.maxChars)
      ? normalizedOptions.maxChars - usedChars
      : Number.POSITIVE_INFINITY;
    const section = await options(remaining);
    usedChars += section.length + Math.min(1, Math.sign(usedChars) * Math.sign(section.length));
    return section;
  };
  const selected = [];
  if (implementation)
    selected.push(await withRemainingBudget((maxChars) =>
      combineCodeFiles(root, { ...normalizedOptions, maxChars, files: inventory, noTests: true })));
  if (tests)
    selected.push(await withRemainingBudget((maxChars) =>
      combineCodeFiles(root, { ...normalizedOptions, maxChars, files: inventory, testsOnly: true })));
  if (docs)
    selected.push(await withRemainingBudget((maxChars) =>
      combineMdFiles(root, { ...normalizedOptions, maxChars, files: inventory })));
  parts.push(...selected);
  return joinCombinedSections(parts, normalizedOptions.maxChars);
}
