import path from "node:path";
import { combineTestSpecs } from "../../src/combine/test-specs.mjs";
import { extractTestSpecPromptContext } from "../../src/test-specs/prompt-context.mjs";

const regularFile = async () => ({ isFile: () => true, isSymbolicLink: () => false });

test("includes selected semantic specs and omits deterministic specs", async () => {
  const root = "/workspace/project";
  const testRoot = "/workspace/test";
  const packageJson = JSON.stringify({ eliware: { apply: ["general", "cli"] } });
  const records = {
    "general-semantic.yaml":
      'version: "15.0"\ndirectives:\n  - id: E-0.1\n    dos:\n      - General test rule\n    examples:\n      - purpose: preserved test example',
    "general-deterministic.yaml": "must_not_be_included: true",
    "cli-semantic.yaml":
      'version: "15.0"\ndirectives:\n  - id: E-0.2\n    donts:\n      - CLI test prohibition',
    "web-semantic.yaml":
      'version: "15.0"\ndirectives:\n  - id: E-0.3\n    dos:\n      - Web test rule',
  };
  const directories = {
    [`${testRoot}/specs/conventions`]: Object.keys(records).map((name) => ({
      name,
      isFile: () => true,
    })),
  };
  const result = await combineTestSpecs(root, {
    testRoot,
    platform: "linux",
    readPackageJson: async () => packageJson,
    readDirectory: async (directory) => directories[directory] ?? [],
    inspectFile: regularFile,
    readFileContents: async (file) => records[path.posix.basename(file)],
  });
  const context = extractTestSpecPromptContext(result);
  expect(context.instructions).toContain(
    "This repository applies general and cli and does not apply web.",
  );
  expect(context.instructions).toContain("General test rule");
  expect(context.instructions).toContain("purpose: preserved test example");
  expect(context.instructions).toContain("CLI test prohibition");
  expect(context.instructions).not.toContain("Web test rule");
  expect(context.instructions).not.toContain("must_not_be_included");
  expect(context.combined).not.toContain("General test rule");
});

test("uses the adjacent test checkout by default", async () => {
  const directoriesRead = [];
  const root = "/workspace/codescope";
  const result = await combineTestSpecs(root, {
    platform: "linux",
    readPackageJson: async () => JSON.stringify({ eliware: { apply: ["general"] } }),
    readDirectory: async (directory) => {
      directoriesRead.push(directory);
      return directory === "/workspace/test/specs/conventions"
        ? [{ name: "general-semantic.yaml", isFile: () => true }]
        : [];
    },
    inspectFile: regularFile,
    readFileContents: async () => "version: 13\nsource: test",
  });
  expect(result).toContain("source: test");
  expect(directoriesRead).toContain("/workspace/test/specs/conventions");
});

test("reports selected profiles missing from the supplied specifications", async () => {
  await expect(
    combineTestSpecs("/repo", {
      platform: "linux",
      testRoot: "/test",
      readPackageJson: async () => JSON.stringify({ eliware: { apply: ["application"] } }),
      readDirectory: async () => [],
      inspectFile: regularFile,
    }),
  ).resolves.toContain("Convention contents are incomplete. Missing application");
});

test("does not load separate specs for the Eliware Test repository", async () => {
  let discovered = false;
  await expect(
    combineTestSpecs("/repo", {
      readPackageJson: async () =>
        JSON.stringify({ name: "@eliware/test", eliware: { apply: ["not-required"] } }),
      readDirectory: async () => {
        discovered = true;
        return [];
      },
    }),
  ).resolves.toBe("");
  expect(discovered).toBe(false);
});

test("rejects invalid read concurrency before reading applicability", async () => {
  await expect(combineTestSpecs("repo", { concurrency: 0 })).rejects.toThrow(/positive integer/);
});

test("reports an unavailable checkout when its root is missing", async () => {
  await expect(
    combineTestSpecs("/repo", {
      platform: "linux",
      readPackageJson: async () => JSON.stringify({ eliware: { apply: [] } }),
      inspectRoot: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    }),
  ).resolves.toContain("Adjacent eliware/test checkout is not supplied");
});

test("reports package applicability errors from injected readers", async () => {
  await expect(
    combineTestSpecs("/repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("permission denied"), { code: "EACCES" });
      },
    }),
  ).resolves.toContain("Test-spec applicability unavailable: package.json could not be read");
  await expect(combineTestSpecs("/repo", { readPackageJson: async () => "{}" })).resolves.toContain(
    "Test-spec applicability invalid:",
  );
});

test("returns no separate convention content when the package file is missing", async () => {
  await expect(
    combineTestSpecs("/missing", {
      readPackageJson: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    }),
  ).resolves.toContain("Test-spec applicability unavailable");
});

test("uses default readers when options are omitted", async () => {
  await expect(
    combineTestSpecs(path.join(process.cwd(), "test-fixtures", "missing-root")),
  ).resolves.toContain("Test-spec applicability unavailable");
});
