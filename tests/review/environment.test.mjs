import { loadReviewEnvironment } from "../../src/review/environment.mjs";

const base = {
  envFile: "custom.env",
  readFile: async () => "OPENAI_API_TOKEN=token",
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  openEnvFile: async () => ({
    readFile: async () => "OPENAI_API_TOKEN=token",
    close: async () => {},
  }),
};

test("loads the configured environment through the composition boundary", async () => {
  await expect(loadReviewEnvironment(base)).resolves.toMatchObject({ OPENAI_API_TOKEN: "token" });
});
