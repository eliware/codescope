import { classifyErrorCode } from "../../../src/cli/errors/classify-code.mjs";
import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("maps typed provider and response failures", () => {
  expect(classifyErrorCode({ code: "API" })).toBe(EXIT_CODES.API);
  expect(classifyErrorCode({ code: "INVALID_RESPONSE" })).toBe(EXIT_CODES.RESPONSE);
  expect(classifyErrorCode({ code: "ETIMEDOUT" })).toBe(EXIT_CODES.TIMEOUT);
  expect(classifyErrorCode({ code: "ECONNABORTED" })).toBe(EXIT_CODES.TIMEOUT);
  expect(classifyErrorCode({ cause: { code: "UND_ERR_CONNECT_TIMEOUT" } })).toBe(
    EXIT_CODES.TIMEOUT,
  );
});

test("prioritizes nested termination signals and ignores unknown codes", () => {
  expect(classifyErrorCode({ cause: { code: "SIGINT" } })).toBe(EXIT_CODES.SIGINT);
  expect(classifyErrorCode({ code: "API", cause: { code: "SIGTERM" } })).toBe(EXIT_CODES.SIGTERM);
  expect(classifyErrorCode({ code: "OTHER" })).toBeUndefined();
});
