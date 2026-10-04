import { parseDirectCommandArgs } from "../../../src/cli/args/direct-command.mjs";

test("parses direct profiles and metadata commands", () => {
  expect(parseDirectCommandArgs("all", ["--dry-run"])).toMatchObject({
    command: "analyze-all",
    dryRun: true,
  });
  expect(parseDirectCommandArgs("--help", [])).toMatchObject({ command: "help" });
  expect(parseDirectCommandArgs("help", ["--dry-run"])).toMatchObject({
    command: "help",
    dryRun: true,
  });
});

test("rejects unknown options", () => {
  expect(() => parseDirectCommandArgs("--unknown", [])).toThrow(/Unknown option/);
});

test.each(["help", "version"])("rejects --usage for %s metadata commands", (command) => {
  expect(() => parseDirectCommandArgs(command, ["--usage"])).toThrow(/--usage/);
});
