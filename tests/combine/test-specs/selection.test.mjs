import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied Test records and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.yaml"],
      ["cli", "cli.yaml"],
    ]),
  };
  expect(
    selectTestSpecFiles(
      ["cli.yaml", "general.yaml", "private.yaml", "nested/profile.yaml", "README.md"],
      applicability,
    ),
  ).toEqual({
    files: ["cli.yaml", "general.yaml"],
    missing: [],
    excludedProfiles: ["private.yaml"],
  });
  expect(selectTestSpecFiles(["general.yaml", "cli.yaml"], applicability).files).toEqual([
    "cli.yaml",
    "general.yaml",
  ]);
  expect(selectTestSpecFiles(["general.yaml"], applicability)).toEqual({
    files: ["general.yaml"],
    missing: ["cli"],
    excludedProfiles: [],
  });
});

test("reports unknown and unmapped profile names", () => {
  const applicability = {
    profiles: new Set(["unsupported", "unmapped"]),
    canonicalPaths: new Map([["unsupported", "unsupported.yaml"]]),
  };
  expect(selectTestSpecFiles(["general.yaml"], applicability)).toEqual({
    files: [],
    missing: ["unsupported", "unmapped"],
    excludedProfiles: ["general.yaml"],
  });
});

test("requires the exact canonical case for applied profile records", () => {
  const applicability = {
    profiles: new Set(["cli"]),
    canonicalPaths: new Map([["cli", "cli.yaml"]]),
  };
  expect(selectTestSpecFiles(["CLI.yaml"], applicability)).toEqual({
    files: [],
    missing: ["cli"],
    excludedProfiles: ["CLI.yaml"],
  });
  expect(selectTestSpecFiles(["CLI.yaml", "cli.yaml"], applicability)).toEqual({
    files: ["cli.yaml"],
    missing: [],
    excludedProfiles: ["CLI.yaml"],
  });
  expect(selectTestSpecFiles(["cli.yaml", "cli.yaml"], applicability)).toEqual({
    files: ["cli.yaml", "cli.yaml"],
    missing: [],
    excludedProfiles: [],
  });
});
