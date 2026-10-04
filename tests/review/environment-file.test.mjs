import { readReviewEnvironmentFile } from "../../src/review/environment-file.mjs";
import { defaultEnvFile } from "../../src/review/env-file-path.mjs";
import { createEnvironmentReader } from "../../test-fixtures/environment-file-handle.mjs";

const openWith =
  (text = "OPENAI_API_TOKEN=value") =>
  async () => ({
    read: createEnvironmentReader(text),
    close: async () => {},
  });

test("reads a supplied environment file after startup inspection", async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: "file",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      openEnvFile: openWith("OPENAI_API_TOKEN=value"),
    }),
  ).resolves.toBe("OPENAI_API_TOKEN=value");
});

test("preserves an optional default file that is absent at startup", async () => {
  const missing = Object.assign(new Error("missing"), { code: "ENOENT" });
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => {
        throw missing;
      },
    }),
  ).resolves.toBe("");
});

test("does not reopen a default file that appears after startup inspection", async () => {
  const missing = Object.assign(new Error("missing"), { code: "ENOENT" });
  let opened = false;
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => {
        throw missing;
      },
      openEnvFile: async () => {
        opened = true;
        return openWith()();
      },
    }),
  ).resolves.toBe("");
  expect(opened).toBe(false);
});

test("requires safe file metadata and an opener for existing files", async () => {
  await expect(
    readReviewEnvironmentFile({ envFile: "file", inspectFile: async () => ({}) }),
  ).rejects.toThrow(/symbolic-link metadata/);
  await expect(
    readReviewEnvironmentFile({
      envFile: "file",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow(/environment-file opener/);
});
