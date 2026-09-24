import { selectConventionFiles } from "../../../src/combine/convention/selection.mjs";

test("selects package-applied records and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.json"],
      ["cli", "cli.json"],
    ]),
  };

  const discovered = ["general.json", "cli.json", "private.json"];
  const selected = selectConventionFiles(discovered, applicability);
  expect(selected).toEqual({ files: ["cli.json", "general.json"], missing: [] });
  const incomplete = selectConventionFiles(["general.json"], applicability);
  expect(incomplete).toEqual({ files: ["general.json"], missing: ["cli"] });
});

test("reports unknown and unmapped profile names", () => {
  const applicability = {
    profiles: new Set(["unsupported", "unmapped"]),
    canonicalPaths: new Map([["unsupported", "unsupported.json"]]),
  };
  const selection = selectConventionFiles(["general.json"], applicability);
  expect(selection).toEqual({ files: [], missing: ["unsupported", "unmapped"] });
});

test("selects indexed records and reports missing entries", () => {
  const files = ["cli.json", "general.json", "unrelated.json"];
  const applicability = { includeAll: true, profiles: new Set(), canonicalPaths: new Map() };
  const indexedFiles = ["cli.json", "general.json", "private.json"];
  const selection = selectConventionFiles(files, applicability, indexedFiles);
  expect(selection).toEqual({ files: ["cli.json", "general.json"], missing: ["private.json"] });
});

test("reports a missing canonical index", () => {
  const applicability = { includeAll: true, profiles: new Set(), canonicalPaths: new Map() };
  const selection = selectConventionFiles(["unrelated.json"], applicability);
  expect(selection).toEqual({
    files: [],
    missing: ["specs/README.md (canonical directive index)"],
  });
});
