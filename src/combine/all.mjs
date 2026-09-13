import { collectAllSections } from './all-sections.mjs';
import { joinCombinedSections } from './combined-source.mjs';

export async function combineAllFiles(root, options = {}) {
  const sections = await collectAllSections(root, options);
  return joinCombinedSections([
    sections.packageJson,
    sections.conventions,
    sections.json,
    sections.configs,
    sections.other,
    sections.md,
    sections.implementation,
    sections.tests,
  ], options.maxChars);
}

export { combineSelectedFiles } from './selected.mjs';
