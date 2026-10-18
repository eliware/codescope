import { runReviewPipeline } from "../../../src/review/run/review-pipeline.mjs";
import { createEnvironmentReader } from "../../../test-fixtures/environment-file-handle.mjs";

const base = {
  readFile: async () => "OPENAI_API_TOKEN=token",
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  openEnvFile: async () => ({
    read: createEnvironmentReader("OPENAI_API_TOKEN=token"),
    close: async () => {},
  }),
  platform: "linux",
  maxSourceChars: 10,
};
const prompt = {
  input: [{ role: "developer", content: [{ type: "input_text", text: "<combine-mjs here>" }] }],
  tools: [],
};

test("propagates prepared evidence through request execution and output", async () => {
  let combineOptions;
  const result = await runReviewPipeline("repo", {
    ...base,
    combine: async (_cwd, options) => {
      combineOptions = options;
      return "source";
    },
    createClient: () => ({ responses: { create: async () => ({ output_text: "result" }) } }),
    prompt,
    write: async (value) => ({ written: value.length }),
    register: () => ({ removeHandlers() {} }),
  });
  expect(result).toBe("result");
  expect(combineOptions.platform).toBe("linux");
});

test("sends supplied custom task text with repository context and web search", async () => {
  let sentRequest;
  await runReviewPipeline("repo", {
    ...base,
    plainText: "Summarize this repository.",
    combine: async () => "repository source",
    createClient: () => ({
      responses: {
        create: async (request) => {
          sentRequest = request;
          return { output_text: "summary" };
        },
      },
    }),
    prompt,
    write: async (value) => ({ written: value.length }),
    register: () => ({ removeHandlers() {} }),
  });
  expect(sentRequest.tools).toEqual([
    { type: "web_search", user_location: { type: "approximate" }, search_context_size: "medium" },
  ]);
  expect(sentRequest.input).toHaveLength(1);
  expect(sentRequest.input[0].content[0].text).toContain("repository source");
  expect(sentRequest.input[0].content[0].text.endsWith("\n\nSummarize this repository.")).toBe(
    true,
  );
});

test("reports setup failure without writing a result", async () => {
  let wrote = false;
  await expect(
    runReviewPipeline("repo", {
      ...base,
      combine: async () => {
        throw new Error("evidence failed");
      },
      createClient: () => ({}),
      write: () => {
        wrote = true;
      },
    }),
  ).rejects.toThrow("CodeScope setup failed: evidence failed");
  expect(wrote).toBe(false);
});

test("routes request construction failures through the phase boundary", async () => {
  await expect(
    runReviewPipeline("repo", {
      ...base,
      combine: async () => "source",
      createClient: () => ({}),
      prompt: {
        input: [{ role: "developer", content: [{ type: "input_text", text: "invalid" }] }],
        tools: [],
      },
      write: async (value) => ({ written: value.length }),
    }),
  ).rejects.toThrow(/developer text/);
});

test("routes provider execution failures through the phase boundary", async () => {
  await expect(
    runReviewPipeline("repo", {
      ...base,
      combine: async () => "source",
      createClient: () => ({
        responses: {
          create: async () => {
            throw new Error("provider failed");
          },
        },
      }),
      prompt,
      register: () => ({ removeHandlers() {} }),
      write: async (value) => ({ written: value.length }),
    }),
  ).rejects.toThrow(/provider failed/);
});
