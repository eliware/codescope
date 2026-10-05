import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied semantic specs and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general-semantic.yaml"],
      ["cli", "cli-semantic.yaml"],
    ]),
  };
  expect(
    selectTestSpecFiles(
      [
        "cli-semantic.yaml",
        "general-semantic.yaml",
        "general-deterministic.yaml",
        "private-semantic.yaml",
        "nested/profile-semantic.yaml",
        "README.md",
      ],
      applicability,
    ),
  ).toEqual({
    files: ["general-semantic.yaml", "cli-semantic.yaml"],
    missing: [],
    excludedProfiles: ["private"],
  });
  expect(
    selectTestSpecFiles(["general-semantic.yaml", "cli-semantic.yaml"], applicability).files,
  ).toEqual(["general-semantic.yaml", "cli-semantic.yaml"]);
  expect(selectTestSpecFiles(["general-semantic.yaml"], applicability)).toEqual({
    files: ["general-semantic.yaml"],
    missing: ["cli"],
    excludedProfiles: [],
  });
});

test("reports unknown and unmapped profile names", () => {
  const applicability = {
    profiles: new Set(["unsupported", "unmapped"]),
    canonicalPaths: new Map([["unsupported", "unsupported-semantic.yaml"]]),
  };
  expect(selectTestSpecFiles(["general-semantic.yaml"], applicability)).toEqual({
    files: [],
    missing: ["unsupported", "unmapped"],
    excludedProfiles: ["general"],
  });
});

test("requires the exact canonical case for applied profile records", () => {
  const applicability = {
    profiles: new Set(["cli"]),
    canonicalPaths: new Map([["cli", "cli-semantic.yaml"]]),
  };
  expect(selectTestSpecFiles(["CLI-semantic.yaml"], applicability)).toEqual({
    files: [],
    missing: ["cli"],
    excludedProfiles: [],
  });
  expect(selectTestSpecFiles(["CLI-semantic.yaml", "cli-semantic.yaml"], applicability)).toEqual({
    files: ["cli-semantic.yaml"],
    missing: [],
    excludedProfiles: [],
  });
  expect(selectTestSpecFiles(["cli-semantic.yaml", "cli-semantic.yaml"], applicability)).toEqual({
    files: ["cli-semantic.yaml"],
    missing: [],
    excludedProfiles: [],
  });
});
