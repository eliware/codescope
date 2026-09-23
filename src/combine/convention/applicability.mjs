import { readFile } from 'node:fs/promises';
export async function readConventionApplicability(root, { readPackageJson = readFile } = {}) {
  try {
    const packageJson = JSON.parse(await readPackageJson(`${root}/package.json`, 'utf8'));
    const apply = packageJson.eliware?.apply;
    if (!Array.isArray(apply) || !apply.every((name) => typeof name === 'string')) return null;
    return {
      includeAll: packageJson.name === '@eliware/test',
      profiles: new Set(apply),
      canonicalPaths: new Map(apply.map((name) => [name, `${name}.json`])),
    };
  } catch { return null; }
}
