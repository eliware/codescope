import { readFile } from 'node:fs/promises';
export async function readConventionApplicability(root, { readPackageJson = readFile } = {}) {
  let contents;
  try {
    contents = await readPackageJson(`${root}/package.json`, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return null;
    return { kind: 'invalid', reason: 'package.json could not be read' };
  }

  let packageJson;
  try {
    packageJson = JSON.parse(contents);
  } catch {
    return { kind: 'invalid', reason: 'package.json is not valid JSON' };
  }
  if (!packageJson || typeof packageJson !== 'object' || Array.isArray(packageJson))
    return { kind: 'invalid', reason: 'package.json must contain an object' };

  const apply = packageJson.eliware?.apply;
  if (!Array.isArray(apply) || !apply.every((name) => typeof name === 'string'))
    return { kind: 'invalid', reason: 'package.json eliware.apply must be an array of strings' };
  return {
    kind: 'available',
    includeAll: packageJson.name === '@eliware/test',
    profiles: new Set(apply),
    canonicalPaths: new Map(apply.map((name) => [name, `${name}.json`])),
  };
}
