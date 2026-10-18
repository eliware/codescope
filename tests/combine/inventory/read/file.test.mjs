import path from "node:path";
import { readInventoryFile } from "../../../../src/combine/inventory/read/file.mjs";

test("rejects symlink and non-file entries before reading", async () => {
  await expect(
    readInventoryFile("file", "notes.txt", {
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow(/symlinked/);
  await expect(
    readInventoryFile("file", "notes.txt", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
    }),
  ).rejects.toThrow(/not a regular file/);
});

test("uses the injected reader only after inspecting the file", async () => {
  const calls = [];
  await expect(
    readInventoryFile("file", "notes.txt", {
      inspectFile: async (filePath) => {
        calls.push(`inspect:${filePath}`);
        return { isSymbolicLink: () => false, isFile: () => true };
      },
      readOtherFileContents: async (filePath) => {
        calls.push(`read:${filePath}`);
        return { data: "notes", truncated: false };
      },
    }),
  ).resolves.toEqual({ data: "notes", truncated: false });
  expect(calls).toEqual(["inspect:file", "read:file"]);
});

test("uses the default file handle", async () => {
  const result = await readInventoryFile(path.join(process.cwd(), "package.json"), "package.json");
  expect(result.data.toString()).toContain('"name"');
  expect(result.truncated).toBe(false);
});
