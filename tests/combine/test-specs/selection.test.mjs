import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied Test records and reports missing profiles", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.json"],
      ["cli", "cli.json"],
    ]),
  };
  expect(selectTestSpecFiles(["cli.json", "general.json", "private.json"], applicability)).toEqual({
    files: ["cli.json", "general.json"],
    missing: [],
  });
  expect(selectTestSpecFiles(["general.json", "cli.json"], applicability).files).toEqual([
    "cli.json",
    "general.json",
  ]);
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

test("orders case variants deterministically after normalized profile paths", () => {
  const applicability = {
    profiles: new Set(["cli"]),
    canonicalPaths: new Map([["cli", "cli.json"]]),
  };
  expect(selectTestSpecFiles(["cli.json", "CLI.json"], applicability).files).toEqual([
    "CLI.json",
    "cli.json",
  ]);
  expect(selectTestSpecFiles(["CLI.json", "cli.json"], applicability).files).toEqual([
    "CLI.json",
    "cli.json",
  ]);
  expect(selectTestSpecFiles(["cli.json", "cli.json"], applicability).files).toEqual([
    "cli.json",
    "cli.json",
  ]);
});
