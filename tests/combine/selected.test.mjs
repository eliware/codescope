import { combineSelectedFiles } from "../../src/combine/selected.mjs";
import { extractTestSpecPromptContext } from "../../src/test-specs/prompt-context.mjs";

test("combines selected implementation, tests, and docs in order", async () => {
  const options = {
    readDirectory: async () => [],
    readFileContents: async () => "",
    readPackageJson: async () => '{"name":"@eliware/test"}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    combinePackageJson: undefined,
  };
  const result = await combineSelectedFiles("/repo", {
    ...options,
    implementation: true,
    tests: true,
    docs: true,
  });
  expect(result).toContain("package.json");
  expect(result).toContain("===== other files (names and sizes only) =====");
});

test("includes applied adjacent Test records in selected profile context", async () => {
  const result = await combineSelectedFiles("/repo", {
    inventory: [],
    testRoot: "/test12",
    platform: "linux",
    readPackageJson: async () => JSON.stringify({ eliware: { apply: ["general"] } }),
    readDirectory: async (directory) =>
      directory === "/test12/specs/conventions"
        ? [{ name: "general-semantic.yaml", isFile: () => true }]
        : [],
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readFileContents: async () =>
      'directives:\n  - id: E-0.1\n    dos:\n      - "required: selected profile contract"',
  });
  const { instructions } = extractTestSpecPromptContext(result);
  expect(instructions).toContain("required: selected profile contract");
  expect(instructions).toContain("id: E-0.1");
});

test("budgets selected evidence before a bounded inventory", async () => {
  const inventory = [
    "src/selected.mjs",
    ...Array.from({ length: 20 }, (_, index) => `notes/${index}.txt`),
  ];
  const result = await combineSelectedFiles("/repo", {
    inventory,
    implementation: true,
    maxChars: 300,
    readDirectory: async () => [],
    readPackageJson: async () => '{"name":"@eliware/test"}',
    readFileContents: async (file) => (file.endsWith("selected.mjs") ? "selected source" : "{}"),
    readOtherFileContents: async () => ({ data: Buffer.from("note"), truncated: false }),
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });

  expect(result).toContain("===== src/selected.mjs =====");
  expect(result).toContain("selected source");
  expect(result).toContain("inventory truncated");
  expect(result.length).toBeLessThanOrEqual(300);
});

test("keeps metadata and selected source within budget when inventory cannot fit", async () => {
  const result = await combineSelectedFiles("/repo", {
    inventory: ["src/selected.mjs", "notes/large.txt"],
    implementation: true,
    maxChars: 160,
    readDirectory: async () => [],
    readPackageJson: async () => '{"name":"@eliware/test"}',
    readFileContents: async () => "selected source",
    readOtherFileContents: async () => ({ data: Buffer.from("note"), truncated: false }),
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });

  expect(result).toContain("===== package.json =====");
  expect(result).toContain("===== src/selected.mjs =====");
  expect(result).not.toContain("===== other files (names and sizes only) =====");
  expect(result.length).toBeLessThanOrEqual(160);
});

test("uses the host platform when it is not supplied", async () => {
  await expect(
    combineSelectedFiles(process.cwd(), {
      inventory: [],
      readPackageJson: async () => JSON.stringify({ name: "@eliware/test" }),
      readDirectory: async () => [],
      readFileContents: async () => "",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toContain("package.json");
});

test("uses default options at the public selected-content boundary", async () => {
  await expect(combineSelectedFiles(process.cwd())).resolves.toContain("package.json");
});
