import { isSafeProfileName } from "./is-safe-profile-name.mjs";

export function selectTestSpecFiles(discoveredFiles, applicability) {
  const { profiles, canonicalPaths } = applicability;
  const selectedPaths = [...profiles]
    .map((profile) => canonicalPaths.get(profile))
    .filter((candidate) => typeof candidate === "string")
    .map(normalizeSeparators);
  const discovered = new Set(discoveredFiles.map(normalizeSeparators));
  const files = selectedPaths.filter((file) => discovered.has(file));
  const supplied = new Set(files.map(normalizeSeparators));
  const missingProfiles = [...profiles].filter((profile) => {
    const candidate = canonicalPaths.get(profile);
    return typeof candidate !== "string" || !supplied.has(normalizeSeparators(candidate));
  });
  const excludedProfiles = discoveredFiles
    .filter((file) => isSemanticFile(file))
    .map((file) => file.slice(0, -"-semantic.yaml".length))
    .filter((profile) => isSafeProfileName(profile) && !profiles.has(profile))
    .sort();
  return { files, missing: missingProfiles, excludedProfiles };
}

function isSemanticFile(file) {
  return !file.includes("/") && file.endsWith("-semantic.yaml");
}

function normalizeSeparators(file) {
  return String(file).replaceAll("\\", "/");
}
