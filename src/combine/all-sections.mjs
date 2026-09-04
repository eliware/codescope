import { findAllFiles } from '../find/files.mjs';
import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineConfigFiles } from './configs.mjs';
import { describeOtherFiles } from './other-files.mjs';

export async function collectAllSections(root, options = {}) {
  const inventory = await findAllFiles(root, options);
  const [packageJson, configs, md, implementation, tests] = await Promise.all([
    combinePackageJson(root, options),
    combineConfigFiles(root, { ...options, inventory }),
    combineMdFiles(root, options),
    combineCodeFiles(root, { ...options, noTests: true }),
    combineCodeFiles(root, { ...options, testsOnly: true }),
  ]);
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
