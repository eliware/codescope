import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { readConventionApplicability } from './convention/applicability.mjs';
import { conventionFilesForApplicability } from './convention/paths.mjs';
import { discoverConventionFiles } from './convention/discover.mjs';
import { readConventionRecords } from './convention/read-records.mjs';
export async function combineConventionFiles(
  root,
  {
    conventionsRoot = path.resolve(root, '..', 'conventions'),
    readDirectory,
    readFileContents = readFile,
    readPackageJson = readFileContents,
    inspectFile = lstat,
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Convention read concurrency must be a positive integer');
  const discovery = await discoverConventionFiles(conventionsRoot, { readDirectory, platform });
  if (!discovery) return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
  const applicability = await readConventionApplicability(root, {
    conventionsRoot,
    readPackageJson,
    readFileContents,
    platform,
  });
  if (!applicability) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  if (applicability.kind === 'invalid') {
    return `===== Convention v8 JSON =====\nConvention applicability invalid: ${applicability.reason}.\n`;
  }
  const { files, missing } = conventionFilesForApplicability(discovery.files, applicability);
  if (missing.length > 0) {
    return (
      '===== Convention v8 JSON =====\n' +
      'Convention evidence incomplete; missing records: ' +
      missing.join(', ') +
      '.\n'
    );
  }
  const sections = await readConventionRecords(discovery.specsRoot, files, {
    concurrency, maxChars, readFileContents, inspectFile, platform,
  });
  return '===== Convention v8 JSON =====\n' + sections.join('\n') + '\n';
}
