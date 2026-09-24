import { combineFiles } from "../files.mjs";

export async function readSelectedSections({
  root,
  selection,
  options,
  inventory,
  budget,
  combine = combineFiles,
}) {
  const sections = [];
  const selected = [
    [selection.implementation, [".js", ".mjs", ".cjs", ".ts"], { noTests: true }],
    [selection.tests, [".js", ".mjs", ".cjs", ".ts"], { testsOnly: true }],
    [selection.docs, ".md", {}],
  ];
  for (const [enabled, extensions, filters] of selected) {
    if (!enabled) continue;
    sections.push(
      await budget.read((maxChars) =>
        combine(root, extensions, { ...options, ...filters, maxChars, files: inventory }),
      ),
    );
  }
  return sections;
}
