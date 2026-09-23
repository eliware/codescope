import path from 'node:path';

export function isAbsolutePortablePath(relativePath) {
  return path.posix.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath) || /^(?:\\\\|\/\/)/u.test(relativePath);
}

export function resolveConfigPath(root, relativePath, platform = process.platform) {
  const portable = relativePath.replaceAll('\\', '/');
  const normalized = path.posix.normalize(portable);
  if (normalized === '..' || normalized.startsWith('../'))
    throw new Error(`Configuration path escapes review root: ${relativePath}`);
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  return pathApi.resolve(root, ...normalized.split('/'));
}

export function selectConfigFiles(inventory) {
  return inventory
    .map((relativePath) => relativePath.replaceAll('\\', '/'))
    .filter((relativePath) => {
      const normalized = relativePath.toLowerCase();
      return normalized.startsWith('.github/') || normalized.startsWith('.knit/');
    });
}
