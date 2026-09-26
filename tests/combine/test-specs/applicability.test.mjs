import path from "node:path";
import { readTestSpecApplicability } from "../../../src/combine/test-specs/applicability.mjs";

test("resolves selected Test spec records from eliware.apply", async () => {
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => JSON.stringify({ eliware: { apply: ["general", "cli"] } }),
    }),
  ).resolves.toMatchObject({
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.json"],
      ["cli", "cli.json"],
    ]),
    skipSeparateRecords: false,
  });
});

test("skips separate profile records for eliware-test", async () => {
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => JSON.stringify({ name: "@eliware/test" }),
    }),
  ).resolves.toMatchObject({ skipSeparateRecords: true });
});

test("rejects malformed and unsafe profile applicability", async () => {
  for (const apply of [[1], [""], ["  cli  "], ["../outside"], ["nested/cli"], ["nested\\cli"]]) {
    await expect(
      readTestSpecApplicability("repo", {
        readPackageJson: async () => JSON.stringify({ eliware: { apply } }),
      }),
    ).resolves.toMatchObject({ kind: "invalid" });
  }
});

test("distinguishes malformed package data from unavailable package reads", async () => {
  await expect(
    readTestSpecApplicability("repo", { readPackageJson: async () => "{" }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json is not valid JSON" });
  await expect(
    readTestSpecApplicability("repo", { readPackageJson: async () => "[]" }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json must contain an object" });
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => {
        throw new Error("permission denied");
      },
    }),
  ).resolves.toMatchObject({ kind: "unavailable", reason: "package.json could not be read" });
});

test("returns unavailable for a missing package", async () => {
  await expect(readTestSpecApplicability("missing")).resolves.toBeNull();
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("not a directory"), { code: "ENOTDIR" });
      },
    }),
  ).resolves.toBeNull();
});

test("reports package inspection failures as unavailable", async () => {
  const inspectFile = async () => {
    throw Object.assign(new Error("permission denied"), { code: "EACCES" });
  };

  await expect(readTestSpecApplicability("repo", { inspectFile })).resolves.toMatchObject({
    kind: "unavailable",
    reason: "package.json could not be read",
  });
});

test("reads package applicability from the verified regular-file handle", async () => {
  const metadata = {
    isSymbolicLink: () => false,
    isFile: () => true,
    dev: 1,
    ino: 2,
  };
  const openedMetadata = {
    isFile: () => true,
    dev: 1n,
    ino: 2n,
    size: 12n,
    mtimeNs: 3n,
    ctimeNs: 4n,
  };
  let closed = false;
  const handle = {
    stat: async () => openedMetadata,
    readFile: async () => '{"eliware":{"apply":["general"]}}',
    close: async () => {
      closed = true;
    },
  };
  let inspectedPath;
  let openedPath;
  const inspectFile = async (filePath) => {
    inspectedPath = filePath;
    return metadata;
  };
  const openFile = async (filePath) => {
    openedPath = filePath;
    return handle;
  };

  await expect(readTestSpecApplicability("repo", { inspectFile, openFile })).resolves.toMatchObject(
    { profiles: new Set(["general"]), kind: "available" },
  );
  expect(inspectedPath).toBe(path.join("repo", "package.json"));
  expect(openedPath).toBe(path.join("repo", "package.json"));
  expect(closed).toBe(true);
});

test("reports a package disappearing after inspection as unavailable", async () => {
  const metadata = {
    isSymbolicLink: () => false,
    isFile: () => true,
    dev: 1,
    ino: 2,
  };
  const inspectFile = async () => metadata;
  const openFile = async () => {
    throw Object.assign(new Error("missing"), { code: "ENOENT" });
  };

  await expect(readTestSpecApplicability("repo", { inspectFile, openFile })).resolves.toMatchObject(
    { kind: "unavailable", reason: "package.json could not be read" },
  );
});

test.each([
  { isSymbolicLink: () => true, isFile: () => false },
  { isSymbolicLink: () => false, isFile: () => false },
])("rejects unsafe package.json metadata", async (metadata) => {
  await expect(
    readTestSpecApplicability("repo", {
      inspectFile: async () => metadata,
      openFile: async () => {
        throw new Error("unexpected open");
      },
    }),
  ).resolves.toMatchObject({ kind: "unavailable", reason: "package.json is not a regular file" });
});
