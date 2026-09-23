import path from 'node:path';

export function resolveInventoryPath(rootPath, relativePath, pathApi) {
  const portablePath = relativePath.replaceAll('\\', '/');
  if (path.posix.isAbsolute(portablePath) || path.win32.isAbsolute(portablePath) || /^(?:\\\\|\/\/)/u.test(portablePath))
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  const portableRelative = pathApi.normalize(portablePath).replaceAll('\\', '/');
  if (portableRelative === '..' || portableRelative.startsWith('../'))
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  return pathApi.resolve(rootPath, portableRelative);
}

export function selectInventoryFiles(root, inventory, pathApi, isIncludedContent) {
  const rootPath = pathApi.resolve(root);
  for (const relativePath of inventory) if (typeof relativePath !== 'string') throw new Error('Inventory paths must be strings');
  return inventory.map((relativePath) => relativePath.replaceAll('\\', '/')).map((relativePath) => {
    resolveInventoryPath(rootPath, relativePath, pathApi);
    return relativePath;
  }).filter((relativePath) => !isIncludedContent(relativePath)).sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}
