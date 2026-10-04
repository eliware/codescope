import { parseArgs } from "../../../src/cli/args/parse-args.mjs";

test("merges leading and command options while preserving addition order", () => {
  expect(parseArgs(["--usage", "--add", "first", "all", "--add", "last"])).toMatchObject({
    command: "analyze-all",
    usage: true,
    add: ["first", "last"],
  });
});

test("accepts shared options before or after the command", () => {
  expect(parseArgs(["all"])).toMatchObject({ command: "analyze-all" });
  expect(parseArgs(["all", "--add", "first", "--effort=medium", "-a", "second"])).toMatchObject({
    effort: "medium",
    add: ["first", "second"],
  });
  expect(parseArgs(["--usage", "all", "--add=note"])).toMatchObject({
    command: "analyze-all",
    usage: true,
    add: ["note"],
  });
  expect(parseArgs(["--usage", "all", "--add", "note"])).toMatchObject({
    command: "analyze-all",
    usage: true,
    add: ["note"],
  });
  expect(parseArgs(["--effort=low", "all"])).toMatchObject({ effort: "low" });
  expect(parseArgs(["--effort=low", "all", "--dry-run"])).toMatchObject({ dryRun: true });
});

test("parses a command with options on both sides of its name", () => {
  expect(parseArgs(["--effort=low", "all", "--dry-run"])).toMatchObject({
    command: "analyze-all",
    effort: "low",
    dryRun: true,
  });
});

test("accepts additions before bare help without applying them", () => {
  expect(parseArgs(["--add", "note"])).toMatchObject({
    command: "help",
    add: ["note"],
  });
});

test("preserves addition order around a custom prompt command", () => {
  expect(parseArgs(["--add", "before", "prompt", "Explain risks", "--add", "after"])).toMatchObject(
    { command: "prompt", add: ["before", "after"] },
  );
});
