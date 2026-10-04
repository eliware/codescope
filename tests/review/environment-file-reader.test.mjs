import { readEnvironmentFile } from "../../src/review/environment-file-reader.mjs";
import { createEnvironmentReader } from "../../test-fixtures/environment-file-handle.mjs";

test("reads environment content and closes the handle", async () => {
  let closed = false;
  await expect(
    readEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => ({
        read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
        close: async () => {
          closed = true;
        },
      }),
    }),
  ).resolves.toBe("OPENAI_API_TOKEN=token");
  expect(closed).toBe(true);
});

test("reports missing opener and read failures", async () => {
  await expect(readEnvironmentFile({ envFile: ".env" })).rejects.toThrow(/environment-file opener/);
  await expect(
    readEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => ({
        read: async () => {
          throw new Error("denied");
        },
      }),
    }),
  ).rejects.toThrow("Unable to read .env: denied");
});

test("preserves close failures and combined read/close failures", async () => {
  const closeError = new Error("close failed");
  await expect(
    readEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => ({
        read: createEnvironmentReader("text"),
        close: async () => {
          throw closeError;
        },
      }),
    }),
  ).rejects.toThrow(/close failed/);
  await expect(
    readEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => ({
        read: async () => {
          throw new Error("read failed");
        },
        close: async () => {
          throw closeError;
        },
      }),
    }),
  ).rejects.toMatchObject({ closeError });
});

test("stringifies non-Error opener failures", async () => {
  await expect(
    readEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => {
        throw "open failed";
      },
    }),
  ).rejects.toThrow("Unable to read .env: open failed");
});
