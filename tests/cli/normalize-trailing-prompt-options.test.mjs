import { normalizeTrailingPromptOptions } from "../../src/cli/normalize-trailing-prompt-options.mjs";

test("normalizes separated model and effort options", () => {
  expect(normalizeTrailingPromptOptions(["--effort", "low", "--model=gpt-6-luna"])).toEqual([
    "--effort=low",
    "--model=gpt-6-luna",
  ]);
});

test("rejects missing values and tokens outside the trailing grammar", () => {
  expect(() => normalizeTrailingPromptOptions(["--effort"])).toThrow(/Only --effort/);
  expect(() => normalizeTrailingPromptOptions(["prompt text"])).toThrow(/Only --effort/);
});
