import { classifyResponseMessage } from "../../../src/cli/errors/classify-response.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies response-contract failures", () => {
  expect(classifyResponseMessage("Invalid review response")).toBe(EXIT_CODES.RESPONSE);
  expect(classifyResponseMessage("provider failed")).toBeUndefined();
});
