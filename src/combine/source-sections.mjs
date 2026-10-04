import { combineFiles } from "./files.mjs";
import { createSectionBudget } from "./section-budget.mjs";
import { joinCombinedSections } from "./combined-source.mjs";

export async function collectSourceSections(root, options, inventory, initialSections = []) {
  const maxChars = options.maxChars ?? Number.POSITIVE_INFINITY;
  const budget = createSectionBudget(joinCombinedSections(initialSections).length, maxChars);
  const sections = {};
  const collect = async (name, extensions, filters = {}) => {
    sections[name] = await budget.read((remaining) =>
      combineFiles(root, extensions, {
        ...options,
        ...filters,
        maxChars: remaining,
        files: inventory,
      }),
    );
  };
  await collect("md", ".md");
  await collect("implementation", [".js", ".mjs", ".cjs", ".ts"], { noTests: true });
  await collect("tests", [".js", ".mjs", ".cjs", ".ts"], { testsOnly: true });
  return sections;
}
