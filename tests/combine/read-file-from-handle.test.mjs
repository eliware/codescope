import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readFileFromHandle } from "../../src/combine/read-file-from-handle.mjs";

test("reads through an opened handle and closes it", async () => {
  let closed = false;
  await expect(
    readFileFromHandle("file", {
      readHandle: async () => "content",
      openFile: async () => ({
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).resolves.toBe("content");
  expect(closed).toBe(true);
});

test("uses the native opener when no custom opener is supplied", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-read-file-"));
  try {
    const file = path.join(root, "entry.txt");
    await writeFile(file, "content");
    await expect(
      readFileFromHandle(file, { readHandle: (handle) => handle.readFile("utf8") }),
    ).resolves.toBe("content");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("closes the handle when reading fails", async () => {
  let closed = false;
  await expect(
    readFileFromHandle("file", {
      readHandle: async () => {
        throw new Error("read failed");
      },
      openFile: async () => ({
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow("read failed");
  expect(closed).toBe(true);
});
