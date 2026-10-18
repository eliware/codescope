import path from "node:path";
import { discoverTestSpecFiles } from "../../../src/combine/test-specs/discover.mjs";

test("reports a Test-spec discovery failure with context", async () => {
  await expect(
    discoverTestSpecFiles("/missing", {
      readDirectory: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
      platform: "linux",
    }),
  ).rejects.toThrow(/Cannot find Test specification data/);
});

test("reports unexpected Test-spec discovery failures", async () => {
  await expect(
    discoverTestSpecFiles("/broken", {
      readDirectory: async () => {
        throw Object.assign(new Error("denied"), { code: "EACCES" });
      },
      platform: "linux",
    }),
  ).rejects.toThrow(/Cannot find Test specification data/);
});

test("uses POSIX Test-spec paths when requested", async () => {
  await expect(
    discoverTestSpecFiles("/missing", {
      readDirectory: async () => [],
      platform: "linux",
    }),
  ).resolves.toMatchObject({ specsRoot: "/missing/specs/conventions", files: [] });
});

test("discovers semantic and deterministic YAML files from injected entries", async () => {
  await expect(
    discoverTestSpecFiles("/repo", {
      readDirectory: async () => [
        { name: "general-semantic.yaml", isFile: () => true },
        { name: "general-deterministic.yaml", isFile: () => true },
      ],
      platform: "linux",
    }),
  ).resolves.toMatchObject({
    files: ["general-deterministic.yaml", "general-semantic.yaml"],
  });
});

test("treats a missing convention checkout as unavailable", async () => {
  await expect(
    discoverTestSpecFiles("/repo", {
      inspectRoot: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    }),
  ).resolves.toBeUndefined();
});

test("reports convention-root inspection failures with context", async () => {
  await expect(
    discoverTestSpecFiles("/broken", {
      inspectRoot: async () => {
        throw Object.assign(new Error("denied"), { code: "EACCES" });
      },
    }),
  ).rejects.toThrow(/Cannot inspect Test specification data/);
});

test("reports an ENOENT during nested Test-spec discovery", async () => {
  await expect(
    discoverTestSpecFiles("/repo", {
      platform: "linux",
      readDirectory: async (directory) => {
        if (directory === "/repo/specs/conventions/nested")
          throw Object.assign(new Error("entry disappeared"), { code: "ENOENT" });
        return directory === "/repo/specs/conventions"
          ? [{ name: "nested", isDirectory: () => true }]
          : [];
      },
    }),
  ).rejects.toThrow(/Cannot find Test specification data/);
});

test("reports a non-directory Test-spec root as a discovery error", async () => {
  await expect(
    discoverTestSpecFiles("/broken", {
      platform: "linux",
      readDirectory: async () => {
        throw Object.assign(new Error("not a directory"), { code: "ENOTDIR" });
      },
    }),
  ).rejects.toThrow(/Cannot find Test specification data/);
});

test("uses the default reader for a missing convention root", async () => {
  await expect(
    discoverTestSpecFiles(path.join(process.cwd(), "test-fixtures", "missing-root")),
  ).resolves.toBeUndefined();
});
