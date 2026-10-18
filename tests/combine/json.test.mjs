import { combineJsonFiles } from "../../src/combine/json.mjs";

const directories = {
  "/repo": [
    { name: "root.json", isFile: () => true },
    { name: "package-lock.json", isFile: () => true },
    { name: "specs", isDirectory: () => true },
    { name: "examples", isDirectory: () => true },
    { name: "tmp", isDirectory: () => true },
    { name: "packages", isDirectory: () => true },
  ],
  "/repo/specs": [{ name: "contract.json", isFile: () => true }],
  "/repo/examples": [{ name: "nested", isDirectory: () => true }],
  "/repo/examples/nested": [{ name: "config.json", isFile: () => true }],
  "/repo/tmp": [{ name: "private.json", isFile: () => true }],
  "/repo/packages": [{ name: "tool", isDirectory: () => true }],
  "/repo/packages/tool": [
    { name: "package.json", isFile: () => true },
    { name: "package-lock.json", isFile: () => true },
  ],
};
const contents = {
  "/repo/root.json": '{"root":true}',
  "/repo/package-lock.json": '{"lockfileVersion":3}',
  "/repo/specs/contract.json": '{"spec":true}',
  "/repo/examples/nested/config.json": '{"example":true}',
  "/repo/tmp/private.json": '{"private":true}',
  "/repo/packages/tool/package.json": '{"name":"tool"}',
};
const options = {
  platform: "linux",
  readDirectory: async (directory) => directories[directory] ?? [],
  readFileContents: async (file) => contents[file],
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
};

test("includes repository JSON while excluding package-lock files", async () => {
  const result = await combineJsonFiles("/repo", options);
  expect(result).toContain("root.json");
  expect(result).toContain("specs/contract.json");
  expect(result).toContain("examples/nested/config.json");
  expect(result).toContain('{"example":true}');
  expect(result).toContain("tmp/private.json");
  expect(result).toContain("packages/tool/package.json");
  expect(result).not.toContain("package-lock.json");
  await expect(combineJsonFiles("/repo", { ...options, maxChars: 1000 })).resolves.toContain(
    "root.json",
  );
});

test("returns no sections when the directory reader returns no files", async () => {
  await expect(
    combineJsonFiles("/repo", { platform: "linux", readDirectory: async () => [] }),
  ).resolves.toBe("");
});

test("uses the host platform when the caller omits options", async () => {
  await expect(combineJsonFiles(process.cwd(), { readDirectory: async () => [] })).resolves.toBe(
    "",
  );
});

test("uses default options at the public JSON boundary", async () => {
  await expect(combineJsonFiles(process.cwd())).resolves.toBe("");
});
