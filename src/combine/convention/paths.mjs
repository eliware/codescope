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

export function conventionFilesForApplicability(discoveredFiles, applicability, canonicalRecords) {
  const { includeAll = false, profiles, canonicalPaths } = applicability;
  if (includeAll) {
    const expected = canonicalRecords ?? [];
    const supplied = new Set(discoveredFiles.map(normalizeConventionPath));
    const files = expected
      .filter((file) => supplied.has(normalizeConventionPath(file)))
      .sort((left, right) => normalizeConventionPath(left).localeCompare(normalizeConventionPath(right), 'en', { sensitivity: 'variant' }));
    return {
      files,
      missing: canonicalRecords
        ? expected.filter((file) => !supplied.has(normalizeConventionPath(file)))
        : ['specs/README.md (canonical directive index)'],
    };
  }
  const selectedPaths = [...profiles]
    .map((profile) => canonicalPaths.get(profile))
    .filter((candidate) => typeof candidate === 'string');
  const files = discoveredFiles.filter((file) => {
    const normalized = normalizeConventionPath(file);
    return selectedPaths.some((candidate) => normalizeConventionPath(candidate) === normalized);
  }).sort((left, right) => normalizeConventionPath(left).localeCompare(normalizeConventionPath(right), 'en', { sensitivity: 'variant' }));
  const supplied = new Set(files.map(normalizeConventionPath));
  const missingProfiles = [...profiles].filter((profile) => {
    const candidate = canonicalPaths.get(profile);
    return typeof candidate !== 'string' || !supplied.has(normalizeConventionPath(candidate));
  });
  return { files, missing: missingProfiles };
}
