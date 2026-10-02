import { readTestSpecRecords } from "../../../src/combine/test-specs/read-records.mjs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("reads and formats selected Test specification records", async () => {
  await expect(
    readTestSpecRecords("C:\\test\\specs\\conventions", ["general.yaml"], {
      platform: "win32",
      readFileContents: async () => "id: general",
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    }),
  ).resolves.toEqual(["===== test/specs/conventions/general.yaml =====\n1 id: general\n"]);
});

test("reads records with the host path policy", async () => {
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["nested/general.yaml"], {
      readFileContents: async () => "{}",
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    }),
  ).resolves.toHaveLength(1);
});

test("includes complete Test spec records regardless of size", async () => {
  const contents = `rules: ${"x".repeat(1_000_001)}`;
  const sections = await readTestSpecRecords("C:\\test\\specs\\conventions", ["general.yaml"], {
    platform: "win32",
    readFileContents: async () => contents,
    inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
  });

  expect(sections[0]).toContain(contents);
});

test("counts formatted headers and line numbers against maxChars", async () => {
  const contents = "{}";
  const formatted = "===== test/specs/conventions/general.yaml =====\n1 {}\n";
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["general.yaml"], {
      readFileContents: async () => contents,
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
      maxChars: formatted.length - 1,
    }),
  ).rejects.toThrow(/limit/);
  await expect(
    readTestSpecRecords("/test/specs/conventions", ["general.yaml"], {
      readFileContents: async () => contents,
      inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
      maxChars: formatted.length,
    }),
  ).resolves.toEqual([formatted]);
});

test("uses default reader options for a real Test spec record", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-records-"));
  try {
    await mkdir(path.join(root, "nested"));
    await writeFile(path.join(root, "nested", "general.yaml"), "{}");
    await expect(readTestSpecRecords(root, ["nested/general.yaml"])).resolves.toHaveLength(1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
