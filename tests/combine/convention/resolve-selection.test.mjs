import { resolveConventionSelection } from "../../../src/combine/convention/resolve-selection.mjs";

test("selects package-applied records without reading the canonical index", async () => {
  const selection = await resolveConventionSelection(
    { specsRoot: "/conventions/specs", files: ["general.json", "cli.json"] },
    {
      includeAll: false,
      profiles: new Set(["cli"]),
      canonicalPaths: new Map([["cli", "cli.json"]]),
    },
    {
      readFileContents: async () => {
        throw new Error("index must not be read");
      },
    },
  );

  expect(selection).toEqual({ files: ["cli.json"], missing: [] });
});

test("uses empty selection options by default", async () => {
  await expect(
    resolveConventionSelection(
      { specsRoot: "/conventions/specs", files: ["general.json"] },
      { includeAll: false, profiles: new Set(), canonicalPaths: new Map() },
    ),
  ).resolves.toEqual({ files: [], missing: [] });
});

test("selects indexed records for eliware-test and reports missing index entries", async () => {
  const selection = await resolveConventionSelection(
    { specsRoot: "/conventions/specs", files: ["general.json"] },
    { includeAll: true, profiles: new Set(), canonicalPaths: new Map() },
    {
      readFileContents: async () => "- [general.json](general.json)\n- [cli.json](cli.json)\n",
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
      platform: "linux",
    },
  );

  expect(selection).toEqual({ files: ["general.json"], missing: ["cli.json"] });
});
