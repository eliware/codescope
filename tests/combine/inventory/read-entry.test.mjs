import path from "node:path";
import { readInventoryEntry } from "../../../src/combine/inventory/read-entry.mjs";

test("coordinates inventory path resolution, reading, validation, and formatting", async () => {
  let inspectedPath;
  let readPath;
  await expect(
    readInventoryEntry("repo", "notes.txt", {
      pathApi: path.posix,
      inspectFile: async (filePath) => {
        inspectedPath = filePath;
        return { isSymbolicLink: () => false, isFile: () => true };
      },
      readOtherFileContents: async (filePath) => {
        readPath = filePath;
        return { data: "hello", truncated: false };
      },
    }),
  ).resolves.toBe("notes.txt | text | 1 lines | 5 bytes");
  expect(inspectedPath).toBe(path.posix.resolve("repo/notes.txt"));
  expect(readPath).toBe(inspectedPath);
});

test("rejects inventory paths outside the supplied root", async () => {
  await expect(
    readInventoryEntry("repo", "../outside.txt", { pathApi: path.posix }),
  ).rejects.toThrow(/escapes review root/);
});
