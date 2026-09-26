import { lstat, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readVerifiedFile } from "../../src/combine/read-verified-file.mjs";

test("reads a verified file and closes its handle", async () => {
  let closed = false;
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "source",
      readHandle: async () => "content",
      openFile: async () => ({
        stat: async () => metadata(),
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).resolves.toBe("content");
  expect(closed).toBe(true);
});

test("uses the native opener when no custom opener is supplied", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-verified-file-"));
  try {
    const file = path.join(root, "entry.txt");
    await writeFile(file, "content");
    await expect(
      readVerifiedFile(file, await lstat(file, { bigint: true }), {
        label: "source",
        readHandle: (handle) => handle.readFile("utf8"),
      }),
    ).resolves.toBe("content");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects replacement before reading and closes the handle", async () => {
  let read = false;
  let closed = false;
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "config",
      readHandle: async () => {
        read = true;
      },
      openFile: async () => ({
        stat: async () => metadata({ ino: 3n }),
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow("config file changed while opening");
  expect(read).toBe(false);
  expect(closed).toBe(true);
});

test("detects device changes while opening", async () => {
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "source",
      readHandle: async () => "unused",
      openFile: async () => ({
        stat: async () => metadata({ dev: 2n }),
        close: async () => {},
      }),
    }),
  ).rejects.toThrow("source file changed while opening");
});

test("rejects non-files opened after inspection", async () => {
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "inventory",
      readHandle: async () => "unused",
      openFile: async () => ({
        stat: async () => ({ ...metadata(), isFile: () => false }),
        close: async () => {},
      }),
    }),
  ).rejects.toThrow("inventory path is not a regular file");
});

test("rejects files changed during reading", async () => {
  let statCalls = 0;
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "source",
      readHandle: async () => "content",
      openFile: async () => ({
        stat: async () => (statCalls++ === 0 ? metadata() : metadata({ size: 8n })),
        close: async () => {},
      }),
    }),
  ).rejects.toThrow("source file changed while reading");
});

test.each([
  ["device", { dev: 2n }],
  ["modification time", { mtimeNs: 12n }],
  ["change time", { ctimeNs: 13n }],
])("detects a %s change after reading", async (_name, changes) => {
  let statCalls = 0;
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "source",
      readHandle: async () => "content",
      openFile: async () => ({
        stat: async () => (statCalls++ === 0 ? metadata() : metadata(changes)),
        close: async () => {},
      }),
    }),
  ).rejects.toThrow("source file changed while reading");
});

test("closes a file when reading fails", async () => {
  let closed = false;
  await expect(
    readVerifiedFile("file", metadata(), {
      label: "source",
      readHandle: async () => {
        throw new Error("read failed");
      },
      openFile: async () => ({
        stat: async () => metadata(),
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow("read failed");
  expect(closed).toBe(true);
});

function metadata(overrides = {}) {
  return {
    isFile: () => true,
    dev: 1n,
    ino: 2n,
    size: 7n,
    mtimeNs: 10n,
    ctimeNs: 11n,
    ...overrides,
  };
}
