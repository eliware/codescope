import { selectTestSpecFiles } from "../../../src/combine/test-specs/selection.mjs";

test("selects package-applied semantic and deterministic specs", () => {
  const applicability = {
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", ["general-semantic.yaml", "general-deterministic.yaml"]],
      ["cli", ["cli-semantic.yaml", "cli-deterministic.yaml"]],
    ]),
  };
  const discovered = [
    "cli-semantic.yaml",
    "cli-deterministic.yaml",
    "general-semantic.yaml",
    "general-deterministic.yaml",
    "private-semantic.yaml",
    "nested/profile-semantic.yaml",
    "README.md",
  ];
  const selected = selectTestSpecFiles(discovered, applicability);
  expect(selected).toEqual({
    files: [
      "general-semantic.yaml",
      "general-deterministic.yaml",
      "cli-semantic.yaml",
      "cli-deterministic.yaml",
    ],
    missing: [],
    excludedProfiles: ["private"],
  });
});

test("reports missing semantic or deterministic files", () => {
  const applicability = {
    profiles: new Set(["general"]),
    canonicalPaths: new Map([
      ["general", ["general-semantic.yaml", "general-deterministic.yaml"]],
    ]),
  };
  expect(selectTestSpecFiles(["general-semantic.yaml"], applicability)).toEqual({
    files: ["general-semantic.yaml"],
    missing: ["general-deterministic.yaml"],
    excludedProfiles: [],
  });
});

test("reports unknown and unmapped profile files", () => {
  const applicability = {
    profiles: new Set(["unsupported", "unmapped"]),
    canonicalPaths: new Map([
      ["unsupported", ["unsupported-semantic.yaml", "unsupported-deterministic.yaml"]],
    ]),
  };
  expect(selectTestSpecFiles(["general-semantic.yaml"], applicability)).toEqual({
    files: [],
    missing: [
      "unsupported-semantic.yaml",
      "unsupported-deterministic.yaml",
      "unmapped-semantic.yaml",
      "unmapped-deterministic.yaml",
    ],
    excludedProfiles: ["general"],
  });
});

test("requires the exact canonical case for applied files", () => {
  const applicability = {
    profiles: new Set(["cli"]),
    canonicalPaths: new Map([[
      "cli",
      ["cli-semantic.yaml", "cli-deterministic.yaml"],
    ]]),
  };
  expect(selectTestSpecFiles(["CLI-semantic.yaml", "CLI-deterministic.yaml"], applicability)).toEqual({
    files: [],
    missing: ["cli-semantic.yaml", "cli-deterministic.yaml"],
    excludedProfiles: [],
  });
  expect(
    selectTestSpecFiles(
      ["cli-semantic.yaml", "cli-deterministic.yaml", "cli-semantic.yaml"],
      applicability,
    ),
  ).toEqual({
    files: ["cli-semantic.yaml", "cli-deterministic.yaml"],
    missing: [],
    excludedProfiles: [],
  });
});
