import { collectAllSections } from './all-sections.mjs';

export async function combineAllFiles(root, options = {}) {
  const sections = await collectAllSections(root, options);
  const combined = [
    sections.packageJson,
    sections.conventions,
    sections.json,
    sections.configs,
    sections.other,
    sections.md,
    sections.implementation,
    sections.tests,
    sections.testResults,
  ]
    .filter(Boolean)
    .join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export { combineSelectedFiles } from './selected.mjs';
