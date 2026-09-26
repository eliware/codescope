import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readConfigSource } from "../../../src/combine/config/read-config-source.mjs";

const regular = { isSymbolicLink: () => false, isFile: () => true };

test("reads a regular file with the default bounded reader", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-config-source-"));
  try {
    await mkdir(path.join(root, ".github"));
    await writeFile(path.join(root, ".github", "ci.yml"), "workflow");
    const result = await readConfigSource(root, ".github/ci.yml");
    expect(result.data.toString()).toBe("workflow");
    expect(result.truncated).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects symlinks and non-file paths before reading", async () => {
  await expect(
    readConfigSource("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow(/symlinked/);
  await expect(
    readConfigSource("repo", ".github/ci.yml", {
      inspectFile: async () => ({ ...regular, isFile: () => false }),
    }),
  ).rejects.toThrow(/not a regular file/);
});
