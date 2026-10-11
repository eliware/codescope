import path from "node:path";
import { jest } from "@jest/globals";
import { readPackageJsonContent } from "../../../src/combine/test-specs/read-package-json-content.mjs";

test("calls an injected reader with the package path and byte limit", async () => {
  const readPackageJson = jest.fn(async () => "{}");
  await expect(readPackageJsonContent("repo", { readPackageJson })).resolves.toEqual({
    kind: "available",
    contents: "{}",
  });
  expect(readPackageJson).toHaveBeenCalledWith(path.join("repo", "package.json"), "utf8", {
    maxBytes: 100_000,
  });
});

test("maps injected missing-file and read failures", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
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

test("returns package metadata from the default filesystem reader", async () => {
  await expect(readPackageJsonContent(process.cwd())).resolves.toMatchObject({
    kind: "available",
    contents: expect.stringContaining('"name": "@eliware/codescope"'),
  });
});

test("maps metadata inspection failures", async () => {
  await expect(
    readPackageJsonContent("repo", {
      inspectFile: async () => {
        throw Object.assign(new Error("denied"), { code: "EACCES" });
      },
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
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

test("reads package data through and closes the inspected file handle", async () => {
  let closed = false;
  let readContents = false;
  const inspectFile = async () => ({ isSymbolicLink: () => false, isFile: () => true });
  const openFile = async () => ({
    read: async (buffer) => {
      if (readContents) return { bytesRead: 0 };
      readContents = true;
      buffer.write("{}");
      return { bytesRead: 2 };
    },
    close: async () => {
      closed = true;
    },
  });
  await expect(readPackageJsonContent("repo", { inspectFile, openFile })).resolves.toEqual({
    kind: "available",
    contents: "{}",
  });
  expect(closed).toBe(true);
});

test("maps an open failure after inspection", async () => {
  const inspectFile = async () => ({ isSymbolicLink: () => false, isFile: () => true });
  const openFile = async () => {
    throw Object.assign(new Error("missing"), { code: "ENOENT" });
  };
  await expect(readPackageJsonContent("repo", { inspectFile, openFile })).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json could not be read",
  });
});

test("limits package metadata read from the opened handle", async () => {
  const openFile = async () => ({
    read: async (buffer, _offset, length) => {
      buffer.fill(0x78, 0, length);
      return { bytesRead: length };
    },
    close: async () => {},
  });
  await expect(
    readPackageJsonContent("repo", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      openFile,
    }),
  ).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
});
