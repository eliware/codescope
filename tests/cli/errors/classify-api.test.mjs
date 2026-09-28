import { classifyApiMessage } from "../../../src/cli/errors/classify-api.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies provider API failures", () => {
  expect(classifyApiMessage("initialize OpenAI failed")).toBe(EXIT_CODES.API);
  expect(classifyApiMessage("Unknown option")).toBeUndefined();
});
