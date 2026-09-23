import path from 'node:path';

export function resolveJsonPath(rootPath, relativePath, pathApi = path) {
  const portablePath = String(relativePath).replaceAll('\\', '/');
  if (
    path.posix.isAbsolute(portablePath) ||
    path.win32.isAbsolute(portablePath) ||
    /^(?:\\\\|\/\/)/u.test(portablePath)
  ) throw new Error(`JSON path escapes review root: ${relativePath}`);
  const normalizedPath = pathApi.normalize(portablePath).replaceAll('\\', '/');
  if (normalizedPath === '..' || normalizedPath.startsWith('../'))
    throw new Error(`JSON path escapes review root: ${relativePath}`);
  return pathApi.resolve(rootPath, ...normalizedPath.split('/'));
}
