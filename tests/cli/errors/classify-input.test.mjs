import { classifyInputMessage } from "../../../src/cli/errors/classify-input.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies repository input failures", () => {
  expect(classifyInputMessage("Unable to read source file")).toBe(EXIT_CODES.INPUT);
  expect(classifyInputMessage("provider failed")).toBeUndefined();
});
