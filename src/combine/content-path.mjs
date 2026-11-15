export function isGeneratedArtifactPath(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/").toLowerCase();
  return normalized.split("/").some((segment) => segment === "dist" || segment === "artifacts");
}
