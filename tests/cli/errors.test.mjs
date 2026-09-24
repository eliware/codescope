import { errorExitCode } from "../../src/cli/errors.mjs";
import { EXIT_CODES } from "../../src/cli/errors/exit-codes.mjs";

test("prefers typed errors over message classification and defaults unknown errors to input", () => {
  expect(errorExitCode(Object.assign(new Error("Unknown option"), { code: "API" }))).toBe(
    EXIT_CODES.API,
  );
  expect(errorExitCode(new Error("unclassified"))).toBe(EXIT_CODES.INPUT);
});
