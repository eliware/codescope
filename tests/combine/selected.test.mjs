import { combineSelectedFiles } from "../../src/combine/selected.mjs";

test("combines selected implementation, tests, and docs in order", async () => {
  const options = {
    readDirectory: async () => [],
    readFileContents: async () => "",
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

test("uses default options for selected package metadata", async () => {
  await expect(combineSelectedFiles(process.cwd())).resolves.toContain("package.json");
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
