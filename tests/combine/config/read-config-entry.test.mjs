import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readConfigEntry } from "../../../src/combine/config/read-config-entry.mjs";

test("assembles a safely read configuration section", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-config-entry-"));
  try {
    await mkdir(path.join(root, ".github"));
    await writeFile(path.join(root, ".github", "ci.yml"), "first\nsecond");
    await expect(readConfigEntry(root, ".github/ci.yml")).resolves.toContain(
      "===== .github/ci.yml =====\n1 first\n2 second",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("coordinates injected configuration content and its evidence section", async () => {
  await expect(
    readConfigEntry("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      readFileContents: async () => "name: workflow",
      platform: "posix",
    }),
  ).resolves.toContain("1 name: workflow");
});

test("omits binary samples from configuration evidence", async () => {
  await expect(
    readConfigEntry("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      readFileContents: async () => Buffer.from([0, 1]),
      platform: "posix",
    }),
  ).resolves.toBe("");
});
