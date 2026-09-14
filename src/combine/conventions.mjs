import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { readSourceFile } from './read-file.mjs';
import { formatSourceSection } from './section-format.mjs';
import { readBatches } from './batches.mjs';

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
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Convention read concurrency must be a positive integer');
  const specsRoot = path.join(conventionsRoot, 'specs');
  let discoveredFiles;
  try {
    discoveredFiles = await findFiles(specsRoot, '.json', { readDirectory });
  } catch (cause) {
    if (cause?.code === 'ENOENT')
      return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
    throw new Error(
      `Unable to discover convention evidence: ${String(cause)}`,
      { cause },
    );
  }
  const applicability = await readConventionApplicability(root, {
    conventionsRoot,
    readPackageJson,
    readConventionManifest,
  });
  if (!applicability) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  const { profiles, canonicalPaths, includeAll } = applicability;
  const files = includeAll
    ? discoveredFiles
    : discoveredFiles.filter((relativePath) => {
      const normalized = normalizeConventionPath(relativePath);
      return [...canonicalPaths.values()].some((canonicalPath) =>
        normalizeConventionPath(canonicalPath) === normalized,
      );
    });
  const supplied = new Set(files.map(normalizeConventionPath));
  const missing = includeAll
    ? []
    : [...profiles].filter((profile) => !supplied.has(normalizeConventionPath(canonicalPaths.get(profile))));
  if (missing.length > 0) {
    return (
      '===== Convention v8 JSON =====\n' +
      'Convention evidence incomplete; missing applied profiles: ' +
      missing.join(', ') +
      '.\n'
    );
  }
  const sections = await readBatches(files, {
    batchSize: concurrency,
    maxChars,
    read: async (relativePath) => {
    const portablePath = resolveConventionPath(specsRoot, relativePath);
    const contents = await readSourceFile(
      'conventions/specs/' + relativePath,
      portablePath,
      { readFileContents, inspectFile, validateSymlinks: true },
    );
      return formatSourceSection('conventions/specs/' + relativePath, contents);
    },
  });
  return '===== Convention v8 JSON =====\n' + sections.join('\n') + '\n';
}

export function resolveConventionPath(specsRoot, relativePath) {
  const portable = String(relativePath).replaceAll('\\', '/');
  const normalized = path.posix.normalize(portable);
  if (normalized === '..' || normalized.startsWith('../'))
    throw new Error(`Convention path escapes specs root: ${relativePath}`);
  return path.resolve(specsRoot, ...normalized.split('/'));
}

function normalizeConventionPath(relativePath) {
  return String(relativePath).replaceAll('\\', '/').toLowerCase();
}

async function readConventionApplicability(
  root,
  { conventionsRoot, readPackageJson = readFile, readConventionManifest } = {},
) {
  try {
    const packageJson = JSON.parse(
      await readPackageJson(path.join(root, 'package.json'), 'utf8'),
    );
    if (packageJson.name === '@eliware/test')
      return { profiles: new Set(), canonicalPaths: new Map(), includeAll: true };
    const apply = packageJson.eliware?.conventions?.apply;
    if (!Array.isArray(apply) || !apply.every((name) => typeof name === 'string')) return null;
    const repositoryTypes = readConventionManifest
      ? JSON.parse(await readConventionManifest(path.join(conventionsRoot, 'specs', 'conventions.json'), 'utf8')).repositoryTypes
      : Object.fromEntries(apply.map((name) => [name, `${name}.json`]));
    const canonicalPaths = new Map();
    for (const name of apply) {
      if (!Object.hasOwn(repositoryTypes, name)) return null;
      const declaredPath = String(repositoryTypes[name]).replaceAll('\\', '/');
      const specsIndex = declaredPath.lastIndexOf('/specs/');
      const relativePath = specsIndex >= 0
        ? declaredPath.slice(specsIndex + '/specs/'.length)
        : path.posix.basename(declaredPath);
      canonicalPaths.set(name, relativePath);
    }
    return { profiles: new Set(apply), canonicalPaths };
  } catch {
    return null;
  }
}
