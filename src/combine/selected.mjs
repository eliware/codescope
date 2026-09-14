import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineJsonFiles } from './json.mjs';
import { combineConventionFiles } from './conventions.mjs';
import { combineConfigFiles } from './configs.mjs';
import { collectInventorySection } from './inventory-section.mjs';
import { findAllFiles } from '../find/files.mjs';
import { joinCombinedSections } from './combined-source.mjs';

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, ...options } = {},
) {
  const inventory = options.inventory ?? (await findAllFiles(root, options));
  const parts = [
    await combinePackageJson(root, options),
    await combineConventionFiles(root, options),
    await combineConfigFiles(root, { ...options, inventory }),
    await collectInventorySection(root, inventory, options),
  ];
  parts.push(await combineJsonFiles(root, options));
  if (implementation) parts.push(await combineCodeFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineCodeFiles(root, { ...options, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, options));
  return joinCombinedSections(parts, options.maxChars);
}
