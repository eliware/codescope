import { runReviewCommand } from "../../src/cli/review-command.mjs";

test("routes prompt commands to the custom-prompt handler with public arguments", async () => {
  let received;
  await expect(
    runReviewCommand("prompt", {
      cwd: "repo",
      write: () => {},
      review: async (_cwd, options) => {
        received = options;
        return { raw_response: "text" };
      },
      promptText: "summarize",
      model: "gpt-6-luna",
      effort: "low",
      add: ["focus on changed files"],
    }),
  ).resolves.toBe(0);
  expect(received).toMatchObject({
    plainText: "summarize",
    model: "gpt-6-luna",
    add: ["focus on changed files"],
  });
  expect(received.prompt.reasoning.effort).toBe("low");
});

test("routes profile commands to the profile handler", async () => {
  let received;
  await expect(
    runReviewCommand("analyze-all", {
      cwd: "repo",
      write: () => {},
      review: async (_cwd, options) => {
        received = options;
      },
      add: ["focus on implementation"],
    }),
  ).resolves.toBe(0);
  expect(received).toMatchObject({ add: ["focus on implementation"], dryRun: undefined });
  expect(received.prompt).toBeDefined();
});
