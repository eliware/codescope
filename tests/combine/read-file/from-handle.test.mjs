import { jest } from "@jest/globals";
import path from "node:path";
import { readFileFromHandle } from "../../../src/combine/read-file/from-handle.mjs";
import { createReadHandle } from "../../../test-fixtures/read-handle.mjs";

test("reads through an opened handle and closes it", async () => {
  let closed = false;
  await expect(
    readFileFromHandle("file", {
      readHandle: async () => "content",
      openFile: async () => ({
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).resolves.toBe("content");
  expect(closed).toBe(true);
});

test("reads from the injected opener", async () => {
  const openFile = jest.fn(async () => createReadHandle("content"));
  await expect(
    readFileFromHandle("entry.txt", { openFile, readHandle: (handle) => handle.readFile("utf8") }),
  ).resolves.toBe("content");
  expect(openFile).toHaveBeenCalledWith("entry.txt", "r");
});

test("closes the handle when reading fails", async () => {
  let closed = false;
  await expect(
    readFileFromHandle("file", {
      readHandle: async () => {
        throw new Error("read failed");
      },
      openFile: async () => ({
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).rejects.toThrow("read failed");
  expect(closed).toBe(true);
});

test("uses the default file opener", async () => {
  const contents = await readFileFromHandle(path.join(process.cwd(), "package.json"), {
    readHandle: (handle) => handle.readFile("utf8"),
  });
  expect(contents).toContain('"name"');
});
