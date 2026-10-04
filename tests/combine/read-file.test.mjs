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

test("bounds default source reads to the character budget plus one sample character", async () => {
  const source = Buffer.from("a".repeat(10_000));
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
    async close() {},
  };
  const contents = await readSourceFile("src/a.mjs", "repo/src/a.mjs", {
    maxChars: 12,
    openFile: async () => handle,
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });

  expect(contents).toBe(`${"a".repeat(12)}�`);
  expect(offset).toBe(13);
});

test("rejects injected reads that exceed a strict character limit", async () => {
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      readFileContents: async () => "longer",
      maxChars: 3,
      failOnTruncation: true,
    }),
  ).rejects.toThrow("exceeds the 3-character read limit");
});

test("rejects default handle reads that exceed a strict character limit", async () => {
  const source = Buffer.from("abcdef");
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
    async close() {},
  };

  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      maxChars: 3,
      failOnTruncation: true,
      openFile: async () => handle,
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow("exceeds the 3-character read limit");
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
  await expect(
    readSourceFile("src/a.mjs", "repo/src/a.mjs", {
      readFileContents: async () => {
        throw "denied";
      },
    }),
  ).rejects.toThrow("src/a.mjs: denied");
});
