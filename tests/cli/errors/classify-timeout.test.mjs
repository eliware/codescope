import { classifyTimeoutMessage } from "../../../src/cli/errors/classify-timeout.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies timeout messages", () => {
  expect(classifyTimeoutMessage("request timed out")).toBe(EXIT_CODES.TEST_TIMEOUT);
  expect(classifyTimeoutMessage("request failed")).toBeUndefined();
});
