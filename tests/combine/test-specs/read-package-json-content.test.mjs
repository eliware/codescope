import path from "node:path";
import { jest } from "@jest/globals";
import { readPackageJsonContent } from "../../../src/combine/test-specs/read-package-json-content.mjs";

test("reads package contents through the injected reader", async () => {
  await expect(
    readPackageJsonContent("repo", { readPackageJson: async () => "{}" }),
  ).resolves.toEqual({ kind: "available", contents: "{}" });
});

test("bounds injected package readers and rejects truncated package metadata", async () => {
  const readPackageJson = jest.fn(async (_filePath, _encoding, options) => ({
    data: Buffer.alloc(options.maxBytes + 1),
    truncated: true,
  }));
  await expect(readPackageJsonContent("repo", { readPackageJson })).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
  expect(readPackageJson).toHaveBeenCalledWith(path.join("repo", "package.json"), "utf8", {
    maxBytes: 100_000,
  });
});

test("accepts bounded text package metadata from an injected reader", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => ({ data: "{}", truncated: false }),
    }),
  ).resolves.toEqual({ kind: "available", contents: "{}" });
});

test("rejects invalid UTF-8 package metadata bytes", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => ({ data: Buffer.from([0xff]), truncated: false }),
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
});

test("rejects an oversized plain-string package reader result", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => "x".repeat(100_001),
    }),
  ).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
});

test("rejects injected package metadata without readable contents", async () => {
  await expect(
    readPackageJsonContent("repo", { readPackageJson: async () => ({}) }),
  ).resolves.toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
});

test("treats an injected ENOENT read failure as missing", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    }),
  ).resolves.toBeNull();
});

test("reports an ENOTDIR package path as unavailable", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("not a directory"), { code: "ENOTDIR" });
      },
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
});

test("returns unavailable for other injected read failures", async () => {
  await expect(
    readPackageJsonContent("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("not a directory"), { code: "ENOTDIR" });
      },
    }),
  ).resolves.toEqual({ kind: "unavailable", reason: "package.json could not be read" });
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

test("reads package data through the opened regular-file handle", async () => {
  let closed = false;
  let inspectedPath;
  const inspectFile = async (filePath) => {
    inspectedPath = filePath;
    return { isSymbolicLink: () => false, isFile: () => true };
  };
  const openFile = async () => {
    let readContents = false;
    return {
      read: async (buffer) => {
        if (readContents) return { bytesRead: 0 };
        readContents = true;
        buffer.write("{}");
        return { bytesRead: 2 };
      },
      close: async () => {
        closed = true;
      },
    };
  };
  await expect(readPackageJsonContent("repo", { inspectFile, openFile })).resolves.toEqual({
    kind: "available",
    contents: "{}",
  });
  expect(inspectedPath).toBe(path.join("repo", "package.json"));
  expect(closed).toBe(true);
});

test("reports an open failure after inspection as unavailable", async () => {
  const inspectFile = async () => ({
    isSymbolicLink: () => false,
    isFile: () => true,
  });
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
