import { parseDirectCommandArgs } from "../../../src/cli/args/direct-command.mjs";

test("parses direct profiles and metadata commands", () => {
  expect(parseDirectCommandArgs("all", ["--dry-run"])).toMatchObject({
    command: "analyze-all",
    dryRun: true,
  });
  expect(parseDirectCommandArgs("all", ["--debug-request"])).toMatchObject({
    command: "analyze-all",
    debugRequest: true,
  });
  expect(parseDirectCommandArgs("--help", [])).toMatchObject({ command: "help" });
});

test("rejects unknown options", () => {
  expect(() => parseDirectCommandArgs("--unknown", [])).toThrow(/Unknown option/);
});

test.each(["help", "version"])("rejects --usage for %s metadata commands", (command) => {
  expect(() => parseDirectCommandArgs(command, ["--usage"])).toThrow(/--usage/);
});

test.each(["help", "version"])("rejects --dry-run for %s metadata commands", (command) => {
  expect(() => parseDirectCommandArgs(command, ["--dry-run"])).toThrow(/--dry-run/);
});
