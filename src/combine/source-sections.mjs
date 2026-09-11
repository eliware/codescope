import { combineCodeFiles, combineMdFiles } from './files.mjs';

export async function collectSourceSections(root, options) {
  return {
    md: await combineMdFiles(root, options),
    implementation: await combineCodeFiles(root, { ...options, noTests: true }),
    tests: await combineCodeFiles(root, { ...options, testsOnly: true }),
  };
}
