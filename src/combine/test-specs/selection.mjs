import { normalizeTestSpecPath } from "./paths.mjs";

export function selectTestSpecFiles(discoveredFiles, applicability) {
  const { profiles, canonicalPaths } = applicability;
  const selectedPaths = [...profiles]
    .map((profile) => canonicalPaths.get(profile))
    .filter((candidate) => typeof candidate === "string");
  const files = discoveredFiles
    .filter((file) => {
      const normalized = normalizeTestSpecPath(file);
      return selectedPaths.some((candidate) => normalizeTestSpecPath(candidate) === normalized);
    })
    .sort((left, right) => {
      const normalizedLeft = normalizeTestSpecPath(left);
      const normalizedRight = normalizeTestSpecPath(right);
      if (normalizedLeft !== normalizedRight) return normalizedLeft < normalizedRight ? -1 : 1;
      return left < right ? -1 : left > right ? 1 : 0;
    });
  const supplied = new Set(files.map(normalizeTestSpecPath));
  const missingProfiles = [...profiles].filter((profile) => {
    const candidate = canonicalPaths.get(profile);
    return typeof candidate !== "string" || !supplied.has(normalizeTestSpecPath(candidate));
  });
  return { files, missing: missingProfiles };
}
