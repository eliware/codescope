import { parseDirectCommandArgs } from "../../../src/cli/args/direct-command.mjs";

test("parses direct profiles and metadata commands", () => {
  expect(parseDirectCommandArgs("all", ["--dry-run"])).toMatchObject({
    command: "analyze-all",
    dryRun: true,
  });
  expect(parseDirectCommandArgs("--help", [])).toMatchObject({ command: "help" });
  expect(parseDirectCommandArgs("help", ["--dry-run", "--usage"])).toMatchObject({
    command: "help",
    dryRun: true,
    usage: true,
  });
});

test("rejects unknown options", () => {
  expect(() => parseDirectCommandArgs("--unknown", [])).toThrow(/Unknown option/);
});
