import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied Test records and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.json"],
      ["cli", "cli.json"],
    ]),
  };
  expect(selectTestSpecFiles(["general.json", "cli.json", "private.json"], applicability)).toEqual({
    files: ["cli.json", "general.json"],
    missing: [],
  });
  expect(selectTestSpecFiles(["general.json"], applicability)).toEqual({
    files: ["general.json"],
    missing: ["cli"],
  });
});

test("reports unknown and unmapped profile names", () => {
  const applicability = {
    profiles: new Set(["unsupported", "unmapped"]),
    canonicalPaths: new Map([["unsupported", "unsupported.json"]]),
  };
  expect(selectTestSpecFiles(["general.json"], applicability)).toEqual({
    files: [],
    missing: ["unsupported", "unmapped"],
  });
});
