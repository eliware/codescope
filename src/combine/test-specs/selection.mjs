export function selectTestSpecFiles(discoveredFiles, applicability) {
  const { profiles, canonicalPaths } = applicability;
  const selectedPaths = [...profiles]
    .map((profile) => canonicalPaths.get(profile))
    .filter((candidate) => typeof candidate === "string")
    .map(normalizeSeparators);
  const files = discoveredFiles
    .filter((file) => selectedPaths.includes(normalizeSeparators(file)))
    .sort((left, right) => {
      const normalizedLeft = normalizeSeparators(left);
      const normalizedRight = normalizeSeparators(right);
      if (normalizedLeft !== normalizedRight) return normalizedLeft < normalizedRight ? -1 : 1;
      return 0;
    });
  const supplied = new Set(files.map(normalizeSeparators));
  const missingProfiles = [...profiles].filter((profile) => {
    const candidate = canonicalPaths.get(profile);
    return typeof candidate !== "string" || !supplied.has(normalizeSeparators(candidate));
  });
  return { files, missing: missingProfiles };
}

function normalizeSeparators(file) {
  return String(file).replaceAll("\\", "/");
}
