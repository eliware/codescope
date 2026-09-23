import { combineFiles } from './files.mjs';

export async function collectSourceSections(root, options, inventory) {
  return {
    md: await combineFiles(root, '.md', { ...options, files: inventory }),
    implementation: await combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], { ...options, files: inventory, noTests: true }),
    tests: await combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], { ...options, files: inventory, testsOnly: true }),
  };
}
