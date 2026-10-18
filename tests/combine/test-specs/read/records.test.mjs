import path from "node:path";
import { readTestSpecRecords } from "../../../../src/combine/test-specs/read/records.mjs";

test("reads selected Test specification records", async () => {
  await expect(
    readTestSpecRecords("C:\\test\\specs\\conventions", ["general-semantic.yaml"], {
      platform: "win32",
      readFileContents: async () => "id: general",
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    }),
  ).resolves.toEqual(["id: general"]);
});

test("reads records with the host path policy", async () => {
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["nested/general-semantic.yaml"], {
      readFileContents: async () => "{}",
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    }),
  ).resolves.toHaveLength(1);
});

test("includes complete Test spec records regardless of size", async () => {
  const contents = `rules: ${"x".repeat(1_000_001)}`;
  const sections = await readTestSpecRecords(
    "C:\\test\\specs\\conventions",
    ["general-semantic.yaml"],
    {
      platform: "win32",
      readFileContents: async () => contents,
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    },
  );

  expect(sections[0]).toContain(contents);
});

test("counts complete raw record contents against maxChars", async () => {
  const contents = "{}";
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["general-semantic.yaml"], {
      readFileContents: async () => contents,
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
      maxChars: contents.length - 1,
    }),
  ).rejects.toThrow(/limit/);
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["general-semantic.yaml"], {
      readFileContents: async () => contents,
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
      maxChars: contents.length,
    }),
  ).resolves.toEqual([contents]);
});

test("reads a supplied record with the default file reader", async () => {
  await expect(
    readTestSpecRecords(path.join(process.cwd(), "specs"), ["directives.yaml"]),
  ).resolves.toHaveLength(1);
});
