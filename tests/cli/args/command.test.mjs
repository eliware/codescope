import { parseCommandArgs } from "../../../src/cli/args/command.mjs";

test("dispatches prompt and grouped command families", () => {
  expect(parseCommandArgs(["prompt", "summarize", "code"]).command).toBe("prompt");
  expect(parseCommandArgs(["review", "all"]).mode).toBe("review");
  expect(parseCommandArgs(["suggest", "security"]).mode).toBe("suggest");
  expect(parseCommandArgs([]).command).toBe("help");
});
