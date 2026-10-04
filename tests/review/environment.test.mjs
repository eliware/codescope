import { loadReviewEnvironment } from "../../src/review/environment.mjs";
import { createEnvironmentReader } from "../../test-fixtures/environment-file-handle.mjs";
import { jest } from "@jest/globals";

const base = {
  envFile: "custom.env",
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  openEnvFile: async () => ({
    read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
    close: async () => {},
  }),
  environment: {},
};

test("loads the configured environment through the composition boundary", async () => {
  await expect(loadReviewEnvironment(base)).resolves.toMatchObject({ OPENAI_API_TOKEN: "token" });
});

test("prefers a nonblank process token over the user-level token", async () => {
  const inspectFile = jest.fn();
  const openEnvFile = jest.fn();
  await expect(
    loadReviewEnvironment({
      ...base,
      inspectFile,
      openEnvFile,
      environment: { OPENAI_API_TOKEN: "process-token" },
    }),
  ).resolves.toMatchObject({ OPENAI_API_TOKEN: "process-token" });
  expect(inspectFile).not.toHaveBeenCalled();
  expect(openEnvFile).not.toHaveBeenCalled();
});

test("falls back to the user-level token when the process value is blank", async () => {
  await expect(
    loadReviewEnvironment({ ...base, environment: { OPENAI_API_TOKEN: "  " } }),
  ).resolves.toMatchObject({ OPENAI_API_TOKEN: "token" });
});
