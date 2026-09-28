import { classifyUsageMessage } from "../../../src/cli/errors/classify-usage.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies CLI grammar errors", () => {
  expect(classifyUsageMessage("Unknown option --bad")).toBe(EXIT_CODES.USAGE);
  expect(classifyUsageMessage("provider failed")).toBeUndefined();
});
