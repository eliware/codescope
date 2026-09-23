import path from 'node:path';

export function normalizeConventionPath(relativePath) {
  return String(relativePath).replaceAll('\\', '/').toLowerCase();
}

export function resolveConventionPath(specsRoot, relativePath, platform = process.platform) {
  const portable = String(relativePath).replaceAll('\\', '/');
  const normalized = path.posix.normalize(portable);
  if (normalized === '..' || normalized.startsWith('../'))
    throw new Error(`Convention path escapes specs root: ${relativePath}`);
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  return pathApi.resolve(specsRoot, ...normalized.split('/'));
}

export function conventionFilesForApplicability(discoveredFiles, applicability) {
  const { includeAll = false, profiles, canonicalPaths } = applicability;
  if (includeAll) {
    return {
      files: [...discoveredFiles].sort((left, right) => normalizeConventionPath(left).localeCompare(normalizeConventionPath(right), 'en', { sensitivity: 'variant' })),
      missing: [],
    };
  }
  const files = discoveredFiles.filter((file) => {
    const normalized = normalizeConventionPath(file);
    return [...canonicalPaths.values()].some((candidate) => normalizeConventionPath(candidate) === normalized);
  }).sort((left, right) => normalizeConventionPath(left).localeCompare(normalizeConventionPath(right), 'en', { sensitivity: 'variant' }));
  const supplied = new Set(files.map(normalizeConventionPath));
  const missingProfiles = [...profiles].filter((profile) => !supplied.has(normalizeConventionPath(canonicalPaths.get(profile))));
  return { files, missing: missingProfiles };
}
