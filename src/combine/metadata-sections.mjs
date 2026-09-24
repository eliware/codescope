import { combinePackageJson } from "./package-json.mjs";
import { combineJsonFiles } from "./json.mjs";
import { combineTestSpecs } from "./test-specs.mjs";
import { combineConfigFiles } from "./configs.mjs";

export async function collectMetadataSections(root, options, inventory) {
  return {
    packageJson: await combinePackageJson(root, options),
    json: await combineJsonFiles(root, options),
    testSpecs: await combineTestSpecs(root, options),
    configs: await combineConfigFiles(root, { ...options, inventory }),
  };
}
