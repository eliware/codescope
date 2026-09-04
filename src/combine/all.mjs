import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findAllFiles } from '../find/files.mjs';
import { combineCodeFiles, combineMdFiles } from './files.mjs';
import { combinePackageJson } from './package-json.mjs';
import { combineConfigFiles } from './configs.mjs';

const CODE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts'];

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

async function describeOtherFiles(root, inventory, options) {
  const readFileContents = options.readFileContents ?? readFile;
  const entries = await Promise.all(
    inventory
      .filter((relativePath) => !isIncludedContent(relativePath))
      .map(async (relativePath) => {
        const absolutePath = path.join(root, relativePath);
        const data = await readFileContents(absolutePath);
        const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
        if (bytes.includes(0)) return `${relativePath} | binary | ${bytes.byteLength} bytes`;
        const text = bytes.toString('utf8');
        return `${relativePath} | text | ${text.split(/\r\n|\r|\n/u).length} lines | ${bytes.byteLength} bytes`;
      }),
  );
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}

function isIncludedContent(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower === 'package.json' || lower.endsWith('.md')) return true;
  if (lower.startsWith('.github/') || lower.startsWith('.knit/')) return true;
  const isCode = CODE_EXTENSIONS.some((extension) => lower.endsWith(extension));
  return isCode;
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
