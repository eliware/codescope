import { collectAndPrepare } from "../../../src/review/pipeline/collect-and-prepare.mjs";
import { createEnvironmentReader } from "../../../test-fixtures/environment-file-handle.mjs";

test("collects context and prepares the provider in order", async () => {
  const calls = [];
  await expect(
    collectAndPrepare("repo", {
      combine: async () => {
        calls.push("combine");
        return "context";
      },
      createClient: () => {
        calls.push("client");
        return "client";
      },
      readFile: async () => "",
      envFile: "repo/.env",
      openEnvFile: async () => ({
        read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
        close: async () => {},
      }),
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      environment: {},
    }),
  ).resolves.toMatchObject({ combined: "context", client: "client" });
  expect(calls).toEqual(["combine", "client"]);
});
