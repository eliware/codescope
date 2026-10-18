import path from "node:path";
import { jest } from "@jest/globals";
import { readFileUpToLimit } from "../../../src/combine/read-file/up-to-limit.mjs";
import { MAX_OTHER_FILE_BYTES } from "../../../src/combine/other/policy.mjs";
import { createReadHandle } from "../../../test-fixtures/read-handle.mjs";

test("reads at most one byte beyond the configured limit", async () => {
  const openFile = jest.fn(async () => createReadHandle(Buffer.alloc(10, "x")));
  await expect(readFileUpToLimit("large.txt", 4, { openFile })).resolves.toEqual({
    data: Buffer.alloc(5, "x"),
    truncated: true,
  });
});

test("returns the complete file when it fits within the limit", async () => {
  const openFile = jest.fn(async () => createReadHandle("small"));
  await expect(readFileUpToLimit("small.txt", 10, { openFile })).resolves.toEqual({
    data: Buffer.from("small"),
    truncated: false,
  });
});

test("returns an overflow byte for a file larger than the metadata limit", async () => {
  const openFile = jest.fn(async () =>
    createReadHandle(Buffer.alloc(MAX_OTHER_FILE_BYTES + 2, "x")),
  );
  const result = await readFileUpToLimit("oversized.txt", MAX_OTHER_FILE_BYTES, { openFile });
  expect(result.data).toHaveLength(MAX_OTHER_FILE_BYTES + 1);
  expect(result.truncated).toBe(true);
  expect(result.data.every((byte) => byte === "x".charCodeAt(0))).toBe(true);
});

test("returns an exact-limit file as complete after checking one extra byte", async () => {
  const openFile = jest.fn(async () => createReadHandle(Buffer.alloc(4, "x")));
  await expect(readFileUpToLimit("boundary.txt", 4, { openFile })).resolves.toEqual({
    data: Buffer.alloc(4, "x"),
    truncated: false,
  });
});

test("uses the default file opener", async () => {
  const result = await readFileUpToLimit(path.join(process.cwd(), "package.json"), 1_000_000);
  expect(result.data.toString()).toContain('"name"');
  expect(result.truncated).toBe(false);
});
