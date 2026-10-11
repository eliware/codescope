import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { jest } from "@jest/globals";
import {
  MAX_CONFIG_BYTES,
  readBoundedConfigSource,
} from "../../../src/combine/config/read-bounded-config-source.mjs";

test("reads a file through the default bounded reader", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-config-reader-"));
  try {
    await mkdir(path.join(root, ".github"));
    await writeFile(path.join(root, ".github", "ci.yml"), "workflow");
    const result = await readBoundedConfigSource(path.join(root, ".github", "ci.yml"));
    expect(result.data.toString()).toBe("workflow");
    expect(result.truncated).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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
