import { findAllFiles } from '../find/files.mjs';
import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineConfigFiles } from './configs.mjs';
import { describeOtherFiles } from './other-files.mjs';

export async function combineAllFiles(root, options = {}) {
  const inventory = await findAllFiles(root, options);
  const [packageJson, configs, md, implementation, tests] = await Promise.all([
    combinePackageJson(root, options),
    combineConfigFiles(root, { ...options, inventory }),
    combineMdFiles(root, options),
    combineCodeFiles(root, { ...options, noTests: true }),
    combineCodeFiles(root, { ...options, testsOnly: true }),
  ]);
  const otherFiles = await describeOtherFiles(root, inventory, options);
  const otherSection = `===== other files (names and sizes only) =====\n${otherFiles.join('\n')}\n`;
  const combined = [packageJson, configs, md, implementation, tests, options.testResults, otherSection]
    .filter(Boolean)
    .join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, testResults, ...options } = {},
) {
  const parts = [await combinePackageJson(root, options)];
  if (implementation) parts.push(await combineCodeFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineCodeFiles(root, { ...options, testsOnly: true }));
  if (testResults) parts.push(testResults);
  if (docs) parts.push(await combineMdFiles(root, options));
  const combined = parts.filter(Boolean).join('\n');

  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
