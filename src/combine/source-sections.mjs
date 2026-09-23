import { combineCodeFiles, combineMdFiles } from './source-file-aliases.mjs';

export async function collectSourceSections(root, options, inventory) {
  return {
    md: await combineMdFiles(root, { ...options, files: inventory }),
    implementation: await combineCodeFiles(root, { ...options, files: inventory, noTests: true }),
    tests: await combineCodeFiles(root, { ...options, files: inventory, testsOnly: true }),
  };
}
