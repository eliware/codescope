import path from "node:path";
import { jest } from "@jest/globals";
import {
  MAX_CONFIG_BYTES,
  readBoundedConfigSource,
} from "../../../../src/combine/config/read/bounded-config-source.mjs";
import { createReadHandle } from "../../../../test-fixtures/read-handle.mjs";

test("reads a file through the default bounded reader", async () => {
  const result = await readBoundedConfigSource(".github/ci.yml", {
    openFile: async () => createReadHandle("workflow"),
  });
  expect(result.data.toString()).toBe("workflow");
  expect(result.truncated).toBe(false);
});

test("passes the byte limit to an injected reader", async () => {
  const readFileContents = jest.fn(async (_filePath, options) => ({
    data: Buffer.alloc(options.maxBytes + 1),
    truncated: true,
  }));
  const result = await readBoundedConfigSource("config.yml", { readFileContents });
  expect(readFileContents).toHaveBeenCalledWith("config.yml", { maxBytes: MAX_CONFIG_BYTES });
  expect(result.truncated).toBe(true);
});

test("uses the default file handle", async () => {
  const result = await readBoundedConfigSource(path.join(process.cwd(), "package.json"));
  expect(result.data.toString()).toContain('"name"');
  expect(result.truncated).toBe(false);
});
