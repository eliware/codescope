import path from "node:path";

export function normalizeTestSpecPath(relativePath) {
  return String(relativePath).replaceAll("\\", "/").toLowerCase();
}

export function resolveTestSpecPath(specsRoot, relativePath, platform = process.platform) {
  const portable = String(relativePath).replaceAll("\\", "/");
  const normalized = path.posix.normalize(portable);
  if (normalized === ".." || normalized.startsWith("../"))
    throw new Error(`Test-spec path escapes specs root: ${relativePath}`);
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  return pathApi.resolve(specsRoot, ...normalized.split("/"));
}
