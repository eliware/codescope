import { classifyErrorMessage } from "../../../src/cli/errors/classify-message.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies usage, configuration, input, response, and provider messages", () => {
  expect(classifyErrorMessage(new Error("Unknown option"))).toBe(EXIT_CODES.USAGE);
  expect(classifyErrorMessage(new Error("OPENAI_API_TOKEN missing"))).toBe(
    EXIT_CODES.CONFIGURATION,
  );
  expect(classifyErrorMessage(new Error("Unable to read source file"))).toBe(EXIT_CODES.INPUT);
  expect(classifyErrorMessage(new Error("Invalid review response"))).toBe(EXIT_CODES.RESPONSE);
  expect(classifyErrorMessage(new Error("initialize OpenAI failed"))).toBe(EXIT_CODES.API);
});

test("prioritizes timed-out messages and leaves unmatched text unclassified", () => {
  expect(classifyErrorMessage(new Error("Usage failed after timed out request"))).toBe(
    EXIT_CODES.TEST_TIMEOUT,
  );
  expect(classifyErrorMessage(new Error("unclassified"))).toBeUndefined();
});
