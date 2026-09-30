import { loadEnvironmentFile } from "../../../src/review/environment/load-environment-file.mjs";

test("loads and parses an environment file", async () => {
  await expect(
    loadEnvironmentFile({
      envFile: ".env",
      openEnvFile: async () => ({
        readFile: async () => "OPENAI_API_TOKEN=file",
        close: async () => {},
      }),
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toEqual({ OPENAI_API_TOKEN: "file" });
});
