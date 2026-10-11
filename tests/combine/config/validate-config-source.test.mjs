import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateConfigSource } from "../../../src/combine/config/validate-config-source.mjs";

const regular = { isSymbolicLink: () => false, isFile: () => true };

test("resolves and inspects the supplied configuration path", async () => {
  const inspected = [];
  const filePath = await validateConfigSource("repo", ".github/ci.yml", {
    inspectFile: async (...args) => {
      inspected.push(args);
      return regular;
    },
  });
  expect(filePath).toBe(path.resolve("repo", ".github", "ci.yml"));
  expect(inspected).toEqual([[filePath, { bigint: true }]]);
});

test("uses default file inspection when no options are supplied", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-config-validation-"));
  try {
    await mkdir(path.join(root, ".github"));
    await writeFile(path.join(root, ".github", "ci.yml"), "workflow");
    await expect(validateConfigSource(root, ".github/ci.yml")).resolves.toBe(
      path.join(root, ".github", "ci.yml"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects symlink and non-file configuration paths", async () => {
  await expect(
    validateConfigSource("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => true, isFile: () => false }),
    }),
  ).rejects.toThrow(/symlinked/);
  await expect(
    validateConfigSource("repo", ".github/ci.yml", {
      inspectFile: async () => ({ ...regular, isFile: () => false }),
    }),
  ).rejects.toThrow(/not a regular file/);
});

test("rejects paths outside the review root before file inspection", async () => {
  const inspectFile = async () => regular;
  await expect(validateConfigSource("repo", "../secret.yml", { inspectFile })).rejects.toThrow(
    /escapes review root/,
  );
});
