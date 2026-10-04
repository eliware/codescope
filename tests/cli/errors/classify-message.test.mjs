import { classifyErrorMessage } from "../../../src/cli/errors/classify-message.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("prioritizes timeouts over other classifications and leaves unknown text unclassified", () => {
  expect(classifyErrorMessage(new Error("Usage failed after timed out request"))).toBe(
    EXIT_CODES.TIMEOUT,
  );
  expect(classifyErrorMessage(new Error("unclassified"))).toBeUndefined();
});

test("does not classify unrelated provider diagnostics as response failures", () => {
  expect(classifyErrorMessage(new Error("OpenAI request failed while inspecting a verdict"))).toBe(
    EXIT_CODES.API,
  );
  expect(classifyErrorMessage(new Error("provider diagnostic includes a category array"))).toBe(
    undefined,
  );
});
