import { combineSelectedFiles } from "../../src/combine/selected.mjs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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

test("includes applied adjacent Test records in selected profile context", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-selected-specs-"));
  const project = path.join(root, "project");
  const testRoot = path.join(root, "test");
  await mkdir(project);
  await mkdir(path.join(testRoot, "specs", "conventions"), { recursive: true });
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["general"] } }),
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "general.yaml"),
    "required: selected profile contract",
  );
  try {
    const result = await combineSelectedFiles(project, { inventory: [], testRoot });
    expect(result).toContain("test/specs/conventions/general.yaml");
    expect(result).toContain("required: selected profile contract");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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
