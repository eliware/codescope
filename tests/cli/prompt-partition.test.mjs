import { partitionPromptArgs } from "../../src/cli/prompt-partition.mjs";

test("partitions recognized options from free-form prompt text", () => {
  expect(partitionPromptArgs(["summarize", "--not-an-option", "--effort=low"])).toEqual({
    promptArgs: ["summarize", "--not-an-option"],
    optionArgs: ["--effort=low"],
  });
});

test("preserves all prompt tokens before a delimiter", () => {
  expect(partitionPromptArgs(["--summarize", "this", "--", "--effort=low"])).toEqual({
    promptArgs: ["--summarize", "this"],
    optionArgs: ["--effort=low"],
  });
});
