import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { combineMjsFiles, combineMdFiles } from './combine-mjs.mjs';

async function combinePackageJson(root, options = {}) {
  const readFileContents = options.readFileContents ?? readFile;
  const inspectFile = options.inspectFile ?? lstat;
  const packagePath = path.join(root, 'package.json');
  let contents;
  try {
    if (options.validateSymlinks || readFileContents === readFile) {
      const metadata = await inspectFile(packagePath);
      if (metadata.isSymbolicLink()) throw new Error('symlinked package.json is not supported');
    }
    contents = await readFileContents(packagePath, 'utf8');
  } catch (cause) {
    throw new Error(
      `Unable to read package.json: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
  if (typeof contents !== 'string')
    throw new Error('Unable to read package.json: file reader returned non-string content');
  const lines = contents.replace(/(?:\r\n|\r|\n)$/u, '').split(/\r\n|\r|\n/u);
  const width = String(lines.length).length;
  return `===== package.json =====\n${lines.map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`).join('\n')}\n`;
}

export async function combineAllFiles(root, options = {}) {
  const [packageJson, mjs, md] = await Promise.all([
    combinePackageJson(root, options),
    combineMjsFiles(root, options),
    combineMdFiles(root, options),
  ]);
  const combined = [packageJson, mjs, options.testResults, md].filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, testResults, ...options } = {},
) {
  const parts = [await combinePackageJson(root, options)];
  if (implementation) parts.push(await combineMjsFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineMjsFiles(root, { ...options, testsOnly: true }));
  if (testResults) parts.push(testResults);
  if (docs) parts.push(await combineMdFiles(root, options));
  const combined = parts.filter(Boolean).join('\n');

  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
