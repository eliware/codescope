import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function readConventionApplicability(root, { conventionsRoot, readPackageJson = readFile, readFileContents = readFile, readConventionManifest, platform = process.platform } = {}) {
  try {
    const pathApi = platform === 'win32' ? path.win32 : path.posix;
    const packageJson = JSON.parse(await readPackageJson(pathApi.join(root, 'package.json'), 'utf8'));
    if (packageJson.name === '@eliware/test') return { profiles: new Set(), canonicalPaths: new Map(), includeAll: true };
    const apply = packageJson.eliware?.conventions?.apply;
    if (!Array.isArray(apply) || !apply.every((name) => typeof name === 'string')) return null;
    const manifestReader = readConventionManifest ?? readFileContents;
    const repositoryTypes = JSON.parse(await manifestReader(pathApi.join(conventionsRoot, 'specs', 'conventions.json'), 'utf8')).repositoryTypes;
    const canonicalPaths = new Map();
    for (const name of apply) {
      if (!Object.hasOwn(repositoryTypes, name)) return null;
      const declaredPath = String(repositoryTypes[name]).replaceAll('\\', '/');
      const specsIndex = declaredPath.lastIndexOf('/specs/');
      canonicalPaths.set(name, specsIndex >= 0 ? declaredPath.slice(specsIndex + '/specs/'.length) : path.posix.basename(declaredPath));
    }
    return { profiles: new Set(apply), canonicalPaths, includeAll: false };
  } catch { return null; }
}
