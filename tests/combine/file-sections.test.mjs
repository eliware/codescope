import { combineFileSections } from "../../src/combine/file-sections.mjs";

test("combines supplied file sections", async () => {
  await expect(
    combineFileSections("repo", ["a.mjs"], {
      maxChars: Infinity,
      concurrency: 1,
      batchSize: 1,
      readFileContents: async () => "export {};",
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      validateSymlinks: false,
    }),
  ).resolves.toContain("a.mjs");
});

test("checks each formatted section against a finite character limit", async () => {
  await expect(
    combineFileSections("repo", ["a.mjs"], {
      maxChars: 5,
      concurrency: 1,
      batchSize: 1,
      readFileContents: async () => "too long",
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      validateSymlinks: false,
    }),
  ).rejects.toThrow(/5-character/);
});
