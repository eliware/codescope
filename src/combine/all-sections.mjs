import { findAllFiles } from '../find/files.mjs';
import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineConfigFiles } from './configs.mjs';
import { describeOtherFiles } from './other-files.mjs';

export async function collectAllSections(root, options = {}) {
  const inventory = await findAllFiles(root, options);
  const packageJson = await combinePackageJson(root, options);
  const configs = await combineConfigFiles(root, { ...options, inventory });
  const md = await combineMdFiles(root, options);
  const implementation = await combineCodeFiles(root, { ...options, noTests: true });
  const tests = await combineCodeFiles(root, { ...options, testsOnly: true });
  const otherFiles = await describeOtherFiles(root, inventory, options);
  return {
    packageJson,
    configs,
    md,
    implementation,
    tests,
    testResults: options.testResults,
    other: `===== other files (names and sizes only) =====\n${otherFiles.join('\n')}\n`,
  };
}
