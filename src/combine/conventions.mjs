import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { readSourceFile } from './read-file.mjs';
import { formatSourceSection } from './section-format.mjs';
import { readBatches } from './batches.mjs';
import { readConventionApplicability } from './convention/applicability.mjs';
import { conventionFilesForApplicability, normalizeConventionPath, resolveConventionPath } from './convention/paths.mjs';
export async function combineConventionFiles(
  root,
  {
    conventionsRoot = path.resolve(root, '..', 'conventions'),
    readDirectory,
    readFileContents = readFile,
    readPackageJson = readFileContents,
    readConventionManifest,
    inspectFile = lstat,
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Convention read concurrency must be a positive integer');
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const specsRoot = pathApi.join(conventionsRoot, 'specs');
  let discoveredFiles;
  try {
    discoveredFiles = await findFiles(specsRoot, '.json', { readDirectory, platform });
  } catch (cause) {
    if (cause?.code === 'ENOENT' || cause?.code === 'ENOTDIR')
      return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
    throw new Error(
      `Unable to discover convention evidence: ${String(cause)}`,
      { cause },
    );
  }
  const applicability = await readConventionApplicability(root, {
    conventionsRoot,
    readPackageJson,
    readFileContents,
    readConventionManifest,
    platform,
  });
  if (!applicability) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  const { files, missing } = conventionFilesForApplicability(discoveredFiles, applicability);
  if (missing.length > 0) {
    return (
      '===== Convention v8 JSON =====\n' +
      'Convention evidence incomplete; missing records: ' +
      missing.join(', ') +
      '.\n'
    );
  }
  const sections = await readBatches(files, {
    batchSize: concurrency,
    maxChars,
    read: async (relativePath) => {
    const portablePath = resolveConventionPath(specsRoot, relativePath, platform);
    const contents = await readSourceFile(
      'conventions/specs/' + relativePath,
      portablePath,
      { readFileContents, inspectFile, validateSymlinks: true },
    );
      const normalizedPath = normalizeConventionPath(relativePath);
      return formatSourceSection('conventions/specs/' + normalizedPath, contents);
    },
  });
  return '===== Convention v8 JSON =====\n' + sections.join('\n') + '\n';
}
