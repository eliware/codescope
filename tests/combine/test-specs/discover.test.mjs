import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverTestSpecFiles } from "../../../src/combine/test-specs/discover.mjs";

test("reports a Test-spec discovery failure with context", async () => {
  await expect(
    discoverTestSpecFiles("C:\\missing", {
      readDirectory: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
      platform: "win32",
    }),
  ).rejects.toThrow(/Unable to discover Test specification evidence/);
});

test("rethrows unexpected Test-spec discovery failures", async () => {
  await expect(
    discoverTestSpecFiles("C:\\broken", {
      readDirectory: async () => {
        throw Object.assign(new Error("denied"), { code: "EACCES" });
      },
      platform: "win32",
    }),
  ).rejects.toThrow(/Unable to discover Test specification evidence/);
});

test("uses POSIX Test-spec paths when requested", async () => {
  await expect(
    discoverTestSpecFiles("/missing", {
      readDirectory: async () => [],
      platform: "linux",
    }),
  ).resolves.toMatchObject({ specsRoot: "/missing/specs", files: [] });
});

test("discovers Test-spec JSON files on the host platform", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-test-specs-"));
  try {
    await mkdir(path.join(root, "specs"));
    await writeFile(path.join(root, "specs", "general.json"), "{}");
    await expect(discoverTestSpecFiles(root)).resolves.toMatchObject({ files: ["general.json"] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("treats a non-directory Test-spec root as unavailable", async () => {
  const file = await mkdtemp(path.join(os.tmpdir(), "codescope-test-specs-"));
  try {
    await writeFile(file + ".root", "{}");
    await expect(discoverTestSpecFiles(file + ".root")).resolves.toBeUndefined();
  } finally {
    await rm(file, { recursive: true, force: true });
    await rm(file + ".root", { force: true });
  }
});
