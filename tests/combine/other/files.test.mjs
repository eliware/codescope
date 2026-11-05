import { describeOtherFiles } from "../../../src/combine/other/files.mjs";
import { formatInventorySection } from "../../../src/combine/inventory/format/section.mjs";
import { jest } from "@jest/globals";

const regular = async () => ({ isSymbolicLink: () => false, isFile: () => true });

test("composes metadata for unsupplied inventory files in sorted order", async () => {
  const result = await describeOtherFiles("repo", ["b.txt", "a.txt", "src/app.mjs"], {
    inspectFile: regular,
    readOtherFileContents: async (file) => ({
      data: file.endsWith("a.txt") ? "a" : "b",
      truncated: false,
    }),
  });
  expect(result.entries).toEqual([
    "a.txt | text | 1 lines | 1 bytes",
    "b.txt | text | 1 lines | 1 bytes",
  ]);
});

test("lists package lockfiles as metadata without including their contents", async () => {
  const read = jest.fn(async () => ({ data: '{"private":"lock content"}', truncated: false }));
  const result = await describeOtherFiles(
    "repo",
    ["package-lock.json", "nested/package-lock.json", "nested/deep/package-lock.json"],
    {
      inspectFile: regular,
      readOtherFileContents: read,
    },
  );
  expect(result).toEqual({
    entries: [
      "nested/deep/package-lock.json | text | 1 lines | 26 bytes",
      "nested/package-lock.json | text | 1 lines | 26 bytes",
      "package-lock.json | text | 1 lines | 26 bytes",
    ],
    totalEntries: 3,
  });
  expect(read).toHaveBeenCalledTimes(3);
  expect(JSON.stringify(result)).not.toContain("lock content");
});

test("lists release notes in the inventory without supplying their content", async () => {
  await expect(
    describeOtherFiles("repo", ["RELEASE_NOTES.md"], {
      inspectFile: regular,
      readOtherFileContents: async () => ({ data: "Release notes", truncated: false }),
    }),
  ).resolves.toEqual({
    entries: ["RELEASE_NOTES.md | text | 1 lines | 13 bytes"],
    totalEntries: 1,
  });
});

test("lists environment files with Git status and does not read their content", async () => {
  const read = jest.fn(async () => ({ data: "not-read", truncated: false }));
  const result = await describeOtherFiles("repo", [".env"], {
    inspectFile: regular,
    readOtherFileContents: read,
    executeGit: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
  });
  expect(result.entries).toEqual([
    ".env | environment file | content omitted | Git status: untracked and ignored",
  ]);
  expect(read).not.toHaveBeenCalled();
  expect(result.entries.join("\n")).not.toContain("not-read");
});

test("preserves independent per-file limits and bounded concurrency", async () => {
  let active = 0;
  let maximum = 0;
  let releaseReaders;
  const bothReadersStarted = new Promise((resolve) => {
    releaseReaders = resolve;
  });
  const result = await describeOtherFiles("repo", ["first.txt", "second.txt"], {
    inspectFile: regular,
    concurrency: 2,
    readOtherFileContents: async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      if (active === 2) releaseReaders();
      await bothReadersStarted;
      active -= 1;
      return { data: Buffer.alloc(100_001, "x"), truncated: true };
    },
  });
  expect(maximum).toBe(2);
  expect(result.entries).toHaveLength(2);
});

test("supports explicit platform semantics for inventory roots", async () => {
  await expect(
    describeOtherFiles("C:\\repo", ["notes.txt"], {
      platform: "win32",
      inspectFile: regular,
      readOtherFileContents: async () => ({ data: "notes", truncated: false }),
    }),
  ).resolves.toMatchObject({ entries: ["notes.txt | text | 1 lines | 5 bytes"] });
});

test("uses the default bounded reader on the current platform", async () => {
  await expect(describeOtherFiles(process.cwd(), ["LICENSE"])).resolves.toMatchObject({
    entries: expect.arrayContaining([expect.stringContaining("LICENSE | text")]),
  });
});

test("supports explicit POSIX path selection with an injected reader", async () => {
  await expect(
    describeOtherFiles("repo", ["notes.txt"], {
      platform: "linux",
      inspectFile: regular,
      readOtherFileContents: async () => ({ data: "notes", truncated: false }),
    }),
  ).resolves.toMatchObject({ entries: ["notes.txt | text | 1 lines | 5 bytes"] });
});

test("keeps later compact inventory entries after a larger entry cannot fit", async () => {
  const read = jest.fn(async (file) => ({
    data: file.endsWith("a.txt") ? "first" : file.endsWith("b.txt") ? "x".repeat(200) : "c",
    truncated: false,
  }));
  const first = "a.txt | text | 1 lines | 5 bytes";
  const last = "c.txt | text | 1 lines | 1 bytes";
  const maxChars = formatInventorySection([first, last], Infinity, 3).length;
  const result = await describeOtherFiles("repo", ["a.txt", "b.txt", "c.txt"], {
    inspectFile: regular,
    readOtherFileContents: read,
    maxChars,
  });
  expect(read).toHaveBeenCalledTimes(3);
  expect(result).toEqual({ entries: [first, last], totalEntries: 3 });
});
