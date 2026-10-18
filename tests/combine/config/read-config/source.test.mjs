import path from "node:path";
import { jest } from "@jest/globals";
import { readConfigSource } from "../../../../src/combine/config/read-config/source.mjs";

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

test("uses host path rules and the default file reader", async () => {
  const source = await readConfigSource(process.cwd(), "package.json");
  expect(source.data.toString()).toContain('"name"');
  expect(source.truncated).toBe(false);
});
