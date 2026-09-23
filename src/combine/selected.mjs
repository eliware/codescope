import { combineFiles } from './files.mjs';
import { collectMetadataSections } from './metadata-sections.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { findFiles } from '../find/files.mjs';
import { joinCombinedSections } from './combined-source.mjs';
import { validateCombineOptions } from './policies.mjs';
import { createSectionBudget } from './section-budget.mjs';

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
  const inventory = normalizedOptions.inventory ?? (await findFiles(root, '', normalizedOptions));
  const metadata = await collectMetadataSections(root, normalizedOptions, inventory);
  const parts = [
    metadata.packageJson,
    metadata.conventions,
    metadata.json,
    metadata.configs,
    await collectInventorySection(root, inventory, normalizedOptions),
  ];
  const budget = createSectionBudget(
    joinCombinedSections(parts, normalizedOptions.maxChars).length,
    normalizedOptions.maxChars,
  );
  const selected = [];
  if (implementation)
    selected.push(await budget.read((maxChars) =>
      combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], { ...normalizedOptions, maxChars, files: inventory, noTests: true })));
  if (tests)
    selected.push(await budget.read((maxChars) =>
      combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], { ...normalizedOptions, maxChars, files: inventory, testsOnly: true })));
  if (docs)
    selected.push(await budget.read((maxChars) =>
      combineFiles(root, '.md', { ...normalizedOptions, maxChars, files: inventory })));
  parts.push(...selected);
  return joinCombinedSections(parts, normalizedOptions.maxChars);
}
