import { combinePackageJson } from "./package-json.mjs";
import { combineJsonFiles } from "./json.mjs";
import { combineTestSpecs } from "./test-specs.mjs";
import { combineConfigFiles } from "./configs.mjs";
import { combineYamlFiles } from "./yaml.mjs";
import { createSectionBudget } from "./section-budget.mjs";

export async function collectMetadataSections(root, options, inventory) {
  const sections = {};
  const budget = createSectionBudget(0, options.maxChars ?? Number.POSITIVE_INFINITY);
  const collect = async (name, load) => {
    sections[name] = await budget.read((maxChars) => load({ ...options, maxChars }));
  };
  await collect("packageJson", combinePackageJson.bind(null, root));
  await collect("testSpecs", combineTestSpecs.bind(null, root));
  await collect("json", combineJsonFiles.bind(null, root));
  await collect("yaml", (sectionOptions) =>
    combineYamlFiles(root, { ...sectionOptions, files: inventory }),
  );
  await collect("configs", (sectionOptions) =>
    combineConfigFiles(root, { ...sectionOptions, inventory }),
  );
  return sections;
}
