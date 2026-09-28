import path from "node:path";
import { jest } from "@jest/globals";
import { readPackageJsonContent } from "../../../src/combine/test-specs/read-package-json-content.mjs";

test("reads package contents through the injected reader", async () => {
  await expect(
    readPackageJsonContent("repo", { readPackageJson: async () => "{}" }),
  ).resolves.toEqual({ kind: "available", contents: "{}" });
});

test.each(["ENOENT", "ENOTDIR"])("treats injected %s read failures as missing", async (code) => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("missing"), { code });
      },
    }),
  ).resolves.toBeNull();
});

test("returns unavailable for other injected read failures", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("not a directory"), { code: "ENOTDIR" });
      },
    }),
  ).resolves.toBeNull();
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw new Error("denied");
      },
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
});

test("returns unavailable when package metadata inspection fails", async () => {
  await expect(
    readPackageJsonContent("repo", {
      inspectFile: async () => {
        throw Object.assign(new Error("denied"), { code: "EACCES" });
      },
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
});

test("uses the default verified reader for the current package", async () => {
  await expect(readPackageJsonContent(process.cwd())).resolves.toMatchObject({
    kind: "available",
    contents: expect.stringContaining('"name": "@eliware/codescope"'),
  });
});

test.each([
  { isSymbolicLink: () => true, isFile: () => false },
  { isSymbolicLink: () => false, isFile: () => false },
])("rejects unsafe package metadata before opening", async (metadata) => {
  const openFile = jest.fn();
  await expect(
    readPackageJsonContent("repo", { inspectFile: async () => metadata, openFile }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json is not a regular file" });
  expect(openFile).not.toHaveBeenCalled();
});

test("reads verified package data through the opened regular-file handle", async () => {
  const stat = {
    isFile: () => true,
    dev: 1n,
    ino: 2n,
    size: 2n,
    mtimeNs: 3n,
    ctimeNs: 4n,
  };
  let closed = false;
  let inspectedPath;
  const inspectFile = async (filePath) => {
    inspectedPath = filePath;
    return { isSymbolicLink: () => false, isFile: () => true, dev: 1, ino: 2 };
  };
  const openFile = async () => ({
    stat: async () => stat,
    readFile: async () => "{}",
    close: async () => {
      closed = true;
    },
  });
  await expect(readPackageJsonContent("repo", { inspectFile, openFile })).resolves.toEqual({
    kind: "available",
    contents: "{}",
  });
  expect(inspectedPath).toBe(path.join("repo", "package.json"));
  expect(closed).toBe(true);
});

test("treats disappearance after inspection as unavailable", async () => {
  const inspectFile = async () => ({
    isSymbolicLink: () => false,
    isFile: () => true,
    dev: 1,
    ino: 2,
  });
  const openFile = async () => {
    throw Object.assign(new Error("missing"), { code: "ENOENT" });
  };
  await expect(readPackageJsonContent("repo", { inspectFile, openFile })).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json could not be read",
  });
});
