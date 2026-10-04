import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied Test records and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.yaml"],
      ["cli", "cli.yaml"],
    ]),
  };
  expect(selectTestSpecFiles(["cli.yaml", "general.yaml", "private.yaml"], applicability)).toEqual({
    files: ["cli.yaml", "general.yaml"],
    missing: [],
  });
  expect(selectTestSpecFiles(["general.yaml", "cli.yaml"], applicability).files).toEqual([
    "cli.yaml",
    "general.yaml",
  ]);
  expect(selectTestSpecFiles(["general.yaml"], applicability)).toEqual({
    files: ["general.yaml"],
    missing: ["cli"],
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
  });
  expect(selectTestSpecFiles(["CLI.yaml", "cli.yaml"], applicability)).toEqual({
    files: ["cli.yaml"],
    missing: [],
  });
  expect(selectTestSpecFiles(["cli.yaml", "cli.yaml"], applicability)).toEqual({
    files: ["cli.yaml", "cli.yaml"],
    missing: [],
  });
});
