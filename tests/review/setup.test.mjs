import { resolveReviewSetup } from "../../src/review/setup.mjs";
import { createEnvironmentReader } from "../../test-fixtures/environment-file-handle.mjs";

const openEnvFile = async () => ({
  read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
  close: async () => {},
});

test("resolves a trimmed token from the configured environment file", async () => {
  await expect(
    resolveReviewSetup({
      envFile: "ignored",
      readFile: async () => "OPENAI_API_TOKEN=ignored",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      openEnvFile,
    }),
  ).resolves.toMatchObject({ token: "token" });
});

test("uses the configured opener for environment text", async () => {
  await expect(
    resolveReviewSetup({
      envFile: "ignored",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      openEnvFile,
    }),
  ).resolves.toMatchObject({ token: "token" });
});

test("rejects a missing token", async () => {
  await expect(
    resolveReviewSetup({
      envFile: "ignored",
      readFile: async () => "",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      openEnvFile: async () => ({
        read: createEnvironmentReader(""),
        close: async () => {},
      }),
    }),
  ).rejects.toThrow(/OPENAI_API_TOKEN/);
});
