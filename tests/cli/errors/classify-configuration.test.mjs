import { classifyConfigurationMessage } from "../../../src/cli/errors/classify-configuration.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("classifies local credential configuration errors", () => {
  expect(classifyConfigurationMessage("OPENAI_API_TOKEN missing")).toBe(EXIT_CODES.CONFIGURATION);
  expect(classifyConfigurationMessage("API request failed")).toBeUndefined();
});
