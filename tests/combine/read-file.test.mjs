import { readSourceFile } from "../../src/combine/read-file.mjs";
import path from "node:path";

test("reads regular source content", async () => {
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      readFileContents: async () => "export {}",
      validateSymlinks: true,
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toBe("export {}");
});

test("reads a file with default options", async () => {
  await expect(
    readSourceFile("README.md", path.join(process.cwd(), "README.md")),
  ).resolves.toContain("codescope");
});

test("rejects a source path replaced between inspection and opening", async () => {
  let readAttempted = false;
  let closed = false;
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      inspectFile: async () => ({
        isSymbolicLink: () => false,
        isFile: () => true,
        dev: 1n,
        ino: 2n,
      }),
      openFile: async () => ({
        stat: async () => ({ isFile: () => true, dev: 1n, ino: 3n }),
        readFile: async () => {
          readAttempted = true;
        },
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow(/changed while opening/);
  expect(readAttempted).toBe(false);
  expect(closed).toBe(true);
});

test("rejects source content changed during the opened-handle read", async () => {
  let statCalls = 0;
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      inspectFile: async () => sourceMetadata(),
      openFile: async () => ({
        stat: async () =>
          statCalls++ === 0 ? sourceMetadata() : { ...sourceMetadata(), size: 9n },
        readFile: async () => "changed",
        close: async () => {},
      }),
    }),
  ).rejects.toThrow(/changed while reading/);
  expect(statCalls).toBe(2);
});

function sourceMetadata(overrides = {}) {
  return {
    isSymbolicLink: () => false,
    isFile: () => true,
    dev: 1n,
    ino: 2n,
    size: 7n,
    mtimeNs: 10n,
    ctimeNs: 11n,
    ...overrides,
  };
}

test("rejects a non-file opened after source inspection", async () => {
  let closed = false;
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      inspectFile: async () => ({
        isSymbolicLink: () => false,
        isFile: () => true,
        dev: 1n,
        ino: 2n,
      }),
      openFile: async () => ({
        stat: async () => ({ isFile: () => false, dev: 1n, ino: 2n }),
        readFile: async () => "",
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow(/not a regular file/);
  expect(closed).toBe(true);
});

test("rejects symlinks and non-files with contextual errors", async () => {
  const inspect = async () => ({ isSymbolicLink: () => true, isFile: () => false });
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", { validateSymlinks: true, inspectFile: inspect }),
  ).rejects.toThrow("src/a.mjs: symlinked");
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      validateSymlinks: true,
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
    }),
  ).rejects.toThrow("regular file");
});

test("reports reader failures and invalid reader values", async () => {
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      readFileContents: async () => {
        throw new Error("denied");
      },
    }),
  ).rejects.toThrow("src/a.mjs: denied");
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", { readFileContents: async () => 42 }),
  ).rejects.toThrow("non-string");
});
