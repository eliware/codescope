import path from "node:path";

export function resolveInventoryPath(rootPath, relativePath, pathApi) {
  const portablePath = pathApi.sep === "\\" ? relativePath.replaceAll("\\", "/") : relativePath;
  if (
    path.posix.isAbsolute(portablePath) ||
    path.win32.isAbsolute(portablePath) ||
    /^(?:\\\\|\/\/)/u.test(portablePath)
  )
    throw new Error(`Inventory path escapes repository root: ${relativePath}`);
  const portableRelative = pathApi.normalize(portablePath);
  const resolvedPath = pathApi.resolve(rootPath, portableRelative);
  const resolvedRelative = pathApi.relative(rootPath, resolvedPath);
  if (
    resolvedRelative === ".." ||
    resolvedRelative.startsWith(`..${pathApi.sep}`) ||
    pathApi.isAbsolute(resolvedRelative)
  )
    throw new Error(`Inventory path escapes repository root: ${relativePath}`);
  return resolvedPath;
}

export function selectInventoryFiles(root, inventory, pathApi, isIncludedContent) {
  const rootPath = pathApi.resolve(root);
  for (const relativePath of inventory)
    if (typeof relativePath !== "string") throw new Error("Inventory paths must be strings");
  return inventory
    .map((relativePath) =>
      pathApi.sep === "\\" ? relativePath.replaceAll("\\", "/") : relativePath,
    )
    .map((relativePath) => {
      resolveInventoryPath(rootPath, relativePath, pathApi);
      return relativePath;
    })
    .filter((relativePath) => !isIncludedContent(relativePath))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}
