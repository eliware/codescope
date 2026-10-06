import path from "node:path";

const CONTENT_EXTENSIONS = [".json", ".yaml", ".yml", ".md", ".js", ".mjs", ".cjs", ".ts"];

export function isAbsolutePortablePath(relativePath) {
  return (
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    /^(?:\\\\|\/\/)/u.test(relativePath)
  );
}

export function resolveConfigPath(root, relativePath, platform = process.platform) {
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  const portable = platform === "win32" ? relativePath.replaceAll("/", "\\") : relativePath;
  const normalized = pathApi.normalize(portable);
  if (normalized === ".." || normalized.startsWith("../"))
    throw new Error(`Configuration path escapes review root: ${relativePath}`);
  if (platform === "win32" && normalized.startsWith("..\\"))
    throw new Error(`Configuration path escapes review root: ${relativePath}`);
  return pathApi.resolve(root, normalized);
}

export function selectConfigFiles(inventory, platform = process.platform) {
  return inventory
    .map((relativePath) =>
      platform === "win32" ? relativePath.replaceAll("\\", "/") : relativePath,
    )
    .filter((relativePath) => {
      const normalized = relativePath.toLowerCase();
      const isCollectedElsewhere = CONTENT_EXTENSIONS.some((extension) =>
        normalized.endsWith(extension),
      );
      return (
        !isCollectedElsewhere &&
        (normalized.startsWith(".github/") || normalized.startsWith(".knit/"))
      );
    });
}
