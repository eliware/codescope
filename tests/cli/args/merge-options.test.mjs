import { mergeCommandOptions } from "../../../src/cli/args/merge-options.mjs";

const values = (overrides = {}) => ({
  effort: undefined,
  model: undefined,
  dryRun: false,
  usageCount: 0,
  usage: undefined,
  add: [],
  ...overrides,
});

test("merges leading options before command options and preserves additions", () => {
  expect(
    mergeCommandOptions(
      { command: "review", add: ["tail"] },
      values({ effort: "medium", usageCount: 1, add: ["head"] }),
    ),
  ).toMatchObject({ command: "review", effort: "medium", usage: true, add: ["head", "tail"] });
});

test("rejects duplicate options and prompt dry-run combinations", () => {
  const cases = [
    [{ effort: "high" }, { effort: "low" }, /effort/],
    [{ model: "gpt-6-luna" }, { model: "gpt-6-sol" }, /model/],
    [{ dryRun: true }, { dryRun: true }, /dry-run/],
    [{ usage: true }, { usageCount: 1 }, /usage/],
    [{ command: "prompt" }, { dryRun: true }, /Usage: codescope prompt/],
  ];

  for (const [parsed, leading, message] of cases)
    expect(() => mergeCommandOptions(parsed, values(leading))).toThrow(message);
});
