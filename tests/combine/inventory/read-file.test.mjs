import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readInventoryFile } from "../../../src/combine/inventory/read-file.mjs";

test("reads the inspected file with the bounded reader", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-inventory-file-"));
  try {
    const file = path.join(root, "notes.txt");
    await writeFile(file, "notes");
    await expect(readInventoryFile(file, "notes.txt")).resolves.toMatchObject({
      data: Buffer.from("notes"),
      truncated: false,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

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
