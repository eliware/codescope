import { combinePackageJson } from './package-json.mjs';
import { combineJsonFiles } from './json.mjs';
import { combineConventionFiles } from './conventions.mjs';
import { combineConfigFiles } from './configs.mjs';

export async function collectMetadataSections(root, options, inventory) {
  return {
    packageJson: await combinePackageJson(root, options),
    json: await combineJsonFiles(root, options),
    conventions: await combineConventionFiles(root, options),
    configs: await combineConfigFiles(root, { ...options, inventory }),
  };
}
