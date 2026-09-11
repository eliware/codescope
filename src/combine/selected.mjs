import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineJsonFiles } from './json.mjs';

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, testResults, ...options } = {},
) {
  const parts = [await combinePackageJson(root, options)];
  parts.push(await combineJsonFiles(root, options));
  if (implementation) parts.push(await combineCodeFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineCodeFiles(root, { ...options, testsOnly: true }));
  if (testResults) parts.push(testResults);
  if (docs) parts.push(await combineMdFiles(root, options));
  const combined = parts.filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
