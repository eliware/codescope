import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findAllFiles } from './find-mjs.mjs';
import { combineCodeFiles, combineMdFiles } from './combine-mjs.mjs';

const CODE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts'];
const MAX_CONFIG_LINES = 200;

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

async function combineConfigFiles(root, options = {}) {
  const readFileContents = options.readFileContents ?? readFile;
  const inventory = options.inventory;
  const configFiles = inventory.filter((relativePath) => {
    const normalized = relativePath.toLowerCase();
    return normalized.startsWith('.github/') || normalized.startsWith('.knit/');
  });
  const sections = await Promise.all(configFiles.map(async (relativePath) => {
    const data = await readFileContents(path.join(root, relativePath));
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
    if (bytes.includes(0)) return '';
    const contents = bytes.toString('utf8');
    const lines = contents.replace(/(?:\r\n|\r|\n)$/u, '').split(/\r\n|\r|\n/u);
    const truncated = lines.length > MAX_CONFIG_LINES;
    const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
    const width = String(visibleLines.length).length;
    const body = visibleLines.map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`);
    if (truncated) body.push(`[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`);
    return `===== ${relativePath} =====\n${body.join('\n')}\n`;
  }));
  const included = sections.filter(Boolean);
  return included.length ? `===== repository configuration =====\n${included.join('\n')}` : '';
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
