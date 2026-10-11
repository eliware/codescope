import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { jest } from "@jest/globals";
import { readConfigSource } from "../../../src/combine/config/read-config-source.mjs";

test("composes configuration validation and bounded reading", async () => {
  const readFileContents = jest.fn(async () => ({
    data: Buffer.from("workflow"),
    truncated: false,
  }));
  const inspectFile = jest.fn(async () => ({ isSymbolicLink: () => false, isFile: () => true }));
  const source = await readConfigSource("repo", ".github/ci.yml", {
    readFileContents,
    inspectFile,
  });
  const filePath = path.resolve("repo", ".github", "ci.yml");
  expect(inspectFile).toHaveBeenCalledWith(filePath, { bigint: true });
  expect(readFileContents).toHaveBeenCalledWith(filePath, { maxBytes: 100_000 });
  expect(source.data.toString()).toBe("workflow");
  expect(source.truncated).toBe(false);
});

test("reads a verified configuration file with default collaborators", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-config-source-"));
  try {
    await mkdir(path.join(root, ".github"));
    await writeFile(path.join(root, ".github", "ci.yml"), "workflow");
    const result = await readConfigSource(root, ".github/ci.yml");
    expect(result.data.toString()).toBe("workflow");
    expect(result.truncated).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
