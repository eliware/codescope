import { isSafeProfileName } from "./is-safe-profile-name.mjs";

export function selectTestSpecFiles(discoveredFiles, applicability) {
  const { profiles, canonicalPaths } = applicability;
  const selectedPaths = [...profiles]
    .flatMap((profile) =>
      canonicalPaths.get(profile) ?? [
        `${profile}-semantic.yaml`,
        `${profile}-deterministic.yaml`,
      ],
    )
    .map(normalizeSeparators);
  const discovered = new Set(discoveredFiles.map(normalizeSeparators));
  const files = selectedPaths.filter((file) => discovered.has(file));
  const missing = selectedPaths.filter((file) => !discovered.has(file));
  const excludedProfiles = discoveredFiles
    .filter((file) => isSemanticFile(file))
    .map((file) => file.slice(0, -"-semantic.yaml".length))
    .filter((profile) => isSafeProfileName(profile) && !profiles.has(profile))
    .sort();
  return { files, missing, excludedProfiles };
}

function isSemanticFile(file) {
  return !file.includes("/") && file.endsWith("-semantic.yaml");
}

function normalizeSeparators(file) {
  return String(file).replaceAll("\\", "/");
}
