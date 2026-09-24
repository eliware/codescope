import { findFiles } from "../../src/find/files.mjs";
import path from "node:path";

const file = (name) => ({ name, isFile: () => true });
const directory = (name) => ({ name, isDirectory: () => true });

test("walks eligible directories and applies file filters", async () => {
  const root = path.resolve("fixture-root");
  const tree = {
    [root]: [
      directory("z"),
      directory(".git"),
      directory("node_modules"),
      directory("coverage"),
      directory("src"),
      file("a.mjs"),
      file("guide.md"),
    ],
    [path.join(root, "z")]: [file("deep.mjs"), file("deep.test.mjs")],
    [path.join(root, "src")]: [directory("coverage")],
    [path.join(root, "src", "coverage")]: [file("legitimate.mjs")],
  };
  const readDirectory = async (directoryPath) => tree[directoryPath] ?? [];

  await expect(findFiles(root, ".mjs", { readDirectory })).resolves.toEqual([
    "a.mjs",
    "src/coverage/legitimate.mjs",
    "z/deep.mjs",
    "z/deep.test.mjs",
  ]);
  await expect(findFiles(root, ".mjs", { readDirectory, noTests: true })).resolves.toEqual([
    "a.mjs",
    "src/coverage/legitimate.mjs",
    "z/deep.mjs",
  ]);
  await expect(findFiles(root, ".mjs", { readDirectory, testsOnly: true })).resolves.toEqual([
    "z/deep.test.mjs",
  ]);
  await expect(findFiles(root, ".md", { readDirectory })).resolves.toEqual(["guide.md"]);
});

test("uses injected readers for virtual roots and defaults for real roots", async () => {
  await expect(
    findFiles("/virtual-root", ".mjs", { platform: "linux", readDirectory: async () => [] }),
  ).resolves.toEqual([]);
  await expect(findFiles(process.cwd(), ".mjs")).resolves.toContain("src/cli/main.mjs");
});

test("inspects and rejects symlinked roots", async () => {
  const inspected = [];
  const inspectRoot = async (root) => {
    inspected.push(root);
    return { isSymbolicLink: () => false, isDirectory: () => true };
  };
  await findFiles("/virtual-root", ".mjs", { readDirectory: async () => [], inspectRoot });
  expect(inspected).toEqual([path.resolve("/virtual-root")]);

  await expect(
    findFiles("fixture-root", ".mjs", {
      readDirectory: async () => [],
      inspectRoot: async () => ({ isSymbolicLink: () => true, isDirectory: () => true }),
    }),
  ).rejects.toThrow("symlinked scan roots");
});
