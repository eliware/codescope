import { runReview } from "../../src/review/lifecycle.mjs";
import { createEnvironmentReader } from "../../test-fixtures/environment-file-handle.mjs";

test("resolves options and delegates a review through the pipeline", async () => {
  const writes = [];
  const result = await runReview("repo", {
    prompt: {
      input: [{ role: "developer", content: [{ type: "input_text", text: "<combine-mjs here>" }] }],
      tools: [],
    },
    combine: async () => "source",
    platform: "linux",
    envFile: "ignored",
    readFile: async () => "OPENAI_API_TOKEN=token",
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    openEnvFile: async () => ({
      read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
      close: async () => {},
    }),
    createClient: () => ({ responses: { create: async () => ({ output_text: "response" }) } }),
    register: () => ({ removeHandlers() {} }),
    write: async (value) => {
      writes.push(value);
      return { written: value.length };
    },
    plainText: "summarize",
    usage: false,
  });
  expect(result).toBe("response");
  expect(writes).toEqual(["response"]);
});
